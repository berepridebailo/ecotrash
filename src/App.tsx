import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase, type RecyclingPoint, type PointType } from './supabase'
import { getScheduleInfo } from './utils/scheduleParser'
import { FilterBar } from './components/FilterBar'
import { PointDetail } from './components/PointDetail'
import { PointList } from './components/PointList'
import { InfoView } from './components/InfoView'

const VIEDMA_CENTER: [number, number] = [-40.8135, -62.9965]

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TYPE_CONFIG: Record<PointType, { label: string; emoji: string; color: string; bg: string }> = {
  recycling: { label: 'Reciclaje', emoji: '♻️', color: '#059669', bg: '#d1fae5' },
  trash: { label: 'Basura', emoji: '🗑️', color: '#64748b', bg: '#e2e8f0' },
  compost: { label: 'Compostaje', emoji: '🌱', color: '#84cc16', bg: '#ecfccb' },
  hazardous: { label: 'Peligrosos', emoji: '⚠️', color: '#d97706', bg: '#fef3c7' },
}

function createMarkerIcon(type: PointType): L.DivIcon {
  const config = TYPE_CONFIG[type]
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker" style="background: ${config.color}">${config.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<div class="user-location-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function RecenterMap({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 })
    }
  }, [center, map])
  return null
}

function FitBounds({ points }: { points: RecyclingPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude] as [number, number]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [points, map])
  return null
}

function TrackBounds({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => onBoundsChange(map.getBounds())
    handler()
    map.on('moveend', handler)
    map.on('zoomend', handler)
    return () => {
      map.off('moveend', handler)
      map.off('zoomend', handler)
    }
  }, [map, onBoundsChange])
  return null
}

