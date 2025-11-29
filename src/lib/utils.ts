import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateBonus(amount: number): { bonus: number; total: number; rate: number } {
  let rate = 0

  if (amount >= 1000) {
    rate = 20
  } else if (amount >= 500) {
    rate = 15
  } else if (amount >= 250) {
    rate = 10
  } else if (amount >= 100) {
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
