import {
  Folder,
  File,
  FileText,
  FileCode,
  Image,
  Music,
  Film,
  Archive,
  FileJson,
  Settings,
} from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import type { FileEntry } from './FileExplorer'

interface FileListProps {
  entries: FileEntry[]
  onNavigate: (path: string) => void
}

function getFileIcon(entry: FileEntry) {
  if (entry.isDir) return <Folder className="w-3.5 h-3.5 text-lyra-accent" />

  const ext = entry.name.split('.').pop()?.toLowerCase() || ''
  const iconClass = "w-3.5 h-3.5 text-lyra-text-dim"

  if (['ts', 'tsx', 'js', 'jsx', 'go', 'py', 'rs', 'c', 'cpp', 'h', 'java', 'rb', 'php'].includes(ext))
    return <FileCode className={`${iconClass} text-lyra-accent2`} />
  if (['json', 'yaml', 'yml', 'toml', 'xml'].includes(ext))
    return <FileJson className={`${iconClass} text-yellow-500`} />
  if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(ext))
    return <FileText className={iconClass} />
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext))
    return <Image className={`${iconClass} text-purple-400`} />
  if (['mp3', 'wav', 'flac', 'ogg', 'aac'].includes(ext))
    return <Music className={`${iconClass} text-pink-400`} />
  if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext))
    return <Film className={`${iconClass} text-blue-400`} />
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext))
    return <Archive className={`${iconClass} text-orange-400`} />
  if (['ini', 'cfg', 'conf', 'env'].includes(ext))
    return <Settings className={iconClass} />

  return <File className={iconClass} />
}

export function FileList({ entries, onNavigate }: FileListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-lyra-text-dim text-[11px]">
        Empty directory
      </div>
    )
  }

  return (
    <div className="divide-y divide-lyra-border/30">
      {entries.map((entry) => (
        <div
          key={entry.path}
          onClick={() => entry.isDir && onNavigate(entry.path)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors ${
            entry.isDir
              ? 'cursor-pointer hover:bg-lyra-accent/5 text-lyra-text'
              : 'text-lyra-text-dim'
          }`}
        >
          {getFileIcon(entry)}
          <span className="flex-1 truncate">{entry.name}</span>
          {!entry.isDir && (
            <span className="text-[10px] text-lyra-text-dim shrink-0">
              {formatBytes(entry.size)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
