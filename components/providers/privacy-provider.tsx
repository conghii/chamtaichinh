"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface PrivacyContextType {
    isHidden: boolean
    togglePrivacy: () => void
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
    const [isHidden, setIsHidden] = useState(false)

    // Optional: Persist to localStorage
    useEffect(() => {
        const stored = localStorage.getItem("privacy-mode")
        if (stored === "true") setIsHidden(true)
    }, [])

    const togglePrivacy = () => {
        const newValue = !isHidden
        setIsHidden(newValue)
        localStorage.setItem("privacy-mode", String(newValue))
    }

    return (
        <PrivacyContext.Provider value={{ isHidden, togglePrivacy }}>
            {children}
        </PrivacyContext.Provider>
    )
}

export function usePrivacy() {
    const context = useContext(PrivacyContext)
    if (context === undefined) {
        throw new Error("usePrivacy must be used within a PrivacyProvider")
    }
    return context
}
