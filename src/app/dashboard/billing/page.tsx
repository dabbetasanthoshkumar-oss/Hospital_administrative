'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Receipt, CreditCard, DollarSign, TrendingUp, HandCoins } from 'lucide-react'
import { BillingActions } from './billing-actions'
import { PaymentModal } from '@/components/billing/payment-modal'
import { useAuth } from '@/components/auth-context'

export default function BillingPage() {
    const { profile } = useAuth()
    const [bills, setBills] = useState<any[]>([])
    const [unbilledAppts, setUnbilledAppts] = useState<any[]>([])
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState<any>(null)
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                
                const billsRes = await supabase
                    .from('billing')
                    .select('*,appointment:appointments(appointment_date,patient:patients(full_name, patient_id),doctor:doctors(profiles(full_name)))')
                    .order('created_at', { ascending: false })
                
                setBills(billsRes.data || [])
                
                const billedIds = (billsRes.data || []).map(b => b.appointment_id)
                const unRes = await supabase
                    .from('appointments')
                    .select('id, appointment_date, patients(full_name, patient_id)')
                    .eq('status', 'completed')
                    .not('id', 'in', billedIds.length > 0 ? `(${billedIds.map(id => `"${id}"`).join(',')})` : '("00000000-0000-0000-0000-000000000000")')
                    .order('appointment_date', { ascending: false })
                    .limit(20)
                    
                setUnbilledAppts(unRes.data || [])
            } catch (error) {
                console.error('Failed to load billing data:', error)
            }
        }
        loadData()
    }, [])

    const totalRevenue = bills?.reduce((acc, b) =>
        acc + (b.payment_status === 'paid' ? Number(b.total_amount) : 0), 0) ?? 0
    const totalPending = bills?.reduce((acc, b) =>
        acc + (b.payment_status !== 'paid' ? Number(b.total_amount) : 0), 0) ?? 0
    const paidCount = bills?.filter(b => b.payment_status === 'paid').length ?? 0

    const handleMarkPaid = async (billId: string) => {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            )
            await supabase.from('billing').update({ payment_status: 'paid' }).eq('id', billId)
            setBills(bills.map(b => b.id === billId ? { ...b, payment_status: 'paid' } : b))
        } catch (error) {
            console.error('Failed to mark paid:', error)
        }
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Billing & Invoices</h1>
                    <p className="text-blue-100/60 font-medium">Manage hospital revenue and patient payments</p>
                </div>
            </header>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="glass-card border-none relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Total Revenue</CardTitle>
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tight mb-1">
                            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase">{paidCount} paid invoice{paidCount !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Pending</CardTitle>
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tight mb-1">
                            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase">Outstanding balances</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Total Invoices</CardTitle>
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tight mb-1">{bills?.length ?? 0}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase">All time records</p>
                    </CardContent>
                </Card>
            </div>

            <BillingActions unbilledAppointments={(unbilledAppts as any[]) || []} />

            {/* Billing Table */}
            <div className="glass-card border-none overflow-hidden rounded-2xl">
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-bold text-white">Invoice Records</h2>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-6 py-5">Patient</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Date</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Consult</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Lab</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Medicine</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Total</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Status</TableHead>
                                <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-6 py-5">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills?.map((bill) => (
                                <TableRow key={bill.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-bold text-white text-sm">{(bill.appointment as any)?.patient?.full_name ?? '—'}</div>
                                        <div className="text-[10px] font-black text-blue-100/30 uppercase">{(bill.appointment as any)?.patient?.patient_id}</div>
                                    </TableCell>
                                    <TableCell className="text-blue-100/60 font-medium text-sm py-4">
                                        {(bill.appointment as any)?.appointment_date
                                            ? new Date((bill.appointment as any).appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-blue-100/60 text-sm py-4">₹{Number(bill.consultation_fee).toFixed(2)}</TableCell>
                                    <TableCell className="text-blue-100/60 text-sm py-4">₹{Number(bill.lab_charges).toFixed(2)}</TableCell>
                                    <TableCell className="text-blue-100/60 text-sm py-4">₹{Number(bill.medicine_charges).toFixed(2)}</TableCell>
                                    <TableCell className="font-black text-primary text-sm py-4">₹{Number(bill.total_amount).toFixed(2)}</TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={`rounded-lg font-black text-[9px] tracking-widest px-2.5 py-1 border-none uppercase
                                            ${bill.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400'
                                                : bill.payment_status === 'partially_paid' ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-amber-500/20 text-amber-400'}`}>
                                            {bill.payment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        {bill.payment_status !== 'paid' && (profile?.role === 'receptionist' || profile?.role === 'admin') && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedBill(bill)
                                                    setIsPaymentModalOpen(true)
                                                }} 
                                                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 group"
                                            >
                                                <HandCoins className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                                Process Payment
                                            </button>
                                        )}
                                        {bill.payment_status === 'paid' && (
                                            <Badge variant="outline" className="bg-white/5 text-white/20 border-none rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                                                Finalized
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedBill && (
                <PaymentModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false)
                        setSelectedBill(null)
                    }}
                    billingId={selectedBill.id}
                    amount={Number(selectedBill.total_amount)}
                    patientName={(selectedBill.appointment as any)?.patient?.full_name ?? 'Patient'}
                />
            )}
        </div>
    )
}
