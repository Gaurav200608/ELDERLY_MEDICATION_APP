"use client"

import { Pill } from "lucide-react"

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title = "MedRemind", showBack = false, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-card border-b-2 border-border px-6 py-5">
      <div className="flex items-center justify-center gap-4">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="absolute left-4 text-2xl font-bold text-primary hover:text-primary/80 transition-colors px-4 py-2"
            aria-label="Go back"
          >
            Back
          </button>
        )}
        <div className="flex items-center gap-3">
          <Pill className="h-10 w-10 text-primary" strokeWidth={2.5} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
        </div>
      </div>
    </header>
  )
}
