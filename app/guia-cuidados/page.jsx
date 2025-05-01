// app/care-guide/page.jsx
'use client';

import PageWrapper from '../components/PageWrapper';
import Link from 'next/link';

export default function CareGuidePage() {
  return (
    <PageWrapper>
      {/* Header */}
      <header className="bg-primary text-[#092536] py-12 px-6 text-center rounded-t-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-serif"> Cuida Tu Joyería Aceves</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90 leading-relaxed">
            Tus piezas Aceves son más que accesorios — son promesas, momentos y emociones hechas joya. 
            Para que te acompañen por mucho tiempo, te compartimos algunos consejos esenciales.
          </p>
        </div>
      </header>
      
      {/* Care Instructions Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* When to Remove Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:translate-y-[-5px]">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-400 px-6 py-5 text-white">
              <h3 className="text-xl font-bold">💫 ¿Cuándo quitarte tu joya?</h3>
            </div>
            <div className="p-6 text-[#092536]">
              <p className="mb-3">Te recomendamos quitarte tu joyería antes de:</p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Dormir</li>
                <li>Hacer ejercicio</li>
                <li>Tener contacto con agua (alberca, mar o ducha)</li>
              </ul>
              <p className="mb-3">Perfumes, cremas, cloro o incluso el sudor pueden afectar el brillo y color de tu pieza.</p>
              <p className="font-semibold">Recuerda: cada pieza Aceves es hecha con amor y detalle artesanal — protégela como el símbolo que es.</p>
            </div>
          </div>
          
          {/* How to Clean Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:translate-y-[-5px]">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-5 text-white">
              <h3 className="text-xl font-bold">🧼 ¿Cómo limpiar tu joya?</h3>
            </div>
            <div className="p-6 text-[#092536]">
              <p className="mb-3">Solo necesitas:</p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Agua tibia</li>
                <li>Jabón suave</li>
                <li>Cepillito de cerdas blandas (puede ser uno de dientes)</li>
              </ul>
              <p className="mb-3">Frota suavemente y enjuaga bien. Seca con una tela suave, sin frotar demasiado.</p>
              <p className="mb-3"><strong>Importante:</strong> Evita este método con perlas o materiales delicados.</p>
              <p>Para piezas de plata, también puedes usar un paño especial de pulido de joyería (no abrasivos). Esto ayudará a devolverle su brillo natural.</p>
            </div>
          </div>
          
          {/* Special Finishes Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:translate-y-[-5px]">
            <div className="bg-gradient-to-r from-pink-400 to-red-200 px-6 py-5 text-white">
              <h3 className="text-xl font-bold">💖 Acabados especiales</h3>
            </div>
            <div className="p-6 text-[#092536]">
              <p className="mb-3">Las piezas con acabados especiales o baños de color requieren cuidados adicionales:</p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Evita el contacto con productos químicos como perfumes, lociones o cloro</li>
                <li>No uses limpiadores abrasivos o ultrasónicos</li>
                <li>Limpia suavemente con un paño de microfibra</li>
                <li>Guárdalas separadas de otras joyas para evitar rayones</li>
              </ul>
              <p>El brillo y color de estos acabados puede alterarse con el uso continuo, por lo que requieren mayor atención.</p>
            </div>
          </div>
          
          {/* Storage Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:translate-y-[-5px]">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-5 text-white">
              <h3 className="text-xl font-bold">📦 ¿Dónde guardar tu joya?</h3>
            </div>
            <div className="p-6 text-[#092536]">
              <p className="mb-3">Lo ideal es mantenerla:</p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Lejos del sol directo</li>
                <li>En ambientes sin humedad</li>
                <li>Protegida del calor</li>
              </ul>
              <p className="mb-3">Guárdala en una bolsita antiempañante o una cajita de joyería forrada.</p>
              <p><strong>Evita:</strong> No guardes tus joyas en el baño ni en bolsas de plástico comunes — pueden acelerar el desgaste de la plata.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Annual Service Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-purple-50 rounded-xl text-center py-10 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#092536] mb-4">Servicio y revisión anual</h2>
          <p className="text-lg max-w-2xl mx-auto text-[#092536]">
            El uso diario puede desgastar los metales preciosos. Te recomendamos que una vez al año 
            revises tu joya con un orfebre para asegurar que los cierres y detalles estén en buen estado.
          </p>
        </div>
      </section>
      
      {/* Collections Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-10">Nuestras Colecciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Silver Collection */}
          <div className="bg-gradient-to-b from-gray-200 to-gray-100 rounded-xl text-center p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-[1.03] duration-300">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Plata</h3>
            <p className="text-[#092536]">Elegancia atemporal con el brillo puro de la plata de ley</p>
          </div>
          
          {/* Gold Collection */}
          <div className="bg-gradient-to-b from-amber-200 to-yellow-100 rounded-xl text-center p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-[1.03] duration-300">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Oro</h3>
            <p className="text-[#092536]">Lujo y distinción que perdura generaciones</p>
          </div>
          
          {/* Rose Gold Collection */}
          <div className="bg-gradient-to-b from-rose-200 to-pink-100 rounded-xl text-center p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-[1.03] duration-300">
            <div className="text-4xl mb-4">💫</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Oro Rosado</h3>
            <p className="text-[#092536]">Calidez y romanticismo en tonos rosados únicos</p>
          </div>
        </div>
      </section>
      
      <div className="mt-8 text-center">
        <Link 
          href="/" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-accent transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </PageWrapper>
  );
}