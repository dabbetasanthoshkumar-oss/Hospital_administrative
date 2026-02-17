import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Receipt, CreditCard, DollarSign } from 'lucide-react'

export default async function BillingPage() {
    const supabase = await createClient()

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

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Billing & Invoices</h1>
                <p className="text-blue-100/60 font-medium">Manage hospital revenue and patient payments</p>
            </header>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Total Revenue</CardTitle>
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">
                            ${bills?.reduce((acc, b) => acc + (b.payment_status === 'paid' ? Number(b.total_amount) : 0), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">From paid invoices</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Pending Payments</CardTitle>
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">
                            ${bills?.reduce((acc, b) => acc + (b.payment_status === 'pending' ? Number(b.total_amount) : 0), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Outstanding balances</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">System Health</CardTitle>
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Receipt className="w-5 h-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">100%</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Automated billing active</p>
                    </CardContent>
                </Card>
            </div>

            <div className="glass-card border-none overflow-hidden pb-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-8 py-6">Patient</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Date</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Amount</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Status</TableHead>
                            <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-8 py-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills?.map((bill) => (
                            <TableRow key={bill.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="pl-8 py-5">
                                    <div className="font-bold text-white text-sm">{(bill.appointment as any)?.patient?.full_name}</div>
                                    <div className="text-[10px] font-black text-blue-100/30 uppercase tracking-tighter">{(bill.appointment as any)?.patient?.patient_id}</div>
                                </TableCell>
                                <TableCell className="text-blue-100/60 font-medium text-sm py-5">
                                    {new Date((bill.appointment as any)?.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="font-black text-primary text-base py-5">${Number(bill.total_amount).toFixed(2)}</TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="outline" className={`
                                        rounded-lg font-black text-[9px] tracking-widest px-2.5 py-1 border-none uppercase
                                        ${bill.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
                                    `}>
                                        {bill.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8 py-5">
                                    <button className="px-5 py-2.5 glass-button jelly text-white text-[10px] font-black tracking-widest uppercase rounded-xl">
                                        View Details
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!bills || bills.length === 0) && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="text-center py-32">
                                    <Receipt className="h-16 w-16 mx-auto mb-6 text-white/5" />
                                    <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">No financial records detected</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
