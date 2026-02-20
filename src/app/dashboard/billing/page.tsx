import { createAdminClient } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Receipt, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { BillingActions } from './billing-actions'

export default async function BillingPage() {
    const supabase = createAdminClient()

    const { data: bills } = await supabase
        .from('billing')
        .select(`
      *,
      appointment:appointments(
        appointment_date,
        patient:patients(full_name, patient_id),
        doctor:doctors(profiles(full_name))
      )
    `)
        .order('created_at', { ascending: false })

    // Fetch appointments that have no billing record yet
    const { data: unbilledAppts } = await supabase
        .from('appointments')
        .select('id, appointment_date, patients(full_name, patient_id)')
        .eq('status', 'completed')
        .not('id', 'in', `(${bills?.map(b => `"${b.appointment_id}"`).join(',') || '"00000000-0000-0000-0000-000000000000"'})`)
        .order('appointment_date', { ascending: false })
        .limit(20)

    const totalRevenue = bills?.reduce((acc, b) =>
        acc + (b.payment_status === 'paid' ? Number(b.total_amount) : 0), 0) ?? 0
    const totalPending = bills?.reduce((acc, b) =>
        acc + (b.payment_status !== 'paid' ? Number(b.total_amount) : 0), 0) ?? 0
    const paidCount = bills?.filter(b => b.payment_status === 'paid').length ?? 0

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
                                        {bill.payment_status !== 'paid' && (
                                            <form action={async () => {
                                                'use server'
                                                const { createAdminClient: ac } = await import('@/lib/supabase-admin')
                                                const { revalidatePath } = await import('next/cache')
                                                await ac().from('billing').update({ payment_status: 'paid' }).eq('id', bill.id)
                                                revalidatePath('/dashboard/billing')
                                            }}>
                                                <button type="submit" className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-xl transition-colors">
                                                    Mark Paid
                                                </button>
                                            </form>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!bills || bills.length === 0) && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={8} className="text-center py-24">
                                        <Receipt className="h-12 w-12 mx-auto mb-4 text-white/5" />
                                        <p className="font-black text-blue-100/20 uppercase tracking-[0.2em] text-sm">No invoices yet</p>
                                        <p className="text-blue-100/10 text-xs mt-1">Create an invoice from completed appointments above</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
