'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, calculateBonus } from '@/lib/utils'
import { useTranslation } from '@/i18n/client'
import {
  ArrowRight,
  Loader2,
  X,
  Wallet,
  Shield,
  Zap,
  Clock,
  Star,
  Check,
  Gift,
  TrendingUp
} from 'lucide-react'

// USD package amounts: $5, $15, $30, $60
const TOPUP_OPTIONS = [
  { amount: 5, popular: false, packageId: 'balance_5', labelKey: 'topup.packages.starter' },
  { amount: 15, popular: true, packageId: 'balance_15', labelKey: 'topup.packages.popular' },
  { amount: 30, popular: false, packageId: 'balance_30', labelKey: 'topup.packages.value' },
  { amount: 60, popular: false, packageId: 'balance_60', labelKey: 'topup.packages.premium' },
]

// Bonus tiers for USD
const BONUS_TIERS = [
  { min: 0, rate: 0, labelKey: 'topup.bonusTiers.none' },
  { min: 5, rate: 5, labelKey: 'topup.bonusTiers.tier1' },
  { min: 15, rate: 10, labelKey: 'topup.bonusTiers.tier2' },
  { min: 30, rate: 15, labelKey: 'topup.bonusTiers.tier3' },
  { min: 60, rate: 20, labelKey: 'topup.bonusTiers.tier4' },
]

