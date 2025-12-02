'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/i18n/client'
import { Loader2, ArrowRight, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { signUp, signInWithGoogle, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (password.length < 6) {
      setLocalError(t('auth.errors.minPassword'))
      return
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.errors.passwordMismatch'))
      return
    }

    if (!acceptedTerms) {
      setLocalError(t('auth.errors.termsRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      await signUp(email, password)
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setLocalError(getErrorMessage(err, t))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLocalError(null)
    setIsSubmitting(true)

    try {
      await signInWithGoogle()
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setLocalError(getErrorMessage(err, t))
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || error

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '' }
    if (password.length < 6) return { level: 1, text: t('auth.passwordStrength.weak') }
    if (password.length < 8) return { level: 2, text: t('auth.passwordStrength.medium') }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: t('auth.passwordStrength.strong') }
    }
    return { level: 2, text: t('auth.passwordStrength.medium') }
  }

  const passwordStrength = getPasswordStrength()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 auth-brand-bg text-white relative">
        <div className="auth-brand-pattern" />
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 auth-animate">
            <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
              <span className="text-lg font-light">S</span>
            </div>
            <span className="text-sm font-light tracking-[0.2em] uppercase">Smaryo</span>
          </Link>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-light leading-tight mb-6 auth-animate auth-animate-delay-1">
              {t('auth.brandPanel.getStartedFree')}
              <br />
              <span className="font-normal">{t('auth.brandPanel.free')}</span>
            </h1>
            <ul className="space-y-4 text-white/70 text-sm auth-animate auth-animate-delay-2">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 border border-white/30 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                {t('auth.brandPanel.instantAccount')}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 border border-white/30 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                {t('auth.brandPanel.countriesOption')}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 border border-white/30 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                {t('auth.brandPanel.supportSecurity')}
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-8 text-xs text-white/40 auth-animate auth-animate-delay-3">
            <span>&copy; 2024 Smaryo</span>
            <Link href={`/${locale}/privacy`} className="hover:text-white/60 transition-colors">
              {t('auth.privacyPolicy')}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white/60 transition-colors">
              {t('auth.termsOfService')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background">
        {/* Mobile Logo */}
        <Link href={`/${locale}`} className="lg:hidden flex items-center gap-3 mb-12 auth-animate">
          <div className="w-9 h-9 bg-foreground text-background flex items-center justify-center">
            <span className="text-base font-light">S</span>
          </div>
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-foreground">
            Smaryo
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          {/* Header */}
          <div className="mb-10 auth-animate auth-animate-delay-1">
            <h2 className="text-2xl font-light text-foreground mb-2">
              {t('auth.createAccount')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('auth.registrationTakesMinute')}
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <div className="auth-error mb-6">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="auth-animate auth-animate-delay-2">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  placeholder={t('auth.emailPlaceholder')}
                />
                <div className="auth-input-line" />
              </div>
            </div>

            <div className="auth-animate auth-animate-delay-3">
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                  placeholder={t('auth.createPassword')}
                />
                <div className="auth-input-line" />
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-0.5 flex-1 transition-colors duration-300 ${
                          passwordStrength.level >= level
                            ? level === 1
                              ? 'bg-red-400'
                              : level === 2
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.text}</span>
                </div>
              )}
            </div>

            <div className="auth-animate auth-animate-delay-4">
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                  placeholder={t('auth.repeatPassword')}
                />
                <div className="auth-input-line" />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">{t('auth.errors.passwordMismatch')}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="auth-animate auth-animate-delay-5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="auth-checkbox mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {t('auth.termsAccept')}{' '}
                  <Link href={`/${locale}/terms`} className="auth-link auth-link-underline">
                    {t('auth.termsOfService')}
                  </Link>
                  {' '}{t('auth.and')}{' '}
                  <Link href={`/${locale}/privacy`} className="auth-link auth-link-underline">
                    {t('auth.privacyPolicy')}
                  </Link>
                </span>
              </label>
            </div>

            <div className="auth-animate auth-animate-delay-5 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !acceptedTerms}
                className="auth-btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t('auth.register')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="auth-divider my-8 auth-animate auth-animate-delay-6">
            <span>{t('common.or')}</span>
          </div>

          {/* Google */}
          <div className="auth-animate auth-animate-delay-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="auth-btn-secondary"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.googleRegister')}
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-10 text-center text-sm text-muted-foreground auth-animate auth-animate-delay-6">
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="auth-link auth-link-underline font-medium text-foreground">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('email-already-in-use')) {
      return t('auth.errors.emailInUse')
    }
    if (message.includes('invalid-email')) {
      return t('auth.errors.invalidEmail')
    }
    if (message.includes('weak-password')) {
      return t('auth.errors.weakPassword')
    }
    if (message.includes('popup-closed-by-user')) {
      return t('auth.errors.popupClosed')
    }
    return error.message
  }
  return t('auth.errors.generic')
}
