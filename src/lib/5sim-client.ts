/**
 * 5sim.net API Client
 * Server-side only - uses API key from environment
 * Currency: USD (prices from 5sim API priceUsd field)
 */

import {
  FIVESIM_BASE_URL,
  FIVESIM_ENDPOINTS,
  type FiveSimCountry,
  type FiveSimCountriesResponse,
  type FiveSimPricingResponse,
  type FiveSimActivation,
  type FiveSimProduct,
} from '@/types/fivesim'
import { Locale } from '@/i18n/config'

// Comprehensive popular services list - ordered by popularity
export const POPULAR_SERVICES = [
  // Tier 1: Most popular
  { id: 'telegram', name: 'Telegram' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'google', name: 'Google' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'discord', name: 'Discord' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'twitter', name: 'X/Twitter' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'tinder', name: 'Tinder' },
  { id: 'uber', name: 'Uber' },
  { id: 'netflix', name: 'Netflix' },
  // Tier 2: Very popular
  { id: 'amazon', name: 'Amazon' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'apple', name: 'Apple' },
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'steam', name: 'Steam' },
  { id: 'ebay', name: 'eBay' },
  { id: 'viber', name: 'Viber' },
  { id: 'signal', name: 'Signal' },
  // Tier 3: Popular
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'slack', name: 'Slack' },
  { id: 'binance', name: 'Binance' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'shopify', name: 'Shopify' },
  { id: 'github', name: 'GitHub' },
  { id: 'dropbox', name: 'Dropbox' },
  { id: 'openai', name: 'OpenAI' },
  // Dating
  { id: 'badoo', name: 'Badoo' },
  { id: 'bumble', name: 'Bumble' },
  { id: 'happn', name: 'Happn' },
  { id: 'okcupid', name: 'OkCupid' },
  { id: 'pof', name: 'POF' },
  { id: 'grindr', name: 'Grindr' },
  // Gaming
  { id: 'blizzard', name: 'Blizzard' },
  { id: 'epicgames', name: 'Epic Games' },
  { id: 'roblox', name: 'Roblox' },
  { id: 'playstation', name: 'PlayStation' },
  { id: 'xbox', name: 'Xbox' },
  { id: 'nintendo', name: 'Nintendo' },
  // Other
  { id: 'bolt', name: 'Bolt' },
  { id: 'lyft', name: 'Lyft' },
  { id: 'grab', name: 'Grab' },
  { id: 'deliveroo', name: 'Deliveroo' },
  { id: 'fiverr', name: 'Fiverr' },
  { id: 'line', name: 'LINE' },
  { id: 'kakaotalk', name: 'KakaoTalk' },
  { id: 'wechat', name: 'WeChat' },
  { id: 'vk', name: 'VK' },
  { id: 'protonmail', name: 'ProtonMail' },
  { id: 'aol', name: 'AOL' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'yahoo', name: 'Yahoo' },
] as const

