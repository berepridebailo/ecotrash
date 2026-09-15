/*
# Create recycling_points table for EcoTrash Viedma

## Purpose
Stores all recycling points and trash bins located in the city of Viedma, Río Negro, Argentina.
This is a single-tenant app with no authentication — all data is intentionally public/shared.

## New Tables
- `recycling_points`
  - `id` (uuid, primary key)
  - `name` (text, not null) — display name of the point
  - `type` (text, not null) — one of: 'recycling', 'trash', 'compost', 'hazardous'
  - `address` (text, not null) — street address
  - `latitude` (double precision, not null) — geographic latitude
  - `longitude` (double precision, not null) — geographic longitude
  - `schedule` (text) — opening hours, e.g. "Lun–Vie 8:00–18:00"
  - `accepted_materials` (text[]) — array of accepted materials for recycling points
  - `notes` (text) — additional usage information
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled on the table.
- All CRUD operations allowed for anon + authenticated roles because the data is intentionally public/shared.
- `USING (true)` is acceptable here because this is a single-tenant, no-auth app with public data.

## Seed Data
- Inserts ~20 recycling and trash points across Viedma with real-ish coordinates and schedules.
*/

CREATE TABLE IF NOT EXISTS recycling_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('recycling', 'trash', 'compost', 'hazardous')),
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  schedule text,
  accepted_materials text[],
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recycling_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recycling_points" ON recycling_points;
CREATE POLICY "anon_select_recycling_points" ON recycling_points FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recycling_points" ON recycling_points;
CREATE POLICY "anon_insert_recycling_points" ON recycling_points FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recycling_points" ON recycling_points;
CREATE POLICY "anon_update_recycling_points" ON recycling_points FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recycling_points" ON recycling_points;
CREATE POLICY "anon_delete_recycling_points" ON recycling_points FOR DELETE
  TO anon, authenticated USING (true);

-- Index for faster spatial-ish queries
CREATE INDEX IF NOT EXISTS idx_recycling_points_type ON recycling_points(type);

