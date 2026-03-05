import { useState, useEffect } from 'react'
import { Minimize2, Maximize2, X, Terminal, Cpu } from 'lucide-react'
import { WindowMinimise, WindowToggleMaximise, Quit } from '../../../wailsjs/runtime/runtime'

interface TopBarProps {
  hostname: string
  os: string
  uptime: string
}

export function TopBar({ hostname, os, uptime }: TopBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="lyra-panel flex items-center justify-between px-4 h-full wails-drag">
      {/* Left section - Logo & System info */}
      <div className="flex items-center gap-4 no-drag">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-lyra-accent" />
          <span className="text-lyra-accent font-bold text-sm glow-text tracking-wider">
            LYRA
          </span>
        </div>
        <div className="w-px h-5 bg-lyra-border" />
        <div className="flex items-center gap-3 text-[11px] text-lyra-text-dim">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            {hostname}
          </span>
          <span>{os}</span>
          <span>UP {uptime}</span>
        </div>
      </div>

      {/* Center - Clock */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-lyra-accent glow-text font-semibold tracking-widest">
          {timeStr}
        </span>
        <span className="text-lyra-text-dim">{dateStr}</span>
      </div>

      {/* Right section - Window controls */}
      <div className="flex items-center gap-1 no-drag" style={{ '--wails-draggable': 'no-drag' } as any}>
        <button
          onClick={() => WindowMinimise()}
          className="p-1.5 rounded hover:bg-lyra-border transition-colors text-lyra-text-dim hover:text-lyra-text"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => WindowToggleMaximise()}
          className="p-1.5 rounded hover:bg-lyra-border transition-colors text-lyra-text-dim hover:text-lyra-text"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => Quit()}
          className="p-1.5 rounded hover:bg-red-900/50 transition-colors text-lyra-text-dim hover:text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
