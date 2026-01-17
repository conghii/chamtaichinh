"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { PieChart as PieChartIcon, BarChart2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isSameDay, isSameMonth, isSameYear } from "date-fns"

interface Transaction {
    amount: number
    transaction_type: string
    category_name: string
    owner: string
    date: string // Serialized date from server
}

export function OverviewCharts({ transactions, budgets, className }: { transactions: Transaction[], budgets?: any[], className?: string }) {
    const [timeRange, setTimeRange] = useState<"DAY" | "MONTH" | "YEAR">("MONTH")
    const [chartType, setChartType] = useState<'DONUT' | 'BAR'>('BAR')

    // Filter and Process Data
    const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

    // Filter and Process Data
    const processData = () => {
        const now = new Date()

        const filtered = transactions.filter(t => {
            const isExpense = t.transaction_type === 'EXPENSE'
            const isNotTransfer = !t.category_name.includes('Chuyển khoản') // Exclude internal transfers

            let isTimeMatch = true
            const tDate = new Date(t.date)

            if (timeRange === 'DAY') isTimeMatch = isSameDay(tDate, now)
            else if (timeRange === 'MONTH') isTimeMatch = isSameMonth(tDate, now) && isSameYear(tDate, now)
            else if (timeRange === 'YEAR') isTimeMatch = isSameYear(tDate, now)

            return isExpense && isNotTransfer && isTimeMatch
        })

        if (chartType === 'DONUT') {
            // Group by Category for Donut
            const grouped = filtered.reduce((acc, t) => {
                const key = t.category_name
                if (!acc[key]) acc[key] = 0
                acc[key] += Number(t.amount)
                return acc
            }, {} as Record<string, number>)

            return Object.entries(grouped)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
        } else {
            // Group by Date for Bar Chart (Daily Spending)
            const grouped = filtered.reduce((acc, t) => {
                const dateObj = new Date(t.date)
                const key = `${dateObj.getDate()}/${dateObj.getMonth() + 1}` // Format D/M
                if (!acc[key]) acc[key] = 0
                acc[key] += Number(t.amount)
                return acc
            }, {} as Record<string, number>)

            return Object.entries(grouped)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => {
                    const [d1, m1] = a.name.split('/').map(Number)
                    const [d2, m2] = b.name.split('/').map(Number)
                    return m1 - m2 || d1 - d2
                })
        }
    }

    const data = processData()
    const totalExpense = data.reduce((sum, item) => sum + item.value, 0)
    const maxValue = data.length > 0 ? data[0].value : 0

    return (
        <Card className={`border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl w-full min-h-[350px] flex flex-col ${className}`}>
            <CardHeader className="flex flex-col gap-3 pb-2 pt-4 px-4 sticky top-0 bg-white/0 z-10">
                {/* Top Row: Title + Toggle + Time Filter (Responsive) */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-slate-800">Biểu Đồ Chi Tiêu</CardTitle>
                        {/* Chart Toggle */}
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setChartType('BAR')}
                                className={`p-1.5 rounded-md transition-all ${chartType === 'BAR' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <BarChart2 size={14} />
                            </button>
                            <button
                                onClick={() => setChartType('DONUT')}
                                className={`p-1.5 rounded-md transition-all ${chartType === 'DONUT' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <PieChartIcon size={14} />
                            </button>
                        </div>
                    </div>

                    <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                        <SelectTrigger className="w-[90px] h-7 text-xs bg-white/50 border-slate-200 px-2 rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="DAY">Hôm nay</SelectItem>
                            <SelectItem value="MONTH">Tháng này</SelectItem>
                            <SelectItem value="YEAR">Năm này</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-2 pb-4 overflow-hidden">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1 text-sm h-full w-full">
                        <span>Chưa có dữ liệu</span>
                    </div>
                ) : (
                    <div className="h-[300px] flex flex-col">
                        {chartType === 'DONUT' ? (
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* Left Col: Chart */}
                                <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[200px]">
                                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 w-24">
                                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider line-clamp-1">Tổng Chi</p>
                                        <div className="text-sm font-bold text-slate-800 leading-tight">
                                            {new Intl.NumberFormat('vi-VN', { notation: "compact", maximumFractionDigits: 1 }).format(totalExpense)}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={60}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Right Col: Top 3 List with Budget Progress */}
                                <div className="flex flex-col justify-center gap-3 pr-2">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Top chi tiêu & Ngân sách</p>
                                    {data.slice(0, 3).map((item, index) => {
                                        // Find Budget
                                        const budget = budgets?.find((b: any) => b.category?.name === item.name)
                                        const limit = budget ? Number(budget.amount) : 0
                                        const percent = limit > 0 ? (item.value / limit) * 100 : (item.value / maxValue * 100)

                                        // Determine Color & Alert
                                        let barColor = COLORS[index % COLORS.length]
                                        let alertText = ""

                                        if (limit > 0) {
                                            if (percent > 90) {
                                                barColor = "#ef4444" // Red
                                                alertText = "⚠️ Sắp lố!"
                                            } else if (percent > 80) {
                                                barColor = "#f59e0b" // Amber
                                            } else {
                                                barColor = "#10b981" // Green
                                            }
                                        }

                                        return (
                                            <div key={index} className="flex flex-col gap-1 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: barColor }} />
                                                        <span className="text-xs font-medium text-slate-700 truncate">{item.name}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.value)}
                                                        </span>
                                                        {limit > 0 && (
                                                            <span className="text-[9px] text-slate-400">
                                                                / {new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(limit)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(percent, 100)}%`,
                                                            backgroundColor: barColor
                                                        }}
                                                    />
                                                </div>
                                                {alertText && (
                                                    <span className="text-[9px] text-red-500 font-bold ml-auto">{alertText}</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            // BAR CHART (Full Width)
                            <div className="w-full h-full px-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: '#64748B' }}
                                            dy={10}
                                            interval={0}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: '#64748B' }}
                                            tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9', radius: 4 }}
                                            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