// 5sim country name to ISO 2-letter code mapping
const COUNTRY_ISO_MAP: Record<string, string> = {
  afghanistan: 'AF', albania: 'AL', algeria: 'DZ', andorra: 'AD', angola: 'AO',
  antiguaandbarbuda: 'AG', argentina: 'AR', armenia: 'AM', australia: 'AU', austria: 'AT',
  azerbaijan: 'AZ', bahamas: 'BS', bahrain: 'BH', bangladesh: 'BD', barbados: 'BB',
  belarus: 'BY', belgium: 'BE', belize: 'BZ', benin: 'BJ', bhutan: 'BT',
  bolivia: 'BO', bosnia: 'BA', botswana: 'BW', brazil: 'BR', brunei: 'BN',
  bulgaria: 'BG', burkinafaso: 'BF', burundi: 'BI', cambodia: 'KH', cameroon: 'CM',
  canada: 'CA', capeverde: 'CV', centralafricanrepublic: 'CF', chad: 'TD', chile: 'CL',
  china: 'CN', colombia: 'CO', comoros: 'KM', congo: 'CG', costarica: 'CR',
  croatia: 'HR', cuba: 'CU', cyprus: 'CY', czech: 'CZ', denmark: 'DK',
  djibouti: 'DJ', dominica: 'DM', dominicanrepublic: 'DO', drcongo: 'CD', ecuador: 'EC',
  egypt: 'EG', elsalvador: 'SV', england: 'GB', equatorialguinea: 'GQ', eritrea: 'ER',
  estonia: 'EE', eswatini: 'SZ', ethiopia: 'ET', fiji: 'FJ', finland: 'FI',
  france: 'FR', gabon: 'GA', gambia: 'GM', georgia: 'GE', germany: 'DE',
  ghana: 'GH', greece: 'GR', grenada: 'GD', guatemala: 'GT', guinea: 'GN',
  guineabissau: 'GW', guyana: 'GY', haiti: 'HT', honduras: 'HN', hongkong: 'HK',
  hungary: 'HU', iceland: 'IS', india: 'IN', indonesia: 'ID', iran: 'IR',
  iraq: 'IQ', ireland: 'IE', israel: 'IL', italy: 'IT', ivorycoast: 'CI',
  jamaica: 'JM', japan: 'JP', jordan: 'JO', kazakhstan: 'KZ', kenya: 'KE',
  kiribati: 'KI', kuwait: 'KW', kyrgyzstan: 'KG', laos: 'LA', latvia: 'LV',
  lebanon: 'LB', lesotho: 'LS', liberia: 'LR', libya: 'LY', liechtenstein: 'LI',
  lithuania: 'LT', luxembourg: 'LU', macao: 'MO', madagascar: 'MG', malawi: 'MW',
  malaysia: 'MY', maldives: 'MV', mali: 'ML', malta: 'MT', mauritania: 'MR',
  mauritius: 'MU', mexico: 'MX', moldova: 'MD', monaco: 'MC', mongolia: 'MN',
  montenegro: 'ME', morocco: 'MA', mozambique: 'MZ', myanmar: 'MM', namibia: 'NA',
  nepal: 'NP', netherlands: 'NL', newzealand: 'NZ', nicaragua: 'NI', niger: 'NE',
  nigeria: 'NG', northkorea: 'KP', northmacedonia: 'MK', norway: 'NO', oman: 'OM',
  pakistan: 'PK', palestine: 'PS', panama: 'PA', papuanewguinea: 'PG', paraguay: 'PY',
  peru: 'PE', philippines: 'PH', poland: 'PL', portugal: 'PT', puertorico: 'PR',
  qatar: 'QA', romania: 'RO', russia: 'RU', rwanda: 'RW', saintkitts: 'KN',
  saintlucia: 'LC', samoa: 'WS', sanmarino: 'SM', saotome: 'ST', saudiarabia: 'SA',
  salvador: 'SV', senegal: 'SN', serbia: 'RS', seychelles: 'SC', sierraleone: 'SL', singapore: 'SG',
  slovakia: 'SK', slovenia: 'SI', solomonislands: 'SB', somalia: 'SO', southafrica: 'ZA',
  southkorea: 'KR', southsudan: 'SS', spain: 'ES', srilanka: 'LK', sudan: 'SD',
  suriname: 'SR', sweden: 'SE', switzerland: 'CH', syria: 'SY', taiwan: 'TW',
  tajikistan: 'TJ', tanzania: 'TZ', thailand: 'TH', togo: 'TG', tonga: 'TO',
  trinidadandtobago: 'TT', tunisia: 'TN', turkey: 'TR', turkmenistan: 'TM', uganda: 'UG',
  uk: 'GB', ukraine: 'UA', uae: 'AE', unitedarabemirates: 'AE', usa: 'US',
  unitedstates: 'US', uruguay: 'UY', uzbekistan: 'UZ', vanuatu: 'VU', venezuela: 'VE',
  vietnam: 'VN', yemen: 'YE', zambia: 'ZM', zimbabwe: 'ZW',
}

