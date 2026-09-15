export interface ScheduleInfo {
  isOpen: boolean
  isAlwaysOpen: boolean
  hasSchedule: boolean
  detail: string
}

const DAY_MAP: Record<string, number> = {
  dom: 0, domingo: 0,
  lun: 1, lunes: 1,
  mar: 2, martes: 2,
  mie: 3, miercoles: 3, mié: 3,
  jue: 4, jueves: 4,
  vie: 5, viernes: 5,
  sab: 6, sabado: 6, sáb: 6,
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
}

function parseDayRange(part: string): number[] {
  const days: number[] = []
  const tokens = part.split('-').map((t) => t.trim())
  if (tokens.length === 1) {
    const d = DAY_MAP[tokens[0]]
    if (d !== undefined) days.push(d)
  } else if (tokens.length === 2) {
    const start = DAY_MAP[tokens[0]]
    const end = DAY_MAP[tokens[1]]
    if (start !== undefined && end !== undefined) {
      let cur = start
      while (cur !== end) {
        days.push(cur)
        cur = (cur + 1) % 7
      }
      days.push(end)
    }
  }
  return days
}

function parseTimeRange(part: string): { startH: number; startM: number; endH: number; endM: number } | null {
  const m = part.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!m) return null
  return {
    startH: parseInt(m[1], 10),
    startM: parseInt(m[2], 10),
    endH: parseInt(m[3], 10),
    endM: parseInt(m[4], 10),
  }
}

export function getScheduleInfo(schedule: string | null, now: Date = new Date()): ScheduleInfo {
  if (!schedule || schedule.trim() === '') {
    return { isOpen: false, isAlwaysOpen: false, hasSchedule: false, detail: '' }
  }

  const normalized = normalize(schedule)

  if (normalized.includes('24 hs') || normalized.includes('24hs') || normalized.includes('24 horas')) {
    return { isOpen: true, isAlwaysOpen: true, hasSchedule: true, detail: 'Abierto 24 horas' }
  }

  if (normalized.includes('todos los dias')) {
    const timeMatch = normalized.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      const startH = parseInt(timeMatch[1], 10)
      const startM = parseInt(timeMatch[2], 10)
      const endH = parseInt(timeMatch[3], 10)
      const endM = parseInt(timeMatch[4], 10)
      const currentMin = now.getHours() * 60 + now.getMinutes()
      const startMin = startH * 60 + startM
      const endMin = endH * 60 + endM
      const open = currentMin >= startMin && currentMin <= endMin
      return {
        isOpen: open,
        isAlwaysOpen: false,
        hasSchedule: true,
        detail: open
          ? `Abierto ahora · cierra a las ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
          : `Cerrado · abre a las ${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
      }
    }
  }

  const segments = normalized.split(',').map((s) => s.trim())
  const currentDay = now.getDay()
  const currentMin = now.getHours() * 60 + now.getMinutes()

  for (const seg of segments) {
    const timeMatch = parseTimeRange(seg)
    if (!timeMatch) continue

    const dayPart = seg.replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}.*$/, '').trim()
    const days = parseDayRange(dayPart)

    if (days.includes(currentDay)) {
      const startMin = timeMatch.startH * 60 + timeMatch.startM
      const endMin = timeMatch.endH * 60 + timeMatch.endM
      const open = currentMin >= startMin && currentMin <= endMin
      return {
        isOpen: open,
        isAlwaysOpen: false,
        hasSchedule: true,
        detail: open
          ? `Abierto ahora · cierra a las ${timeMatch.endH.toString().padStart(2, '0')}:${timeMatch.endM.toString().padStart(2, '0')}`
          : `Cerrado · abre a las ${timeMatch.startH.toString().padStart(2, '0')}:${timeMatch.startM.toString().padStart(2, '0')}`,
      }
    }
  }

  return {
    isOpen: false,
    isAlwaysOpen: false,
    hasSchedule: true,
    detail: 'Cerrado ahora',
  }
}
