import { getAccounts, getCategories } from "@/lib/sheets"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Wallet, Tag, Plus, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { CreateAccountForm } from "@/components/settings/create-account-form"
import { CreateCategoryForm } from "@/components/settings/create-category-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export default async function SettingsPage() {
    const accounts = await getAccounts()
    const categories = await getCategories()

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cấu Hình</h1>
                    <p className="text-slate-500 text-sm">Quản lý Tài khoản & Hạng mục</p>
                </div>
            </header>

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-white shadow-sm rounded-2xl p-2 gap-2">
                    <TabsTrigger value="accounts" className="rounded-xl data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-medium h-full gap-2 text-base">
                        <Wallet className="w-5 h-5" /> Tài Khoản
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 font-medium h-full gap-2 text-base">
                        <Tag className="w-5 h-5" /> Hạng Mục
                    </TabsTrigger>
                </TabsList>

                {/* ACCOUNTS */}
                <TabsContent value="accounts" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Create Form */}
                    <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Plus className="w-5 h-5" /></div>
                                Thêm Tài Khoản Mới
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CreateAccountForm />
                        </CardContent>
                    </Card>

                    {/* List */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {accounts.map(acc => (
                            <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-lg">{acc.name}</h3>
                                    <p className="text-slate-400 text-sm">Đã tạo: {new Date(acc.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600 text-lg">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(acc.current_balance))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* CATEGORIES */}
                <TabsContent value="categories" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Create Form */}
                    <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Plus className="w-5 h-5" /></div>
                                Thêm Hạng Mục Mới
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CreateCategoryForm />
                        </CardContent>
                    </Card>

                    {/* List */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-500 uppercase text-sm tracking-wider">Chi Tiêu (Expense)</h3>
                            <div className="grid gap-3">
                                {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                                        <div className={cn("w-2 h-10 rounded-full", cat.owner_tag === 'PERSONAL' ? "bg-indigo-400" : "bg-blue-400")} />
                                        <div>
                                            <p className="font-semibold">{cat.name}</p>
                                            <p className="text-xs text-slate-400 uppercase font-bold">{cat.owner_tag === 'PERSONAL' ? 'Cá nhân' : 'Công ty'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-500 uppercase text-sm tracking-wider">Thu Nhập (Income)</h3>
                            <div className="grid gap-3">
                                {categories.filter(c => c.type === 'INCOME').map(cat => (
                                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                                        <div className={cn("w-2 h-10 rounded-full", cat.owner_tag === 'PERSONAL' ? "bg-emerald-400" : "bg-teal-400")} />
                                        <div>
                                            <p className="font-semibold">{cat.name}</p>
                                            <p className="text-xs text-slate-400 uppercase font-bold">{cat.owner_tag === 'PERSONAL' ? 'Cá nhân' : 'Công ty'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </TabsContent>

            </Tabs>
        </div>
    )
}
