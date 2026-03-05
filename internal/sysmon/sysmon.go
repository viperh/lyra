package sysmon

import (
	"context"
	"runtime"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type DiskInfo struct {
	Mountpoint  string  `json:"mountpoint"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"usedPercent"`
	Fstype      string  `json:"fstype"`
}

type SystemStats struct {
	CPUPercent []float64  `json:"cpuPercent"`
	CPUOverall float64    `json:"cpuOverall"`
	MemTotal   uint64     `json:"memTotal"`
	MemUsed    uint64     `json:"memUsed"`
	MemPercent float64    `json:"memPercent"`
	Disks      []DiskInfo `json:"disks"`
	Hostname   string     `json:"hostname"`
	OS         string     `json:"os"`
	Uptime     uint64     `json:"uptime"`
}

type SysMonService struct {
	ctx      context.Context
	stopChan chan struct{}
	mu       sync.Mutex
	running  bool
}

func NewSysMonService() *SysMonService {
	return &SysMonService{}
}

func (s *SysMonService) Startup(ctx context.Context) {
	s.ctx = ctx
}

func (s *SysMonService) Shutdown() {
	s.StopMonitoring()
}

func (s *SysMonService) GetStats() (*SystemStats, error) {
	stats := &SystemStats{}

	// CPU usage
	perCPU, err := cpu.Percent(time.Second, true)
	if err == nil {
		stats.CPUPercent = perCPU
	}
	overall, err := cpu.Percent(0, false)
	if err == nil && len(overall) > 0 {
		stats.CPUOverall = overall[0]
	}

	// Memory
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		stats.MemTotal = memInfo.Total
		stats.MemUsed = memInfo.Used
		stats.MemPercent = memInfo.UsedPercent
	}

	// Disks
	partitions, err := disk.Partitions(false)
	if err == nil {
		for _, p := range partitions {
			usage, err := disk.Usage(p.Mountpoint)
			if err != nil {
				continue
			}
			if usage.Total == 0 {
				continue
			}
			stats.Disks = append(stats.Disks, DiskInfo{
				Mountpoint:  p.Mountpoint,
				Total:       usage.Total,
				Used:        usage.Used,
				UsedPercent: usage.UsedPercent,
				Fstype:      p.Fstype,
			})
		}
	}

	// Host info
	hostInfo, err := host.Info()
	if err == nil {
		stats.Hostname = hostInfo.Hostname
		stats.OS = hostInfo.Platform + " " + hostInfo.PlatformVersion
		stats.Uptime = hostInfo.Uptime
	} else {
		stats.OS = runtime.GOOS
	}

	return stats, nil
}

func (s *SysMonService) StartMonitoring(intervalMs int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running {
		return nil
	}

	if intervalMs < 500 {
		intervalMs = 500
	}

	s.stopChan = make(chan struct{})
	s.running = true

	go func() {
		ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				stats, err := s.GetStats()
				if err == nil {
					wailsRuntime.EventsEmit(s.ctx, "sysmon:stats", stats)
				}
			case <-s.stopChan:
				return
			}
		}
	}()

	return nil
}

func (s *SysMonService) StopMonitoring() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running && s.stopChan != nil {
		close(s.stopChan)
		s.running = false
	}
}
