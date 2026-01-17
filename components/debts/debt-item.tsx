"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Undo } from "lucide-react"
import { updateDebtStatus, deleteDebt } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { SettleDebtDialog } from "./settle-debt-dialog"

export function DebtItem({ debt, accounts, categories }: { debt: any, accounts: any[], categories: any[] }) {
    const [loading, setLoading] = useState(false)
    const [openSettle, setOpenSettle] = useState(false)
    const router = useRouter()

    const handleUpdate = async (status: string) => {
        if (!confirm("Xác nhận thay đổi trạng thái?")) return
        setLoading(true)
        await updateDebtStatus(debt.id, status)
        router.refresh()
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm("Xác nhận xóa khoản này vĩnh viễn?")) return
        setLoading(true)

        await deleteDebt(debt.id)
        router.refresh()
        setLoading(false)
    }

    const isPaid = debt.status === 'PAID'
    const isReceivable = debt.type === 'RECEIVABLE'

    return (
        <Card className={cn(
            "rounded-2xl border-0 shadow-sm transition-all hover:shadow-md mb-3",
            isPaid ? "opacity-60 bg-slate-50" : "bg-white"
        )}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h3 className={cn("font-bold text-lg", isPaid && "line-through text-slate-400")}>
                        {debt.name}
                    </h3>
                    <p className={cn(
                        "font-bold text-xl",
                        isPaid ? "text-slate-400" : (isReceivable ? "text-emerald-600" : "text-rose-600")
                    )}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(debt.amount))}
                    </p>
                    {debt.note && <p className="text-sm text-slate-400 mt-1">{debt.note}</p>}
                </div>

                <div className="flex gap-2">
                    {!isPaid ? (
                        <Dialog open={openSettle} onOpenChange={setOpenSettle}>
                            <DialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                    title="Đánh dấu đã xong"
                                >
                                    <Check className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <SettleDebtDialog debt={debt} accounts={accounts} categories={categories} onOpenChange={setOpenSettle} />
                        </Dialog>
                    ) : (
                        <Button
                            size="icon"
                            variant="outline"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl"
                            title="Hoàn tác"
                            onClick={() => handleUpdate('PENDING')}
                            disabled={loading}
                        >
                            <Undo className="w-5 h-5" />
                        </Button>
                    )}

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        title="Xóa"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
