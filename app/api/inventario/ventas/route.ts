// app/api/inventario/ventas/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { successResponse, ApiException } from '../../../../lib/api/utils';
import { withErrorHandling, withAdmin } from '../../../../lib/api/middleware';

interface VentaData {
  producto_id: string;
  talla: string;
  cantidad?: number;
  canal?: 'admin' | 'web' | 'instagram' | 'fisico';
  cliente_info?: any;
  notas?: string;
}

// POST: Registrar venta
export const POST = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const body: VentaData = await req.json();
  
  if (!body.producto_id || !body.talla) {
    throw new ApiException(400, 'Faltan campos requeridos: producto_id, talla');
  }
  
  const cantidad = body.cantidad || 1;
  
  // Verificar que hay stock suficiente
  const { data: variacion, error: errorVariacion } = await supabase
    .from('producto_variaciones')
    .select('*, productos_inventario(nombre, precio)')
    .eq('producto_id', body.producto_id)
    .eq('talla', body.talla)
    .single();
  
  if (errorVariacion || !variacion) {
    throw new ApiException(404, 'Variación de producto no encontrada');
  }
  
  if (variacion.stock < cantidad) {
    throw new ApiException(400, `Stock insuficiente. Disponible: ${variacion.stock}, Solicitado: ${cantidad}`);
  }
  
  // Calcular precios
  const precio_unitario = variacion.precio_personalizado || variacion.productos_inventario.precio;
  const total = precio_unitario * cantidad;
  
  // Registrar la venta
  const { data: venta, error: errorVenta } = await supabase
    .from('ventas')
    .insert({
      producto_id: body.producto_id,
      talla: body.talla,
      cantidad,
      precio_unitario,
      total,
      canal: body.canal || 'admin',
      cliente_info: body.cliente_info,
      notas: body.notas
    })
    .select()
    .single();
  
  if (errorVenta) {
    throw new ApiException(500, 'Error al registrar venta', errorVenta);
  }
  
  // Actualizar stock
  const { error: errorStock } = await supabase
    .from('producto_variaciones')
    .update({ 
      stock: variacion.stock - cantidad,
      updated_at: new Date().toISOString()
    })
    .eq('producto_id', body.producto_id)
    .eq('talla', body.talla);
  
  if (errorStock) {
    throw new ApiException(500, 'Error al actualizar stock', errorStock);
  }
  
  // Registrar movimiento de inventario
  await supabase
    .from('movimientos_inventario')
    .insert({
      producto_id: body.producto_id,
      talla: body.talla,
      tipo_movimiento: 'salida',
      cantidad,
      stock_anterior: variacion.stock,
      stock_nuevo: variacion.stock - cantidad,
      motivo: `Venta - Canal: ${body.canal || 'admin'}`,
      referencia_venta: venta.id
    });
  
  return successResponse({
    venta,
    mensaje: `Venta registrada correctamente. Stock actualizado: ${variacion.stock - cantidad}`
  }, 201);
}));

// GET: Obtener historial de ventas
export const GET = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const url = new URL(req.url);
  const desde = url.searchParams.get('desde');
  const hasta = url.searchParams.get('hasta');
  const canal = url.searchParams.get('canal');
  const limite = parseInt(url.searchParams.get('limite') || '100');
  
  let query = supabase
    .from('ventas')
    .select(`
      *,
      productos_inventario(nombre, tipo)
    `)
    .order('created_at', { ascending: false });
  
  if (desde) {
    query = query.gte('created_at', desde);
  }
  
  if (hasta) {
    query = query.lte('created_at', hasta);
  }
  
  if (canal) {
    query = query.eq('canal', canal);
  }
  
  query = query.limit(limite);
  
  const { data, error } = await query;
  
  if (error) {
    throw new ApiException(500, 'Error al obtener ventas', error);
  }
  
  return successResponse(data);
}));