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

export default async function PatientsPage() {
    const supabase = await createClient()
    const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Patients</h1>
                    <p className="text-muted-foreground text-sm">Manage hospital patient records</p>
                </div>
                <Link href="/dashboard/patients/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register Patient
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search patients by name or ID..." className="pl-10" />
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>DOB</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients?.map((patient) => (
                            <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium text-primary">{patient.patient_id}</TableCell>
                                <TableCell>{patient.full_name}</TableCell>
                                <TableCell>{patient.dob}</TableCell>
                                <TableCell className="capitalize">{patient.gender}</TableCell>
                                <TableCell>{patient.phone || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/dashboard/patients/${patient.id}`}>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!patients || patients.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No patients found. Register a new patient to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
