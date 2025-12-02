import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, isValidLocale } from './i18n/config'

// Paths that should not be localized
const PUBLIC_FILE = /\.(.*)$/
const PUBLIC_PATHS = ['/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public files and API routes
  if (
    PUBLIC_FILE.test(pathname) ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const pathnameLocale = pathname.split('/')[1]
  if (isValidLocale(pathnameLocale)) {
    // Valid locale in URL, proceed normally
    return NextResponse.next()
  }

  // Determine the best locale for the user
  let locale = defaultLocale

  // Check for locale cookie first (user preference)
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && isValidLocale(localeCookie)) {
    locale = localeCookie
  } else {
    // Try to detect from Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language')
    if (acceptLanguage) {
      // Parse Accept-Language header
      const preferredLocales = acceptLanguage
        .split(',')
        .map((lang) => {
          const [code, priority = 'q=1'] = lang.trim().split(';')
          const [langCode] = code.split('-') // Get just the language part (e.g., 'en' from 'en-US')
          const q = parseFloat(priority.split('=')[1] || '1')
          return { locale: langCode.toLowerCase(), q }
        })
        .sort((a, b) => b.q - a.q)

      // Find the first matching locale
      for (const { locale: preferredLocale } of preferredLocales) {
        if (isValidLocale(preferredLocale)) {
          locale = preferredLocale
          break
        }
      }
    }
  }

  // Redirect to the localized path
  const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  newUrl.search = request.nextUrl.search

  const response = NextResponse.redirect(newUrl)

  // Set the locale cookie for subsequent requests
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })

  return response
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
