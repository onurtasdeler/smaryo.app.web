'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, calculateBonus } from '@/lib/utils'
import { ArrowRight, Loader2, X } from 'lucide-react'
import Link from 'next/link'

const TOPUP_OPTIONS = [
  { amount: 100, popular: false, packageId: 'balance_100' },
  { amount: 250, popular: true, packageId: 'balance_250' },
  { amount: 500, popular: false, packageId: 'balance_500' },
  { amount: 1000, popular: false, packageId: 'balance_1000' },
]

const BONUS_TIERS = [
  { min: 100, rate: 5 },
  { min: 250, rate: 10 },
  { min: 500, rate: 15 },
  { min: 1000, rate: 20 },
]

export default function TopupPage() {
  const { user, profile } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('balance_250')
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Double-click prevention (5 second cooldown)
  const lastCheckoutTimeRef = useRef<number>(0)
  const CHECKOUT_COOLDOWN = 5000 // 5 seconds

  const effectiveAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0)
  const { bonus, total, rate } = calculateBonus(effectiveAmount)

  const handleTopup = async () => {
    // Double-click prevention
    const now = Date.now()
    if (now - lastCheckoutTimeRef.current < CHECKOUT_COOLDOWN) {
      setError('Lütfen birkaç saniye bekleyin')
      return
    }

    if (!effectiveAmount || effectiveAmount < 10) {
      setError('Minimum yükleme tutarı ₺10')
      return
    }

    if (!user) {
      setError('Lütfen giriş yapın')
      return
    }

    // Update last checkout time
    lastCheckoutTimeRef.current = now
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackageId,
          customAmount: selectedPackageId ? undefined : effectiveAmount,
          userId: user.uid,
          email: user.email || profile?.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ödeme başlatılamadı')
      }

      if (data.checkoutUrl) {
        // Show loading overlay before redirect
        setShowLoadingOverlay(true)
        // Small delay to show the overlay
        await new Promise(resolve => setTimeout(resolve, 300))
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('Ödeme URL\'si alınamadı')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Ödeme işlemi başlatılırken bir hata oluştu')
      setShowLoadingOverlay(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelRedirect = () => {
    setShowLoadingOverlay(false)
    setIsProcessing(false)
    // Reset cooldown so user can try again immediately after cancel
    lastCheckoutTimeRef.current = 0
  }

  return (
    <>
      {/* Full-Screen Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-center dash-animate">
            <Loader2 className="w-12 h-12 animate-spin text-foreground mx-auto mb-6" />
            <h2 className="text-xl font-light text-foreground mb-2">
              Ödeme sayfasına yönlendiriliyorsunuz...
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Lütfen sayfayı kapatmayın.
            </p>
            <button
              onClick={handleCancelRedirect}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Vazgeç
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
      <header className="mb-6 dash-animate">
        <p className="dash-stat-label mb-1">Bakiye</p>
        <h1 className="text-2xl sm:text-3xl font-light text-foreground">
          Bakiye Yükle
        </h1>
      </header>

      {/* Error Display */}
      {error && (
        <div className="auth-error mb-6 dash-animate">
          <span>{error}</span>
        </div>
      )}

      {/* Current Balance */}
      <div className="border-b border-border pb-6 mb-6 dash-animate dash-animate-delay-1">
        <p className="dash-stat-label mb-1">Mevcut Bakiye</p>
        <p className="text-4xl font-light text-foreground">
          {formatCurrency(profile?.balance || 0)}
        </p>
      </div>

      {/* Amount Selection */}
      <div className="dash-animate dash-animate-delay-2">
        <p className="dash-stat-label mb-4">Tutar Seçin</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {TOPUP_OPTIONS.map((option) => {
            const { rate: bonusRate } = calculateBonus(option.amount)
            const isSelected = selectedAmount === option.amount

            return (
              <button
                key={option.amount}
                onClick={() => {
                  setSelectedAmount(option.amount)
                  setSelectedPackageId(option.packageId)
                  setCustomAmount('')
                  setError(null)
                }}
                className={`
                  relative bg-card p-4 text-center transition-all hover:bg-muted/30
                  ${isSelected ? 'ring-2 ring-inset ring-foreground bg-muted/50' : ''}
                `}
              >
                {option.popular && (
                  <span className="absolute -top-0 right-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    popüler
                  </span>
                )}
                <div className="text-xl font-medium text-foreground">
                  ₺{option.amount}
                </div>
                {bonusRate > 0 && (
                  <div className="text-xs text-green-500 mt-1">
                    +%{bonusRate} bonus
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Custom Amount */}
        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-2">
            veya özel tutar girin
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₺</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
                setSelectedPackageId(null)
                setError(null)
              }}
              placeholder="Tutar girin (min ₺10)"
              min={10}
              className="w-full h-12 pl-10 pr-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Bonus Badges */}
        <div className="mt-4 dash-animate dash-animate-delay-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Bonus:</span>
            {BONUS_TIERS.map((tier) => (
              <span
                key={tier.min}
                className={`text-xs px-2 py-1 transition-colors ${
                  effectiveAmount >= tier.min
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                ₺{tier.min}+ → +%{tier.rate}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {effectiveAmount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-56 bg-card border-t border-border p-4 z-30 dash-animate">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {/* Summary */}
            <div>
              <p className="text-xs text-muted-foreground">Toplam Bakiye</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-medium text-foreground">
                  {formatCurrency(total)}
                </p>
                {bonus > 0 && (
                  <span className="text-sm text-green-500">
                    +{formatCurrency(bonus)} bonus
                  </span>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleTopup}
              disabled={!effectiveAmount || effectiveAmount < 10 || isProcessing}
              className="dash-btn justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {formatCurrency(effectiveAmount)} Yükle
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Spacer for Fixed Bar */}
      {effectiveAmount > 0 && <div className="h-24" />}

      {/* Payment Info */}
      <div className="mt-8 text-center dash-animate dash-animate-delay-4">
        <p className="text-xs text-muted-foreground mb-3">
          Güvenli ödeme altyapısı
        </p>
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <span className="text-xl opacity-60">💳</span>
          <span className="text-xl opacity-60">🏦</span>
          <span className="text-xl opacity-60">🔒</span>
        </div>
      </div>
    </div>
    </>
  )
}
