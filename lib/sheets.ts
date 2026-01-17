import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

// Singleton Doc Instance
let doc: GoogleSpreadsheet | null = null;

// Lazy Init Function
export async function getDoc() {
    if (doc) return doc;

    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error("Missing Google Sheets Credentials in .env");
    }

    const serviceAccountAuth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const newDoc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await newDoc.loadInfo();
    doc = newDoc;
    return doc;
}

// Simple Cache
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 30 * 1000; // 30 seconds
const SHORT_TTL = 5 * 1000;  // 5 seconds


const cache: {
    accounts?: CacheEntry<any[]>;
    categories?: CacheEntry<any[]>;
    transactions?: CacheEntry<any[]>;
    debts?: CacheEntry<any[]>;
    templates?: CacheEntry<any[]>;
    budgets?: CacheEntry<any[]>;
    goals?: CacheEntry<any[]>;
    recurring?: CacheEntry<any[]>;
    docLoaded: boolean;
} = {
    docLoaded: false
};

async function loadDocInfo() {
    // getDoc() already ensures loadInfo() is called
    await getDoc();
}

export async function getSheet(title: string) {
    const docInstance = await getDoc();
    const sheet = docInstance.sheetsByTitle[title];
    if (!sheet) {
        return await docInstance.addSheet({ title, headerValues: getHeaders(title) });
    }
    return sheet;
}

function getHeaders(title: string) {
    if (title === 'Accounts') return ['id', 'name', 'current_balance', 'created_at', 'updated_at'];
    if (title === 'Categories') return ['id', 'name', 'type', 'owner_tag', 'created_at', 'updated_at'];

    if (title === 'Transactions') return ['id', 'amount', 'date', 'note', 'account_id', 'category_id', 'transaction_type', 'owner', 'created_at'];
    if (title === 'Debts') return ['id', 'name', 'amount', 'type', 'note', 'status', 'created_at', 'updated_at'];
    if (title === 'TransactionTemplates') return ['id', 'name', 'amount', 'category_id', 'owner', 'created_at', 'updated_at'];
    if (title === 'Budgets') return ['category_id', 'amount', 'period', 'updated_at'];
    if (title === 'Goals') return ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'icon', 'created_at', 'updated_at'];
    if (title === 'RecurringTransactions') return ['id', 'amount', 'note', 'account_id', 'category_id', 'type', 'frequency', 'start_date', 'next_run_date', 'active', 'owner', 'created_at', 'updated_at'];
    return [];
}

function parseDate(value: any): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}

// --- Repository Methods ---

export async function getAccounts() {
    const now = Date.now();
    if (cache.accounts && (now - cache.accounts.timestamp < CACHE_TTL)) {
        return cache.accounts.data;
    }

    try {
        const sheet = await getSheet('Accounts');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            current_balance: Number(row.get('current_balance')),
            created_at: parseDate(row.get('created_at')),
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.accounts = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch Accounts:", e);
        return [];
    }
}

export async function getCategories() {
    const now = Date.now();
    if (cache.categories && (now - cache.categories.timestamp < CACHE_TTL)) {
        return cache.categories.data;
    }

    try {
        const sheet = await getSheet('Categories');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            type: row.get('type'),
            owner_tag: row.get('owner_tag'),
            created_at: parseDate(row.get('created_at'))
        }));

        cache.categories = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch Categories:", e);
        return [];
    }
}

export async function addTransaction(data: {
    amount: number;
    date: string;
    note: string;
    accountId: string;
    categoryId: string;
    type: string;
    owner: string;
}) {
    try {
        const sheet = await getSheet('Transactions');
        const newTransaction = {
            id: uuidv4(),
            amount: data.amount,
            date: data.date,
            note: data.note,
            account_id: data.accountId,
            category_id: data.categoryId,
            transaction_type: data.type,
            owner: data.owner,
            created_at: new Date().toISOString()
        };
        await sheet.addRow(newTransaction);

        // Invalidate caches related to transactions/accounts
        cache.transactions = undefined;
        cache.accounts = undefined;

        return newTransaction;
    } catch (e) {
        console.error("Failed to add transaction:", e);
        throw e;
    }
}

