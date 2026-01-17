"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { PriceDisplay } from "@/components/ui/price-display"

export function AccountsList({ accounts, className, onAccountClick }: { accounts: any[], className?: string, onAccountClick?: (acc: any) => void }) {
    return (
        <div className={cn("grid grid-cols-1 gap-2", className)}>
            {accounts.map((acc: any, index: number) => (
                <Card
                    key={acc.id}
                    onClick={() => onAccountClick?.(acc)}
                    className={cn(
                        "rounded-xl border-white/10 bg-white/10 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all duration-300 group cursor-pointer active:scale-[0.98]",
                        Number(acc.current_balance) < 0 ? "border-l-2 border-l-amber-400" : (index === 0 ? "border-l-2 border-l-blue-400" : "border-l-2 border-l-emerald-400")
                    )}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-3">
                        <CardTitle className="text-[10px] font-medium text-indigo-100 uppercase tracking-wider opacity-80">{acc.name}</CardTitle>
                        <Wallet className={cn("w-3 h-3", Number(acc.current_balance) < 0 ? "text-amber-300" : "text-indigo-200 group-hover:text-white")} />
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className={cn(
                            "text-base font-bold transition-colors",
                            Number(acc.current_balance) < 0 ? "text-amber-300" : "text-white"
                        )}>
                            <PriceDisplay value={Number(acc.current_balance)} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
