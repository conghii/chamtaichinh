'use server'

import { revalidatePath } from "next/cache"
import {
    addTransaction,
    updateAccountBalance,
    getAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    getDebts,
    addDebt,
    updateDebtStatusSheet,
    deleteDebtSheet,
    addTransactionTemplate,
    deleteTransactionTemplate,
    getTransactionTemplates,
    setBudget,
    addGoal,
    updateGoalAmount,
    deleteGoal,
    getGoals,
    getRecurringTransactions,
    addRecurringTransaction,
    updateRecurringNextRun,
    deleteRecurringTransactionSheet
} from "@/lib/sheets"

export async function createTransaction(formData: FormData) {
    const amount = Number(formData.get("amount"))
    const date = formData.get("date") as string
    const type = formData.get("type") as string
    const owner = formData.get("owner") as string
    const accountId = formData.get("accountId") as string
    const categoryId = formData.get("categoryId") as string
    const note = formData.get("note") as string
    const isAdjustment = formData.get("isAdjustment") === "true"

    if (!amount || !accountId || !date) {
        return { success: false, error: "Missing required fields (Amount, Account, Date)" }
    }

    // Category is mandatory for non-Transfers
    if (type !== 'TRANSFER' && !categoryId) {
        return { success: false, error: "Missing Category" }
    }

    try {
        // Validation: Check Balance
        if (type === 'EXPENSE' || type === 'TRANSFER') {
            const accounts = await getAccounts();
            const sourceAccount = accounts.find(a => String(a.id) === accountId);
            if (!sourceAccount) {
                return { success: false, error: "Account not found" }
            }
            if (sourceAccount.current_balance < amount) {
                return { success: false, error: "Số dư không đủ để thực hiện giao dịch" }
            }
        }

        if (type === "TRANSFER") {
            // Validate Transfer specific fields
            const destAccountId = formData.get("destAccountId") as string
            const sourceAccountName = formData.get("sourceAccountName") as string
            const destAccountName = formData.get("destAccountName") as string

            if (!destAccountId) return { success: false, error: "Missing destination account" }
            if (accountId === destAccountId) return { success: false, error: "Cannot transfer to same account" }

            // 1. Outgoing Transaction (Expense from Source)
            await addTransaction({
                amount,
                date,
                note: `Chuyển tiền đến ${destAccountName}: ${note}`,
                accountId: accountId, // Source
                categoryId: "TRANSFER_OUT", // Special internal category ID or text
                type: "EXPENSE",
                owner: "PERSONAL" // Default to Personal for internal transfers
            })
            if (!isAdjustment) {
                await updateAccountBalance(accountId, -amount)
            }

            // 2. Incoming Transaction (Income to Dest)
            await addTransaction({
                amount,
                date,
                note: `Nhận tiền từ ${sourceAccountName}: ${note}`,
                accountId: destAccountId, // Dest
                categoryId: "TRANSFER_IN",
                type: "INCOME",
                owner: "PERSONAL"
            })
            if (!isAdjustment) {
                await updateAccountBalance(destAccountId, amount)
            }

        } else {
            // Standard Income/Expense Logic
            await addTransaction({
                amount,
                date,
                note,
                accountId,
                categoryId,
                type,
                owner
            })

            if (!isAdjustment) {
                const adjustment = type === "INCOME" ? amount : -amount
                await updateAccountBalance(accountId, adjustment)
            }
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Transaction failed:", error)
        return { success: false, error: "Failed to create transaction" }
    }
}

export async function createAccount(formData: FormData) {
    const name = formData.get("name") as string
    const balance = Number(formData.get("initialBalance"))

    if (!name) return { success: false, error: "Name is required" }

    try {
        await addAccount({ name, initialBalance: balance || 0 })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create account" }
    }
}

export async function updateAccountAction(id: string, name: string) {
    try {
        await updateAccount(id, name)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update account" }
    }
}

export async function deleteAccountAction(id: string) {
    try {
        await deleteAccount(id)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete account" }
    }
}

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const owner = formData.get("owner") as string

    if (!name || !type || !owner) return { success: false, error: "All fields required" }

    try {
        await addCategory({ name, type, owner })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create category" }
    }
}

