"use client"

import { useState } from "react"
import { useMedicine, type MealTiming, type Frequency, DAY_NAMES, type Medicine } from "@/lib/medicine-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface AddMedicineFormProps {
  onClose: () => void
   editingMedicine?: Medicine
}

type Step = "name" | "dosage" | "timing" | "frequency" | "days" | "day-configurations" | "dates"

export function AddMedicineForm({ onClose, editingMedicine }: AddMedicineFormProps) {
  const { addMedicine, updateMedicine } = useMedicine()
  const [step, setStep] = useState<Step>("name")
  const [name, setName] = useState(editingMedicine?.name || "")
  const [dosage, setDosage] = useState(editingMedicine?.dosage || "")
  const [timing, setTiming] = useState<MealTiming | null>(editingMedicine?.timing || null)
  const [frequency, setFrequency] = useState<Frequency | null>(editingMedicine?.frequency || null)
  const [specificDays, setSpecificDays] = useState<number[]>(editingMedicine?.specificDays || [])
  const [dayConfigurations, setDayConfigurations] = useState<DayConfiguration[]>(editingMedicine?.dayConfigurations || [])
  const [startDate, setStartDate] = useState(editingMedicine?.startDate || "")
  const [endDate, setEndDate] = useState(editingMedicine?.endDate || "")

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim() || !timing || !frequency) return

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        timing,
        frequency,
        specificDays: frequency === "specific" ? specificDays : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    } else {
      addMedicine({
        name: name.trim(),
        dosage: dosage.trim(),
        timing,
        frequency,
        specificDays: frequency === "specific" ? specificDays : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    }
    onClose()
  }

  const canProceed = () => {
    switch (step) {
      case "name":
        return name.trim().length > 0
      case "dosage":
        return dosage.trim().length > 0
      case "timing":
        return timing !== null
      case "frequency":
        return frequency !== null
      case "days":
        return specificDays.length > 0
      case "day-configurations":
        return dayConfigurations.length > 0
      case "dates":
        return true // Optional step, always proceed
      default:
        return false
    }
  }

  const goNext = () => {
    if (!canProceed()) return

    switch (step) {
      case "name":
        setStep("dosage")
        break
      case "dosage":
        setStep("timing")
        break
      case "timing":
        setStep("frequency")
        break
      case "frequency":
        if (frequency === "specific") {
          setStep("days")
        } else if (frequency === "custom") {
          setStep("day-configurations")
        } else {
          setStep("dates")
        }
        break
      case "days":
        setStep("dates")
        break
      case "day-configurations":
        setStep("dates")
        break
      case "dates":
        handleSubmit()
        break
    }
  }

  const goBack = () => {
    switch (step) {
      case "dosage":
        setStep("name")
        break
      case "timing":
        setStep("dosage")
        break
      case "frequency":
        setStep("timing")
        break
      case "days":
        setStep("frequency")
        break
      case "dates":
        if (frequency === "specific") {
          setStep("days")
        } else {
          setStep("frequency")
        }
        break
      default:
        onClose()
    }
  }

  const toggleDay = (day: number) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }



  const timingOptions: { value: MealTiming; label: string }[] = [
    { value: "before-breakfast", label: "Before Breakfast" },
    { value: "after-breakfast", label: "After Breakfast" },
    { value: "before-lunch", label: "Before Lunch" },
    { value: "after-lunch", label: "After Lunch" },
    { value: "before-dinner", label: "Before Dinner" },
    { value: "after-dinner", label: "After Dinner" },
    { value: "bedtime", label: "At Bedtime" },
  ]

  const frequencyOptions: { value: Frequency; label: string; description: string }[] = [
    { value: "daily", label: "Every Day", description: "Take this medicine daily" },
    { value: "alternate", label: "Alternate Days", description: "Every other day" },
    { value: "specific", label: "Specific Days", description: "Choose which days" },
  ]

  const stepTitles: Record<Step, string> = {
    name: editingMedicine ? "Update medicine name" : "What medicine?",
    dosage: editingMedicine ? "Update dosage" : "How much do you take?",
    timing: editingMedicine ? "Update timing" : "When do you take it?",
    frequency: editingMedicine ? "Update frequency" : "How often?",
    days: editingMedicine ? "Update days" : "Which days?",
    "day-configurations": editingMedicine ? "Update day configurations" : "Configure per day",
    dates: editingMedicine ? "Update schedule dates" : "Schedule dates",
  }

  const stepDescriptions: Record<Step, string> = {
    name: editingMedicine ? "Update the name of your medicine" : "Enter the name of your medicine",
    dosage: "For example: 1 tablet, 2 pills, 5ml",
    timing: editingMedicine ? "Update when you take this medicine" : "Select when you take this medicine",
    frequency: editingMedicine ? "Update how often you need to take it" : "How often do you need to take it?",
    days: editingMedicine ? "Update the days" : "Tap to select the days",
    "day-configurations": editingMedicine ? "Update the day configurations" : "Configure timing and dosage for each day",
    dates: editingMedicine ? "Update the start and end dates" : "Set start and end dates (optional)",
  }

  return (
    <div className="flex flex-col min-h-full p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {stepTitles[step]}
        </h2>
        <p className="text-xl text-muted-foreground">
          {stepDescriptions[step]}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        {step === "name" && (
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medicine name..."
              className="h-20 text-2xl md:text-3xl px-6 border-2 border-border rounded-xl bg-card focus:border-primary text-center"
              autoFocus
            />
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["BP Medicine", "Sugar Tablet", "Heart Medicine", "Vitamin", "Pain Relief"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setName(suggestion)}
                  className="px-4 py-2 text-lg bg-muted rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "dosage" && (
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="1 tablet"
              className="h-20 text-2xl md:text-3xl px-6 border-2 border-border rounded-xl bg-card focus:border-primary text-center"
              autoFocus
            />
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["1 tablet", "2 tablets", "Half tablet", "1 spoon", "5ml"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setDosage(suggestion)}
                  className="px-4 py-2 text-lg bg-muted rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "timing" && (
          <div className="grid grid-cols-1 gap-3">
            {timingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTiming(option.value)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  timing === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "frequency" && (
          <div className="grid grid-cols-1 gap-4">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  frequency === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-xl md:text-2xl font-bold text-foreground block mb-1">
                  {option.label}
                </span>
                <span className="text-lg text-muted-foreground">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "days" && (
          <div className="grid grid-cols-1 gap-3">
            {DAY_NAMES.map((day, index) => (
              <button
                key={day}
                onClick={() => toggleDay(index)}
                className={`p-5 rounded-xl border-2 text-center transition-all ${
                  specificDays.includes(index)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  {day}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "day-configurations" && (
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground mb-4">
              Configure timing and dosage for each day. Leave days unchecked to skip them.
            </p>
            {DAY_NAMES.map((day, index) => {
              const config = dayConfigurations.find(c => c.day === index)
              return (
                <div key={day} className="border-2 border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-foreground">{day}</span>
                    <button
                      onClick={() => {
                        if (config) {
                          setDayConfigurations(prev => prev.filter(c => c.day !== index))
                        } else {
                          setDayConfigurations(prev => [...prev, { day: index, timing: timing || "before-breakfast", dosage: dosage || "1 tablet" }])
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        config ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {config ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  {config && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Timing</label>
                        <select
                          value={config.timing}
                          onChange={(e) => {
                            setDayConfigurations(prev => prev.map(c =>
                              c.day === index ? { ...c, timing: e.target.value as MealTiming } : c
                            ))
                          }}
                          className="w-full h-12 px-3 border-2 border-border rounded-lg bg-card focus:border-primary"
                        >
                          {timingOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Dosage</label>
                        <Input
                          value={config.dosage}
                          onChange={(e) => {
                            setDayConfigurations(prev => prev.map(c =>
                              c.day === index ? { ...c, dosage: e.target.value } : c
                            ))
                          }}
                          placeholder="1 tablet"
                          className="h-12 px-3 border-2 border-border rounded-lg bg-card focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {step === "dates" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-lg font-semibold text-foreground">Start Date (Optional)</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-16 text-lg px-4 border-2 border-border rounded-xl bg-card focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg font-semibold text-foreground">End Date (Optional)</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-16 text-lg px-4 border-2 border-border rounded-xl bg-card focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-border">
        <Button
          onClick={goNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === "dates" ? (
            <>
              <Check className="h-8 w-8 mr-3" />
              {editingMedicine ? "Update Medicine" : "Save Medicine"}
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-8 w-8 ml-3" />
            </>
          )}
        </Button>
        <Button
          onClick={goBack}
          variant="outline"
          size="lg"
          className="w-full h-16 text-xl font-semibold border-2 border-border rounded-xl text-foreground hover:bg-muted bg-transparent"
        >
          <ChevronLeft className="h-6 w-6 mr-2" />
          {step === "name" ? "Cancel" : "Back"}
        </Button>
      </div>
    </div>
  )
}
