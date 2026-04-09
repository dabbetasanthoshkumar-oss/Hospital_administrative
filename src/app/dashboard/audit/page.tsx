 'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, UserCheck, Clock, PlusCircle, RefreshCw, Trash2 } from 'lucide-react'

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                const res = await supabase
                    .from('audit_logs')
                    .select('*,profiles:user_id(full_name, role)')
                    .order('timestamp', { ascending: false })
                    .limit(100)
                setLogs(res.data || [])
            } catch (err) {
                console.error('Failed to load audit logs:', err)
            }
        }
        loadLogs()
    }, [])

    const insertCount = logs?.filter(l => l.action === 'INSERT').length ?? 0
    const updateCount = logs?.filter(l => l.action === 'UPDATE').length ?? 0
    const deleteCount = logs?.filter(l => l.action === 'DELETE').length ?? 0

    return (
        <div className="space-y-8">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl flex-shrink-0">
                    <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase">Security Audit</h1>
                    <p className="text-blue-100/40 text-[10px] font-black uppercase tracking-[0.2em]">Administrator Protocol · Last 100 events</p>
                </div>
            </header>

            {/* Summary stats */}
            <div className="grid gap-4 grid-cols-3">
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0"><PlusCircle className="h-4 w-4 text-emerald-400" /></div>
                    <div>
                        <div className="text-2xl font-black text-white">{insertCount}</div>
                        <div className="text-[10px] font-black text-blue-100/30 uppercase tracking-widest">Inserts</div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0"><RefreshCw className="h-4 w-4 text-blue-400" /></div>
                    <div>
                        <div className="text-2xl font-black text-white">{updateCount}</div>
                        <div className="text-[10px] font-black text-blue-100/30 uppercase tracking-widest">Updates</div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0"><Trash2 className="h-4 w-4 text-red-400" /></div>
                    <div>
                        <div className="text-2xl font-black text-white">{deleteCount}</div>
                        <div className="text-[10px] font-black text-blue-100/30 uppercase tracking-widest">Deletes</div>
                    </div>
                </div>
            </div>

            <div className="glass-card border-none overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-6 py-5">Staff</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Action</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Table</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-5">Timestamp</TableHead>
                                <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-6 py-5">Record ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log) => (
                                <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{(log.profiles as any)?.full_name || 'System'}</div>
                                                <div className="text-[10px] uppercase font-black text-blue-100/30">{(log.profiles as any)?.role || 'trigger'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={`rounded-lg font-black text-[9px] tracking-widest px-2 py-0.5 border-none
                                            ${log.action === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400'
                                                : log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-red-500/20 text-red-400'}`}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-sm text-blue-100/70 py-4">{log.table_name}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-blue-100/40 text-xs font-medium">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                            {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-6 py-4">
                                        <span className="text-[10px] font-mono text-blue-100/20">{log.record_id?.slice(0, 8)}…</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="text-center py-24">
                                        <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-white/5" />
                                        <p className="font-black text-blue-100/20 uppercase tracking-[0.2em] text-sm">No audit events yet</p>
                                        <p className="text-blue-100/10 text-xs mt-1">Events are logged automatically by database triggers</p>
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
