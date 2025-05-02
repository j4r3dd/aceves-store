'use client';
import React from 'react';

const SobreNosotros = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Sobre Nosotros</h1>
          <p className="text-lg text-gray-600">Joyería con alma para momentos que importan</p>
        </div>
        
        {/* Sección Principal */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-10 p-8">
          <p className="text-lg text-gray-700 mb-6">
            En <span className="font-bold">Aceves</span>, creemos que el amor se expresa en los detalles. Creamos joyería con alma, piezas artesanales pensadas para capturar momentos importantes entre parejas reales, como tú y tu persona especial. Cada anillo que sale de nuestras manos lleva consigo un mensaje claro: <span className="font-bold">"Eres amado"</span>.
          </p>
          <p className="text-lg text-gray-700">
            Sabemos que no vendemos solo joyas. Vendemos símbolos de conexión, recuerdos para llevar en la piel, y gestos que dicen lo que a veces cuesta expresar con palabras.
          </p>
        </div>
        
        {/* Sección Misión */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="bg-pink-100 px-6 py-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900">Nuestra Misión</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg text-gray-700">
              Crear joyería significativa, accesible y con diseño artesanal que conecte emocionalmente con parejas jóvenes, celebrando su amor a través de piezas únicas y cargadas de intención.
            </p>
          </div>
        </div>
        
        {/* Sección Visión */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="bg-blue-100 px-6 py-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌈</span>
              <h2 className="text-2xl font-bold text-gray-900">Nuestra Visión</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg text-gray-700">
              Ser la marca líder en joyería de pareja en México, reconocida por inspirar relaciones auténticas, regalar momentos memorables y construir una comunidad que cree en el poder del amor joven.
            </p>
          </div>
        </div>
        
        {/* Sección Valores */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="bg-yellow-100 px-6 py-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💛</span>
              <h2 className="text-2xl font-bold text-gray-900">Nuestros Valores</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">
                  <span className="font-bold">Amor real</span>: Celebramos vínculos honestos, únicos e imperfectamente hermosos.
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">
                  <span className="font-bold">Detalles con sentido</span>: Cada pieza tiene un propósito: emocionar, sorprender, conectar.
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">
                  <span className="font-bold">Cercanía</span>: Estamos aquí para ti, como una amiga que te entiende y te ayuda a elegir el regalo perfecto.
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">
                  <span className="font-bold">Autenticidad</span>: No creemos en el lujo vacío, sino en la belleza con historia.
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">
                  <span className="font-bold">Compromiso emocional</span>: No vendemos solo joyas, vendemos recuerdos, promesas y sonrisas.
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* CTA Final */}
        <div className="bg-gradient-to-r from-pink-500 to-yellow-500 shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Una joya con alma para cada historia de amor</h3>
            <p className="text-lg mb-6">Descubre nuestra colección y encuentra la pieza perfecta para expresar lo que sientes</p>
            <button className="bg-white text-pink-500 px-6 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition duration-300">
              Ver Colección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SobreNosotros;