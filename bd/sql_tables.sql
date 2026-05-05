-- Tabla de Mesas (actualizada con campo foto)
CREATE TABLE IF NOT EXISTS mesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  capacidad INTEGER NOT NULL,
  ubicacion TEXT NOT NULL,
  estado TEXT DEFAULT 'disponible',
  foto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mesa_id UUID REFERENCES mesas(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  cliente_tel TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  num_personas INTEGER NOT NULL,
  estado TEXT DEFAULT 'confirmada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Horarios
CREATE TABLE IF NOT EXISTS horarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dia_semana INTEGER NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Administradores
CREATE TABLE IF NOT EXISTS administradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar horario ejemplo
INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, '12', '21', true),
(2, '12', '21', true),
(3, '12', '21', true),
(4, '12', '21', true),
(5, '12', '21', true),
(6, '12', '22', true),
(0, '12', '21', false);

-- Insertar admin ejemplo (usuario: admin, contraseña: admin123)
-- La contraseña se guarda como: btoa('admin123') = YWRtaW4xMjM=
INSERT INTO administradores (usuario, password_hash, nombre) VALUES
('admin', 'YWRtaW4xMjM=', 'Administrador');