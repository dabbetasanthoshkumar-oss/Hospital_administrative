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
import { Pill, AlertTriangle, PackageSearch } from 'lucide-react'

export default async function PharmacyPage() {
    const supabase = await createClient()

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
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Pharmacy & Inventory</h1>
                    <p className="text-muted-foreground text-sm">Control medicine stock and pharmaceutical supply chain</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-red-600">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{lowStockItems?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Items below safety threshold</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-amber-600">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Expiry Warnings</CardTitle>
                        <Pill className="w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{expiringSoon?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Expiring within 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Medicine Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory?.map((item) => (
                            <TableRow key={item.id} className={item.quantity <= item.low_stock_threshold ? "bg-red-50/50" : ""}>
                                <TableCell className="font-medium">{item.medicine_name}</TableCell>
                                <TableCell>
                                    <span className={item.quantity <= item.low_stock_threshold ? "text-red-600 font-bold" : ""}>
                                        {item.quantity}
                                    </span>
                                </TableCell>
                                <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>{item.supplier || '-'}</TableCell>
                                <TableCell className="text-right">
                                    {item.quantity <= item.low_stock_threshold ? (
                                        <Badge variant="destructive">Refill Needed</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!inventory || inventory.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center">
                                        <PackageSearch className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No inventory items found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
