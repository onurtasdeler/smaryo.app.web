'use client'

import {
  SiGoogle,
  SiFacebook,
  SiWhatsapp,
  SiInstagram,
  SiDiscord,
  SiTelegram,
  SiPaypal,
  SiNetflix,
  SiLinkedin,
  SiAmazon,
  SiAirbnb,
  SiSteam,
  SiTiktok,
  SiSnapchat,
  SiUber,
  SiViber,
  SiSignal,
  SiApple,
  SiTwitch,
  SiSpotify,
  SiPinterest,
  SiReddit,
  SiZoom,
  SiSlack,
  SiBinance,
  SiCoinbase,
  SiEbay,
  SiShopify,
  SiEtsy,
  SiGithub,
  SiDropbox,
  SiNotion,
  SiTrello,
  SiFigma,
  SiCanva,
  SiRoblox,
  SiOpenai,
  SiLine,
  SiKakaotalk,
  SiVk,
  SiProtonmail,
  SiYoutube,
  SiSoundcloud,
  SiVimeo,
  SiStripe,
  SiNintendo,
  SiAsana,
} from 'react-icons/si'

import {
  FaGlobe,
  FaEnvelope,
  FaGamepad,
  FaHeart,
  FaWallet,
  FaMobile,
  FaQuestion,
  FaComments,
  FaCar,
  FaPlane,
  FaStore,
  FaMusic,
  FaVideo,
  FaBriefcase,
  FaShoppingBag,
  FaBolt,
  FaList,
  FaUtensils,
} from 'react-icons/fa'

// Service ID to Icon mapping - only use icons that definitely exist
const serviceIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  // Social & Messaging
  google: SiGoogle,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp,
  instagram: SiInstagram,
  discord: SiDiscord,
  telegram: SiTelegram,
  tiktok: SiTiktok,
  snapchat: SiSnapchat,
  linkedin: SiLinkedin,
  pinterest: SiPinterest,
  reddit: SiReddit,
  viber: SiViber,
  signal: SiSignal,
  line: SiLine,
  kakaotalk: SiKakaotalk,
  vk: SiVk,
  vkontakte: SiVk,
  wechat: FaComments,
  weibo: FaGlobe,
  qq: FaComments,

  // Dating
  tinder: FaHeart,
  bumble: FaHeart,
  badoo: FaHeart,
  happn: FaHeart,
  okcupid: FaHeart,

  // Tech & Email
  microsoft: FaEnvelope,
  apple: SiApple,
  yahoo: FaEnvelope,
  yandex: FaGlobe,
  mailru: FaEnvelope,
  'mail.ru': FaEnvelope,
  protonmail: SiProtonmail,
  gmail: SiGoogle,
  outlook: FaEnvelope,
  icloud: SiApple,

  // Video & Streaming
  netflix: SiNetflix,
  youtube: SiYoutube,
  twitch: SiTwitch,
  spotify: SiSpotify,
  deezer: FaMusic,
  tidal: FaMusic,
  soundcloud: SiSoundcloud,
  vimeo: SiVimeo,

  // Communication
  skype: FaVideo,
  zoom: SiZoom,
  slack: SiSlack,

  // Shopping & E-commerce
  amazon: SiAmazon,
  ebay: SiEbay,
  alibaba: FaStore,
  aliexpress: FaStore,
  shopify: SiShopify,
  etsy: SiEtsy,
  zalando: FaStore,

  // Payment & Finance
  paypal: SiPaypal,
  binance: SiBinance,
  coinbase: SiCoinbase,
  revolut: FaWallet,
  wise: FaWallet,
  n26: FaWallet,
  payoneer: FaWallet,
  stripe: SiStripe,
  alipay: FaWallet,

  // Travel
  airbnb: SiAirbnb,
  booking: FaPlane,
  tripadvisor: FaPlane,
  uber: SiUber,
  lyft: FaCar,
  grab: FaCar,

  // Gaming
  steam: SiSteam,
  blizzard: FaGamepad,
  epicgames: FaGamepad,
  riotgames: FaGamepad,
  playstation: FaGamepad,
  xbox: FaGamepad,
  nintendo: SiNintendo,
  roblox: SiRoblox,

  // Food
  mcdonalds: FaStore,
  burgerking: FaStore,

  // Sports brands
  nike: FaStore,
  adidas: FaStore,

  // Work & Productivity
  github: SiGithub,
  gitlab: FaGlobe,
  dropbox: SiDropbox,
  notion: SiNotion,
  trello: SiTrello,
  asana: SiAsana,
  figma: SiFigma,
  canva: SiCanva,

  // Crypto
  bitcoin: FaWallet,
  ethereum: FaWallet,
  okx: FaWallet,
  bitexen: FaWallet,

  // Twitter/X
  twitter: FaGlobe,
  x: FaGlobe,

  // Other
  openai: SiOpenai,
  chatgpt: SiOpenai,
  imo: FaComments,
  truecaller: FaMobile,
  naver: FaGlobe,
  daum: FaGlobe,
  other: FaGlobe,

  // Additional services
  aol: FaEnvelope,
  bolt: FaBolt,
  craigslist: FaList,
  deliveroo: FaUtensils,
  fiverr: FaBriefcase,
  grindr: FaHeart,
  mocospace: FaComments,
  pof: FaHeart,
  redbook: FaShoppingBag,
  skout: FaHeart,
  tantan: FaHeart,
  hinge: FaHeart,
  match: FaHeart,
  zoosk: FaHeart,

  // Food delivery
  doordash: FaUtensils,
  grubhub: FaUtensils,
  ubereats: FaUtensils,
  postmates: FaUtensils,

  // Freelance/Work
  upwork: FaBriefcase,
  freelancer: FaBriefcase,
  toptal: FaBriefcase,

  // Other
  hotmail: FaEnvelope,
}

