'use client';
import React, { useState } from 'react';

const FAQPage = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "¿De qué material están hechos los anillos?",
      answer: "Nuestros anillos están hechos con materiales de calidad como acero inoxidable o plata, resistentes al uso diario y pensados para durar. Cada pieza está diseñada artesanalmente para que sea única, como tu historia de amor."
    },
    {
      question: "¿Puedo bañarme o lavarme las manos con los anillos puestos?",
      answer: "Sí, muchos de nuestros modelos están hechos para resistir el agua. Aun así, recomendamos evitar productos abrasivos para conservar el brillo por más tiempo."
    },
    {
      question: "¿Hacen anillos personalizados o con grabado?",
      answer: "¡Sí! Puedes agregar un grabado especial en la parte interna del anillo, como una fecha, iniciales o una palabra que represente su historia juntos."
    },
    {
      question: "¿Cómo sé qué talla soy?",
      answer: "Contamos con una guía de tallas en nuestra página."
    },
    {
      question: "¿Cuánto tarda en llegar mi pedido?",
      answer: "Envíos dentro de México suelen tardar entre 2 y 5 días hábiles. Te mandamos tu número de seguimiento en cuanto el pedido esté en camino."
    },
    {
      question: "¿Qué significa regalar un anillo de Aceves?",
      answer: "Significa decir \"te amo\" sin decirlo. Es demostrar que te importa esa persona y regalarle algo único, artesanal y con valor emocional."
    },
    {
      question: "¿Tienen garantía?",
      answer: "Sí, ofrecemos garantía de 30 días por defectos de fabricación. Si pasa algo con tu anillo, escríbenos y lo solucionamos rápido."
    },
    {
      question: "¿Puedo cambiar mi anillo si no me queda?",
      answer: "Claro, puedes hacer un cambio por talla dentro de los primeros 7 días. Solo asegúrate de que el anillo no esté usado ni dañado."
    },
    {
      question: "¿Tienen tienda física?",
      answer: "Por ahora somos 100% online, pero cada compra va envuelta con mucho amor y una experiencia especial para regalar."
    },
    {
      question: "¿Cómo puedo compartir mi historia con Aceves?",
      answer: "Nos encantaría leerla. Puedes etiquetarnos en Instagram o TikTok como @aceves.joyería o enviarnos un mensaje para aparecer en nuestra comunidad de parejas reales."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
          <p className="text-lg text-gray-600">Todo lo que necesitas saber sobre nuestros anillos y servicios</p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <span className="ml-6 flex-shrink-0">
                    {openQuestion === index ? (
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                {openQuestion === index && (
                  <div className="mt-4 pr-12">
                    <p className="text-base text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">¿Tienes otras preguntas?</h4>
              <p className="mt-1 text-gray-600">
                Contáctanos por Instagram o WhatsApp y te responderemos a la brevedad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;