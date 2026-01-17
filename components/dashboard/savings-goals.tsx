"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Target, PiggyBank, Trash2 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createGoal, contributeToGoal, deleteGoalAction } from "@/app/actions"
import { PriceDisplay } from "@/components/ui/price-display"
import { cn } from "@/lib/utils"

interface SavingsGoalsProps {
    goals: any[]
    accounts: any[]
}

export function SavingsGoals({ goals, accounts }: SavingsGoalsProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isContributeOpen, setIsContributeOpen] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Form States
    const [name, setName] = useState("")
    const [target, setTarget] = useState("")
    const [deadline, setDeadline] = useState("")

    // Contribution State
    const [contribAmount, setContribAmount] = useState("")
    const [contribAccount, setContribAccount] = useState("")

    const handleCreateGoal = async () => {
        if (!name || !target) return
        setLoading(true)
        const formData = new FormData()
        formData.append("name", name)
        formData.append("target", target.replace(/,/g, ""))
        formData.append("deadline", deadline)

        await createGoal(formData)
        setLoading(false)
        setIsAddOpen(false)
        setName("")
        setTarget("")
        setDeadline("")
    }

    const handleContribute = async () => {
        if (!selectedGoal || !contribAmount || !contribAccount) return
        setLoading(true)
        const formData = new FormData()
        formData.append("goalId", selectedGoal.id)
        formData.append("goalName", selectedGoal.name)
        formData.append("amount", contribAmount.replace(/,/g, ""))
        formData.append("accountId", contribAccount)

        await contributeToGoal(formData)
        setLoading(false)
        setIsContributeOpen(false)
        setContribAmount("")
        setContribAccount("")
        setSelectedGoal(null)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc muốn xóa mục tiêu này?")) {
            await deleteGoalAction(id)
        }
    }

    const openContribute = (goal: any) => {
        setSelectedGoal(goal)
        setIsContributeOpen(true)
    }

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4" /> Hũ Tiết Kiệm
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo Hũ Tiết Kiệm Mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tên mục tiêu</Label>
                                <Input placeholder="Mua xe, Du lịch..." value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Số tiền mục tiêu</Label>
                                <Input type="number" placeholder="50000000" value={target} onChange={e => setTarget(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hạn chót (tùy chọn)</Label>
                                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                            </div>
                            <Button onClick={handleCreateGoal} disabled={loading} className="w-full">
                                {loading ? "Đang tạo..." : "Tạo Mục Tiêu"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {goals.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                        <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có mục tiêu nào</p>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                        return (
                            <div key={goal.id} className="group relative bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-sm">{goal.name}</h4>
                                        <p className="text-xs text-slate-500">
                                            <PriceDisplay value={goal.current_amount} /> / <PriceDisplay value={goal.target_amount} />
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-emerald-600 hover:bg-emerald-50"
                                            onClick={() => openContribute(goal)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-400 hover:bg-red-50"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <Progress value={percentage} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-500" />
                                {goal.deadline && (
                                    <p className="text-[10px] text-slate-400 mt-2 text-right">
                                        Hạn: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        )
                    })
                )}

                {/* Contribution Dialog */}
                <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tích lũy: {selectedGoal?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Số tiền tích lũy</Label>
                                <Input type="number" value={contribAmount} onChange={e => setContribAmount(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Lấy từ tài khoản</Label>
                                <Select onValueChange={setContribAccount} value={contribAccount}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn tài khoản nguồn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.filter(a => a.current_balance > 0).map(a => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {a.name} (<PriceDisplay value={a.current_balance} />)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleContribute} disabled={loading} className="w-full">
                                {loading ? "Đang xử lý..." : "Xác nhận tích lũy"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
