import { formatBytes } from '@/lib/utils'

interface DiskInfo {
  mountpoint: string
  total: number
  used: number
  usedPercent: number
  fstype: string
}

interface DiskUsageProps {
  disks: DiskInfo[]
}

function getDiskColor(percent: number): string {
  if (percent > 90) return 'bg-red-500'
  if (percent > 75) return 'bg-yellow-500'
  return 'bg-lyra-accent3'
}

export function DiskUsage({ disks }: DiskUsageProps) {
  return (
    <div className="space-y-2 px-1">
      {disks.map((disk) => (
        <div key={disk.mountpoint} className="space-y-0.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-lyra-text truncate">
              {disk.mountpoint}
            </span>
            <span className="text-lyra-text-dim shrink-0 ml-2">
              {formatBytes(disk.used)} / {formatBytes(disk.total)}
            </span>
          </div>
          <div className="h-1.5 bg-lyra-bg rounded-sm overflow-hidden border border-lyra-border/50">
            <div
              className={`h-full transition-all duration-500 ease-out ${getDiskColor(disk.usedPercent)}`}
              style={{ width: `${Math.min(disk.usedPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-lyra-text-dim">
            <span>{disk.fstype}</span>
            <span>{disk.usedPercent.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
