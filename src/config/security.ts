// SECURITY: Central security configuration
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    WEAK_PATTERNS: ['password', '123456', 'qwerty', 'admin', 'welcome', 'login']
  },

  // Input validation
  INPUT: {
    MAX_LENGTH: 1000,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 254,
    CODE_MAX_LENGTH: 20
  },

  // File upload security
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.csv'],
    ALLOWED_MIME_TYPES: ['text/csv', 'application/csv']
  },

  // Session security
  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_INTERVAL: 60 * 60 * 1000 // 1 hour
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000 // 15 minutes
  }
};

// Security headers for enhanced protection
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Content Security Policy
export const CSP_POLICY = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https://*.supabase.co",
  'frame-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'"
};