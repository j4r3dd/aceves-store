import ExpandableSection from './ExpandableSection';

export default function AnillosInfo() {
  return (
    <ExpandableSection 
      title="Información Detallada sobre Anillos de Promesa"
      className="mt-8"
    >
      <div className="text-black leading-relaxed space-y-4">
        <p>
          Descubre nuestra colección de <strong>anillos de promesa</strong> únicos, creados para celebrar 
          el amor y compromiso entre parejas. Cada pieza está diseñada artesanalmente con materiales 
          de alta calidad como acero inoxidable y plata, resistentes al uso diario y pensados para durar, 
          como tu historia de amor.
        </p>
        <p>
          En Aceves entendemos que regalar un <strong>anillo de promesa</strong> significa decir "te amo" sin 
          palabras. Es un símbolo de conexión y compromiso. Explora nuestra colección y encuentra 
          el anillo perfecto para sellar tu promesa de amor.
        </p>
      </div>
    </ExpandableSection>
  );
}