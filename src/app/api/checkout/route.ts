import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'
import { BALANCE_PACKAGES, calculateBonus } from '@/types/polar'

// Initialize Polar client
function getPolarClient(): Polar | null {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  if (!accessToken) return null

  return new Polar({
    accessToken,
    server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, userId, email, customAmount } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gerekli' },
        { status: 400 }
      )
    }

    let amount: number
    let bonusPercent: number
    let totalCredits: number

    // Check if using predefined package or custom amount
    if (packageId) {
      const selectedPackage = BALANCE_PACKAGES.find(p => p.id === packageId)
      if (!selectedPackage) {
        return NextResponse.json(
          { error: 'Geçersiz paket seçimi' },
          { status: 400 }
        )
      }
      amount = selectedPackage.amount
      bonusPercent = selectedPackage.bonus
      totalCredits = selectedPackage.totalCredits
    } else if (customAmount && typeof customAmount === 'number' && customAmount >= 10) {
      // Custom amount with dynamic bonus calculation
      amount = customAmount
      const bonusInfo = calculateBonus(customAmount)
      bonusPercent = bonusInfo.bonus
      totalCredits = Math.floor(bonusInfo.total)
    } else {
      return NextResponse.json(
        { error: 'Paket ID veya geçerli tutar (min 10 TRY) gerekli' },
        { status: 400 }
      )
    }

    const bonusAmount = totalCredits - amount
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    // Check if Polar is configured
    const polar = getPolarClient()

    if (!polar) {
      // Development mode - return mock response
      console.log('Polar API key not configured, using development mode')
      return NextResponse.json({
        checkoutUrl: `${baseUrl}/topup/success?amount=${amount}&bonus=${bonusAmount}&total=${totalCredits}&userId=${userId}&dev=true`,
        checkoutId: `dev_${Date.now()}`,
        amount,
        bonusPercent,
        totalCredits,
        isDev: true,
      })
    }

    // Production: Create actual Polar checkout using SDK
    try {
      const checkout = await polar.checkouts.create({
        products: [process.env.POLAR_PRODUCT_ID!],
        successUrl: `${baseUrl}/topup/success?checkout_id={CHECKOUT_ID}`,
        customerEmail: email,
        metadata: {
          userId,
          amount: amount.toString(),
          bonusPercent: bonusPercent.toString(),
          bonusAmount: bonusAmount.toString(),
          totalCredits: totalCredits.toString(),
          packageId: packageId || 'custom',
        },
      })

      return NextResponse.json({
        checkoutUrl: checkout.url,
        checkoutId: checkout.id,
        amount,
        bonusPercent,
        totalCredits,
      })
    } catch (polarError) {
      console.error('Polar SDK error:', polarError)

      // Fallback to direct API call if SDK fails
      const response = await fetch('https://sandbox-api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_price_id: process.env.POLAR_PRICE_ID,
          success_url: `${baseUrl}/topup/success?checkout_id={CHECKOUT_ID}`,
          customer_email: email,
          payment_processor: 'stripe',
          metadata: {
            userId,
            amount: amount.toString(),
            bonusPercent: bonusPercent.toString(),
            bonusAmount: bonusAmount.toString(),
            totalCredits: totalCredits.toString(),
            packageId: packageId || 'custom',
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Polar API error:', errorData)
        throw new Error('Ödeme oturumu oluşturulamadı')
      }

      const checkoutSession = await response.json()

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        checkoutId: checkoutSession.id,
        amount,
        bonusPercent,
        totalCredits,
      })
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Ödeme oturumu oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
