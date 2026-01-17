"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Repeat, Trash2, CalendarClock } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRecurringTransaction, deleteRecurringTransaction, checkRecurringTransactions } from "@/app/actions"
import { PriceDisplay } from "@/components/ui/price-display"
import { cn } from "@/lib/utils"

interface RecurringTransactionsProps {
    recurring: any[]
    accounts: any[]
    categories: any[]
}

export function RecurringTransactions({ recurring, accounts, categories }: RecurringTransactionsProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form States
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")
    const [accountId, setAccountId] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [type, setType] = useState("EXPENSE")
    const [frequency, setFrequency] = useState("MONTHLY")
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
    const [owner, setOwner] = useState("PERSONAL")

    // Check for due transactions on mount
    useEffect(() => {
        const check = async () => {
            await checkRecurringTransactions()
        }
        check()
    }, [])

    const handleCreate = async () => {
        if (!amount || !accountId || !categoryId) return
        setLoading(true)
        const formData = new FormData()
        formData.append("amount", amount.replace(/,/g, ""))
        formData.append("note", note)
        formData.append("accountId", accountId)
        formData.append("categoryId", categoryId)
        formData.append("type", type)
        formData.append("frequency", frequency)
        formData.append("startDate", startDate)
        formData.append("owner", owner)

        await createRecurringTransaction(formData)
        setLoading(false)
        setIsAddOpen(false)
        // Reset form
        setAmount("")
        setNote("")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Dừng giao dịch định kỳ này?")) {
            await deleteRecurringTransaction(id)
        }
    }

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Repeat className="w-4 h-4" /> Giao Dịch Định Kỳ
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm Giao Dịch Định Kỳ</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Loại</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
                                            <SelectItem value="INCOME">Thu nhập</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tần suất</Label>
                                    <Select value={frequency} onValueChange={setFrequency}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Hàng ngày</SelectItem>
                                            <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                                            <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                                            <SelectItem value="YEARLY">Hàng năm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Số tiền</Label>
                                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Danh mục</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.filter(c => c.type === type).map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tài khoản</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger><SelectValue placeholder="Chọn tài khoản" /></SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(a => (
                                            <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Ghi chú</Label>
                                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="VD: Tiền nhà, Internet..." />
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày bắt đầu</Label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>

                            <Button onClick={handleCreate} disabled={loading} className="w-full">
                                {loading ? "Đang lưu..." : "Lưu Định Kỳ"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {recurring.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                        <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có giao dịch định kỳ</p>
                    </div>
                ) : (
                    recurring.map((rec) => {
                        const acc = accounts.find(a => String(a.id) === String(rec.account_id))
                        return (
                            <div key={rec.id} className="flex justify-between items-center bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800 text-sm">{rec.note || "Giao dịch"}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                            {rec.frequency === 'MONTHLY' ? 'Tháng' : rec.frequency}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        <PriceDisplay value={rec.amount} /> • {acc?.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        Kỳ tới: {new Date(rec.next_run_date).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:bg-red-50"
                                    onClick={() => handleDelete(rec.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}
