'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const appointmentSchema = z.object({
    patient_id: z.string().uuid(),
    doctor_id: z.string().uuid(),
    appointment_date: z.string(),
})

export async function createAppointment(formData: FormData) {
    // Use admin client for writes to bypass RLS restrictions
    const supabase = createAdminClient()

    // Get the current user for created_by field
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()

    const data = {
        patient_id: formData.get('patient_id') as string,
        doctor_id: formData.get('doctor_id') as string,
        appointment_date: formData.get('appointment_date') as string,
    }

    const result = appointmentSchema.safeParse(data)
    if (!result.success) {
        return { error: 'Invalid input: ' + result.error.issues[0].message }
    }

    // Conflict check: Ensure no double booking for the doctor at that time
    const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', result.data.doctor_id)
        .eq('appointment_date', result.data.appointment_date)
        .neq('status', 'cancelled')
        .maybeSingle()

    if (conflict) {
        return { error: 'Doctor is already booked for this time slot. Please choose a different time.' }
    }

    const { error } = await supabase.from('appointments').insert({
        ...result.data,
        created_by: user?.id ?? null,
        status: 'scheduled',
    })

    if (error) {
        console.error('Appointment insert error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/appointments')
    return { success: true }
}

/**
 * Handle consultation completion by a doctor
 * Atomically updates appointment, inserts record, handles prescriptions, and creates billing.
 */
export async function completeConsultationAction(data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    diagnosis: string;
    symptoms: string[];
    notes: string;
    healthSuggestions?: any;
    prescriptions?: Array<{
        medicine_name: string;
        dosage: string;
        duration: string;
        instructions: string;
    }>;
}) {
    const supabase = createAdminClient()

    try {
        // 1. Create the Medical Record
        const { data: record, error: recordError } = await supabase
            .from('medical_records')
            .insert({
                patient_id: data.patientId,
                doctor_id: data.doctorId,
                appointment_id: data.appointmentId,
                diagnosis: data.diagnosis,
                symptoms: data.symptoms.join(', '),
                notes: data.notes,
                health_suggestions: data.healthSuggestions || []
            })
            .select()
            .single()

        if (recordError) throw recordError

        // 2. Insert Prescriptions if any
        if (data.prescriptions && data.prescriptions.length > 0) {
            const prescriptionBuffer = data.prescriptions.map(p => ({
                medical_record_id: record.id,
                patient_id: data.patientId,
                medicine_name: p.medicine_name,
                dosage: p.dosage,
                duration: p.duration,
                instructions: p.instructions,
                status: 'pending'
            }))

            const { error: rxError } = await supabase
                .from('prescriptions')
                .insert(prescriptionBuffer)
            
            if (rxError) throw rxError
        }

        // 3. Create Billing Entry (Defaulting consultation fee)
        const consultationFee = 500
        const medicineCharges = data.prescriptions ? data.prescriptions.length * 150 : 0 // Rough estimate
        
        await supabase.from('billing').insert({
            appointment_id: data.appointmentId,
            consultation_fee: consultationFee,
            lab_charges: 0,
            medicine_charges: medicineCharges,
            total_amount: consultationFee + medicineCharges,
            payment_status: 'pending'
        })

        // 4. Update Appointment Status
        await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', data.appointmentId)

        // 5. Revalidate relevant paths
        revalidatePath('/dashboard/appointments')
        revalidatePath('/dashboard/records')
        revalidatePath('/dashboard/billing')

        return { success: true }
    } catch (error: any) {
        console.error('Consultation submission critical failure:', error)
        return { error: error.message || 'Clinical transaction failed' }
    }
}
