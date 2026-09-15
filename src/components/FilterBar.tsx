import type { PointType } from '../supabase'

interface TypeConfigItem {
  label: string
  emoji: string
  color: string
  bg: string
}

interface FilterBarProps {
  activeFilters: Set<PointType>
  toggleFilter: (type: PointType) => void
  counts: Record<string, number>
  typeConfig: Record<PointType, TypeConfigItem>
}

export function FilterBar({ activeFilters, toggleFilter, counts, typeConfig }: FilterBarProps) {
  const types: PointType[] = ['recycling', 'trash', 'compost', 'hazardous']

  return (
    <div
      style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-neutral-200)',
        background: 'var(--color-neutral-50)',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Filtrar por tipo
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {types.map((type) => {
          const config = typeConfig[type]
          const isActive = activeFilters.has(type)
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-xl)',
                border: `2px solid ${isActive ? config.color : 'var(--color-neutral-200)'}`,
                background: isActive ? config.color : 'var(--color-neutral-0)',
                color: isActive ? 'white' : 'var(--color-neutral-600)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <span style={{ fontSize: 16 }}>{config.emoji}</span>
              {config.label}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-neutral-100)',
                  color: isActive ? 'white' : 'var(--color-neutral-500)',
                }}
              >
                {counts[type] ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
