import { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { TerminalTab } from './TerminalTab'

interface Tab {
  id: string
  label: string
}

let tabCounter = 0

function generateTabId(): string {
  tabCounter++
  return `term-${Date.now()}-${tabCounter}`
}

export function TerminalPanel() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const id = generateTabId()
    return [{ id, label: 'Terminal 1' }]
  })
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  const addTab = useCallback(() => {
    const id = generateTabId()
    const label = `Terminal ${tabs.length + 1}`
    setTabs(prev => [...prev, { id, label }])
    setActiveTab(id)
  }, [tabs.length])

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        const newId = generateTabId()
        setActiveTab(newId)
        return [{ id: newId, label: 'Terminal 1' }]
      }
      if (activeTab === id) {
        setActiveTab(next[next.length - 1].id)
      }
      return next
    })
  }, [activeTab])

  return (
    <div className="lyra-panel flex flex-col h-full scan-line">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-0 border-b border-lyra-border shrink-0">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] cursor-pointer rounded-t transition-colors group ${
              activeTab === tab.id
                ? 'bg-lyra-bg text-lyra-accent border border-lyra-border border-b-transparent -mb-px'
                : 'text-lyra-text-dim hover:text-lyra-text'
            }`}
          >
            <span>{tab.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={addTab}
          className="p-1 ml-1 text-lyra-text-dim hover:text-lyra-accent transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal content */}
      <div className="flex-1 relative min-h-0">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            <TerminalTab sessionId={tab.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