// Country display names in English
export const COUNTRY_NAMES_EN: Record<string, string> = {
  // A
  afghanistan: 'Afghanistan', albania: 'Albania', algeria: 'Algeria', andorra: 'Andorra', angola: 'Angola',
  antiguaandbarbuda: 'Antigua and Barbuda', argentina: 'Argentina', armenia: 'Armenia', australia: 'Australia', austria: 'Austria',
  azerbaijan: 'Azerbaijan',
  // B
  bahamas: 'Bahamas', bahrain: 'Bahrain', bangladesh: 'Bangladesh', barbados: 'Barbados', belarus: 'Belarus',
  belgium: 'Belgium', belize: 'Belize', benin: 'Benin', bhutan: 'Bhutan', bolivia: 'Bolivia',
  bosnia: 'Bosnia and Herzegovina', botswana: 'Botswana', brazil: 'Brazil', brunei: 'Brunei', bulgaria: 'Bulgaria',
  burkinafaso: 'Burkina Faso', burundi: 'Burundi',
  // C
  cambodia: 'Cambodia', cameroon: 'Cameroon', canada: 'Canada', capeverde: 'Cape Verde',
  centralafricanrepublic: 'Central African Republic', chad: 'Chad', chile: 'Chile', china: 'China',
  colombia: 'Colombia', comoros: 'Comoros', congo: 'Congo', costarica: 'Costa Rica', croatia: 'Croatia',
  cuba: 'Cuba', cyprus: 'Cyprus', czech: 'Czech Republic',
  // D
  denmark: 'Denmark', djibouti: 'Djibouti', dominica: 'Dominica', dominicanrepublic: 'Dominican Republic', drcongo: 'DR Congo',
  // E
  ecuador: 'Ecuador', egypt: 'Egypt', elsalvador: 'El Salvador', england: 'United Kingdom',
  equatorialguinea: 'Equatorial Guinea', eritrea: 'Eritrea', estonia: 'Estonia', eswatini: 'Eswatini', ethiopia: 'Ethiopia',
  // F
  fiji: 'Fiji', finland: 'Finland', france: 'France',
  // G
  gabon: 'Gabon', gambia: 'Gambia', georgia: 'Georgia', germany: 'Germany', ghana: 'Ghana',
  greece: 'Greece', grenada: 'Grenada', guatemala: 'Guatemala', guinea: 'Guinea', guineabissau: 'Guinea-Bissau', guyana: 'Guyana',
  // H
  haiti: 'Haiti', honduras: 'Honduras', hongkong: 'Hong Kong', hungary: 'Hungary',
  // I
  iceland: 'Iceland', india: 'India', indonesia: 'Indonesia', iran: 'Iran', iraq: 'Iraq',
  ireland: 'Ireland', israel: 'Israel', italy: 'Italy', ivorycoast: 'Ivory Coast',
  // J
  jamaica: 'Jamaica', japan: 'Japan', jordan: 'Jordan',
  // K
  kazakhstan: 'Kazakhstan', kenya: 'Kenya', kiribati: 'Kiribati', kuwait: 'Kuwait', kyrgyzstan: 'Kyrgyzstan',
  // L
  laos: 'Laos', latvia: 'Latvia', lebanon: 'Lebanon', lesotho: 'Lesotho', liberia: 'Liberia',
  libya: 'Libya', liechtenstein: 'Liechtenstein', lithuania: 'Lithuania', luxembourg: 'Luxembourg',
  // M
  macao: 'Macao', madagascar: 'Madagascar', malawi: 'Malawi', malaysia: 'Malaysia', maldives: 'Maldives',
  mali: 'Mali', malta: 'Malta', mauritania: 'Mauritania', mauritius: 'Mauritius', mexico: 'Mexico',
  moldova: 'Moldova', monaco: 'Monaco', mongolia: 'Mongolia', montenegro: 'Montenegro', morocco: 'Morocco',
  mozambique: 'Mozambique', myanmar: 'Myanmar',
  // N
  namibia: 'Namibia', nepal: 'Nepal', netherlands: 'Netherlands', newzealand: 'New Zealand', nicaragua: 'Nicaragua',
  niger: 'Niger', nigeria: 'Nigeria', northkorea: 'North Korea', northmacedonia: 'North Macedonia', norway: 'Norway',
  // O
  oman: 'Oman',
  // P
  pakistan: 'Pakistan', palestine: 'Palestine', panama: 'Panama', papuanewguinea: 'Papua New Guinea', paraguay: 'Paraguay',
  peru: 'Peru', philippines: 'Philippines', poland: 'Poland', portugal: 'Portugal', puertorico: 'Puerto Rico',
  // Q
  qatar: 'Qatar',
  // R
  romania: 'Romania', russia: 'Russia', rwanda: 'Rwanda',
  // S
  saintkitts: 'Saint Kitts and Nevis', saintlucia: 'Saint Lucia', salvador: 'El Salvador', samoa: 'Samoa', sanmarino: 'San Marino',
  saotome: 'São Tomé and Príncipe', saudiarabia: 'Saudi Arabia', senegal: 'Senegal', serbia: 'Serbia',
  seychelles: 'Seychelles', sierraleone: 'Sierra Leone', singapore: 'Singapore', slovakia: 'Slovakia',
  slovenia: 'Slovenia', solomonislands: 'Solomon Islands', somalia: 'Somalia', southafrica: 'South Africa',
  southkorea: 'South Korea', southsudan: 'South Sudan', spain: 'Spain', srilanka: 'Sri Lanka', sudan: 'Sudan',
  suriname: 'Suriname', sweden: 'Sweden', switzerland: 'Switzerland', syria: 'Syria',
  // T
  taiwan: 'Taiwan', tajikistan: 'Tajikistan', tanzania: 'Tanzania', thailand: 'Thailand', togo: 'Togo',
  tonga: 'Tonga', trinidadandtobago: 'Trinidad and Tobago', tunisia: 'Tunisia', turkey: 'Turkey',
  turkmenistan: 'Turkmenistan',
  // U
  uganda: 'Uganda', uk: 'United Kingdom', ukraine: 'Ukraine', uae: 'United Arab Emirates',
  unitedarabemirates: 'United Arab Emirates', usa: 'United States', unitedstates: 'United States', uruguay: 'Uruguay', uzbekistan: 'Uzbekistan',
  // V
  vanuatu: 'Vanuatu', venezuela: 'Venezuela', vietnam: 'Vietnam',
  // Y
  yemen: 'Yemen',
  // Z
  zambia: 'Zambia', zimbabwe: 'Zimbabwe',
}

