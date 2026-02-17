import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ClipboardList, Thermometer } from 'lucide-react'

export default async function RecordsPage() {
    const supabase = await createClient()

    const { data: records } = await supabase
        .from('medical_records')
        .select(`
      *,
      patients(full_name, patient_id),
      doctors(profiles(full_name))
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Medical History</h1>
                    <p className="text-muted-foreground text-sm">Chronicling patient clinical journeys</p>
                </div>
            </div>

            <div className="grid gap-6">
                {records?.map((record) => (
                    <Card key={record.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 border-l-primary">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{(record.patients as any)?.full_name}</CardTitle>
                                    <p className="text-xs text-muted-foreground font-mono">{(record.patients as any)?.patient_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{new Date(record.created_at).toLocaleDateString()}</p>
                                    <p className="text-xs text-muted-foreground">Dr. {(record.doctors as any)?.profiles?.full_name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                        <Thermometer className="h-4 w-4 text-red-500" />
                                        Diagnosis
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-red-50/30 p-3 rounded">{record.diagnosis}</p>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                        <ClipboardList className="h-4 w-4 text-blue-500" />
                                        Prescription
                                    </h4>
                                    <pre className="text-sm text-slate-600 font-sans whitespace-pre-wrap bg-blue-50/30 p-3 rounded">{record.prescription_text || 'No prescription issued.'}</pre>
                                </div>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                    <FileText className="h-4 w-4 text-amber-500" />
                                    Clinical Notes
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/30 p-3 rounded min-h-[100px]">{record.notes || 'No additional notes provided.'}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!records || records.length === 0) && (
                    <div className="text-center py-20 bg-white border-2 border-dashed rounded-xl">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No medical records exist in the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
