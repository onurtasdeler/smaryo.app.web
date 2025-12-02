'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from '@/i18n/client'
import { locales, removeLocaleFromPathname } from '@/i18n/config'
import { Globe } from 'lucide-react'

const languageNames: Record<string, string> = {
  en: 'EN',
  tr: 'TR',
}

const languageFullNames: Record<string, string> = {
  en: 'English',
  tr: 'Turkce',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    const newPath = `/${newLocale}${pathWithoutLocale}`

    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`

    router.push(newPath)
  }

  // Find other locales
  const otherLocales = locales.filter((l) => l !== locale)

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-muted/50"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{languageNames[locale]}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 py-1 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[120px] z-50">
        {/* Current locale */}
        <div className="px-3 py-2 text-sm font-medium text-foreground bg-muted/30 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {languageFullNames[locale]}
        </div>

        {/* Other locales */}
        {otherLocales.map((otherLocale) => (
          <button
            key={otherLocale}
            onClick={() => handleLanguageChange(otherLocale)}
            className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
          >
            {languageFullNames[otherLocale]}
          </button>
        ))}
      </div>
    </div>
  )
}

// Compact version for mobile
export function LanguageSwitcherCompact() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = () => {
    // Toggle between locales
    const newLocale = locale === 'en' ? 'tr' : 'en'
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    const newPath = `/${newLocale}${pathWithoutLocale}`

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`

    router.push(newPath)
  }

  return (
    <button
      onClick={handleLanguageChange}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50"
      aria-label="Change language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{languageNames[locale]}</span>
    </button>
  )
}
