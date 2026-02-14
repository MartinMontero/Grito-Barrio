# Guía para Desarrolladores - Protocolo CDMX

**Versión**: 1.0.0  
**Última actualización**: Febrero 2025  
**Idioma**: Español (es-MX)

---

## Índice

1. [Visión General de la Arquitectura](#1-visión-general-de-la-arquitectura)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Configuración del Entorno de Desarrollo](#4-configuración-del-entorno-de-desarrollo)
5. [Estándares de Código](#5-estándares-de-código)
6. [Testing](#6-testing)
7. [Flujo de Trabajo de Contribución](#7-flujo-de-trabajo-de-contribución)
8. [Documentación de la API](#8-documentación-de-la-api)

---

## 1. Visión General de la Arquitectura

### 1.1 Arquitectura de la Aplicación

Protocolo CDMX sigue una arquitectura **PWA (Progressive Web App)** con los siguientes componentes principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA - Protocolo CDMX                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Zustand     │  │  Web Crypto  │      │
│  │  Components  │  │    Store     │  │    API       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   IndexedDB  │  │  Service     │  │   Offline    │      │
│  │   (idb-      │  │   Worker     │  │   Storage    │      │
│  │   keyval)    │  │   (Workbox)  │  │   (Caché)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Patrones de Diseño

- **Component-Based Architecture**: Componentes React reutilizables con composición
- **Slice Pattern**: Store dividido en slices independientes (incidentes, usuarios, recursos, etc.)
- **Offline-First**: Funcionalidad completa sin conexión mediante IndexedDB
- **Security-First**: Cifrado de extremo a extremo para datos sensibles

### 1.3 Flujo de Datos

```
User Action → Store Action → State Update → Component Re-render
                    ↓
           IndexedDB Persistence
                    ↓
           Service Worker Sync (when online)
```

---

## 2. Stack Tecnológico

### 2.1 Core Technologies

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Framework** | React | ^18.3.1 | UI Library |
| **Language** | TypeScript | ^5.x | Type Safety |
| **Build Tool** | Vite | ^5.2.0 | Bundling & Dev Server |
| **Styling** | Tailwind CSS | ^3.4.4 | Utility-first CSS |
| **State** | Zustand | ^4.5.2 | State Management |
| **PWA** | Vite PWA Plugin | latest | Service Worker & Manifest |

### 2.2 UI Components

| Library | Uso |
|---------|-----|
| **Radix UI** | Primitives accesibles (Accordion, Dialog, Dropdown, etc.) |
| **Lucide React** | Iconografía consistente |
| **Tailwind Animate** | Animaciones CSS |
| **Class Variance Authority** | Component variants |

### 2.3 Security & Encryption

| Feature | Implementación |
|---------|----------------|
| **Cifrado** | Web Crypto API (AES-256-GCM) |
| **Hashing** | SHA-256 con PBKDF2 (100,000 iteraciones) |
| **Almacenamiento** | IndexedDB con cifrado opcional |

### 2.4 Testing Stack

| Tipo | Framework |
|------|-----------|
| **Unit Tests** | Vitest |
| **Integration Tests** | Vitest + React Testing Library |
| **E2E Tests** | Playwright |
| **Accessibility** | Axe + React Testing Library |

---

## 3. Estructura del Proyecto

```
protocolo-cdmx/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── docs/                   # Documentación del proyecto
│   ├── DEPLOYMENT.md
│   ├── TESTING_STRATEGY.md
│   ├── USER_GUIDE.md
│   └── DEVELOPER.md
├── scripts/                # Scripts de automatización
├── src/
│   ├── components/         # Componentes React
│   │   ├── features/       # Componentes de características
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Componentes UI reutilizables
│   ├── data/               # Datos estáticos
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilidades y librerías
│   ├── store/              # Zustand store slices
│   ├── styles/             # Estilos globales
│   ├── tests/              # Tests organizados por tipo
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── e2e/
│   │   ├── accessibility/
│   │   ├── performance/
│   │   ├── security/
│   │   └── offline/
│   └── types/              # Definiciones TypeScript
├── public/                 # Assets estáticos
├── index.html              # Entry point HTML
├── package.json            # Dependencias y scripts
├── tailwind.config.js      # Configuración Tailwind
├── vite.config.ts          # Configuración Vite
├── vitest.config.ts        # Configuración Vitest
└── tsconfig.json           # Configuración TypeScript
```

### 3.1 Estructura de Componentes

```
src/components/
├── features/               # Componentes específicos de características
│   ├── Emergency*.tsx     # Componentes de emergencia
│   ├── Legal*.tsx         # Componentes de herramientas legales
│   ├── Resources*.tsx     # Componentes de recursos
│   ├── Training*.tsx      # Componentes de capacitación
│   └── Settings*.tsx      # Componentes de configuración
├── layout/                # Componentes de estructura
│   ├── AppShell.tsx       # Contenedor principal
│   ├── TopHeader.tsx      # Encabezado superior
│   ├── BottomNavigation.tsx # Navegación inferior
│   └── DrawerMenu.tsx     # Menú lateral
└── ui/                    # Componentes UI reutilizables
    ├── Button.tsx
    ├── Input.tsx
    ├── Dialog.tsx
    └── ...
```

### 3.2 Estructura del Store

```
src/store/
├── index.ts               # Store principal combinado
├── incidentSlice.ts       # Gestión de incidentes
├── userSlice.ts           # Gestión de usuarios
├── checklistSlice.ts      # Checklists de emergencia
├── documentationSlice.ts  # Documentación y evidencia
├── settingsSlice.ts       # Configuración de la app
├── resourcesSlice.ts      # Recursos y puntos seguros
└── examples.ts            # Ejemplos de datos
```

---

## 4. Configuración del Entorno de Desarrollo

### 4.1 Requisitos Previos

- **Node.js**: >= 18.0.0
- **npm** o **yarn**: Última versión estable
- **Git**: Para control de versiones

### 4.2 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/organization/protocolo-cdmx.git
cd protocolo-cdmx

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4.3 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (Vite)

# Building
npm run build            # Compila para producción
npm run preview          # Previsualiza build de producción

# Testing
npm run test             # Ejecuta todos los tests
npm run test:unit        # Ejecuta tests unitarios
npm run test:integration # Ejecuta tests de integración
npm run test:e2e         # Ejecuta tests E2E

# Linting
npm run lint             # Ejecuta ESLint

# Deploy
npm run deploy           # Despliega a GitHub Pages
```

### 4.4 Configuración de IDE

#### VSCode (Recomendado)

Extensiones recomendadas:

- **ESLint**: Integración con ESLint
- **Prettier**: Formateo de código
- **TypeScript Importer**: Auto-imports
- **Tailwind CSS IntelliSense**: Autocompletado Tailwind
- **Vitest**: Soporte para testing

Configuración `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### 4.5 Variables de Entorno

Crear archivo `.env` en la raíz:

```bash
# Desarrollo
VITE_APP_ENV=development
VITE_APP_DEBUG=true

# Producción (para build)
VITE_APP_ENV=production
VITE_APP_DEBUG=false
```

---

## 5. Estándares de Código

### 5.1 Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| **Componentes** | PascalCase | `EmergencyDashboard.tsx` |
| **Funciones** | camelCase | `activateEmergencyMode()` |
| **Variables** | camelCase | `userRole` |
| **Constantes** | UPPER_SNAKE_CASE | `CRYPTO_CONSTANTS` |
| **Tipos** | PascalCase | `UserProfile` |
| **Interfaces** | PascalCase + I (opcional) | `IIncidentProps` |
| **Slices** | camelCase + Slice | `incidentSlice` |

### 5.2 Estructura de Componentes

```typescript
/**
 * Componente Header - Protocolo CDMX
 * 
 * Descripción breve del componente.
 */

import React from 'react'
import { useProtocoloStore } from '@/store'
import type { TeamRole } from '@/types'

// Types
interface HeaderProps {
  title: string
  onEmergencyPress: () => void
}

// Component
export function Header({ title, onEmergencyPress }: HeaderProps) {
  // Hooks
  const currentUser = useProtocoloStore((state) => state.currentUser)
  
  // Handlers
  const handleEmergencyClick = React.useCallback(() => {
    onEmergencyPress()
  }, [onEmergencyPress])
  
  // Render
  return (
    <header className="bg-primary text-white">
      {/* JSX */}
    </header>
  )
}
```

### 5.3 Estructura de Slices

```typescript
/**
 * Slice de Incidentes - Protocolo CDMX
 */

import type { StateCreator } from 'zustand'
import type { Incident, TeamMember } from '@/types'

// Types
export interface IncidentSlice {
  incidents: Record<string, Incident>
  createIncident: (data: AlertData) => string
  updateIncident: (id: string, updates: Partial<Incident>) => void
}

// Initial State
const initialState = {
  incidents: {},
}

// Slice Creator
export const createIncidentSlice: StateCreator<
  IncidentSlice,
  [],
  [],
  IncidentSlice
> = (set, get) => ({
  ...initialState,
  
  createIncident: (data) => {
    const id = generateId()
    set((state) => ({
      incidents: {
        ...state.incidents,
        [id]: { id, ...data, status: 'detected' }
      }
    }))
    return id
  },
  
  updateIncident: (id, updates) => {
    set((state) => ({
      incidents: {
        ...state.incidents,
        [id]: { ...state.incidents[id], ...updates }
      }
    }))
  }
})
```

### 5.4 Comentarios y Documentación

- **JSDoc** obligatorio para funciones públicas
- Comentarios de una línea con `//` para explicaciones breves
- Comentarios de bloque con `/** */` para documentación

```typescript
/**
 * Cifra datos sensibles usando AES-256-GCM
 * 
 * @param data - Datos a cifrar (string, ArrayBuffer o object)
 * @param password - Contraseña para derivar la clave
 * @returns Promise con los datos cifrados
 * @throws Error si el cifrado falla
 */
export async function encrypt(
  data: string | ArrayBuffer | object,
  password: string
): Promise<EncryptedData> {
  // Implementation
}
```

### 5.5 Import/Export

```typescript
// ✅ Correcto - Importar tipos
import type { TeamRole, Incident } from '@/types'

// ✅ Correcto - Importar desde barrel exports
import { Button, Input } from '@/components/ui'

// ❌ Incorrecto - No usar default exports para componentes
export default function Component() {}

// ✅ Correcto - Named exports
export function Component() {}
```

---

## 6. Testing

### 6.1 Estrategia de Testing

| Tipo | Cobertura | Framework | Ubicación |
|------|-----------|-----------|-----------|
| **Unit** | >80% | Vitest | `src/tests/unit/` |
| **Integration** | >70% | Vitest + RTL | `src/tests/integration/` |
| **E2E** | >60% | Playwright | `src/tests/e2e/` |
| **Accessibility** | 100% | Axe + RTL | `src/tests/accessibility/` |
| **Security** | Critical paths | Vitest | `src/tests/security/` |

### 6.2 Tests Unitarios

```typescript
// src/tests/unit/crypto.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, sha256 } from '@/lib/crypto'

describe('Crypto Utilities', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const data = 'test data'
      const password = 'test-password-123'
      
      const encrypted = await encrypt(data, password)
      const decrypted = await decrypt(encrypted, password)
      
      expect(decrypted).toBe(data)
    })
    
    it('should fail with wrong password', async () => {
      const data = 'test data'
      const encrypted = await encrypt(data, 'correct-password')
      
      await expect(
        decrypt(encrypted, 'wrong-password')
      ).rejects.toThrow('Decryption failed')
    })
  })
})
```

### 6.3 Tests de Integración

```typescript
// src/tests/integration/flow.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '@/App'

describe('Emergency Flow', () => {
  it('should activate emergency mode', async () => {
    render(<App />)
    
    // Click emergency button
    const emergencyBtn = screen.getByLabelText('Activar emergencia')
    fireEvent.click(emergencyBtn)
    
    // Check emergency overlay appears
    expect(screen.getByText('Modo Emergencia Activado')).toBeInTheDocument()
  })
})
```

### 6.4 Ejecutar Tests

```bash
# Todos los tests
npm run test

# Unit tests
npm run test:unit

# Tests específicos
npm run test -- src/tests/unit/crypto.test.ts

# Con cobertura
npm run test -- --coverage

# Modo watch
npm run test -- --watch
```

---

## 7. Flujo de Trabajo de Contribución

### 7.1 Workflow de Git

```
main (protegida)
  ↓
develop (protegida)
  ↓
feature/nombre-feature
  ↓
PR → Code Review → Merge
```

### 7.2 Proceso de Contribución

1. **Fork** el repositorio
2. **Crear rama** desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-caracteristica
   ```
3. **Desarrollar** con commits frecuentes:
   ```bash
   git add .
   git commit -m "feat: agrega validación de formulario"
   ```
4. **Push** a tu fork:
   ```bash
   git push origin feature/nueva-caracteristica
   ```
5. **Crear PR** hacia `develop`

### 7.3 Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Tipos de commits:

- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **test**: Agregar tests
- **chore**: Tareas de mantenimiento

Ejemplos:

```bash
feat(emergency): agrega botón de pánico
fix(encryption): corrige manejo de claves
docs(readme): actualiza instrucciones de instalación
test(store): agrega tests para incidentSlice
```

### 7.4 Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Código compila sin errores
- [ ] Tests pasan
- [ ] Cobertura de tests >= 80%
- [ ] Documentación actualizada
- [ ] Changelog actualizado

## Screenshots (si aplica)

## Issue relacionado
Closes #123
```

### 7.5 Code Review Checklist

- [ ] Código sigue estándares del proyecto
- [ ] Tests incluidos y pasando
- [ ] No hay console.logs
- [ ] No hay datos sensibles hardcodeados
- [ ] Accesibilidad considerada
- [ ] Rendimiento optimizado

---

## 8. Documentación de la API

### 8.1 Store API

#### Hooks

```typescript
// Obtener store completo
const store = useProtocoloStore()

// Selectores específicos
const activeIncident = useActiveIncident()
const currentUser = useCurrentUser()
const isAuthenticated = useIsAuthenticated()
```

#### Actions

**Incidentes**:

```typescript
// Crear incidente
const incidentId = store.createIncident({
  location: { address: '...', colonia: '...', alcaldia: '...', postalCode: '...' },
  alertSource: 'hotline',
  threatLevel: 'high',
  description: 'Descripción del incidente'
})

// Actualizar incidente
store.updateIncident(incidentId, { status: 'responding' })

// Cerrar incidente
store.closeIncident(incidentId, 'Resuelto por mediación', 'resolved')
```

**Documentación**:

```typescript
// Agregar entrada de documentación
const entryId = store.addEntry({
  incidentId: 'CDMX-2025-01-01-1200-001',
  type: 'photo',
  capturedBy: 'usuario-anonimo',
  location: incidentLocation,
  description: 'Foto de la orden judicial',
  hash: 'sha256-hash',
  encrypted: true
})

// Exportar documentación
const blob = await store.exportEntries(incidentId, true) // true = encrypted
```

### 8.2 Crypto API

```typescript
import { 
  encrypt, 
  decrypt, 
  sha256, 
  hashPassword, 
  verifyPassword 
} from '@/lib/crypto'

// Cifrar datos
const encrypted = await encrypt('datos sensibles', 'password')

// Descifrar datos
const decrypted = await decrypt(encrypted, 'password')

// Hash de contraseña
const hashed = await hashPassword('mi-contraseña')
const isValid = await verifyPassword('mi-contraseña', hashed)
```

### 8.3 Storage API

```typescript
import { 
  dbGet, 
  dbSet, 
  dbRemove,
  encryptData,
  decryptData 
} from '@/lib/db'

// Guardar datos (con cifrado opcional)
await dbSet('user-profile', profileData, { encrypt: true })

// Recuperar datos
const profile = await dbGet('user-profile', { encrypted: true })

// Eliminar datos
await dbRemove('user-profile')
```

### 8.4 Componentes UI

#### Botón de Emergencia

```typescript
import { Button } from '@/components/ui'

<Button 
  variant="emergency"
  size="lg"
  onClick={handleEmergency}
>
  Activar Emergencia
</Button>
```

#### Modal de Diálogo

```typescript
import { Dialog, DialogContent, DialogTitle } from '@/components/ui'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Título del Modal</DialogTitle>
    {/* Contenido */}
  </DialogContent>
</Dialog>
```

---

## 9. Recursos Adicionales

### 9.1 Enlaces Útiles

- [Documentación React](https://react.dev/)
- [Documentación TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación Zustand](https://docs.pmnd.rs/zustand)
- [Documentación Tailwind](https://tailwindcss.com/docs)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

### 9.2 Contacto del Proyecto

- **Issues**: [GitHub Issues](https://github.com/organization/protocolo-cdmx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/organization/protocolo-cdmx/discussions)
- **Email**: dev@protocolo-cdmx.org

### 9.3 Licencia

Este proyecto está licenciado bajo GPL v3. Ver archivo [LICENSE](../LICENSE) para más detalles.

---

**Protocolo CDMX** - Desarrollado con ❤️ para la comunidad de la Ciudad de México
