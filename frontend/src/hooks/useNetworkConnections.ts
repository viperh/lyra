import { useState, useEffect } from 'react'
import { useWailsEvent } from './useWailsEvent'
import { GetConnections, StartMonitoring, StopMonitoring } from '../../wailsjs/go/network/NetworkService'

export interface ConnectionInfo {
  localAddr: string
  localPort: number
  remoteAddr: string
  remotePort: number
  status: string
  pid: number
  process: string
  lat: number
  lng: number
  country: string
  city: string
}

export function useNetworkConnections(intervalMs = 5000) {
  const [connections, setConnections] = useState<ConnectionInfo[]>([])

  useEffect(() => {
    GetConnections().then(setConnections).catch(console.error)
    StartMonitoring(intervalMs).catch(console.error)
    return () => {
      StopMonitoring().catch(console.error)
    }
  }, [intervalMs])

  useWailsEvent<ConnectionInfo[]>('network:connections', (data) => {
    setConnections(data)
  })

  return connections
}
