import { useState, useEffect } from 'react'
import { useWailsEvent } from './useWailsEvent'
import { GetStats, StartMonitoring, StopMonitoring } from '../../wailsjs/go/sysmon/SysMonService'

export interface DiskInfo {
  mountpoint: string
  total: number
  used: number
  usedPercent: number
  fstype: string
}

export interface SystemStats {
  cpuPercent: number[]
  cpuOverall: number
  memTotal: number
  memUsed: number
  memPercent: number
  disks: DiskInfo[]
  hostname: string
  os: string
  uptime: number
}

export function useSystemStats(intervalMs = 2000) {
  const [stats, setStats] = useState<SystemStats | null>(null)

  useEffect(() => {
    GetStats().then(setStats).catch(console.error)
    StartMonitoring(intervalMs).catch(console.error)
    return () => {
      StopMonitoring().catch(console.error)
    }
  }, [intervalMs])

  useWailsEvent<SystemStats>('sysmon:stats', (data) => {
    setStats(data)
  })

  return stats
}
