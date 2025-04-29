import PageWrapper from './components/PageWrapper';
import PromoBanner from './components/PromoBanner';
import BannerSection from './components/BannerSection';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer'; //
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data: products = [] } = await supabase
    .from('products')
    .select('*')
    .limit(6) // Limit to 6 featured products (customize as needed)

  return (
    <PageWrapper>
      <PromoBanner />
      <BannerSection />
      <FeaturedProducts products={products} />
      <div className="mb-16" />
      <Footer /> 
    </PageWrapper>
  );
}