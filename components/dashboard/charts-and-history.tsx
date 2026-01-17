"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewCharts } from "./overview-charts"
import { TransactionHistory } from "./transaction-history"
import { Card } from "@/components/ui/card"
import { BarChart3, History } from "lucide-react"

interface ChartsAndHistoryProps {
    transactions: any[]
    budgets: any[]
    onDuplicate: (transaction: any) => void
}

export function ChartsAndHistory({ transactions, budgets, onDuplicate }: ChartsAndHistoryProps) {
    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl overflow-hidden">
            <Tabs defaultValue="chart" className="w-full">
                <div className="border-b border-slate-100/50 p-2 px-4 flex items-center justify-between bg-white/40">
                    <TabsList className="bg-white/50 border border-slate-100">
                        <TabsTrigger value="chart" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Biểu đồ</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">Lịch sử</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chart" className="m-0 p-0 border-none outline-none data-[state=inactive]:hidden">
                    <OverviewCharts transactions={transactions} budgets={budgets} className="shadow-none border-0 bg-transparent" />
                </TabsContent>

                <TabsContent value="history" className="m-0 p-0 border-none outline-none data-[state=inactive]:hidden">
                    <TransactionHistory transactions={transactions} onDuplicate={onDuplicate} className="shadow-none border-0 bg-transparent" />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
