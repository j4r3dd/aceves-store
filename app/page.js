// app/page.js
import PageWrapper from './components/PageWrapper';
import PromoBanner from './components/PromoBanner';
import BannerSection from './components/BannerSection';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Script from 'next/script';

// Organization structured data component for SEO
function ShopStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aceves Joyería",
    "url": "https://www.acevesoficial.com", // Replace with your actual domain
    "logo": "https://hnaptwk79kknvilx.public.blob.vercel-storage.com/logo/logo%20principal%20%281%29-R8ZSkLmTZwcRUnBkL6NFtSnwc3Huie.png", // Replace with your actual logo URL
    "description": "Joyería artesanal mexicana con alma para momentos que importan. Anillos y collares diseñados para capturar momentos importantes entre parejas.",
    "sameAs": [
      // Replace with your actual social media URLs
      "https://www.instagram.com/joyeria.aceves/",
      "https://www.facebook.com/profile.php?id=61557360429249"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    }
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite structured data for SEO
function WebsiteStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Aceves Joyería",
    "url": "https://www.acevesoficial.com", // Replace with your actual domain
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.acevesoficial.com/buscar?q={search_term_string}", // Replace with your search URL pattern
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function Home() {
  // Properly await cookies in Next.js 13+
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: products = [] } = await supabase
    .from('products')
    .select('*')
    .limit(6); // Limit to 6 featured products

    
  // Add structured data for the homepage products
  function FeaturedProductsStructuredData() {
  // Guard against empty products array
  if (!products || products.length === 0) {
    return null;
  }

  // Additional guard to make sure each product has the expected properties
  const validProducts = products.filter(product => 
    product && 
    typeof product === 'object' && 
    product.id && 
    product.name && 
    typeof product.price === 'number'
  );

  // If no valid products, return null
  if (validProducts.length === 0) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": validProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name || 'Producto',
        "description": product.description || '',
        "image": product.images && product.images.length > 0 ? product.images[0] : '',
        "url": `https://www.acevesoficial.com/producto/${product.id}`,
        "sku": product.id,
        "brand": {
          "@type": "Brand",
          "name": "Aceves Joyería"
        },
        "offers": {
          "@type": "Offer",
          "url": `https://www.acevesoficial.com/producto/${product.id}`,
          "price": product.price,
          "priceCurrency": "MXN",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  // Safe execution with try/catch to avoid any potential rendering errors
  try {
    return (
      <Script
        id="featured-products-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch (error) {
    console.error("Error rendering FeaturedProductsStructuredData:", error);
    return null;
  }
}

  return (
    <>
      <ShopStructuredData />
      <WebsiteStructuredData />
      {products && products.length > 0 && <FeaturedProductsStructuredData />}
      
      <PageWrapper>
        <PromoBanner />
        <BannerSection />
        <FeaturedProducts products={products} />
        <div className="mb-16" />
        <Footer />
      </PageWrapper>
    </>
  );
}