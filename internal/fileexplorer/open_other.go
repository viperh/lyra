//go:build !windows

package fileexplorer

import (
	"os/exec"
	"runtime"
)

func openWithDefault(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", path)
	default:
		cmd = exec.Command("xdg-open", path)
	}
	return cmd.Start()
}
