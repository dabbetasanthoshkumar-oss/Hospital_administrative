'use client'

import { useState, useEffect } from 'react'
import { Pill, Activity, Receipt, Package, Search, Clock, CheckCircle2, AlertCircle, ChevronRight, BarChart3, PillIcon, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase-client'
import { dispensePrescriptionAction } from '@/app/dashboard/pharmacy/actions'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export function PharmacistDashboard() {
    const [prescriptions, setPrescriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    async function fetchPrescriptions() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
                    *,
                    patient:patients(full_name),
                    medical_record:medical_records(diagnosis)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPrescriptions(data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load prescriptions: ' + error.message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleDispense(id: string) {
        try {
            const res = await dispensePrescriptionAction(id)
            if (res.error) throw new Error(res.error)

            toast({
                title: 'Success',
                description: 'Prescription dispensed successfully',
            })
            fetchPrescriptions()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        }
    }

    const filteredPrescriptions = prescriptions.filter(rx => 
        rx.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                        <PillIcon className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pharmacy Operations Active</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Medication <span className="text-amber-400">Management</span></h1>
                    <p className="text-blue-100/40 font-medium">Processing prescriptions, dispensing, and inventory control</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-amber-400 transition-colors" />
                        <Input 
                            placeholder="Find Patient or Medicine..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 glass-input border-none text-xs font-bold rounded-2xl h-12 text-white"
                        />
                    </div>
                </div>
            </header>

            {/* Inventory Quick View */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                {[
                    { label: 'Pending Dispense', value: prescriptions.length.toString(), color: 'text-amber-400' },
                    { label: 'Completed Today', value: '86', color: 'text-emerald-400' },
                    { label: 'Stock Alerts', value: '5', color: 'text-rose-400' },
                    { label: 'Store Temp', value: '4.2°C', color: 'text-blue-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-white/5 bg-white/2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/20 mb-2">{stat.label}</p>
                        <h3 className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Prescription Queue */}
                <Card className="lg:col-span-2 glass-card border-none bg-white/2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Dispensing Queue</CardTitle>
                        <Button 
                            variant="ghost" 
                            onClick={fetchPrescriptions}
                            className="h-8 px-4 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/10 rounded-xl"
                        >
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-blue-100/20">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Loading Prescriptions...</p>
                            </div>
                        ) : filteredPrescriptions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                <p className="text-sm font-bold text-blue-100/20">No pending prescriptions found</p>
                            </div>
                        ) : (
                            filteredPrescriptions.map((rx) => (
                                <div key={rx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group jelly">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex flex-col items-center justify-center font-black text-[10px] text-blue-100/20 group-hover:text-amber-400 transition-colors">
                                            <Receipt className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                                {rx.medicine_name} <span className="text-blue-100/30 ml-2 font-normal">({rx.dosage})</span>
                                            </p>
                                            <p className="text-[10px] text-blue-100/30 font-medium uppercase tracking-widest">
                                                Patient: {rx.patient?.full_name} · {format(new Date(rx.created_at), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-blue-100/20 uppercase tracking-tighter leading-none">{rx.duration}</p>
                                        </div>
                                        <Button 
                                            size="sm"
                                            onClick={() => handleDispense(rx.id)}
                                            className="bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-widest px-4 rounded-xl shadow-lg shadow-amber-500/20"
                                        >
                                            Dispense
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Stock Alerts & Inventory */}
                <div className="space-y-6">
                    <Card className="glass-card border-none bg-rose-500/5 border-rose-500/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight mb-1">Amoxicillin 250mg</p>
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">12 units left (Threshold 20)</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight mb-1">Insulin Glargine</p>
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">5 units left (Threshold 10)</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none bg-white/2">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/40">Pharmacy Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">Automated Refill</p>
                                <p className="text-xs text-blue-100/60 leading-relaxed font-medium">System has automated a restock order for Paracetamol 500mg from GlobalPharma.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 leading-none">Dispensing Efficiency</p>
                                <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Your average dispensing time is 4.5m per RX, 12% faster than last month.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
