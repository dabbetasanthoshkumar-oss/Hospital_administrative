'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
        return { error: 'Invalid input' }
    }

    console.log('Login attempt for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error.message)
        return { error: error.message }
    }

    console.log('Login successful for user:', data.user.id)

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (profileError) {
        console.error('Profile Fetch Error:', profileError.message)
        return { error: 'Login successful, but your account profile was not found. Please run the setup-admin tool again.' }
    }

    if (!profile) {
        return { error: 'Login successful, but your account profile was not found. Please ensure an admin profile exists.' }
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
