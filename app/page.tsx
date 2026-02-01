"use client"

import { useState } from "react"
import { MedicineProvider, useMedicine } from "@/lib/medicine-context"
import { UserProvider, useUser } from "@/lib/user-context"
import { Header } from "@/components/header"
import { MedicineList } from "@/components/medicine-list"
import { AddMedicineForm } from "@/components/add-medicine-form"
import { RemindersScreen } from "@/components/reminders-screen"
import { AdherenceLog } from "@/components/adherence-log"
import { CaregiverAlert } from "@/components/caregiver-alert"
import { BottomNav } from "@/components/bottom-nav"
import { Login } from "@/components/login"

type TabType = "medicines" | "reminders" | "history"
type ViewType = "main" | "add-medicine" | "edit-medicine"

function AppContent() {
  const { isLoggedIn } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>("medicines")
  const [currentView, setCurrentView] = useState<ViewType>("main")
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null)
  const { getPendingReminders, medicines } = useMedicine()

  if (!isLoggedIn) {
    return <Login />
  }

  const pendingCount = getPendingReminders().length

  const renderContent = () => {
    if (currentView === "add-medicine") {
      return <AddMedicineForm onClose={() => setCurrentView("main")} />
    }

    if (currentView === "edit-medicine" && editingMedicineId) {
      const medicine = medicines.find(m => m.id === editingMedicineId)
      if (medicine) {
        return <AddMedicineForm
          onClose={() => {
            setCurrentView("main")
            setEditingMedicineId(null)
          }}
          editingMedicine={medicine}
        />
      }
    }

    switch (activeTab) {
      case "medicines":
        return <MedicineList
          onAddMedicine={() => setCurrentView("add-medicine")}
          onEditMedicine={(id) => {
            setEditingMedicineId(id)
            setCurrentView("edit-medicine")
          }}
        />
      case "reminders":
        return <RemindersScreen />
      case "history":
        return <AdherenceLog />
      default:
        return null
    }
  }

  const getTitle = () => {
    if (currentView === "add-medicine") return "Add Medicine"
    if (currentView === "edit-medicine") return "Edit Medicine"
    switch (activeTab) {
      case "medicines":
        return "MedRemind"
      case "reminders":
        return "Reminders"
      case "history":
        return "History"
      default:
        return "MedRemind"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={getTitle()}
        showBack={currentView === "add-medicine"}
        onBack={() => setCurrentView("main")}
      />

      <main className="flex-1 pb-28 max-w-2xl mx-auto w-full">
        {renderContent()}
      </main>

      {currentView === "main" && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingCount}
        />
      )}

      <CaregiverAlert />
    </div>
  )
}

export default function Home() {
  return (
    <UserProvider>
      <MedicineProvider>
        <AppContent />
      </MedicineProvider>
    </UserProvider>
  )
}