// Brand colors for icons
const serviceColorMap: Record<string, string> = {
  google: '#4285F4',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  x: '#000000',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  discord: '#5865F2',
  telegram: '#26A5E4',
  tiktok: '#000000',
  snapchat: '#FFFC00',
  linkedin: '#0A66C2',
  pinterest: '#E60023',
  reddit: '#FF4500',
  wechat: '#07C160',
  viber: '#7360F2',
  signal: '#3A76F0',
  line: '#00C300',
  kakaotalk: '#FFE812',
  vk: '#4C75A3',
  vkontakte: '#4C75A3',
  tinder: '#FF6B6B',
  bumble: '#FFC629',
  microsoft: '#00A4EF',
  apple: '#A2AAAD',
  yahoo: '#6001D2',
  yandex: '#FF0000',
  mailru: '#005FF9',
  'mail.ru': '#005FF9',
  netflix: '#E50914',
  youtube: '#FF0000',
  twitch: '#9146FF',
  spotify: '#1DB954',
  amazon: '#FF9900',
  ebay: '#E53238',
  paypal: '#003087',
  binance: '#F0B90B',
  coinbase: '#0052FF',
  airbnb: '#FF5A5F',
  uber: '#000000',
  steam: '#1B2838',
  blizzard: '#00AEFF',
  mcdonalds: '#FFC72C',
  nike: '#111111',
  adidas: '#000000',
  github: '#181717',
  dropbox: '#0061FF',
  openai: '#10A37F',
  zoom: '#2D8CFF',
  slack: '#4A154B',
  notion: '#000000',
  figma: '#F24E1E',
  soundcloud: '#FF5500',
  shopify: '#96BF48',

  // Additional colors
  aol: '#FF0000',
  bolt: '#34D186',
  craigslist: '#562D84',
  deliveroo: '#00CCBC',
  fiverr: '#1DBF73',
  grindr: '#F8C300',
  pof: '#D93B66',
  tantan: '#FF6B6B',
  doordash: '#FF3008',
  ubereats: '#06C167',
  upwork: '#6FDA44',
  hinge: '#FF6B6B',
  match: '#FD5564',
  zoosk: '#00AEEF',
  hotmail: '#0078D4',
}

interface ServiceIconProps {
  serviceId: string
  className?: string
  size?: number
  showColor?: boolean
}

export function ServiceIcon({ serviceId, className = '', size = 24, showColor = true }: ServiceIconProps) {
  const normalizedId = serviceId.toLowerCase().replace(/[^a-z0-9]/g, '')
  const Icon = serviceIconMap[normalizedId] || serviceIconMap[serviceId.toLowerCase()] || FaQuestion
  const color = showColor ? (serviceColorMap[normalizedId] || serviceColorMap[serviceId.toLowerCase()] || 'currentColor') : 'currentColor'

  return (
    <Icon
      className={className}
      style={{
        width: size,
        height: size,
        color: color,
        flexShrink: 0,
      }}
    />
  )
}

export function getServiceColor(serviceId: string): string {
  const normalizedId = serviceId.toLowerCase().replace(/[^a-z0-9]/g, '')
  return serviceColorMap[normalizedId] || serviceColorMap[serviceId.toLowerCase()] || '#666666'
}
