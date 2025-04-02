import { products } from '@/data/products';
import ProductoView from './Productoview';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductoPage({ params }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) return <div className="p-6">Producto no encontrado.</div>;

  return <ProductoView product={product} />;
}
