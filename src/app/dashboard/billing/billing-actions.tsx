'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrUpdateBilling } from './actions'
import { Receipt, Loader2, ChevronDown } from 'lucide-react'

interface UnbilledAppointment {
    id: string
    appointment_date: string
    patients: { full_name: string; patient_id: string } | null
}

export function BillingActions({ unbilledAppointments }: { unbilledAppointments: UnbilledAppointment[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        const fd = new FormData(e.currentTarget)
        const result = await createOrUpdateBilling({
            appointment_id: fd.get('appointment_id') as string,
            consultation_fee: Number(fd.get('consultation_fee')) || 0,
            lab_charges: Number(fd.get('lab_charges')) || 0,
            medicine_charges: Number(fd.get('medicine_charges')) || 0,
            payment_status: fd.get('payment_status') as any,
        })

        setLoading(false)
        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setOpen(false)
            setTimeout(() => setSuccess(false), 3000)
            router.refresh()
        }
    }

    if (unbilledAppointments.length === 0 && !open) {
        return success ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold">
                ✓ Invoice created successfully
            </div>
        ) : null
    }

    return (
        <div className="glass-card rounded-2xl overflow-hidden border-none">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <span className="font-bold text-white text-sm">Create Invoice</span>
                        <p className="text-[10px] text-blue-100/40 font-bold uppercase tracking-wider">
                            {unbilledAppointments.length} completed appointment{unbilledAppointments.length !== 1 ? 's' : ''} need billing
                        </p>
                    </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-blue-100/40 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="px-6 pb-6 border-t border-white/10 pt-6">
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
                            ✓ Invoice created successfully
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Select Appointment</label>
                                <select
                                    name="appointment_id"
                                    required
                                    className="w-full h-11 glass-input rounded-xl border-none text-white text-sm px-3 bg-transparent outline-none"
                                >
                                    <option value="" className="bg-[#0a0f1e]">Choose completed appointment…</option>
                                    {unbilledAppointments.map(a => (
                                        <option key={a.id} value={a.id} className="bg-[#0a0f1e]">
                                            {a.patients?.full_name} — {new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Consultation Fee (₹)</label>
                                <input name="consultation_fee" type="number" min="0" step="0.01" defaultValue="0"
                                    className="w-full h-11 glass-input rounded-xl border-none text-white text-sm px-3 bg-transparent outline-none focus:ring-1 focus:ring-primary/50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Lab Charges (₹)</label>
                                <input name="lab_charges" type="number" min="0" step="0.01" defaultValue="0"
                                    className="w-full h-11 glass-input rounded-xl border-none text-white text-sm px-3 bg-transparent outline-none focus:ring-1 focus:ring-primary/50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Medicine Charges (₹)</label>
                                <input name="medicine_charges" type="number" min="0" step="0.01" defaultValue="0"
                                    className="w-full h-11 glass-input rounded-xl border-none text-white text-sm px-3 bg-transparent outline-none focus:ring-1 focus:ring-primary/50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Payment Status</label>
                                <select name="payment_status" required
                                    className="w-full h-11 glass-input rounded-xl border-none text-white text-sm px-3 bg-transparent outline-none">
                                    <option value="pending" className="bg-[#0a0f1e]">Pending</option>
                                    <option value="paid" className="bg-[#0a0f1e]">Paid</option>
                                    <option value="partially_paid" className="bg-[#0a0f1e]">Partially Paid</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</> : 'Generate Invoice'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
