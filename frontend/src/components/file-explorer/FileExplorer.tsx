import { useState, useEffect, useCallback } from 'react'
import { FolderOpen, Home, HardDrive, ChevronUp } from 'lucide-react'
import { FileList } from './FileList'
import { PathBreadcrumb } from './PathBreadcrumb'
import {
  ListDirectory,
  GetHomeDir,
  GetDrives,
} from '../../../wailsjs/go/fileexplorer/FileExplorerService'

export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  size: number
  modTime: string
  mode: string
}

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('')
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [drives, setDrives] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigateTo = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)
    try {
      const files = await ListDirectory(path)
      setEntries(files || [])
      setCurrentPath(path)
    } catch (err: any) {
      setError(err?.message || 'Failed to read directory')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  const goUp = useCallback(() => {
    const parts = currentPath.replace(/\\/g, '/').split('/')
    if (parts.length > 1) {
      parts.pop()
      let parent = parts.join('/')
      if (parent.length === 2 && parent[1] === ':') parent += '/'
      navigateTo(parent)
    }
  }, [currentPath, navigateTo])

  const goHome = useCallback(async () => {
    try {
      const home = await GetHomeDir()
      navigateTo(home)
    } catch (err) {
      console.error('Failed to get home dir:', err)
    }
  }, [navigateTo])

  useEffect(() => {
    GetHomeDir().then(home => navigateTo(home)).catch(console.error)
    GetDrives().then(d => setDrives(d || [])).catch(console.error)
  }, [navigateTo])

  return (
    <div className="lyra-panel flex flex-col h-full scan-line">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-lyra-border shrink-0">
        <FolderOpen className="w-3.5 h-3.5 text-lyra-accent" />
        <span className="text-[11px] text-lyra-accent font-semibold tracking-wider">
          FILE EXPLORER
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-lyra-border shrink-0">
        <button
          onClick={goUp}
          className="p-1 rounded hover:bg-lyra-border text-lyra-text-dim hover:text-lyra-text transition-colors"
          title="Go up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={goHome}
          className="p-1 rounded hover:bg-lyra-border text-lyra-text-dim hover:text-lyra-text transition-colors"
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
        {drives.map(drive => (
          <button
            key={drive}
            onClick={() => navigateTo(drive)}
            className="p-1 px-1.5 rounded hover:bg-lyra-border text-[10px] text-lyra-text-dim hover:text-lyra-accent transition-colors"
            title={drive}
          >
            <HardDrive className="w-3 h-3 inline mr-0.5" />
            {drive.replace(/[/\\]/g, '')}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <PathBreadcrumb path={currentPath} onNavigate={navigateTo} />

      {/* File list */}
      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-20 text-lyra-text-dim text-[11px]">
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-20 text-red-400 text-[11px]">
            {error}
          </div>
        ) : (
          <FileList entries={entries} onNavigate={navigateTo} />
        )}
      </div>
    </div>
  )
}
