// Polar payment types for VerifyNumber web platform

export interface BalancePackage {
  id: string
  amount: number  // TRY amount
  bonus: number   // Bonus percentage
  totalCredits: number  // amount + bonus amount
  productId?: string  // Polar product ID (set after creating products)
  priceId?: string    // Polar price ID
}

// Balance packages with bonus rates as defined in PRD
export const BALANCE_PACKAGES: BalancePackage[] = [
  {
    id: 'balance_100',
    amount: 100,
    bonus: 5,
    totalCredits: 105,  // 100 + 5%
  },
  {
    id: 'balance_250',
    amount: 250,
    bonus: 10,
    totalCredits: 275,  // 250 + 10%
  },
  {
    id: 'balance_500',
    amount: 500,
    bonus: 15,
    totalCredits: 575,  // 500 + 15%
  },
  {
    id: 'balance_1000',
    amount: 1000,
    bonus: 20,
    totalCredits: 1200,  // 1000 + 20%
  },
]

export interface CheckoutSession {
  id: string
  url: string
  status: 'open' | 'confirmed' | 'completed' | 'expired'
  amount: number
  currency: string
}

export interface PolarWebhookEvent {
  type: string
  data: {
    id: string
    checkout_id?: string
    customer_id?: string
    metadata?: Record<string, string>
    amount?: number
    currency?: string
  }
}

export interface PaymentTransaction {
  id: string
  userId: string
  amount: number
  bonusAmount: number
  totalCredits: number
  checkoutId: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
  completedAt?: string
}

export function calculateBonus(amount: number): { bonus: number; total: number } {
  if (amount >= 1000) {
    return { bonus: 20, total: amount * 1.2 }
  } else if (amount >= 500) {
    return { bonus: 15, total: amount * 1.15 }
  } else if (amount >= 250) {
    return { bonus: 10, total: amount * 1.1 }
  } else if (amount >= 100) {
    return { bonus: 5, total: amount * 1.05 }
  }
  return { bonus: 0, total: amount }
}
