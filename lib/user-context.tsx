"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Hardcoded credentials for demo
const DEMO_CREDENTIALS = {
  email: "user@example.com",
  password: "password123",
  name: "Demo User"
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("medremind-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const userData = {
        id: "user-1",
        name: DEMO_CREDENTIALS.name,
        email: DEMO_CREDENTIALS.email
      }
      setUser(userData)
      localStorage.setItem("medremind-user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("medremind-user")
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
