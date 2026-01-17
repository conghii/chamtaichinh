import { getAccounts, getCategories, getSheet } from "@/lib/sheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, AlertTriangle, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function ReconciliationPage() {
    const accounts = await getAccounts()

    // Fetch Transactions Manually to get full history for reconciliation
    let transactions: any[] = [];
    try {
        const txSheet = await getSheet('Transactions');
        const txRows = await txSheet.getRows();
        transactions = txRows.map(row => ({
            amount: Number(row.get('amount')),
            category_id: row.get('category_id'),
            type: row.get('transaction_type'),
            owner_tag: row.get('owner')
        }));
    } catch (e) {
        console.warn("Could not fetch Transactions (Check credentials):", e);
        transactions = [];
    }

    // Calculate Metrics
    const actualAsset = accounts.reduce((sum: number, acc: { current_balance: unknown }) => sum + Number(acc.current_balance), 0)

    let personalCapitalIn = 0
    let companyRevenue = 0
    let companyExpense = 0
    let personalWithdrawal = 0

    transactions.forEach(tx => {
        const amount = Number(tx.amount)
        const { type, owner_tag } = tx

        if (owner_tag === 'PERSONAL') {
            if (type === 'INCOME') personalCapitalIn += amount
            else if (type === 'EXPENSE') personalWithdrawal += amount
        } else if (owner_tag === 'COMPANY') {
            if (type === 'INCOME') companyRevenue += amount
            else if (type === 'EXPENSE') companyExpense += amount
        }
    })

    const expectedBalance = (personalCapitalIn + companyRevenue) - (companyExpense + personalWithdrawal)
    const diff = actualAsset - expectedBalance
    const isBalanced = Math.abs(diff) < 1000 // Tolerance of 1000 VND

    const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <div className="max-w-4xl mx-auto space-y-8">

                <header className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 bg-white shadow-sm hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Đối Soát Dòng Tiền</h1>
                        <p className="text-slate-500 text-sm">Kiểm tra sức khỏe tài chính</p>
                    </div>
                </header>

                {/* Main Status Card */}
                <div className={cn(
                    "rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl text-white relative overflow-hidden transition-all",
                    isBalanced ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-rose-500 to-orange-600"
                )}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                    <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
                            {isBalanced ? <Scale className="w-10 h-10 text-white" /> : <AlertTriangle className="w-10 h-10 text-white" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{isBalanced ? "Quỹ Cân Bằng" : "Phát Hiện Lệch Quỹ"}</h2>
                            <p className="opacity-90 mt-1 font-medium bg-black/10 px-3 py-1 rounded-lg inline-block">
                                {isBalanced ? "Mọi con số đều khớp chính xác." : `Đang lệch: ${formatMoney(diff)}`}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 md:mt-0 text-right bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 min-w-[200px]">
                        <p className="text-xs opacity-80 uppercase tracking-widest font-bold mb-1">Tài sản thực tế</p>
                        <p className="text-3xl font-bold">{formatMoney(actualAsset)}</p>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <Card className="rounded-3xl border-0 shadow-xl bg-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bảng tính chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-700 py-4 pl-6">Nguồn tiền</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right py-4 pr-6">Giá trị</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="font-bold text-indigo-600 text-base mb-1">1. Vốn Cá nhân góp vào</div>
                                        <div className="text-xs text-slate-400 font-medium">Tiền túi bỏ vào ví chung</div>
                                    </TableCell>
                                    <TableCell className="text-right text-indigo-600 font-bold text-lg pr-6">+{formatMoney(personalCapitalIn)}</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="font-bold text-emerald-600 text-base mb-1">2. Doanh thu Công ty</div>
                                        <div className="text-xs text-slate-400 font-medium">Tiền khách hàng trả</div>
                                    </TableCell>
                                    <TableCell className="text-right text-emerald-600 font-bold text-lg pr-6">+{formatMoney(companyRevenue)}</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="font-bold text-rose-600 text-base mb-1">3. Chi phí Công ty</div>
                                        <div className="text-xs text-slate-400 font-medium">Tiền chi cho hoạt động KD</div>
                                    </TableCell>
                                    <TableCell className="text-right text-rose-600 font-bold text-lg pr-6">-{formatMoney(companyExpense)}</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="font-bold text-purple-600 text-base mb-1">4. Cá nhân rút / Tiêu dùng</div>
                                        <div className="text-xs text-slate-400 font-medium">Tiền lấy ra xài riêng</div>
                                    </TableCell>
                                    <TableCell className="text-right text-purple-600 font-bold text-lg pr-6">-{formatMoney(personalWithdrawal)}</TableCell>
                                </TableRow>
                                <TableRow className="bg-indigo-50/50 text-indigo-900 hover:bg-indigo-50 transition-colors border-t-2 border-indigo-100">
                                    <TableCell className="py-6 pl-6 font-bold text-lg">Tổng lý thuyết ((1+2) - (3+4))</TableCell>
                                    <TableCell className="text-right font-bold text-2xl text-indigo-700 pr-6">{formatMoney(expectedBalance)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
