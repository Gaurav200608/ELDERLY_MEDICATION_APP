"use client"

import { useMedicine, TIMING_LABELS, DAY_NAMES, type Frequency } from "@/lib/medicine-context"
import { Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MedicineListProps {
  onAddMedicine: () => void
  onEditMedicine: (id: string) => void
}

export function MedicineList({ onAddMedicine, onEditMedicine }: MedicineListProps) {
  const { medicines, removeMedicine, getMissedCount } = useMedicine()

  const getFrequencyLabel = (frequency: Frequency, specificDays?: number[]): string => {
    switch (frequency) {
      case "daily":
        return "Every day"
      case "alternate":
        return "Alternate days"
      case "specific":
        if (specificDays && specificDays.length > 0) {
          return specificDays.map((d) => DAY_NAMES[d].slice(0, 3)).join(", ")
        }
        return "Specific days"
      default:
        return frequency
    }
  }

  const getStatusColor = (medicineId: string): string => {
    const missedCount = getMissedCount(medicineId)
    if (missedCount === 0) return "border-l-success"
    if (missedCount === 1) return "border-l-warning"
    return "border-l-destructive"
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Your Medicines
        </h2>
        <p className="text-xl text-muted-foreground">
          {medicines.length > 0 ? "Tap the trash to remove a medicine" : "Add your medicines below"}
        </p>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-12 px-6 bg-muted rounded-xl">
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            No medicines added yet
          </p>
          <p className="text-lg text-muted-foreground">
            Tap the button below to add your first medicine
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className={`bg-card rounded-xl border-2 border-border border-l-8 ${getStatusColor(medicine.id)} p-6 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {medicine.name}
                  </h3>
                  <p className="text-xl text-primary font-semibold mt-1">
                    {medicine.dosage}
                  </p>
                  <p className="text-lg text-muted-foreground mt-2">
                    {TIMING_LABELS[medicine.timing].charAt(0).toUpperCase() + TIMING_LABELS[medicine.timing].slice(1)}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {getFrequencyLabel(medicine.frequency, medicine.specificDays, medicine.dayConfigurations)}
                  </p>
                  {medicine.frequency === "custom" && medicine.dayConfigurations && medicine.dayConfigurations.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {medicine.dayConfigurations.map((config: any) => (
                        <div key={config.day} className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          <span className="font-medium">{DAY_NAMES[config.day]}:</span> {config.dosage} {TIMING_LABELS[config.timing]}
                        </div>
                      ))}
                    </div>
                  )}
                  {(medicine.startDate || medicine.endDate) && (
                    <p className="text-base text-muted-foreground">
                      {medicine.startDate && `From ${new Date(medicine.startDate).toLocaleDateString()}`}
                      {medicine.startDate && medicine.endDate && " "}
                      {medicine.endDate && `Until ${new Date(medicine.endDate).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onEditMedicine(medicine.id)}
                    className="h-16 w-16 p-0 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    aria-label={`Edit ${medicine.name}`}
                  >
                    <Edit className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => removeMedicine(medicine.id)}
                    className="h-16 w-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Remove ${medicine.name}`}
                  >
                    <Trash2 className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={onAddMedicine}
        size="lg"
        className="w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-4"
      >
        <Plus className="h-8 w-8 mr-3" />
        Add New Medicine
      </Button>
    </div>
  )
}
