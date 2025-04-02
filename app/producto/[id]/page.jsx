import { products } from '../../data/products';
import ProductoView from '../ProductoView';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductoPage({ params }) {
  const { id } = await params; // ✅ await required in some dev cases
  const product = products.find((p) => p.id === id);

  if (!product) return <div className="p-6">Producto no encontrado.</div>;

  return <ProductoView product={product} />;
}
