
import 'dotenv/config';
import { getDoc } from './lib/sheets';

async function main() {
    console.log("--- DEBUG START ---");
    try {
        const doc = await getDoc();
        // doc.loadInfo() is already called inside getDoc()
        console.log(`Spreadsheet Title: ${doc.title}`);
        console.log("Sheets available:");

        for (const [title, sheet] of Object.entries(doc.sheetsByTitle)) {
            try {
                await sheet.loadHeaderRow(); // Load headers first!
                console.log(`- Title: "${title}" | Rows: ${sheet.rowCount} | Header Values: ${JSON.stringify(sheet.headerValues)}`);

                if (title === 'Transactions') {
                    const rows = await sheet.getRows();
                    console.log(`  > Actual Data Rows fetched via getRows(): ${rows.length}`);
                    if (rows.length > 0) {

                        console.log("  > Sample Row Data (Object):", rows[0].toObject());
                    }
                }
            } catch (err) {
                console.log(`- Title: "${title}" | Rows: ${sheet.rowCount} | Error loading headers: ${(err as any).message}`);
            }
        }

    } catch (e) {
        console.error("Debug Error:", e);
    }
    console.log("--- DEBUG END ---");
}

main();