// Country display names in Turkish
export const COUNTRY_NAMES_TR: Record<string, string> = {
  // A
  afghanistan: 'Afganistan', albania: 'Arnavutluk', algeria: 'Cezayir', andorra: 'Andorra', angola: 'Angola',
  antiguaandbarbuda: 'Antigua ve Barbuda', argentina: 'Arjantin', armenia: 'Ermenistan', australia: 'Avustralya', austria: 'Avusturya',
  azerbaijan: 'Azerbaycan',
  // B
  bahamas: 'Bahamalar', bahrain: 'Bahreyn', bangladesh: 'Bangladeş', barbados: 'Barbados', belarus: 'Belarus',
  belgium: 'Belçika', belize: 'Belize', benin: 'Benin', bhutan: 'Butan', bolivia: 'Bolivya',
  bosnia: 'Bosna Hersek', botswana: 'Botsvana', brazil: 'Brezilya', brunei: 'Brunei', bulgaria: 'Bulgaristan',
  burkinafaso: 'Burkina Faso', burundi: 'Burundi',
  // C
  cambodia: 'Kamboçya', cameroon: 'Kamerun', canada: 'Kanada', capeverde: 'Yeşil Burun Adaları',
  centralafricanrepublic: 'Orta Afrika Cumhuriyeti', chad: 'Çad', chile: 'Şili', china: 'Çin',
  colombia: 'Kolombiya', comoros: 'Komorlar', congo: 'Kongo', costarica: 'Kosta Rika', croatia: 'Hırvatistan',
  cuba: 'Küba', cyprus: 'Kıbrıs', czech: 'Çekya',
  // D
  denmark: 'Danimarka', djibouti: 'Cibuti', dominica: 'Dominika', dominicanrepublic: 'Dominik Cumhuriyeti', drcongo: 'Demokratik Kongo',
  // E
  ecuador: 'Ekvador', egypt: 'Mısır', elsalvador: 'El Salvador', england: 'İngiltere',
  equatorialguinea: 'Ekvator Ginesi', eritrea: 'Eritre', estonia: 'Estonya', eswatini: 'Esvatini', ethiopia: 'Etiyopya',
  // F
  fiji: 'Fiji', finland: 'Finlandiya', france: 'Fransa',
  // G
  gabon: 'Gabon', gambia: 'Gambiya', georgia: 'Gürcistan', germany: 'Almanya', ghana: 'Gana',
  greece: 'Yunanistan', grenada: 'Grenada', guatemala: 'Guatemala', guinea: 'Gine', guineabissau: 'Gine-Bissau', guyana: 'Guyana',
  // H
  haiti: 'Haiti', honduras: 'Honduras', hongkong: 'Hong Kong', hungary: 'Macaristan',
  // I
  iceland: 'İzlanda', india: 'Hindistan', indonesia: 'Endonezya', iran: 'İran', iraq: 'Irak',
  ireland: 'İrlanda', israel: 'İsrail', italy: 'İtalya', ivorycoast: 'Fildişi Sahili',
  // J
  jamaica: 'Jamaika', japan: 'Japonya', jordan: 'Ürdün',
  // K
  kazakhstan: 'Kazakistan', kenya: 'Kenya', kiribati: 'Kiribati', kuwait: 'Kuveyt', kyrgyzstan: 'Kırgızistan',
  // L
  laos: 'Laos', latvia: 'Letonya', lebanon: 'Lübnan', lesotho: 'Lesotho', liberia: 'Liberya',
  libya: 'Libya', liechtenstein: 'Lihtenştayn', lithuania: 'Litvanya', luxembourg: 'Lüksemburg',
  // M
  macao: 'Makao', madagascar: 'Madagaskar', malawi: 'Malavi', malaysia: 'Malezya', maldives: 'Maldivler',
  mali: 'Mali', malta: 'Malta', mauritania: 'Moritanya', mauritius: 'Mauritius', mexico: 'Meksika',
  moldova: 'Moldova', monaco: 'Monako', mongolia: 'Moğolistan', montenegro: 'Karadağ', morocco: 'Fas',
  mozambique: 'Mozambik', myanmar: 'Myanmar',
  // N
  namibia: 'Namibya', nepal: 'Nepal', netherlands: 'Hollanda', newzealand: 'Yeni Zelanda', nicaragua: 'Nikaragua',
  niger: 'Nijer', nigeria: 'Nijerya', northkorea: 'Kuzey Kore', northmacedonia: 'Kuzey Makedonya', norway: 'Norveç',
  // O
  oman: 'Umman',
  // P
  pakistan: 'Pakistan', palestine: 'Filistin', panama: 'Panama', papuanewguinea: 'Papua Yeni Gine', paraguay: 'Paraguay',
  peru: 'Peru', philippines: 'Filipinler', poland: 'Polonya', portugal: 'Portekiz', puertorico: 'Porto Riko',
  // Q
  qatar: 'Katar',
  // R
  romania: 'Romanya', russia: 'Rusya', rwanda: 'Ruanda',
  // S
  saintkitts: 'Saint Kitts ve Nevis', saintlucia: 'Saint Lucia', salvador: 'El Salvador', samoa: 'Samoa', sanmarino: 'San Marino',
  saotome: 'São Tomé ve Príncipe', saudiarabia: 'Suudi Arabistan', senegal: 'Senegal', serbia: 'Sırbistan',
  seychelles: 'Seyşeller', sierraleone: 'Sierra Leone', singapore: 'Singapur', slovakia: 'Slovakya',
  slovenia: 'Slovenya', solomonislands: 'Solomon Adaları', somalia: 'Somali', southafrica: 'Güney Afrika',
  southkorea: 'Güney Kore', southsudan: 'Güney Sudan', spain: 'İspanya', srilanka: 'Sri Lanka', sudan: 'Sudan',
  suriname: 'Surinam', sweden: 'İsveç', switzerland: 'İsviçre', syria: 'Suriye',
  // T
  taiwan: 'Tayvan', tajikistan: 'Tacikistan', tanzania: 'Tanzanya', thailand: 'Tayland', togo: 'Togo',
  tonga: 'Tonga', trinidadandtobago: 'Trinidad ve Tobago', tunisia: 'Tunus', turkey: 'Türkiye',
  turkmenistan: 'Türkmenistan',
  // U
  uganda: 'Uganda', uk: 'Birleşik Krallık', ukraine: 'Ukrayna', uae: 'Birleşik Arap Emirlikleri',
  unitedarabemirates: 'Birleşik Arap Emirlikleri', usa: 'Amerika', unitedstates: 'Amerika', uruguay: 'Uruguay', uzbekistan: 'Özbekistan',
  // V
  vanuatu: 'Vanuatu', venezuela: 'Venezuela', vietnam: 'Vietnam',
  // Y
  yemen: 'Yemen',
  // Z
  zambia: 'Zambiya', zimbabwe: 'Zimbabve',
}

