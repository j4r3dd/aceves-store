
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

async function checkOrders() {
    console.log('Checking orders table with SERVICE ROLE...');
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.error('Error selecting from orders:', error);
    } else {
        console.log('Success! Found orders:', data);
    }

    // Check if "users" table exists in public schema
    console.log('Checking users table (public)...');
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);
    if (usersError) {
        console.error('Error selecting from users:', usersError);
    } else {
        console.log('Success! Found users table:', users);
    }
}

checkOrders();
