
import { AddDebtDialog } from "@/components/debts/add-debt-dialog"
import { DebtItem } from "@/components/debts/debt-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"

import { getAccounts, getCategories, getDebts } from "@/lib/sheets"

// Ensure dynamic fetching
export const dynamic = 'force-dynamic'


export default async function DebtPage({ searchParams }: { searchParams: { tab?: string } }) {
    const { tab } = searchParams
    const activeTab = tab || "RECEIVABLE"

    const rawAccounts = await getAccounts()
    const accounts = rawAccounts.map((a: any) => ({
        ...a,
        current_balance: Number(a.current_balance),
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : String(a.created_at),
        updated_at: a.updated_at instanceof Date ? a.updated_at.toISOString() : String(a.updated_at)
    }))

    const rawCategories = await getCategories()
    const categories = rawCategories.map((c: any) => ({
        ...c,
        created_at: c.created_at instanceof Date ? c.created_at.toISOString() : String(c.created_at)
    }))

    const rawDebts = await getDebts()

    const debts = rawDebts.map((d: any) => ({
        ...d,
        amount: Number(d.amount),
        created_at: d.created_at.toISOString()
    }))

    const receivables = debts.filter((d: any) => d.type === 'RECEIVABLE')
    const payables = debts.filter((d: any) => d.type === 'PAYABLE')

    const totalReceivable = receivables
        .filter((d: any) => d.status !== 'PAID')
        .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

    const totalPayable = payables
        .filter((d: any) => d.status !== 'PAID')
        .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 hover:bg-white text-slate-500">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Sổ Ghi Nợ</h1>
                            <p className="text-slate-500 text-sm">Quản lý các khoản vay và nợ</p>
                        </div>
                    </div>
                    <AddDebtDialog />
                </header>


                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-emerald-200">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <p className="text-emerald-100 font-medium text-sm uppercase tracking-wider mb-2">Phải Thu (Họ nợ mình)</p>
                        <p className="text-3xl md:text-4xl font-bold relative z-10">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalReceivable)}
                        </p>
                    </div>
                    <div className="bg-rose-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-rose-200">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <p className="text-rose-100 font-medium text-sm uppercase tracking-wider mb-2">Phải Trả (Mình nợ họ)</p>
                        <p className="text-3xl md:text-4xl font-bold relative z-10">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPayable)}
                        </p>
                    </div>
                </div>

                {/* Tabs & Lists */}
                <Tabs defaultValue={activeTab} className="w-full">
                    <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 mb-6">
                        <TabsTrigger value="RECEIVABLE" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                            Phải Thu ({receivables.length})
                        </TabsTrigger>
                        <TabsTrigger value="PAYABLE" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                            Phải Trả ({payables.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="RECEIVABLE" className="space-y-4">
                        {receivables.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có dữ liệu</p>}
                        {receivables.map((debt: any) => (
                            <DebtItem key={debt.id} debt={debt} accounts={accounts} categories={categories} />
                        ))}
                    </TabsContent>

                    <TabsContent value="PAYABLE" className="space-y-4">
                        {payables.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có dữ liệu</p>}
                        {payables.map((debt: any) => (
                            <DebtItem key={debt.id} debt={debt} accounts={accounts} categories={categories} />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
