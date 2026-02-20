'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAppointment } from './actions'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Patient {
    id: string
    full_name: string
}

interface Doctor {
    id: string
    specialization: string
    profiles: {
        full_name: string
    }
}

export function AppointmentForm({ patients, doctors }: { patients: Patient[], doctors: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await createAppointment(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000)
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="lg:col-span-2 glass-card border-none self-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <CardHeader className="pt-10 px-8">
                <CardTitle className="text-2xl font-bold text-white uppercase tracking-tight">Schedule Node</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-10">
                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Appointment scheduled successfully!
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <Label htmlFor="patient_id" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Select Patient</Label>
                        <select
                            id="patient_id"
                            name="patient_id"
                            required
                            className="flex h-14 w-full rounded-2xl border-none glass-input bg-transparent px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#0a0f1e]">Choose Patient Protocol</option>
                            {patients.map(p => <option key={p.id} value={p.id} className="bg-[#0a0f1e]">{p.full_name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="doctor_id" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Assign Specialist</Label>
                        <select
                            id="doctor_id"
                            name="doctor_id"
                            required
                            className="flex h-14 w-full rounded-2xl border-none glass-input bg-transparent px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#0a0f1e]">Assign MD</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id} className="bg-[#0a0f1e]">
                                    {d.profiles?.full_name} ({d.specialization})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="appointment_date" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Chronology Set</Label>
                        <Input
                            id="appointment_date"
                            name="appointment_date"
                            type="datetime-local"
                            required
                            className="h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl px-4"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {loading ? 'Processing...' : 'Book Appointment'}
                    </button>
                </form>
            </CardContent>
        </Card>
    )
}
