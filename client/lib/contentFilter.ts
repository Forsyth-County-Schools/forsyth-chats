import { checkProfanity, Filter } from 'glin-profanity';
import { addWarning, isUserMuted } from './userModeration';

// Initialize the profanity filter with school-appropriate settings
const profanityFilter = new Filter({
  replaceWith: '***',
  detectLeetspeak: true,
  languages: ['english'],
});

// Additional school-specific blocked terms
const schoolBlockedTerms = [
  // Drugs/alcohol references
  'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'drugs', 'stoned', 'high',
  // Violence/weapons
  'kill', 'murder', 'gun', 'knife', 'weapon', 'shoot', 'bomb', 'terrorist',
  // Inappropriate content for schools
  'sex', 'nude', 'naked', 'porn', 'nsfw', 'xxx', 'adult',
  // Bullying/hate terms
  'hate', 'racist', 'nazi', 'kkk', 'slur',
];

// URL patterns to block
const blockedUrlPatterns = [
  /pornhub\.com/i,
  /xvideos\.com/i,
  /xnxx\.com/i,
  /xhamster\.com/i,
  /redtube\.com/i,
  /youporn\.com/i,
  /onlyfans\.com/i,
  /adult\.friendfinder\.com/i,
  /ashley madison/i,
  /nsfw/i,
  /xxx/i,
];

export interface ContentFilterResult {
  isClean: boolean;
  filteredContent?: string;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
  shouldBlock: boolean;
  warningAdded?: boolean;
  userMuted?: boolean;
  muteExpiry?: number;
}

/**
 * Comprehensive content filtering for classroom chat
 * Filters profanity, inappropriate content, and blocked URLs
 */
export function filterContent(content: string): ContentFilterResult {
  const violations: string[] = [];
  let filteredContent = content;
  let shouldBlock = false;

  // Check for profanity using glin-profanity
  const profanityResult = profanityFilter.checkProfanity(content);
  
  if (profanityResult.containsProfanity) {
    violations.push('profanity');
    filteredContent = profanityResult.processedText || content;
  }

  // Check for school-specific blocked terms
  const lowerContent = content.toLowerCase();
  const foundBlockedTerms = schoolBlockedTerms.filter(term => 
    lowerContent.includes(term.toLowerCase())
  );

  if (foundBlockedTerms.length > 0) {
    violations.push('inappropriate_content');
    shouldBlock = true;
    
    // Replace blocked terms
    foundBlockedTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      filteredContent = filteredContent.replace(regex, '***');
    });
  }

  // Check for blocked URLs
  const urls = extractUrls(content);
  const blockedUrls = urls.filter(url => 
    blockedUrlPatterns.some(pattern => pattern.test(url))
  );

  if (blockedUrls.length > 0) {
    violations.push('blocked_url');
    shouldBlock = true;
    
    // Remove blocked URLs
    blockedUrls.forEach(url => {
      filteredContent = filteredContent.replace(url, '[BLOCKED URL]');
    });
  }

  // Check for excessive repetition (spam)
  if (isExcessiveRepetition(content)) {
    violations.push('spam');
    shouldBlock = true;
  }

  // Check for personal information (basic PII detection)
  if (containsPersonalInfo(content)) {
    violations.push('personal_info');
    shouldBlock = true;
  }

  // Determine severity and handle warnings
  let severity: 'low' | 'medium' | 'high' = 'low';
  let warningAdded = false;
  let userMuted = false;
  let muteExpiry: number | undefined;

  if (shouldBlock || violations.includes('inappropriate_content') || violations.includes('blocked_url')) {
    severity = 'high';
    
    // Add warning for serious violations
    const warningResult = addWarning();
    warningAdded = true;
    userMuted = warningResult.isMuted;
    muteExpiry = warningResult.muteExpiry;
    
    // If user is now muted, block the content
    if (userMuted) {
      shouldBlock = true;
    }
  } else if (violations.length > 1) {
    severity = 'medium';
  } else if (violations.length > 0) {
    severity = 'low';
  }

  return {
    isClean: violations.length === 0,
    filteredContent: violations.length > 0 ? filteredContent : content,
    violations,
    severity,
    shouldBlock,
    warningAdded,
    userMuted,
    muteExpiry
  };
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.match(urlPattern) || [];
}

