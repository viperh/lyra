package main

import (
	"context"

	"lyra/internal/network"
	"lyra/internal/sysmon"
	"lyra/internal/terminal"
)

type App struct {
	ctx      context.Context
	sysmon   *sysmon.SysMonService
	terminal *terminal.TerminalService
	network  *network.NetworkService
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize services with context
	if a.sysmon != nil {
		a.sysmon.Startup(ctx)
	}
	if a.terminal != nil {
		a.terminal.Startup(ctx)
	}
	if a.network != nil {
		a.network.Startup(ctx)
	}
}

func (a *App) domReady(ctx context.Context) {
	// Services are ready, frontend will call StartMonitoring
}

func (a *App) shutdown(ctx context.Context) {
	if a.sysmon != nil {
		a.sysmon.Shutdown()
	}
	if a.terminal != nil {
		a.terminal.Shutdown()
	}
	if a.network != nil {
		a.network.Shutdown()
	}
}
