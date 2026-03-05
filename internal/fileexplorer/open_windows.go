//go:build windows

package fileexplorer

import (
	"os/exec"
	"syscall"
)

func openWithDefault(path string) error {
	cmd := exec.Command("cmd", "/c", "start", "", path)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Start()
}
