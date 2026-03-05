import type { ConnectionInfo } from '@/hooks/useNetworkConnections'

interface ConnectionListProps {
  connections: ConnectionInfo[]
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'ESTABLISHED': return 'text-lyra-accent'
    case 'LISTEN': return 'text-lyra-accent2'
    case 'TIME_WAIT': return 'text-yellow-500'
    case 'CLOSE_WAIT': return 'text-orange-400'
    default: return 'text-lyra-text-dim'
  }
}

function getPortLabel(port: number): string {
  switch (port) {
    case 22: return 'SSH'
    case 80: return 'HTTP'
    case 443: return 'HTTPS'
    case 3306: return 'MySQL'
    case 5432: return 'PgSQL'
    case 6379: return 'Redis'
    case 8080: return 'HTTP-Alt'
    default: return String(port)
  }
}

export function ConnectionList({ connections }: ConnectionListProps) {
  if (connections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-lyra-text-dim text-[10px]">
        No active connections
      </div>
    )
  }

  return (
    <div className="divide-y divide-lyra-border/30">
      {connections.slice(0, 50).map((conn, i) => (
        <div key={i} className="px-2 py-1.5 hover:bg-lyra-accent/5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-lyra-text truncate">
              {conn.remoteAddr}
            </span>
            <span className={`text-[9px] ${getStatusColor(conn.status)}`}>
              {conn.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[9px] text-lyra-text-dim">
              :{conn.remotePort} ({getPortLabel(conn.remotePort)})
            </span>
            {conn.country && (
              <span className="text-[9px] text-lyra-text-dim">
                {conn.city ? `${conn.city}, ` : ''}{conn.country}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
