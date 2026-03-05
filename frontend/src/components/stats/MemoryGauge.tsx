import { formatBytes } from '@/lib/utils'

interface MemoryGaugeProps {
  total: number
  used: number
  percent: number
}

export function MemoryGauge({ total, used, percent }: MemoryGaugeProps) {
  const radius = 40
  const strokeWidth = 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  const getColor = () => {
    if (percent > 90) return '#ef4444'
    if (percent > 70) return '#eab308'
    return '#00b8ff'
  }

  return (
    <div className="flex items-center gap-3 px-1">
      {/* Arc gauge */}
      <div className="relative shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#1a2332"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out',
              filter: `drop-shadow(0 0 4px ${getColor()}80)`,
            }}
          />
          {/* Center text */}
          <text
            x="48"
            y="45"
            textAnchor="middle"
            className="fill-lyra-text text-[14px] font-semibold"
            fontFamily="JetBrains Mono"
          >
            {percent.toFixed(0)}%
          </text>
          <text
            x="48"
            y="58"
            textAnchor="middle"
            className="fill-lyra-text-dim text-[9px]"
            fontFamily="JetBrains Mono"
          >
            RAM
          </text>
        </svg>
      </div>

      {/* Memory details */}
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between gap-3">
          <span className="text-lyra-text-dim">Used</span>
          <span className="text-lyra-text">{formatBytes(used)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-lyra-text-dim">Total</span>
          <span className="text-lyra-text">{formatBytes(total)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-lyra-text-dim">Free</span>
          <span className="text-lyra-accent">{formatBytes(total - used)}</span>
        </div>
      </div>
    </div>
  )
}