/**
 * Generate flag emoji from ISO 2-letter country code
 * Uses regional indicator symbols: A=🇦 (U+1F1E6), B=🇧 (U+1F1E7), etc.
 */
function isoToFlag(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return '🏳️'
  const code = isoCode.toUpperCase()
  const offset = 0x1F1E6 - 65 // 'A' = 65, Regional Indicator A = U+1F1E6
  const first = String.fromCodePoint(code.charCodeAt(0) + offset)
  const second = String.fromCodePoint(code.charCodeAt(1) + offset)
  return first + second
}

/**
 * Get flag emoji for a country name (from 5sim API)
 */
export function getCountryFlag(countryName: string): string {
  const normalized = countryName.toLowerCase().replace(/[\s-]/g, '')
  const isoCode = COUNTRY_ISO_MAP[normalized]
  return isoCode ? isoToFlag(isoCode) : '🏳️'
}

/**
 * Get display name for a country, with locale support
 * @param countryName - Country name from 5sim API
 * @param locale - Locale ('en' or 'tr'), defaults to 'en'
 */
export function getCountryDisplayName(countryName: string, locale: Locale = 'en'): string {
  const normalized = countryName.toLowerCase().replace(/[\s-]/g, '')
  const nameMap = locale === 'tr' ? COUNTRY_NAMES_TR : COUNTRY_NAMES_EN
  const localizedName = nameMap[normalized]
  if (localizedName) return localizedName
  // Fallback: capitalize first letter of each word
  return countryName
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Legacy COUNTRY_FLAGS export for backward compatibility
export const COUNTRY_FLAGS: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_ISO_MAP).map(([name, iso]) => [name, isoToFlag(iso)])
)

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.FIVESIM_API_KEY
  if (!apiKey) {
    throw new Error('FIVESIM_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Make authenticated request to 5sim API
 */
async function fiveSimFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey()

  const response = await fetch(`${FIVESIM_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`5sim API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Make unauthenticated request to 5sim API (guest endpoints)
 */
async function fiveSimGuestFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${FIVESIM_BASE_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`5sim API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Convert RUB price to USD (using approximate rate)
 * Note: 5sim API provides priceUsd directly in some responses
 */
export function rubToUsd(rubPrice: number): number {
  // 1 RUB ≈ 0.011 USD (approximate rate)
  return Math.ceil(rubPrice * 0.011 * 100) / 100
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all available countries
 */
export async function fetchCountries(): Promise<FiveSimCountry[]> {
  const data = await fiveSimGuestFetch<FiveSimCountriesResponse>(
    FIVESIM_ENDPOINTS.COUNTRIES
  )

  return Object.entries(data).map(([iso, country]) => ({
    ...country,
    iso,
    name: COUNTRY_NAMES_EN[iso] || country.name || iso,
    flag: COUNTRY_FLAGS[iso] || '🏳️',
  }))
}

/**
 * Fetch products/services for a specific country
 */
export async function fetchProducts(
  country: string,
  operator: string = 'any'
): Promise<FiveSimProduct[]> {
  const endpoint = `${FIVESIM_ENDPOINTS.PRODUCTS}/${country}/${operator}`

  // 5sim API returns: { "product": { "Category": "activation", "Qty": number, "Price": number } }
  const data = await fiveSimGuestFetch<Record<string, { Category?: string; Qty?: number; Price?: number; cost?: number; count?: number }>>(endpoint)

  return Object.entries(data).map(([product, info]) => {
    // Handle both old format (cost/count) and new format (Price/Qty)
    const price = info.Price ?? info.cost ?? 0
    const count = info.Qty ?? info.count ?? 0

    return {
      product,
      operator,
      price,
      priceUsd: rubToUsd(price),
      priceAmount: rubToUsd(price),
      count,
    }
  })
}

/**
 * Fetch pricing for a specific country and product
 */
export async function fetchPricing(
  country: string,
  product: string
): Promise<{ price: number; priceUsd: number; count: number; operators: string[] }> {
  const endpoint = `${FIVESIM_ENDPOINTS.PRICES}?country=${country}&product=${product}`
  const data = await fiveSimGuestFetch<FiveSimPricingResponse>(endpoint)

  const countryData = data[country]
  if (!countryData || !countryData[product]) {
    throw new Error(`Product ${product} not available in ${country}`)
  }

  const productData = countryData[product]
  const operators = Object.keys(productData)

  // Get the cheapest operator price
  let minPrice = Infinity
  let totalCount = 0

  for (const operatorData of Object.values(productData)) {
    const price = operatorData.cost ?? operatorData.Price ?? 0
    const count = operatorData.count ?? operatorData.Qty ?? 0

    if (price < minPrice && count > 0) {
      minPrice = price
    }
    totalCount += count
  }

  return {
    price: minPrice === Infinity ? 0 : minPrice,
    priceUsd: minPrice === Infinity ? 0 : rubToUsd(minPrice),
    count: totalCount,
    operators,
  }
}

/**
 * Fetch prices for all countries for a specific product/service
 * Returns a map of country ISO -> price info
 *
 * Note: 5sim API returns: {product: {country: {operator: {...}}}}
 * e.g., {"telegram": {"afghanistan": {"any": {cost: 10, count: 100}}}}
 */
export async function fetchServicePrices(
  product: string
): Promise<Record<string, { price: number; priceUsd: number; count: number }>> {
  // 5sim API: /guest/prices?product=telegram returns all countries
  const endpoint = `${FIVESIM_ENDPOINTS.PRICES}?product=${product}`
  const data = await fiveSimGuestFetch<FiveSimPricingResponse>(endpoint)

  const result: Record<string, { price: number; priceUsd: number; count: number }> = {}

  // API response structure: {product: {country: {operator: {cost, count}}}}
  // Get the product data - countries are nested inside the product key
  const productCountries = data[product]
  if (!productCountries) {
    console.log(`No countries found for product: ${product}`)
    return result
  }

  for (const [countryIso, operators] of Object.entries(productCountries)) {
    // operators is directly the operators object: {any: {...}, operator2: {...}}
    // Get the cheapest operator price
    let minPrice = Infinity
    let totalCount = 0

    for (const operatorData of Object.values(operators)) {
      const price = operatorData.cost ?? operatorData.Price ?? 0
      const count = operatorData.count ?? operatorData.Qty ?? 0

      if (price < minPrice && count > 0) {
        minPrice = price
      }
      totalCount += count
    }

    if (minPrice !== Infinity && totalCount > 0) {
      result[countryIso] = {
        price: minPrice,
        priceUsd: rubToUsd(minPrice),
        count: totalCount,
      }
    }
  }

  return result
}

/**
 * Buy a phone number for activation
 */
export async function buyNumber(
  country: string,
  product: string,
  operator: string = 'any'
): Promise<FiveSimActivation> {
  const endpoint = `${FIVESIM_ENDPOINTS.BUY}/${country}/${operator}/${product}`

  const activation = await fiveSimFetch<FiveSimActivation>(endpoint, {
    method: 'GET', // 5sim uses GET for buy
  })

  return {
    ...activation,
    priceAmount: rubToUsd(activation.price),
  }
}

/**
 * Check activation status and SMS
 */
export async function checkActivation(id: number): Promise<FiveSimActivation> {
  const endpoint = `${FIVESIM_ENDPOINTS.CHECK}/${id}`

  const activation = await fiveSimFetch<FiveSimActivation>(endpoint)

  return {
    ...activation,
    priceAmount: rubToUsd(activation.price),
  }
}

/**
 * Finish/complete an activation
 */
export async function finishActivation(id: number): Promise<FiveSimActivation> {
  const endpoint = `${FIVESIM_ENDPOINTS.FINISH}/${id}`

  return fiveSimFetch<FiveSimActivation>(endpoint, {
    method: 'GET', // 5sim uses GET
  })
}

/**
 * Cancel an activation
 */
export async function cancelActivation(id: number): Promise<FiveSimActivation> {
  const endpoint = `${FIVESIM_ENDPOINTS.CANCEL}/${id}`

  return fiveSimFetch<FiveSimActivation>(endpoint, {
    method: 'GET', // 5sim uses GET
  })
}

/**
 * Get user profile from 5sim
 */
export async function getProfile() {
  return fiveSimFetch<{ id: number; email: string; balance: number }>(
    FIVESIM_ENDPOINTS.PROFILE
  )
}

// ============================================================================
// Utility Types for Frontend
// ============================================================================

export interface TransformedCountry {
  iso: string
  name: string
  flag: string
  prefix: string
}

export interface TransformedProduct {
  id: string
  name: string
  icon: string
  price: number
  priceUsd: number
  count: number
}

export interface PricingInfo {
  country: string
  product: string
  price: number
  priceUsd: number
  count: number
  operators: string[]
}
