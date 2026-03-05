import { useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from 'react-simple-maps'
import { Globe, Wifi } from 'lucide-react'
import { useNetworkConnections, type ConnectionInfo } from '@/hooks/useNetworkConnections'
import { ConnectionList } from './ConnectionList'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Default location (center of map) - will be user's approximate location
const LOCAL_COORDS: [number, number] = [0, 20]

export function NetworkMap() {
  const connections = useNetworkConnections(5000)

  const geoConnections = useMemo(
    () => connections.filter((c) => c.lat !== 0 || c.lng !== 0),
    [connections]
  )

  const uniqueLocations = useMemo(() => {
    const seen = new Set<string>()
    return geoConnections.filter((c) => {
      const key = `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [geoConnections])

  return (
    <div className="lyra-panel flex flex-col h-full scan-line">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-lyra-border shrink-0">
        <Globe className="w-3.5 h-3.5 text-lyra-accent" />
        <span className="text-[11px] text-lyra-accent font-semibold tracking-wider">
          NETWORK CONNECTIONS
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <Wifi className="w-3 h-3 text-lyra-accent animate-pulse-glow" />
          <span className="text-[10px] text-lyra-text-dim">
            {connections.length} active
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              center: [0, 20],
            }}
            width={800}
            height={400}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0d1117"
                    stroke="#1a2332"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#141d29' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Connection lines */}
            {geoConnections.map((conn, i) => (
              <Line
                key={`line-${i}`}
                from={LOCAL_COORDS}
                to={[conn.lng, conn.lat]}
                stroke="#00ff9f"
                strokeWidth={0.5}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
            ))}

            {/* Remote markers */}
            {uniqueLocations.map((conn, i) => (
              <Marker key={`marker-${i}`} coordinates={[conn.lng, conn.lat]}>
                <circle r={2} fill="#00ff9f" opacity={0.8} />
                <circle
                  r={4}
                  fill="none"
                  stroke="#00ff9f"
                  strokeWidth={0.5}
                  opacity={0.4}
                  className="pulse-marker"
                />
              </Marker>
            ))}

            {/* Local marker */}
            <Marker coordinates={LOCAL_COORDS}>
              <circle r={3} fill="#00b8ff" />
              <circle
                r={6}
                fill="none"
                stroke="#00b8ff"
                strokeWidth={1}
                opacity={0.5}
                className="pulse-marker"
              />
            </Marker>
          </ComposableMap>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#00ff9f 1px, transparent 1px), linear-gradient(90deg, #00ff9f 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Connection list sidebar */}
        <div className="w-[240px] border-l border-lyra-border overflow-auto shrink-0">
          <ConnectionList connections={connections} />
        </div>
      </div>
    </div>
  )
}
