import Script from 'next/script'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://smaryo.app/#organization',
  name: 'Smaryo',
  url: 'https://smaryo.app',
  logo: {
    '@type': 'ImageObject',
    url: 'https://smaryo.app/logo.png',
    width: 512,
    height: 512,
  },
  description: 'Güvenli ve hızlı SMS doğrulama hizmeti',
  foundingDate: '2024',
  sameAs: ['https://twitter.com/smaryo'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'destek@smaryo.app',
    contactType: 'customer service',
    availableLanguage: ['Turkish', 'English'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://smaryo.app/#website',
  url: 'https://smaryo.app',
  name: 'Smaryo',
  description: 'Güvenli ve hızlı SMS doğrulama hizmeti. Geçici telefon numaraları ile hesaplarınızı kolayca doğrulayın.',
  publisher: { '@id': 'https://smaryo.app/#organization' },
  inLanguage: 'tr-TR',
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://smaryo.app/#service',
  name: 'SMS Doğrulama Hizmeti',
  description: 'Güvenli ve hızlı SMS doğrulama hizmeti. 50+ ülkeden geçici telefon numaraları.',
  provider: { '@id': 'https://smaryo.app/#organization' },
  serviceType: 'SMS Verification Service',
  areaServed: { '@type': 'Country', name: 'Worldwide' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'TRY',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'SMS doğrulama hizmeti nedir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SMS doğrulama hizmeti, çevrimiçi hesaplarınızı doğrulamak için geçici telefon numaraları sağlar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hangi ülkelerden numara alabilirim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Smaryo ile 50den fazla ülkeden geçici telefon numarası alabilirsiniz.',
      },
    },
    {
      '@type': 'Question',
      name: 'SMS ne kadar sürede gelir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SMS genellikle birkaç saniye içinde gelir. Bazı durumlarda 1-2 dakika sürebilir.',
      },
    },
  ],
}

export function StructuredData() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(organizationSchema)}
      </Script>
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(websiteSchema)}
      </Script>
      <Script
        id="service-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(serviceSchema)}
      </Script>
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(faqSchema)}
      </Script>
    </>
  )
}
