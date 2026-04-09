'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ClipboardList, Thermometer } from 'lucide-react'
import { RecordForm } from './record-form'

export default function RecordsPage() {
    const [patients, setPatients] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [records, setRecords] = useState<any[]>([])
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                
                const [patientsRes, appointmentsRes, recordsRes] = await Promise.all([
                    supabase.from('patients').select('id, full_name'),
                    supabase.from('appointments').select('id, appointment_date, status, patients(full_name)').order('appointment_date', { ascending: false }),
                    supabase.from('medical_records').select('*,patients(full_name, patient_id),doctors(profiles(full_name))').order('created_at', { ascending: false })
                ])
                
                setPatients(patientsRes.data || [])
                setAppointments(appointmentsRes.data || [])
                setRecords(recordsRes.data || [])
            } catch (error) {
                console.error('Failed to load records:', error)
            }
        }
        loadData()
    }, [])

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Medical History</h1>
                    <p className="text-blue-100/60 font-medium text-sm">Chronicling patient clinical journeys</p>
                </div>
                <RecordForm patients={patients || []} appointments={appointments || []} />
            </header>

            <div className="grid gap-8">
                {records?.map((record) => (
                    <Card key={record.id} className="glass-card border-none relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                        <CardHeader className="bg-white/5 pb-6 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-white/10 to-primary/20 flex items-center justify-center text-white font-black shadow-lg">
                                        {(record.patients as any)?.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white">{(record.patients as any)?.full_name}</CardTitle>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{(record.patients as any)?.patient_id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white mb-1">{new Date(record.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] text-blue-100/40 font-black uppercase tracking-tighter">Consultant: Dr. {(record.doctors as any)?.profiles?.full_name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 grid gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-3 text-xs font-black text-blue-100/60 uppercase tracking-widest mb-3">
                                        <div className="p-1.5 bg-red-500/20 rounded-lg">
                                            <Thermometer className="h-4 w-4 text-red-400" />
                                        </div>
                                        Diagnosis
                                    </h4>
                                    <div className="text-sm text-white font-medium leading-relaxed bg-white/10 p-4 rounded-2xl border border-white/5">{record.diagnosis}</div>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-3 text-xs font-black text-blue-100/60 uppercase tracking-widest mb-3">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                            <ClipboardList className="h-4 w-4 text-blue-400" />
                                        </div>
                                        Prescription
                                    </h4>
                                    <pre className="text-sm text-white font-bold font-mono whitespace-pre-wrap bg-primary/20 p-4 rounded-2xl border border-primary/10">{record.prescription_text || 'No prescription issued.'}</pre>
                                </div>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-3 text-xs font-black text-blue-100/60 uppercase tracking-widest mb-3">
                                    <div className="p-1.5 bg-amber-500/20 rounded-lg">
                                        <FileText className="h-4 w-4 text-amber-400" />
                                    </div>
                                    Clinical Notes
                                </h4>
                                <p className="text-sm text-white font-medium leading-relaxed bg-white/10 p-4 rounded-2xl border border-white/5 min-h-[160px]">{record.notes || 'No additional notes provided.'}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!records || records.length === 0) && (
                    <div className="text-center py-32 glass-card border-none">
                        <FileText className="h-16 w-16 text-white/5 mx-auto mb-6" />
                        <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">Clinical archives are empty</p>
                    </div>
                )}
            </div>
        </div>
    )
}
