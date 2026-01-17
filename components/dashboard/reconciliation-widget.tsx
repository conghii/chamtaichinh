"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, ArrowRight, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { createTransaction } from "@/app/actions"
// import { toast } from "sonner" // Removed sonner dependency specific to build error
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ReconciliationWidgetProps {
    totalReal: number
    totalBook: number
    accounts: any[]
    categories: any[]
}

export function ReconciliationWidget({ totalReal, totalBook, accounts, categories }: ReconciliationWidgetProps) {
    const diff = totalReal - totalBook
    const isMatch = Math.abs(diff) < 1000
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [owner, setOwner] = useState<"PERSONAL" | "COMPANY">("PERSONAL")

    // Find a default account to attach this adjustment to? 
    // Wait, "Adjustment" is an INCOME usually.
    // If Logic: Real Balance (Wallet) > Book Balance (Flow). We have MORE money than recorded.
    // -> We need to record an INCOME of [diff] to increase Book Balance.
    // If Real < Book. We have LESS money. 
    // -> We need to record an EXPENSE of [diff] to decrease Book Balance.

    // User Scenario: "App says 0, Wallet has 1M". Diff = 1M. Need Income +1M.
    const isSurplus = diff > 0 // Real > Book -> Income needed
    const adjustmentAmount = Math.abs(diff)

    const handleAutoBalance = async () => {
        if (!adjustmentAmount) return

        setLoading(true)

        // Strategy:
        // 1. Find a category "Điều chỉnh" or "Thu nhập khác" or "Chi phí khác".
        // 2. Find a "Dummy" account? NO.
        // Wait, "Book Balance" is calculated from Transactions. adding a transaction affects Book.
        // Does it affect Real Balance (Wallet)?
        // YES. `createTransaction` modifies Account Balance too!
        // CRITICAL LOGIC FLAW FIX:
        // If we add a transaction, it ADDS to an account. So Account Balance increases.
        // Total Real increases.
        // Total Book increases.
        // The Gap remains!
        // 
        // User Insight: "App của bạn đang bắt đầu từ con số 0, nhưng thực tế trong túi bạn đã có sẵn tiền từ."
        // Meaning: The "Initial Balance" is missing from the "Book".
        // BUT "Initial Balance" is usually just an entry in the ledger that DOES NOT affect the Wallet (since wallet already has it).
        //
        // HOW TO FIX:
        // We need a transaction type that "Increases Book (Flow)" but "Does NOT Increase Wallet (Real)".
        // OR: We simply say "This is Initial Balance".
        // In this system, "Real Balance" = Sum of Accounts.
        // If I create a transaction "Initial Balance", usually it targets an account.
        // If I target "MB Bank", MB Bank balance increases.
        // Then "Total Real" increases. "Total Book" increases. The gap chases itself.
        //
        // UNLESS: The users "Total Real" (2.089.000) IS currently correct in the app (fetched from accounts).
        // And "Total Book" (999.000) is just sum of transactions.
        // The discrepancy is that we have money in accounts that *didn't come from recorded transactions* (i.e. Initial Balance).
        //
        // To fix this without double-counting:
        // We need a Transaction that is linked to an account but *Does not update the account balance*?
        // OR, simply: The current system calculates "Total Real" from `accounts` table.
        // And `transactions` table tracks history.
        // Code: `totalReal = accounts.reduce(...)`
        // Code: `totalBook = transactions.reduce(...)`
        //
        // If I add a transaction to `transactions` table, `totalBook` rises.
        // Does that transaction update `accounts`?
        // `createTransaction` action: `await prisma.account.update(...)`. Yes it does.
        //
        // SOLUTION:
        // We need a special flag in `createTransaction` to "Skip Account Update" (Only Record History).
        // OR
        // We cheat?
        // Use a "Non-Real" Account? No.
        //
        // Actually, if this is "Initial Balance", it should be recorded when the Account was created.
        // If the Account has 1M, and we have 0 Transactions. Book=0. Real=1M.
        // We need a Transaction of 1M.
        // If we create a Transaction of 1M, we usually add 1M to Account. Account becomes 2M. Real=2M. Book=1M. Gap=1M.
        // 
        // REFACTOR NEEDED:
        // The "Adjustment" transaction must NOT change the Account Balance.
        // It's a "Bookkeeping-only" transaction.
        // 
        // I will add a flag `skipBalanceUpdate` to the createTransaction action?
        // Or I can just manually create the transaction using a new server action here. `createAdjustmentTransaction`.

        try {
            // New Action needed: createAdjustmentTransaction
            // Pass: amount, date, note="Điều chỉnh số dư đầu kỳ", owner
            // It inserts to Transaction table but DOES NOT touch Account table.
            // AND it needs a category? Yes.

            // Find category
            const targetCat = isSurplus
                ? categories.find(c => c.name.includes('Thu nhập') || c.name.includes('Lương'))
                : categories.find(c => c.name.includes('khác') && c.type === 'EXPENSE')

            const categoryId = targetCat ? targetCat.id : categories[0].id // Fallback

            // Use a specific Account ID? 
            // The Transaction model requires `accountId`.
            // We can pick the first account, it doesn't matter if we don't update its balance.
            // But visually it will show "MB Bank: +1M". User might get confused if MB Bank balance doesn't change?
            // "Sao có giao dịch mà tiền không tăng?" -> "Đây là số dư đầu kỳ".
            // It makes sense.
            const accountId = accounts[0].id

            // Create Form Data? Or just specific object.
            // Let's create a specific Server Action for this to be safe.
            const formData = new FormData()
            formData.append("amount", adjustmentAmount.toString())
            formData.append("date", new Date().toISOString())
            formData.append("type", isSurplus ? "INCOME" : "EXPENSE")
            formData.append("owner", owner)
            formData.append("accountId", String(accountId))
            formData.append("categoryId", String(categoryId))
            formData.append("note", "Điều chỉnh số dư đầu kỳ (Auto)")
            formData.append("isAdjustment", "true") // Flag for the action

            const res = await createTransaction(formData)
            // Note: I need to update createTransaction to handle `isAdjustment` flag to skip account update.

            if (res.success) {
                setOpen(false)
                alert("Thành công! Số dư đã được điều chỉnh.")
            } else {
                alert(res.error)
            }
        } catch (e) {
            console.error(e)
            alert("Lỗi xử lý")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-0 shadow-lg rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase font-bold text-slate-400 tracking-wider">Đối Soát Dòng Tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Thực tế (Ví):</span>
                    <span className="font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format(totalReal)}đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Sổ sách (Flow):</span>
                    <span className="font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format(totalBook)}đ</span>
                </div>
                <div className={cn(
                    "p-3 rounded-xl flex items-center gap-3 transition-colors",
                    isMatch ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}>
                    {isMatch ? (
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                    ) : (
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                    )}
                    <div className="flex flex-col flex-1">
                        <span className="font-bold text-sm">{isMatch ? "Khớp số liệu" : "Lệch dòng tiền"}</span>
                        {!isMatch && (
                            <span className="text-xs opacity-90">
                                {isSurplus ? "Dư" : "Thiếu"}: {new Intl.NumberFormat('vi-VN').format(adjustmentAmount)}đ
                            </span>
                        )}
                    </div>

                    {!isMatch && (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 bg-white/50 border-rose-200 hover:bg-white text-rose-700 text-xs px-2 shadow-sm">
                                    Xử lý
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle>Cân bằng số dư</DialogTitle>
                                    <DialogDescription>
                                        Hệ thống sẽ tạo một giao dịch <b>{isSurplus ? "Thu nhập" : "Chi tiêu"}</b> trị giá <b>{new Intl.NumberFormat('vi-VN').format(adjustmentAmount)}đ</b> để khớp với thực tế.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Giao dịch này thuộc quỹ nào?</Label>
                                        <RadioGroup value={owner} onValueChange={(v: any) => setOwner(v)} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <RadioGroupItem value="PERSONAL" id="adj-personal" className="sr-only" />
                                                <Label htmlFor="adj-personal" className={cn(
                                                    "flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                    owner === 'PERSONAL' ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100"
                                                )}>
                                                    Cá nhân
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="COMPANY" id="adj-company" className="sr-only" />
                                                <Label htmlFor="adj-company" className={cn(
                                                    "flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                    owner === 'COMPANY' ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-100"
                                                )}>
                                                    Công ty
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-end">
                                    <Button variant="ghost" onClick={() => setOpen(false)}>Bỏ qua</Button>
                                    <Button onClick={handleAutoBalance} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                                        {loading ? "Đang tạo..." : "Xác nhận cân bằng"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
