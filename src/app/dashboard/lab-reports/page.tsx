'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
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
import { Beaker, FileText, AlertCircle, CheckCircle2, Search, PlusCircle, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LabReportForm } from './report-form'

export default function LabReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    
    useEffect(() => {
        const loadReports = async () => {
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('lab_reports')
                    .select('*, patient:patients(full_name, patient_id)')
                    .order('created_at', { ascending: false })
                setReports(data || [])
            } catch (error) {
                console.error('Failed to load lab reports:', error)
            }
        }
        loadReports()
    }, [])

    const abnormalCount = reports.filter(r => r.status === 'abnormal').length

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Lab & Diagnostics</h1>
                    <p className="text-blue-100/60 font-medium text-sm">Manage clinical investigations and pathology results</p>
                </div>
                <LabReportForm onReportAdded={() => {}} />
            </header>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Total Investigations</CardTitle>
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Beaker className="w-5 h-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">{reports.length}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Across all departments</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xs font-black text-red-400 uppercase tracking-widest">Abnormal Results</CardTitle>
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">{abnormalCount}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Requires Clinical Attention</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none relative overflow-hidden group jelly">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 text-emerald-500">
                        <CardTitle className="text-xs font-black text-emerald-400 uppercase tracking-widest">Processing</CardTitle>
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white tracking-tight mb-2">{reports.filter(r => r.status === 'normal').length}</div>
                        <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">Within Reference Range</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/30 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search reports by patient or test type..."
                        className="pl-12 h-14 glass-card border-none text-white placeholder:text-blue-100/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50"
                    />
                </div>
            </div>

            <div className="glass-card border-none overflow-hidden pb-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-8 py-6">Patient</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Test Type</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Date</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Result Status</TableHead>
                            <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-8 py-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="pl-8 py-5">
                                    <div className="font-bold text-white text-sm">{report.patient?.full_name}</div>
                                    <div className="text-[10px] font-black text-blue-100/30 uppercase">{report.patient?.patient_id}</div>
                                </TableCell>
                                <TableCell className="py-5 font-bold text-white text-sm">{report.test_name}</TableCell>
                                <TableCell className="text-blue-100/40 text-xs font-medium py-5">
                                    {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="outline" className={`border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg
                                        ${report.status === 'abnormal' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {report.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8 py-5">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 bg-white/5 hover:bg-white/10 text-blue-100/60 rounded-xl transition-all">
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button className="px-4 py-2 glass-button jelly text-primary text-[10px] font-black tracking-widest uppercase rounded-xl">
                                            View Details
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {reports.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="text-center py-32">
                                    <FileText className="h-16 w-16 mx-auto mb-6 text-white/5" />
                                    <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">No diagnostic data</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
