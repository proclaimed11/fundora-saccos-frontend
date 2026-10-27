// field names follow the API: GET /api/notifications
export type NotificationStatus = 'SENT' | 'READ'
export type NotificationChannel = 'EMAIL' | 'SMS'
export type EventType =
  | 'OTP'
  | 'REPAYMENT_REMINDER'
  | 'OVERDUE_REMINDER'
  | 'CONTRACT_SENT'
  | 'PASSWORD_RESET'
  | 'TWO_FACTOR'

export type AppNotification = {
  id: number
  applicantId: number | null // null for staff notifications
  loanId: number | null
  eventType: EventType
  channel: NotificationChannel
  recipient: string
  message: string
  status: NotificationStatus
  sentAt: string // ISO date-time
}

export const STATUS: Record<NotificationStatus, { label: string; color: string }> = {
  SENT: { label: 'Unread', color: 'yellow' },
  READ: { label: 'Read', color: 'gray' },
}

export const CHANNEL: Record<NotificationChannel, { label: string; icon: string }> = {
  EMAIL: { label: 'Email', icon: 'mail' },
  SMS: { label: 'SMS', icon: 'smartphone' },
}

// the event types are our assumption, the API example only shows TEST
export const EVENT: Record<EventType, { label: string; icon: string }> = {
  OTP: { label: 'Applicant verification code', icon: 'shield' },
  REPAYMENT_REMINDER: { label: 'Repayment reminder', icon: 'calendar-days' },
  OVERDUE_REMINDER: { label: 'Overdue reminder', icon: 'triangle-alert' },
  CONTRACT_SENT: { label: 'Contract sent', icon: 'file-text' },
  PASSWORD_RESET: { label: 'Password reset code', icon: 'key-round' },
  TWO_FACTOR: { label: 'Sign-in code', icon: 'lock-keyhole' },
}

// SAMPLE ONLY: replaced by GET /api/notifications later
export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  { id: 1, applicantId: null, loanId: null, eventType: 'TWO_FACTOR', channel: 'EMAIL', recipient: 'admin@fundora.co.tz', message: 'A sign-in code was sent. It expires in 5 minutes and works once.', status: 'SENT', sentAt: '2026-10-27T08:30:00' },
  { id: 2, applicantId: 6, loanId: 6, eventType: 'REPAYMENT_REMINDER', channel: 'EMAIL', recipient: 'neema@example.com', message: 'Your installment on LN-0006 is due soon. Please pay on time to avoid a penalty.', status: 'SENT', sentAt: '2026-10-27T06:00:00' },
  { id: 3, applicantId: 1, loanId: 7, eventType: 'OVERDUE_REMINDER', channel: 'EMAIL', recipient: 'john@example.com', message: 'Your installment on LN-0007 is overdue. Please make a payment as soon as possible.', status: 'SENT', sentAt: '2026-10-26T06:00:00' },
  { id: 4, applicantId: 2, loanId: 5, eventType: 'OVERDUE_REMINDER', channel: 'EMAIL', recipient: 'amina@example.com', message: 'Your installment on LN-0005 is overdue. Please make a payment as soon as possible.', status: 'SENT', sentAt: '2026-10-26T06:00:00' },
  { id: 5, applicantId: 2, loanId: 5, eventType: 'OVERDUE_REMINDER', channel: 'EMAIL', recipient: 'amina@example.com', message: 'Your installment on LN-0005 is overdue. Please make a payment as soon as possible.', status: 'READ', sentAt: '2026-10-25T06:00:00' },
  { id: 6, applicantId: null, loanId: null, eventType: 'PASSWORD_RESET', channel: 'EMAIL', recipient: 'admin@fundora.co.tz', message: 'A password reset code was sent. It expires in 5 minutes and works once.', status: 'READ', sentAt: '2026-10-15T14:12:00' },
  { id: 7, applicantId: 1, loanId: null, eventType: 'CONTRACT_SENT', channel: 'EMAIL', recipient: 'john@example.com', message: 'Your loan contract is ready. Print it, sign it and return the hard copy to our office.', status: 'READ', sentAt: '2026-10-07T09:40:00' },
  { id: 8, applicantId: 3, loanId: null, eventType: 'OTP', channel: 'EMAIL', recipient: 'peter@example.com', message: 'A verification code was sent. It expires in 5 minutes and works once.', status: 'READ', sentAt: '2026-09-14T10:05:00' },
  { id: 9, applicantId: 2, loanId: null, eventType: 'OTP', channel: 'EMAIL', recipient: 'amina@example.com', message: 'A verification code was sent. It expires in 5 minutes and works once.', status: 'READ', sentAt: '2026-09-02T11:20:00' },
]