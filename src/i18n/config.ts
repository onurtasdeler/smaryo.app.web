// i18n Configuration for VerifyNumber Web
// Supports English (default) and Turkish

export const defaultLocale = 'en'
export const locales = ['en', 'tr'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
}

// Check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// Get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]
  return isValidLocale(potentialLocale) ? potentialLocale : defaultLocale
}

// Remove locale from pathname
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/')
  if (segments.length > 1 && isValidLocale(segments[1])) {
    segments.splice(1, 1)
  }
  return segments.join('/') || '/'
}

// Add locale to pathname
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPathname(pathname)
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}
