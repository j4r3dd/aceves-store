'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase"; // Adjust path if needed

export default function BannerSection() {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order');

      if (error) {
        console.error("❌ Failed to fetch banners:", error.message);
      } else {
        console.log("✅ Banners fetched:", data);
        setImages(data || []);
      }
    };

    fetchBanners();
  }, []);

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
  }, [current, images.length]);

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative max-w-screen-lg mx-auto overflow-hidden rounded-2xl shadow-lg">
        {images.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No banners to display.
          </div>
        ) : (
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((img, index) => (
              <Link key={index} href={img.link || "#"} className="min-w-full">
                <img
                  src={img.image_url}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-auto cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}

        {/* Arrows */}
        {images.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
