'use client'

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Building2, User, Wallet, ArrowRight, Zap, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createTransaction } from "@/app/actions"

interface Account {
    id: string | number
    name: string
    current_balance: number
}

interface Category {
    id: string | number
    name: string
    type: string
    owner_tag: string
}

interface Template {
    id: number
    name: string
    amount: number
    category_id: number
    owner: string
    note?: string
}

interface AddTransactionDialogProps {
    accounts: Account[]
    categories: Category[]
    templates?: Template[]
    children?: React.ReactNode
    initialData?: any // For Duplicate
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddTransactionDialog({ accounts, categories, templates = [], children, initialData, open: externalOpen, onOpenChange: externalOnOpenChange }: AddTransactionDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen

    const onOpenChange = (v: boolean) => {
        if (externalOnOpenChange) externalOnOpenChange(v)
        setInternalOpen(v)
    }

    const [date, setDate] = useState<Date | undefined>(new Date())

    // Form State
    const [amount, setAmount] = useState("")
    const [destAccountId, setDestAccountId] = useState<string>("")
    const [transactionType, setTransactionType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE")
    const [owner, setOwner] = useState<"PERSONAL" | "COMPANY">("PERSONAL")
    const [accountId, setAccountId] = useState<string>("")
    const [categoryId, setCategoryId] = useState<string>("")
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    // Pre-fill effect
    useEffect(() => {
        if (isOpen && initialData) {
            setAmount(String(initialData.amount || ""))
            setDate(initialData.date ? new Date(initialData.date) : new Date())
            setTransactionType(initialData.transaction_type || "EXPENSE")
            setOwner(initialData.owner || "PERSONAL")

            // Handle Account mapping (Name to ID is risky, try matching ID first if available, else Name)
            // initialData from TransactionHistory might imply different shape. 
            // Assuming initialData has IDs if possible, or we might need to map.
            // But TransactionHistory has proper shape now? No, it has names.
            // We need to pass raw IDs or match by name.

            // Try to match Account by Name if ID missing
            if (initialData.account_name) {
                const acc = accounts.find(a => a.name === initialData.account_name)
                if (acc) setAccountId(String(acc.id))
            } else if (initialData.account_id) {
                setAccountId(String(initialData.account_id))
            }

            // Category
            if (initialData.category_name) {
                const cat = categories.find(c => c.name === initialData.category_name)
                if (cat) setCategoryId(String(cat.id))
            } else if (initialData.category_id) {
                setCategoryId(String(initialData.category_id))
            }

            setNote(initialData.note || "")
        } else if (isOpen && !initialData) {
            // Reset if opening normally? 
            // Maybe not needed if unmounts. But keep safe.
        }
    }, [isOpen, initialData, accounts, categories])

    const handleSelectTemplate = (t: Template) => {
        setAmount(t.amount.toString())
        setCategoryId(String(t.category_id))
        setOwner(t.owner as any)
        setNote(t.note || t.name)
        // Auto select type based on template category if possible, or default Expense
        // Determine type from category
        const cat = categories.find(c => String(c.id) === String(t.category_id))
        if (cat) {
            setTransactionType(cat.type as any)
        }
        // Account? Template schema doesn't have it, keep default or select if needed.
    }

    // Filter Categories
    const filteredCategories = categories.filter(
        (c) => c.type === transactionType && c.owner_tag === owner
    )

    const handleSubmit = async () => {
        if (!amount || !date) {
            alert("Vui lòng nhập số tiền và ngày")
            return
        }

        if (transactionType === 'TRANSFER') {
            if (!accountId || !destAccountId) {
                alert("Vui lòng chọn ví nguồn và ví đích")
                return
            }
            if (accountId === destAccountId) {
                alert("Ví nguồn và đích phải khác nhau")
                return
            }
        } else {
            if (!accountId || !categoryId) {
                alert("Vui lòng chọn Ví và Hạng mục")
                return
            }
        }

        // Validate Balance
        const rawAmount = Number(amount.replace(/,/g, ""))
        const selectedAccount = accounts.find(a => String(a.id) === accountId)

        if (transactionType !== 'INCOME' && selectedAccount) {
            if (rawAmount > selectedAccount.current_balance) {
                alert(`Số dư ví ${selectedAccount.name} không đủ (${new Intl.NumberFormat('vi-VN').format(selectedAccount.current_balance)}đ)`)
                return
            }
        }

        setLoading(true)
        const formData = new FormData()
        formData.append("amount", amount.replace(/,/g, ""))
        formData.append("date", date.toISOString())
        formData.append("type", transactionType)
        formData.append("owner", owner)
        formData.append("accountId", accountId)

        // Pass Names for easier display in note
        const sourceAcc = accounts.find(a => String(a.id) === accountId)
        if (sourceAcc) formData.append("sourceAccountName", sourceAcc.name)

        if (transactionType === 'TRANSFER') {
            formData.append("destAccountId", destAccountId)
            const destAcc = accounts.find(a => String(a.id) === destAccountId)
            if (destAcc) formData.append("destAccountName", destAcc.name)
        } else {
            formData.append("categoryId", categoryId)
        }

        formData.append("note", note)

        const res = await createTransaction(formData)
        setLoading(false)

        if (res.success) {
            onOpenChange(false)
            setAmount("")
            setNote("")
            setCategoryId("")
            setDestAccountId("")
        } else {
            alert("Lỗi: " + res.error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="lg" className="h-24 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-3xl flex flex-col items-center justify-center gap-2 border-none">
                        <Plus className="w-8 h-8" />
                        <span className="font-semibold">Thêm Giao Dịch Mới</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[480px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl [&>button:last-child]:hidden">

                {/* Header Area */}
                <div className={cn(
                    "p-4 pb-6 md:pb-8 text-white transition-colors duration-500 relative overflow-hidden",
                    transactionType === 'EXPENSE' ? "bg-gradient-to-br from-rose-500 to-pink-600" :
                        transactionType === 'INCOME' ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                            "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />


                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-center text-lg font-medium opacity-90">
                            {transactionType === 'EXPENSE' ? 'Chi Tiền' :
                                transactionType === 'INCOME' ? 'Thu Tiền' : 'Chuyển Tiền'}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Header Actions (Template & Close) */}
                    <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                        {templates && templates.length > 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm group">
                                        <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-[200px] p-2 bg-white rounded-xl shadow-xl">
                                    <p className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase">Chọn mẫu có sẵn</p>
                                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleSelectTemplate(t)}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between group"
                                            >
                                                <span>{t.name}</span>
                                                <span className="text-xs text-slate-400 group-hover:text-indigo-500">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm group"
                        >
                            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="mt-4 md:mt-6 flex justify-center relative z-10">
                        <div className="relative flex items-baseline justify-center gap-1 group">
                            <Input
                                type="number"
                                placeholder="0"
                                className="w-[260px] text-4xl md:text-5xl font-bold text-center h-16 md:h-20 border-none bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                            <span className="text-xl md:text-2xl font-light opacity-60 absolute right-4 top-3 md:top-4 pointer-events-none">
                                ₫
                            </span>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full group-hover:w-40 transition-all duration-500" />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="EXPENSE" className="w-full" onValueChange={(v) => setTransactionType(v as any)}>
                    {/* Custom Tabs overlaid on header */}
                    <div className="px-4 md:px-5 -mt-6">
                        <TabsList className="grid w-full grid-cols-3 h-10 bg-white shadow-lg rounded-xl p-1">
                            <TabsTrigger value="EXPENSE" className="rounded-lg text-xs data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 font-medium">
                                Chi Tiền
                            </TabsTrigger>
                            <TabsTrigger value="INCOME" className="rounded-lg text-xs data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 font-medium">
                                Thu Tiền
                            </TabsTrigger>
                            <TabsTrigger value="TRANSFER" className="rounded-lg text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-medium">
                                Chuyển Tiền
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        {/* Owner Toggle */}
                        <div className="space-y-3">
                            <Label className="text-slate-500 uppercase text-xs font-bold tracking-wider ml-1">Giao dịch dành cho</Label>
                            <RadioGroup
                                defaultValue="PERSONAL"
                                value={owner}
                                className="grid grid-cols-2 gap-3 md:gap-4"
                                onValueChange={(v) => {
                                    setOwner(v as any)
                                    setCategoryId("")
                                }}
                            >
                                <div className="relative">
                                    <RadioGroupItem value="PERSONAL" id="personal" className="sr-only" />
                                    <Label
                                        htmlFor="personal"
                                        className={cn(
                                            "flex flex-row md:flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:bg-slate-50 gap-2",
                                            owner === "PERSONAL" ? "border-indigo-500 bg-indigo-50/50 text-indigo-700" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <User className={cn("w-5 h-5 md:w-6 md:h-6", owner === "PERSONAL" ? "text-indigo-600" : "text-slate-400")} />
                                        <span className="font-semibold text-sm">Cá nhân</span>
                                    </Label>
                                </div>

                                <div className="relative">
                                    <RadioGroupItem value="COMPANY" id="company" className="sr-only" />
                                    <Label
                                        htmlFor="company"
                                        className={cn(
                                            "flex flex-row md:flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:bg-slate-50 gap-2",
                                            owner === "COMPANY" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <Building2 className={cn("w-5 h-5 md:w-6 md:h-6", owner === "COMPANY" ? "text-blue-600" : "text-slate-400")} />
                                        <span className="font-semibold text-sm">Công ty</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>


                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Account Selection Logic */}
                            {transactionType === 'TRANSFER' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Từ ví (Nguồn)</Label>
                                        <Select onValueChange={setAccountId} value={accountId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Chọn ví nguồn" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                                        {acc.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(acc.current_balance))})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Đến ví (Đích)</Label>
                                        <Select onValueChange={setDestAccountId} value={destAccountId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Chọn ví đích" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.filter(a => String(a.id) !== accountId).map(acc => (
                                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                                        {acc.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(acc.current_balance))})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Từ ví / account</Label>
                                        <Select onValueChange={setAccountId} value={accountId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Chọn nguồn tiền" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                                        {acc.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(acc.current_balance))})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Hạng mục</Label>
                                        <Select onValueChange={setCategoryId} value={categoryId}>
                                            <SelectTrigger className={cn("h-12 rounded-xl bg-slate-50 border-slate-200", !categoryId && "border-rose-300 ring-2 ring-rose-100")}>
                                                <SelectValue placeholder="Chọn hạng mục" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {filteredCategories.length === 0 ? (
                                                    <div className="p-2 text-sm text-slate-500">Chưa có hạng mục</div>
                                                ) : (
                                                    filteredCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Date & Note */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Ngày</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-12 rounded-xl bg-slate-50 border-slate-200",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "P") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider ml-1">Ghi chú</Label>
                                <Input
                                    placeholder="Nội dung giao dịch..."
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={handleSubmit} className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-200 mt-2" disabled={loading}>
                            {loading ? "Đang xử lý..." : (
                                <span className="flex items-center gap-2">
                                    Lưu Giao Dịch <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </div>

                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
