"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    ArrowUpRight, ArrowDownLeft, ArrowRightLeft,
    Coffee, ShoppingCart, Utensils, Car, Home, Zap, Clapperboard, Gift, Briefcase, RefreshCw,
    Filter, Calendar as CalendarIcon
} from "lucide-react"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/ui/price-display"
import { Search, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Transaction {
    id: string
    amount: number
    date: Date | string
    note: string
    transaction_type: string
    account_name: string
    category_name: string
    owner: string
}

const getCategoryIcon = (name: string, type: string) => {
    const n = name.toLowerCase()
    if (n.includes('chuyển khoản')) {
        return type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> : (type === 'TRANSFER' ? <ArrowRightLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />)
    }
    if (n.includes('ăn') || n.includes('uống') || n.includes('cafe')) return <Coffee className="w-5 h-5" />
    if (n.includes('mua') || n.includes('sắm') || n.includes('siêu thị')) return <ShoppingCart className="w-5 h-5" />
    if (n.includes('xe') || n.includes('xăng') || n.includes('đi lại')) return <Car className="w-5 h-5" />
    if (n.includes('nhà') || n.includes('điện') || n.includes('nước')) return <Home className="w-5 h-5" />
    if (n.includes('giải trí') || n.includes('phim')) return <Clapperboard className="w-5 h-5" />
    if (n.includes('lương') || n.includes('thưởng')) return <Briefcase className="w-5 h-5" />
    return <Zap className="w-5 h-5" /> // Default
}

export function TransactionHistory({ transactions, onDuplicate, className }: { transactions: Transaction[], onDuplicate?: (t: Transaction) => void, className?: string }) {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)) // YYYY-MM
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
    const [searchTerm, setSearchTerm] = useState("")

    // Get unique categories for filter
    const uniqueCategories = useMemo(() => {
        return Array.from(new Set(transactions.map(t => t.category_name))).sort()
    }, [transactions])

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date).toISOString().slice(0, 7)
            const matchDate = !selectedMonth || tDate === selectedMonth
            const matchCat = selectedCategory === "ALL" || t.category_name === selectedCategory

            const lowerSearch = searchTerm.toLowerCase()
            const matchSearch = !searchTerm ||
                t.note?.toLowerCase().includes(lowerSearch) ||
                t.category_name.toLowerCase().includes(lowerSearch) ||
                t.amount.toString().includes(lowerSearch)

            return matchDate && matchCat && matchSearch
        })
    }, [transactions, selectedMonth, selectedCategory])

    // Total Calculation
    const { totalIncome, totalExpense, totalNet } = useMemo(() => {
        let income = 0
        let expense = 0

        filteredTransactions.forEach(t => {
            if (t.transaction_type === 'INCOME') income += Number(t.amount)
            else if (t.transaction_type === 'EXPENSE') expense += Number(t.amount)
        })

        return {
            totalIncome: income,
            totalExpense: expense,
            totalNet: income - expense
        }
    }, [filteredTransactions])


    return (
        <Card className={`border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl flex flex-col h-[500px] overflow-hidden ${className}`}>
            <CardHeader className="pb-2 pt-4 px-4 space-y-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Lịch sử giao dịch
                    </CardTitle>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                        {filteredTransactions.length} giao dịch
                    </span>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 w-full">
                        <div className="flex-1">
                            <Input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="text-xs h-10 bg-white border-slate-200 w-full shadow-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-10 text-xs bg-white border-slate-200 shadow-sm">
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                                    {uniqueCategories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm giao dịch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 text-xs h-10 bg-white border-slate-200 shadow-sm w-full"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-emerald-50 rounded-xl p-1.5 md:p-2 border border-emerald-100 flex flex-col items-center">
                        <span className="text-[9px] md:text-[10px] text-emerald-600 font-medium uppercase">Thu</span>
                        <span className="text-[10px] md:text-xs font-bold text-emerald-700 truncate max-w-full">
                            <PriceDisplay value={totalIncome} />
                        </span>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-1.5 md:p-2 border border-rose-100 flex flex-col items-center">
                        <span className="text-[9px] md:text-[10px] text-rose-600 font-medium uppercase">Chi</span>
                        <span className="text-[10px] md:text-xs font-bold text-rose-700 truncate max-w-full">
                            <PriceDisplay value={totalExpense} />
                        </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-1.5 md:p-2 border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] md:text-[10px] text-slate-600 font-medium uppercase">Ròng</span>
                        <span className={cn("text-[10px] md:text-xs font-bold truncate max-w-full", totalNet >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            <PriceDisplay value={totalNet} />
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="space-y-4 p-1">
                    {filteredTransactions.length === 0 ? (
                        <p className="text-center text-slate-500 py-8 text-sm">
                            Không tìm thấy giao dịch nào
                        </p>
                    ) : (
                        Object.entries(
                            filteredTransactions.reduce((groups, t) => {
                                const date = new Date(t.date).toLocaleDateString('en-CA') // YYYY-MM-DD
                                if (!groups[date]) groups[date] = []
                                groups[date].push(t)
                                return groups
                            }, {} as Record<string, Transaction[]>)
                        )
                            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                            .map(([date, transactions]) => (
                                <div key={date} className="space-y-2">
                                    <h3 className="text-xs font-semibold text-slate-500 px-2 sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10 w-fit rounded-lg shadow-sm border border-slate-100/50">
                                        {new Date(date).toLocaleDateString('vi-VN', {
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </h3>
                                    <div className="space-y-2">
                                        {transactions.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all group shadow-sm border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    <div className={cn(
                                                        "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl shrink-0 transition-colors shadow-sm",
                                                        t.transaction_type === 'INCOME' ? "bg-emerald-50 text-emerald-600" :
                                                            t.transaction_type === 'EXPENSE' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {getCategoryIcon(t.category_name, t.transaction_type)}
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center min-w-0 gap-0.5">
                                                        <div className="flex items-center justify-between pr-2">
                                                            <p className="font-bold text-slate-700 text-sm truncate">{t.category_name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {t.note ? (
                                                                <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px] opacity-90">
                                                                    {t.note}
                                                                </p>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 italic">Không ghi chú</span>
                                                            )}
                                                            <span className="text-[10px] text-slate-300">•</span>
                                                            <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                                                                {t.account_name.replace('Tra từ ', '').replace('Nạp vào ', '')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end pl-2 gap-0.5">
                                                    <span className={cn(
                                                        "font-bold text-sm md:text-base whitespace-nowrap tracking-tight",
                                                        t.transaction_type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {t.transaction_type === 'EXPENSE' ? '-' : '+'}<PriceDisplay value={t.amount} />
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className={cn(
                                                            "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                                            t.owner === 'PERSONAL'
                                                                ? "bg-purple-50 text-purple-600 border-purple-100"
                                                                : "bg-blue-50 text-blue-600 border-blue-100"
                                                        )}>
                                                            {t.owner === 'PERSONAL' ? 'CN' : 'CTY'}
                                                        </span>
                                                        {onDuplicate && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onDuplicate(t)
                                                                }}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
