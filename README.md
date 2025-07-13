
# Global Link Soccer ⚽

Plataforma completa para la gestión de torneos de fútbol con roles diferenciados para organizadores, equipos y árbitros.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Supabase Admin Configuration
SUPER_ADMIN_EMAIL=admin@globallinksoccer.com
SUPER_ADMIN_PASSWORD=SuperSecurePassword123!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site URL for redirects
SITE_URL=http://localhost:3000
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Crear Super Administrador

```bash
npm run seed:superadmin
```

Este comando creará un usuario administrador con las credenciales especificadas en las variables de entorno.

### 4. Crear Usuarios de Demostración

```bash
npm run seed:demos
```

Este comando creará usuarios de prueba para cada rol tanto en Auth como en la tabla public.users:

**Demo Credentials:**
- **Admin**: admin@demo.com / admin123
- **Organizer**: organizer@demo.com / organizer123  
- **Referee**: referee@demo.com / referee123
- **Team Admin**: team@demo.com / team123

## 🛠 Desarrollo

```bash
npm run dev
```

## 📋 User Administration

### Admin Panel Access

- Solo usuarios con rol `admin` pueden acceder al panel de administración
- Acceso a través del botón "Administrar Usuarios" en la página principal
- Ruta: `/admin/users`

### Funcionalidades del Admin

1. **Gestión de Usuarios**
   - Ver lista completa de usuarios
   - Filtrar por rol y buscar por email/nombre
   - Crear nuevos usuarios con roles específicos
   - Editar información de usuarios existentes

2. **Acciones Administrativas**
   - Resetear contraseña (genera link de reseteo)
   - Activar/Desactivar usuarios
   - Cambiar roles de usuario

3. **Roles Disponibles**
   - `admin`: Administrador completo del sistema
   - `organizer`: Organizador de torneos
   - `referee`: Árbitro/Fiscal
   - `team_admin`: Administrador de equipo

### Demo Users

Para facilitar las pruebas, puedes usar estos usuarios de demostración:

```bash
# Crear usuarios demo
npm run seed:demo
```

**Credenciales de Demo:**
- **Administrador**: admin@demo.com / admin123
- **Organizador**: organizer@demo.com / organizer123
- **Árbitro**: referee@demo.com / referee123
- **Admin de Equipo**: team@demo.com / team123

### Configuración en Producción

1. **Variables de Entorno**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   SITE_URL=https://your-domain.com
   ```

2. **Políticas de Seguridad**
   - Solo usuarios con rol `admin` pueden gestionar otros usuarios
   - Los API endpoints están protegidos con verificación JWT
   - Las políticas RLS de Supabase controlan el acceso a los datos

3. **Creación del Primer Admin**
   ```bash
   # En producción, ejecuta una sola vez
   npm run seed:superadmin
   ```

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **JWT Authentication** en todos los endpoints administrativos
- **Role-based Access Control** para diferentes funcionalidades
- **Service Role Key** para operaciones administrativas sensibles

## 🏗 Arquitectura

```
src/
├── pages/Admin/           # Páginas administrativas
├── components/Admin/      # Componentes administrativos
├── services/             # Hooks React Query
├── server/api/admin/     # API routes administrativas
└── contexts/             # Context providers
```

## 📝 API Endpoints

- `POST /api/admin/createUser` - Crear usuario
- `PUT /api/admin/updateUser` - Actualizar usuario
- `POST /api/admin/toggleActive` - Activar/Desactivar usuario  
- `POST /api/admin/resetPassword` - Generar link de reseteo

## 🎯 Tipos de Usuario

### Organizador
- Crear y gestionar torneos
- Configurar reglas y formato
- Aprobar inscripciones de equipos
- Generar fixture y resultados

### Equipo
- Registrar equipo y jugadores
- Inscribirse en torneos
- Ver estadísticas y resultados
- Gestionar plantilla

### Fiscal/Árbitro
- Supervisar partidos
- Registrar resultados
- Validar alineaciones
- Reportar incidencias

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Crear super admin
npm run seed:superadmin

# Crear usuarios demo
npm run seed:demo

# Testing
npm run lint              # ESLint
npm run typecheck         # TypeScript checking
npm test                  # Unit tests
npm run test:watch        # Unit tests in watch mode
npm run test:coverage     # Unit tests with coverage
npm run cy:open           # Cypress E2E tests (UI)
npm run cy:run            # Cypress E2E tests (headless)

# Complete test pipeline
npm run lint && npm run typecheck && npm test && npm run cy:run
```

## 🧪 Testing

### Verificaciones Estáticas
```bash
pnpm lint && pnpm typecheck
```

### Tests Unitarios
- Servicios de API con mocks de Supabase
- Componentes principales con React Testing Library
- Casos de uso y lógica de negocio

```bash
pnpm test                  # Ejecutar todos los tests
pnpm test:watch            # Tests en modo watch
pnpm test:coverage         # Tests con cobertura
```

### Tests End-to-End
- Flujos completos del admin panel
- Creación, edición y eliminación de usuarios
- Validación de RLS y autenticación

```bash
pnpm cy:open               # Cypress UI
pnpm cy:run                # Cypress headless
```

### Pipeline Completo
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm cy:run
```

## 📦 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Context API
- **Routing**: React Router Dom
- **Testing**: Jest + React Testing Library + Cypress
- **CI/CD**: GitHub Actions
