'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/i18n/client'
import {
  Loader2,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Smartphone,
  LogOut,
  AlertTriangle,
} from 'lucide-react'

type SettingsSection = 'profile' | 'security' | 'notifications' | 'appearance' | 'support'

export default function SettingsPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const { user, profile, signOut, updateUserEmail, updateUserPassword } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

  // Email change state
  const [emailFormOpen, setEmailFormOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Password change state
  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Notification preferences (local state - can be connected to backend later)
  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    balanceAlerts: true,
    promotions: false,
    securityAlerts: true,
  })

  // Theme state (local state - can be connected to backend later)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')

  // Check directly from Firebase Auth, not database profile
  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com') ?? false

  const SECTIONS = [
    { id: 'profile' as const, label: t('settings.sections.profile'), icon: User, description: t('settings.sections.profileDesc') },
    { id: 'security' as const, label: t('settings.sections.security'), icon: Shield, description: t('settings.sections.securityDesc') },
    { id: 'notifications' as const, label: t('settings.sections.notifications'), icon: Bell, description: t('settings.sections.notificationsDesc') },
    { id: 'appearance' as const, label: t('settings.sections.appearance'), icon: Palette, description: t('settings.sections.appearanceDesc') },
    { id: 'support' as const, label: t('settings.sections.support'), icon: HelpCircle, description: t('settings.sections.supportDesc') },
  ]

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        return t('settings.errors.wrongPassword')
      }
      if (message.includes('requires-recent-login')) {
        return t('settings.errors.recentLogin')
      }
      if (message.includes('email-already-in-use')) {
        return t('settings.errors.emailInUse')
      }
      if (message.includes('weak-password')) {
        return t('settings.errors.weakPassword')
      }
      if (message.includes('invalid-email')) {
        return t('settings.errors.invalidEmail')
      }
      return error.message
    }
    return t('settings.errors.generic')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push(`/${locale}`)
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setEmailLoading(true)

    try {
      await updateUserEmail(newEmail, emailCurrentPassword)
      setEmailSuccess(true)
      setNewEmail('')
      setEmailCurrentPassword('')
      setTimeout(() => {
        setEmailFormOpen(false)
        setEmailSuccess(false)
      }, 2000)
    } catch (err) {
      setEmailError(getErrorMessage(err))
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError(t('settings.errors.minPassword'))
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.errors.passwordMismatch'))
      return
    }

    setPasswordLoading(true)

    try {
      await updateUserPassword(newPassword, currentPassword)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordFormOpen(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (err) {
      setPasswordError(getErrorMessage(err))
    } finally {
      setPasswordLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' }
    if (newPassword.length < 6) return { level: 1, text: t('settings.passwordStrength.weak'), color: 'bg-red-500' }
    if (newPassword.length < 8) return { level: 2, text: t('settings.passwordStrength.medium'), color: 'bg-yellow-500' }
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      return { level: 3, text: t('settings.passwordStrength.strong'), color: 'bg-green-500' }
    }
    return { level: 2, text: t('settings.passwordStrength.medium'), color: 'bg-yellow-500' }
  }

  const passwordStrength = getPasswordStrength()

  // Format date based on locale
  const formatDateLocale = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Toggle component
  const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
        checked ? 'bg-black' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6 dash-animate">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="relative">
                <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-2xl font-semibold text-gray-600">
                      {profile?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {isGoogleUser && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile?.displayName || t('settings.profile.user')}
                </h3>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                    {isGoogleUser ? (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {t('settings.profile.googleLogin')}
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        {t('settings.profile.emailLogin')}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.profile.accountInfo')}</h4>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('settings.profile.emailAddress')}</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  {!isGoogleUser && (
                    <button
                      onClick={() => {
                        setActiveSection('security')
                        setEmailFormOpen(true)
                      }}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {t('settings.profile.change')}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('settings.profile.username')}</p>
                      <p className="font-medium text-gray-900">{profile?.displayName || t('settings.profile.notSet')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('settings.profile.registrationDate')}</p>
                      <p className="font-medium text-gray-900">
                        {profile?.createdAt ? formatDateLocale(profile.createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('settings.profile.lastLogin')}</p>
                      <p className="font-medium text-gray-900">
                        {profile?.lastLoginAt ? formatDateLocale(profile.lastLoginAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6 dash-animate">
            {isGoogleUser ? (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">{t('settings.security.googleAccount')}</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('settings.security.googleAccountDesc')}
                    </p>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                      {t('settings.security.googleSecuritySettings')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Email Change Card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {!emailFormOpen ? (
                    <button
                      onClick={() => setEmailFormOpen(true)}
                      className="w-full p-6 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{t('settings.security.changeEmail')}</h4>
                            <p className="text-sm text-gray-500 mt-0.5">{t('settings.security.changeEmailDesc')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{t('settings.security.changeEmail')}</h4>
                          <p className="text-sm text-gray-500">{t('settings.security.currentEmail')}: {user?.email}</p>
                        </div>
                      </div>

                      {emailSuccess ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{t('settings.security.verificationSent')}</span>
                          </div>
                          <p className="text-sm mt-2 text-green-600">
                            {t('settings.security.verificationSentDesc')}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleEmailChange} className="space-y-4">
                          {emailError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                              {emailError}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('settings.security.newEmailAddress')}
                            </label>
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              required
                              placeholder="new@email.com"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('settings.security.currentPassword')}
                            </label>
                            <input
                              type="password"
                              value={emailCurrentPassword}
                              onChange={(e) => setEmailCurrentPassword(e.target.value)}
                              required
                              placeholder="••••••••"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEmailFormOpen(false)
                                setEmailError(null)
                                setNewEmail('')
                                setEmailCurrentPassword('')
                              }}
                              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                              {t('common.cancel')}
                            </button>
                            <button
                              type="submit"
                              disabled={emailLoading}
                              className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {emailLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                t('settings.security.update')
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Change Card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {!passwordFormOpen ? (
                    <button
                      onClick={() => setPasswordFormOpen(true)}
                      className="w-full p-6 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{t('settings.security.changePassword')}</h4>
                            <p className="text-sm text-gray-500 mt-0.5">{t('settings.security.changePasswordDesc')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{t('settings.security.changePassword')}</h4>
                          <p className="text-sm text-gray-500">{t('settings.security.chooseStrongPassword')}</p>
                        </div>
                      </div>

                      {passwordSuccess ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                          <Check className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{t('settings.security.passwordUpdated')}</span>
                        </div>
                      ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          {passwordError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                              {passwordError}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('settings.security.currentPassword')}
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('settings.security.newPassword')}
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {newPassword && (
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex gap-1 flex-1">
                                  {[1, 2, 3].map((level) => (
                                    <div
                                      key={level}
                                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                        passwordStrength.level >= level
                                          ? passwordStrength.color
                                          : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-xs font-medium ${
                                  passwordStrength.level === 1 ? 'text-red-500' :
                                  passwordStrength.level === 2 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {passwordStrength.text}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('settings.security.confirmPassword')}
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              placeholder="••••••••"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {t('settings.errors.passwordMismatch')}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordFormOpen(false)
                                setPasswordError(null)
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                              }}
                              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                              {t('common.cancel')}
                            </button>
                            <button
                              type="submit"
                              disabled={passwordLoading || newPassword !== confirmPassword}
                              className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {passwordLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                t('settings.security.update')
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Sign Out */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={handleSignOut}
                className="w-full p-6 text-left hover:bg-red-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700">{t('settings.security.signOut')}</h4>
                      <p className="text-sm text-red-600/70 mt-0.5">{t('settings.security.signOutDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400" />
                </div>
              </button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6 dash-animate">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.notifications.emailNotifications')}</h4>
                <p className="text-sm text-gray-500 mt-1">{t('settings.notifications.emailNotificationsDesc')}</p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{t('settings.notifications.smsAlerts')}</h5>
                    <p className="text-sm text-gray-500 mt-0.5">{t('settings.notifications.smsAlertsDesc')}</p>
                  </div>
                  <Toggle
                    checked={notifications.smsAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, smsAlerts: !prev.smsAlerts }))}
                  />
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{t('settings.notifications.balanceAlerts')}</h5>
                    <p className="text-sm text-gray-500 mt-0.5">{t('settings.notifications.balanceAlertsDesc')}</p>
                  </div>
                  <Toggle
                    checked={notifications.balanceAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, balanceAlerts: !prev.balanceAlerts }))}
                  />
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{t('settings.notifications.promotions')}</h5>
                    <p className="text-sm text-gray-500 mt-0.5">{t('settings.notifications.promotionsDesc')}</p>
                  </div>
                  <Toggle
                    checked={notifications.promotions}
                    onChange={() => setNotifications(prev => ({ ...prev, promotions: !prev.promotions }))}
                  />
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{t('settings.notifications.securityAlerts')}</h5>
                    <p className="text-sm text-gray-500 mt-0.5">{t('settings.notifications.securityAlertsDesc')}</p>
                  </div>
                  <Toggle
                    checked={notifications.securityAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, securityAlerts: !prev.securityAlerts }))}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 px-1">
              {t('settings.notifications.localStorageNote')}
            </p>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6 dash-animate">
            {/* Theme Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.appearance.theme')}</h4>
                <p className="text-sm text-gray-500 mt-1">{t('settings.appearance.themeDesc')}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light' as const, label: t('settings.appearance.light'), icon: '☀️' },
                    { id: 'dark' as const, label: t('settings.appearance.dark'), icon: '🌙' },
                    { id: 'system' as const, label: t('settings.appearance.system'), icon: '💻' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === option.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className={`text-sm font-medium ${
                        theme === option.id ? 'text-black' : 'text-gray-600'
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {t('settings.appearance.darkModeComingSoon')}
                </p>
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.appearance.language')}</h4>
                <p className="text-sm text-gray-500 mt-1">{t('settings.appearance.languageDesc')}</p>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/en/settings`}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    locale === 'en' ? 'bg-gray-50 border-gray-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">English</p>
                    <p className="text-sm text-gray-500">{locale === 'en' ? t('settings.appearance.currentLanguage') : 'Switch to English'}</p>
                  </div>
                  {locale === 'en' && <Check className="w-5 h-5 text-green-600" />}
                </Link>
                <Link
                  href={`/tr/settings`}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    locale === 'tr' ? 'bg-gray-50 border-gray-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🇹🇷</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Türkçe</p>
                    <p className="text-sm text-gray-500">{locale === 'tr' ? t('settings.appearance.currentLanguage') : 'Türkçeye geç'}</p>
                  </div>
                  {locale === 'tr' && <Check className="w-5 h-5 text-green-600" />}
                </Link>
              </div>
            </div>
          </div>
        )

      case 'support':
        return (
          <div className="space-y-6 dash-animate">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.support.helpAndSupport')}</h4>
              </div>
              <div className="divide-y divide-gray-100">
                <a
                  href="mailto:support@smaryo.app"
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t('settings.support.contactEmail')}</p>
                      <p className="text-sm text-gray-500">support@smaryo.app</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>

                <Link
                  href={`/${locale}/faq`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t('settings.support.faq')}</p>
                      <p className="text-sm text-gray-500">{t('settings.support.faqDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.support.legal')}</h4>
              </div>
              <div className="divide-y divide-gray-100">
                <Link
                  href={`/${locale}/privacy`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{t('settings.support.privacyPolicy')}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{t('settings.support.termsOfService')}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{t('settings.support.appInfo')}</h4>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('settings.support.version')}</span>
                  <span className="font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('settings.support.platform')}</span>
                  <span className="font-medium text-gray-900">Web</span>
                </div>
              </div>
            </div>

            {/* Mobile Apps */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">{t('settings.support.mobileApps')}</h4>
              <p className="text-sm text-gray-600 mb-4">{t('settings.support.mobileAppsDesc')}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/us/app/virtual-number-sms-smaryo/id6755517560"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.smaryo.number"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-8 dash-animate">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 flex-shrink-0 dash-animate dash-animate-delay-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-6">
            {/* Mobile: Horizontal scroll */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4 text-left transition-all ${
                      isActive
                        ? 'bg-gray-100 text-black border-b-2 lg:border-b-0 lg:border-l-2 border-black'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-b-2 lg:border-b-0 lg:border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                    <div className="hidden lg:block">
                      <span className={`block font-medium ${isActive ? 'text-black' : 'text-gray-700'}`}>
                        {section.label}
                      </span>
                      <span className="text-xs text-gray-500">{section.description}</span>
                    </div>
                    <span className="lg:hidden font-medium text-sm whitespace-nowrap">
                      {section.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0 dash-animate dash-animate-delay-2">
          <div className="max-w-2xl">
            {/* Section Title */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {SECTIONS.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            {/* Section Content */}
            {renderSectionContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
