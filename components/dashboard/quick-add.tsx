"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coffee, ShoppingCart, Car, Zap, Plus, Loader2 } from "lucide-react"
import { createTransaction } from "@/app/actions"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTemplateDialog } from "@/components/transactions/create-template-dialog"
import { useRouter } from "next/navigation"

interface Template {
    id: number
    name: string
    amount: number
    note?: string
    category_id: number
    owner: string
    category?: { name: string }
}

// Map icons roughly based on name
const getIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('cafe') || n.includes('cà phê') || n.includes('ăn')) return <Coffee className="w-5 h-5" />
    if (n.includes('siêu thị') || n.includes('mua')) return <ShoppingCart className="w-5 h-5" />
    if (n.includes('xe') || n.includes('xăng')) return <Car className="w-5 h-5" />
    return <Zap className="w-5 h-5" />
}

export function QuickAddWidget({ templates, accounts, categories }: { templates: Template[], accounts: any[], categories?: any[] }) {
    const router = useRouter()
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [loading, setLoading] = useState(false)

    // Form States
    const [amount, setAmount] = useState<string>("")
    const [note, setNote] = useState<string>("")
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
    const [selectedAccountId, setSelectedAccountId] = useState<string>("")

    const handleTemplateClick = (t: Template) => {
        setSelectedTemplate(t)
        setAmount(t.amount.toString())
        setNote(t.note || t.name)

        // Smart Category Pre-selection
        let targetId = categories?.find((c: any) => c.name === t.category?.name)?.id
        if (!targetId) {
            const tName = t.name.toLowerCase()
            if (tName.includes('cafe') || tName.includes('ăn')) {
                targetId = categories?.find((c: any) => c.name === 'Ăn uống')?.id
            } else if (tName.includes('xe') || tName.includes('xăng')) {
                targetId = categories?.find((c: any) => c.name === 'Đi lại' || c.name === 'Xe cộ' || c.name === 'Di chuyển' || c.name.includes('xe'))?.id
            } else if (tName.includes('mkt')) {
                targetId = categories?.find((c: any) => c.name === 'MKT')?.id
            }
        }
        if (!targetId) targetId = t.category_id

        setSelectedCategoryId(String(targetId || ""))

        // Smart Account Matching (Moved here from confirm handler)
        let targetAccId = accounts[0]?.id
        const tName = t.name.toLowerCase()
        const cashAcc = accounts.find((a: any) => a.name.toLowerCase().includes('ví') || a.name.toLowerCase().includes('tiền mặt'))
        const bankAcc = accounts.find((a: any) => !a.name.toLowerCase().includes('ví') && !a.name.toLowerCase().includes('tiền mặt'))

        if (tName.includes('cafe') || tName.includes('ăn') || tName.includes('xe') || tName.includes('siêu thị')) {
            if (cashAcc) targetAccId = cashAcc.id
        } else {
            if (bankAcc) targetAccId = bankAcc.id
        }
        setSelectedAccountId(String(targetAccId))
    }

    const handleConfirmQuickAdd = async () => {
        if (!selectedTemplate || !amount) return
        setLoading(true)

        try {
            // Smart Category Matching (Fix for Prisma ID vs Sheet ID mismatch)
            let targetCategoryId = selectedCategoryId

            // Fallback heuristics if somehow empty
            if (!targetCategoryId) {
                targetCategoryId = categories?.find((c: any) => c.name === selectedTemplate.category?.name)?.id?.toString()
            }
            if (!targetCategoryId) {
                targetCategoryId = categories?.find((c: any) => c.type === 'EXPENSE')?.id?.toString()
            }

            // Using state selectedAccountId
            const targetAccountId = selectedAccountId || accounts[0]?.id

            const formData = new FormData()
            formData.append("amount", amount)
            formData.append("date", new Date().toISOString())
            formData.append("type", "EXPENSE")
            formData.append("owner", selectedTemplate.owner || "PERSONAL")
            formData.append("accountId", String(targetAccountId))
            formData.append("categoryId", String(targetCategoryId))
            formData.append("note", note)

            const res = await createTransaction(formData)
            if (res.success) {
                alert(`Đã thêm: ${note}`)
                setSelectedTemplate(null)
            } else {
                alert(res.error)
            }
        } catch (e) {
            alert("Lỗi kết nối")
        } finally {
            setLoading(false)
        }
    }

    const handleSuccessCreate = () => {
        router.refresh()
    }

    if (!templates) return null

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Nhập Nhanh
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateClick(t)}
                            className="flex flex-col items-center gap-2 group min-w-[60px]"
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white transition-all shadow-sm border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:scale-105">
                                <div className="text-slate-600 transition-colors group-hover:text-indigo-600">
                                    {getIcon(t.name)}
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center group-hover:text-indigo-600">
                                {t.name}
                            </span>
                        </button>
                    ))}

                    {/* Add New Template Button */}
                    <CreateTemplateDialog categories={categories || []} onSuccess={handleSuccessCreate}>
                        <button
                            className="flex flex-col items-center gap-2 group min-w-[60px] opacity-60 hover:opacity-100"
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 transition-all group-hover:border-indigo-300 group-hover:bg-indigo-50">
                                <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500">Mới</span>
                        </button>
                    </CreateTemplateDialog>
                </div>

                {/* Confirm Dialog */}
                <Dialog open={!!selectedTemplate} onOpenChange={(v) => !v && setSelectedTemplate(null)}>
                    <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedTemplate && getIcon(selectedTemplate.name)}
                                {selectedTemplate?.name}
                            </DialogTitle>
                            <DialogDescription>Điều chỉnh số tiền và xác nhận</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Số tiền</Label>
                                <Input
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-lg font-bold"
                                    type="number"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Danh mục</Label>
                                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {categories?.filter((c: any) => c.type === 'EXPENSE').map((c: any) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Từ ví/Tài khoản</Label>
                                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn tài khoản" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(acc.current_balance))})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Ghi chú</Label>
                                <Input
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleConfirmQuickAdd} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Xác nhận thêm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
