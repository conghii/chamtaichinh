"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Plus } from "lucide-react"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { cn } from "@/lib/utils"
import { PriceDisplay } from "@/components/ui/price-display"
import { PrivacyToggle } from "@/components/ui/privacy-toggle"
import { ChartsAndHistory } from "@/components/dashboard/charts-and-history"
import { AccountsList } from "@/components/dashboard/accounts-list"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HeroCardProps {
    totalBalance: number
    companyReal: number
    personalReal: number
    rawAccounts: any[]
    accounts?: any[]
    rawCategories: any[]
    templates: any[]
    filteredTransactions: any[]
    budgets: any[]
}

export function HeroCard({
    totalBalance,
    companyReal,
    personalReal,
    rawAccounts,
    accounts = [], // Default to empty if not passed (backwards compat)
    rawCategories,
    templates,
    filteredTransactions,
    budgets
}: HeroCardProps) {
    const [duplicateData, setDuplicateData] = useState<any>(null)
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'TOTAL' | 'COMPANY' | 'PERSONAL'>('TOTAL')

    const displayedBalance =
        viewMode === 'TOTAL' ? totalBalance :
            viewMode === 'COMPANY' ? companyReal :
                personalReal

    const handleDuplicate = (transaction: any) => {
        setDuplicateData(transaction)
        setIsDuplicateOpen(true)
    }

    const handleWalletClick = (account: any) => {
        setDuplicateData({
            account_id: account.id,
            account_name: account.name,
            date: new Date().toISOString() // Default to today
        })
        setIsDuplicateOpen(true)
    }

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* Duplicate Dialog */}
            <AddTransactionDialog
                accounts={rawAccounts}
                categories={rawCategories}
                templates={templates}
                open={isDuplicateOpen}
                onOpenChange={setIsDuplicateOpen}
                initialData={duplicateData}
            >
                <div className="hidden" />
            </AddTransactionDialog>
            <Card className="border-0 shadow-2xl overflow-hidden relative rounded-3xl min-h-[240px] flex flex-col justify-center transform transition-all hover:scale-[1.01]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <CardHeader className="relative z-10 pb-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-indigo-100 font-medium text-base md:text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Tổng Tài Sản Thực
                        <PrivacyToggle className="ml-2 text-indigo-200 hover:text-white hover:bg-white/20" />
                    </CardTitle>
                    <AddTransactionDialog accounts={rawAccounts} categories={rawCategories} templates={templates}>
                        <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all backdrop-blur-md flex items-center gap-2 px-3">
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm font-semibold">Giao dịch mới</span>
                        </button>
                    </AddTransactionDialog>
                </CardHeader>

                <CardContent className="relative z-10 pt-2 space-y-6">
                    {/* View Toggle */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-start">
                                <Tabs defaultValue="TOTAL" value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full max-w-md">
                                    <TabsList className="grid w-full grid-cols-3 bg-white/10 text-indigo-100">
                                        <TabsTrigger value="TOTAL" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Tổng</TabsTrigger>
                                        <TabsTrigger value="PERSONAL" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Cá nhân</TabsTrigger>
                                        <TabsTrigger value="COMPANY" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Công ty</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Main Number */}
                            <div>
                                <div className="text-4xl md:text-7xl font-bold text-white tracking-tight">
                                    <PriceDisplay value={displayedBalance} />
                                </div>
                                <p className="text-indigo-200 mt-1 font-light text-sm">
                                    {viewMode === 'TOTAL' ? 'Tổng tài sản thực' : viewMode === 'PERSONAL' ? 'Quỹ Cá Nhân (Thực)' : 'Quỹ Công Ty'}
                                </p>
                            </div>
                        </div>

                        {/* Wallets - Right Side */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 rounded-2xl p-2 backdrop-blur-sm border border-white/5">
                                <p className="text-[10px] font-medium text-indigo-200 mb-2 uppercase tracking-wider opacity-60 pl-1">Ví của bạn</p>
                                <AccountsList
                                    accounts={accounts.length > 0 ? accounts : rawAccounts}
                                    className="grid-cols-1 gap-2"
                                    onAccountClick={handleWalletClick}
                                />
                            </div>
                        </div>
                    </div>




                </CardContent>
            </Card>

            <div className="space-y-6">
                <ChartsAndHistory transactions={filteredTransactions} budgets={budgets} onDuplicate={handleDuplicate} />
            </div>
        </div >
    )
}
