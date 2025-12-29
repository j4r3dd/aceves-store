import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const size = searchParams.get('size'); // Optional

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();

        // Check connection first quickly
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('SERVER STOCK CHECK: Database error:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }

        if (!product) {
            console.error('SERVER STOCK CHECK: Product not found:', id);
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Logic to extract stock (same as in frontend)
        let availableStock = 0;

        if (size && product.sizes && Array.isArray(product.sizes)) {
            const sizeData = product.sizes.find(s => s.size === size);
            if (sizeData) {
                availableStock = parseInt(sizeData.stock) || 0;
            } else {
                // Size requested but not found in available sizes
                availableStock = 0;
            }
        }
        // If no size specific logic matches, use global stock
        // Note: If product has sizes but no size is selected, we assume 0 or handle logic elsewhere?
        // In Context we returned 0. 
        else if (product.sizes && Array.isArray(product.sizes) && !size) {
            availableStock = 0; // Needs size selection
        }
        else if (product.stock !== undefined) {
            availableStock = parseInt(product.stock) || 0;
        } else {
            // Fallback
            availableStock = 999;
        }

        return NextResponse.json({
            stock: availableStock,
            productId: id,
            size: size
        });

    } catch (err) {
        console.error('SERVER STOCK CHECK: Exception:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
