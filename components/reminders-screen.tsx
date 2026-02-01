"use client"

import { useMedicine } from "@/lib/medicine-context"
import { ReminderCard } from "./reminder-card"
import { CheckCircle2 } from "lucide-react"

export function RemindersScreen() {
  const { getPendingReminders } = useMedicine()
  const pendingReminders = getPendingReminders()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Today&apos;s Reminders
        </h2>
        <p className="text-xl text-muted-foreground">
          {pendingReminders.length > 0
            ? "Tap the button when you take your medicine"
            : "All done for today!"}
        </p>
      </div>

      {pendingReminders.length === 0 ? (
        <div className="text-center py-16 px-6 bg-success/10 rounded-2xl border-2 border-success">
          <CheckCircle2 className="h-20 w-20 text-success mx-auto mb-4" />
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Great Job!
          </p>
          <p className="text-xl text-muted-foreground">
            You have no pending reminders
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {pendingReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  )
}
