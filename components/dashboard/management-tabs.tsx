"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetOverview } from "./budget-overview"
import { SavingsGoals } from "./savings-goals"
import { RecurringTransactions } from "./recurring-transactions"
import { Card } from "@/components/ui/card"
import { PiggyBank, Repeat, Wallet } from "lucide-react"

interface ManagementTabsProps {
    budgets: any[]
    transactions: any[]
    categories: any[]
    goals: any[]
    accounts: any[]
    recurring: any[]
}

export function ManagementTabs({
    budgets,
    transactions,
    categories,
    goals,
    accounts,
    recurring
}: ManagementTabsProps) {
    return (
        <div className="space-y-4">
            <Tabs defaultValue="BUDGET" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl mb-4 p-1 rounded-2xl h-12">
                    <TabsTrigger value="BUDGET" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium text-xs">
                        Ngân Sách
                    </TabsTrigger>
                    <TabsTrigger value="GOALS" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium text-xs">
                        Hũ Tiết Kiệm
                    </TabsTrigger>
                    <TabsTrigger value="RECURRING" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium text-xs">
                        Định Kỳ
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="BUDGET" className="mt-0">
                    <BudgetOverview budgets={budgets} transactions={transactions} categories={categories} />
                </TabsContent>

                <TabsContent value="GOALS" className="mt-0">
                    <SavingsGoals goals={goals} accounts={accounts} />
                </TabsContent>

                <TabsContent value="RECURRING" className="mt-0">
                    <RecurringTransactions recurring={recurring} accounts={accounts} categories={categories} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
