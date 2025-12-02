import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Locale } from '@/i18n/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with locale support
 * @param amount - The amount to format
 * @param locale - The locale ('en' or 'tr'), defaults to 'en'
 * @param currency - The currency code, defaults to 'USD'
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'en',
  currency: string = 'USD'
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    tr: 'tr-TR',
  }

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date with locale support
 * @param date - The date to format
 * @param locale - The locale ('en' or 'tr'), defaults to 'en'
 */
export function formatDate(date: string | Date, locale: Locale = 'en'): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    tr: 'tr-TR',
  }

  return new Intl.DateTimeFormat(localeMap[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Calculate bonus based on USD amount
 * Tiers: $5+ = 5%, $15+ = 10%, $30+ = 15%, $60+ = 20%
 */
export function calculateBonus(amount: number): { bonus: number; total: number; rate: number } {
  let rate = 0

  if (amount >= 60) {
    rate = 20
  } else if (amount >= 30) {
    rate = 15
  } else if (amount >= 15) {
    rate = 10
  } else if (amount >= 5) {
    rate = 5
  }

  const bonus = amount * (rate / 100)
  const total = amount + bonus

  return { bonus, total, rate }
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length < 4) return phone
  const visibleStart = phone.slice(0, 4)
  const visibleEnd = phone.slice(-2)
  const maskedMiddle = '*'.repeat(phone.length - 6)
  return `${visibleStart}${maskedMiddle}${visibleEnd}`
}
