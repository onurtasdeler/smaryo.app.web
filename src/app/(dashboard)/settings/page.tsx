'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, signOut, resetPassword } = useAuth()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    setIsResettingPassword(true)
    try {
      await resetPassword(user.email)
      setPasswordResetSent(true)
    } catch (error) {
      console.error('Password reset error:', error)
      alert('Şifre sıfırlama e-postası gönderilemedi')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Ayarlar
      </h1>
      <p className="text-gray-600 mb-8">
        Hesap ayarlarınızı yönetin.
      </p>

      {/* Profile Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Profil Bilgileri
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <span className="text-2xl text-gray-500">
                {profile?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.displayName || 'Kullanıcı'}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">E-posta</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Kayıt Tarihi</span>
            <span className="font-medium">
              {profile?.createdAt ? formatDate(profile.createdAt) : '-'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Giriş Yöntemi</span>
            <span className="font-medium capitalize">
              {profile?.provider === 'google.com' ? 'Google' : 'E-posta'}
            </span>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Güvenlik
        </h2>

        {profile?.provider !== 'google.com' && (
          <div className="mb-4">
            {passwordResetSent ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Şifre sıfırlama e-postası gönderildi. Lütfen e-postanızı kontrol edin.
              </div>
            ) : (
              <button
                onClick={handlePasswordReset}
                disabled={isResettingPassword}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Şifre Değiştir</h3>
                    <p className="text-sm text-gray-600">
                      Hesap şifrenizi e-posta ile sıfırlayın
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-700">Çıkış Yap</h3>
              <p className="text-sm text-red-600">
                Hesabınızdan güvenli çıkış yapın
              </p>
            </div>
            <span className="text-red-400">→</span>
          </div>
        </button>
      </section>

      {/* Support Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Destek
        </h2>

        <div className="space-y-3">
          <a
            href="/privacy"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Gizlilik Politikası</span>
              <span className="text-gray-400">→</span>
            </div>
          </a>
          <a
            href="/terms"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Kullanım Şartları</span>
              <span className="text-gray-400">→</span>
            </div>
          </a>
          <a
            href="mailto:destek@smaryo.app"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">İletişim</span>
              <span className="text-gray-400">→</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  )
}
