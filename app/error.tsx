
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl shadow-xl">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Đã xảy ra lỗi!</h2>
                <p className="text-slate-500 text-sm">
                    {error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."}
                </p>
                <div className="pt-4">
                    <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                        Thử lại
                    </Button>
                </div>
            </div>
        </div>
    )
}
