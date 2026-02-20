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

    // Admin can also create records — find doctor by profile or use first doctor if admin
    const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', user?.id)
        .maybeSingle()

    if (!doctor) {
        // Admins can also create records — skip doctor check and use null
        const { error } = await supabase.from('medical_records').insert({
            ...result.data,
            doctor_id: null as any, // Admin override
        })
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from('medical_records').insert({
            ...result.data,
            doctor_id: doctor.id,
        })
        if (error) return { error: error.message }
    }

    // Mark appointment as completed
    await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', result.data.appointment_id)

    revalidatePath('/dashboard/records')
    return { success: true }
}
