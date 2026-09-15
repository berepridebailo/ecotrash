import type { RecyclingPoint, PointType } from '../supabase'

interface TypeConfigItem {
  label: string
  emoji: string
  color: string
  bg: string
}

interface PointDetailProps {
  point: RecyclingPoint
  onClose: () => void
  typeConfig: Record<PointType, TypeConfigItem>
  userLocation: [number, number] | null
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

export function PointDetail({ point, onClose, typeConfig, userLocation }: PointDetailProps) {
  const config = typeConfig[point.type]
  const distance = userLocation
    ? haversineDistance(userLocation[0], userLocation[1], point.latitude, point.longitude)
    : null

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`

  return (
    <aside
      className="animate-slide-in-right"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        maxWidth: '100%',
        background: 'var(--color-neutral-0)',
        borderLeft: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 800,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--color-neutral-100)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {config.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>
            {point.name}
          </h2>
          <span
            style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 8,
              background: config.bg,
              color: config.color,
            }}
          >
            {config.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-600)',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-neutral-200)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-neutral-100)')}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Address */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Dirección
          </div>
          <div style={{ fontSize: 15, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
            📍 {point.address}
          </div>
        </div>

        {/* Distance */}
        {distance !== null && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Distancia desde tu ubicación
            </div>
            <div style={{ fontSize: 15, color: 'var(--color-neutral-800)' }}>
              {distance < 1 ? `${Math.round(distance * 1000)} metros` : `${distance.toFixed(1)} km`}
            </div>
          </div>
        )}

        {/* Schedule */}
        {point.schedule && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Horarios
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--color-neutral-800)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-100)',
              }}
            >
              🕐 {point.schedule}
            </div>
          </div>
        )}

        {/* Accepted materials */}
        {point.accepted_materials && point.accepted_materials.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Materiales aceptados
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {point.accepted_materials.map((material) => (
                <span
                  key={material}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-primary-50)',
                    color: 'var(--color-primary-700)',
                    border: '1px solid var(--color-primary-200)',
                  }}
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {point.notes && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Información de uso
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
              {point.notes}
            </div>
          </div>
        )}

        {/* Directions button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-600)',
            color: 'white',
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 700,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-700)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary-600)')}
        >
          🧭 Cómo llegar
        </a>
      </div>
    </aside>
  )
}
