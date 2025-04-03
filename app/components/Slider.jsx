// app/components/Slider.jsx
'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Slider({ images }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Slider */}
      <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
        {images.map((src, idx) => (
          <div key={idx} className="keen-slider__slide">
            <img src={src} alt={`Imagen ${idx + 1}`} className="w-full h-auto object-cover" />
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors duration-200 cursor-pointer ${
              currentSlide === idx ? 'bg-black' : 'bg-gray-400'
            }`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
}

