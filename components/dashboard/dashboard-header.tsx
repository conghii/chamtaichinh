"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

export function DashboardHeader() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const view = searchParams.get("view") || "COMBINED"

    const handleViewChange = (newView: string) => {
        router.push(`/?view=${newView}`)
    }

    return (
        <Tabs value={view} onValueChange={handleViewChange} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3 h-10 bg-white/60 backdrop-blur-md">
                <TabsTrigger value="COMBINED" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Tổng hợp</TabsTrigger>
                <TabsTrigger value="PERSONAL" className="text-xs font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white">Cá nhân</TabsTrigger>
                <TabsTrigger value="COMPANY" className="text-xs font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Công ty</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