export async function getTransactions(limit = 10) {
    const now = Date.now();
    // Cache transactions briefly to avoid rapid re-fetches during page renders
    // Note: We don't cache deeply here because 'limit' changes result
    // But for the dashboard (limit=50) it's useful.
    if (limit === 50 && cache.transactions && (now - cache.transactions.timestamp < SHORT_TTL)) {
        return cache.transactions.data;
    }

    try {
        const docInstance = await getDoc();
        const sheet = docInstance.sheetsByTitle['Transactions'];
        if (!sheet) return [];

        const rows = await sheet.getRows();

        // Fetch accounts and categories cache-aware
        const accounts = await getAccounts();
        const categories = await getCategories();

        const accMap = new Map(accounts.map(a => [a.id, a.name]));
        const catMap = new Map(categories.map(c => [c.id, c.name]));

        // Sort by date desc
        rows.sort((a, b) => new Date(b.get('date')).getTime() - new Date(a.get('date')).getTime());

        const limitedRows = rows.slice(0, limit);

        const data = limitedRows.map(row => ({
            id: row.get('id'),
            amount: Number(row.get('amount')),
            date: parseDate(row.get('date')),
            note: row.get('note'),
            account_id: row.get('account_id'),
            category_id: row.get('category_id'),
            transaction_type: row.get('transaction_type'),
            owner: row.get('owner'),
            account_name: accMap.get(row.get('account_id')) || 'Unknown Account',
            category_name: catMap.get(row.get('category_id')) || (row.get('category_id')?.startsWith('TRANSFER') ? 'Chuyển khoản' : 'Unknown Category')
        }));

        if (limit === 50) {
            cache.transactions = { data, timestamp: now };
        }

        return data;
    } catch (e) {
        console.error("Failed to fetch transactions:", e);
        return [];
    }
}

export async function updateAccountBalance(accountId: string, amountChange: number) {
    try {
        const sheet = await getSheet('Accounts');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === accountId);

        if (row) {
            const current = Number(row.get('current_balance')) || 0;
            row.set('current_balance', current + amountChange);
            row.set('updated_at', new Date().toISOString());
            await row.save();
        }
    } catch (e) {
        console.error("Failed to update balance:", e);
    }
}

export async function addAccount(data: { name: string; initialBalance: number }) {
    try {
        const sheet = await getSheet('Accounts');
        const newAccount = {
            id: uuidv4(),
            name: data.name,
            current_balance: data.initialBalance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await sheet.addRow(newAccount);
        return newAccount;
    } catch (e) {
        console.error("Failed to add account:", e);
        throw e;
    }
}

export async function addCategory(data: { name: string; type: string; owner: string }) {
    try {
        const sheet = await getSheet('Categories');
        const newCategory = {
            id: uuidv4(),
            name: data.name,
            type: data.type,
            owner_tag: data.owner,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString() // Although schema didn't strictly require update_at for categories earlier, good practice
        };
        await sheet.addRow(newCategory);
        return newCategory;
    } catch (e) {
        console.error("Failed to add category:", e);
        throw e;
    }
}

export async function updateAccount(id: string, name: string) {
    try {
        const sheet = await getSheet('Accounts');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            row.set('name', name);
            row.set('updated_at', new Date().toISOString());
            await row.save();
        }
    } catch (e) {
        console.error("Failed to update account:", e);
        throw e;
    }
}

export async function deleteAccount(id: string) {
    try {
        const sheet = await getSheet('Accounts');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
        }
    } catch (e) {
        console.error("Failed to delete account:", e);
        throw e;
    }
}

export async function updateCategory(id: string, name: string, type: string, owner: string) {
    try {
        const sheet = await getSheet('Categories');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            row.set('name', name);
            row.set('type', type);
            row.set('owner_tag', owner);
            row.set('updated_at', new Date().toISOString());
            await row.save();
        }
    } catch (e) {
        console.error("Failed to update category:", e);
        throw e;
    }
}


export async function deleteCategory(id: string) {
    try {
        const sheet = await getSheet('Categories');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
        }
    } catch (e) {
        console.error("Failed to delete category:", e);
        throw e;
    }
}

// --- DEBT METHODS ---

