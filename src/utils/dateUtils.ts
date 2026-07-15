function endOfDeadlineDay(deadline: string): Date {
  return new Date(`${deadline}T23:59:59`)
}

export function isOverdue(deadline: string): boolean {
  return endOfDeadlineDay(deadline).getTime() < Date.now()
}

export function isWithin24h(deadline: string): boolean {
  const end = endOfDeadlineDay(deadline).getTime()
  const now = Date.now()
  return end >= now && end <= now + 24 * 60 * 60 * 1000
}

// No lower bound on purpose: a deadline is "within N days" as long as it
// falls on or before today+N, so deadlines already in the past (overdue
// actions) are always included regardless of N.
export function isDeadlineWithinDays(deadline: string, days: number): boolean {
  const limit = new Date()
  limit.setDate(limit.getDate() + days)
  limit.setHours(23, 59, 59, 999)
  return endOfDeadlineDay(deadline).getTime() <= limit.getTime()
}

export function formatDeadlineShort(deadline: string): string {
  const date = new Date(`${deadline}T00:00:00`)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

export function formatDeadlineLong(deadline: string): string {
  const date = new Date(`${deadline}T00:00:00`)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export function getTodayISODate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
