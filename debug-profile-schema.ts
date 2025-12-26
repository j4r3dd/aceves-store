
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkProfileSchema() {
    console.log('Checking profiles table columns...');
    // Try to select updated_at to see if it exists
    const { data, error } = await supabase.from('profiles').select('id, updated_at').limit(1);

    if (error) {
        console.error('Error selecting updated_at:', error);
        // If error says column doesn't exist, we know the issue
    } else {
        console.log('Success! updated_at exists.', data);
    }
}

checkProfileSchema();
