"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, User } from "lucide-react"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError("Sai tên đăng nhập hoặc mật khẩu")
                setLoading(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            setError("Đã xảy ra lỗi")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-purple-200/30 blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[60vh] h-[60vh] rounded-full bg-indigo-200/30 blur-[100px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50vh] h-[50vh] rounded-full bg-blue-200/30 blur-[100px]" />
            </div>

            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Đăng Nhập</CardTitle>
                    <CardDescription>
                        Nhập thông tin tài khoản để truy cập
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="username"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mật khẩu</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-center justify-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Đăng nhập
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-xs text-slate-400 mt-4">
                        Quản Lý Tài Chính &copy; 2024
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
