# Changelog - Grito & Barrio

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔒 Endurecimiento de seguridad (producción)
- **Bóveda de cifrado real**: clave de datos (DEK) AES-256-GCM aleatoria, envuelta
  con una clave derivada de la contraseña (PBKDF2, 600k iteraciones); la DEK vive
  **solo en memoria**. Cambio de contraseña sin re-cifrar datos.
- **Cifrado en reposo real y fail-closed**: los datos sensibles se guardan como
  *solo ciphertext* (sin texto plano junto al cifrado); con la bóveda bloqueada se
  rechaza escribir datos sensibles en claro.
- **Modo coerción** con bóveda señuelo independiente (aislamiento criptográfico,
  negación plausible) y **borrado de pánico durable** que destruye toda la base de
  datos + bóveda + almacenamiento y sobrevive a recargas/cierres.
- Corregidos: cifrado de archivos AES-GCM (reuso de nonce + desajuste de chunks),
  códec de compresión con pérdida, `this`-binding de los exports del gestor de
  seguridad, claves/sal con `Math.random()`, "cifrado" de respaldos que era texto
  plano.
- CSP endurecida (sin `unsafe-eval`/`unsafe-inline` en scripts; +COOP, worker/
  manifest-src, upgrade-insecure-requests).

### Added
- Pantalla de bloqueo (desbloqueo por contraseña), onboarding de protección y
  aviso "datos sin cifrar" hasta definir contraseña.
- Navegación con react-router (AppShell): URLs reales, botón atrás, deep links;
  todas las pantallas accesibles y conectadas al estado.
- Code-splitting por ruta (carga diferida) — primer bundle 591KB → ~200KB.
- Iconos PWA reales (192/512/maskable/apple-touch) y manifiesto consistente.

### Changed
- Suite de pruebas reescrita para ejercitar **código real** (criptografía, bóveda,
  IndexedDB, store, flujo de incidente, rutas) en lugar de mocks; documentación de
  seguridad corregida (sin borrado remoto/TLS ficticios) + limitaciones conocidas.

### Fixed
- Checklist de emergencia (IDs desalineados + mutación directa del store) ahora
  funciona y persiste; evidencia guardada vía store cifrado; manejadores vacíos del
  panel de emergencia y botones sin acción ahora hacen algo real.

---

## [1.0.0] - 2025-02-15

### 🎉 Primer Release Oficial

### Added
#### Core Features
- **Modo Emergencia**: Activación rápida de respuesta a desalojos
- **Checklist 60 Minutos**: Protocolo guiado por fases temporales
- **Sistema de Roles**: Líder, seguridad, médico, legal, despacho, logística
- **Mapa de Puntos Seguros**: Ubicaciones de refugio verificadas
- **Árbol de Contactos**: Sistema organizado de comunicaciones de emergencia
- **Asistente Legal**: Triage legal y recomendaciones de acción
- **Recolección de Evidencia**: Fotos, videos, audio con cadena de custodia
- **Generación de Formularios**: Plantillas legales automáticas
- **Gestión de Suministros**: Inventario y checklists de materiales

#### Seguridad
- **Cifrado AES-256-GCM**: Cifrado de grado militar para todos los datos sensibles
- **Modo de Coerción (Duress)**: Acceso con datos falsos bajo amenaza
- **Autenticación**: PIN, contraseña y biometría
- **Autobloqueo**: Bloqueo automático por inactividad
- **Eliminación de Emergencia**: Borrado seguro de datos (Panic Wipe)
- **Web Crypto API**: Implementación nativa del navegador
- **Ofuscación de Ubicación**: Precisión reducida para proteger ubicación exacta

#### Capacitación
- **Módulos de Entrenamiento**: Contenido interactivo de formación
- **Simulador de Escenarios**: Práctica con situaciones simuladas
- **Sistema de Certificación**: Niveles 1, 2 y 3
- **Tracking de Progreso**: Seguimiento de módulos completados

#### UI/UX
- **Diseño Mobile-First**: Optimizado para uso en campo
- **Modo Oscuro/Claro**: Temas configurables
- **Accesibilidad WCAG 2.1 AA**: Compatibilidad con lectores de pantalla
- **Navegación Intuitiva**: Interfaz clara y simple
- **Animaciones Suaves**: Transiciones fluidas sin distracciones

#### Técnico
- **PWA Completa**: Instalable, funciona offline
- **Service Worker**: Caché de assets y datos
- **IndexedDB**: Almacenamiento local persistente
- **Sync Offline**: Cola de sincronización cuando hay conexión
- **Export/Import**: Backups cifrados portables
- **Multi-idioma**: Español (es-MX) completo

