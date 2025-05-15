// app/api/update-stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { cartItems } = await request.json();
    
    console.log('📦 Processing stock update for items:', cartItems);
    
    for (const item of cartItems) {
      console.log(`\n🔄 Updating stock for: ${item.name}`);
      
      if (item.selectedSize) {
        // Handle products with sizes (rings)
        const { data: product, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('sizes')
          .eq('id', item.id)
          .single();
        
        if (fetchError) {
          console.error('❌ Error fetching product:', fetchError);
          throw new Error(`Failed to fetch product ${item.name}: ${fetchError.message}`);
        }
        
        if (!product.sizes || !Array.isArray(product.sizes)) {
          throw new Error(`Product ${item.name} has invalid sizes configuration`);
        }
        
        // Update the specific size stock
        const updatedSizes = product.sizes.map(sizeObj => {
          if (sizeObj.size === item.selectedSize) {
            const currentStock = parseInt(sizeObj.stock) || 0;
            const quantityToSubtract = parseInt(item.quantity) || 0;
            const newStock = Math.max(0, currentStock - quantityToSubtract);
            
            console.log(`📊 Size ${sizeObj.size}: ${currentStock} → ${newStock}`);
            
            return {
              ...sizeObj,
              stock: newStock
            };
          }
          return sizeObj;
        });
        
        // Update the product with new sizes
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ sizes: updatedSizes })
          .eq('id', item.id);
        
        if (updateError) {
          console.error('❌ Error updating sizes:', updateError);
          throw new Error(`Failed to update stock for ${item.name}: ${updateError.message}`);
        }
        
        console.log(`✅ Updated stock for ${item.name} size ${item.selectedSize}`);
        
      } else {
        // Handle products without sizes (necklaces, etc.)
        const { data: product, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (fetchError) {
          console.error('❌ Error fetching product:', fetchError);
          throw new Error(`Failed to fetch product ${item.name}: ${fetchError.message}`);
        }
        
        const currentStock = parseInt(product.stock) || 0;
        const quantityToSubtract = parseInt(item.quantity) || 0;
        const newStock = Math.max(0, currentStock - quantityToSubtract);
        
        console.log(`📊 Product ${item.name}: ${currentStock} → ${newStock}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.id);
        
        if (updateError) {
          console.error('❌ Error updating stock:', updateError);
          throw new Error(`Failed to update stock for ${item.name}: ${updateError.message}`);
        }
        
        console.log(`✅ Updated stock for ${item.name}`);
      }
    }
    
    console.log('🎉 All stock updates completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully' 
    });
    
  } catch (error) {
    console.error('💥 Stock update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update stock' 
      },
      { status: 500 }
    );
  }
}