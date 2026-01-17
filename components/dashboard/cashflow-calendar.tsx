"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { AddRecurringDialog } from "@/components/calendar/add-recurring-dialog"
import { Button } from "@/components/ui/button"
import { deleteRecurringTransaction } from "@/app/actions"
import { useRouter } from "next/navigation"

interface RecurringTransaction {
    id: number
    description: string
    amount: number
    day_of_month: number
    type: string // INCOME, EXPENSE
}

export function CashFlowCalendar({ recurring }: { recurring: RecurringTransaction[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const router = useRouter()

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const getEventsForDay = (day: Date) => {
        const dayNum = day.getDate()
        return recurring.filter(r => r.day_of_month === dayNum)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa mục này?")) return
        await deleteRecurringTransaction(String(id))
        router.refresh()
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 h-full">
            {/* Calendar Section - Takes 2/3 */}
            <Card className="lg:col-span-2 border-0 shadow-lg rounded-3xl bg-white h-fit">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                        <span className="capitalize">{format(currentMonth, 'MMMM yyyy', { locale: vi })}</span>
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                            <div key={d} className="text-[10px] uppercase tracking-wider font-bold text-center text-slate-400 py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {daysInMonth.map((day, i) => {
                            const events = getEventsForDay(day)
                            const hasIncome = events.some(e => e.type === 'INCOME')
                            const hasExpense = events.some(e => e.type === 'EXPENSE')
                            const isSelected = isToday(day)

                            return (
                                <div key={i} className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-start pt-2 relative group border transition-all cursor-pointer min-h-[60px]",
                                    isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200"
                                )}>
                                    <span className={cn("text-xs font-bold mb-1", isSelected ? "text-indigo-600" : "text-slate-600")}>
                                        {day.getDate()}
                                    </span>

                                    {/* Indicators */}
                                    <div className="flex flex-col gap-0.5 w-full px-1">
                                        {hasIncome && <div className="h-1 w-full bg-emerald-400 rounded-full" />}
                                        {hasExpense && <div className="h-1 w-full bg-rose-400 rounded-full" />}
                                    </div>

                                    {/* Hover Tooltip */}
                                    {events.length > 0 && (
                                        <div className="absolute top-full mt-1 z-50 hidden group-hover:block w-32 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl">
                                            {events.map((e, idx) => (
                                                <div key={idx} className="flex justify-between mb-1">
                                                    <span className="truncate w-16">{e.description}</span>
                                                    <span className={e.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(e.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* List Section - Takes 1/3 */}
            <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-3xl bg-white h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                        <CardTitle className="text-base font-bold text-slate-800">Mục định kỳ</CardTitle>
                        <AddRecurringDialog />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3 max-h-[500px] overflow-y-auto">
                        {recurring.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu</p>
                        )}
                        {recurring.sort((a, b) => a.day_of_month - b.day_of_month).map((r) => (
                            <div key={r.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm",
                                        r.type === 'INCOME' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                    )}>
                                        {r.day_of_month}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-700">{r.description}</p>
                                        <p className={cn("text-xs font-medium", r.type === 'INCOME' ? "text-emerald-500" : "text-rose-500")}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.amount)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => handleDelete(r.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Summary Box */}
                <Card className="border-0 shadow-sm rounded-3xl bg-indigo-50/50">
                    <CardContent className="p-4">
                        <h4 className="font-bold text-indigo-900 mb-2 text-sm">Tổng quan tháng</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Dự kiến thu:</span>
                                <span className="font-bold text-emerald-600">
                                    +{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(
                                        recurring.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Dự kiến chi:</span>
                                <span className="font-bold text-rose-600">
                                    -{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(
                                        recurring.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
