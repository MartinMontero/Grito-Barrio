# Cómo Contribuir - Protocolo CDMX

¡Gracias por tu interés en contribuir a Protocolo CDMX! Este documento proporciona las pautas y el proceso para contribuir al proyecto.

---

## Índice

1. [Código de Conducta](#1-código-de-conducta)
2. [Tipos de Contribuciones](#2-tipos-de-contribuciones)
3. [Proceso de Contribución](#3-proceso-de-contribución)
4. [Estándares de Código](#4-estándares-de-código)
5. [Testing](#5-testing)
6. [Documentación](#6-documentación)
7. [Revisión de Código](#7-revisión-de-código)
8. [Reconocimiento](#8-reconocimiento)

---

## 1. Código de Conducta

Este proyecto sigue nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Al participar, se espera que mantengas este código.

**Resumen**:
- Sé respetuoso y constructivo
- Acepta críticas constructivas
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros

---

## 2. Tipos de Contribuciones

### 2.1 Tipos de Contribuciones Bienvenidas

- 🐛 **Bug Reports**: Reportar errores o comportamientos inesperados
- 💡 **Feature Requests**: Sugerir nuevas características
- 📝 **Documentation**: Mejorar documentación existente
- 🎨 **UI/UX**: Mejorar diseño o experiencia de usuario
- 🌐 **Traducciones**: Traducir la app a otros idiomas
- 🔒 **Seguridad**: Reportar o corregir vulnerabilidades
- ✅ **Testing**: Agregar tests o mejorar cobertura
- ⚡ **Performance**: Optimizar rendimiento

### 2.2 Áreas de Prioridad

| Prioridad | Área | Descripción |
|-----------|------|-------------|
| 🔴 Alta | Seguridad | Cifrado, autenticación, protección de datos |
| 🔴 Alta | Accesibilidad | WCAG 2.1 AA compliance |
| 🟡 Media | Performance | Optimización offline, velocidad de carga |
| 🟡 Media | Testing | Cobertura de tests, tests E2E |
| 🟢 Baja | Documentación | Tutoriales, videos, ejemplos |

---

## 3. Proceso de Contribución

### 3.1 Fork y Clone

```bash
# 1. Haz fork del repositorio en GitHub
# 2. Clona tu fork
git clone https://github.com/tu-usuario/protocolo-cdmx.git
cd protocolo-cdmx

# 3. Agrega el repositorio original como upstream
git remote add upstream https://github.com/organization/protocolo-cdmx.git

# 4. Crea una rama para tu contribución
git checkout -b feature/nombre-descriptivo
```

### 3.2 Flujo de Trabajo

```
main (protegida)
  ↓
develop (protegida)
  ↓
feature/tu-feature  ← Tu rama de trabajo
  ↓
PR → Code Review → Merge a develop
  ↓
Release → Merge a main
```

### 3.3 Desarrollo

```bash
# 1. Asegúrate de tener la última versión de develop
git checkout develop
git pull upstream develop

# 2. Crea tu rama de feature
git checkout -b feature/nueva-caracteristica

# 3. Instala dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm run dev

# 5. Realiza tus cambios siguiendo los estándares de código

# 6. Ejecuta tests
npm run test

# 7. Verifica linting
npm run lint

# 8. Haz commits siguiendo conventional commits
git add .
git commit -m "feat: agrega nueva característica"

# 9. Sube tu rama
git push origin feature/nueva-caracteristica
```

### 3.4 Crear Pull Request

1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. Selecciona `develop` como base
4. Completa la plantilla de PR
5. Asigna reviewers
6. Link issues relacionados

**Plantilla de PR**:

```markdown
## Descripción
Breve descripción de los cambios realizados

## Tipo de Cambio
- [ ] Bug fix (cambio no-breaking que arregla un issue)
- [ ] Nueva característica (cambio no-breaking que agrega funcionalidad)
- [ ] Breaking change (cambio que puede romper funcionalidad existente)
- [ ] Documentación

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He agregado tests para mi código
- [ ] Todos los tests pasan localmente
- [ ] He actualizado la documentación
- [ ] He revisado mi código
- [ ] He verificado accesibilidad (si aplica UI)

## Screenshots (si aplica)

## Issue Relacionado
Closes #123
```

---

## 4. Estándares de Código

### 4.1 Estilo de Código

Usamos ESLint y Prettier para mantener consistencia:

```bash
# Formatear código
npx prettier --write .

# Verificar linting
npm run lint

# Auto-arreglar problemas de linting
npm run lint -- --fix
```

### 4.2 Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Tipos**:
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltantes, etc.
- `refactor`: Refactorización de código
- `test`: Agregar o corregir tests
- `chore`: Actualizar tareas de build, dependencias, etc.

**Ejemplos**:

```bash
feat(emergency): agrega botón de pánico
fix(encryption): corrige manejo de claves en modo offline
docs(readme): actualiza instrucciones de instalación
test(store): agrega tests para incidentSlice
style(components): formatea con prettier
refactor(hooks): extrae lógica de useEmergency
chore(deps): actualiza react a v18.3
```

### 4.3 Estructura de Archivos

```
src/
├── components/
│   ├── features/          # Componentes de características
│   │   ├── Emergency*.tsx
│   │   ├── Legal*.tsx
│   │   └── ...
│   ├── layout/            # Componentes de layout
│   └── ui/                # Componentes UI reutilizables
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades
├── store/                 # Zustand slices
├── tests/                 # Tests
└── types/                 # TypeScript types
```

### 4.4 Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes | PascalCase | `EmergencyButton.tsx` |
| Hooks | camelCase + use | `useEmergency.ts` |
| Funciones | camelCase | `activateEmergency()` |
| Constantes | UPPER_SNAKE_CASE | `CRYPTO_CONSTANTS` |
| Interfaces | PascalCase | `UserProfile` |
| Types | PascalCase | `TeamRole` |
| Files | camelCase | `incidentSlice.ts` |

---

## 5. Testing

### 5.1 Requisitos de Testing

- **Unit Tests**: Cada función pura debe tener tests
- **Integration Tests**: Flujos principales deben tener tests
- **Cobertura mínima**: 80% líneas, 80% funciones, 70% branches

### 5.2 Escribiendo Tests

```typescript
// src/tests/unit/ejemplo.test.ts
import { describe, it, expect } from 'vitest'
import { funcionATestear } from '@/lib/ejemplo'

describe('Función a Testear', () => {
  it('debería hacer X correctamente', () => {
    const resultado = funcionATestear(input)
    expect(resultado).toBe(expectedOutput)
  })
  
  it('debería manejar errores', () => {
    expect(() => funcionATestear(null)).toThrow()
  })
})
```

### 5.3 Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests unitarios
npm run test:unit

# Con cobertura
npm run test -- --coverage

# Modo watch
npm run test -- --watch

# Tests específicos
npm run test -- src/tests/unit/crypto.test.ts
```

---

## 6. Documentación

### 6.1 Tipos de Documentación

- **Código**: JSDoc para funciones públicas
- **README.md**: Actualizar si cambia instalación o uso
- **CHANGELOG.md**: Agregar entrada para cada cambio
- **Guías**: Crear/actualizar guías en `/docs`

### 6.2 Documentación de Código

```typescript
/**
 * Activa el modo de emergencia
 * 
 * @param reason - Razón de la activación
 * @param severity - Nivel de severidad (1-5)
 * @returns ID del incidente creado
 * @throws Error si no hay usuario autenticado
 * 
 * @example
 * ```typescript
 * const incidentId = await activateEmergency('Desalojo inminente', 5)
 * ```
 */
export async function activateEmergency(
  reason: string,
  severity: number
): Promise<string> {
  // Implementation
}
```

---

## 7. Revisión de Código

### 7.1 Proceso de Review

1. **Auto-review**: Revisa tu propio PR antes de solicitar review
2. **Reviewer asignado**: Mínimo 1 aprobación requerida
3. **Checks CI/CD**: Todos los checks deben pasar
4. **Resolución de comentarios**: Address todos los comentarios
5. **Merge**: Solo maintainers pueden hacer merge

### 7.2 Checklist de Review

**Para Reviewers**:
- [ ] Código cumple con estándares
- [ ] Tests incluidos y pasan
- [ ] Documentación actualizada
- [ ] No hay console.logs
- [ ] No hay datos sensibles hardcodeados
- [ ] Accesibilidad considerada (si aplica UI)
- [ ] Rendimiento optimizado

**Para Autores**:
- [ ] PR es pequeño y enfocado (< 500 líneas ideal)
- [ ] Descripción clara de cambios
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Sin conflictos con develop

### 7.3 Tips para PRs Exitosas

1. **PRs pequeños**: Facilitan review rápido
2. **Descripción clara**: Explica el "por qué" no solo el "qué"
3. **Screenshots**: Para cambios de UI
4. **Tests**: Siempre incluir tests
5. **Comunicación**: Responder a comentarios rápidamente

---

## 8. Reconocimiento

### 8.1 Contribuyentes

Todos los contribuyentes serán reconocidos en:

- Archivo `CONTRIBUTORS.md`
- Sección de contribuyentes en README
- Release notes

### 8.2 Niveles de Contribución

| Nivel | Contribución | Reconocimiento |
|-------|--------------|----------------|
| 🌱 Primerizo | 1-2 PRs | Mención en CONTRIBUTORS |
| 🌿 Regular | 3-9 PRs | Mención + Insignia |
| 🌳 Experto | 10+ PRs | Mención + Insignia + Acceso especial |
| ⭐ Maintainer | Consistente + calidad | Acceso de mantenedor |

### 8.3 Hall of Fame

Reconocimiento especial para:

- **Security Researchers**: Reportes de vulnerabilidades válidas
- **Bug Hunters**: Reportes de bugs críticos
- **Doc Stars**: Mejoras significativas en documentación
- **Community Champions**: Ayuda a otros contribuyentes

---

## Preguntas Frecuentes

### ¿Puedo trabajar en un issue existente?

¡Sí! Comenta en el issue diciendo que te gustaría trabajar en él.

### ¿Cuánto tiempo tengo para completar un PR?

No hay límite estricto, pero si no hay actividad en 2 semanas, el issue puede ser reasignado.

### ¿Puedo contribuir sin saber programar?

¡Absolutamente! Puedes:
- Reportar bugs
- Mejorar documentación
- Traducir contenido
- Diseñar UI/UX
- Escribir tutoriales

### ¿Qué pasa si mi PR es rechazado?

No te preocupes, es parte del proceso. Los maintainers te explicarán por qué y cómo mejorarlo.

---

## Recursos

- [Guía para Desarrolladores](./DEVELOPER.md)
- [Documentación de Seguridad](./SECURITY.md)
- [Guía de Usuario](./USER_GUIDE.md)
- [Discord/Slack del proyecto]

---

## Contacto

- **Issues**: [GitHub Issues](https://github.com/organization/protocolo-cdmx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/organization/protocolo-cdmx/discussions)
- **Email**: contribute@protocolo-cdmx.org

---

**¡Gracias por contribuir a Protocolo CDMX!** 🙏

Tu trabajo ayuda a proteger a defensores de derechos humanos en la Ciudad de México.