export default function TopupPage() {
  const { t, locale } = useTranslation()
  const { user, profile } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(15)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('balance_15')
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Double-click prevention (5 second cooldown)
  const lastCheckoutTimeRef = useRef<number>(0)
  const CHECKOUT_COOLDOWN = 5000

  const effectiveAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0)
  const { bonus, total, rate } = calculateBonus(effectiveAmount)

  // Bonus progress calculation
  const getCurrentTierIndex = () => {
    for (let i = BONUS_TIERS.length - 1; i >= 0; i--) {
      if (effectiveAmount >= BONUS_TIERS[i].min) return i
    }
    return 0
  }

  const handleTopup = async () => {
    const now = Date.now()
    if (now - lastCheckoutTimeRef.current < CHECKOUT_COOLDOWN) {
      setError(t('topup.errors.pleaseWait'))
      return
    }

    if (!effectiveAmount || effectiveAmount < 1) {
      setError(t('topup.errors.minAmount'))
      return
    }

    if (!user) {
      setError(t('topup.errors.pleaseLogin'))
      return
    }

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
        throw new Error(data.error || t('topup.errors.paymentFailed'))
      }

      if (data.checkoutUrl) {
        setShowLoadingOverlay(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(t('topup.errors.noPaymentUrl'))
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : t('errors.generic'))
      setShowLoadingOverlay(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelRedirect = () => {
    setShowLoadingOverlay(false)
    setIsProcessing(false)
    lastCheckoutTimeRef.current = 0
  }

  const currentTierIndex = getCurrentTierIndex()

  return (
    <>
      {/* Full-Screen Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-center dash-animate">
            <Loader2 className="w-12 h-12 animate-spin text-foreground mx-auto mb-6" />
            <h2 className="text-xl font-light text-foreground mb-2">
              {t('topup.redirecting')}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {t('topup.dontClose')}
            </p>
            <button
              onClick={handleCancelRedirect}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <header className="mb-8 dash-animate">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="dash-stat-label">{t('topup.pageLabel')}</p>
              <h1 className="text-2xl sm:text-3xl font-light text-foreground">
                {t('topup.title')}
              </h1>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 mb-6 dash-animate">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Current Balance Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 dash-animate dash-animate-delay-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('topup.currentBalance')}</p>
              <p className="text-4xl sm:text-5xl font-light text-foreground tracking-tight">
                {formatCurrency(profile?.balance || 0, locale)}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{t('topup.active')}</span>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="mb-8 dash-animate dash-animate-delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">{t('topup.selectPackage')}</h2>
            <span className="text-xs text-muted-foreground">{t('topup.selectPackageSubtitle')}</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TOPUP_OPTIONS.map((option, index) => {
              const { rate: bonusRate, bonus: bonusAmount, total: packageTotal } = calculateBonus(option.amount)
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
                    relative bg-card border-2 rounded-2xl p-5 text-left transition-all duration-300
                    hover:shadow-lg hover:-translate-y-1
                    ${isSelected
                      ? 'border-foreground shadow-lg -translate-y-1'
                      : 'border-border hover:border-foreground/20'
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Popular Badge */}
                  {option.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-3 py-1 bg-foreground text-background rounded-full text-[10px] uppercase tracking-wider font-medium">
                        <Star className="w-3 h-3" />
                        {t(option.labelKey)}
                      </div>
                    </div>
                  )}

                  {/* Selected Check */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-light text-foreground">
                      ${option.amount}
                    </span>
                  </div>

                  {/* Bonus Info */}
                  {bonusRate > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        +${bonusAmount.toFixed(2)} {t('topup.bonus')}
                      </span>
                      <span className="text-xs text-muted-foreground">({bonusRate}%)</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-0.5">{t('topup.totalBalance')}</p>
                    <p className="text-lg font-medium text-foreground">
                      {formatCurrency(packageTotal, locale)}
                    </p>
                  </div>

                  {/* Package Label */}
                  {!option.popular && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                      {t(option.labelKey)}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Amount Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 dash-animate dash-animate-delay-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">{t('topup.customAmount')}</h3>
              <p className="text-xs text-muted-foreground">{t('topup.customAmountDesc')}</p>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-medium">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
                setSelectedPackageId(null)
                setError(null)
              }}
              placeholder={t('topup.enterAmount')}
              min={1}
              className="w-full h-14 pl-10 pr-24 bg-muted/30 border border-border rounded-xl text-lg font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {t('topup.minAmount')}
            </span>
          </div>
        </div>

        {/* Bonus Progress Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 dash-animate dash-animate-delay-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">{t('topup.bonusLevel')}</h3>
            {rate > 0 && (
              <span className="text-sm font-medium text-green-600">+{rate}% {t('topup.bonusActive')}</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentTierIndex / (BONUS_TIERS.length - 1)) * 100}%` }}
              />
            </div>

            {/* Tier Markers */}
            <div className="absolute inset-x-0 top-0 flex justify-between">
              {BONUS_TIERS.slice(1).map((tier, index) => (
                <div
                  key={tier.min}
                  className="relative"
                  style={{ left: `${((index + 1) / (BONUS_TIERS.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      effectiveAmount >= tier.min
                        ? 'bg-green-500 border-green-500'
                        : 'bg-background border-muted-foreground/30'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tier Labels */}
          <div className="grid grid-cols-4 gap-2">
            {BONUS_TIERS.slice(1).map((tier) => (
              <div
                key={tier.min}
                className={`text-center p-2 rounded-lg transition-colors ${
                  effectiveAmount >= tier.min
                    ? 'bg-green-500/10'
                    : 'bg-muted/30'
                }`}
              >
                <p className={`text-xs font-medium ${
                  effectiveAmount >= tier.min ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  ${tier.min}+
                </p>
                <p className={`text-[10px] ${
                  effectiveAmount >= tier.min ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  +{tier.rate}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-8 dash-animate dash-animate-delay-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs">{t('topup.trustBadges.securePayment')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs">{t('topup.trustBadges.instantDeposit')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{t('topup.trustBadges.support247')}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {effectiveAmount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-56 bg-card/95 backdrop-blur-md border-t border-border z-30">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Summary */}
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('topup.summary.deposit')}</p>
                    <p className="text-lg font-medium text-foreground">
                      {formatCurrency(effectiveAmount, locale)}
                    </p>
                  </div>
                  {bonus > 0 && (
                    <>
                      <div className="text-muted-foreground">+</div>
                      <div>
                        <p className="text-xs text-green-600">{t('topup.summary.bonus')}</p>
                        <p className="text-lg font-medium text-green-600">
                          {formatCurrency(bonus, locale)}
                        </p>
                      </div>
                      <div className="text-muted-foreground">=</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('topup.summary.total')}</p>
                        <p className="text-lg font-medium text-foreground">
                          {formatCurrency(total, locale)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleTopup}
                disabled={!effectiveAmount || effectiveAmount < 1 || isProcessing}
                className="flex items-center justify-center gap-2 h-12 px-6 sm:px-8 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">{t('topup.processing')}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>{t('topup.payButton', { amount: formatCurrency(effectiveAmount, locale) })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
