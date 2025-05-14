// app/api/inventario/productos/[id]/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase-server';
import { successResponse, ApiException } from '../../../../../lib/api/utils';
import { withErrorHandling, withAdmin } from '../../../../../lib/api/middleware';

// GET: Obtener producto específico
export const GET = withErrorHandling(withAdmin(async (
  req: NextRequest, 
  { params }: { params: { id: string } }
) => {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('productos_con_stock')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error) {
    throw new ApiException(404, 'Producto no encontrado', error);
  }
  
  return successResponse(data);
}));

// PUT: Actualizar producto
export const PUT = withErrorHandling(withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = createServerSupabaseClient();
  const body = await req.json();
  
  // Actualizar información del producto
  const { error: errorProducto } = await supabase
    .from('productos_inventario')
    .update({
      nombre: body.nombre,
      tipo: body.tipo,
      precio: body.precio,
      descripcion: body.descripcion,
      imagen_url: body.imagen_url,
      activo: body.activo,
      stock_minimo: body.stock_minimo
    })
    .eq('id', params.id);
  
  if (errorProducto) {
    throw new ApiException(500, 'Error al actualizar producto', errorProducto);
  }
  
  // Si hay variaciones, actualizarlas
  if (body.variaciones) {
    // Eliminar variaciones existentes
    await supabase
      .from('producto_variaciones')
      .delete()
      .eq('producto_id', params.id);
    
    // Insertar nuevas variaciones
    if (body.variaciones.length > 0) {
      const variaciones = body.variaciones.map((v: any) => ({
        producto_id: params.id,
        talla: v.talla,
        stock: v.stock,
        precio_personalizado: v.precio_personalizado
      }));
      
      const { error: errorVariaciones } = await supabase
        .from('producto_variaciones')
        .insert(variaciones);
      
      if (errorVariaciones) {
        throw new ApiException(500, 'Error al actualizar variaciones', errorVariaciones);
      }
    }
  }
  
  // Retornar producto actualizado
  const { data } = await supabase
    .from('productos_con_stock')
    .select('*')
    .eq('id', params.id)
    .single();
  
  return successResponse(data);
}));

// DELETE: Eliminar producto
export const DELETE = withErrorHandling(withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase
    .from('productos_inventario')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    throw new ApiException(500, 'Error al eliminar producto', error);
  }
  
  return successResponse({ message: 'Producto eliminado correctamente' });
}));