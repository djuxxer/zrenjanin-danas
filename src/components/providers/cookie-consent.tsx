'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { X } from 'lucide-react'

interface Props {
  analyticsId: string | null
  fbPixel: string | null
}

type Consent = 'accepted' | 'rejected' | null

export function CookieConsentAndAnalytics({ analyticsId, fbPixel }: Props) {
  const [consent, setConsent] = useState<Consent>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent') as Consent
    setConsent(stored)
    setHydrated(true)
  }, [])

  function decide(value: 'accepted' | 'rejected') {
    localStorage.setItem('cookie_consent', value)
    setConsent(value)
  }

  return (
    <>
      {/* Analitika/Pixel se učitavaju SAMO ako je posetilac dao saglasnost */}
      {consent === 'accepted' && analyticsId && (
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

      {consent === 'accepted' && fbPixel && (
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

      {/* Cookie consent baner — prikazuje se dok posetilac ne odluči */}
      {hydrated && consent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-2xl">
          <div className="container mx-auto flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm flex-1">
              Koristimo kolačiće za analitiku poseta kako bismo unapredili sadržaj portala. Više detalja u našoj{' '}
              <a href="/privatnost" className="underline hover:text-brand-red">
                Politici privatnosti
              </a>.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => decide('rejected')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                Odbij
              </button>
              <button
                onClick={() => decide('accepted')}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-red hover:bg-brand-red-dark transition-colors"
              >
                Prihvati
              </button>
              <button
                onClick={() => decide('rejected')}
                className="p-2 text-gray-400 hover:text-white sm:hidden"
                aria-label="Zatvori"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
