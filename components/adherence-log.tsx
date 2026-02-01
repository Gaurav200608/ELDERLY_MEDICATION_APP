"use client"

import { useMedicine, TIMING_LABELS, type MissedReason } from "@/lib/medicine-context"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Users } from "lucide-react"

const REASON_LABELS: Record<MissedReason, string> = {
  forgot: "forgot",
  asleep: "was asleep",
  outside: "was outside",
  later: "will take later",
}

export function AdherenceLog() {
  const { logs, getMissedCount, getMissedLogs, medicines } = useMedicine()

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle2 className="h-8 w-8 text-success" />
      case "missed":
        return <XCircle className="h-8 w-8 text-destructive" />
      default:
        return <Clock className="h-8 w-8 text-warning" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "taken":
        return "bg-success/10 border-success"
      case "missed":
        return "bg-destructive/10 border-destructive"
      default:
        return "bg-warning/10 border-warning"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "taken":
        return "Taken"
      case "missed":
        return "Missed"
      default:
        return "Pending"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getTimingLabel = (timing: string) => {
    const label = TIMING_LABELS[timing as keyof typeof TIMING_LABELS]
    if (label) {
      return label.charAt(0).toUpperCase() + label.slice(1)
    }
    return timing
  }

  // Get medicine summary with missed counts
  const medicineSummary = medicines.map((medicine) => {
    const missedCount = getMissedCount(medicine.id)
    return {
      ...medicine,
      missedCount,
      status:
        missedCount === 0 ? "good" : missedCount === 1 ? "warning" : "alert",
    }
  })

  // Generate caregiver summary text
  const generateCaregiverSummary = () => {
    const missedLogs = getMissedLogs()
    if (missedLogs.length === 0) return null

    // Group by medicine
    const missedByMedicine: Record<string, { count: number; timing: string; reasons: MissedReason[] }> = {}
    
    missedLogs.forEach((log) => {
      if (!missedByMedicine[log.medicineName]) {
        missedByMedicine[log.medicineName] = { count: 0, timing: log.timing, reasons: [] }
      }
      missedByMedicine[log.medicineName].count++
      if (log.missedReason) {
        missedByMedicine[log.medicineName].reasons.push(log.missedReason)
      }
    })

    return Object.entries(missedByMedicine).map(([name, data]) => {
      const timingLabel = TIMING_LABELS[data.timing as keyof typeof TIMING_LABELS] || data.timing
      const mostCommonReason = data.reasons.length > 0 
        ? data.reasons.sort((a, b) =>
            data.reasons.filter(r => r === a).length - data.reasons.filter(r => r === b).length
          ).pop()
        : null
      
      let summary = `${name} missed ${data.count} time${data.count > 1 ? "s" : ""} (${timingLabel})`
      if (mostCommonReason) {
        summary += ` - usually ${REASON_LABELS[mostCommonReason]}`
      }
      return summary
    })
  }

  const caregiverSummary = generateCaregiverSummary()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Your Medicine History
        </h2>
        <p className="text-xl text-muted-foreground">
          See how you are doing with your medicines
        </p>
      </div>

      {/* Caregiver Summary */}
      {caregiverSummary && caregiverSummary.length > 0 && (
        <div className="bg-card rounded-xl border-2 border-primary p-5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              Caregiver Summary
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {caregiverSummary.map((summary, index) => (
              <p key={index} className="text-lg text-foreground leading-relaxed">
                {summary}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Medicine Summary */}
      {medicineSummary.length > 0 && (
        <div className="bg-card rounded-xl border-2 border-border p-5">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Medicine Status
          </h3>
          <div className="flex flex-col gap-3">
            {medicineSummary.map((medicine) => (
              <div
                key={medicine.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  medicine.status === "good"
                    ? "bg-success/10 border-success"
                    : medicine.status === "warning"
                      ? "bg-warning/10 border-warning"
                      : "bg-destructive/10 border-destructive"
                }`}
              >
                <span className="text-xl font-semibold text-foreground">
                  {medicine.name}
                </span>
                <div className="flex items-center gap-2">
                  {medicine.status === "good" ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : medicine.status === "warning" ? (
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  <span
                    className={`text-lg font-medium ${
                      medicine.status === "good"
                        ? "text-success"
                        : medicine.status === "warning"
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {medicine.missedCount === 0
                      ? "All Good"
                      : `${medicine.missedCount} Missed`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Entries */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
        {sortedLogs.length === 0 ? (
          <div className="text-center py-8 px-6 bg-muted rounded-xl">
            <p className="text-xl text-muted-foreground">
              No history yet. Add medicines to start tracking.
            </p>
          </div>
        ) : (
          sortedLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 ${getStatusBg(log.status)}`}
            >
              {getStatusIcon(log.status)}
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-foreground truncate">
                  {log.medicineName}
                </p>
                <p className="text-lg text-muted-foreground">
                  {log.dosage} - {getTimingLabel(log.timing)}
                </p>
                {log.status === "missed" && log.missedReason && (
                  <p className="text-base text-destructive">
                    Reason: {REASON_LABELS[log.missedReason]}
                  </p>
                )}
                <p className="text-base text-muted-foreground">
                  {formatDate(log.timestamp)}
                </p>
              </div>
              <span
                className={`text-lg font-bold px-3 py-1 rounded-lg shrink-0 ${
                  log.status === "taken"
                    ? "bg-success text-success-foreground"
                    : log.status === "missed"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-warning text-warning-foreground"
                }`}
              >
                {getStatusLabel(log.status)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="bg-muted rounded-xl p-5 mt-4">
        <h4 className="text-lg font-bold text-foreground mb-3">
          What do the colors mean?
        </h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-success" />
            <span className="text-lg text-foreground">Green = Taken on time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-warning" />
            <span className="text-lg text-foreground">Yellow = Missed once</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-destructive" />
            <span className="text-lg text-foreground">Red = Missed multiple times</span>
          </div>
        </div>
      </div>
    </div>
  )
}
