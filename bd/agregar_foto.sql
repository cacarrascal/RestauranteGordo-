-- Agregar columna foto a mesas (si no existe)
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS foto TEXT;

-- Agregar horarios ejemplo (si no existen)
INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, '12', '21', true),
(2, '12', '21', true),
(3, '12', '21', true),
(4, '12', '21', true),
(5, '12', '21', true),
(6, '12', '22', true),
(0, '12', '21', false)
ON CONFLICT DO NOTHING;

-- Insertar admin (si no existe)
INSERT INTO administradores (usuario, password_hash, nombre) VALUES
('admin', 'YWRtaW4xMjM=', 'Administrador')
ON CONFLICT (usuario) DO NOTHING;