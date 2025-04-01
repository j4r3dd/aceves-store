import Navbar from "./components/Navbar";
import PromoBanner from "./components/PromoBanner";
import BannerSection from "./components/BannerSection";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-white text-gray-900">
      <Navbar />
      <PromoBanner />
      <BannerSection />

      {/* ✨ Future sections */}
      {/* <ProductShowcase /> */}
      {/* <AboutSection /> */}
      {/* <Footer /> */}
    </main>
  );
}


