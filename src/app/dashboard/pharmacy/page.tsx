import { createAdminClient } from '@/lib/supabase-admin'
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
import { Pill, AlertTriangle, PackageSearch } from 'lucide-react'
import { InventoryForm } from './inventory-form'

export default async function PharmacyPage() {
    const supabase = createAdminClient()

    const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .order('medicine_name', { ascending: true })

    const lowStockItems = inventory?.filter(i => i.quantity <= i.low_stock_threshold)
    const expiringSoon = inventory?.filter(i => {
        if (!i.expiry_date) return false
        const expDate = new Date(i.expiry_date)
        const now = new Date()
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays < 30 && diffDays > 0
    })

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Pharmacy & Inventory</h1>
                    <p className="text-blue-100/60 font-medium text-sm">Control medicine stock and pharmaceutical supply chain</p>
                </div>
                <InventoryForm />
            </header>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-red-400 uppercase tracking-widest">Low Stock Alerts</CardTitle>
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">{lowStockItems?.length || 0}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Items below safety threshold</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 text-amber-500">
                        <CardTitle className="text-xs font-black text-amber-400 uppercase tracking-widest">Expiry Warnings</CardTitle>
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <Pill className="w-5 h-5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">{expiringSoon?.length || 0}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Expiring within 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="glass-card border-none overflow-hidden pb-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-8 py-6">Medicine Name</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Quantity</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Expiry Date</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Supplier</TableHead>
                            <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-8 py-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory?.map((item) => (
                            <TableRow key={item.id} className={`border-white/5 transition-colors ${item.quantity <= item.low_stock_threshold ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-white/5"}`}>
                                <TableCell className="pl-8 py-5 font-bold text-white text-sm">{item.medicine_name}</TableCell>
                                <TableCell className="py-5">
                                    <span className={`text-sm font-black ${item.quantity <= item.low_stock_threshold ? "text-red-400" : "text-blue-100/70"}`}>
                                        {item.quantity}
                                    </span>
                                </TableCell>
                                <TableCell className="text-blue-100/40 text-xs font-medium py-5">
                                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-blue-100/40 text-xs font-bold py-5">{item.supplier || '-'}</TableCell>
                                <TableCell className="text-right pr-8 py-5">
                                    {item.quantity <= item.low_stock_threshold ? (
                                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                            Refill Needed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                            In Stock
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!inventory || inventory.length === 0) && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="text-center py-32">
                                    <PackageSearch className="h-16 w-16 mx-auto mb-6 text-white/5" />
                                    <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">Inventory empty</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
