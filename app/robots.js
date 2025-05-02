// app/robots.js
export default function robots() {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout/', '/cart/']
      },
      sitemap: 'https://www.acevesoficial.com/sitemap.xml' // Replace with your domain
    }
  }