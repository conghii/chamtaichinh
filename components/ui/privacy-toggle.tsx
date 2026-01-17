"use client"

import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { usePrivacy } from "@/components/providers/privacy-provider"

export function PrivacyToggle({ className }: { className?: string }) {
    const { isHidden, togglePrivacy } = usePrivacy()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacy}
            className={className}
            title={isHidden ? "Hiện số tiền" : "Ẩn số tiền"}
        >
            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
    )
}
