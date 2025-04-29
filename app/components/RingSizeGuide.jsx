import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

const sizeData = [
  { us: '5', diameter: '1.57', circumference: '4.93' },
  { us: '6', diameter: '1.65', circumference: '5.18' },
  { us: '7', diameter: '1.73', circumference: '5.43' },
  { us: '8', diameter: '1.82', circumference: '5.71' },
  { us: '9', diameter: '1.89', circumference: '5.94' },
  { us: '10', diameter: '1.98', circumference: '6.22' },
];

export default function RingSizeGuide() {
  const [selected, setSelected] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('diameter');
  const [result, setResult] = useState(null);

  const handleCalculation = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return setResult(null);
    const closest = sizeData.reduce((prev, curr) => {
      const diff = Math.abs(value - parseFloat(curr[inputType]));
      const prevDiff = Math.abs(value - parseFloat(prev[inputType]));
      return diff < prevDiff ? curr : prev;
    });
    setResult(closest);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-slate-800">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-serif text-blue-900">Guía de Tallas de Anillos</h1>
        <p className="text-blue-500 italic">Convierte tu medida fácilmente</p>
        <div className="mx-auto mt-4 w-12 h-12 bg-blue-200 rounded-full" />
      </div>

      <Tabs defaultValue="tabla">
        <TabsList className="bg-blue-100 text-blue-900">
          <TabsTrigger value="tabla">Tabla de Tallas</TabsTrigger>
          <TabsTrigger value="medir">Cómo Medir</TabsTrigger>
          <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
        </TabsList>

        <TabsContent value="tabla">
          <div className="mt-4 grid grid-cols-3 font-semibold text-center bg-blue-200 text-blue-900">
            <div>Talla US</div>
            <div>Diámetro (cm)</div>
            <div>Circunferencia (cm)</div>
          </div>
          {sizeData.map((row, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`grid grid-cols-3 py-2 px-4 cursor-pointer text-center transition rounded-md ${
                selected === i ? 'bg-blue-100 scale-105 shadow' : 'hover:bg-blue-50'
              }`}
            >
              <div>{row.us}</div>
              <div>{row.diameter}</div>
              <div>{row.circumference}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="medir">
          <ol className="mt-4 space-y-4 list-decimal list-inside text-blue-900">
            <li>
              Usa un anillo que te quede bien y mide su diámetro interno con una regla.
            </li>
            <li>
              Compara con la tabla para conocer tu talla.
            </li>
            <li>
              También puedes envolver un hilo alrededor de tu dedo, medirlo y dividir entre π (3.14) para obtener el diámetro.
            </li>
          </ol>
          <p className="mt-6 italic text-blue-600">
            Consejo: Es mejor medir tus dedos al final del día y evitar hacerlo cuando estén fríos.
          </p>
        </TabsContent>

        <TabsContent value="calculadora">
          <div className="mt-4">
            <label className="block mb-2 text-blue-900">Ingresa tu medida:</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Ej. 1.75"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
              >
                <option value="diameter">Diámetro</option>
                <option value="circumference">Circunferencia</option>
              </select>
              <button
                onClick={handleCalculation}
                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Calcular
              </button>
            </div>
            {result && (
              <Card className="mt-4 p-4 bg-blue-50 text-blue-900">
                Talla más cercana: <strong>US {result.us}</strong><br />
                Diámetro: {result.diameter} cm<br />
                Circunferencia: {result.circumference} cm
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
