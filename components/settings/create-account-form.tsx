"use client"

import { createAccount } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef } from "react"

export function CreateAccountForm() {
    const ref = useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        await createAccount(formData)
        ref.current?.reset()
    }

    return (
        <form ref={ref} action={handleSubmit} className="space-y-4 md:flex md:space-y-0 md:gap-4 items-end">
            <div className="flex-1 space-y-2">
                <Label htmlFor="acc-name">Tên Ví / Ngân Hàng</Label>
                <Input id="acc-name" name="name" placeholder="Ví dụ: MB Bank..." className="h-12 rounded-xl" required />
            </div>
            <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="acc-bal">Số Dư Ban Đầu</Label>
                <Input id="acc-bal" name="initialBalance" type="number" placeholder="0" className="h-12 rounded-xl" />
            </div>
            <Button type="submit" className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 w-full md:w-auto">
                Tạo Ví
            </Button>
        </form>
    )
}
