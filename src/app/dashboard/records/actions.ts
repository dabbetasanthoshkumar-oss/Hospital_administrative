'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const recordSchema = z.object({
    patient_id: z.string().uuid(),
    appointment_id: z.string().uuid(),
    diagnosis: z.string().min(3),
    notes: z.string().optional(),
    prescription_text: z.string().optional(),
})

export async function createMedicalRecord(formData: FormData) {
    const supabase = createAdminClient()

    const data = {
        patient_id: formData.get('patient_id') as string,
        appointment_id: formData.get('appointment_id') as string,
        diagnosis: formData.get('diagnosis') as string,
        notes: formData.get('notes') as string,
        prescription_text: formData.get('prescription_text') as string,
    }

    const result = recordSchema.safeParse(data)
    if (!result.success) {
        return { error: 'Invalid input: ' + result.error.issues[0].message }
    }

    // Get current user to find their doctor profile
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()

    // Try to find a doctor profile matching the current user
    const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', user?.id)
        .maybeSingle()

    // Determine a doctor_id to use (doctor profile -> appointment.doctor_id -> first doctor) to avoid NOT NULL violations
    let doctorId: string | null = doctor?.id ?? null

    if (!doctorId) {
        // Try to use the appointment's assigned doctor
        const { data: appointment } = await supabase
            .from('appointments')
            .select('doctor_id')
            .eq('id', result.data.appointment_id)
            .maybeSingle()

        doctorId = (appointment as any)?.doctor_id ?? null
    }

    if (!doctorId) {
        // Fallback: use the first doctor in the system (administrative fallback)
        const { data: firstDoc } = await supabase
            .from('doctors')
            .select('id')
            .limit(1)
            .maybeSingle()

        doctorId = (firstDoc as any)?.id ?? null
    }

    if (!doctorId) {
        return { error: 'No doctor available to associate with this record. Please assign a doctor or ensure your account is linked to a doctor profile.' }
    }

    const { error } = await supabase.from('medical_records').insert({
        ...result.data,
        doctor_id: doctorId,
    })
    if (error) return { error: error.message }

    // Mark appointment as completed
    await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', result.data.appointment_id)

    revalidatePath('/dashboard/records')
    return { success: true }
}
