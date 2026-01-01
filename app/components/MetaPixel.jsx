'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Meta Pixel only once
    if (typeof window !== 'undefined' && !window.fbq) {
      // Load Meta Pixel script
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      // Initialize with your Pixel ID
      window.fbq('init', '1133806538623418');

      console.log('✅ Meta Pixel initialized');

      // Note: We don't track PageView here because the second useEffect will handle it
    }
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
      console.log('📄 Meta Pixel: PageView tracked for', pathname);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Noscript fallback for users without JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1133806538623418&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
