export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function dateKey(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateTime(value) {
  if (!value) return null
  if (value instanceof Date) return value
  return new Date(String(value).replace(' ', 'T'))
}

export function splitDateTime(value) {
  const date = parseDateTime(value)
  if (!date || Number.isNaN(date.getTime())) {
    return { date: '', time: '' }
  }
  const pad = (part) => String(part).padStart(2, '0')
  return {
    date: dateKey(date),
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

export function combineDateTime(date, time) {
  return `${date} ${time}:00`
}

export function formatDateTime(value) {
  const date = parseDateTime(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDayLabel(key) {
  const date = parseDateTime(`${key} 00:00:00`)
  if (!date || Number.isNaN(date.getTime())) return key
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function eventOccursOn(event, day) {
  const start = parseDateTime(event.start_time)
  const end = parseDateTime(event.end_time)
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
  return start <= dayEnd && end >= dayStart
}

export function buildMonthCells(year, month, events) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let offset = firstWeekday; offset > 0; offset -= 1) {
    const date = new Date(year, month, 1 - offset)
    cells.push({ key: `pad-start-${dateKey(date)}`, day: date.getDate(), muted: true, events: [] })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({
      key: dateKey(date),
      day,
      muted: false,
      events: events.filter((event) => eventOccursOn(event, date)),
    })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  for (let extra = 1; extra <= trailing; extra += 1) {
    const date = new Date(year, month, daysInMonth + extra)
    cells.push({ key: `pad-end-${dateKey(date)}`, day: date.getDate(), muted: true, events: [] })
  }

  return cells
}

export function recurrenceLabel(rule) {
  if (!rule) return 'Does not repeat'
  if (rule === 'FREQ=WEEKLY') return 'Weekly'
  if (rule === 'FREQ=MONTHLY') return 'Monthly'
  return rule
}
