"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { updateCategoryAction, deleteCategoryAction } from "@/app/actions"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
    id: string
    name: string
    type: string
    owner_tag: string
}

export function CategoryItem({ category }: { category: Category }) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(category.name)
    const [type, setType] = useState(category.type)
    const [owner, setOwner] = useState(category.owner_tag)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdate = async () => {
        setIsLoading(true)
        const res = await updateCategoryAction(category.id, name, type, owner)
        setIsLoading(false)
        if (res.success) {
            setIsEditing(false)
        } else {
            alert("Failed to update")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa hạng mục này không?")) return
        const res = await deleteCategoryAction(category.id)
        if (!res.success) alert("Failed to delete")
    }

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-3 animate-in fade-in">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-lg flex-1"
                    autoFocus
                />
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[120px] h-10 rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Chi Tiêu</SelectItem>
                        <SelectItem value="INCOME">Thu Nhập</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger className="w-[120px] h-10 rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PERSONAL">Cá Nhân</SelectItem>
                        <SelectItem value="COMPANY">Công Ty</SelectItem>
                    </SelectContent>
                </Select>
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 group justify-between">
            <div className="flex items-center gap-3 flex-1">
                <div className={cn("w-2 h-10 rounded-full shrink-0",
                    category.type === 'EXPENSE'
                        ? (category.owner_tag === 'PERSONAL' ? "bg-indigo-400" : "bg-blue-400")
                        : (category.owner_tag === 'PERSONAL' ? "bg-emerald-400" : "bg-teal-400")
                )} />
                <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                        {category.name}
                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600" onClick={() => setIsEditing(true)}>
                            <Pencil className="w-3 h-3" />
                        </Button>
                    </p>
                    <p className="text-xs text-slate-400 uppercase font-bold">{category.owner_tag === 'PERSONAL' ? 'Cá nhân' : 'Công ty'}</p>
                </div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
