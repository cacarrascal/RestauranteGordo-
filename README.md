# Sistema de Reservas - Comidas Rápidas The Gordo

Aplicación web SPA para gestión de reservas de mesas en restaurante, construida con React + Supabase.

## Características

- **Módulo Cliente**: Reserva autónoma de mesas con visualización en tiempo real
- **Módulo Administrador**: Panel completo CRUD para gestión de mesas, reservas y horarios
- **Autenticación**: Sistema de auth con Supabase
- **UI Responsiva**: Diseño adaptado para móviles y desktop

## Tecnologías

- Frontend: React 18 + Vite
- Backend: Supabase (BaaS)
- Estilos: CSS personalizado
- Despliegue: Vercel

## Estructura del Proyecto

```
RestaGordo/
├── bd/                 # Script SQL de base de datos
├── public/             # Archivos estáticos
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── context/       # Context API (Auth, App)
│   ├── pages/       # Páginas principales
│   ├── services/     # Servicios Supabase
│   ├── styles/      # Estilos globales
│   ├── App.jsx     # Componente principal
│   └── main.jsx    # Punto de entrada
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Requisitos Previos

- Node.js 18+
- Cuenta de Supabase
- Cuenta de Vercel (para despliegue)

---

## Instalación Local

### 1. Clonar el Proyecto

```bash
git clone <repo-url>
cd the-gordo-reservas
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### A) Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) e iniciar sesión
2. Crear nuevo proyecto: **New Project**
3. Configurar:
   - Name: `the-gordo-reservas`
   - Database Password: Definir contraseña segura
   - Region: Elegir región cercana
4. Esperar aprovisionamiento (1-2 min)

#### B) Ejecutar SQL

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Copiar todo el contenido de `bd/supabase-setup.sql`
3. Ejecutar (**Run**)

#### C) Obtener Credenciales

1. Ir a **Project Settings** → **API**
2. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` (Key) → `VITE_SUPABASE_ANON_KEY`

#### D) Configurar .env

```bash
cp .env.example .env
```

Editar `.env` con las credenciales:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### E) Crear Usuario Administrador

1. Ir a **Authentication** → **Users**
2. **Add user**: completar email y contraseña
3. El usuario pudiendo acceder a `/login`

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

---

## Despliegue en Vercel

### Opción 1: Deploy desde GitHub (Recomendado)

1. Subir código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Crear repositorio en GitHub

3. Conectar a Vercel:
   - Ir a [vercel.com](https://vercel.com)
   - Importar repositorio
   - Framework: `Vite`
   - Build: `npm run build`
   - Output: `dist`

4. Agregar Variables de Entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Deploy!

### Opción 2: Deploy Local con Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## Uso de la Aplicación

### Página Principal (Cliente)

1. Visualizar salón con mesas:
   - Verde: Disponible
   - Rojo: Ocupada
   - Gris: Bloqueada
2. Seleccionar mesa disponible
3. Elegir fecha y hora
4. Completar datos del cliente
5. Confirmar reserva

### Panel de Administrador

1. Acceder a `/login`
2. Credenciales de Supabase Auth
3. Gestionar:
   - **Mesas**: Crear, editar, eliminar, bloquear/desbloquear
   - **Reservas**: Ver historial, cancelar
   - **Horarios**: Configurar días y horas de atención

---

## Modelo de Datos

### mesas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | ID único |
| numero | INTEGER | Número de mesa |
| capacidad | INTEGER | Personas máximo |
| ubicacion | TEXT | Ubicación física |
| estado | TEXT | disponible/ocupada/bloqueada |

### reservas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | ID único |
| mesa_id | BIGINT | FK a mesas |
| cliente_nombre | TEXT | Nombre cliente |
| cliente_tel | TEXT | Teléfono |
| cliente_email | TEXT | Email |
| fecha | DATE | Fecha reserva |
| hora | TEXT | Hora reserva |
| num_personas | INTEGER | # personas |
| estado | TEXT | confirmada/cancelada |

### horarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | ID único |
| dia_semana | INTEGER | 0=Domingo, 6=Sábado |
| hora_inicio | TEXT | Hora apertura |
| hora_fin | TEXT | Hora cierre |
| activo | BOOLEAN | Horario activo |

---

## Rutas

| Ruta | Descripción | Acceso |
|------|------------|---------|
| `/` | Página principal - reserva de mesas | Público |
| `/login` | Login de administrador | Público |
| `/admin` | Panel de administración | Autenticado |
| `/reserva-confirmada` | Confirmación de reserva | Público |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build producción |
| `npm run preview` | Vista previa build |

---

## Solución de Problemas

### Error de Conexión a Supabase

- Verificar credenciales en `.env`
- Confirmar que RLS policies están creadas

### Error de Autenticación

- Verificar email/password en Supabase Auth
- Revisar políticas de acceso

### build Falla

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Licencia

MIT License - 2024 The Gordo Restaurant