"use client"

import React from "react"

import { Pill, Bell, ClipboardList } from "lucide-react"

type TabType = "medicines" | "reminders" | "history"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  pendingCount: number
}

export function BottomNav({ activeTab, onTabChange, pendingCount }: BottomNavProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "medicines",
      label: "Medicines",
      icon: <Pill className="h-8 w-8" />,
    },
    {
      id: "reminders",
      label: "Reminders",
      icon: <Bell className="h-8 w-8" />,
    },
    {
      id: "history",
      label: "History",
      icon: <ClipboardList className="h-8 w-8" />,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-40">
      <div className="flex justify-around items-stretch">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-2 transition-colors relative ${
              activeTab === tab.id
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            <div className="relative">
              {tab.icon}
              {tab.id === "reminders" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-lg font-semibold mt-1">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-primary rounded-b-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
