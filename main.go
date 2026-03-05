package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"lyra/internal/fileexplorer"
	"lyra/internal/network"
	"lyra/internal/sysmon"
	"lyra/internal/terminal"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	sysmonSvc := sysmon.NewSysMonService()
	terminalSvc := terminal.NewTerminalService()
	networkSvc := network.NewNetworkService()
	fileExplorerSvc := fileexplorer.NewFileExplorerService()

	// Store services on app for lifecycle management
	app.sysmon = sysmonSvc
	app.terminal = terminalSvc
	app.network = networkSvc

	err := wails.Run(&options.App{
		Title:     "Lyra",
		Width:     1600,
		Height:    900,
		MinWidth:  1200,
		MinHeight: 700,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 10, G: 10, B: 15, A: 255},
		Frameless:        true,
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
			sysmonSvc,
			terminalSvc,
			networkSvc,
			fileExplorerSvc,
		},
		Windows: &windows.Options{
			WebviewIsTransparent:              false,
			WindowIsTranslucent:               false,
			DisableWindowIcon:                 false,
			DisableFramelessWindowDecorations: false,
			WebviewUserDataPath:               "",
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
