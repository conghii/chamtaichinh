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
        <Card className={`border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl flex flex-col h-[400px] overflow-hidden ${className}`}>
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
                <div className="space-y-2 p-1">
                    {filteredTransactions.length === 0 ? (
                        <p className="text-center text-slate-500 py-8 text-sm">
                            Không tìm thấy giao dịch nào
                        </p>
                    ) : (
                        filteredTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all group shadow-sm mb-2 last:mb-0 border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <div className={cn(
                                        "w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-colors shadow-sm",
                                        t.transaction_type === 'INCOME' ? "bg-emerald-50 text-emerald-600" :
                                            t.transaction_type === 'EXPENSE' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {getCategoryIcon(t.category_name, t.transaction_type)}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
                                        <div className="flex items-center">
                                            <p className="font-semibold text-slate-700 text-sm truncate">{t.category_name}</p>
                                        </div>

                                        {t.note ? (
                                            <p className="text-xs text-slate-500 truncate w-full opacity-80">
                                                {t.note}
                                            </p>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 opacity-60 italic">Không có ghi chú</p>
                                        )}

                                        <div className="flex items-center text-[10px] text-slate-400 gap-1.5 mt-0.5">
                                            <span className="font-medium text-slate-500 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wide">
                                                {new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                            <span className="truncate">{t.account_name.replace('Tra từ ', '').replace('Nạp vào ', '')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end pl-2 gap-1">
                                    <span className={cn(
                                        "font-bold text-sm md:text-base whitespace-nowrap tracking-tight",
                                        t.transaction_type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {t.transaction_type === 'EXPENSE' ? '-' : '+'}<PriceDisplay value={t.amount} />
                                    </span>
                                    <span className={cn(
                                        "text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                                        t.owner === 'PERSONAL'
                                            ? "bg-purple-50 text-purple-600"
                                            : "bg-blue-50 text-blue-600"
                                    )}>
                                        {t.owner === 'PERSONAL' ? 'Cá nhân' : 'Công ty'}
                                    </span>
                                    {onDuplicate && (
                                        <button
                                            onClick={() => onDuplicate(t)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-slate-800 text-white rounded-xl shadow-lg transition-all z-20 hover:scale-105 active:scale-95"
                                            title="Sao chép"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