/**
 * Check for excessive repetition (spam detection)
 */
function isExcessiveRepetition(content: string): boolean {
  // Check for same character repeated 5+ times
  if (/(.)\1{4,}/.test(content)) {
    return true;
  }

  // Check for same word repeated 3+ times
  const words = content.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 2) { // Ignore short words
      wordCount[word] = (wordCount[word] || 0) + 1;
      if (wordCount[word] >= 3) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Basic PII detection for phone numbers, emails, addresses
 */
function containsPersonalInfo(content: string): boolean {
  // Phone number patterns
  const phonePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // 123-456-7890
    /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/, // (123) 456-7890
  ];

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

  // Address patterns (basic)
  const addressPatterns = [
    /\d+\s+.*\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|way|place|pl)/i,
  ];

  return [
    ...phonePatterns,
    emailPattern,
    ...addressPatterns
  ].some(pattern => pattern.test(content));
}

/**
 * Real-time content validation for chat input
 */
export function validateContentRealtime(content: string): {
  isValid: boolean;
  warning?: string;
  suggestions?: string[];
  userMuted?: boolean;
  muteExpiry?: number;
} {
  // Check if user is muted first
  if (isUserMuted()) {
    return {
      isValid: false,
      warning: 'You are currently muted and cannot send messages.',
      suggestions: ['Your mute will expire after the designated time period.']
    };
  }

  const result = filterContent(content);
  
  if (result.shouldBlock) {
    if (result.userMuted) {
      return {
        isValid: false,
        warning: `You have been muted for 24 hours due to repeated violations. Mute expires: ${new Date(result.muteExpiry || 0).toLocaleString()}`,
        suggestions: ['Please review the community guidelines and wait for your mute to expire.'],
        userMuted: true,
        muteExpiry: result.muteExpiry
      };
    }
    
    return {
      isValid: false,
      warning: result.warningAdded 
        ? `Warning added! This is your ${result.userMuted ? 'final' : 'latest'} warning. ${result.userMuted ? 'You have been muted for 24 hours.' : `3 warnings result in a 24-hour mute.`}`
        : 'This message contains inappropriate content and cannot be sent.',
      suggestions: ['Please keep conversations respectful and school-appropriate.']
    };
  }

  if (!result.isClean) {
    return {
      isValid: true,
      warning: result.warningAdded 
        ? `Warning added! Some words were filtered. This is warning #${result.userMuted ? '3 (final)' : 'of 3'}.`
        : 'Some words were filtered. Your message will be sent with replacements.',
      suggestions: ['Consider using more appropriate language.']
    };
  }

  return { isValid: true };
}

/**
 * Filter message attachments for inappropriate content
 */
export function filterAttachment(fileName: string, fileType: string): {
  isAllowed: boolean;
  reason?: string;
} {
  const blockedExtensions = ['.exe', '.bat', '.cmd', '.scr', '.zip', '.rar', '.7z'];
  const blockedMimeTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program',
  ];

  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (blockedExtensions.includes(fileExtension)) {
    return {
      isAllowed: false,
      reason: 'Executable files are not allowed for security reasons.'
    };
  }

  if (blockedMimeTypes.includes(fileType)) {
    return {
      isAllowed: false,
      reason: 'This file type is not allowed.'
    };
  }

  // Check for inappropriate file names
  const fileNameCheck = filterContent(fileName);
  if (!fileNameCheck.isClean) {
    return {
      isAllowed: false,
      reason: 'File name contains inappropriate content.'
    };
  }

  return { isAllowed: true };
}
