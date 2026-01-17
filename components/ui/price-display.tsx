"use client"

import { usePrivacy } from "@/components/providers/privacy-provider"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
    value: number
    className?: string
    currency?: string
    showSign?: boolean // Explicitly show + or -
}

export function PriceDisplay({ value, className, currency = 'VND', showSign = false }: PriceDisplayProps) {
    const { isHidden } = usePrivacy()

    if (isHidden) {
        return <span className={cn("tracking-widest filter blur-[2px] select-none", className)}>***.*** đ</span>
    }

    // Handle -0 logic
    const safeValue = Math.abs(value) < 1 ? 0 : value

    const formatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
    }).format(Math.abs(safeValue))

    // Handle Signs manually if needed, or let Intl do it.
    // Intl handles - sign.
    // But for 0, it's just 0.

    // If showSign is true and positive, add +
    const sign = showSign && safeValue > 0 ? "+" : (safeValue < 0 ? "-" : "")

    // Use Intl for the number part only if we want custom sign placement? 
    // Actually, simply sticking to standard is better.
    // But for negative numbers, Intl puts hyphen.

    // Let's just return standard format, but ensure -0 is clean.
    const displayString = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
    }).format(safeValue)

    // Append explicit + if needed and value > 0
    // Note: This overrides default negative sign formatting which might be weird.
    // Let's keep it simple.

    return (
        <span className={className}>
            {showSign && safeValue > 0 ? "+" : ""}{displayString}
        </span>
    )
}
