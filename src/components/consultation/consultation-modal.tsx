'use client'

import React, { useState, useEffect } from 'react'
import { 
    Stethoscope, 
    Pill, 
    ClipboardList, 
    AlertCircle, 
    CheckCircle2, 
    Plus, 
    Trash2, 
    Sparkles, 
    Loader2,
    ShieldAlert
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
    getAIDiagnosisSuggestions, 
    checkDrugInteractionsAction,
    getSmartHealthTipsAction
} from '@/app/dashboard/ai-actions'
import { completeConsultationAction } from '@/app/dashboard/appointments/actions'
import { useToast } from '@/hooks/use-toast'

interface Medicine {
    medicine_name: string
    dosage: string
    duration: string
    instructions: string
}

interface ConsultationModalProps {
    isOpen: boolean
    onClose: () => void
    appointmentId: string
    patientId: string
    doctorId: string
    patientName: string
}

export function ConsultationModal({ 
    isOpen, 
    onClose, 
    appointmentId, 
    patientId, 
    doctorId, 
    patientName 
}: ConsultationModalProps) {
    const { toast } = useToast()
    const [diagnosis, setDiagnosis] = useState('')
    const [symptoms, setSymptoms] = useState<string[]>([])
    const [symptomInput, setSymptomInput] = useState('')
    const [notes, setNotes] = useState('')
    const [medicines, setMedicines] = useState<Medicine[]>([])
    
    // AI States
    const [isAILoading, setIsAILoading] = useState(false)
    const [interactionAlerts, setInteractionAlerts] = useState<any[]>([])
    const [aiSuggestions, setAiSuggestions] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Check interactions whenever medicines change
    useEffect(() => {
        const checkInteractions = async () => {
            if (medicines.length < 2) {
                setInteractionAlerts([])
                return
            }
            const medNames = medicines.map(m => m.medicine_name)
            const result = await checkDrugInteractionsAction(medNames)
            if (result.success) {
                setInteractionAlerts(result.data || [])
            }
        }
        const timer = setTimeout(checkInteractions, 1000)
        return () => clearTimeout(timer)
    }, [medicines])

    const handleAddSymptom = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && symptomInput.trim()) {
            e.preventDefault()
            setSymptoms([...symptoms, symptomInput.trim()])
            setSymptomInput('')
        }
    }

    const removeSymptom = (index: number) => {
        setSymptoms(symptoms.filter((_, i) => i !== index))
    }

    const handleAddMedicine = () => {
        setMedicines([...medicines, { medicine_name: '', dosage: '', duration: '', instructions: '' }])
    }

    const udpateMedicine = (index: number, field: keyof Medicine, value: string) => {
        const newMeds = [...medicines]
        newMeds[index] = { ...newMeds[index], [field]: value }
        setMedicines(newMeds)
    }

    const removeMedicine = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index))
    }

    const handleAIAssist = async () => {
        if (symptoms.length === 0) {
            toast({
                title: "Incomplete Data",
                description: "Please add symptoms for AI analysis.",
                variant: "destructive"
            })
            return
        }
        setIsAILoading(true)
        try {
            const [diagRes, tipsRes] = await Promise.all([
                getAIDiagnosisSuggestions(symptoms),
                getSmartHealthTipsAction(patientId)
            ])
            
            if (diagRes.success) {
                setAiSuggestions({
                    diagnosis: diagRes.data,
                    tips: tipsRes.success ? tipsRes.data : []
                })
                setDiagnosis(diagRes.data.suggestedDiagnosis)
                toast({
                    title: "AI Analysis Complete",
                    description: "Suggested diagnosis and healthy tips populated."
                })
            }
        } catch (err) {
            toast({
                title: "AI Error",
                description: "AI service temporarily offline.",
                variant: "destructive"
            })
        } finally {
            setIsAILoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!diagnosis) {
            toast({
                title: "Missing Diagnosis",
                description: "Clinical diagnosis is required to complete encounter.",
                variant: "destructive"
            })
            return
        }
        
        setIsSubmitting(true)
        try {
            const result = await completeConsultationAction({
                appointmentId,
                patientId,
                doctorId,
                diagnosis,
                symptoms,
                notes,
                prescriptions: medicines,
                healthSuggestions: aiSuggestions?.tips || []
            })

            if (result.success) {
                toast({
                    title: "Encounter Completed",
                    description: "Medical records and billing have been finalized."
                })
                onClose()
            } else {
                toast({
                    title: "Submission Failed",
                    description: result.error || "Failed to finalize consultation.",
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                title: "Critical Error",
                description: "A database error prevented submission.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-card border-none max-w-4xl max-h-[90vh] overflow-y-auto p-0 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col h-full bg-[#090e1a]/80 backdrop-blur-3xl">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#090e1a]/60 backdrop-blur-xl z-20">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Encounter Mode</Badge>
                                <span className="text-white/20">/</span>
                                <span className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest">{patientName}</span>
                            </div>
                            <DialogTitle className="text-3xl font-black text-white tracking-tighter">Clinical <span className="text-primary italic">Consultation</span></DialogTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleAIAssist}
                                disabled={isAILoading || symptoms.length === 0}
                                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-all"
                            >
                                {isAILoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 group-hover:scale-125 transition-transform" />}
                                AI Assistant
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none border-none"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Complete Encounter
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Symptoms & Diagnosis */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Stethoscope className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Analysis & Findings</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-100/20 uppercase tracking-[0.2em] ml-1">Presenting Symptoms</label>
                                        <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 focus-within:border-primary/40 transition-all min-h-[60px]">
                                            {symptoms.map((s, i) => (
                                                <Badge key={i} className="bg-white/5 hover:bg-white/10 text-white border-white/10 pr-1 py-1 rounded-xl group select-none">
                                                    {s}
                                                    <button onClick={() => removeSymptom(i)} className="ml-1 p-0.5 hover:text-rose-400 transition-colors">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <input
                                                contentEditable
                                                placeholder="Type and press Enter..."
                                                value={symptomInput}
                                                onChange={(e) => setSymptomInput(e.target.value)}
                                                onKeyDown={handleAddSymptom}
                                                className="bg-transparent border-none outline-none text-white text-sm min-w-[200px] py-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-100/20 uppercase tracking-[0.2em] ml-1">Final Diagnosis</label>
                                        <Input
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="Enter clinical diagnosis..."
                                            className="glass-input h-14 rounded-2xl border-none font-bold text-white placeholder:text-blue-100/10"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Clinical Notes */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-500/10 rounded-xl">
                                        <ClipboardList className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Clinical Observations</h3>
                                </div>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter physical examination notes, vital observations..."
                                    className="glass-input min-h-[120px] rounded-2xl border-none font-medium text-white p-6 leading-relaxed"
                                />
                            </section>

                            {/* Prescriptions */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-xl">
                                            <Pill className="h-4 w-4 text-rose-400" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Medication Orders</h3>
                                    </div>
                                    <Button 
                                        onClick={handleAddMedicine}
                                        className="h-9 px-4 bg-white/5 hover:bg-white/10 text-[10px] font-black border border-white/5 rounded-xl uppercase tracking-widest"
                                    >
                                        <Plus className="h-3 w-3 mr-2" /> Add Medicine
                                    </Button>
                                </div>

                                {interactionAlerts.length > 0 && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
                                        <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Drug interaction alert</p>
                                            {interactionAlerts.map((alert, i) => (
                                                <p key={i} className="text-rose-400/70 text-xs leading-relaxed">{alert.message}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {medicines.map((med, i) => (
                                        <div key={i} className="p-6 bg-white/2 rounded-3xl border border-white/5 relative group animate-in slide-in-from-right-4 duration-300">
                                            <button 
                                                onClick={() => removeMedicine(i)}
                                                className="absolute -top-3 -right-3 h-8 w-8 bg-[#090e1a] border border-white/10 rounded-full flex items-center justify-center text-blue-100/20 hover:text-rose-400 hover:border-rose-400/50 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-100/10 ml-1">Medicine Name</label>
                                                    <Input
                                                        value={med.medicine_name}
                                                        onChange={(e) => udpateMedicine(i, 'medicine_name', e.target.value)}
                                                        className="glass-input h-10 border-none rounded-xl font-bold text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-100/10 ml-1">Dosage (e.g., 1-0-1)</label>
                                                    <Input
                                                        value={med.dosage}
                                                        onChange={(e) => udpateMedicine(i, 'dosage', e.target.value)}
                                                        className="glass-input h-10 border-none rounded-xl font-bold text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-100/10 ml-1">Duration</label>
                                                    <Input
                                                        value={med.duration}
                                                        onChange={(e) => udpateMedicine(i, 'duration', e.target.value)}
                                                        className="glass-input h-10 border-none rounded-xl font-bold text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-100/10 ml-1">Instructions</label>
                                                    <Input
                                                        value={med.instructions}
                                                        onChange={(e) => udpateMedicine(i, 'instructions', e.target.value)}
                                                        className="glass-input h-10 border-none rounded-xl font-bold text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {medicines.length === 0 && (
                                        <div className="text-center py-8 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                            <p className="text-[10px] font-black text-blue-100/10 uppercase tracking-[0.2em]">No medications prescribed</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* AI Insight Sidebar */}
                        <div className="space-y-6">
                            <div className="glass-card border-none bg-primary/10 p-6 rounded-3xl relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 blur-3xl rounded-full" />
                                <div className="flex items-center gap-3 mb-6 relative">
                                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">AI Clinical Insights</h4>
                                </div>

                                {aiSuggestions ? (
                                    <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-blue-100/20 uppercase tracking-widest">Confidence Score</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black text-white">{aiSuggestions.diagnosis.confidence}%</span>
                                                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-black px-2">{aiSuggestions.diagnosis.severity}</Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-blue-100/20 uppercase tracking-widest">Personalized Intelligence</p>
                                            {aiSuggestions.tips.map((tip: any, i: number) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">{tip.category}</p>
                                                    <p className="text-[11px] font-medium text-blue-100/60 leading-relaxed">{tip.tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 relative">
                                        <AlertCircle className="h-8 w-8 text-blue-100/5 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-blue-100/10 uppercase tracking-widest leading-relaxed">
                                            Add symptoms and click<br />"AI Assistant" to start analysis
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="glass-card border-none bg-white/2 p-6 rounded-3xl relative">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-100/20 mb-4">Patient Risk Profile</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-blue-100/40 uppercase tracking-widest">General Condition</span>
                                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Moderate</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[65%] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
