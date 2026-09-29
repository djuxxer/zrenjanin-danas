'use client'

import Script from 'next/script'

interface Props {
  analyticsId: string | null
  fbPixel: string | null
  googleAdsId: string | null
}

export function CookieConsentAndAnalytics({ analyticsId, fbPixel, googleAdsId }: Props) {
  return (
    <>
      {analyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsId}');
            `}
          </Script>
        </>
      )}

      {googleAdsId && (
        <>
          {/* Google Ads gtag se učitava samo ako GA4 tag (analyticsId) nije već postavljen, da se skripta ne bi učitala dva puta */}
          {!analyticsId && (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
          )}
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
              gtag('event', 'conversion_event_page_view_1', {
                'send_to': '${googleAdsId}'
              });
            `}
          </Script>
        </>
      )}

      {fbPixel && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )
}
