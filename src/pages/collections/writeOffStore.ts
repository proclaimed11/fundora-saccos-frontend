import { SAMPLE_WRITE_OFFS, type WriteOffEntry } from './collectionsData'

// UI only: write-offs made in this session, kept while the app stays open so every page sees them.
// The real record comes from POST /api/collections-workflow/loans/{loanId}/write-off
let made: WriteOffEntry[] = []

export const allWriteOffs = (): WriteOffEntry[] => [...made, ...SAMPLE_WRITE_OFFS]

export const writeOffFor = (loanId: number): WriteOffEntry | null =>
  allWriteOffs().find((w) => w.loanId === loanId) ?? null

export const nextWriteOffId = () => Math.max(0, ...allWriteOffs().map((w) => w.id)) + 1

export function saveWriteOff(entry: WriteOffEntry) {
  made = [entry, ...made.filter((w) => w.loanId !== entry.loanId)]
}