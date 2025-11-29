# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VerifyNumber is a Turkish-language SMS verification service web application. Users can purchase virtual phone numbers to receive SMS verification codes, with balance top-up functionality via Polar payments.

## Commands

```bash
npm run dev          # Start development server (port 3001)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.3.4 (App Router) with React 19
- **Language**: TypeScript 5.8.3 (strict mode)
- **Styling**: Tailwind CSS 3.4 with CSS variables for theming, Radix UI primitives
- **State**: React Query v5 (server state), React Context (auth)
- **Backend**: Firebase 11 (Auth + Realtime Database), Polar SDK (payments)
- **External API**: 5sim.net (SMS verification services)

### Directory Structure

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout with Providers wrapper
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles + CSS variables
│   ├── (auth)/                  # Auth pages (login, register)
│   │   ├── login/page.tsx       # Email/Google sign-in
│   │   └── register/page.tsx    # User registration
│   ├── (dashboard)/             # Protected pages with shared layout
│   │   ├── layout.tsx           # Sidebar + mobile nav + auth guard
│   │   ├── activation/page.tsx  # Purchase virtual numbers + SMS polling
│   │   ├── dashboard/page.tsx   # User home/overview
│   │   ├── history/page.tsx     # Transaction history
│   │   ├── settings/page.tsx    # User settings
│   │   └── topup/               # Balance management
│   │       ├── page.tsx         # Top-up amount selection
│   │       └── success/page.tsx # Post-payment confirmation
│   └── api/                     # API routes
│       ├── checkout/route.ts    # Polar checkout creation
│       ├── admin/add-balance/   # Admin balance adjustment
│       ├── webhook/polar/       # Polar payment webhooks
│       └── 5sim/                # 5sim.net proxy endpoints
│           ├── countries/       # GET available countries
│           ├── products/        # GET services per country
│           ├── prices/          # GET pricing info
│           ├── service-prices/  # GET all country prices for service
│           ├── buy/             # POST purchase number
│           ├── check/           # GET activation status + SMS
│           ├── finish/          # POST complete activation
│           └── cancel/          # POST cancel activation
├── components/
│   ├── providers.tsx            # QueryClient + AuthProvider wrapper
│   └── service-icons.tsx        # Service brand icons (Telegram, WhatsApp, etc.)
├── contexts/
│   └── AuthContext.tsx          # Firebase auth state + user profile + balance
├── hooks/
│   └── use5sim.ts               # React Query hooks for 5sim API
├── lib/
│   ├── firebase.ts              # Firebase client initialization (client-only)
│   ├── polar.ts                 # Polar SDK client (server-only)
│   ├── 5sim-client.ts           # 5sim API client + utilities (server-only)
│   └── utils.ts                 # cn(), formatCurrency(), formatDate(), calculateBonus()
├── services/                    # (Reserved for future services)
└── types/
    ├── fivesim.ts               # 5sim.net API types, interfaces, constants
    └── polar.ts                 # Payment types, balance packages, bonus tiers
```

### Key Patterns

**Firebase Client-Only Initialization**: `src/lib/firebase.ts` exports lazy-initialized singletons that throw if accessed on server. The `AuthContext` initializes Firebase in a `useEffect` to ensure client-side only.

**Protected Routes**: Dashboard layout (`src/app/(dashboard)/layout.tsx`) redirects to `/login` if not authenticated. Uses `useAuth()` hook for auth state.

**Real-time Balance Updates**: `AuthContext` subscribes to `users/{uid}/profile/balance` via Firebase `onValue()` for live balance updates after payments.

**Payment Flow**:
1. User selects amount on `/topup` → calls `/api/checkout`
2. Checkout API creates Polar session with metadata (userId, amount, bonus)
3. User redirected to Polar payment page
4. Polar webhook (`/api/webhook/polar`) fires on `checkout.confirmed` or `order.created`
5. Webhook uses Firebase Admin SDK to update `users/{uid}/profile/balance`
6. Client receives real-time balance update via Firebase subscription

**SMS Activation Flow**:
1. User selects service + country on `/activation`
2. `useBuyNumber()` mutation calls `/api/5sim/buy`
3. `useActivation()` polls `/api/5sim/check` every 5 seconds while `PENDING`
4. On SMS received (`RECEIVED` status), user sees code + can copy
5. User clicks "Complete" → `useFinishActivation()` calls `/api/5sim/finish`

**React Query Caching Strategy**:
- Countries: 1 hour stale, 2 hour cache (rarely changes)
- Products: 5 min stale, 15 min cache
- Pricing: 30 sec stale, 5 min cache, refetch every 60s
- Activation: polls every 5s while PENDING, stops on terminal state

