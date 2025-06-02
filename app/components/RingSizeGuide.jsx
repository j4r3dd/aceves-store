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
    <div className="w-full min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-slate-800">
        {/* Header - More mobile friendly */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif text-blue-900 mb-2">
            Guía de Tallas de Anillos
          </h1>
          <p className="text-blue-500 italic text-sm sm:text-base">
            Convierte tu medida fácilmente
          </p>
          <div className="mx-auto mt-4 w-12 h-12 bg-blue-200 rounded-full" />
        </div>

        {/* Tabs - Better mobile spacing */}
        <Tabs defaultValue="tabla" className="w-full">
          <TabsList className="bg-blue-100 text-blue-900 w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="tabla" className="text-xs sm:text-sm">
              Tabla de Tallas
            </TabsTrigger>
            <TabsTrigger value="medir" className="text-xs sm:text-sm">
              Cómo Medir
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="text-xs sm:text-sm">
              Calculadora
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tabla" className="mt-0">
            {/* Mobile-First Table Design */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 font-semibold text-center bg-blue-200 text-blue-900 p-3 text-sm sm:text-base">
                <div>Talla US</div>
                <div>Diámetro (cm)</div>
                <div>Circunferencia (cm)</div>
              </div>
              
              {/* Data Rows */}
              <div className="divide-y divide-gray-200">
                {sizeData.map((row, i) => (
                  <div
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`grid grid-cols-3 gap-2 sm:gap-4 py-3 px-3 cursor-pointer text-center transition-all duration-200 text-sm sm:text-base ${
                      selected === i 
                        ? 'bg-blue-100 scale-[1.02] shadow-md border-l-4 border-blue-500' 
                        : 'hover:bg-blue-50 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="font-semibold text-blue-900">{row.us}</div>
                    <div className="text-gray-700">{row.diameter}</div>
                    <div className="text-gray-700">{row.circumference}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medir" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">
                Cómo medir tu dedo
              </h3>
              <ol className="space-y-4 list-decimal list-inside text-blue-900 text-sm sm:text-base leading-relaxed">
                <li>
                  <strong>Método 1:</strong> Usa un anillo que te quede bien y mide su diámetro interno con una regla.
                </li>
                <li>
                  <strong>Método 2:</strong> Envuelve un hilo alrededor de tu dedo, mídelo y divídelo entre π (3.14) para obtener el diámetro.
                </li>
                <li>
                  <strong>Método 3:</strong> Usa una tira de papel, envuélvela alrededor del dedo y marca donde se junta.
                </li>
              </ol>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Consejos importantes:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Mide al final del día cuando tus dedos están más hinchados</li>
                  <li>• Evita medir cuando tengas las manos frías</li>
                  <li>• Si estás entre dos tallas, elige la más grande</li>
                  <li>• El anillo debe pasar cómodamente sobre el nudillo</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculadora" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">
                Calculadora de Tallas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-blue-900 font-medium text-sm sm:text-base">
                    Ingresa tu medida:
                  </label>
                  
                  {/* Mobile-friendly input layout */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 1.75"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="text-black bg-white border-gray-300 flex-1"
                    />
                    
                    <select
                      className="border border-gray-300 rounded-md p-2 text-black bg-white min-w-[140px]"
                      value={inputType}
                      onChange={(e) => setInputType(e.target.value)}
                    >
                      <option value="diameter">Diámetro (cm)</option>
                      <option value="circumference">Circunferencia (cm)</option>
                    </select>
                    
                    <button
                      onClick={handleCalculation}
                      className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Calcular
                    </button>
                  </div>
                </div>

                {result && (
                  <Card className="p-4 bg-blue-50 text-blue-900 border-blue-200">
                    <h4 className="font-semibold mb-2">📏 Resultado:</h4>
                    <div className="space-y-1 text-sm sm:text-base">
                      <div>Talla más cercana: <strong className="text-lg">US {result.us}</strong></div>
                      <div>Diámetro: <strong>{result.diameter} cm</strong></div>
                      <div>Circunferencia: <strong>{result.circumference} cm</strong></div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact info for mobile users */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            ¿Necesitas ayuda con tu talla?
          </p>
          <p className="text-blue-600 font-medium">
            Contáctanos por WhatsApp para asesoría personalizada
          </p>
        </div>
      </div>
    </div>
  );
}