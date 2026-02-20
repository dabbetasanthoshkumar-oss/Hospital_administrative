'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const patientSchema = z.object({
    full_name: z.string().min(2),
    dob: z.string(),
    gender: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export async function createPatient(formData: FormData) {
    const supabase = createAdminClient()

    const data = {
        full_name: formData.get('full_name') as string,
        dob: formData.get('dob') as string,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
    }

    const result = patientSchema.safeParse(data)
    if (!result.success) {
        return { error: 'Invalid input' }
    }

    // Generate a unique patient ID (e.g., HOSP-XXXXX)
    const patientId = `HOSP-${Math.floor(10000 + Math.random() * 90000)}`

    const { error } = await supabase.from('patients').insert({
        ...result.data,
        patient_id: patientId,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/patients')
    return { success: true }
}

export async function deletePatient(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('patients').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/patients')
    return { success: true }
}
