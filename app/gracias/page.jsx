'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GraciasInner() {
  const searchParams = useSearchParams();
  const nombre = searchParams.get('nombre');
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">
        🎉 ¡Gracias por su compra! {nombre || 'Cliente'}
      </h1>
      <p className="text-lg text-gray-700">
        Hemos recibido su compra, procederemos a preparar el envío. 💌
      </p>

      {orderId && (
        <p className="text-sm text-gray-500 mb-4">
          Order ID: <code>{orderId}</code>
        </p>
      )}
      <p className="text-gray-600">
        Le contactaremos pronto para los detalles de su envío. 🚚
      </p>
      <a href="/" className="mt-6 inline-block text-accent underline">
        Back to Store
      </a>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={<p className="text-center">Loading...</p>}>
      <GraciasInner />
    </Suspense>
  );
}
