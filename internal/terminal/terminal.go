package terminal

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"sync"

	"github.com/UserExistsError/conpty"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type Session struct {
	id   string
	cpty *conpty.ConPty
	done chan struct{}
}

type TerminalService struct {
	ctx      context.Context
	sessions map[string]*Session
	mu       sync.Mutex
}

func NewTerminalService() *TerminalService {
	return &TerminalService{
		sessions: make(map[string]*Session),
	}
}

func (t *TerminalService) Startup(ctx context.Context) {
	t.ctx = ctx
}

func (t *TerminalService) Shutdown() {
	t.mu.Lock()
	defer t.mu.Unlock()

	for id, session := range t.sessions {
		close(session.done)
		session.cpty.Close()
		delete(t.sessions, id)
	}
}

func (t *TerminalService) CreateSession(id string, cols int, rows int) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if _, exists := t.sessions[id]; exists {
		return fmt.Errorf("session %s already exists", id)
	}

	// Determine shell
	shell := os.Getenv("COMSPEC")
	if shell == "" {
		shell = "powershell.exe"
	}
	// Prefer PowerShell if available
	if _, err := os.Stat(`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`); err == nil {
		shell = "powershell.exe"
	}

	cpty, err := conpty.Start(shell, conpty.ConPtyDimensions(cols, rows))
	if err != nil {
		return fmt.Errorf("failed to create ConPTY: %w", err)
	}

	session := &Session{
		id:   id,
		cpty: cpty,
		done: make(chan struct{}),
	}

	t.sessions[id] = session

	// Start read loop
	go t.readLoop(session)

	return nil
}

func (t *TerminalService) readLoop(session *Session) {
	buf := make([]byte, 4096)
	for {
		select {
		case <-session.done:
			return
		default:
			n, err := session.cpty.Read(buf)
			if err != nil {
				wailsRuntime.EventsEmit(t.ctx, "terminal:closed:"+session.id)
				return
			}
			if n > 0 {
				encoded := base64.StdEncoding.EncodeToString(buf[:n])
				wailsRuntime.EventsEmit(t.ctx, "terminal:output:"+session.id, encoded)
			}
		}
	}
}

func (t *TerminalService) WriteToSession(id string, data string) error {
	t.mu.Lock()
	session, exists := t.sessions[id]
	t.mu.Unlock()

	if !exists {
		return fmt.Errorf("session %s not found", id)
	}

	_, err := session.cpty.Write([]byte(data))
	return err
}

func (t *TerminalService) ResizeSession(id string, cols int, rows int) error {
	t.mu.Lock()
	session, exists := t.sessions[id]
	t.mu.Unlock()

	if !exists {
		return fmt.Errorf("session %s not found", id)
	}

	return session.cpty.Resize(cols, rows)
}

func (t *TerminalService) CloseSession(id string) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	session, exists := t.sessions[id]
	if !exists {
		return nil
	}

	close(session.done)
	session.cpty.Close()
	delete(t.sessions, id)
	return nil
}