export async function getDebts() {
    const now = Date.now();
    if (cache.debts && (now - cache.debts.timestamp < CACHE_TTL)) {
        return cache.debts.data;
    }

    try {
        const sheet = await getSheet('Debts');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            amount: Number(row.get('amount')),
            type: row.get('type'),
            note: row.get('note'),
            status: row.get('status'),
            created_at: parseDate(row.get('created_at')),
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.debts = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch Debts:", e);
        return [];
    }
}

export async function addDebt(data: { name: string; amount: number; type: string; note: string; date: string }) {
    try {
        const sheet = await getSheet('Debts');
        const newDebt = {
            id: uuidv4(),
            name: data.name,
            amount: data.amount,
            type: data.type,
            note: data.note,
            status: 'PENDING',
            created_at: new Date(data.date).toISOString(),
            updated_at: new Date().toISOString()
        };
        await sheet.addRow(newDebt);
        cache.debts = undefined;
        return newDebt;
    } catch (e) {
        console.error("Failed to add debt:", e);
        throw e;
    }
}

export async function updateDebtStatusSheet(id: string, status: string) {
    try {
        const sheet = await getSheet('Debts');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            row.set('status', status);
            row.set('updated_at', new Date().toISOString());
            await row.save();
            cache.debts = undefined;
        }
    } catch (e) {
        console.error("Failed to update debt status:", e);
        throw e;
    }
}

export async function deleteDebtSheet(id: string) {
    try {
        const sheet = await getSheet('Debts');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
            cache.debts = undefined;
        }
    } catch (e) {
        console.error("Failed to delete debt:", e);
        throw e;
    }
}

// --- VISUAL TEMPLATE METHODS ---

export async function getTransactionTemplates() {
    const now = Date.now();
    if (cache.templates && (now - cache.templates.timestamp < CACHE_TTL)) {
        return cache.templates.data;
    }

    try {
        const sheet = await getSheet('TransactionTemplates');
        const rows = await sheet.getRows();

        // Need categories to map names if needed, but for now just raw data is fine
        // implementation might do the mapping in the component or action

        const data = rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            amount: Number(row.get('amount')),
            category_id: row.get('category_id'),
            owner: row.get('owner'),
            created_at: parseDate(row.get('created_at')),
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.templates = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch TransactionTemplates:", e);
        return [];
    }
}

export async function addTransactionTemplate(data: { name: string; amount: number; categoryId: string; owner: string }) {
    try {
        const sheet = await getSheet('TransactionTemplates');
        const newTemplate = {
            id: uuidv4(),
            name: data.name,
            amount: data.amount,
            category_id: data.categoryId,
            owner: data.owner,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await sheet.addRow(newTemplate);
        cache.templates = undefined; // invalidate cache
        return newTemplate;
    } catch (e) {
        console.error("Failed to add transaction template:", e);
        throw e;
    }
}

export async function deleteTransactionTemplate(id: string) {
    try {
        const sheet = await getSheet('TransactionTemplates');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
            cache.templates = undefined;
        }
    } catch (e) {
        console.error("Failed to delete transaction template:", e);
        throw e;
    }
}

// --- BUDGET METHODS ---

export async function getBudgets() {
    const now = Date.now();
    if (cache.budgets && (now - cache.budgets.timestamp < CACHE_TTL)) {
        return cache.budgets.data;
    }

    try {
        const sheet = await getSheet('Budgets');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            category_id: row.get('category_id'),
            amount: Number(row.get('amount')),
            period: row.get('period'), // e.g., 'MONTHLY'
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.budgets = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch Budgets:", e);
        return [];
    }
}

export async function setBudget(categoryId: string, amount: number, period: string = 'MONTHLY') {
    try {
        const sheet = await getSheet('Budgets');
        const rows = await sheet.getRows();
        const existing = rows.find(r => r.get('category_id') === categoryId && r.get('period') === period);

        if (existing) {
            existing.set('amount', amount);
            existing.set('updated_at', new Date().toISOString());
            await existing.save();
        } else {
            await sheet.addRow({
                category_id: categoryId,
                amount: amount,
                period: period,
                updated_at: new Date().toISOString()
            });
        }
        cache.budgets = undefined;
    } catch (e) {
        return { success: false, error: "Failed to set budget" }
    }
}

// --- SAVINGS GOALS METHODS ---

