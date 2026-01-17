"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Settings2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateBudgetAction } from "@/app/actions"
import { PriceDisplay } from "@/components/ui/price-display"
import { cn } from "@/lib/utils"

interface BudgetOverviewProps {
    budgets: any[]
    transactions: any[]
    categories: any[]
}

export function BudgetOverview({ budgets, transactions, categories }: BudgetOverviewProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [selectedCatId, setSelectedCatId] = useState("")
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)

    // Calculate Spending per Category for Current Month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const spendingMap = new Map<string, number>()
    transactions.forEach(t => {
        const tMonth = t.date.slice(0, 7)
        if (tMonth === currentMonth && t.transaction_type === 'EXPENSE') {
            const current = spendingMap.get(t.category_id) || 0
            spendingMap.set(t.category_id, current + Number(t.amount))
        }
    })

    const budgetItems = budgets.map(b => {
        const spent = spendingMap.get(b.category_id) || 0
        const percentage = Math.min((spent / b.amount) * 100, 100)
        const category = categories.find(c => String(c.id) === String(b.category_id))
        const isOver = spent > b.amount

        return {
            ...b,
            categoryName: category ? category.name : 'Unknown',
            spent,
            percentage,
            isOver
        }
    })

    const handleSaveBudget = async () => {
        if (!selectedCatId || !amount) return
        setLoading(true)
        const formData = new FormData()
        formData.append("categoryId", selectedCatId)
        formData.append("amount", amount.replace(/,/g, ""))

        await updateBudgetAction(formData)
        setLoading(false)
        setIsSettingsOpen(false)
        setAmount("")
        setSelectedCatId("")
    }

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Ngân Sách Chi Tiêu
                </CardTitle>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                            <Settings2 className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thiết lập hạn mức</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Danh mục</Label>
                                <Select onValueChange={setSelectedCatId} value={selectedCatId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.filter(c => c.type === 'EXPENSE').map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hạn mức (tháng)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSaveBudget} disabled={loading} className="w-full">
                                {loading ? "Đang lưu..." : "Lưu thiết lập"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {budgetItems.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">Chưa thiết lập ngân sách</p>
                ) : (
                    budgetItems.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-700">{item.categoryName}</span>
                                <span className={cn(
                                    item.isOver ? "text-red-500 font-bold" : "text-slate-500"
                                )}>
                                    <PriceDisplay value={item.spent} /> / <PriceDisplay value={item.amount} />
                                </span>
                            </div>
                            <Progress
                                value={item.percentage}
                                className="h-2"
                                indicatorClassName={cn(
                                    item.percentage > 100 ? "bg-red-500" :
                                        item.percentage > 80 ? "bg-amber-400" : "bg-emerald-500"
                                )}
                            />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
