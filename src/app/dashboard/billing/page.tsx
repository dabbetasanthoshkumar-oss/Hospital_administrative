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
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground text-sm">Manage hospital revenue and patient payments</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${bills?.reduce((acc, b) => acc + (b.payment_status === 'paid' ? Number(b.total_amount) : 0), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">From paid invoices</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${bills?.reduce((acc, b) => acc + (b.payment_status === 'pending' ? Number(b.total_amount) : 0), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Outstanding balances</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">System check in progress</p>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills?.map((bill) => (
                            <TableRow key={bill.id}>
                                <TableCell>
                                    <div className="font-medium">{(bill.appointment as any)?.patient?.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{(bill.appointment as any)?.patient?.patient_id}</div>
                                </TableCell>
                                <TableCell>{new Date((bill.appointment as any)?.appointment_date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-bold">${Number(bill.total_amount).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={bill.payment_status === 'paid' ? 'secondary' : 'outline'}>
                                        {bill.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    <button className="text-primary hover:underline font-medium text-sm">View Details</button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!bills || bills.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No billing records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
