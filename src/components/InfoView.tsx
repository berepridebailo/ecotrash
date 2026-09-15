import { useState } from 'react'

interface WasteCategory {
  id: string
  name: string
  emoji: string
  type: 'recyclable' | 'non-recyclable'
  color: string
  bg: string
  description: string
  examples: string[]
}

const CATEGORIES: WasteCategory[] = [
  {
    id: 'plastic',
    name: 'Plásticos',
    emoji: '🥤',
    type: 'recyclable',
    color: '#059669',
    bg: '#d1fae5',
    description: 'Los plásticos reciclables deben estar limpios y secos. Retira tapas y etiquetas cuando sea posible.',
    examples: ['Botellas de agua y bebidas', 'Envases de productos de limpieza', 'Bolsas plásticas limpias', 'Vasos descartables', 'Envases de yogurt'],
  },
  {
    id: 'cardboard',
    name: 'Cartón y Papel',
    emoji: '📦',
    type: 'recyclable',
    color: '#059669',
    bg: '#d1fae5',
    description: 'El cartón y papel deben estar secos y sin restos de comida o grasa.',
    examples: ['Cajas de cartón', 'Periódicos y revistas', 'Hojas de papel', 'Envases de cartón (sin residuos)', 'Bolsas de papel'],
  },
  {
    id: 'glass',
    name: 'Vidrio',
    emoji: '🍾',
    type: 'recyclable',
    color: '#059669',
    bg: '#d1fae5',
    description: 'El vidrio es 100% reciclable. Enjuaga los envases antes de depositarlos.',
    examples: ['Botellas de vidrio', 'Frascos de conserva', 'Vasos de vidrio (sin roturas)', 'Envases de perfumería'],
  },
  {
    id: 'metal',
    name: 'Metales',
    emoji: '🥫',
    type: 'recyclable',
    color: '#059669',
    bg: '#d1fae5',
    description: 'Los metales deben estar limpios. Aplana las latas para ahorrar espacio.',
    examples: ['Latas de bebidas', 'Latas de conservas', 'Tapas metálicas', 'Papel de aluminio limpio', 'Envases de aerosol (vacíos)'],
  },
  {
    id: 'organic',
    name: 'Residuos Orgánicos',
    emoji: '🍎',
    type: 'recyclable',
    color: '#84cc16',
    bg: '#ecfccb',
    description: 'Los residuos orgánicos pueden compostarse para obtener abono natural.',
    examples: ['Restos de frutas y verduras', 'Cáscaras de huevo', 'Borras de café', 'Sacos de té', 'Cáscara de banana'],
  },
  {
    id: 'hazardous',
    name: 'Residuos Peligrosos',
    emoji: '⚠️',
    type: 'recyclable',
    color: '#d97706',
    bg: '#fef3c7',
    description: 'Estos residuos requieren un tratamiento especial. No los mezcles con la basura común.',
    examples: ['Pilas y baterías', 'Medicamentos vencidos', 'Aceites usados', 'Pinturas y solventes', 'Electrónicos pequeños'],
  },
  {
    id: 'food-waste',
    name: 'Restos de Comida Contaminados',
    emoji: '🍽️',
    type: 'non-recyclable',
    color: '#64748b',
    bg: '#e2e8f0',
    description: 'Los restos de comida con grasa o contaminados no son reciclables ni compostables.',
    examples: ['Comida con restos de aceite', 'Pañuelos descartables usados', 'Servilletas con grasa', 'Restos de comida mezclados con plástico'],
  },
  {
    id: 'sanitary',
    name: 'Residuos Sanitarios',
    emoji: '🩹',
    type: 'non-recyclable',
    color: '#64748b',
    bg: '#e2e8f0',
    description: 'Los residuos sanitarios deben desecharse en la basura común por seguridad.',
    examples: ['Barbijos y guantes usados', 'Afteritos y algodones', 'Jeringas (en contenedor rígido)', 'Tirantes y vendas usadas'],
  },
  {
    id: 'mixed',
    name: 'Envases Mixtos',
    emoji: '🚫',
    type: 'non-recyclable',
    color: '#64748b',
    bg: '#e2e8f0',
    description: 'Los envases compuestos por varios materiales no separables no son reciclables.',
    examples: ['Envases tetra brick con residuos', 'Bolsas con cierre hermético usadas', 'Paquetes de snacks metalizados', 'Envases con restos de pegamento'],
  },
  {
    id: 'ceramic',
    name: 'Cerámica y Loza',
    emoji: '🏺',
    type: 'non-recyclable',
    color: '#64748b',
    bg: '#e2e8f0',
    description: 'La cerámica y loza no se reciclan con el vidrio común. Van a residuos generales.',
    examples: ['Tazas y platos rotos', 'Macetas de cerámica', 'Espejos', 'Vidrio templado de ventanas'],
  },
]

