'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function Slider({ images, productName = 'Producto' }) {
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
      {/* Slider Container */}
      <div 
        ref={sliderRef} 
        className="keen-slider rounded-lg overflow-hidden bg-white"
        role="region"
        aria-label={`Galería de imágenes de ${productName}`}
      >
        {images.map((src, idx) => (
          <div 
            key={idx} 
            className="keen-slider__slide flex items-center justify-center bg-white"
            aria-roledescription="slide"
            aria-label={`Imagen ${idx + 1} de ${images.length}`}
          >
            <Image
              src={src}
              alt={idx === 0 
                ? `${productName} - Imagen principal` 
                : `${productName} - Vista ${idx + 1}`}
              width={600}
              height={600}
              priority={idx === 0}
              className="w-full h-auto object-contain"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loops
                e.target.src = '/placeholder-product.png'; // Replace with your placeholder image
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {instanceRef.current && images.length > 1 && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute top-1/2 -translate-y-1/2 left-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft aria-hidden="true" />
            <span className="sr-only">Imagen anterior</span>
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute top-1/2 -translate-y-1/2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
            aria-label="Imagen siguiente"
          >
            <ChevronRight aria-hidden="true" />
            <span className="sr-only">Imagen siguiente</span>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div 
          className="flex justify-center mt-4 gap-2"
          role="tablist"
          aria-label="Selector de imágenes"
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`h-2 w-2 rounded-full ${
                idx === currentSlide ? 'bg-black' : 'bg-gray-300'
              }`}
              role="tab"
              aria-selected={idx === currentSlide}
              aria-label={`Ver imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Image counter for accessibility */}
      <div className="sr-only" aria-live="polite">
        Mostrando imagen {currentSlide + 1} de {images.length} del producto {productName}
      </div>
    </div>
  );
}