export async function getGoals() {
    const now = Date.now();
    if (cache.goals && (now - cache.goals.timestamp < CACHE_TTL)) {
        return cache.goals.data;
    }

    try {
        const sheet = await getSheet('Goals');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            target_amount: Number(row.get('target_amount')),
            current_amount: Number(row.get('current_amount')),
            deadline: parseDate(row.get('deadline')),
            icon: row.get('icon'),
            created_at: parseDate(row.get('created_at')),
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.goals = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch Goals:", e);
        return [];
    }
}

export async function addGoal(data: { name: string; target: number; current: number; deadline?: string; icon?: string }) {
    try {
        const sheet = await getSheet('Goals');
        const newGoal = {
            id: uuidv4(),
            name: data.name,
            target_amount: data.target,
            current_amount: data.current,
            deadline: data.deadline ? new Date(data.deadline).toISOString() : '',
            icon: data.icon || '🎯',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await sheet.addRow(newGoal);
        cache.goals = undefined;
        return newGoal;
    } catch (e) {
        console.error("Failed to add goal:", e);
        throw e;
    }
}

export async function updateGoalAmount(id: string, amountChange: number) {
    try {
        const sheet = await getSheet('Goals');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);

        if (row) {
            const current = Number(row.get('current_amount')) || 0;
            row.set('current_amount', current + amountChange);
            row.set('updated_at', new Date().toISOString());
            await row.save();
            cache.goals = undefined;
        }
    } catch (e) {
        console.error("Failed to update goal amount:", e);
        throw e;
    }
}

export async function deleteGoal(id: string) {
    try {
        const sheet = await getSheet('Goals');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
            cache.goals = undefined;
        }
    } catch (e) {
        return { success: false, error: "Failed to delete goal" }
    }
}

// --- RECURRING TRANSACTIONS METHODS ---

export async function getRecurringTransactions() {
    const now = Date.now();
    if (cache.recurring && (now - cache.recurring.timestamp < CACHE_TTL)) {
        return cache.recurring.data;
    }

    try {
        const sheet = await getSheet('RecurringTransactions');
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            id: row.get('id'),
            amount: Number(row.get('amount')),
            note: row.get('note'),
            account_id: row.get('account_id'),
            category_id: row.get('category_id'),
            type: row.get('type'),
            frequency: row.get('frequency'),
            start_date: parseDate(row.get('start_date')),
            next_run_date: parseDate(row.get('next_run_date')),
            active: row.get('active') === 'TRUE',
            owner: row.get('owner'),
            created_at: parseDate(row.get('created_at')),
            updated_at: parseDate(row.get('updated_at'))
        }));

        cache.recurring = { data, timestamp: now };
        return data;
    } catch (e) {
        console.warn("Could not fetch RecurringTransactions:", e);
        return [];
    }
}

export async function addRecurringTransaction(data: {
    amount: number;
    note: string;
    accountId: string;
    categoryId: string;
    type: string;
    frequency: string; // DAILY, WEEKLY, MONTHLY, YEARLY
    startDate: string;
    owner: string;
}) {
    try {
        const sheet = await getSheet('RecurringTransactions');
        const newRec = {
            id: uuidv4(),
            amount: data.amount,
            note: data.note,
            account_id: data.accountId,
            category_id: data.categoryId,
            type: data.type,
            frequency: data.frequency,
            start_date: data.startDate,
            next_run_date: data.startDate, // Initial run date is start date
            active: 'TRUE',
            owner: data.owner,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await sheet.addRow(newRec);
        cache.recurring = undefined;
        return newRec;
    } catch (e) {
        console.error("Failed to add recurring transaction:", e);
        throw e;
    }
}

export async function updateRecurringNextRun(id: string, nextDate: string) {
    try {
        const sheet = await getSheet('RecurringTransactions');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            row.set('next_run_date', nextDate);
            row.set('updated_at', new Date().toISOString());
            await row.save();
            cache.recurring = undefined;
        }
    } catch (e) {
        console.error("Failed to update recurring next run:", e);
        throw e;
    }
}

export async function deleteRecurringTransactionSheet(id: string) {
    try {
        const sheet = await getSheet('RecurringTransactions');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
            cache.recurring = undefined;
        }
    } catch (e) {
        console.error("Failed to delete recurring transaction:", e);
        throw e;
    }
}
