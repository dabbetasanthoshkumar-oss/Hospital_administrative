
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tbfzzryzusrkxtgjokbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnp6cnl6dXNya3h0Z2pva2JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2MTM3NCwiZXhwIjoyMDg2NzM3Mzc0fQ.eTzZauOcUllf4CfIJUNGsciUTDCbicHuyzb24vZS6HI'

const targetEmail = 'admin@hospital.com'
const password = 'password123'

async function setup() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('--- Creating Admin User ---')
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: targetEmail,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'System Administrator' }
    })

    if (createError) {
        if (createError.message.includes('already exists')) {
            console.log('User already exists. Updating password...')
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const user = users.find(u => u.email === targetEmail)
            await supabase.auth.admin.updateUserById(user.id, { password: password })
            console.log('User updated.')
        } else {
            console.error('CreateUser Error:', createError.message)
            return
        }
    } else {
        console.log('User created successfully:', createData.user.id)
    }

    const userId = createData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === targetEmail).id

    console.log('\n--- Syncing Profile ---')
    const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: 'System Administrator',
        role: 'admin'
    })

    if (upsertError) {
        console.error('Profile Upsert Error:', upsertError.message)
    } else {
        console.log('Profile synchronized.')
    }
}

setup()
