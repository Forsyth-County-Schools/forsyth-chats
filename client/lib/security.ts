'use client';

import { useState, useEffect } from 'react';
import { filterContent } from './contentFilter';

interface RateLimitState {
  messageCount: number;
  lastReset: number;
}

const MESSAGE_LIMIT = 20; // messages
const TIME_WINDOW = 10000; // 10 seconds
const STORAGE_KEY = 'chat_rate_limit';

export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitState>({ 
    messageCount: 0, 
    lastReset: Date.now() 
  });

  useEffect(() => {
    // Load rate limit state from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Reset if time window has passed
        if (now - data.lastReset > TIME_WINDOW) {
          const resetData = { messageCount: 0, lastReset: now };
          setRateLimitInfo(resetData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        } else {
          setRateLimitInfo(data);
          setIsRateLimited(data.messageCount >= MESSAGE_LIMIT);
        }
      }
    }
  }, []);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    let currentState = rateLimitInfo;

    // Reset counter if time window has passed
    if (now - currentState.lastReset > TIME_WINDOW) {
      currentState = { messageCount: 0, lastReset: now };
      setRateLimitInfo(currentState);
      setIsRateLimited(false);
    }

    // Check if user has exceeded limit
    if (currentState.messageCount >= MESSAGE_LIMIT) {
      setIsRateLimited(true);
      return false; // Rate limited
    }

    return true; // Not rate limited
  };

  const recordMessage = (): void => {
    const now = Date.now();
    let newState = { ...rateLimitInfo };

    // Reset if time window passed
    if (now - newState.lastReset > TIME_WINDOW) {
      newState = { messageCount: 1, lastReset: now };
    } else {
      newState.messageCount += 1;
    }

    setRateLimitInfo(newState);
    setIsRateLimited(newState.messageCount >= MESSAGE_LIMIT);

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  const getRemainingMessages = (): number => {
    return Math.max(0, MESSAGE_LIMIT - rateLimitInfo.messageCount);
  };

  const getResetTimeRemaining = (): number => {
    const elapsed = Date.now() - rateLimitInfo.lastReset;
    return Math.max(0, TIME_WINDOW - elapsed);
  };

  return {
    isRateLimited,
    checkRateLimit,
    recordMessage,
    getRemainingMessages,
    getResetTimeRemaining: () => Math.ceil(getResetTimeRemaining() / 1000), // in seconds
  };
}

export function validateUserName(name: string): { isValid: boolean; error?: string } {
  const trimmedName = name.trim();
  
  // Length validation
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 30) {
    return { isValid: false, error: 'Name must be 30 characters or less' };
  }

  // Only allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-.']+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  // Comprehensive content check
  const nameValidation = filterContent(trimmedName);
  if (!nameValidation.isClean || nameValidation.shouldBlock) {
    return { isValid: false, error: 'Please choose an appropriate name for school use' };
  }

  return { isValid: true };
}

// Sanitize chat messages with comprehensive filtering
export function sanitizeMessage(message: string): string {
  const sanitized = message
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 500); // Limit length

  // Apply comprehensive content filtering
  const filterResult = filterContent(sanitized);
  return filterResult.filteredContent || sanitized;
}