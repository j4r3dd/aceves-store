export default function ProductSchema({ product }) {
    // Don't render anything on the server side
    if (typeof window === 'undefined') return null;
    
    // Build the structured data object
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images && product.images.length > 0 ? product.images : [],
      "description": product.description,
      "sku": product.id,
      "mpn": product.id,
      "brand": {
        "@type": "Brand",
        "name": "Aceves Joyería"
      },
      // Add material specifications
      "material": "Plata 925",
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Material",
          "value": "Plata 925"
        },
        {
          "@type": "PropertyValue",
          "name": "Piedra",
          "value": "Moissanita"
        },
        {
          "@type": "PropertyValue",
          "name": "Calidad",
          "value": "Joyería Fina"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": `https://www.acevesoficial.com/producto/${product.id}`,
        "priceCurrency": "MXN",
        "price": product.price,
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "availability": product.outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "Aceves Joyería"
        }
      }
    };
  
    // Optional: Add aggregate rating once you have reviews
    /*
    if (product.reviews && product.reviews.length > 0) {
      schemaData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.reviews.length
      };
    }
    */
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }