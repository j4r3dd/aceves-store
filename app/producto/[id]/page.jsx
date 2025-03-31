import { products } from '@/data/products';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductoPage({ params }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) return <div className="p-6">Producto no encontrado.</div>;

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto object-cover rounded"
        />
        <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
        <p className="text-xl text-gray-600 mt-2">${product.price} MXN</p>
        <p className="mt-4 text-lg">{product.description}</p>
      </div>
    </div>
  );
}
