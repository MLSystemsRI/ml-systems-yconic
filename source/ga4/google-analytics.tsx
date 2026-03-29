'use client';

import Script from 'next/script';

// Domain-specific GA4 property
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Unified cross-domain GA4 property (same across all ML Systems sites)
const GA_UNIFIED_ID = process.env.NEXT_PUBLIC_GA_UNIFIED_ID;

const CROSS_DOMAINS = [
  'mlsystemsri.com',
  'app.mlsystemsri.com',
  'mlsystemsri.store',
  'mlsystemsri.info',
  'mlsystemsri.net',
  'mlsystemsri.xyz',
  'pit.mlsystemsri.com',
  'collective.mlsystemsri.com',
  'fa.mlsystemsri.com',
  'boh.mlsystemsri.com',
];

const LINKER_CONFIG = JSON.stringify({
  domains: CROSS_DOMAINS,
  accept_incoming: true,
});

export function GoogleAnalytics() {
  const primaryId = GA_MEASUREMENT_ID || GA_UNIFIED_ID;
  if (!primaryId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { linker: ${LINKER_CONFIG}, cookie_flags: 'SameSite=None;Secure' });` : ''}
          ${GA_UNIFIED_ID && GA_UNIFIED_ID !== GA_MEASUREMENT_ID ? `gtag('config', '${GA_UNIFIED_ID}', { linker: ${LINKER_CONFIG}, cookie_flags: 'SameSite=None;Secure' });` : ''}
        `}
      </Script>
    </>
  );
}
