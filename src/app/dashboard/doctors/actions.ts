'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const doctorSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    specialization: z.string().min(2, 'Specialization is required'),
})

export async function createDoctor(formData: { fullName: string, email: string, specialization: string }) {
    const result = doctorSchema.safeParse(formData)

    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const { fullName, email, specialization } = result.data
    const password = 'TemporaryPassword123!' // In a real app, generated and emailed

    const supabase = createAdminClient()

    try {
        // 1. Create the Auth Identity via Admin API (bypasses RLS & email confirmation)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: 'doctor'
            }
        })

        if (authError) {
            console.error('Auth Admin Error:', authError)
            throw authError
        }
        if (!authData.user) throw new Error('Failed to initiate user identity')

        // 2. Create Profile (Admin client bypasses RLS)
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                role: 'doctor'
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            throw new Error(`Profile creation failed: ${profileError.message}`)
        }

        // 3. Create Doctor Entry
        const { error: doctorError } = await supabase
            .from('doctors')
            .insert({
                profile_id: authData.user.id,
                specialization: specialization
            })

        if (doctorError) {
            console.error('Doctor record error:', doctorError)
            throw new Error(`Doctor record failed: ${doctorError.message}`)
        }

        revalidatePath('/dashboard/doctors')
        return { success: true }

    } catch (err: any) {
        console.error('Critical Registration Error:', err)
        return {
            error: err.message || 'The registration protocol encountered a critical failure.'
        }
    }
}
