"use client"

import { createCategory } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRef } from "react"

export function CreateCategoryForm() {
    const ref = useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        await createCategory(formData)
        ref.current?.reset()
    }

    return (
        <form ref={ref} action={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Tên Hạng Mục</Label>
                    <Input name="name" placeholder="Ví dụ: Tiền Thuê Nhà..." className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block text-xs uppercase font-bold text-slate-500">Loại Giao Dịch</Label>
                        <RadioGroup defaultValue="EXPENSE" name="type" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="EXPENSE" id="type-exp" />
                                <Label htmlFor="type-exp" className="cursor-pointer">Chi Tiêu</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="INCOME" id="type-inc" />
                                <Label htmlFor="type-inc" className="cursor-pointer">Thu Nhập</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs uppercase font-bold text-slate-500">Đối Tượng</Label>
                        <RadioGroup defaultValue="PERSONAL" name="owner" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PERSONAL" id="owner-per" />
                                <Label htmlFor="owner-per" className="cursor-pointer">Cá Nhân</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="COMPANY" id="owner-com" />
                                <Label htmlFor="owner-com" className="cursor-pointer">Công Ty</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <Button type="submit" className="h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white w-full">
                Tạo Hạng Mục
            </Button>
        </form>
    )
}
