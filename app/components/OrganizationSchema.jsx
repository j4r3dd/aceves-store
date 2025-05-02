// This can be a separate file or added directly to your layout.js
function OrganizationSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aceves Joyería",
    "url": "https://www.acevesoficial.com/",
    "logo": "https://hnaptwk79kknvilx.public.blob.vercel-storage.com/logo/logo%20principal%20%281%29-R8ZSkLmTZwcRUnBkL6NFtSnwc3Huie.png",
    "sameAs": [
      "https://www.instagram.com/joyeria.aceves/",
      "https://www.facebook.com/profile.php?id=61557360429249"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-443-687-5928", // Add your actual phone number here
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}