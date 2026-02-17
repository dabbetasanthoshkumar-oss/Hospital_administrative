import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const logs: string[] = []
    logs.push('--- Diagnostic Started ---')

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
            error: 'Missing environment variables.',
            url: !!supabaseUrl,
            key: !!supabaseServiceKey
        }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const targetEmail = 'admin@hospital.com'
    const password = 'password123'

    try {
        // 1. List Users
        logs.push('Listing all users in Auth...')
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw new Error(`ListUsers Error: ${listError.message}`)

        logs.push(`Found ${users.length} users.`)

        let user = users.find(u => u.email === targetEmail)

        if (!user) {
            logs.push(`'${targetEmail}' not found. Creating...`)
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
                email: targetEmail,
                password: password,
                email_confirm: true,
                user_metadata: { full_name: 'System Administrator' }
            })
            if (createError) throw new Error(`CreateUser Error: ${createError.message}`)
            user = createData.user
            logs.push('User created successfully.')
        } else {
            logs.push(`User '${targetEmail}' exists. Updating password to password123...`)
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                password: password,
                email_confirm: true
            })
            if (updateError) throw new Error(`UpdateUser Error: ${updateError.message}`)
            logs.push('Password reset successfully.')
        }

        // 2. Check Profile
        logs.push('Checking profiles table...')
        const { data: profile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (profileFetchError) {
            logs.push(`Profile check error (maybe table missing): ${profileFetchError.message}`)
        }

        logs.push(profile ? 'Profile exists.' : 'Profile missing. Creating...')

        const { error: upsertError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: 'System Administrator',
            role: 'admin'
        })

        if (upsertError) {
            logs.push(`Upsert Error: ${upsertError.message}`)
            if (upsertError.message.includes('relation "profiles" does not exist')) {
                logs.push('CRITICAL: The "profiles" table is missing. Did you run schema.sql?')
            }
        } else {
            logs.push('Profile record synchronized.')
        }

        return NextResponse.json({
            success: !upsertError,
            diagnostic_history: logs,
            credentials: {
                email: targetEmail,
                password: password
            },
            instructions: 'If "success" is true, go to /login and use the credentials above. If false, check the diagnostic history for the red error.'
        })

    } catch (err: any) {
        logs.push(`SYSTEM EXCEPTION: ${err.message}`)
        return NextResponse.json({
            success: false,
            diagnostic_history: logs,
            error: err.message
        }, { status: 500 })
    }
}