const TAB_CONFIG = [
  { id: 'recyclable' as const, label: 'Reciclables', emoji: '♻️', color: '#059669', bg: '#d1fae5' },
  { id: 'non-recyclable' as const, label: 'No Reciclables', emoji: '🚫', color: '#64748b', bg: '#e2e8f0' },
]

interface InfoViewProps {
  onBack: () => void
}

export function InfoView({ onBack }: InfoViewProps) {
  const [activeTab, setActiveTab] = useState<'recyclable' | 'non-recyclable'>('recyclable')
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | null>(null)

  const visibleCategories = CATEGORIES.filter((c) => c.type === activeTab)
  const selectedIsVisible = selectedCategory && selectedCategory.type === activeTab

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--color-neutral-50)' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          padding: '40px 24px 32px',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>♻️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
            Guía de Reciclaje
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.9 }}>
            Aprende a separar correctamente tus residuos. Consulta qué materiales se pueden reciclar y cuáles no en Viedma.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSelectedCategory(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isActive ? tab.color : 'var(--color-neutral-200)'}`,
                  background: isActive ? tab.color : 'var(--color-neutral-0)',
                  color: isActive ? 'white' : 'var(--color-neutral-600)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.emoji}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Category list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleCategories.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--color-neutral-500)',
                fontSize: 14,
                background: 'var(--color-neutral-0)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-neutral-200)',
              }}
            >
              No hay información disponible para esta categoría en este momento.
            </div>
          ) : (
            visibleCategories.map((cat) => {
              const isSelected = (selectedIsVisible && selectedCategory?.id === cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                  className="animate-fade-in-up"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? cat.bg : 'var(--color-neutral-0)',
                    border: `2px solid ${isSelected ? cat.color : 'var(--color-neutral-200)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-neutral-300)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-neutral-200)'
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: cat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                      border: `2px solid ${cat.color}`,
                    }}
                  >
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {cat.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--color-neutral-500)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cat.examples.length} ejemplos
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: 'var(--color-neutral-400)' }}>
                    {isSelected ? '▲' : '▼'}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Detail panel (sticky on desktop) */}
        {selectedIsVisible && selectedCategory && (
          <div
            className="animate-fade-in-up"
            style={{
              width: 340,
              flexShrink: 0,
              padding: 20,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-neutral-0)',
              border: `2px solid ${selectedCategory.color}`,
              boxShadow: 'var(--shadow-md)',
              position: 'sticky',
              top: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: selectedCategory.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  border: `2px solid ${selectedCategory.color}`,
                }}
              >
                {selectedCategory.emoji}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {selectedCategory.name}
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', lineHeight: 1.6, marginBottom: 16 }}>
              {selectedCategory.description}
            </p>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-neutral-500)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Ejemplos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedCategory.examples.length > 0 ? (
                selectedCategory.examples.map((ex) => (
                  <div
                    key={ex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--color-neutral-700)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedCategory.bg,
                    }}
                  >
                    <span style={{ color: selectedCategory.color, fontWeight: 700 }}>•</span>
                    {ex}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                  No hay ejemplos cargados para esta categoría.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail (shown inline below list on small screens) */}
      {selectedIsVisible && selectedCategory && (
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto 40px',
            padding: '0 24px',
            display: 'none',
          }}
          className="info-mobile-detail"
        >
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-neutral-0)',
              border: `2px solid ${selectedCategory.color}`,
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: 12 }}>
              {selectedCategory.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedCategory.examples.map((ex) => (
                <span
                  key={ex}
                  style={{
                    fontSize: 12,
                    padding: '5px 10px',
                    borderRadius: 8,
                    background: selectedCategory.bg,
                    color: 'var(--color-neutral-700)',
                  }}
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div style={{ maxWidth: 800, margin: '0 auto 40px', padding: '0 24px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-neutral-0)',
            border: '1px solid var(--color-neutral-200)',
            color: 'var(--color-neutral-700)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-400)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)')}
        >
          ← Volver al mapa
        </button>
      </div>
    </div>
  )
}
