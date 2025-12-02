'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, RefreshCw, Home, Mail } from 'lucide-react'
import { getPaymentErrorKeys } from '@/lib/payment-errors'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/i18n/client'

export default function TopupFailedPage() {
  const { t, locale } = useTranslation()
  const searchParams = useSearchParams()

  const reason = searchParams.get('reason')
  const checkoutId = searchParams.get('checkout_id')
  const amount = searchParams.get('amount')

  const errorKeys = getPaymentErrorKeys(reason)

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      {/* Animated X Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6 dash-animate">
        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50" />
        <div className="relative w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-light text-foreground mb-2 dash-animate dash-animate-delay-1">
        {t(errorKeys.titleKey)}
      </h1>
      <p className="text-muted-foreground mb-8 dash-animate dash-animate-delay-2">
        {t(errorKeys.messageKey)}
      </p>

      {/* Reference Info */}
      {(checkoutId || amount) && (
        <div className="mb-8 p-4 bg-muted/30 border border-border text-left dash-animate dash-animate-delay-3">
          {checkoutId && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">{t('topup.failed.referenceCode')}</p>
              <p className="text-sm font-mono text-foreground break-all">{checkoutId}</p>
            </div>
          )}
          {amount && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('topup.failed.transactionAmount')}</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(parseFloat(amount), locale)}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 dash-animate dash-animate-delay-4">
        <Link
          href={amount ? `/${locale}/topup?amount=${amount}` : `/${locale}/topup`}
          className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          {t('topup.failed.tryAgain')}
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 font-medium hover:bg-muted/30 transition-colors"
        >
          <Home className="w-4 h-4" />
          {t('topup.failed.home')}
        </Link>
      </div>

      {/* Support Info */}
      <div className="mt-10 pt-6 border-t border-border dash-animate dash-animate-delay-5">
        <p className="text-sm text-muted-foreground mb-2">
          {t('topup.failed.needHelp')}
        </p>
        <a
          href="mailto:support@smaryo.app"
          className="inline-flex items-center gap-2 text-sm text-foreground hover:underline"
        >
          <Mail className="w-4 h-4" />
          support@smaryo.app
        </a>
      </div>

      {/* Additional Help Text */}
      <p className="mt-6 text-xs text-muted-foreground dash-animate dash-animate-delay-6">
        {t('topup.failed.cardSafe')}
      </p>
    </div>
  )
}