-- Seed data: recycling points and trash bins in Viedma, Argentina
-- Viedma center approx: -40.8135, -62.9965
INSERT INTO recycling_points (name, type, address, latitude, longitude, schedule, accepted_materials, notes) VALUES
('Punto Limpio Centro', 'recycling', 'Av. San Martín 250', -40.8120, -62.9970, 'Lun–Vie 8:00–18:00, Sáb 9:00–13:00', ARRAY['Plástico', 'Cartón', 'Vidrio', 'Lata'], 'Punto de recolección principal en el centro de Viedma.'),
('Punto Limpio Costanera', 'recycling', 'Paseo de la Costa s/n', -40.8200, -63.0010, 'Todos los días 8:00–20:00', ARRAY['Plástico', 'Cartón', 'Vidrio'], 'Ubicado sobre la costanera del río Negro.'),
('Contenedor Verde Barrio Belgrano', 'recycling', 'Calle 25 de Mayo 1200', -40.8050, -62.9900, 'Disponible 24 hs', ARRAY['Plástico', 'Cartón'], 'Contenedor comunitario del barrio Belgrano.'),
('Contenedor Verde Isla 47', 'recycling', 'Av. Caseros 800', -40.8150, -62.9850, 'Disponible 24 hs', ARRAY['Plástico', 'Cartón', 'Vidrio'], 'Contenedor comunitario en barrio Isla 47.'),
('Punto de Reciclaje Hospital', 'recycling', 'Av. Alem 900', -40.8180, -62.9950, 'Lun–Vie 7:00–19:00', ARRAY['Plástico', 'Cartón', 'Lata'], 'Frente al Hospital Francisco Viedma.'),
('Punto Limpio Terminal', 'recycling', 'Av. San Martín 1450', -40.8080, -63.0050, 'Lun–Sáb 6:00–22:00', ARRAY['Plástico', 'Cartón', 'Vidrio', 'Lata', 'Papel'], 'Cercano a la terminal de ómnibus de Viedma.'),
('Contenedor Verde Villa Rosas', 'recycling', 'Calle Sarmiento 2000', -40.7950, -63.0100, 'Disponible 24 hs', ARRAY['Plástico', 'Cartón'], 'Contenedor comunitario en Villa Rosas.'),
('Punto Limpio Barrio 680 Viviendas', 'recycling', 'Av. Viedma 3000', -40.8300, -62.9700, 'Lun–Vie 8:00–17:00', ARRAY['Plástico', 'Cartón', 'Vidrio'], 'Punto de recolección en barrio 680 Viviendas.'),
('Basurero Municipal Norte', 'trash', 'Ruta 250 km 2', -40.7800, -63.0200, 'Lun–Sáb 7:00–16:00', NULL, 'Recolección de residuos generales. No se aceptan reciclables.'),
('Basurero Municipal Sur', 'trash', 'Camino a San Antonio', -40.8500, -63.0000, 'Lun–Sáb 7:00–15:00', NULL, 'Recolección de residuos generales.'),
('Contenedor de Residuos Centro', 'trash', 'Buenos Aires 300', -40.8110, -62.9960, 'Disponible 24 hs', NULL, 'Contenedor de residuos generales en zona céntrica.'),
('Contenedor de Residuos Belgrano', 'trash', 'Av. G. Roca 600', -40.8060, -62.9920, 'Disponible 24 hs', NULL, 'Contenedor de residuos generales en barrio Belgrano.'),
('Contenedor de Residuos Isla 47', 'trash', 'Calle Misiones 500', -40.8160, -62.9870, 'Disponible 24 hs', NULL, 'Contenedor de residuos generales en Isla 47.'),
('Contenedor de Residuos Villa Rosas', 'trash', 'Calle Rivadavia 1800', -40.7980, -63.0080, 'Disponible 24 hs', NULL, 'Contenedor de residuos generales en Villa Rosas.'),
('Punto de Compostaje Comunitario', 'compost', 'Plaza San Martín s/n', -40.8130, -62.9980, 'Lun–Vie 9:00–17:00', ARRAY['Residuos orgánicos', 'Restos de frutas y verduras'], 'Compostaje comunitario en plaza principal.'),
('Punto de Compostaje Costanera', 'compost', 'Paseo de la Costa s/n', -40.8220, -63.0020, 'Sáb 9:00–13:00', ARRAY['Residuos orgánicos', 'Restos de frutas y verduras'], 'Compostaje comunitario sobre la costanera.'),
('Punto de Residuos Peligrosos', 'hazardous', 'Av. Alem 1400', -40.8170, -62.9880, 'Mié y Vie 9:00–15:00', ARRAY['Baterías', 'Pilas', 'Aceites usados', 'Pinturas', 'Electrónicos pequeños'], 'Punto de recolección de residuos peligrosos del domicilio.'),
('Punto de Residuos Peligrosos Hospital', 'hazardous', 'Av. Alem 900', -40.8185, -62.9955, 'Lun–Vie 8:00–12:00', ARRAY['Medicamentos vencidos', 'Termómetros'], 'Recolección de medicamentos vencidos y residuos sanitarios seguros.'),
('Punto Limpio Barrio 4 Esquinas', 'recycling', 'Av. Roca 2200', -40.7900, -62.9800, 'Lun–Vie 8:00–18:00', ARRAY['Plástico', 'Cartón', 'Vidrio', 'Lata', 'Papel'], 'Punto de recolección en barrio 4 Esquinas.'),
('Contenedor Verde Centro Cívico', 'recycling', 'Av. Alem 600', -40.8140, -62.9940, 'Disponible 24 hs', ARRAY['Plástico', 'Cartón', 'Vidrio'], 'Contenedor junto al Centro Cívico de Viedma.')
ON CONFLICT DO NOTHING;
