package network

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	psnet "github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type ConnectionInfo struct {
	LocalAddr  string  `json:"localAddr"`
	LocalPort  uint32  `json:"localPort"`
	RemoteAddr string  `json:"remoteAddr"`
	RemotePort uint32  `json:"remotePort"`
	Status     string  `json:"status"`
	Pid        int32   `json:"pid"`
	Process    string  `json:"process"`
	Lat        float64 `json:"lat"`
	Lng        float64 `json:"lng"`
	Country    string  `json:"country"`
	City       string  `json:"city"`
}

type geoResult struct {
	Status  string  `json:"status"`
	Country string  `json:"country"`
	City    string  `json:"city"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
}

type NetworkService struct {
	ctx      context.Context
	stopChan chan struct{}
	mu       sync.Mutex
	running  bool
	geoCache map[string]*geoResult
	cacheMu  sync.RWMutex
	client   *http.Client
}

func NewNetworkService() *NetworkService {
	return &NetworkService{
		geoCache: make(map[string]*geoResult),
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (n *NetworkService) Startup(ctx context.Context) {
	n.ctx = ctx
}

func (n *NetworkService) Shutdown() {
	n.StopMonitoring()
}

func (n *NetworkService) GetConnections() ([]ConnectionInfo, error) {
	conns, err := psnet.Connections("inet")
	if err != nil {
		return nil, err
	}

	var results []ConnectionInfo
	seen := make(map[string]bool)

	for _, c := range conns {
		if c.Raddr.IP == "" || c.Raddr.IP == "0.0.0.0" || c.Raddr.IP == "::" || c.Raddr.IP == "::1" {
			continue
		}
		if isPrivateIP(c.Raddr.IP) {
			continue
		}

		key := fmt.Sprintf("%s:%d", c.Raddr.IP, c.Raddr.Port)
		if seen[key] {
			continue
		}
		seen[key] = true

		info := ConnectionInfo{
			LocalAddr:  c.Laddr.IP,
			LocalPort:  c.Laddr.Port,
			RemoteAddr: c.Raddr.IP,
			RemotePort: c.Raddr.Port,
			Status:     c.Status,
			Pid:        c.Pid,
		}

		// Get process name
		if c.Pid > 0 {
			if p, err := process.NewProcess(c.Pid); err == nil {
				if name, err := p.Name(); err == nil {
					info.Process = name
				}
			}
		}

		// GeoIP lookup
		geo := n.lookupGeo(c.Raddr.IP)
		if geo != nil {
			info.Lat = geo.Lat
			info.Lng = geo.Lon
			info.Country = geo.Country
			info.City = geo.City
		}

		results = append(results, info)
	}

	return results, nil
}

func (n *NetworkService) lookupGeo(ip string) *geoResult {
	n.cacheMu.RLock()
	if cached, ok := n.geoCache[ip]; ok {
		n.cacheMu.RUnlock()
		return cached
	}
	n.cacheMu.RUnlock()

	// Use ip-api.com (free, 45 req/min)
	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country,city,lat,lon", ip)
	resp, err := n.client.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	var result geoResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil
	}

	if result.Status != "success" {
		return nil
	}

	n.cacheMu.Lock()
	n.geoCache[ip] = &result
	n.cacheMu.Unlock()

	return &result
}

func (n *NetworkService) StartMonitoring(intervalMs int) error {
	n.mu.Lock()
	defer n.mu.Unlock()

	if n.running {
		return nil
	}

	if intervalMs < 2000 {
		intervalMs = 2000
	}

	n.stopChan = make(chan struct{})
	n.running = true

	go func() {
		ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				conns, err := n.GetConnections()
				if err == nil {
					wailsRuntime.EventsEmit(n.ctx, "network:connections", conns)
				}
			case <-n.stopChan:
				return
			}
		}
	}()

	return nil
}

func (n *NetworkService) StopMonitoring() {
	n.mu.Lock()
	defer n.mu.Unlock()

	if n.running && n.stopChan != nil {
		close(n.stopChan)
		n.running = false
	}
}

func isPrivateIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return true
	}
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}
	privateRanges := []struct {
		start net.IP
		end   net.IP
	}{
		{net.ParseIP("10.0.0.0"), net.ParseIP("10.255.255.255")},
		{net.ParseIP("172.16.0.0"), net.ParseIP("172.31.255.255")},
		{net.ParseIP("192.168.0.0"), net.ParseIP("192.168.255.255")},
	}
	ip4 := ip.To4()
	if ip4 == nil {
		return false
	}
	for _, r := range privateRanges {
		s := r.start.To4()
		e := r.end.To4()
		if bytesInRange(ip4, s, e) {
			return true
		}
	}
	return false
}

func bytesInRange(ip, start, end net.IP) bool {
	for i := 0; i < 4; i++ {
		if ip[i] < start[i] {
			return false
		}
		if ip[i] > end[i] {
			return false
		}
	}
	return true
}
