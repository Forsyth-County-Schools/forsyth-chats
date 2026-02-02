'use client';

import { filterContent } from './contentFilter';

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