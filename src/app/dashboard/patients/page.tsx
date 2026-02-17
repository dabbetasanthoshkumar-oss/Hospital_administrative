import { createClient } from '@/lib/supabase-server'
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from 'next/link'
import { PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default async function PatientsPage() {
    const supabase = await createClient()
    const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Patient Records</h1>
                    <p className="text-blue-100/60 font-medium">Manage hospital patient records and clinical history</p>
                </div>
                <Link href="/dashboard/patients/new">
                    <button className="px-6 py-3 glass-button jelly rounded-2xl flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                        <PlusCircle className="h-4 w-4" />
                        Register Patient
                    </button>
                </Link>
            </header>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/30 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search patients by name or ID..."
                        className="pl-12 h-14 glass-card border-none text-white placeholder:text-blue-100/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50"
                    />
                </div>
            </div>

            <div className="glass-card border-none overflow-hidden pb-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pl-8 py-6">Patient ID</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Name</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">DOB</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Gender</TableHead>
                            <TableHead className="font-bold text-blue-100/60 uppercase text-[10px] tracking-widest py-6">Phone</TableHead>
                            <TableHead className="text-right font-bold text-blue-100/60 uppercase text-[10px] tracking-widest pr-8 py-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients?.map((patient) => (
                            <TableRow key={patient.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="pl-8 py-5 font-black text-primary text-sm tracking-tight">{patient.patient_id}</TableCell>
                                <TableCell className="py-5 font-bold text-white text-sm">{patient.full_name}</TableCell>
                                <TableCell className="py-5 text-blue-100/40 text-xs font-medium">{patient.dob}</TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="outline" className="bg-white/5 text-blue-100/60 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                        {patient.gender}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-5 text-blue-100/40 text-xs font-bold">{patient.phone || '-'}</TableCell>
                                <TableCell className="text-right pr-8 py-5">
                                    <Link href={`/dashboard/patients/${patient.id}`}>
                                        <button className="px-4 py-2 glass-button jelly text-primary text-[10px] font-black tracking-widest uppercase rounded-xl">
                                            Expand
                                        </button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!patients || patients.length === 0) && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="text-center py-32">
                                    <Search className="h-16 w-16 mx-auto mb-6 text-white/5" />
                                    <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">No patient records found</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