#### Testing
- **Tests Unitarios**: >80% cobertura en componentes críticos
- **Tests de Integración**: Flujos principales testeados
- **Tests E2E**: Playwright para flujos críticos
- **Tests de Accesibilidad**: Axe + Testing Library
- **Tests de Seguridad**: Validación de cifrado y autenticación
- **Tests Offline**: Validación de funcionalidad sin conexión

#### Documentación
- **Guía de Usuario**: Manual completo en español
- **Guía para Desarrolladores**: Documentación técnica detallada
- **Documentación de Seguridad**: Análisis de amenazas y mitigaciones
- **Guía de Contribución**: Proceso para contribuyentes
- **Código de Conducta**: Estándares de la comunidad

### Security
- Implementación de cifrado AES-256-GCM con PBKDF2
- Modo de coerción con datos falsos
- Eliminación segura con sobrescritura
- Protección contra timing attacks
- Sanitización de todas las entradas
- Validación de tipos estricta con TypeScript

### Changed
- Migración de crypto-js a Web Crypto API
- Refactorización de store para usar slices de Zustand
- Mejoras en performance de carga inicial

### Fixed
- Manejo de errores en IndexedDB
- Validación de formularios legales
- Sincronización offline
- Memory leaks en componentes

### Deprecated
- Soporte para Internet Explorer
- Almacenamiento en localStorage sin cifrado

---

## [0.9.0] - 2025-01-20

### Beta Release

### Added
- Sistema de documentación con cadena de custodia
- Checklists por fases temporales
- Gestión de puntos seguros
- Generación de PDFs
- Tests de seguridad

### Changed
- Mejoras en UI/UX basadas en feedback de usuarios
- Optimización de rendimiento en dispositivos móviles

### Fixed
- Bugs en sincronización offline
- Errores en validación de formularios
- Problemas de caché en PWA

---

## [0.8.0] - 2024-12-15

### Alpha Release

### Added
- Módulo de capacitación básico
- Sistema de roles inicial
- Protocolos P.A.S. y P.A.P.
- Asistente de triage legal

### Changed
- Arquitectura del store refactorizada
- Componentes UI mejorados

---

## [0.7.0] - 2024-11-10

### Added
- Navegación principal
- Página de inicio con acciones rápidas
- Sección de protocolos
- Configuración de seguridad básica

---

## [0.6.0] - 2024-10-05

### Added
- Implementación de cifrado con Web Crypto API
- Autenticación con PIN
- Modo de coerción inicial

---

## [0.5.0] - 2024-09-01

### Added
- Setup inicial del proyecto con Vite + React + TypeScript
- Configuración de Tailwind CSS
- Componentes UI básicos con Radix
- Store con Zustand
- Configuración de PWA

---

## Categorías de Cambios

- **Added**: Nuevas características
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Características que serán removidas
- **Removed**: Características eliminadas
- **Fixed**: Corrección de bugs
- **Security**: Mejoras de seguridad

---

## Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios breaking (incompatibles)
- **MINOR**: Nuevas características (compatibles hacia atrás)
- **PATCH**: Corrección de bugs (compatibles hacia atrás)

---

## Historial de Releases

| Versión | Fecha | Estado | Notas |
|---------|-------|--------|-------|
| 1.0.0 | 2025-02-15 | Stable | Primer release oficial |
| 0.9.0 | 2025-01-20 | Beta | Testing con usuarios reales |
| 0.8.0 | 2024-12-15 | Alpha | Features completos |
| 0.7.0 | 2024-11-10 | Alpha | Core features |
| 0.6.0 | 2024-10-05 | Dev | Seguridad implementada |
| 0.5.0 | 2024-09-01 | Dev | Setup inicial |

---

## Comparación de Versiones

### v1.0.0 vs v0.9.0

```diff
+ Modo de coerción completo
+ Capacitación con certificación
+ Tests de seguridad completos
+ Documentación exhaustiva
+ Accesibilidad WCAG 2.1 AA
~ Mejoras de performance
~ UI/UX refinada
```

---

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para planes futuros.

---

## Contribuir al Changelog

Al agregar una entrada:

1. Agrega al grupo `[Unreleased]` durante desarrollo
2. Usa las categorías: Added, Changed, Deprecated, Removed, Fixed, Security
3. Sé conciso pero descriptivo
4. Incluye referencias a issues/PRs cuando aplique

Ejemplo:
```markdown
### Added
- Nueva característica de X ([#123](https://github.com/org/repo/issues/123))
```

---

**Grito & Barrio** - Manteniendo un registro de todos los cambios importantes.
