'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertInventory } from './actions'
import { Pill, Loader2, AlertCircle, Plus, X } from 'lucide-react'

export function InventoryForm() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            medicine_name: formData.get('medicine_name') as string,
            quantity: parseInt(formData.get('quantity') as string),
            expiry_date: formData.get('expiry_date') as string,
            supplier: formData.get('supplier') as string,
            low_stock_threshold: parseInt(formData.get('low_stock_threshold') as string) || 10,
        }

        try {
            const result = await upsertInventory(data)
            if (result?.error) {
                setError(result.error)
            } else {
                setIsOpen(false)
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 glass-button jelly rounded-2xl flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs"
            >
                <Plus className="h-4 w-4" />
                Provision Inventory
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-lg glass-card border-none overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <Pill className="h-6 w-6 text-primary" />
                        Inventory Entry
                    </CardTitle>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-blue-100/20 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Medicine Nomenclature</Label>
                            <Input name="medicine_name" placeholder="e.g. Amoxicillin 500mg" required className="h-12 glass-input border-none text-white rounded-xl" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Supply Count</Label>
                                <Input name="quantity" type="number" placeholder="0" required className="h-12 glass-input border-none text-white rounded-xl" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Safe Threshold</Label>
                                <Input name="low_stock_threshold" type="number" placeholder="10" className="h-12 glass-input border-none text-white rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Expiration Chrono</Label>
                            <Input name="expiry_date" type="date" required className="h-12 glass-input border-none text-white rounded-xl" />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Vendor/Supplier</Label>
                            <Input name="supplier" placeholder="e.g. PharmaCorp Global" className="h-12 glass-input border-none text-white rounded-xl" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Processing...' : 'Execute Stocking'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
