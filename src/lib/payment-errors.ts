// Payment error translation keys
export interface PaymentErrorInfo {
  titleKey: string
  messageKey: string
  icon?: 'error' | 'warning' | 'info'
}

export const PAYMENT_ERROR_KEYS: Record<string, PaymentErrorInfo> = {
  cancelled: {
    titleKey: 'topup.failed.errors.cancelled.title',
    messageKey: 'topup.failed.errors.cancelled.message',
    icon: 'warning',
  },
  declined: {
    titleKey: 'topup.failed.errors.declined.title',
    messageKey: 'topup.failed.errors.declined.message',
    icon: 'error',
  },
  expired: {
    titleKey: 'topup.failed.errors.expired.title',
    messageKey: 'topup.failed.errors.expired.message',
    icon: 'warning',
  },
  insufficient_funds: {
    titleKey: 'topup.failed.errors.insufficientFunds.title',
    messageKey: 'topup.failed.errors.insufficientFunds.message',
    icon: 'error',
  },
  network_error: {
    titleKey: 'topup.failed.errors.networkError.title',
    messageKey: 'topup.failed.errors.networkError.message',
    icon: 'warning',
  },
  verification_failed: {
    titleKey: 'topup.failed.errors.verificationFailed.title',
    messageKey: 'topup.failed.errors.verificationFailed.message',
    icon: 'error',
  },
  processing_error: {
    titleKey: 'topup.failed.errors.processingError.title',
    messageKey: 'topup.failed.errors.processingError.message',
    icon: 'error',
  },
  card_error: {
    titleKey: 'topup.failed.errors.cardError.title',
    messageKey: 'topup.failed.errors.cardError.message',
    icon: 'error',
  },
  authentication_failed: {
    titleKey: 'topup.failed.errors.authenticationFailed.title',
    messageKey: 'topup.failed.errors.authenticationFailed.message',
    icon: 'error',
  },
  default: {
    titleKey: 'topup.failed.errors.default.title',
    messageKey: 'topup.failed.errors.default.message',
    icon: 'error',
  },
}

// Get error info by reason code
export function getPaymentErrorKeys(reason: string | null): PaymentErrorInfo {
  if (!reason) return PAYMENT_ERROR_KEYS.default
  return PAYMENT_ERROR_KEYS[reason] || PAYMENT_ERROR_KEYS.default
}

// Map Polar/Stripe error codes to our reason codes
export function mapErrorToReason(errorCode: string | null): string {
  if (!errorCode) return 'default'

  const errorMap: Record<string, string> = {
    'card_declined': 'declined',
    'insufficient_funds': 'insufficient_funds',
    'expired_card': 'card_error',
    'incorrect_cvc': 'card_error',
    'processing_error': 'processing_error',
    'authentication_required': 'authentication_failed',
    'checkout_expired': 'expired',
    'checkout_cancelled': 'cancelled',
  }

  return errorMap[errorCode] || 'default'
}