export default function App() {
  const [points, setPoints] = useState<RecyclingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<PointType>>(
    new Set(['recycling', 'trash', 'compost', 'hazardous'])
  )
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [recenterTarget, setRecenterTarget] = useState<[number, number] | null>(null)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [activeView, setActiveView] = useState<'map' | 'info'>('map')
  const mapRef = useRef<L.Map | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const fetchPoints = async () => {
    const { data, error } = await supabase
      .from('recycling_points')
      .select('*')
      .order('name')

    if (error) {
      setError('No se pudieron cargar los puntos. Intenta de nuevo más tarde.')
    } else {
      setPoints(data ?? [])
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPoints()
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      fetchPoints()
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.')
      return
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocationAccuracy(pos.coords.accuracy ?? null)
        setLocationError(null)
      },
      () => {
        setLocationError('No se pudo obtener tu ubicación. No es posible calcular la distancia.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const filteredPoints = useMemo(() => {
    return points.filter((p) => activeFilters.has(p.type))
  }, [points, activeFilters])

  const toggleFilter = (type: PointType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const handlePointSelect = (point: RecyclingPoint) => {
    setSelectedPoint(point)
    setRecenterTarget([point.latitude, point.longitude])
    setMobileListOpen(false)
  }

  const handleLocateMe = () => {
    if (userLocation) {
      setRecenterTarget(userLocation)
    } else if (locationError) {
      // already have error
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setUserLocation(loc)
          setRecenterTarget(loc)
        },
        () => setLocationError('No se pudo obtener tu ubicación.'),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  const nearestPoint = useMemo(() => {
    if (!userLocation || filteredPoints.length === 0) return null
    let best = filteredPoints[0]
    let bestDist = haversineDistance(userLocation[0], userLocation[1], best.latitude, best.longitude)
    for (let i = 1; i < filteredPoints.length; i++) {
      const d = haversineDistance(userLocation[0], userLocation[1], filteredPoints[i].latitude, filteredPoints[i].longitude)
      if (d < bestDist) {
        best = filteredPoints[i]
        bestDist = d
      }
    }
    return { point: best, distance: bestDist }
  }, [userLocation, filteredPoints])

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of points) {
      c[p.type] = (c[p.type] ?? 0) + 1
    }
    return c
  }, [points])

  const pointsVisibleInMap = useMemo(() => {
    if (!mapBounds) return filteredPoints.length > 0
    return filteredPoints.some((p) =>
      mapBounds.contains(L.latLng(p.latitude, p.longitude))
    )
  }, [filteredPoints, mapBounds])

  const handleBoundsChange = (bounds: L.LatLngBounds) => {
    setMapBounds(bounds)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 64,
          background: 'var(--color-neutral-0)',
          borderBottom: '1px solid var(--color-neutral-200)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 1000,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--color-primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            ♻️
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.2 }}>
              EcoTrash Viedma
            </h1>
            <p style={{ fontSize: 12, color: 'var(--color-neutral-500)', lineHeight: 1.2 }}>
              Puntos de reciclaje y basureros en Viedma
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <nav style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveView('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: activeView === 'map' ? 'var(--color-primary-50)' : 'transparent',
                border: 'none',
                color: activeView === 'map' ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🗺️ Mapa
            </button>
            <button
              onClick={() => setActiveView('info')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: activeView === 'info' ? 'var(--color-primary-50)' : 'transparent',
                border: 'none',
                color: activeView === 'info' ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ♻️ Guía
            </button>
          </nav>
          <button
            onClick={handleLocateMe}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-secondary-500)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-secondary-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-secondary-500)')}
          >
            📍 Mi ubicación
          </button>
        </div>
      </header>

      {/* Main content */}
      {activeView === 'info' ? (
        <InfoView onBack={() => setActiveView('map')} />
      ) : (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 380,
            flexShrink: 0,
            background: 'var(--color-neutral-0)',
            borderRight: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 500,
          }}
          className="sidebar-desktop"
        >
          <FilterBar
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            counts={counts}
            typeConfig={TYPE_CONFIG}
          />
          <PointList
            points={filteredPoints}
            loading={loading}
            error={error}
            selectedPoint={selectedPoint}
            onSelect={handlePointSelect}
            userLocation={userLocation}
            typeConfig={TYPE_CONFIG}
          />
        </aside>

        {/* Mobile list toggle */}
        <button
          onClick={() => setMobileListOpen(!mobileListOpen)}
          style={{
            display: 'none',
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '12px 24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-primary-600)',
            color: 'white',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)',
          }}
          className="mobile-list-toggle"
        >
          {mobileListOpen ? 'Ver mapa' : `Ver lista (${filteredPoints.length})`}
        </button>

        {/* Mobile list overlay */}
        {mobileListOpen && (
          <div
            style={{
              display: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--color-neutral-0)',
              zIndex: 999,
              flexDirection: 'column',
            }}
            className="mobile-list-overlay"
          >
            <FilterBar
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
              counts={counts}
              typeConfig={TYPE_CONFIG}
            />
            <PointList
              points={filteredPoints}
              loading={loading}
              error={error}
              selectedPoint={selectedPoint}
              onSelect={handlePointSelect}
              userLocation={userLocation}
              typeConfig={TYPE_CONFIG}
            />
          </div>
        )}

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-neutral-50)',
                zIndex: 1000,
              }}
            >
              <div className="spinner" />
            </div>
          )}
          <MapContainer
            center={VIEDMA_CENTER}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            ref={(m) => {
              mapRef.current = m
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FitBounds points={filteredPoints} />
            <RecenterMap center={recenterTarget} />
            <TrackBounds onBoundsChange={handleBoundsChange} />

            {filteredPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
                icon={createMarkerIcon(point.type)}
                eventHandlers={{
                  click: () => handlePointSelect(point),
                }}
              >
                <Popup>
                  <div style={{ padding: '12px 16px', minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 4 }}>
                      {point.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginBottom: 4 }}>
                      📍 {point.address}
                    </div>
                    {point.schedule && (
                      <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginBottom: 4 }}>
                        🕐 {point.schedule}
                      </div>
                    )}
                    {(() => {
                      const si = getScheduleInfo(point.schedule)
                      if (!si.hasSchedule) return null
                      const color = si.isOpen ? '#059669' : '#ef4444'
                      return (
                        <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 4 }}>
                          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 5 }} />
                          {si.isOpen ? 'Abierto ahora' : 'Cerrado'}
                        </div>
                      )
                    })()}
                    <button
                      onClick={() => handlePointSelect(point)}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary-500)',
                        color: 'white',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      Ver más información
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {userLocation && nearestPoint && (
              <Polyline
                positions={[
                  userLocation,
                  [nearestPoint.point.latitude, nearestPoint.point.longitude],
                ]}
                pathOptions={{
                  color: '#0ea5e9',
                  weight: 3,
                  opacity: 0.6,
                  dashArray: '8 12',
                }}
              />
            )}

            {userLocation && (
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup>
                  <div style={{ padding: '8px 12px' }}>
                    <strong>Estás aquí</strong>
                    {locationAccuracy !== null && locationAccuracy > 50 && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        Ubicación aproximada (±{Math.round(locationAccuracy)} m)
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Nearest point info banner */}
          {nearestPoint && (
            <div
              className="animate-fade-in-up"
              style={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                maxWidth: 300,
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-0)',
                border: '1px solid var(--color-neutral-200)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                cursor: 'pointer',
              }}
              onClick={() => handlePointSelect(nearestPoint.point)}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-secondary-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Punto más cercano
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{TYPE_CONFIG[nearestPoint.point.type].emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {nearestPoint.point.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-neutral-600)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-secondary-600)' }}>
                  {formatDistance(nearestPoint.distance)}
                </span>
                <span>· {nearestPoint.point.address}</span>
              </div>
              {locationAccuracy !== null && locationAccuracy > 50 && (
                <div style={{ fontSize: 11, color: 'var(--color-warning-600)', marginTop: 6 }}>
                  ⚠ Ubicación imprecisa (±{Math.round(locationAccuracy)} m)
                </div>
              )}
            </div>
          )}

          {/* Location unavailable for distance */}
          {!userLocation && locationError && !loading && (
            <div
              className="animate-fade-in-up"
              style={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                maxWidth: 280,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-100)',
                border: '1px solid var(--color-neutral-200)',
                color: 'var(--color-neutral-600)',
                fontSize: 13,
                boxShadow: 'var(--shadow-md)',
                zIndex: 1000,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2, color: 'var(--color-neutral-700)' }}>
                No se puede calcular la distancia
              </div>
              Activa tu ubicación para encontrar el punto más cercano.
            </div>
          )}

          {/* No results in visible area */}
          {!loading && !error && filteredPoints.length > 0 && !pointsVisibleInMap && (
            <div
              className="animate-fade-in-up"
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-800)',
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                whiteSpace: 'nowrap',
              }}
            >
              No hay puntos visibles en esta área del mapa
            </div>
          )}

          {/* Offline banner */}
          {!isOnline && (
            <div
              className="animate-fade-in-up"
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-error-500)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                whiteSpace: 'nowrap',
              }}
            >
              Sin conexión a internet — mostrando datos guardados
            </div>
          )}

          {/* Location error toast */}
          {locationError && (
            <div
              className="animate-fade-in-up"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                maxWidth: 280,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-800)',
                color: 'white',
                fontSize: 13,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
              }}
            >
              {locationError}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedPoint && (
          <PointDetail
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            typeConfig={TYPE_CONFIG}
            userLocation={userLocation}
          />
        )}
      </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-list-toggle { display: flex !important; }
          .mobile-list-overlay { display: flex !important; }
          .info-mobile-detail { display: block !important; }
        }
      `}</style>
    </div>
  )
}
