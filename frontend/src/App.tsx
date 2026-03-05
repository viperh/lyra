import { TopBar } from './components/layout/TopBar'
import { TerminalPanel } from './components/terminal/TerminalPanel'
import { FileExplorer } from './components/file-explorer/FileExplorer'
import { StatsPanel } from './components/stats/StatsPanel'
import { NetworkMap } from './components/network/NetworkMap'
import { useSystemStats } from './hooks/useSystemStats'
import { formatUptime } from './lib/utils'

function App() {
  const stats = useSystemStats(2000)

  return (
    <div
      className="w-screen h-screen p-1 gap-1"
      style={{
        display: 'grid',
        gridTemplateRows: '44px 1fr 260px',
        gridTemplateColumns: '280px 1fr 300px',
        gridTemplateAreas: `
          "topbar topbar topbar"
          "files terminal stats"
          "map map map"
        `,
        background: '#0a0a0f',
      }}
    >
      {/* Top Bar */}
      <div style={{ gridArea: 'topbar' }}>
        <TopBar
          hostname={stats?.hostname || '...'}
          os={stats?.os || '...'}
          uptime={stats ? formatUptime(stats.uptime) : '...'}
        />
      </div>

      {/* File Explorer - Left */}
      <div style={{ gridArea: 'files' }} className="min-h-0">
        <FileExplorer />
      </div>

      {/* Terminal - Center */}
      <div style={{ gridArea: 'terminal' }} className="min-h-0">
        <TerminalPanel />
      </div>

      {/* System Stats - Right */}
      <div style={{ gridArea: 'stats' }} className="min-h-0">
        <StatsPanel />
      </div>

      {/* Network Map - Bottom */}
      <div style={{ gridArea: 'map' }} className="min-h-0">
        <NetworkMap />
      </div>
    </div>
  )
}

export default App
