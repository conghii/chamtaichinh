import { getSheet } from "../lib/sheets";
import { v4 as uuidv4 } from 'uuid';

async function seed() {
    console.log("🌱 Seeding Google Sheets...");

    try {
        // 1. Initialize Headers (created by getSheet if missing)
        await getSheet('Accounts');
        await getSheet('Categories');
        await getSheet('Transactions');
        console.log("✅ Sheets/Tabs verified.");

        // 2. Clear existing data (Optional: commented out for safety, or we check if empty)
        // For now, we only add if empty.

        // 3. Seed Accounts
        const accountsSheet = await getSheet('Accounts');
        const existingAccounts = await accountsSheet.getRows();
        if (existingAccounts.length === 0) {
            console.log("adding default accounts...");
            await accountsSheet.addRow({
                id: uuidv4(),
                name: 'Ví Tiền Mặt',
                current_balance: 5000000,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            await accountsSheet.addRow({
                id: uuidv4(),
                name: 'Techcombank',
                current_balance: 15000000,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        // 4. Seed Categories
        const categoriesSheet = await getSheet('Categories');
        const existingCategories = await categoriesSheet.getRows();
        if (existingCategories.length === 0) {
            console.log("adding default categories...");
            const defaults = [
                { name: 'Lương', type: 'INCOME', owner_tag: 'PERSONAL' },
                { name: 'Ăn uống', type: 'EXPENSE', owner_tag: 'PERSONAL' },
                { name: 'Mua sắm', type: 'EXPENSE', owner_tag: 'PERSONAL' },
                { name: 'Doanh thu bán hàng', type: 'INCOME', owner_tag: 'COMPANY' },
                { name: 'Chi phí vận hành', type: 'EXPENSE', owner_tag: 'COMPANY' },
                { name: 'Marketing', type: 'EXPENSE', owner_tag: 'COMPANY' },
            ];

            for (const cat of defaults) {
                await categoriesSheet.addRow({
                    id: uuidv4(),
                    ...cat,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        }

        console.log("✅ Seeding completed!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seed();
