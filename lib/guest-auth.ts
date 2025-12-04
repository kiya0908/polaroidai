/**
 * Guest Authentication System for MVP Test Mode
 *
 * Provides a simplified authentication system that doesn't require Clerk.
 * Guest users are identified by a UUID stored in localStorage.
 */

import { v4 as uuidv4 } from 'uuid';
import { MVP_CONFIG, getGuestInitialCredits } from './mvp-config';

export interface GuestUser {
  id: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  createdAt: number;
  credits: number;
  generationCount: number;
  lastGenerationTime: number | null;
}

const STORAGE_KEY = `${MVP_CONFIG.guest.storagePrefix}user`;
const CREDITS_KEY = `${MVP_CONFIG.guest.storagePrefix}credits`;
const HISTORY_KEY = `${MVP_CONFIG.guest.storagePrefix}history`;

/**
 * Initialize or get existing guest user
 */
export function getOrCreateGuestUser(): GuestUser {
  if (typeof window === 'undefined') {
    // Server-side: return default guest user
    return createDefaultGuestUser();
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const user = JSON.parse(stored) as GuestUser;
      return user;
    } catch (error) {
      console.error('Failed to parse guest user:', error);
    }
  }

  // Create new guest user
  const newUser: GuestUser = {
    id: `guest_${uuidv4()}`,
    email: null,
    fullName: 'Guest User',
    imageUrl: null,
    createdAt: Date.now(),
    credits: getGuestInitialCredits(),
    generationCount: 0,
    lastGenerationTime: null,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  localStorage.setItem(CREDITS_KEY, String(newUser.credits));

  return newUser;
}

/**
 * Create default guest user (for server-side)
 */
function createDefaultGuestUser(): GuestUser {
  return {
    id: 'guest_default',
    email: null,
    fullName: 'Guest User',
    imageUrl: null,
    createdAt: Date.now(),
    credits: getGuestInitialCredits(),
    generationCount: 0,
    lastGenerationTime: null,
  };
}

/**
 * Get guest user credits
 */
export function getGuestCredits(): number {
  if (typeof window === 'undefined') {
    return getGuestInitialCredits();
  }

  const stored = localStorage.getItem(CREDITS_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }

  return getGuestInitialCredits();
}

/**
 * Update guest user credits
 */
export function updateGuestCredits(newCredits: number): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CREDITS_KEY, String(newCredits));

  // Also update user object
  const user = getOrCreateGuestUser();
  user.credits = newCredits;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Deduct credits for generation
 */
export function deductGuestCredits(amount: number): boolean {
  const currentCredits = getGuestCredits();

  if (currentCredits < amount) {
    return false; // Insufficient credits
  }

  updateGuestCredits(currentCredits - amount);
  return true;
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(amount: number): boolean {
  return getGuestCredits() >= amount;
}

/**
 * Record a generation in history
 */
export function recordGeneration(generation: {
  id: string;
  prompt: string;
  imageUrl: string;
  type: 'text' | 'image' | 'multi';
  creditsUsed: number;
  createdAt: number;
}): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(HISTORY_KEY);
  let history: typeof generation[] = [];

  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse history:', error);
    }
  }

  // Add new generation to the beginning
  history.unshift(generation);

  // Keep only last 50 generations
  if (history.length > 50) {
    history = history.slice(0, 50);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  // Update user generation count
  const user = getOrCreateGuestUser();
  user.generationCount++;
  user.lastGenerationTime = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Get generation history
 */
export function getGenerationHistory(): Array<{
  id: string;
  prompt: string;
  imageUrl: string;
  type: 'text' | 'image' | 'multi';
  creditsUsed: number;
  createdAt: number;
}> {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse history:', error);
    return [];
  }
}

/**
 * Clear all guest data (for testing)
 */
export function clearGuestData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CREDITS_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Check rate limiting for guest users
 */
export function checkRateLimit(): { allowed: boolean; message?: string } {
  if (!MVP_CONFIG.rateLimiting.enabled) {
    return { allowed: true };
  }

  const user = getOrCreateGuestUser();
  const now = Date.now();

  if (!user.lastGenerationTime) {
    return { allowed: true };
  }

  const timeSinceLastGen = now - user.lastGenerationTime;
  const oneHour = 60 * 60 * 1000;

  // Simple rate limiting: max 10 generations per hour
  if (timeSinceLastGen < oneHour && user.generationCount % 10 === 0) {
    return {
      allowed: false,
      message: 'Rate limit reached. Please wait before generating more images.',
    };
  }

  return { allowed: true };
}

/**
 * Check if generation toast should be shown (after 5th generation)
 * Returns true only once per session
 */
const TOAST_SHOWN_KEY = `${MVP_CONFIG.guest.storagePrefix}toast_shown`;
const GENERATION_TOAST_THRESHOLD = 5;

export function shouldShowGenerationToast(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if toast has already been shown
  const hasShown = sessionStorage.getItem(TOAST_SHOWN_KEY);
  if (hasShown) return false;

  const user = getOrCreateGuestUser();

  // Show toast exactly at 5th generation
  if (user.generationCount === GENERATION_TOAST_THRESHOLD) {
    sessionStorage.setItem(TOAST_SHOWN_KEY, 'true');
    return true;
  }

  return false;
}

/**
 * Get current generation count
 */
export function getGenerationCount(): number {
  if (typeof window === 'undefined') return 0;

  const user = getOrCreateGuestUser();
  return user.generationCount;
}
