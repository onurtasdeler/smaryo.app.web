import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { StructuredData } from '@/components/structured-data'
import { locales, isValidLocale } from '@/i18n/config'
import { getTranslation } from '@/i18n/server'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

const siteConfig = {
  name: 'Smaryo',
  url: 'https://smaryo.app',
  ogImage: 'https://smaryo.app/og-image.png',
  creator: 'Smaryo',
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const validLocale = isValidLocale(locale) ? locale : 'en'
  const t = getTranslation(validLocale)

  const localeMap: Record<string, string> = {
    en: 'en_US',
    tr: 'tr_TR',
  }

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t('seo.title'),
      template: `%s | ${siteConfig.name}`,
    },
    description: t('seo.description'),
    keywords: [
      'sms verification',
      'temporary phone number',
      'virtual number',
      'online verification',
      'smaryo',
      'whatsapp verification',
      'telegram verification',
      'instagram verification',
      'secure sms',
      'anonymous number',
      'disposable number',
    ],
    authors: [{ name: siteConfig.creator, url: siteConfig.url }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    category: 'technology',
    classification: 'Business',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: localeMap[validLocale],
      url: siteConfig.url,
      title: t('seo.ogTitle'),
      description: t('seo.ogDescription'),
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - Secure SMS Verification`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seo.ogTitle'),
      description: t('seo.ogDescription'),
      images: [siteConfig.ogImage],
      creator: '@smaryoapp',
      site: '@smaryoapp',
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
      ],
    },
    manifest: '/site.webmanifest',
    alternates: {
      canonical: `${siteConfig.url}/${validLocale}`,
      languages: {
        'en': `${siteConfig.url}/en`,
        'tr': `${siteConfig.url}/tr`,
      },
    },
    verification: {
      google: 'YOUR_GOOGLE_VERIFICATION_CODE',
      yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
      other: {
        'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE',
      },
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': siteConfig.name,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <StructuredData />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
