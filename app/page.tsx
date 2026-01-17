
import { getAccounts, getCategories, getTransactions, getDebts, getTransactionTemplates, getBudgets, getGoals, getRecurringTransactions } from "@/lib/sheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Wallet, TrendingUp, Sparkles, Building2, User, Plus, CheckCircle2, AlertTriangle, CalendarDays } from "lucide-react"
import Link from "next/link"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionHistory } from "@/components/dashboard/transaction-history"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReconciliationWidget } from "@/components/dashboard/reconciliation-widget"
import { FinancialStatusWidget } from "@/components/dashboard/financial-status"
import { CashFlowCalendar } from "@/components/dashboard/cashflow-calendar"
import { QuickAddWidget } from "@/components/dashboard/quick-add"
import { cn } from "@/lib/utils"
import { HeroCard } from "@/components/dashboard/hero-card"
import { ManagementTabs } from "@/components/dashboard/management-tabs"


export const dynamic = 'force-dynamic'

export default async function Dashboard({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view || 'COMBINED'

  let rawAccounts: any[] = [],
    rawCategories: any[] = [],
    rawTransactions: any[] = [],
    debts: any[] = [],
    budgets: any[] = [],
    goals: any[] = [],
    recurring: any[] = [],
    rawTemplates: any[] = []

  try {

    // Batch 1: Critical Setup Data (Fast)
    [rawAccounts, rawCategories] = await Promise.all([
      getAccounts(),
      getCategories()
    ]);

    // Batch 2: Heavy Data (Transactions)
    rawTransactions = await getTransactions(200);

    // Batch 3: Secondary Data
    [debts, budgets, goals, recurring, rawTemplates] = await Promise.all([
      getDebts(),
      getBudgets(),
      getGoals(),
      getRecurringTransactions(),
      getTransactionTemplates()
    ]);

  } catch (error) {
    console.error("FAILED TO FETCH DASHBOARD DATA:", error)
    throw new Error("Không thể tải dữ liệu từ Google Sheets. Vui lòng kiểm tra kết nối hoặc thử lại sau.")
  }


  // Serialize
  const accounts = rawAccounts.map((acc: any) => ({
    ...acc,
    current_balance: Number(acc.current_balance),
    created_at: acc.created_at.toISOString()
  }))

  const categories = rawCategories.map((cat: any) => ({
    ...cat,
    created_at: cat.created_at.toISOString()
  }))

  // Templates are already fetched in Promise.all as rawTemplates
  const templates = rawTemplates.map((t: any) => {
    // We can use rawCategories here safely, or the processed 'categories' since it's now defined above
    const cat = rawCategories.find((c: any) => c.id === t.category_id)
    return {
      ...t,
      category: cat ? { name: cat.name } : undefined
    }
  })

  const transactions = rawTransactions.map((t: any) => ({
    ...t,
    date: t.date.toISOString(),
    amount: Number(t.amount)
  }))

  const totalBalance = accounts.reduce((sum: number, acc: { current_balance: number }) => sum + acc.current_balance, 0)

  // Calculate Sub-Stats (Net Cash Flow from fetched history)
  // Note: This is "Flow" not "Equity" because we don't have initial balance per owner.
  // But for the user request "Vốn", this is the best approximation we have right now.
  const totalReceivable = debts
    .filter((d: any) => d.type === 'RECEIVABLE' && d.status !== 'PAID')
    .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

  const totalPayable = debts
    .filter((d: any) => d.type === 'PAYABLE' && d.status !== 'PAID')
    .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

  const personalFlow = transactions
    .filter((t: any) => t.owner === 'PERSONAL' && !t.category_name.includes('Chuyển khoản'))
    .reduce((sum: number, t: any) => sum + (t.transaction_type === 'INCOME' ? t.amount : -t.amount), 0)

  const companyFlow = transactions
    .filter((t: any) => t.owner === 'COMPANY')
    .reduce((sum: number, t: any) => sum + (t.transaction_type === 'INCOME' ? t.amount : -t.amount), 0)


  // Cash Flow Reconciliation Logic
  const totalReal = totalBalance
  const totalBook = personalFlow + companyFlow

  // Distribute Real Balance based on Flow Ratio
  // Goal: personalReal + companyReal MUST equal totalReal
  let personalReal = 0
  let companyReal = 0

  if (totalBook !== 0) {
    // Scale book values to fit real total
    const ratio = totalReal / totalBook
    personalReal = personalFlow * ratio
    companyReal = companyFlow * ratio
  } else {
    // If no book history, assume all personal by default
    personalReal = totalReal
    companyReal = 0
  }

  const diff = totalReal - totalBook
  const isMatch = Math.abs(diff) < 1000

  // Filter transactions for display
  const filteredTransactions = view === 'COMBINED'
    ? transactions
    : transactions.filter((t: any) => t.owner === view)

  return (
    <div className="min-h-screen p-2 md:p-8 space-y-4 md:space-y-8 bg-slate-50/50">

      {/* Header - Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto pt-4 gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Chạm Tài Chính</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Financial Dashboard</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/settings">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl">
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Cấu Hình</span>
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl">
              <CalendarDays className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Lịch Dòng Tiền</span>
            </Button>
          </Link>
          <Link href="/reconciliation">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl">
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Đối Soát</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* 1. QUICK ADD (Mobile: Top, Desktop: Top Right) */}
        <div className="lg:col-start-3 lg:col-span-1 order-1 lg:order-2">
          <QuickAddWidget templates={templates} accounts={accounts} categories={categories} />
        </div>

        {/* 2. HERO CARD (Mobile: Middle, Desktop: Left) */}
        <div className="lg:col-start-1 lg:col-span-2 space-y-6 order-2 lg:order-1">
          <HeroCard
            totalBalance={totalBalance}
            companyReal={companyReal}
            personalReal={personalReal}
            rawAccounts={rawAccounts}
            rawCategories={rawCategories}
            templates={templates}
            filteredTransactions={filteredTransactions}
            budgets={budgets}
            accounts={accounts}
          />
        </div>

        {/* 3. OTHER WIDGETS (Mobile: Bottom, Desktop: Bottom Right) */}
        <div className="lg:col-start-3 lg:col-span-1 space-y-6 order-3 lg:order-3">

          {/* Management Tools (Tabs) */}
          <ManagementTabs
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            goals={goals}
            accounts={accounts}
            recurring={recurring}
          />

          {/* New Financial Status Widget (Renamed to Debt Manager conceptually) */}
          <FinancialStatusWidget
            totalWallet={totalReal}
            totalReceivable={totalReceivable}
            totalPayable={totalPayable}
          />

          {/* Cash Flow Check Widget */}
          <ReconciliationWidget
            totalReal={totalReal}
            totalBook={totalBook}
            accounts={rawAccounts}
            categories={rawCategories}
          />
        </div>
      </div>
    </div>
  )
}
