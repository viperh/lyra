package fileexplorer

import (
	"context"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type FileEntry struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	IsDir   bool   `json:"isDir"`
	Size    int64  `json:"size"`
	ModTime string `json:"modTime"`
	Mode    string `json:"mode"`
}

type FileExplorerService struct {
	ctx context.Context
}

func NewFileExplorerService() *FileExplorerService {
	return &FileExplorerService{}
}

func (f *FileExplorerService) Startup(ctx context.Context) {
	f.ctx = ctx
}

func (f *FileExplorerService) ListDirectory(path string) ([]FileEntry, error) {
	// Normalize path
	path = filepath.Clean(path)

	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var files []FileEntry
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		// Skip hidden files on Windows (those starting with .)
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		fullPath := filepath.Join(path, entry.Name())

		files = append(files, FileEntry{
			Name:    entry.Name(),
			Path:    fullPath,
			IsDir:   entry.IsDir(),
			Size:    info.Size(),
			ModTime: info.ModTime().Format("2006-01-02 15:04"),
			Mode:    info.Mode().String(),
		})
	}

	// Sort: directories first, then alphabetically
	sort.Slice(files, func(i, j int) bool {
		if files[i].IsDir != files[j].IsDir {
			return files[i].IsDir
		}
		return strings.ToLower(files[i].Name) < strings.ToLower(files[j].Name)
	})

	return files, nil
}

func (f *FileExplorerService) GetHomeDir() (string, error) {
	return os.UserHomeDir()
}

func (f *FileExplorerService) GetDrives() ([]string, error) {
	var drives []string
	for _, drive := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
		path := string(drive) + ":\\"
		_, err := os.Stat(path)
		if err == nil {
			drives = append(drives, path)
		}
	}
	if len(drives) == 0 {
		drives = append(drives, "/")
	}
	return drives, nil
}

func (f *FileExplorerService) OpenFile(path string) error {
	// Use the OS default handler
	return openWithDefault(path)
}

func (f *FileExplorerService) GetPathSeparator() string {
	return string(os.PathSeparator)
}
