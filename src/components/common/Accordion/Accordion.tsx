import { useState } from 'react'

import type { ReactNode } from 'react'

import './Accordion.css'

interface AccordionProps {
  title: string,
  children: ReactNode,
  defaultOpen?: boolean,
  isOpen?: boolean,
  onToggle?: () => void,
  showTrigger?: boolean,
}

const Accordion = ({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  showTrigger = true,
}: AccordionProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const toggle = () => {
    if (onToggle) {
      onToggle()
      return
    }

    setInternalIsOpen(open => !open)
  }

  return (
    <div className={`common-accordion ${isOpen ? 'common-accordion--open' : ''}`}>
      {showTrigger ? (
        <button
          type="button"
          className="common-accordion__trigger"
          aria-expanded={isOpen}
          onClick={toggle}
        >
          <span>{title}</span>
          <span className="common-accordion__icon" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      ) : null}
      {isOpen ? (
        <div className="common-accordion__content">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default Accordion
