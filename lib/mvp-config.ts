/**
 * MVP Test Mode Configuration
 *
 * Controls the behavior of MVP test mode features:
 * - Guest authentication (no Clerk required)
 * - Test credits system (100 credits per user)
 * - Payment/billing features disabled
 */

export const MVP_CONFIG = {
  // Enable MVP test mode
  enabled: process.env.NEXT_PUBLIC_MVP_TEST_MODE === 'true',

  // Guest mode configuration
  guest: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_CLERK_AUTH !== 'true',
    initialCredits: parseInt(process.env.NEXT_PUBLIC_GUEST_INITIAL_CREDITS || '100', 10),
    // Guest user will be stored in localStorage with this prefix
    storagePrefix: 'polaroid_guest_',
  },

  // Features to disable in MVP mode
  features: {
    payment: false,        // Disable payment/charging features
    giftCode: false,       // Disable gift code redemption
    orderHistory: false,   // Disable order history
    socialAuth: false,     // Disable social auth providers
  },

  // Credit costs (keep the same for data collection)
  credits: {
    textGeneration: 5,     // Text to Polaroid
    imageConversion: 8,    // Image to Polaroid
    multiImageComposition: 8, // Multi-image composition
  },

  // Rate limiting for guest users
  rateLimiting: {
    enabled: true,
    maxGenerationsPerHour: 10,
    maxGenerationsPerDay: 20,
  },
} as const;

/**
 * Check if MVP test mode is enabled
 */
export function isMVPMode(): boolean {
  return MVP_CONFIG.enabled;
}

/**
 * Check if guest mode is enabled
 */
export function isGuestMode(): boolean {
  return MVP_CONFIG.guest.enabled;
}

/**
 * Check if a feature is enabled in MVP mode
 */
export function isFeatureEnabled(feature: keyof typeof MVP_CONFIG.features): boolean {
  if (!isMVPMode()) return true; // All features enabled in production
  return MVP_CONFIG.features[feature];
}

/**
 * Get initial credits for guest users
 */
export function getGuestInitialCredits(): number {
  return MVP_CONFIG.guest.initialCredits;
}
