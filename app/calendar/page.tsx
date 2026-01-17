
import { CashFlowCalendar } from "@/components/dashboard/cashflow-calendar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
    const recurring: any[] = []

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 bg-white shadow-sm hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Lịch Dòng Tiền</h1>
                        <p className="text-slate-500 text-sm">Dự báo thu chi định kỳ</p>
                    </div>
                </header>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <CashFlowCalendar recurring={recurring} />
                </div>
            </div>
        </div>
    )
}
