"use client"

import { useState } from "react"
import { useMedicine, type LogEntry, type MissedReason } from "@/lib/medicine-context"
import { Button } from "@/components/ui/button"
import { Check, X, Clock } from "lucide-react"

const MISSED_REASONS: { value: MissedReason; label: string }[] = [
  { value: "forgot", label: "Forgot" },
  { value: "asleep", label: "Was asleep" },
  { value: "outside", label: "Was outside" },
  { value: "later", label: "Will take later" },
]

interface ReminderCardProps {
  reminder: LogEntry
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const { markAsTaken, markAsMissed, snoozeReminder } = useMedicine()
  const [showReasonModal, setShowReasonModal] = useState(false)

  if (reminder.status !== "pending") return null

  const handleMissedClick = () => {
    setShowReasonModal(true)
  }

  const handleReasonSelect = (reason: MissedReason) => {
    markAsMissed(reminder.id, reason)
    setShowReasonModal(false)
  }

  return (
    <>
      <div className="bg-card rounded-2xl border-2 border-primary shadow-lg p-6 md:p-8">
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-relaxed">
          {reminder.reminderText}
        </p>

        <div className="flex flex-col gap-4">
          <Button
            onClick={() => markAsTaken(reminder.id)}
            size="lg"
            className="w-full h-24 text-3xl font-bold bg-success hover:bg-success/90 text-success-foreground rounded-2xl"
          >
            <Check className="h-10 w-10 mr-4" strokeWidth={3} />
            I Took It
          </Button>
          
          <Button
            onClick={() => snoozeReminder(reminder.id)}
            size="lg"
            className="w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
          >
            <Clock className="h-8 w-8 mr-3" strokeWidth={3} />
            Remind Me in 10 Minutes
          </Button>
          
          <Button
            onClick={handleMissedClick}
            size="lg"
            className="w-full h-20 text-2xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-2xl"
          >
            <X className="h-8 w-8 mr-3" strokeWidth={3} />
            I Missed It
          </Button>
        </div>
      </div>

      {/* Missed Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
              Why was the medicine missed?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 text-center">
              This helps your caregiver understand
            </p>
            
            <div className="flex flex-col gap-4">
              {MISSED_REASONS.map((reason) => (
                <Button
                  key={reason.value}
                  onClick={() => handleReasonSelect(reason.value)}
                  size="lg"
                  variant="outline"
                  className="w-full h-16 text-xl font-semibold rounded-xl border-2 hover:bg-muted"
                >
                  {reason.label}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={() => setShowReasonModal(false)}
              variant="ghost"
              className="w-full mt-4 text-lg text-muted-foreground"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