**Import Alias**: Use `@/*` for `./src/*` imports.

## API Routes Reference

### Payment APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout` | POST | Create Polar checkout session |
| `/api/webhook/polar` | POST | Handle Polar payment webhooks |
| `/api/admin/add-balance` | POST | Admin: manually add balance |

### 5sim APIs (all proxy to 5sim.net)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/5sim/countries` | GET | List available countries |
| `/api/5sim/products?country=` | GET | List services for country |
| `/api/5sim/prices?country=&product=` | GET | Get pricing for country+service |
| `/api/5sim/service-prices?product=` | GET | Get all country prices for service |
| `/api/5sim/buy` | POST | Purchase activation number |
| `/api/5sim/check?id=` | GET | Check activation status/SMS |
| `/api/5sim/finish` | POST | Mark activation complete |
| `/api/5sim/cancel` | POST | Cancel activation (refund) |

## Environment Variables

### Firebase (Client - NEXT_PUBLIC_* prefix)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin (Server - for webhooks)
```env
FIREBASE_SERVICE_ACCOUNT_KEY=  # JSON string
```

### Polar Payments (Server)
```env
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRODUCT_ID=              # Product ID in Polar
POLAR_PRICE_ID=                # Price ID (fallback)
```

### 5sim.net (Server)
```env
FIVESIM_API_KEY=               # Bearer token for 5sim API
```

### App Config
```env
NEXT_PUBLIC_APP_URL=           # Base URL (default: http://localhost:3001)
```

## Key Types & Interfaces

### User Profile (Firebase)
```typescript
interface UserProfile {
  email: string
  displayName?: string | null
  photoURL?: string | null
  balance: number              // TRY currency
  createdAt: string            // ISO 8601
  lastLoginAt?: string
  provider?: string            // 'email' | 'google.com'
}
```

### Balance Packages
```typescript
const BALANCE_PACKAGES = [
  { id: 'balance_100',  amount: 100,  bonus: 5,  totalCredits: 105  },
  { id: 'balance_250',  amount: 250,  bonus: 10, totalCredits: 275  },
  { id: 'balance_500',  amount: 500,  bonus: 15, totalCredits: 575  },
  { id: 'balance_1000', amount: 1000, bonus: 20, totalCredits: 1200 },
]
```

### 5sim Activation States
```typescript
type FiveSimActivationStatus =
  | 'PENDING'    // Waiting for SMS
  | 'RECEIVED'   // SMS received
  | 'FINISHED'   // Completed
  | 'CANCELED'   // Canceled (refunded)
  | 'TIMEOUT'    // Expired
```

## Styling Conventions

Uses shadcn/ui-style CSS variables defined in `globals.css`. Use the `cn()` utility from `@/lib/utils` for conditional class merging.

**Theme colors**: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`.

**Dashboard classes** (defined in globals.css):
- `dash-btn` / `dash-btn-secondary` - Button styles
- `dash-link` - Link with arrow icon
- `dash-stat-label` - Small muted label text
- `dash-badge` / `dash-badge-waiting` - Status badges
- `dash-animate` / `dash-animate-delay-*` - Staggered animations

**Auth page classes**:
- `auth-btn-primary` / `auth-btn-secondary` - Auth form buttons
- `auth-input` / `auth-input-line` - Input with animated underline
- `auth-brand-bg` - Left panel gradient background
- `auth-animate` / `auth-animate-delay-*` - Staggered animations

## Localization

UI is entirely in Turkish. Key utilities:
- `formatCurrency(amount)` → "₺100,00" (TRY locale)
- `formatDate(date)` → "29.11.2024 14:30" (Turkish format)
- Error messages in Turkish throughout

## Currency & Pricing

- User balances stored in TRY (Turkish Lira)
- 5sim.net API returns prices in RUB (Russian Rubles)
- Conversion: `RUB_TO_TRY_RATE = 0.38` in `5sim-client.ts`
- `rubToTry(rubPrice)` converts RUB → TRY with ceiling rounding

## Common Development Tasks

### Adding a new service icon
Edit `src/components/service-icons.tsx`, add to `SERVICE_ICONS` map.

### Adding a new 5sim endpoint
1. Add route in `src/app/api/5sim/[endpoint]/route.ts`
2. Add client function in `src/lib/5sim-client.ts`
3. Add React Query hook in `src/hooks/use5sim.ts`

### Modifying balance bonus tiers
Edit `BALANCE_PACKAGES` in `src/types/polar.ts` and `calculateBonus()` in `src/lib/utils.ts`.

### Testing payment flow locally
With `POLAR_ACCESS_TOKEN` unset, the checkout API returns a dev redirect URL that skips actual payment.
