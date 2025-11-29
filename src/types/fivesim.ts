/**
 * 5sim.net API Type Definitions
 *
 * API Documentation: https://5sim.net/docs
 * Base URL: https://5sim.net/v1
 * Authentication: Bearer JWT token
 */

// ============================================================================
// User & Profile Types
// ============================================================================

export interface FiveSimProfile {
  id: number;
  email: string;
  balance: number;
  rating: number;
  default_country?: {
    name: string;
    iso: string;
    prefix: string;
  };
  default_operator?: string;
  default_forwarding_number?: string;
  frozen_balance?: number;
}

// ============================================================================
// Country Types
// ============================================================================

export interface FiveSimCountry {
  name: string;
  iso: string;
  prefix: string;
  text?: string; // Full country name
}

export type FiveSimCountriesResponse = Record<string, FiveSimCountry>;

// Re-export common Country interface for backwards compatibility
export interface Country {
  code: string;
  name: string;
  flag?: string;
  flagEmoji?: string;
  region?: string;
}

// ============================================================================
// Product/Service Types
// ============================================================================

export interface FiveSimProduct {
  product: string;     // Service name (e.g., "whatsapp", "telegram")
  operator: string;    // Operator name (e.g., "any", "tele2")
  price: number;       // Price in rubles
  priceUsd: number;    // Price in USD (converted from rubles)
  priceAmount: number; // Price in 5sim amount (converted from rubles)
  count: number;       // Available quantity
}

export interface FiveSimProductInfo {
  // Old format (kept for backwards compatibility)
  Category?: string;
  Qty?: number;
  Price?: number;

  // New format (current API)
  cost?: number;    // Replaces Price
  count?: number;   // Replaces Qty
  rate?: number;    // Additional field
}

// Pricing structure for a country
export type FiveSimCountryPricing = Record<string, Record<string, FiveSimProductInfo>>;

// Full pricing response
export type FiveSimPricingResponse = Record<string, FiveSimCountryPricing>;

// ============================================================================
// Activation Types
// ============================================================================

export type FiveSimActivationStatus =
  | 'PENDING'    // Waiting for SMS
  | 'RECEIVED'   // SMS received
  | 'FINISHED'   // Activation completed
  | 'CANCELED'   // Activation canceled
  | 'TIMEOUT';   // Activation timed out

export interface FiveSimSMS {
  id: number;
  created_at: string;  // ISO 8601 date
  date: string;        // ISO 8601 date
  sender: string;      // Sender name/number
  text: string;        // Full SMS text
  code: string;        // Extracted verification code
}

export interface FiveSimActivation {
  id: number;
  phone: string;
  operator: string;
  product: string;
  price: number;            // Price in RUB
  priceUsd?: number;        // Price in USD (computed)
  priceAmount?: number;     // Price in 5sim amount (computed)
  status: FiveSimActivationStatus;
  expires: string;          // ISO 8601 date
  sms?: FiveSimSMS[];       // SMS messages received
  created_at: string;       // ISO 8601 date
  country: string;          // Country ISO code
  forwarding?: boolean;
  forwarding_number?: string;
  reused?: boolean;
}

// ============================================================================
// API Request Types
// ============================================================================

export interface FiveSimBuyNumberRequest {
  country: string;      // Country ISO code (e.g., "russia", "turkey")
  product: string;      // Service name (e.g., "whatsapp", "telegram")
  operator?: string;    // Operator (optional, defaults to "any")
}

export interface FiveSimCheckSMSRequest {
  id: number;          // Activation ID
}

export interface FiveSimFinishActivationRequest {
  id: number;          // Activation ID
}

export interface FiveSimCancelActivationRequest {
  id: number;          // Activation ID
}

// ============================================================================
// API Response Types
// ============================================================================

export interface FiveSimApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface FiveSimErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

// ============================================================================
// Purchase Flow Types (App-Specific)
// ============================================================================

export interface FiveSimPurchaseParams {
  serviceId: string;        // Our internal service ID
  countryIso: string;       // Country ISO code
  operator?: string;        // Optional operator
}

export interface FiveSimPurchaseResult {
  success: boolean;
  activation?: FiveSimActivation;
  error?: string;
}

export interface FiveSimValidationResult {
  isAvailable: boolean;
  currentPrice: number;        // Price in RUB
  currentPriceUsd: number;     // Price in USD
  currentPriceAmount: number;  // Price in 5sim amount
  currentStock: number;
  error?: string;
}

// ============================================================================
// Polling & State Types
// ============================================================================

export interface FiveSimPollingState {
  activationId: number;
  isPolling: boolean;
  attempts: number;
  maxAttempts: number;
  intervalMs: number;
}

export interface FiveSimActivationState {
  activation: FiveSimActivation | null;
  pollingState: FiveSimPollingState | null;
  error: string | null;
}

// ============================================================================
// Mapping Types (For Integration with Existing Data)
// ============================================================================

export interface FiveSimServiceMapping {
  internalId: string;      // Our service ID (e.g., "vk", "whatsapp")
  fiveSimProduct: string;  // 5sim product name
  name: string;            // Display name
  icon: string;            // Icon name
}

export interface FiveSimCountryMapping {
  internalIso: string;     // Our country ISO
  fiveSimCountry: string;  // 5sim country identifier
  name: string;            // Display name
  flag: string;            // Flag emoji
}

// ============================================================================
// Constants
// ============================================================================

export const FIVESIM_BASE_URL = 'https://5sim.net/v1';

export const FIVESIM_ENDPOINTS = {
  PROFILE: '/user/profile',
  COUNTRIES: '/guest/countries',
  PRODUCTS: '/guest/products',
  PRICES: '/guest/prices',
  BUY: '/user/buy/activation',
  CHECK: '/user/check',
  FINISH: '/user/finish',
  CANCEL: '/user/cancel',
} as const;

export const FIVESIM_POLLING_CONFIG = {
  INTERVAL_MS: 5000,        // Poll every 5 seconds
  MAX_ATTEMPTS: 60,         // 5 minutes maximum (60 * 5s = 300s)
  TIMEOUT_MS: 300000,       // 5 minutes timeout
} as const;
