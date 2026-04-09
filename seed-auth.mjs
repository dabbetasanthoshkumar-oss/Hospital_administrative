
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tbfzzryzusrkxtgjokbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnp6cnl6dXNya3h0Z2pva2JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2MTM3NCwiZXhwIjoyMDg2NzM3Mzc0fQ.eTzZauOcUllf4CfIJUNGsciUTDCbicHuyzb24vZS6HI'

const usersToCreate = [
    { email: 'doctor@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Strange' },
    { email: 'receptionist@hospital.com', password: 'password123', role: 'receptionist', name: 'Front Desk' },
    { email: 'pharmacist@hospital.com', password: 'password123', role: 'pharmacist', name: 'Meds Dept' },
    { email: 'patient@hospital.com', password: 'password123', role: 'patient', name: 'Emma Wilson' },
    { email: 'admin@hospital.com', password: 'password123', role: 'admin', name: 'System Admin' }
]

async function seed() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('--- Starting User Seeding ---')

    for (const u of usersToCreate) {
        console.log(`Processing: ${u.email}...`)
        
        // 1. Create Auth User
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.name }
        })

        let userId = userData?.user?.id

        if (authError) {
            if (authError.message.includes('already exists')) {
                console.log(`  User already exists. Fetching ID...`)
                const { data: { users } } = await supabase.auth.admin.listUsers()
                userId = users.find(user => user.email === u.email)?.id
            } else {
                console.error(`  Auth Error: ${authError.message}`)
                continue
            }
        } else {
            console.log(`  User created: ${userId}`)
        }

        // 2. Sync Profile
        if (userId) {
            console.log(`  Syncing profile (${u.role})...`)
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                full_name: u.name,
                role: u.role
            })

            if (profileError) {
                console.error(`  Profile Sync Error: ${profileError.message}`)
                if (profileError.message.includes('invalid input value for enum user_role')) {
                    console.error(`  CRITICAL: The role "${u.role}" is not allowed in your user_role enum. Please run the SQL migration to add 'patient'.`)
                }
            } else {
                console.log(`  Profile synced successfully.`)
            }
        }
    }
    console.log('--- Seeding Complete ---')
}

seed().catch(err => console.error('Seeding Script Failed:', err))
