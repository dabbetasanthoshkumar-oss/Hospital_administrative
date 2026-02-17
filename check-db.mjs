
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://tbfzzryzusrkxtgjokbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnp6cnl6dXNya3h0Z2pva2JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2MTM3NCwiZXhwIjoyMDg2NzM3Mzc0fQ.eTzZauOcUllf4CfIJUNGsciUTDCbicHuyzb24vZS6HI'

async function diagnostic() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('--- Auth Users ---')
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
        console.error('Auth Error:', authError.message)
    } else {
        if (users.length === 0) console.log('No users found.')
        users.forEach(u => console.log(`- ${u.email} (ID: ${u.id}, Confirmed: ${u.email_confirmed_at})`))
    }

    console.log('\n--- Profiles Table ---')
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*')
    if (profileError) {
        console.error('Profile Error:', profileError.message)
    } else {
        if (profiles.length === 0) console.log('No profiles found.')
        profiles.forEach(p => console.log(`- ${p.full_name} (${p.role}) - ID: ${p.id}`))
    }
}

diagnostic()
