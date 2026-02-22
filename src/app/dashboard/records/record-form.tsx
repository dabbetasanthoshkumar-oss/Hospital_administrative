'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMedicalRecord } from './actions'
import { FileText, Loader2, AlertCircle, Plus, X, Thermometer, ClipboardList } from 'lucide-react'

export function RecordForm({ patients, appointments }: { patients: any[], appointments: any[] }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        try {
            const result = await createMedicalRecord(formData)
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
                New Diagnostic Record
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl glass-card border-none overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        Clinical Documentation
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

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200 ml-1">Patient Subject</Label>
                                <select name="patient_id" required className="flex h-12 w-full rounded-xl border-none glass-input bg-transparent px-4 py-2 text-sm text-slate-100 placeholder:text-slate-300 focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer">
                                    <option value="" className="bg-[#0a0f1e]">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id} className="bg-[#0a0f1e]">{p.full_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200 ml-1">Active Appointment</Label>
                                <select name="appointment_id" required className="flex h-12 w-full rounded-xl border-none glass-input bg-transparent px-4 py-2 text-sm text-slate-100 placeholder:text-slate-300 focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer">
                                    <option value="" className="bg-[#0a0f1e]">Link Appointment</option>
                                    {appointments.filter(a => a.status === 'scheduled').map(a => (
                                        <option key={a.id} value={a.id} className="bg-[#0a0f1e]">
                                            {new Date(a.appointment_date).toLocaleDateString()} - {a.patients?.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200 ml-1 flex items-center gap-2">
                                <Thermometer className="h-3 w-3" /> Preliminary Diagnosis
                            </Label>
                            <Input name="diagnosis" placeholder="e.g. Acute Viral Infection" required className="h-12 glass-input border-none text-slate-100 placeholder:text-slate-300 rounded-xl" />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200 ml-1 flex items-center gap-2">
                                <ClipboardList className="h-3 w-3" /> Pharmaceutical Prescription
                            </Label>
                            <textarea
                                name="prescription_text"
                                placeholder="List medications and dosage instructions..."
                                className="w-full min-h-[100px] p-4 glass-input border-none text-slate-100 placeholder:text-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-primary/50 outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200 ml-1">Clinical Observations</Label>
                            <textarea
                                name="notes"
                                placeholder="Enter detailed treatment plan and observations..."
                                className="w-full min-h-[120px] p-4 glass-input border-none text-slate-100 placeholder:text-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-primary/50 outline-none resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Archiving...' : 'Commit to History'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
