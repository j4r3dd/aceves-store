'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  { src: "/Banner.png", href: "/anillos" },
  { src: "/Banner anillos.png", href: "/producto-2" },
  { src: "/Banner3.png", href: "/producto-3" },
];

export default function BannerSection() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative max-w-screen-lg mx-auto overflow-hidden rounded-2xl shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, index) => (
            <Link key={index} href={img.href} className="min-w-full">
              <img
                src={img.src}
                alt={`Banner ${index + 1}`}
                className="w-full h-auto cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </Link>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
