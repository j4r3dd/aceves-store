'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

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
      {/* Slider Container */}
      <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden bg-white">
        {images.map((src, idx) => (
          <div key={idx} className="keen-slider__slide flex items-center justify-center bg-white">
            <Image
              src={src}
              alt={`Imagen ${idx + 1}`}
              width={600}
              height={600}
              priority={idx === 0} // Preload first image
              className="w-full h-auto object-contain"
              unoptimized={false}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {instanceRef.current && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute top-1/2 -translate-y-1/2 left-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute top-1/2 -translate-y-1/2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full ${
              idx === currentSlide ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
