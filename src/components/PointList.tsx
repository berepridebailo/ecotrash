import type { RecyclingPoint, PointType } from '../supabase'

interface TypeConfigItem {
  label: string
  emoji: string
  color: string
  bg: string
}

interface PointListProps {
  points: RecyclingPoint[]
  loading: boolean
  error: string | null
  selectedPoint: RecyclingPoint | null
  onSelect: (point: RecyclingPoint) => void
  userLocation: [number, number] | null
  typeConfig: Record<PointType, TypeConfigItem>
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function PointList({
  points,
  loading,
  error,
  selectedPoint,
  onSelect,
  userLocation,
  typeConfig,
}: PointListProps) {
  const sortedPoints = [...points].sort((a, b) => {
    if (userLocation) {
      const distA = haversineDistance(userLocation[0], userLocation[1], a.latitude, a.longitude)
      const distB = haversineDistance(userLocation[0], userLocation[1], b.latitude, b.longitude)
      return distA - distB
    }
    return a.name.localeCompare(b.name)
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, flex: 1 }}>
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-error-500)', fontSize: 14 }}>
        {error}
      </div>
    )
  }

  if (sortedPoints.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: 14 }}>
        No hay puntos que coincidan con los filtros seleccionados.
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
      {sortedPoints.map((point) => {
        const config = typeConfig[point.type]
        const isSelected = selectedPoint?.id === point.id
        const distance = userLocation
          ? haversineDistance(userLocation[0], userLocation[1], point.latitude, point.longitude)
          : null

        return (
          <div
            key={point.id}
            onClick={() => onSelect(point)}
            className="animate-fade-in-up"
            style={{
              display: 'flex',
              gap: 12,
              padding: 12,
              marginBottom: 4,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: isSelected ? config.bg : 'transparent',
              border: isSelected ? `2px solid ${config.color}` : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = 'var(--color-neutral-100)'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = 'transparent'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {config.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {point.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                📍 {point.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: config.bg,
                    color: config.color,
                  }}
                >
                  {config.label}
                </span>
                {distance !== null && (
                  <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                    {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
