"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus } from "lucide-react"
import { createRecurringTransaction } from "@/app/actions"
import { useRouter } from "next/navigation"

export function AddRecurringDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("EXPENSE")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append("type", type)

        const res = await createRecurringTransaction(formData)
        if (res.success) {
            setOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Plus className="w-4 h-4" /> Thêm mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm mục định kỳ</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="EXPENSE" className="w-full" onValueChange={setType}>
                    <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
                        <TabsTrigger value="EXPENSE" className="rounded-lg data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700">Chi phí (Hóa đơn, v.v)</TabsTrigger>
                        <TabsTrigger value="INCOME" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Thu nhập (Lương, v.v)</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Tên mục</Label>
                            <Input id="description" name="description" placeholder="Ví dụ: Tiền nhà, Tiền điện..." required className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Số tiền dự kiến</Label>
                            <Input id="amount" name="amount" type="number" required className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="day_of_month">Ngày trong tháng (1-31)</Label>
                            <Select name="day_of_month" required defaultValue="1">
                                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50">
                                    <SelectValue placeholder="Chọn ngày" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <SelectItem key={day} value={String(day)}>Ngày {day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full rounded-xl"
                            variant={type === 'EXPENSE' ? 'destructive' : 'default'}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thiết lập
                        </Button>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
