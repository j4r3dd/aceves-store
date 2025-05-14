// app/api/inventario/alertas/[id]/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase-server';
import { successResponse, ApiException } from '../../../../../lib/api/utils';
import { withErrorHandling, withAdmin } from '../../../../../lib/api/middleware';

// PUT: Marcar alerta como leída
export const PUT = withErrorHandling(withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase
    .from('alertas_stock')
    .update({ leida: true })
    .eq('id', params.id);
  
  if (error) {
    throw new ApiException(500, 'Error al marcar alerta como leída', error);
  }
  
  return successResponse({ mensaje: 'Alerta marcada como leída' });
}));

// DELETE: Eliminar alerta
export const DELETE = withErrorHandling(withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase
    .from('alertas_stock')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    throw new ApiException(500, 'Error al eliminar alerta', error);
  }
  
  return successResponse({ mensaje: 'Alerta eliminada' });
}));