export async function updateCategoryAction(id: string, name: string, type: string, owner: string) {
    try {
        await updateCategory(id, name, type, owner)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update category" }
    }
}

export async function deleteCategoryAction(id: string) {
    try {
        await deleteCategory(id)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete category" }
    }
}

// TEMPLATE ACTIONS (Mock for now or needs Sheets implementation)
// TEMPLATE ACTIONS
export async function createTemplate(formData: FormData) {
    const name = formData.get("name") as string
    const amount = Number(formData.get("amount"))
    const categoryId = formData.get("categoryId") as string
    const owner = formData.get("owner") as string

    if (!name || !categoryId || !owner) {
        return { success: false, error: "Missing required fields for template" }
    }

    try {
        await addTransactionTemplate({
            name,
            amount: amount || 0,
            categoryId,
            owner
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create template" }
    }
}

export async function deleteTemplate(id: string) {
    try {
        await deleteTransactionTemplate(id)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete template" }
    }
}

export async function getTemplates() {
    try {
        const templates = await getTransactionTemplates()
        return { success: true, data: templates }
    } catch (error) {
        return { success: false, error: "Failed to fetch templates" }
    }
}

// DEBT ACTIONS
export async function createDebt(formData: FormData) {
    const name = formData.get("name") as string
    const amount = Number(formData.get("amount"))
    const type = formData.get("type") as string // RECEIVABLE | PAYABLE
    const note = formData.get("note") as string
    const dateStr = formData.get("date") as string

    if (!name || !amount || !type || !dateStr) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        await addDebt({
            name,
            amount,
            type,
            note,
            date: dateStr
        })
        revalidatePath("/")
        revalidatePath("/debts")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create debt record" }
    }
}


export async function updateDebtStatus(id: string, status: string) {
    try {
        await updateDebtStatusSheet(id, status)
        revalidatePath("/")
        revalidatePath("/debts")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}

export async function settleDebt(id: string, accountId: string, categoryId: string, date: string) {
    try {
        const debts = await getDebts()
        const debt = debts.find(d => d.id === id)
        if (!debt) return { success: false, error: "Debt not found" }

        // 1. Create Transaction
        const isReceivable = debt.type === 'RECEIVABLE'

        await addTransaction({
            amount: Number(debt.amount),
            date: date,
            note: `Hoàn tất khoản nợ: ${debt.name}`,
            accountId: accountId,
            categoryId: categoryId,
            type: isReceivable ? 'INCOME' : 'EXPENSE',
            owner: 'PERSONAL'
        })

        // 2. Update Balance
        const adjustment = isReceivable ? Number(debt.amount) : -Number(debt.amount)
        await updateAccountBalance(accountId, adjustment)

        // 3. Update Debt Status
        await updateDebtStatusSheet(id, 'PAID')

        revalidatePath("/")
        revalidatePath("/debts")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to settle debt" }
    }
}


export async function deleteDebt(id: string) {
    try {
        await deleteDebtSheet(id)
        revalidatePath("/")
        revalidatePath("/debts")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete debt" }
    }
}

// RECURRING TRANSACTIONS
// RECURRING TRANSACTIONS
export async function createRecurringTransaction(formData: FormData) {
    const amount = Number(formData.get("amount"))
    const note = formData.get("note") as string
    const accountId = formData.get("accountId") as string
    const categoryId = formData.get("categoryId") as string
    const type = formData.get("type") as string
    const frequency = formData.get("frequency") as string
    const startDate = formData.get("startDate") as string || new Date().toISOString()
    const owner = formData.get("owner") as string

    if (!amount || !accountId || !categoryId || !frequency) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        await addRecurringTransaction({
            amount,
            note,
            accountId,
            categoryId,
            type,
            frequency,
            startDate,
            owner
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create recurring transaction" }
    }
}

export async function deleteRecurringTransaction(id: string) { // Changed to string ID
    try {
        await deleteRecurringTransactionSheet(id)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete recurring transaction" }
    }
}

export async function checkRecurringTransactions() {
    try {
        const recurring = await getRecurringTransactions()
        const now = new Date()
        const processed = []

        for (const rec of recurring) {
            if (!rec.active) continue

            const nextRun = new Date(rec.next_run_date)
            // Reset time to 00:00:00 for comparison to avoid time issues, or just compare timestamps
            // Just compare if now >= nextRun
            if (now >= nextRun) {
                // 1. Create the transaction
                await addTransaction({
                    amount: rec.amount,
                    date: nextRun.toISOString(), // Use the scheduled date, not now, to be accurate
                    note: `[Định kỳ] ${rec.note}`,
                    accountId: rec.account_id,
                    categoryId: rec.category_id,
                    type: rec.type,
                    owner: rec.owner
                })

                // 2. Update Balance
                const adjustment = rec.type === 'INCOME' ? rec.amount : -rec.amount
                await updateAccountBalance(rec.account_id, adjustment)

                // 3. Calculate next run
                let newNextRun = new Date(nextRun)
                switch (rec.frequency) {
                    case 'DAILY': newNextRun.setDate(newNextRun.getDate() + 1); break;
                    case 'WEEKLY': newNextRun.setDate(newNextRun.getDate() + 7); break;
                    case 'MONTHLY': newNextRun.setMonth(newNextRun.getMonth() + 1); break;
                    case 'YEARLY': newNextRun.setFullYear(newNextRun.getFullYear() + 1); break;
                }

                // 4. Update Recurring Record
                await updateRecurringNextRun(rec.id, newNextRun.toISOString())

                processed.push(rec.id)
            }
        }

        if (processed.length > 0) {
            revalidatePath("/")
            return { success: true, count: processed.length }
        }
        return { success: true, count: 0 }

    } catch (error) {
        console.error("Failed to check recurring transactions:", error)
        return { success: false, error: "Failed to check recurring" }
    }
}



// BUDGET ACTIONS
export async function updateBudgetAction(formData: FormData) {
    const categoryId = formData.get("categoryId") as string
    const amount = Number(formData.get("amount"))

    if (!categoryId || amount < 0) return { success: false, error: "Invalid data" }

    try {
        await setBudget(categoryId, amount)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update budget" }
    }
}

// GOALS ACTIONS
export async function createGoal(formData: FormData) {
    const name = formData.get("name") as string
    const target = Number(formData.get("target"))
    const deadline = formData.get("deadline") as string

    if (!name || !target) return { success: false, error: "Missing required fields" }

    try {
        await addGoal({
            name,
            target,
            current: 0,
            deadline
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create goal" }
    }
}

export async function contributeToGoal(formData: FormData) {
    const goalId = formData.get("goalId") as string
    const goalName = formData.get("goalName") as string
    const amount = Number(formData.get("amount"))
    const accountId = formData.get("accountId") as string
    const date = formData.get("date") as string || new Date().toISOString()

    if (!goalId || !amount || !accountId) return { success: false, error: "Missing contribution data" }

    try {
        // 1. Create Expense Transaction
        await addTransaction({
            amount,
            date,
            note: `Tích lũy cho mục tiêu: ${goalName}`,
            accountId,
            categoryId: 'SAVINGS_CONTRIBUTION', // Can be refined
            type: 'EXPENSE',
            owner: 'PERSONAL'
        })

        // 2. Update Account Balance
        await updateAccountBalance(accountId, -amount)

        // 3. Update Goal Amount
        await updateGoalAmount(goalId, amount)

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to process contribution" }
    }
}

export async function deleteGoalAction(id: string) {
    try {
        await deleteGoal(id)
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete goal" }
    }
}
