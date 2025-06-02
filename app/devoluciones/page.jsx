'use client';

import PageWrapper from '../components/PageWrapper';
import Link from 'next/link';

export default function DevolucionesPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-primary mb-8 flex items-center">
          <span className="mr-2">🛍️</span> Política de Devoluciones
        </h1>

        <div className="space-y-8 text-[#092536]">
          {/* Sección 1 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Plazo para Solicitar Devoluciones</h2>
            <p className="leading-relaxed">
              Los clientes podrán solicitar la devolución de productos dentro de los 5 días hábiles siguientes a la recepción del producto.
            </p>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Condiciones para Aceptar Devoluciones</h2>
            <p className="leading-relaxed mb-2">
              Para que una devolución sea aceptada, se deben cumplir las siguientes condiciones:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El producto debe estar en su empaque original, sin señales de uso y en condiciones aptas para su reventa.</li>
              <li>Se debe presentar el comprobante de compra.</li>
              <li>El producto no debe estar en la lista de excepciones detalladas en el punto 4.</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Proceso de Devolución</h2>
            <p className="leading-relaxed">
              Para iniciar una devolución, el cliente deberá contactar a nuestro servicio de atención al cliente a través de 
              <a href="mailto:corporativoaceves.lo@gmail.com" className="text-accent hover:underline mx-1">corporativoaceves@gmail.com</a> 
              o al <span className="font-medium">+52 443 687 5928</span>, proporcionando el número de pedido y una descripción del motivo 
              de la devolución. Nuestro equipo proporcionará las instrucciones necesarias para completar el proceso.
            </p>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Excepciones</h2>
            <p className="leading-relaxed mb-2">
              No se aceptarán devoluciones en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Productos personalizados o confeccionados según especificaciones del cliente.</li>
              <li>Bienes perecederos o con fecha de caducidad próxima.</li>
              <li>Artículos de higiene personal o que, por su naturaleza, no puedan ser devueltos por razones de salud o higiene.</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Reembolsos</h2>
            <p className="leading-relaxed">
              Una vez aprobada la devolución, se procederá al reembolso utilizando el mismo método de pago empleado en la compra original, 
              salvo que el cliente acuerde otra forma. El reembolso se efectuará en un plazo no mayor a 15 días hábiles después de recibir y 
              verificar el estado del producto devuelto.
            </p>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Costos de Envío</h2>
            <p className="leading-relaxed">
              Los gastos de envío asociados a la devolución serán cubiertos por el cliente, excepto en casos donde el producto presente defectos 
              de fabricación o no corresponda a lo solicitado.
            </p>
          </section>
        </div>

        {/* Botón de regreso */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-accent transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}