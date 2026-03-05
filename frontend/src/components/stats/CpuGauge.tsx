interface CpuGaugeProps {
  cores: number[]
  overall: number
}

function getBarColor(percent: number): string {
  if (percent > 90) return 'bg-red-500'
  if (percent > 70) return 'bg-yellow-500'
  return 'bg-lyra-accent'
}

function getBarGlow(percent: number): string {
  if (percent > 90) return 'shadow-[0_0_6px_rgba(239,68,68,0.5)]'
  if (percent > 70) return 'shadow-[0_0_6px_rgba(234,179,8,0.5)]'
  return 'shadow-[0_0_6px_rgba(0,255,159,0.4)]'
}

export function CpuGauge({ cores, overall }: CpuGaugeProps) {
  return (
    <div className="space-y-1">
      {/* Overall bar */}
      <div className="px-1">
        <div className="h-2 bg-lyra-bg rounded-sm overflow-hidden border border-lyra-border">
          <div
            className={`h-full transition-all duration-500 ease-out ${getBarColor(overall)} ${getBarGlow(overall)}`}
            style={{ width: `${Math.min(overall, 100)}%` }}
          />
        </div>
      </div>

      {/* Per-core bars */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-1">
        {cores.map((percent, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[9px] text-lyra-text-dim w-4 shrink-0">
              C{i}
            </span>
            <div className="flex-1 h-1.5 bg-lyra-bg rounded-sm overflow-hidden border border-lyra-border/50">
              <div
                className={`h-full transition-all duration-500 ease-out ${getBarColor(percent)}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-lyra-text-dim w-7 text-right shrink-0">
              {percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
