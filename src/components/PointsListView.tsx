import { useState, useMemo } from 'react'
import type { RecyclingPoint, PointType } from '../supabase'
import { getScheduleInfo } from '../utils/scheduleParser'

interface TypeConfigItem {
  label: string
  emoji: string
  color: string
  bg: string
}

interface PointsListViewProps {
  points: RecyclingPoint[]
  loading: boolean
  error: string | null
  userLocation: [number, number] | null
  typeConfig: Record<PointType, TypeConfigItem>
  onSelect: (point: RecyclingPoint) => void
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

type SortKey = 'distance' | 'name' | 'status'

export function PointsListView({ points, loading, error, userLocation, typeConfig, onSelect }: PointsListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('distance')
  const [filterType, setFilterType] = useState<PointType | 'all'>('all')

  const sortedPoints = useMemo(() => {
    let list = filterType === 'all' ? [...points] : points.filter((p) => p.type === filterType)
    list.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      if (sortKey === 'status') {
        const sa = getScheduleInfo(a.schedule)
        const sb = getScheduleInfo(b.schedule)
        if (sa.isOpen && !sb.isOpen) return -1
        if (!sa.isOpen && sb.isOpen) return 1
        return a.name.localeCompare(b.name)
      }
      if (userLocation) {
        const da = haversineDistance(userLocation[0], userLocation[1], a.latitude, a.longitude)
        const db = haversineDistance(userLocation[0], userLocation[1], b.latitude, b.longitude)
        return da - db
      }
      return a.name.localeCompare(b.name)
    })
    return list
  }, [points, filterType, sortKey, userLocation])

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-neutral-50)' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-error-500)', fontSize: 14, background: 'var(--color-neutral-50)', height: '100%' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--color-neutral-50)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 40px' }}>
        {/* Title */}
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: 4 }}>
          Puntos de Reciclaje y Basura
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 20 }}>
          {points.length} puntos en Viedma · ordenados por{' '}
          {sortKey === 'distance' ? 'distancia' : sortKey === 'name' ? 'nombre' : 'estado'}
        </p>

        {/* Filters & sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xl)',
                border: `1px solid ${filterType === 'all' ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                background: filterType === 'all' ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                color: filterType === 'all' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Todos
            </button>
            {(Object.keys(typeConfig) as PointType[]).map((type) => {
              const cfg = typeConfig[type]
              const isActive = filterType === type
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(isActive ? 'all' : type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-xl)',
                    border: `1px solid ${isActive ? cfg.color : 'var(--color-neutral-200)'}`,
                    background: isActive ? cfg.bg : 'var(--color-neutral-0)',
                    color: isActive ? cfg.color : 'var(--color-neutral-600)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              )
            })}
          </div>
          {/* Sort dropdown */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-neutral-200)',
              background: 'var(--color-neutral-0)',
              color: 'var(--color-neutral-700)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="distance">Ordenar por distancia</option>
            <option value="name">Ordenar por nombre</option>
            <option value="status">Ordenar por estado</option>
          </select>
        </div>

        {/* List */}
        {sortedPoints.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--color-neutral-500)',
              fontSize: 14,
              background: 'var(--color-neutral-0)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-neutral-200)',
            }}
          >
            No hay puntos que coincidan con el filtro seleccionado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedPoints.map((point) => {
              const config = typeConfig[point.type]
              const si = getScheduleInfo(point.schedule)
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
                    gap: 14,
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-neutral-0)',
                    border: '1px solid var(--color-neutral-200)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-neutral-300)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-neutral-200)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Emoji marker */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {config.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                        {point.name}
                      </span>
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
                    </div>

                    {/* Address */}
                    <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      📍 {point.address}
                    </div>

                    {/* Schedule */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      {si.hasSchedule ? (
                        <>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              color: si.isOpen ? 'var(--color-success-600)' : 'var(--color-error-600)',
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: si.isOpen ? 'var(--color-success-500)' : 'var(--color-error-500)',
                              }}
                            />
                            {si.isOpen ? 'Abierto' : 'Cerrado'}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                            🕐 {point.schedule}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                          Sin horario informado
                        </span>
                      )}
                    </div>

                    {/* Distance */}
                    {distance !== null && (
                      <div style={{ fontSize: 12, color: 'var(--color-secondary-600)', fontWeight: 600 }}>
                        📏 {formatDistance(distance)} desde tu ubicación
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
