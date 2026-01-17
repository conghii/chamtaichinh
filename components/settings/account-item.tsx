"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Pencil, Trash2, Check, X } from "lucide-react"
import { updateAccountAction, deleteAccountAction } from "@/app/actions"
import { cn } from "@/lib/utils"

interface Account {
    id: string
    name: string
    current_balance: number
    created_at: string
}

export function AccountItem({ account, index }: { account: Account, index: number }) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(account.name)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdate = async () => {
        setIsLoading(true)
        const res = await updateAccountAction(account.id, name)
        setIsLoading(false)
        if (res.success) {
            setIsEditing(false)
        } else {
            alert("Failed to update")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa ví này không?")) return
        const res = await deleteAccountAction(account.id)
        if (!res.success) alert("Failed to delete")
    }

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4 animate-in fade-in">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-lg flex-1"
                    autoFocus
                />
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={handleUpdate} disabled={isLoading}>
                        <Check className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => setIsEditing(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                    {account.name}
                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                </h3>
                <p className="text-slate-400 text-sm">Đã tạo: {new Date(account.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="text-right flex items-center gap-4">
                <p className="font-bold text-indigo-600 text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(account.current_balance))}
                </p>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
