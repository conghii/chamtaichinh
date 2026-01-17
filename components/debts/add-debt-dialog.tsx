"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus } from "lucide-react"

import { createDebt } from "@/app/actions"
import { useRouter } from "next/navigation"

export function AddDebtDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("RECEIVABLE")
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append("type", type)

        const res = await createDebt(formData)
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
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200">
                    <Plus className="w-4 h-4" /> Thêm khoản nợ
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm khoản nợ mới</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="RECEIVABLE" className="w-full" onValueChange={setType}>
                    <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
                        <TabsTrigger value="RECEIVABLE" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Phải Thu (Người ta nợ mình)</TabsTrigger>
                        <TabsTrigger value="PAYABLE" className="rounded-lg data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700">Phải Trả (Mình nợ người ta)</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên người / Đơn vị</Label>
                            <Input id="name" name="name" placeholder="Ví dụ: Anh Nam, Kho sỉ..." required className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Số tiền</Label>
                            <Input id="amount" name="amount" type="number" required className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Ngày ghi nhận</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                className="rounded-xl border-slate-200 bg-slate-50"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="note">Ghi chú</Label>
                            <Textarea id="note" name="note" placeholder="Chi tiết..." className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full rounded-xl"
                            variant={type === 'RECEIVABLE' ? 'default' : 'destructive'}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thông tin
                        </Button>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
