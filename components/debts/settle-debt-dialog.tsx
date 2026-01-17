"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Loader2 } from "lucide-react"
import { settleDebt } from "@/app/actions"
import { useRouter } from "next/navigation"

// Need to fetch accounts and categories. 
// Since this is a client component, we might need to pass them as props or fetch via API.
// For simplicity, passing as props is best, but DebtItem is deep.
// I will create a server action to get accounts/categories or use existing `getAccounts` if it was exposed?
// `getAccounts` is in `lib/sheets`, server-side.
// I'll assume we can't easily pass props to every DebtItem without refactoring page.
// USE COMPROMISE: Retrieve them via a small client-side fetch or create a wrapper component.
// OR: Just fetch in `DebtPage` and pass down.
// Refactoring `DebtPage` is safe.

// Let's assume we update `DebtPage` to fetch accounts/categories and pass to `DebtItem`.
// This file will export the Dialog.

export function SettleDebtDialog({
    debt,
    accounts,
    categories,
    onOpenChange
}: {
    debt: any,
    accounts: any[],
    categories: any[],
    onOpenChange: (open: boolean) => void
}) {
    const [loading, setLoading] = useState(false)
    const [accountId, setAccountId] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const router = useRouter()

    const isReceivable = debt.type === 'RECEIVABLE'
    const filteredCategories = categories.filter(c => c.type === (isReceivable ? 'INCOME' : 'EXPENSE'))

    const handleSettle = async () => {
        if (!accountId || !categoryId) return alert("Vui lòng chọn ví và danh mục")

        setLoading(true)
        const res = await settleDebt(debt.id, accountId, categoryId, date)
        if (res.success) {
            onOpenChange(false)
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    return (
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
                <DialogTitle>Xác nhận thanh toán: {debt.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Số tiền xử lý</p>
                    <p className={cn("text-xl font-bold", isReceivable ? "text-emerald-600" : "text-rose-600")}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(debt.amount))}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Chọn Ví (Giao dịch)</Label>
                    <Select onValueChange={setAccountId} required>
                        <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Chọn ví tiền..." />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => (
                                <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} ({new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(Number(acc.current_balance))})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Danh mục (Phân loại)</Label>
                    <Select onValueChange={setCategoryId} required>
                        <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Chọn danh mục..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {filteredCategories.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Ngày thực hiện</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border-slate-200 bg-slate-50" />
                </div>

                <Button onClick={handleSettle} disabled={loading} className="w-full rounded-xl" variant={isReceivable ? 'default' : 'destructive'}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Xác nhận hoàn tất
                </Button>
            </div>
        </DialogContent>
    )
}

import { cn } from "@/lib/utils"
