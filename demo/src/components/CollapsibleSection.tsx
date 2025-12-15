import { useState, type ReactNode } from 'react'
import './CollapsibleSection.css'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="collapsible-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-header"
        type="button"
        aria-expanded={isOpen}
      >
        <span className={`collapsible-chevron ${isOpen ? 'open' : ''}`}>▶</span>
        {title}
      </button>
      {isOpen && (
        <div className="collapsible-content">{children}</div>
      )}
    </div>
  )
}
