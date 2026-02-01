"use client"

import { useMedicine } from "@/lib/medicine-context"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, X } from "lucide-react"

export function CaregiverAlert() {
  const { caregiverAlertVisible, caregiverAlertMedicine, dismissCaregiverAlert } =
    useMedicine()

  if (!caregiverAlertVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-6">
      <div className="bg-card rounded-2xl border-4 border-destructive shadow-2xl max-w-lg w-full p-8">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-destructive mb-3">
              Alert Sent
            </h2>
            <p className="text-xl md:text-2xl text-foreground mb-2">
              <span className="font-bold">{caregiverAlertMedicine}</span> has been
              missed multiple times.
            </p>
            <p className="text-lg text-muted-foreground">
              Your caregiver has been notified about this missed dose.
            </p>
          </div>

          <div className="w-full bg-warning/10 rounded-xl p-4 border-2 border-warning">
            <div className="flex items-center justify-center gap-3 text-warning">
              <Phone className="h-6 w-6" />
              <span className="text-lg font-semibold">
                Caregiver Alert Simulated
              </span>
            </div>
            <p className="text-muted-foreground mt-2">
              In a real app, this would send a message or call to your caregiver.
            </p>
          </div>

          <Button
            onClick={dismissCaregiverAlert}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-4"
          >
            <X className="h-6 w-6 mr-2" />
            I Understand
          </Button>
        </div>
      </div>
    </div>
  )
}
