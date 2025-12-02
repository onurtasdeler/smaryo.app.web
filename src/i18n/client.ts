'use client'

import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { Locale, defaultLocale, isValidLocale } from './config'
import en from './locales/en.json'
import tr from './locales/tr.json'

// Type for nested translation keys
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

export type TranslationKey = NestedKeyOf<typeof en>

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

// Hook to get current locale from URL params
export function useLocale(): Locale {
  const params = useParams()
  const locale = params?.locale as string | undefined

  if (locale && isValidLocale(locale)) {
    return locale
  }
  return defaultLocale
}

// Hook to get translation function
export function useTranslation() {
  const locale = useLocale()
  const dictionary = dictionaries[locale]

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = getNestedValue(dictionary as Record<string, unknown>, key)

      // Replace placeholders {key} with values
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(
            new RegExp(`\\{${paramKey}\\}`, 'g'),
            String(value)
          )
        })
      }

      return translation
    },
    [dictionary]
  )

  return { t, locale }
}
