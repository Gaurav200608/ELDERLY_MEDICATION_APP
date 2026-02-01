"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// Background monitoring service
class BackgroundMonitoringService {
  private intervalId: NodeJS.Timeout | null = null
  private callback: (() => void) | null = null

  start(callback: () => void) {
    this.callback = callback
    this.intervalId = setInterval(() => {
      this.callback?.()
    }, 60000) // Check every minute
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

const backgroundService = new BackgroundMonitoringService()

export type MealTiming =
  | "before-breakfast"
  | "after-breakfast"
  | "before-lunch"
  | "after-lunch"
  | "before-dinner"
  | "after-dinner"
  | "bedtime"

export type Frequency = "daily" | "alternate" | "specific" | "custom"

export interface DayConfiguration {
  day: number // 0=Monday, 1=Tuesday, ..., 6=Sunday
  timing: MealTiming
  dosage: string
}

export interface Medicine {
  id: string
  name: string
  dosage: string
  timing: MealTiming
  frequency: Frequency
  specificDays?: number[] // 0=Sunday, 1=Monday, etc.
  dayConfigurations?: DayConfiguration[] // For custom frequency
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  createdAt: string
}

export type MissedReason = "forgot" | "asleep" | "outside" | "later"

export interface LogEntry {
  id: string
  medicineId: string
  medicineName: string
  dosage: string
  timing: MealTiming
  reminderText: string
  status: "taken" | "missed" | "pending" | "snoozed"
  missedReason?: MissedReason
  timestamp: string
  date: string
  snoozeUntil?: string
}

interface MedicineContextType {
  medicines: Medicine[]
  logs: LogEntry[]
  addMedicine: (medicine: Omit<Medicine, "id" | "createdAt">) => void
  updateMedicine: (id: string, medicine: Omit<Medicine, "id" | "createdAt">) => void
  removeMedicine: (id: string) => void
  markAsTaken: (logId: string) => void
  markAsMissed: (logId: string, reason: MissedReason) => void
  snoozeReminder: (logId: string) => void
  getPendingReminders: () => LogEntry[]
  getMissedCount: (medicineId: string) => number
  getMissedLogs: () => LogEntry[]
  caregiverAlertVisible: boolean
  caregiverAlertMedicine: string
  dismissCaregiverAlert: () => void
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined)

const TIMING_LABELS: Record<MealTiming, string> = {
  "before-breakfast": "before breakfast",
  "after-breakfast": "after breakfast",
  "before-lunch": "before lunch",
  "after-lunch": "after lunch",
  "before-dinner": "before dinner",
  "after-dinner": "after dinner",
  "bedtime": "at bedtime",
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function shouldShowToday(medicine: Medicine): boolean {
  const today = new Date()
  const todayStr = today.toDateString()
  const dayOfWeek = today.getDay()
  // Adjust dayOfWeek to match DAY_NAMES order (Monday=0, Sunday=6)
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Check date range
  if (medicine.startDate) {
    const startDate = new Date(medicine.startDate)
    if (today < startDate) return false
  }

  if (medicine.endDate) {
    const endDate = new Date(medicine.endDate)
    if (today > endDate) return false
  }

  if (medicine.frequency === "daily") {
    return true
  }

  if (medicine.frequency === "alternate") {
    const createdDate = new Date(medicine.createdAt)
    const diffTime = Math.abs(today.getTime() - createdDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays % 2 === 0
  }

  if (medicine.frequency === "specific" && medicine.specificDays) {
    return medicine.specificDays.includes(adjustedDay)
  }

  return true
}

function generateReminderText(medicine: Medicine, dayConfig?: DayConfiguration): string {
  const timing = dayConfig?.timing || medicine.timing
  const dosage = dayConfig?.dosage || medicine.dosage
  const timingLabel = TIMING_LABELS[timing]
  return `Please take ${medicine.name} (${dosage}) ${timingLabel}`
}

export function MedicineProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [caregiverAlertVisible, setCaregiverAlertVisible] = useState(false)
  const [caregiverAlertMedicine, setCaregiverAlertMedicine] = useState("")

  // Load from localStorage on mount
  useEffect(() => {
    const savedMedicines = localStorage.getItem("medremind-medicines")
    const savedLogs = localStorage.getItem("medremind-logs")
    
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines))
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("medremind-medicines", JSON.stringify(medicines))
  }, [medicines])

  useEffect(() => {
    localStorage.setItem("medremind-logs", JSON.stringify(logs))
  }, [logs])

  // Create daily reminders for medicines
  useEffect(() => {
    const today = new Date().toDateString()
    
    medicines.forEach((medicine) => {
      // Check if this medicine should be shown today based on frequency
      if (!shouldShowToday(medicine)) return
      
      const existingLog = logs.find(
        (log) =>
          log.medicineId === medicine.id &&
          log.date === today
      )

      if (!existingLog) {
        const newLog: LogEntry = {
          id: `${medicine.id}-${Date.now()}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          timing: medicine.timing,
          reminderText: generateReminderText(medicine),
          status: "pending",
          timestamp: new Date().toISOString(),
          date: today,
        }
        setLogs((prev) => [...prev, newLog])
      }
    })
  }, [medicines, logs])

  const addMedicine = (medicineData: Omit<Medicine, "id" | "createdAt">) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: `medicine-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setMedicines((prev) => [...prev, newMedicine])
  }

  const updateMedicine = (id: string, medicineData: Omit<Medicine, "id" | "createdAt">) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === id
          ? { ...medicine, ...medicineData }
          : medicine
      )
    )
  }

  const removeMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id))
    setLogs((prev) => prev.filter((l) => l.medicineId !== id))
  }

