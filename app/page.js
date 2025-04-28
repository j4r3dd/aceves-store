import PageWrapper from './components/PageWrapper'; // ✅ Import it!
import PromoBanner from './components/PromoBanner';
import BannerSection from './components/BannerSection';

export default function Home() {
  return (
    <PageWrapper>
      <PromoBanner />
      <BannerSection />

      {/* ✨ Future sections */}
      {/* <ProductShowcase /> */}
      {/* <AboutSection /> */}
      {/* <Footer /> */}
    </PageWrapper>
  );
}


