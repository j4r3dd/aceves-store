// app/api/inventario/stock/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { successResponse, ApiException } from '../../../../lib/api/utils';
import { withErrorHandling, withAdmin } from '../../../../lib/api/middleware';

interface ActualizarStock {
  producto_id: string;
  talla: string;
  nuevo_stock: number;
  motivo?: string;
}

// PUT: Actualizar stock manualmente
export const PUT = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const body: ActualizarStock = await req.json();
  
  if (!body.producto_id || !body.talla || body.nuevo_stock === undefined) {
    throw new ApiException(400, 'Faltan campos requeridos: producto_id, talla, nuevo_stock');
  }
  
  // Obtener stock actual
  const { data: variacion, error: errorVariacion } = await supabase
    .from('producto_variaciones')
    .select('stock')
    .eq('producto_id', body.producto_id)
    .eq('talla', body.talla)
    .single();
  
  if (errorVariacion || !variacion) {
    throw new ApiException(404, 'Variación de producto no encontrada');
  }
  
  const stock_anterior = variacion.stock;
  
  // Actualizar stock
  const { error: errorUpdate } = await supabase
    .from('producto_variaciones')
    .update({ 
      stock: body.nuevo_stock,
      updated_at: new Date().toISOString()
    })
    .eq('producto_id', body.producto_id)
    .eq('talla', body.talla);
  
  if (errorUpdate) {
    throw new ApiException(500, 'Error al actualizar stock', errorUpdate);
  }
  
  // Registrar movimiento
  const diferencia = Math.abs(body.nuevo_stock - stock_anterior);
  const tipo_movimiento = body.nuevo_stock > stock_anterior ? 'entrada' : 
                         body.nuevo_stock < stock_anterior ? 'salida' : 'ajuste';
  
  await supabase
    .from('movimientos_inventario')
    .insert({
      producto_id: body.producto_id,
      talla: body.talla,
      tipo_movimiento,
      cantidad: diferencia,
      stock_anterior,
      stock_nuevo: body.nuevo_stock,
      motivo: body.motivo || 'Ajuste manual de inventario'
    });
  
  return successResponse({
    mensaje: `Stock actualizado de ${stock_anterior} a ${body.nuevo_stock}`,
    stock_anterior,
    stock_nuevo: body.nuevo_stock,
    diferencia
  });
}));

// GET: Obtener alertas de stock
export const GET = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const url = new URL(req.url);
  const solo_no_leidas = url.searchParams.get('no_leidas') === 'true';
  
  let query = supabase
    .from('alertas_stock')
    .select(`
      *,
      productos_inventario(nombre, tipo)
    `)
    .order('created_at', { ascending: false });
  
  if (solo_no_leidas) {
    query = query.eq('leida', false);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new ApiException(500, 'Error al obtener alertas', error);
  }
  
  return successResponse(data);
}));