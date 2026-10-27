// field names follow the API: GET /api/company-profiles/current
export type CompanyProfile = {
  id: number
  companyName: string
  email: string
  phone: string
  location: string
  currency: string
  language: string
  contractTitle: string
  emailMessage: string
}

// SAMPLE ONLY: replaced by GET /api/company-profiles/current later
export const SAMPLE_PROFILE: CompanyProfile = {
  id: 1,
  companyName: 'Fundora Credit Solutions',
  email: 'support@fundora.co.tz',
  phone: '+255 700 000 000',
  location: 'Dar es Salaam, Tanzania',
  currency: 'TZS',
  language: 'English',
  contractTitle: 'LOAN AGREEMENT',
  emailMessage: 'Your contract is ready. Print it, sign it and return the hard copy to our office.',
}

export const CURRENCIES = [
  { value: 'TZS', label: 'TZS · Tanzanian shilling' },
  { value: 'USD', label: 'USD · US dollar' },
  { value: 'KES', label: 'KES · Kenyan shilling' },
]

export const LANGUAGES = ['English', 'Swahili']

export const EMAIL = /^\S+@\S+\.\S+$/

// +255 700 000 000 or 0700000000, spaces are ignored
export const isPhone = (value: string) => /^(\+255|0)\d{9}$/.test(value.replace(/\s+/g, ''))