  const markAsTaken = (logId: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId ? { ...log, status: "taken" as const, timestamp: new Date().toISOString() } : log
      )
    )
  }

  const snoozeReminder = (logId: string) => {
    const snoozeTime = new Date()
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 10)
    
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? { ...log, status: "snoozed" as const, snoozeUntil: snoozeTime.toISOString() }
          : log
      )
    )

    // Re-show the reminder after 10 minutes (mock - instant for demo)
    setTimeout(() => {
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId && log.status === "snoozed"
            ? { ...log, status: "pending" as const, snoozeUntil: undefined }
            : log
        )
      )
    }, 10000) // 10 seconds for demo purposes (would be 600000 for 10 minutes in production)
  }

  const markAsMissed = useCallback((logId: string, reason: MissedReason) => {
    setLogs((prev) => {
      const updatedLogs = prev.map((log) =>
        log.id === logId ? { ...log, status: "missed" as const, missedReason: reason } : log
      )
      
      // Check if this medicine has been missed multiple times
      const targetLog = prev.find((log) => log.id === logId)
      if (targetLog) {
        const missedCount = updatedLogs.filter(
          (log) => log.medicineId === targetLog.medicineId && log.status === "missed"
        ).length
        
        if (missedCount >= 2) {
          setCaregiverAlertMedicine(targetLog.medicineName)
          setCaregiverAlertVisible(true)
        }
      }
      
      return updatedLogs
    })
  }, [])

  const getPendingReminders = () => {
    const today = new Date().toDateString()
    return logs.filter((log) => log.status === "pending" && log.date === today)
  }

  const getMissedCount = (medicineId: string) => {
    return logs.filter((log) => log.medicineId === medicineId && log.status === "missed").length
  }

  const getMissedLogs = () => {
    return logs.filter((log) => log.status === "missed")
  }

  const dismissCaregiverAlert = () => {
    setCaregiverAlertVisible(false)
    setCaregiverAlertMedicine("")
  }

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        logs,
        addMedicine,
        updateMedicine,
        removeMedicine,
        markAsTaken,
        markAsMissed,
        snoozeReminder,
        getPendingReminders,
        getMissedCount,
        getMissedLogs,
        caregiverAlertVisible,
        caregiverAlertMedicine,
        dismissCaregiverAlert,
      }}
    >
      {children}
    </MedicineContext.Provider>
  )
}

export function useMedicine() {
  const context = useContext(MedicineContext)
  if (context === undefined) {
    throw new Error("useMedicine must be used within a MedicineProvider")
  }
  return context
}

export { TIMING_LABELS, DAY_NAMES }
