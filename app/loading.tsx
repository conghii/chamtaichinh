
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 bg-slate-50/50">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto pt-4 gap-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Quick Add Skeleton */}
                <div className="lg:col-start-3 lg:col-span-1 order-1 lg:order-2">
                    <Card className="border-0 shadow-lg rounded-3xl bg-white/60 backdrop-blur-xl">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-12 w-full rounded-2xl" />
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hero Card Skeleton */}
                <div className="lg:col-start-1 lg:col-span-2 space-y-6 order-2 lg:order-1">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-indigo-600 h-[400px]">
                        <CardContent className="p-8">
                            <Skeleton className="h-8 w-48 bg-white/20 mb-8" />
                            <Skeleton className="h-16 w-72 bg-white/20 mb-4" />
                            <Skeleton className="h-10 w-full bg-white/20 rounded-xl" />
                        </CardContent>
                    </Card>
                </div>

                {/* Other Widgets Skeleton */}
                <div className="lg:col-start-3 lg:col-span-1 space-y-6 order-3 lg:order-3">
                    <Skeleton className="h-[300px] w-full rounded-3xl" />
                    <Skeleton className="h-[200px] w-full rounded-3xl" />
                </div>
            </div>
        </div>
    )
}
