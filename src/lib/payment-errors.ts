// Payment error messages in Turkish
export interface PaymentErrorInfo {
  title: string
  message: string
  icon?: 'error' | 'warning' | 'info'
}

export const PAYMENT_ERROR_MESSAGES: Record<string, PaymentErrorInfo> = {
  cancelled: {
    title: 'Ödeme İptal Edildi',
    message: 'Ödeme işlemini iptal ettiniz. İstediğiniz zaman tekrar deneyebilirsiniz.',
    icon: 'warning',
  },
  declined: {
    title: 'Kart Reddedildi',
    message: 'Bankanız ödemeyi reddetti. Lütfen kart bilgilerinizi kontrol edin veya başka bir kart deneyin.',
    icon: 'error',
  },
  expired: {
    title: 'Oturum Süresi Doldu',
    message: 'Ödeme oturumunun süresi doldu. Lütfen tekrar deneyin.',
    icon: 'warning',
  },
  insufficient_funds: {
    title: 'Yetersiz Bakiye',
    message: 'Kartınızda yeterli bakiye bulunmuyor. Lütfen başka bir kart deneyin.',
    icon: 'error',
  },
  network_error: {
    title: 'Bağlantı Hatası',
    message: 'Bir bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
    icon: 'warning',
  },
  verification_failed: {
    title: 'Doğrulama Başarısız',
    message: 'Ödemeniz doğrulanamadı. Lütfen tekrar deneyin veya destek ile iletişime geçin.',
    icon: 'error',
  },
  processing_error: {
    title: 'İşlem Hatası',
    message: 'Ödeme işlenirken bir hata oluştu. Bakiyeniz çekilmediyse tekrar deneyin.',
    icon: 'error',
  },
  card_error: {
    title: 'Kart Hatası',
    message: 'Kart bilgilerinizde bir sorun var. Lütfen bilgilerinizi kontrol edin.',
    icon: 'error',
  },
  authentication_failed: {
    title: '3D Secure Doğrulama Başarısız',
    message: '3D Secure doğrulaması başarısız oldu. Lütfen bankanızla iletişime geçin.',
    icon: 'error',
  },
  default: {
    title: 'Ödeme Başarısız',
    message: 'Ödeme işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
    icon: 'error',
  },
}

// Get error info by reason code
export function getPaymentError(reason: string | null): PaymentErrorInfo {
  if (!reason) return PAYMENT_ERROR_MESSAGES.default
  return PAYMENT_ERROR_MESSAGES[reason] || PAYMENT_ERROR_MESSAGES.default
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
