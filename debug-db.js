const fs = require('fs');

async function testConnection() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
        const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

        if (!urlMatch || !keyMatch) {
            console.error('Could not find Supabase URL or Service Key in .env.local');
            return;
        }

        const supabaseUrl = urlMatch[1].trim();
        const supabaseKey = keyMatch[1].trim();

        console.log('Connecting to:', supabaseUrl);

        // Test Auth list users
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Auth API Error:', response.status, err);
        } else {
            const users = await response.json();
            console.log('--- Auth Users ---');
            if (users.length === 0) console.log('No users found.');
            users.forEach(u => console.log(`- ${u.email} (ID: ${u.id}, Confirmed: ${u.email_confirmed_at})`));
        }

        // Test Profiles Table
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!profileResponse.ok) {
            const err = await profileResponse.text();
            console.error('Profiles API Error:', profileResponse.status, err);
        } else {
            const profiles = await profileResponse.json();
            console.log('\n--- Profiles Table ---');
            if (profiles.length === 0) console.log('No profiles found.');
            profiles.forEach(p => console.log(`- ${p.full_name} (${p.role}) - ID: ${p.id}`));
        }

    } catch (error) {
        console.error('Diagnostic failed:', error);
    }
}

testConnection();
