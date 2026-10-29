// SAMPLE ONLY: drafts are kept in this browser. The real ones come from
// GET /api/loan-applications/latest?applicantId= and are saved with PUT /api/loan-applications/{id}/progress

const KEY = 'fundora-loan-drafts-v1'

export type Draft<T> = {
  applicantId: string
  /** the step to reopen on */
  stepId: string
  stepLabel: string
  savedAt: string // ISO date-time
  values: T
}

function readAll(): Record<string, Draft<unknown>> {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, Draft<unknown>>)
      : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Draft<unknown>>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // storage can be full or blocked, the wizard still works for this session
  }
}

export function loadDraft<T>(applicantId: string): Draft<T> | null {
  return (readAll()[applicantId] as Draft<T> | undefined) ?? null
}

export function saveDraft<T>(draft: Draft<T>) {
  writeAll({ ...readAll(), [draft.applicantId]: draft })
}

export function clearDraft(applicantId: string) {
  const all = readAll()
  delete all[applicantId]
  writeAll(all)
}

export const allDrafts = () => Object.values(readAll())