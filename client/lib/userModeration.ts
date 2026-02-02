'use client';

import { useEffect, useState } from 'react';

interface ModerationState {
  warnings: number;
  isMuted: boolean;
  muteExpiry?: number;
  lastWarningTime?: number;
}

interface UserFingerprint {
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  colorDepth: number;
  pixelRatio: number;
}

const MAX_WARNINGS = 3;
const MUTE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY = 'forsyth_chat_moderation';
const FINGERPRINT_KEY = 'forsyth_chat_fingerprint';

/**
 * Generate a hardware-based fingerprint that's difficult to bypass
 */
export function generateHardwareFingerprint(): UserFingerprint {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Forsyth Chat Security', 2, 2);
  }
  
  const fingerprint = {
    fingerprint: btoa(
      [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        (navigator as unknown as { deviceMemory?: number }).deviceMemory || 'unknown',
        window.devicePixelRatio,
        canvas.toDataURL(),
        navigator.platform
      ].join('|')
    ),
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio
  };

  return fingerprint;
}

/**
 * Get the current user's hardware fingerprint
 */
export function getUserFingerprint(): string {
  // Try to get from multiple storage locations
  const storages = [
    () => localStorage.getItem(FINGERPRINT_KEY),
    () => sessionStorage.getItem(FINGERPRINT_KEY),
    () => getCookie(FINGERPRINT_KEY)
  ];

  for (const getStorage of storages) {
    const stored = getStorage();
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const current = generateHardwareFingerprint();
        
        // Verify the fingerprint still matches
        if (verifyFingerprintMatch(parsed, current)) {
          return parsed.fingerprint;
        }
      } catch {
        // Continue to next storage if parsing fails
      }
    }
  }

  // Generate new fingerprint if none found or invalid
  const newFingerprint = generateHardwareFingerprint();
  saveFingerprint(newFingerprint);
  return newFingerprint.fingerprint;
}

/**
 * Verify if two fingerprints match (with some tolerance for minor changes)
 */
function verifyFingerprintMatch(stored: UserFingerprint, current: UserFingerprint): boolean {
  return (
    stored.userAgent === current.userAgent &&
    stored.screenResolution === current.screenResolution &&
    stored.timezone === current.timezone &&
    stored.language === current.language &&
    stored.platform === current.platform &&
    Math.abs(stored.hardwareConcurrency - current.hardwareConcurrency) <= 2 &&
    Math.abs(stored.deviceMemory - current.deviceMemory) <= 2
  );
}

/**
 * Save fingerprint to multiple storage locations
 */
function saveFingerprint(fingerprint: UserFingerprint): void {
  const data = JSON.stringify(fingerprint);
  
  // Save to multiple locations to prevent bypass
  localStorage.setItem(FINGERPRINT_KEY, data);
  sessionStorage.setItem(FINGERPRINT_KEY, data);
  setCookie(FINGERPRINT_KEY, data, 365); // 1 year
}

/**
 * Get moderation state for the current user
 */
export function getModerationState(): ModerationState {
  const fingerprint = getUserFingerprint();
  const storages = [
    () => localStorage.getItem(STORAGE_KEY),
    () => sessionStorage.getItem(STORAGE_KEY),
    () => getCookie(STORAGE_KEY)
  ];

  for (const getStorage of storages) {
    const stored = getStorage();
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.fingerprint === fingerprint) {
          return {
            warnings: data.warnings || 0,
            isMuted: data.isMuted || false,
            muteExpiry: data.muteExpiry,
            lastWarningTime: data.lastWarningTime
          };
        }
      } catch {
        // Continue to next storage
      }
    }
  }

  return {
    warnings: 0,
    isMuted: false
  };
}

/**
 * Save moderation state to multiple storage locations
 */
function saveModerationState(state: ModerationState & { fingerprint: string }): void {
  const data = JSON.stringify(state);
  
  // Save to multiple locations
  localStorage.setItem(STORAGE_KEY, data);
  sessionStorage.setItem(STORAGE_KEY, data);
  setCookie(STORAGE_KEY, data, 365);
}

/**
 * Add a warning to the user's record
 */
export function addWarning(): {
  warnings: number;
  isMuted: boolean;
  muteExpiry?: number;
  isNewMute: boolean;
} {
  const fingerprint = getUserFingerprint();
  const currentState = getModerationState();
  
  const newWarnings = currentState.warnings + 1;
  let isMuted = currentState.isMuted;
  let muteExpiry = currentState.muteExpiry;
  let isNewMute = false;

  // Check if user should be muted
  if (newWarnings >= MAX_WARNINGS && !isMuted) {
    isMuted = true;
    muteExpiry = Date.now() + MUTE_DURATION;
    isNewMute = true;
  }

  const newState = {
    fingerprint,
    warnings: newWarnings,
    isMuted,
    muteExpiry,
    lastWarningTime: Date.now()
  };

  saveModerationState(newState);

  return {
    warnings: newWarnings,
    isMuted,
    muteExpiry,
    isNewMute
  };
}

/**
 * Check if user is currently muted
 */
export function isUserMuted(): boolean {
  const state = getModerationState();
  
  if (!state.isMuted) {
    return false;
  }

  // Check if mute has expired
  if (state.muteExpiry && Date.now() > state.muteExpiry) {
    // Mute expired, clear it
    clearMute();
    return false;
  }

  return true;
}

/**
 * Get remaining mute time in milliseconds
 */
export function getMuteTimeRemaining(): number {
  const state = getModerationState();
  
  if (!state.isMuted || !state.muteExpiry) {
    return 0;
  }

  const remaining = state.muteExpiry - Date.now();
  return Math.max(0, remaining);
}

/**
 * Clear user's mute (for admin use or when mute expires)
 */
export function clearMute(): void {
  const fingerprint = getUserFingerprint();
  const currentState = getModerationState();
  
  const newState = {
    fingerprint,
    warnings: currentState.warnings,
    isMuted: false,
    muteExpiry: undefined,
    lastWarningTime: currentState.lastWarningTime
  };

  saveModerationState(newState);
}

/**
 * Reset user's warnings (for admin use)
 */
export function resetWarnings(): void {
  const fingerprint = getUserFingerprint();
  
  const newState = {
    fingerprint,
    warnings: 0,
    isMuted: false,
    muteExpiry: undefined,
    lastWarningTime: undefined
  };

  saveModerationState(newState);
}

/**
 * Get cookie value
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

/**
 * Hook for using moderation state in React components
 */
export function useUserModeration() {
  const [isMuted, setIsMuted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [muteTimeRemaining, setMuteTimeRemaining] = useState(0);

  const updateState = () => {
    const state = getModerationState();
    const muted = isUserMuted();
    
    setIsMuted(muted);
    setWarnings(state.warnings);
    setMuteTimeRemaining(getMuteTimeRemaining());
  };

  useEffect(() => {
    // Initial check
    updateState();

    // Check every second for mute expiry
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isMuted,
    warnings,
    muteTimeRemaining,
    warningsRemaining: MAX_WARNINGS - warnings,
    addWarning,
    clearMute: () => {
      clearMute();
      updateState();
    }
  };
}

/**
 * Format remaining mute time for display
 */
export function formatMuteTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Not muted';

  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'Less than 1m';
  }
}
