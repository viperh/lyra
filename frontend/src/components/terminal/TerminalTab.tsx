import { useTerminal } from './useTerminal'

interface TerminalTabProps {
  sessionId: string
}

export function TerminalTab({ sessionId }: TerminalTabProps) {
  const { termRef } = useTerminal(sessionId)

  return (
    <div
      ref={termRef}
      className="w-full h-full"
      style={{ padding: '4px' }}
    />
  )
}
