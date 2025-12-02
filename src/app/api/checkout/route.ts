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
    let productId: string | undefined

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
      productId = selectedPackage.productId
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
    // Use the package productId if available, otherwise fall back to env POLAR_PRODUCT_ID
    const checkoutProductId = productId || process.env.POLAR_PRODUCT_ID

    if (!checkoutProductId) {
      return NextResponse.json(
        { error: 'Ürün yapılandırması eksik' },
        { status: 500 }
      )
    }

    try {
      const checkout = await polar.checkouts.create({
        products: [checkoutProductId],
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
      const apiBase = process.env.NODE_ENV === 'production'
        ? 'https://api.polar.sh'
        : 'https://sandbox-api.polar.sh'

      const response = await fetch(`${apiBase}/v1/checkouts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [checkoutProductId],
          success_url: `${baseUrl}/topup/success?checkout_id={CHECKOUT_ID}`,
          customer_email: email,
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
