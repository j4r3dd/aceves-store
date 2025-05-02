// app/components/Footer.jsx
import Link from 'next/link';
export default function Footer() {
    return (
      <footer className="bg-[#092536] text-white text-sm">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-2">Promociones</h4>
            <p>Por $1,099 llévate un set de anillos de promesa y unos aretes</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Envío Gratis</h4>
            <p>Envíos estándar gratis en todos nuestros productos</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Devoluciones</h4>
            <button className="mt-2 px-3 py-1 border border-white rounded hover:bg-white hover:text-black">
            <Link href="/devoluciones" className="hover:text-white transition-colors">
                Haz clic aquí para ver las políticas de devolución
            </Link>
            </button>
          </div>
        </div>
  
        <div className="bg-[#759bbb] py-8 px-6 text-neutral-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h5 className="font-semibold text-black mb-2">AYUDA</h5>
              <ul>
                <li>
                <Link href="/FAQ" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
                </li>
                <li>
                <Link href="/guia-tallas" className="hover:text-white transition-colors">
                    Guía de tallas
                </Link>
                </li>
                <li>
                <Link href="/devoluciones" className="hover:text-white transition-colors">
                  Devoluciones
                </Link>
                </li>
                <li>Garantías</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-black mb-2">NOSOTROS</h5>
              <ul>
                <li>
                <Link href="/Nosotros" className="hover:text-white transition-colors">
                  Sobre nosotros
                </Link>
                </li>
                <li>Joyería Responsable</li>
                <li>
                <Link href="/guia-cuidados" className="hover:text-white transition-colors">
                    Instrucciones de Cuidado
                </Link>
                </li>
                <li>Protección de la marca</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-black mb-2">ATENCIÓN A CLIENTE</h5>
              <p>Lunes a Viernes<br />09:00 - 18:00</p>
              <button className="mt-2 px-3 py-1 border border-white rounded hover:bg-white hover:text-black">
                Contáctanos
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  