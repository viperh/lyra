import { ChevronRight } from 'lucide-react'

interface PathBreadcrumbProps {
  path: string
  onNavigate: (path: string) => void
}

export function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps) {
  const normalizedPath = path.replace(/\\/g, '/')
  const parts = normalizedPath.split('/').filter(Boolean)

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-lyra-border text-[10px] overflow-x-auto shrink-0">
      {parts.map((part, i) => {
        const fullPath = parts.slice(0, i + 1).join('/')
        const isLast = i === parts.length - 1
        return (
          <div key={fullPath} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-lyra-text-dim" />}
            <button
              onClick={() => onNavigate(fullPath)}
              className={`px-1 py-0.5 rounded transition-colors ${
                isLast
                  ? 'text-lyra-accent'
                  : 'text-lyra-text-dim hover:text-lyra-text hover:bg-lyra-border/50'
              }`}
            >
              {part}
            </button>
          </div>
        )
      })}
    </div>
  )
}
