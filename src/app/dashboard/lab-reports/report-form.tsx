'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Beaker, Wand2, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth-context'

interface LabReportFormProps {
    onReportAdded: () => void
}

export function LabReportForm({ onReportAdded }: LabReportFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    
    const { profile } = useAuth()
    const [aiInsight, setAiInsight] = useState<string>('')

    const handleAIAnalysis = async () => {
        const form = document.querySelector('form') as HTMLFormElement
        const value = parseFloat((form.elements.namedItem('result_value') as HTMLInputElement).value)
        const range = (form.elements.namedItem('reference_range') as HTMLInputElement).value

        if (!value || !range) {
            alert('Please enter both a value and a reference range first.')
            return
        }

        setIsAnalyzing(true)
        try {
            const { analyzeLabResultAction } = await import('../ai-actions')
            const result = await analyzeLabResultAction(value, range)
            
            if (result.success) {
                const statusSelect = form.elements.namedItem('status') as HTMLSelectElement
                statusSelect.value = result.data.status
                setAiInsight(result.data.insight)
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert('AI analysis failed. Check Python service.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    useEffect(() => {
        if (open) {
            const loadPatients = async () => {
                const supabase = createClient()
                const { data } = await supabase.from('patients').select('id, full_name, patient_id')
                setPatients(data || [])
            }
            loadPatients()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        
        try {
            const supabase = createClient()
            const { error } = await supabase.from('lab_reports').insert({
                patient_id: formData.get('patient_id'),
                test_name: formData.get('test_name'),
                result_value: formData.get('result_value'),
                reference_range: formData.get('reference_range'),
                status: formData.get('status') || 'normal',
                notes: formData.get('notes'),
                doctor_id: profile?.id
            })

            if (!error) {
                setOpen(false)
                onReportAdded()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="px-6 py-3 glass-button jelly rounded-2xl flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                    <PlusCircle className="h-4 w-4" />
                    New Lab Report
                </button>
            </DialogTrigger>
            <DialogContent className="glass-card border-none text-white max-w-lg rounded-[2rem] overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Beaker className="h-32 w-32" />
                </div>
                
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic tracking-tighter">
                        DOCUMENT <span className="text-primary NOT-italic">INVESTIGATION</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4 relative z-10">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Select Patient</Label>
                            <select 
                                name="patient_id" 
                                required
                                className="w-full h-12 bg-white/5 border-none rounded-xl px-4 text-white text-sm focus:ring-1 focus:ring-primary/50 outline-none appearance-none"
                            >
                                <option value="" className="bg-[#050810]">Select a patient...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id} className="bg-[#050810]">
                                        {p.full_name} ({p.patient_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Test Name</Label>
                                <Input name="test_name" placeholder="HB, WBC, etc." required className="h-12 glass-input border-none rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Result Value</Label>
                                <div className="relative group">
                                    <Input name="result_value" placeholder="12.5" required className="h-12 glass-input border-none rounded-xl pr-10" />
                                    <button 
                                        type="button"
                                        onClick={handleAIAnalysis}
                                        disabled={isAnalyzing}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all disabled:opacity-50"
                                        title="AI Analysis"
                                    >
                                        {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {aiInsight && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                                <Wand2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">AI Clinical Insight</p>
                                    <p className="text-xs text-blue-100/60 leading-relaxed font-medium">{aiInsight}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Reference Range</Label>
                                <Input name="reference_range" placeholder="11.0 - 15.0" required className="h-12 glass-input border-none rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Status</Label>
                                <select 
                                    name="status" 
                                    className="w-full h-12 bg-white/5 border-none rounded-xl px-4 text-white text-sm focus:ring-1 focus:ring-primary/50 outline-none appearance-none"
                                >
                                    <option value="normal" className="bg-[#050810]">Normal</option>
                                    <option value="abnormal" className="bg-[#050810]">Abnormal</option>
                                    <option value="critical" className="bg-[#050810]">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">Technical Notes</Label>
                            <textarea 
                                name="notes"
                                className="w-full h-24 bg-white/5 border-none rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-primary/50 outline-none resize-none placeholder:text-blue-100/10"
                                placeholder="Specific observations or findings..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Investigation"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
