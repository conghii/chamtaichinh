
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, HandCoins } from "lucide-react"
import Link from "next/link"

interface FinancialStatusProps {
    totalWallet: number
    totalReceivable: number
    totalPayable: number
}

export function FinancialStatusWidget({ totalWallet, totalReceivable, totalPayable }: FinancialStatusProps) {
    const netWorth = totalWallet + totalReceivable - totalPayable
    const format = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl border-white/40 overflow-hidden relative">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <HandCoins className="w-4 h-4" />
                    Quản Lý Công Nợ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                    {/* Receivable */}
                    <Link href="/debts?tab=RECEIVABLE">
                        <div className="bg-emerald-50 hover:bg-emerald-100 transition-colors p-4 rounded-2xl border border-emerald-100 flex flex-col gap-1 cursor-pointer group">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <ArrowDownLeft className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Phải Thu</span>
                            </div>
                            <div className="text-lg md:text-xl font-bold text-emerald-700 truncate group-hover:scale-105 transition-transform origin-left">
                                {format(totalReceivable)}
                            </div>
                        </div>
                    </Link>

                    {/* Payable */}
                    <Link href="/debts?tab=PAYABLE">
                        <div className="bg-rose-50 hover:bg-rose-100 transition-colors p-4 rounded-2xl border border-rose-100 flex flex-col gap-1 cursor-pointer group">
                            <div className="flex items-center gap-2 text-rose-600 mb-1">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Phải Trả</span>
                            </div>
                            <div className="text-lg md:text-xl font-bold text-rose-700 truncate group-hover:scale-105 transition-transform origin-left">
                                {format(totalPayable)}
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Net Worth Small Footer */}
                <div className="text-right text-xs text-slate-400 font-medium px-1">
                    Tổng tài sản ròng: <span className="text-slate-600">{format(netWorth)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
