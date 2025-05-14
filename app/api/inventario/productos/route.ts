// app/api/inventario/productos/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { successResponse, ApiException } from '../../../../lib/api/utils';
import { withErrorHandling, withAdmin } from '../../../../lib/api/middleware';

interface ProductoInventario {
  id?: string;
  nombre: string;
  tipo: 'anillo' | 'collar' | 'otro';
  precio: number;
  descripcion?: string;
  imagen_url?: string;
  activo?: boolean;
  stock_minimo?: number;
  variaciones?: Array<{
    talla: string;
    stock: number;
    precio_personalizado?: number;
  }>;
}

// GET: Obtener todos los productos del inventario
export const GET = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const url = new URL(req.url);
  const tipo = url.searchParams.get('tipo');
  const busqueda = url.searchParams.get('q');
  const limite = parseInt(url.searchParams.get('limite') || '50');
  
  let query = supabase
    .from('productos_con_stock')
    .select('*')
    .order('nombre');
  
  if (tipo) {
    query = query.eq('tipo', tipo);
  }
  
  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`);
  }
  
  query = query.limit(limite);
  
  const { data, error } = await query;
  
  if (error) {
    throw new ApiException(500, 'Error al obtener productos', error);
  }
  
  return successResponse(data);
}));

// POST: Crear producto nuevo
export const POST = withErrorHandling(withAdmin(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  const body: ProductoInventario = await req.json();
  
  if (!body.nombre || !body.tipo || body.precio === undefined) {
    throw new ApiException(400, 'Faltan campos requeridos: nombre, tipo, precio');
  }
  
  // Crear el producto principal
  const { data: producto, error: errorProducto } = await supabase
    .from('productos_inventario')
    .insert({
      nombre: body.nombre,
      tipo: body.tipo,
      precio: body.precio,
      descripcion: body.descripcion,
      imagen_url: body.imagen_url,
      activo: body.activo !== false,
      stock_minimo: body.stock_minimo || 1
    })
    .select()
    .single();
  
  if (errorProducto) {
    throw new ApiException(500, 'Error al crear producto', errorProducto);
  }
  
  // Crear variaciones si se proporcionaron
  if (body.variaciones && body.variaciones.length > 0) {
    const variaciones = body.variaciones.map(v => ({
      producto_id: producto.id,
      talla: v.talla,
      stock: v.stock,
      precio_personalizado: v.precio_personalizado
    }));
    
    const { error: errorVariaciones } = await supabase
      .from('producto_variaciones')
      .insert(variaciones);
    
    if (errorVariaciones) {
      throw new ApiException(500, 'Error al crear variaciones', errorVariaciones);
    }
  }
  
  // Obtener el producto completo con variaciones
  const { data: productoCompleto } = await supabase
    .from('productos_con_stock')
    .select('*')
    .eq('id', producto.id)
    .single();
  
  return successResponse(productoCompleto, 201);
}));