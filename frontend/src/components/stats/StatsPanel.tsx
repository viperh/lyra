import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react'
import { useSystemStats } from '@/hooks/useSystemStats'
import { CpuGauge } from './CpuGauge'
import { MemoryGauge } from './MemoryGauge'
import { DiskUsage } from './DiskUsage'
import { formatUptime } from '@/lib/utils'

export function StatsPanel() {
  const stats = useSystemStats(2000)

  if (!stats) {
    return (
      <div className="lyra-panel flex items-center justify-center h-full">
        <div className="text-lyra-text-dim text-[11px] animate-pulse">
          Loading system data...
        </div>
      </div>
    )
  }

  return (
    <div className="lyra-panel flex flex-col h-full overflow-auto scan-line">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-lyra-border shrink-0">
        <Activity className="w-3.5 h-3.5 text-lyra-accent" />
        <span className="text-[11px] text-lyra-accent font-semibold tracking-wider">
          SYSTEM MONITOR
        </span>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-3">
        {/* CPU Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Cpu className="w-3 h-3 text-lyra-accent" />
            <span className="text-[10px] text-lyra-accent tracking-wider font-semibold">CPU</span>
            <span className="text-[10px] text-lyra-text-dim ml-auto">
              {stats.cpuOverall.toFixed(1)}%
            </span>
          </div>
          <CpuGauge cores={stats.cpuPercent} overall={stats.cpuOverall} />
        </div>

        {/* Memory Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <MemoryStick className="w-3 h-3 text-lyra-accent2" />
            <span className="text-[10px] text-lyra-accent2 tracking-wider font-semibold">MEMORY</span>
            <span className="text-[10px] text-lyra-text-dim ml-auto">
              {stats.memPercent.toFixed(1)}%
            </span>
          </div>
          <MemoryGauge
            total={stats.memTotal}
            used={stats.memUsed}
            percent={stats.memPercent}
          />
        </div>

        {/* Disk Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <HardDrive className="w-3 h-3 text-lyra-accent3" />
            <span className="text-[10px] text-lyra-accent3 tracking-wider font-semibold">STORAGE</span>
          </div>
          <DiskUsage disks={stats.disks} />
        </div>

        {/* System info */}
        <div className="border-t border-lyra-border pt-2 space-y-1 px-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-lyra-text-dim">HOST</span>
            <span className="text-lyra-text">{stats.hostname}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-lyra-text-dim">OS</span>
            <span className="text-lyra-text truncate ml-2">{stats.os}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-lyra-text-dim">UPTIME</span>
            <span className="text-lyra-text">{formatUptime(stats.uptime)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
