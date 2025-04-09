// app/producto/[id]/page.jsx
import ProductoView from '../ProductoView';
import path from 'path';
import { promises as fs } from 'fs';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const products = JSON.parse(jsonData);

  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductoPage({ params }) {
  const { id } = params;

  const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const products = JSON.parse(jsonData);

  const product = products.find((p) => p.id === id);

  if (!product) return <div className="p-6">Producto no encontrado.</div>;

  return <ProductoView product={product} />;
}
