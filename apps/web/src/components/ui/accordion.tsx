import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn("divide-y divide-border rounded-lg border", className)}>
      {children}
    </div>
  )
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
}

function AccordionItem({ children, className }: AccordionItemProps) {
  return <div className={cn("", className)}>{children}</div>
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isOpen?: boolean
}

function AccordionTrigger({ children, className, onClick, isOpen }: AccordionTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-4 text-left font-medium transition-all hover:bg-muted/50",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

function AccordionContent({ children, className, isOpen }: AccordionContentProps) {
  if (!isOpen) return null

  return (
    <div className={cn("overflow-hidden text-sm", className)}>
      <div className="px-4 pb-4 pt-0">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
