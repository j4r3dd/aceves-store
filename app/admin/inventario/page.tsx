'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Types
interface ProductoInventario {
  id: string;
  nombre: string;
  tipo: 'anillo' | 'collar' | 'otro';
  precio: number;
  descripcion?: string;
  imagen_url?: string;
  activo: boolean;
  stock_minimo: number;
  stock_total: number;
  total_tallas: number;
  variaciones: Array<{
    talla: string;
    stock: number;
    precio: number;
  }>;
}

interface AlertaStock {
  id: string;
  tipo_alerta: 'stock_bajo' | 'agotado';
  mensaje: string;
  leida: boolean;
  created_at: string;
  productos_inventario: {
    nombre: string;
    tipo: string;
  };
  talla: string;
}

interface Venta {
  id: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  canal: 'admin' | 'web' | 'instagram' | 'fisico';
  talla: string;
  created_at: string;
  productos_inventario: {
    nombre: string;
    tipo: string;
  };
}

// Components
function ProductCard({ producto, onEdit, onSell }: {
  producto: ProductoInventario;
  onEdit: (id: string) => void;
  onSell: (producto: ProductoInventario) => void;
}) {
  const getStockStatus = () => {
    if (producto.stock_total === 0) return { color: 'text-red-600', text: 'Agotado' };
    if (producto.stock_total <= producto.stock_minimo) return { color: 'text-yellow-600', text: 'Stock Bajo' };
    return { color: 'text-green-600', text: 'En Stock' };
  };

  const status = getStockStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{producto.nombre}</h3>
          <p className="text-gray-600 capitalize">{producto.tipo}</p>
          <p className="text-lg font-semibold text-green-600">${producto.precio.toLocaleString()}</p>
        </div>
        {producto.imagen_url && (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-16 h-16 object-cover rounded-lg ml-4"
          />
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Stock Total:</span>
          <span className={`font-semibold ${status.color}`}>
            {producto.stock_total} ({status.text})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Tallas:</span>
          <span className="font-semibold">{producto.total_tallas}</span>
        </div>
      </div>

      {/* Variaciones por talla */}
      <div className="space-y-1 mb-4">
        <h4 className="font-medium text-gray-700">Stock por Talla:</h4>
        <div className="grid grid-cols-3 gap-2">
          {producto.variaciones?.map((variacion) => (
            <div
              key={variacion.talla}
              className={`p-2 rounded text-sm text-center ${
                variacion.stock === 0
                  ? 'bg-red-100 text-red-800'
                  : variacion.stock <= 1
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {variacion.talla}: {variacion.stock}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(producto.id)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onSell(producto)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          disabled={producto.stock_total === 0}
        >
          💰 Vender
        </button>
      </div>
    </div>
  );
}

function SellModal({ producto, onClose, onSell }: {
  producto: ProductoInventario | null;
  onClose: () => void;
  onSell: (data: any) => void;
}) {
  const [selectedTalla, setSelectedTalla] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [canal, setCanal] = useState<'admin' | 'web' | 'instagram' | 'fisico'>('admin');
  const [notas, setNotas] = useState('');

  if (!producto) return null;

  const tallasDisponibles = producto.variaciones?.filter(v => v.stock > 0) || [];
  const selectedVariacion = producto.variaciones?.find(v => v.talla === selectedTalla);
  const maxCantidad = selectedVariacion?.stock || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSell({
      producto_id: producto.id,
      talla: selectedTalla,
      cantidad,
      canal,
      notas: notas || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>
        <h3 className="text-lg text-gray-700 mb-4">{producto.nombre}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talla
            </label>
            <select
              value={selectedTalla}
              onChange={(e) => {
                setSelectedTalla(e.target.value);
                setCantidad(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Seleccionar talla</option>
              {tallasDisponibles.map((variacion) => (
                <option key={variacion.talla} value={variacion.talla}>
                  {variacion.talla} (Stock: {variacion.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              max={maxCantidad}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal de Venta
            </label>
            <select
              value={canal}
              onChange={(e) => setCanal(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="admin">Admin</option>
              <option value="web">Web</option>
              <option value="instagram">Instagram</option>
              <option value="fisico">Físico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              disabled={!selectedTalla}
            >
              Confirmar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStockModal({ producto, onClose, onSave }: {
  producto: ProductoInventario | null;
  onClose: () => void;
  onSave: (updates: any[]) => void;
}) {
  const [stockUpdates, setStockUpdates] = useState<{[key: string]: number}>({});
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (producto) {
      const initial: {[key: string]: number} = {};
      producto.variaciones?.forEach(v => {
        initial[v.talla] = v.stock;
      });
      setStockUpdates(initial);
    }
  }, [producto]);

  if (!producto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = producto.variaciones?.filter(v => 
      stockUpdates[v.talla] !== v.stock
    ).map(v => ({
      producto_id: producto.id,
      talla: v.talla,
      nuevo_stock: stockUpdates[v.talla],
      motivo: motivo || 'Ajuste de inventario',
    })) || [];

    onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Stock</h2>
        <h3 className="text-lg text-gray-700 mb-4">{producto.nombre}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {producto.variaciones?.map((variacion) => (
              <div key={variacion.talla} className="flex items-center gap-3">
                <label className="w-16 text-sm font-medium">
                  Talla {variacion.talla}:
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockUpdates[variacion.talla] || 0}
                  onChange={(e) => setStockUpdates(prev => ({
                    ...prev,
                    [variacion.talla]: Number(e.target.value)
                  }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <span className="text-sm text-gray-500">
                  (Actual: {variacion.stock})
                </span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del Ajuste
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Restock, Corrección, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Component
export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'anillo' | 'collar' | 'otro'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [sellModalProduct, setSellModalProduct] = useState<ProductoInventario | null>(null);
  const [editModalProduct, setEditModalProduct] = useState<ProductoInventario | null>(null);

  // Fetch data
  const fetchProductos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
      if (busqueda) params.append('q', busqueda);
      
      const response = await fetch(`/api/inventario/productos?${params}`);
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const fetchAlertas = async () => {
    try {
      const response = await fetch('/api/inventario/stock?no_leidas=true');
      const data = await response.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error fetching alertas:', error);
    }
  };

  const fetchVentas = async () => {
    try {
      const response = await fetch('/api/inventario/ventas?limite=20');
      const data = await response.json();
      setVentas(data);
    } catch (error) {
      console.error('Error fetching ventas:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProductos(), fetchAlertas(), fetchVentas()]);
      setLoading(false);
    };
    loadData();
  }, [filtroTipo, busqueda]);

  // Handlers
  const handleSell = async (ventaData: any) => {
    try {
      const response = await fetch('/api/inventario/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData),
      });

      if (response.ok) {
        setSellModalProduct(null);
        await fetchProductos();
        await fetchVentas();
        await fetchAlertas();
        alert('Venta registrada exitosamente');
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error registering sale:', error);
      alert('Error al registrar la venta');
    }
  };

  const handleStockUpdate = async (updates: any[]) => {
    try {
      for (const update of updates) {
        const response = await fetch('/api/inventario/stock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        if (!response.ok) {
          throw new Error('Error updating stock');
        }
      }

      setEditModalProduct(null);
      await fetchProductos();
      await fetchAlertas();
      alert('Stock actualizado exitosamente');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error al actualizar el stock');
    }
  };

  const markAlertAsRead = async (alertaId: string) => {
    try {
      await fetch(`/api/inventario/alertas/${alertaId}`, {
        method: 'PUT',
      });
      await fetchAlertas();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Gestión de Inventario
          </h1>
          <p className="text-gray-600">
            Administra el stock de tu joyería Aceves
          </p>
        </header>

        <Tabs defaultValue="productos" className="space-y-6">
          <TabsList className="bg-white text-gray-900">
            <TabsTrigger value="productos">
              Productos ({productos.length})
            </TabsTrigger>
            <TabsTrigger value="alertas" className="relative">
              Alertas
              {alertas.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ventas">
              Ventas Recientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="anillo">Anillos</option>
                    <option value="collar">Collares</option>
                    <option value="otro">Otros</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onEdit={setEditModalProduct}
                  onSell={setSellModalProduct}
                />
              ))}
            </div>

            {productos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {busqueda || filtroTipo !== 'todos'
                    ? 'No se encontraron productos con los filtros aplicados'
                    : 'No hay productos en el inventario'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            {alertas.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Todo en orden!
                </h3>
                <p className="text-gray-600">
                  No hay alertas de stock pendientes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                      alerta.tipo_alerta === 'agotado'
                        ? 'border-red-500'
                        : 'border-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-2xl ${
                            alerta.tipo_alerta === 'agotado' ? '🔴' : '🟡'
                          }`}>
                            {alerta.tipo_alerta === 'agotado' ? '🔴' : '🟡'}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {alerta.productos_inventario.nombre}
                          </h3>
                        </div>
                        <p className="text-gray-700">{alerta.mensaje}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(alerta.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => markAlertAsRead(alerta.id)}
                        className="ml-4 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Marcar como leída
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ventas" className="space-y-4">
            {ventas.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay ventas registradas
                </h3>
                <p className="text-gray-600">
                  Las ventas aparecerán aquí cuando comiences a registrarlas
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Talla
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Canal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ventas.map((venta) => (
                        <tr key={venta.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {venta.productos_inventario.nombre}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {venta.productos_inventario.tipo}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {venta.talla}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {venta.cantidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ${venta.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              venta.canal === 'web' ? 'bg-blue-100 text-blue-800' :
                              venta.canal === 'instagram' ? 'bg-pink-100 text-pink-800' :
                              venta.canal === 'fisico' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {venta.canal}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(venta.created_at).toLocaleDateString('es-MX')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <SellModal
          producto={sellModalProduct}
          onClose={() => setSellModalProduct(null)}
          onSell={handleSell}
        />

        <EditStockModal
          producto={editModalProduct}
          onClose={() => setEditModalProduct(null)}
          onSave={handleStockUpdate}
        />
      </div>
    </div>
  );
}