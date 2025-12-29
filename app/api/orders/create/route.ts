import { createServiceRoleClient } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createServiceRoleClient();

        // The body should be the order object ready for insertion
        const { data, error } = await supabase
            .from('orders')
            .insert(body) // body can be an array or single object, insert handles both but usually expects object or array of objects. 
            // In page.jsx we were doing .insert([orderInsert]), so body should probably be passed as is if it's the object, 
            // checking if page.jsx sends array or object. 
            // page.jsx sends JSON.stringify(orderInsert) which is a single object.
            // .insert(body) where body is an object works fine in supabase-js.
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating order (API):', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('❌ Unexpected error creating order (API):', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
