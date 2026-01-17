'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { createTemplate } from "@/app/actions"
import { cn } from "@/lib/utils"

interface Category {
    id: string | number
    name: string
    type: string
    owner_tag: string
}

interface CreateTemplateDialogProps {
    categories: Category[]
    children?: React.ReactNode
    onSuccess?: () => void
}

export function CreateTemplateDialog({ categories, children, onSuccess }: CreateTemplateDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [owner, setOwner] = useState<"PERSONAL" | "COMPANY">("PERSONAL")

    // Filter categories based on owner
    // Note: Templates usually are for Expenses, but could be Income. 
    // For simplicity, we assume Expense templates mostly or filter by Expense type if needed.
    // Let's verify if we want to support Income templates too. The mockup showed "Tiền mua đồ" which is Expense.
    // We will show all categories that match the owner tag.
    const filteredCategories = categories.filter(c => c.owner_tag === owner)

    const handleSubmit = async () => {
        if (!name || !amount || !categoryId) {
            alert("Vui lòng điền đầy đủ thông tin")
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append("name", name)
        formData.append("amount", amount)
        formData.append("categoryId", categoryId)
        formData.append("owner", owner)

        const res = await createTemplate(formData)
        setLoading(false)

        if (res.success) {
            setOpen(false)
            resetForm()
            onSuccess?.()
        } else {
            alert("Lỗi: " + res.error)
        }
    }

    const resetForm = () => {
        setName("")
        setAmount("")
        setCategoryId("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo mẫu mới
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white rounded-3xl">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800">Tạo Mẫu Mới</DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">Tạo nút tắt cho các giao dịch thường xuyên</p>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label>Tên mẫu (VD: Ăn sáng)</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên mẫu..."
                            className="h-12 rounded-xl bg-slate-50 border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Số tiền mặc định</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="30000"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Danh mục</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[250px]">
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name} ({cat.type === 'EXPENSE' ? 'Chi' : 'Thu'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full h-12 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 mt-4"
                        disabled={loading}
                    >
                        {loading ? "Đang tạo..." : "Tạo Mẫu"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
