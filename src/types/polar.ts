// Polar payment types for VerifyNumber web platform
// Currency: USD (United States Dollar)

export interface BalancePackage {
  id: string
  amount: number  // USD amount
  bonus: number   // Bonus percentage
  totalCredits: number  // amount + bonus amount
  productId?: string  // Polar product ID (set after creating products)
  priceId?: string    // Polar price ID
}

// Polar Production Product IDs
export const POLAR_PRODUCT_IDS = {
  balance_5: '1c0d284e-1d45-4a5b-8184-0ab3e63fd150',   // $5 package
  balance_15: '63db8e06-96ec-4857-bbda-92b6ade92e98',  // $15 package
  balance_30: '877baa74-31fe-49d2-aac5-b74bb151b3ab',  // $30 package
  balance_60: 'd6079fea-c6d8-4ddc-9595-0b75d35daf1f',  // $60 package
} as const

// Polar Production Price IDs
export const POLAR_PRICE_IDS = {
  balance_5: 'a03348c9-ec7f-4901-9bfb-e5bd356ca14f',   // $5 price
  balance_15: '2a42ee59-fcce-49aa-8c82-c929165d2120',  // $15 price
  balance_30: 'acf4ee50-6e5c-4467-895a-22414e786472',  // $30 price
  balance_60: 'f498fef2-1563-4d72-a581-ea83c0546288',  // $60 price
} as const

// Balance packages with bonus rates (USD)
// $5 = 5% bonus, $15 = 10% bonus, $30 = 15% bonus, $60 = 20% bonus
export const BALANCE_PACKAGES: BalancePackage[] = [
  {
    id: 'balance_5',
    amount: 5,
    bonus: 5,
    totalCredits: 5.25,  // $5 + 5% = $5.25
    productId: POLAR_PRODUCT_IDS.balance_5,
    priceId: POLAR_PRICE_IDS.balance_5,
  },
  {
    id: 'balance_15',
    amount: 15,
    bonus: 10,
    totalCredits: 16.50,  // $15 + 10% = $16.50
    productId: POLAR_PRODUCT_IDS.balance_15,
    priceId: POLAR_PRICE_IDS.balance_15,
  },
  {
    id: 'balance_30',
    amount: 30,
    bonus: 15,
    totalCredits: 34.50,  // $30 + 15% = $34.50
    productId: POLAR_PRODUCT_IDS.balance_30,
    priceId: POLAR_PRICE_IDS.balance_30,
  },
  {
    id: 'balance_60',
    amount: 60,
    bonus: 20,
    totalCredits: 72.00,  // $60 + 20% = $72.00
    productId: POLAR_PRODUCT_IDS.balance_60,
    priceId: POLAR_PRICE_IDS.balance_60,
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

// Calculate bonus based on USD amount
export function calculateBonus(amount: number): { bonus: number; total: number } {
  if (amount >= 60) {
    return { bonus: 20, total: amount * 1.2 }
  } else if (amount >= 30) {
    return { bonus: 15, total: amount * 1.15 }
  } else if (amount >= 15) {
    return { bonus: 10, total: amount * 1.1 }
  } else if (amount >= 5) {
    return { bonus: 5, total: amount * 1.05 }
  }
  return { bonus: 0, total: amount }
}
