// field names follow the API: GET /api/security/settings
export type SecuritySettings = {
  minPasswordLength: number
  idleTimeoutMinutes: number
  absoluteTimeoutHours: number
  otpExpiryMinutes: number
}

// SAMPLE ONLY: replaced by GET /api/security/settings later
export const SAMPLE_SETTINGS: SecuritySettings = {
  minPasswordLength: 8,
  idleTimeoutMinutes: 30,
  absoluteTimeoutHours: 12,
  otpExpiryMinutes: 5,
}

// our own limits, the API does not set any
export const LIMITS = {
  minPasswordLength: { min: 8, max: 32 },
  idleTimeoutMinutes: { min: 5, max: 120 },
  absoluteTimeoutHours: { min: 1, max: 24 },
  otpExpiryMinutes: { min: 1, max: 15 },
}