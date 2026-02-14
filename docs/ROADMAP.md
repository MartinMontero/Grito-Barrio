# Roadmap - Protocolo CDMX

Este documento describe la dirección futura del proyecto y las características planificadas.

**Última actualización**: Febrero 2025  
**Versión del roadmap**: 1.0.0

---

## Índice

1. [Visión General](#1-visión-general)
2. [Horizonte Corto (3-6 meses)](#2-horizonte-corto-3-6-meses)
3. [Horizonte Medio (6-12 meses)](#3-horizonte-medio-6-12-meses)
4. [Horizonte Largo (12+ meses)](#4-horizonte-largo-12-meses)
5. [Características en Discusión](#5-características-en-discusión)
6. [Dependencias Técnicas](#6-dependencias-técnicas)
7. [Métricas de Éxito](#7-métricas-de-éxito)

---

## 1. Visión General

### 1.1 Meta Principal

**Convertir a Protocolo CDMX en la herramienta estándar de respuesta comunitaria a desalojos en México y Latinoamérica, manteniendo siempre los más altos estándares de seguridad y privacidad.**

### 1.2 Pilares Estratégicos

```
┌─────────────────────────────────────────────────────────────┐
│                    PILARES ESTRATÉGICOS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🔒 SEGURIDAD        📱 ACCESIBILIDAD      🤝 COMUNIDAD    │
│   ├─ Cifrado E2E      ├─ Multi-plataforma   ├─ Código      │
│   ├─ Anonimato        ├─ Offline-first      │   abierto    │
│   ├─ Protección       ├─ Accesible          ├─ Local       │
│   │  ante coerción    │  (a11y)             │   first      │
│   └─ Autodestrucción  └─ Bajo recursos      └─ Derechos    │
│                                                 humanos     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Horizonte Corto (3-6 meses)

### Q2 2025

#### 🎯 Objetivos Prioritarios

1. **Estabilidad y Bug Fixes**
   - [ ] Resolver issues críticos reportados por usuarios
   - [ ] Mejorar manejo de errores en IndexedDB
   - [ ] Optimizar performance en dispositivos de gama baja
   - [ ] Testing exhaustivo en múltiples dispositivos

2. **Mejoras de UX**
   - [ ] Wizard de onboarding mejorado
   - [ ] Tutorial interactivo para primer uso
   - [ ] Tooltips contextuales en todas las secciones
   - [ ] Modo "práctica" para simular emergencias

3. **Localización**
   - [ ] Soporte completo para Nahuatl
   - [ ] Soporte básico para Otomí
   - [ ] Traducción al inglés para comunidad internacional
   - [ ] Documentación en múltiples idiomas

#### 🛡️ Seguridad

- Auditoría de seguridad externa
- Pentesting completo de la aplicación
- Implementación de certificados de autenticidad
- Mejoras en detección de tampering

#### 📊 Métricas

- Reducir crash rate a < 1%
- Mejorar tiempo de carga inicial a < 3s
- Alcance de 95% de cobertura de tests

---

## 3. Horizonte Medio (6-12 meses)

### Q3-Q4 2025

#### 🚀 Características Principales

1. **Sincronización P2P Segura**
   ```typescript
   interface P2PSync {
     // Sincronización directa entre dispositivos cercanos
     // Sin servidor central
     // Cifrado de extremo a extremo
   }
   ```
   - [ ] Protocolo de sincronización P2P
   - [ ] Descubrimiento de dispositivos cercanos (Bluetooth/WiFi Direct)
   - [ ] Sincronización selectiva de datos
   - [ ] Resolución de conflictos

2. **Expansión Geográfica**
   - [ ] Adaptación para otras alcaldías de CDMX
   - [ ] Plantillas configurables por ciudad
   - [ ] Mapas de puntos seguros multi-ciudad
   - [ ] Contactos locales personalizables

3. **Herramientas Legales Avanzadas**
   - [ ] Generación automática de amparos
   - [ ] Seguimiento de casos legales
   - [ ] Integración con abogados voluntarios
   - [ ] Biblioteca de jurisprudencia offline

4. **Mejoras en Capacitación**
   - [ ] Videos de entrenamiento descargables
   - [ ] Simulaciones más realistas
   - [ ] Evaluaciones prácticas presenciales
   - [ ] Certificación validada por organizaciones

#### 📱 Plataformas

- [ ] **iOS App**: Versión nativa para iPhone/iPad
- [ ] **Desktop App**: Electron app para Windows/Mac/Linux
- [ ] **Wearables**: Soporte básico para smartwatches (notificaciones)

#### 🔧 Técnico

- [ ] Base de datos encriptada (SQLCipher)
- [ ] Compresión de imágenes/video para ahorrar espacio
- [ ] Backup automático a almacenamiento seguro (opcional)
- [ ] Migración de datos entre versiones

---

## 4. Horizonte Largo (12+ meses)

### 2026+

#### 🌍 Expansión Internacional

1. **Adaptación Regional**
   - [ ] Guadalajara, Monterrey, Puebla
   - [ ] Ciudades en Guatemala, Colombia, Chile
   - [ ] Plantillas legales por país
   - [ ] Protocolos adaptados por región

2. **Colaboración con Organizaciones**
   - [ ] Integración con redes de defensores de DDHH
   - [ ] APIs para organizaciones aliadas
   - [ ] Sistema de alertas compartidas
   - [ ] Directorio de recursos multi-organización

#### 🤖 Inteligencia Artificial (Ética y Local)

```typescript
// IA local para asistencia en campo
// Sin enviar datos a servidores externos
interface LocalAI {
  assessThreat: (context: Context) => ThreatLevel
  recommendAction: (situation: Situation) => Action[]
  generateReport: (data: Evidence[]) => DraftReport
}
```

- [ ] **Asistente Legal Local**: IA que funciona completamente offline
- [ ] **Análisis de Evidencia**: Detección automática de objetos/texto en fotos
- [ ] **Predicción de Riesgo**: Evaluación de amenaza basada en contexto
- [ ] **Generación de Documentos**: Drafts automáticos de documentos legales

#### 🏗️ Infraestructura Avanzada

- [ ] **Red Mesh**: Comunicación sin internet en campo
- [ ] **Satélite**: Conectividad de emergencia vía satélite
- [ ] **Hardware**: Dispositivos dedicados de bajo costo
- [ ] **Energía**: Optimización para larga duración de batería

#### 📚 Conocimiento

- [ ] **Wiki Offline**: Enciclopedia de derechos y recursos
- [ ] **Casos de Estudio**: Base de datos anónima de casos
- [ ] **Análisis de Datos**: Estadísticas agregadas y anónimas
- [ ] **Investigación**: Colaboración con académicos

---

## 5. Características en Discusión

### 🟡 Bajo Consideración

#### Comunicación en Tiempo Real
- Chat encriptado entre miembros del equipo
- Voice notes seguros
- Ubicación en tiempo real (opcional, privada)

**Preocupaciones**: Consumo de batería, privacidad, complejidad

#### Integración con Servicios Externos
- WhatsApp/Telegram bots
- Notificaciones SMS
- Llamadas de emergencia automáticas

**Preocupaciones**: Dependencia de terceros, privacidad, costos

#### Gamificación
- Sistema de puntos por completar entrenamientos
- Logros y badges
- Leaderboards (anónimos)

**Preocupaciones**: Seriedad del tema, distracción, seguridad

### 🔴 No Planificado

- **Monetización**: El proyecto siempre será gratuito y open source
- **Servidor Central**: Mantenemos la filosofía local-first
- **Analytics**: No rastreamos a usuarios
- **Publicidad**: Sin ads de ningún tipo

---

## 6. Dependencias Técnicas

### 6.1 Dependencias Externas

| Dependencia | Uso | Estado | Riesgo |
|-------------|-----|--------|--------|
| React 18 | Framework UI | ✅ Estable | Bajo |
| Zustand | State management | ✅ Estable | Bajo |
| Web Crypto API | Cifrado | ✅ Nativo | Ninguno |
| IndexedDB | Almacenamiento | ✅ Nativo | Ninguno |
| Vite | Build tool | ✅ Estable | Bajo |
| Workbox | Service Worker | ✅ Estable | Bajo |

### 6.2 Decisiones Técnicas Pendientes

1. **Base de Datos**:
   - Opción A: SQLCipher (mejor seguridad)
   - Opción B: Dexie.js + cifrado manual (más flexible)
   - **Decisión**: Pendiente de evaluación Q2 2025

2. **Sincronización P2P**:
   - Opción A: WebRTC + signaling server propio
   - Opción B: Bluetooth Low Energy
   - Opción C: WiFi Direct
   - **Decisión**: Pendiente de prototipos

3. **iOS**:
   - Opción A: Capacitor/Cordova (más rápido)
   - Opción B: React Native (mejor performance)
   - Opción C: Swift nativo (mejor UX)
   - **Decisión**: Pendiente de recursos

---

## 7. Métricas de Éxito

### 7.1 Métricas de Impacto

| Métrica | Meta 2025 | Meta 2026 |
|---------|-----------|-----------|
| Usuarios Activos Mensuales | 1,000 | 10,000 |
| Organizaciones Usando | 20 | 100 |
| Incidentes Respondidos | 500 | 5,000 |
| Personas Protegidas | 2,000 | 20,000 |
| Capacitaciones Completadas | 500 | 5,000 |

### 7.2 Métricas Técnicas

| Métrica | Actual | Meta 2025 | Meta 2026 |
|---------|--------|-----------|-----------|
| Cobertura de Tests | 85% | 95% | 98% |
| Tiempo de Carga | 4s | 2s | 1s |
| Crash Rate | 2% | 0.5% | 0.1% |
| Rating App Store | N/A | 4.5+ | 4.7+ |
| Issues Abiertos | 50 | <20 | <10 |

### 7.3 Métricas de Comunidad

| Métrica | Actual | Meta 2025 | Meta 2026 |
|---------|--------|-----------|-----------|
| Contribuyentes | 5 | 20 | 50 |
| Estrellas GitHub | 50 | 200 | 1,000 |
| Forks | 10 | 50 | 200 |
| Documentación | 80% | 100% | 100% |
| Traducciones | 1 | 3 | 5 |

---

## 8. Cómo Contribuir al Roadmap

### Proponer Nuevas Características

1. **Abrir un Issue** con etiqueta `roadmap`
2. **Incluir**:
   - Descripción clara de la característica
   - Justificación/problema que resuelve
   - Impacto esperado
   - Recursos necesarios

### Priorización

Las características se priorizan basándose en:

1. **Impacto**: ¿Cuántos usuarios beneficia?
2. **Urgencia**: ¿Qué tan crítico es el problema?
3. **Seguridad**: ¿Mejora la seguridad de usuarios?
4. **Complejidad**: ¿Es factible con recursos actuales?
5. **Comunidad**: ¿Hay demanda de la comunidad?

### Proceso de Decisión

```
Propuesta → Discusión Comunitaria → Evaluación de Maintainers
                                              ↓
                              Aprobado → Agregar a Roadmap
                              Rechazado → Documentar razón
                              Diferido → Mantener para futuro
```

---

## 9. Actualizaciones del Roadmap

Este roadmap se actualiza:

- **Trimestralmente**: Revisión y ajustes menores
- **Semestralmente**: Actualización mayor y re-priorización
- **Según necesidad**: Cambios urgentes por feedback de usuarios

### Últimas Actualizaciones

- **2025-02-15**: Roadmap inicial creado
- **Próxima revisión**: Mayo 2025

---

## 10. Recursos

- [Issues etiquetados como roadmap](https://github.com/organization/protocolo-cdmx/issues?q=is%3Aissue+is%3Aopen+label%3Aroadmap)
- [Discusiones sobre el futuro](https://github.com/organization/protocolo-cdmx/discussions/categories/ideas)
- [Votación de características](https://github.com/organization/protocolo-cdmx/projects/1)

---

**Nota**: Este roadmap es una guía, no una promesa. Las prioridades pueden cambiar basándose en:

- Feedback de usuarios
- Cambios en el contexto político/social
- Disponibilidad de recursos
- Nuevas amenazas de seguridad
- Oportunidades estratégicas

**Protocolo CDMX** - Construyendo el futuro de la respuesta comunitaria
