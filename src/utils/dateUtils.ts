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
