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
        <div className="space-y-10">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-xl jelly">
                        <ShieldAlert className="h-7 w-7 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white mb-1 uppercase">Security Audit</h1>
                        <p className="text-blue-100/40 text-[10px] font-black uppercase tracking-[0.3em]">Access Level: Administrator Protocol</p>
                    </div>
                </div>
            </header>

            <div className="glass-card border-none overflow-hidden pb-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-8 py-6">Staff Member</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Action</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Resource</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Timestamp</TableHead>
                            <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-8 py-6">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.map((log) => (
                            <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="pl-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <UserCheck className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{(log.profiles as any)?.full_name || 'System'}</div>
                                            <div className="text-[10px] uppercase font-black text-blue-100/30 tracking-tighter">{(log.profiles as any)?.role || 'Trigger'}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="outline" className={`
                                        rounded-lg font-black text-[9px] tracking-widest px-2 py-0.5 border-none
                                        ${log.action === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400' :
                                            log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-red-500/20 text-red-400'}
                                    `}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-sm text-blue-100/70 py-5">{log.table_name}</TableCell>
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-2 text-blue-100/40 text-xs font-medium">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8 py-5">
                                    <button className="px-4 py-2 glass-button jelly text-primary text-[10px] font-black tracking-widest uppercase rounded-xl">
                                        Inspect
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!logs || logs.length === 0) && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="text-center py-32">
                                    <ShieldAlert className="h-16 w-16 mx-auto mb-6 text-white/5" />
                                    <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">Secure Node: No Entries Detected</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
