import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime'
import {
  CreateSession,
  WriteToSession,
  ResizeSession,
  CloseSession,
} from '../../../wailsjs/go/terminal/TerminalService'

export function useTerminal(sessionId: string) {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!termRef.current) return

    const term = new Terminal({
      theme: {
        background: '#0a0a0f',
        foreground: '#c9d1d9',
        cursor: '#00ff9f',
        cursorAccent: '#0a0a0f',
        selectionBackground: '#00ff9f30',
        selectionForeground: '#ffffff',
        black: '#0d1117',
        red: '#ff006e',
        green: '#00ff9f',
        yellow: '#ffb800',
        blue: '#00b8ff',
        magenta: '#bf40ff',
        cyan: '#00d4ff',
        white: '#c9d1d9',
        brightBlack: '#6e7681',
        brightRed: '#ff4088',
        brightGreen: '#33ffb3',
        brightYellow: '#ffd000',
        brightBlue: '#33c8ff',
        brightMagenta: '#d066ff',
        brightCyan: '#33e0ff',
        brightWhite: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(termRef.current)

    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Create backend session
    CreateSession(sessionId, term.cols, term.rows).catch(console.error)

    // Send keystrokes to backend
    term.onData((data: string) => {
      WriteToSession(sessionId, data).catch(console.error)
    })

    // Receive output from backend (base64 encoded)
    EventsOn(`terminal:output:${sessionId}`, (base64Data: string) => {
      try {
        const binary = atob(base64Data)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        term.write(bytes)
      } catch {
        term.write(base64Data)
      }
    })

    EventsOn(`terminal:closed:${sessionId}`, () => {
      term.write('\r\n\x1b[31m[Session ended]\x1b[0m\r\n')
    })

    // Handle resize
    term.onResize(({ cols, rows }) => {
      ResizeSession(sessionId, cols, rows).catch(console.error)
    })

    // Window resize handler
    const onResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }
    window.addEventListener('resize', onResize)

    // ResizeObserver for container
    const observer = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        setTimeout(() => fitAddonRef.current?.fit(), 50)
      }
    })
    if (termRef.current) {
      observer.observe(termRef.current)
    }

    term.focus()

    return () => {
      EventsOff(`terminal:output:${sessionId}`)
      EventsOff(`terminal:closed:${sessionId}`)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
      CloseSession(sessionId).catch(() => {})
      term.dispose()
    }
  }, [sessionId])

  return { termRef, xtermRef, fitAddonRef }
}
