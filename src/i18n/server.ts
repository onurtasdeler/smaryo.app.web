import { Locale, defaultLocale, isValidLocale } from './config'
import en from './locales/en.json'
import tr from './locales/tr.json'

// Translation dictionaries
const dictionaries: Record<Locale, typeof en> = {
  en,
  tr,
}

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return path // Return key as fallback
    }
    current = (current as Record<string, unknown>)[key]
  }

  if (typeof current === 'string') {
    return current
  }
  return path // Return key as fallback
}

// Server-side translation function (for server components)
export function getTranslation(locale: Locale) {
  const dictionary = dictionaries[locale]

  return function t(key: string, params?: Record<string, string | number>): string {
    let translation = getNestedValue(dictionary as Record<string, unknown>, key)

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(
          new RegExp(`\\{${paramKey}\\}`, 'g'),
          String(value)
        )
      })
    }

    return translation
  }
}

// Get dictionary for a specific locale (server-side)
export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

// Parse and validate locale from string
export function parseLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return defaultLocale
}
