import Navbar from "./components/Navbar";
import PromoBanner from "./components/PromoBanner";
import BannerSection from "./components/BannerSection";


export default function Home() {
  return (
    <main>
      <Navbar />
      <PromoBanner />
      <BannerSection />
      {/* Your homepage content goes here */}
    </main>
  );
}

