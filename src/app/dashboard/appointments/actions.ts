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

export async function updateAppointmentStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/appointments')
    return { success: true }
}
