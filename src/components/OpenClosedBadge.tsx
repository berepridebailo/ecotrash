import type { ScheduleInfo } from '../utils/scheduleParser'

interface OpenClosedBadgeProps {
  scheduleInfo: ScheduleInfo
}

export function OpenClosedBadge({ scheduleInfo }: OpenClosedBadgeProps) {
  if (!scheduleInfo.hasSchedule) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 8,
          background: 'var(--color-neutral-100)',
          color: 'var(--color-neutral-500)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-neutral-400)' }} />
        Sin horario informado
      </span>
    )
  }

  const isOpen = scheduleInfo.isOpen
  const color = isOpen ? 'var(--color-success-500)' : 'var(--color-error-500)'
  const bg = isOpen ? 'var(--color-primary-50)' : '#fef2f2'
  const textColor = isOpen ? 'var(--color-success-600)' : 'var(--color-error-600)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 8,
        background: bg,
        color: textColor,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {isOpen ? 'Abierto ahora' : 'Cerrado'}
    </span>
  )
}
