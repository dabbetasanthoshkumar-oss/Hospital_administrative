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
import { ShieldAlert, UserCheck, Clock } from 'lucide-react'

export default async function AuditPage() {
    const supabase = await createClient()

    const { data: logs } = await supabase
        .from('audit_logs')
        .select(`
      *,
      profiles:user_id(full_name, role)
    `)
        .order('timestamp', { ascending: false })
        .limit(50)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold italic tracking-tight">Security Audit Logs</h1>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Administrator Exclusive Access</p>
                    </div>
                </div>
            </div>

            <div className="border border-red-100 rounded-xl bg-white shadow-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold">Staff Member</TableHead>
                            <TableHead className="font-bold">Action</TableHead>
                            <TableHead className="font-bold">Resource</TableHead>
                            <TableHead className="font-bold">Timestamp</TableHead>
                            <TableHead className="text-right font-bold">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <div className="font-semibold text-slate-700">{(log.profiles as any)?.full_name || 'System'}</div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">{(log.profiles as any)?.role || 'Trigger'}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        log.action === 'INSERT' ? 'secondary' :
                                            log.action === 'UPDATE' ? 'outline' :
                                                'destructive'
                                    } className="rounded-md font-mono text-[10px]">
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-slate-500">{log.table_name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                                        <Clock className="h-3 w-3" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs transition-colors font-bold">
                                        INSPECT DATA
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!logs || logs.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground bg-slate-50/30">
                                    <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    <p className="font-medium">No audit entries available. System is fresh.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
