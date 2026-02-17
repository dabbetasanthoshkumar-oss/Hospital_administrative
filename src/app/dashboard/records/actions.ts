'use server'

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
    const supabase = await createClient()

    const data = {
        patient_id: formData.get('patient_id') as string,
        appointment_id: formData.get('appointment_id') as string,
        diagnosis: formData.get('diagnosis') as string,
        notes: formData.get('notes') as string,
        prescription_text: formData.get('prescription_text') as string,
    }

    const result = recordSchema.safeParse(data)
    if (!result.success) {
        return { error: 'Invalid input' }
    }

    // Get current doctor's ID
    const { data: { user } } = await supabase.auth.getUser()
    const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', user?.id)
        .single()

    if (!doctor) {
        return { error: 'Unauthorized: Only doctors can create records.' }
    }

    const { error } = await supabase.from('medical_records').insert({
        ...result.data,
        doctor_id: doctor.id,
    })

    if (error) {
        return { error: error.message }
    }

    // Mark appointment as completed
    await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', result.data.appointment_id)

    revalidatePath('/dashboard/records')
    return { success: true }
}
