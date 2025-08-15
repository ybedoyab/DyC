# DYC Frontend - Dignidad y Compromiso

Frontend de la aplicación web para el partido político "Dignidad y Compromiso" (DYC).

## 🚀 Características

- **Landing Page Pública**: Formulario para que cualquier persona se registre como referido del partido
- **Autenticación OAuth**: Login con Google para candidatos y representantes
- **Dashboard de Candidatos**: Gestión de sus referidos personales
- **Dashboard de Representantes**: Vista de todos los referidos del partido
- **Panel de Administración**: Gestión completa del sistema para administradores
- **Estadísticas en Tiempo Real**: Métricas del partido y referidos
- **Diseño Responsivo**: Interfaz moderna y adaptable a todos los dispositivos

## 🛠️ Tecnologías Utilizadas

- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **Material-UI (MUI)** - Componentes de interfaz de usuario
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP para llamadas a la API
- **Vite** - Herramienta de construcción rápida

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx      # Barra de navegación
│   ├── ReferidoForm.tsx # Formulario de registro de referidos
│   └── Statistics.tsx  # Componente de estadísticas
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx        # Página principal (landing)
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard de políticos
│   └── Admin.tsx       # Panel de administración
├── services/           # Servicios de la aplicación
│   └── api.ts          # Cliente de API
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts        # Tipos principales
├── config/             # Configuración
│   └── env.ts          # Variables de entorno
└── App.tsx             # Componente principal
```

## 🔧 Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001
VITE_PORT=3000
```

### Instalación de Dependencias

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`

### Construcción para Producción

```bash
npm run build
```

### Vista Previa de Producción

```bash
npm run preview
```

## 🎯 Funcionalidades Principales

### 1. Landing Page Pública
- Formulario de registro para referidos
- Información sobre el partido
- Estadísticas generales
- Diseño atractivo y profesional

### 2. Sistema de Autenticación
- **OAuth con Google**: Para candidatos y representantes
- **Login de Admin**: Credenciales del sistema
- **Protección de Rutas**: Acceso restringido según rol

### 3. Dashboard de Políticos
- **Candidatos**: Ver y gestionar sus referidos personales
- **Representantes**: Vista completa de todos los referidos
- **CRUD de Referidos**: Crear, editar, eliminar referidos
- **Paginación**: Navegación eficiente de grandes volúmenes

### 4. Panel de Administración
- **Dashboard General**: Métricas del sistema
- **Logs de Auditoría**: Registro de todas las acciones
- **Gestión de Políticos**: Agregar emails para OAuth
- **Estadísticas Avanzadas**: Análisis detallado del sistema

## 🔐 Roles y Permisos

### Usuario Público
- Acceso a landing page
- Registro como referido
- Visualización de estadísticas

### Candidato
- Login con OAuth Google
- Dashboard personal de referidos
- Gestión de referidos propios

### Representante
- Login con OAuth Google
- Vista de todos los referidos del partido
- Gestión completa de referidos

### Administrador
- Login con credenciales del sistema
- Acceso completo a todas las funcionalidades
- Gestión del sistema completo

## 🌐 API Endpoints Utilizados

- `POST /api/referidos` - Crear referido
- `GET /api/statistics` - Obtener estadísticas
- `GET /api/auth/oauth/google` - Iniciar OAuth Google
- `GET /api/dashboard/referidos` - Referidos del político
- `GET /api/dashboard/all-referidos` - Todos los referidos
- `POST /api/admin/login` - Login de administrador
- `GET /api/admin/audit-logs` - Logs de auditoría

## 🎨 Diseño y UX

- **Tema Blanco y Negro**: Diseño elegante y profesional
- **Componentes Material-UI**: Interfaz consistente y moderna
- **Responsive Design**: Adaptable a todos los dispositivos
- **Navegación Intuitiva**: Flujo de usuario claro y lógico
- **Feedback Visual**: Mensajes de éxito, error y carga

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
VITE_API_URL=https://tu-api-backend.com
VITE_PORT=3000
```

### Comandos de Despliegue

```bash
# Construir para producción
npm run build

# Los archivos se generan en la carpeta dist/
# Subir esta carpeta a tu servidor web
```

## 📝 Notas de Desarrollo

- El frontend se comunica exclusivamente con el backend a través de la variable `VITE_API_URL`
- Todas las llamadas a la API incluyen manejo de errores y estados de carga
- La autenticación se maneja mediante tokens JWT almacenados en localStorage
- El sistema de rutas protege las páginas según el rol del usuario
- Los componentes están modularizados siguiendo principios de clean code

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del sistema DYC (Dignidad y Compromiso) y está sujeto a las políticas del partido político.
