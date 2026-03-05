import { useEffect, useRef, useCallback } from 'react'
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime'

export function useWailsEvent<T = any>(
  eventName: string,
  callback: (data: T) => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (data: T) => callbackRef.current(data)
    EventsOn(eventName, handler)
    return () => {
      EventsOff(eventName)
    }
  }, [eventName])
}

export function useWailsEvents<T = any>(
  eventNames: string[],
  callback: (eventName: string, data: T) => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    eventNames.forEach(name => {
      EventsOn(name, (data: T) => callbackRef.current(name, data))
    })
    return () => {
      eventNames.forEach(name => EventsOff(name))
    }
  }, [eventNames.join(',')])
}
