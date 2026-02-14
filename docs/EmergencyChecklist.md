# Emergency Checklist Component

## 📍 Ubicación
`src/components/features/EmergencyChecklist.tsx`

## 🎯 Descripción
El componente EmergencyChecklist es el checklist operativo principal para la respuesta a incidentes en Protocolo CDMX. Guía a las brigadas a través de las primeras 60 minutos críticos de respuesta, organizado en 4 fases temporales con 28 items específicos.

## 📊 Estructura del Checklist

### FASE 1: Activación Inmediata (0-5 minutos) 🔴
**Color:** Rojo | **Items:** 6

Items críticos de activación inicial:
1. ✅ **Alerta recibida** - Verificar ubicación, hora, naturaleza de la amenaza
2. ✅ **Verificación de dos claves** - Protocolo de confirmación de alerta
3. ✅ **Líder de incidente designado** - Asignar y notificar al líder
4. ✅ **Equipo de seguridad enviado** - ETA confirmada
5. ✅ **Capacidad médica confirmada** - Personal de primeros auxilios disponible
6. ✅ **Kit médico verificado** - Ubicación y accesibilidad

**Roles principales:** Líder, Seguridad, Dispatch

### FASE 2: Evaluación en Escena (5-20 minutos) 🟠
**Color:** Naranja | **Items:** 8

Items de evaluación y seguridad:
1. ✅ **Protocolo P.A.S.** - Proteger, Avisar, Socorrer
2. ✅ **Actores armados evaluados** - Identificar y evaluar
3. ✅ **Desencadenante de retirada** - Determinar condiciones
4. ✅ **Menores presentes** - Identificar y contar
5. ✅ **Seguridad infantil** - Activar medidas especiales
6. ✅ **Autoridades documentadas** - Policía presente
7. ✅ **Identificación solicitada** - Si es seguro
8. ✅ **Testigos localizados** - Mínimo 2 identificados

**Roles principales:** Seguridad, Médico, Legal, Líder

### FASE 3: Documentación y Escalación (20-45 minutos) 🟡
**Color:** Amarillo | **Items:** 7

Items de documentación y coordinación:
1. ✅ **Registro completo** - Entradas con timestamps
2. ✅ **Enrutamiento DH** - CDHCM/CNDH seleccionado
3. ✅ **Alerta de coalición** - Evaluar nivel
4. ✅ **Consentimiento verificado** - Documentar consentimiento
5. ✅ **Punto seguro activado** - Capacidad confirmada
6. ✅ **Riesgo de represalia** - Evaluar riesgo
7. ✅ **Acompañamiento asignado** - Sistema de apoyo

**Roles principales:** Legal, Líder, Dispatch, Logística

### FASE 4: Estabilización y Seguimiento (45-60 minutos) 🟢
**Color:** Verde | **Items:** 7

Items de documentación final y planificación:
1. ✅ **Documentación fotográfica** - Completar evidencia visual
2. ✅ **Contacto de testigos** - Información asegurada
3. ✅ **Declaración registrada** - Del sobreviviente
4. ✅ **Lesiones documentadas** - Registro médico
5. ✅ **Cadena de custodia** - Iniciar protocolo
6. ✅ **Comunicación coalición** - Establecer contacto
7. ✅ **Plan de seguimiento** - Definir próximos pasos

**Roles principales:** Legal, Médico, Líder

## 🚀 Uso

### Uso Básico
```tsx
import { EmergencyChecklist } from '@/components/features'

function IncidentResponsePage({ incidentId }: { incidentId: string }) {
  return (
    <EmergencyChecklist 
      incidentId={incidentId}
      onItemComplete={(itemId, completed) => {
        console.log(`Item ${itemId} ${completed ? 'completado' : 'desmarcado'}`)
      }}
      onPhaseChange={(phase) => {
        console.log(`Fase cambiada a: ${phase}`)
      }}
      onExport={() => {
        console.log('Exportando checklist...')
      }}
    />
  )
}
```

### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `incidentId` | `string` | ID del incidente asociado | ✅ Sí |
| `onItemComplete` | `(itemId: string, completed: boolean) => void` | Callback al completar/desmarcar item | ❌ No |
| `onPhaseChange` | `(phase: EmergencyPhase) => void` | Callback al cambiar de fase | ❌ No |
| `onExport` | `() => void` | Callback al exportar a PDF | ❌ No |

## 🎨 Características de UI

### Colores por Fase
```
FASE 1 (0-5min):   🔴 Rojo    - Activación Inmediata
FASE 2 (5-20min):  🟠 Naranja - Evaluación en Escena
FASE 3 (20-45min): 🟡 Amarillo- Documentación y Escalación
FASE 4 (45-60min): 🟢 Verde   - Estabilización y Seguimiento
```

### Indicadores Visuales

#### Items Críticos 🔴
- Marcados con icono de alerta
- Prioridad alta en filtros
- Destacados visualmente

#### Items Obligatorios 🔒
- Marcados con icono de candado
- Deben completarse obligatoriamente
- Conteo especial en estadísticas

#### Items por Rol 👤
- Badge con rol requerido
- Filtro por rol disponible
- Solo muestra items relevantes al rol del usuario

### Barra de Progreso General
- Gradiente de colores (rojo → naranja → amarillo → verde)
- Porcentaje numérico grande
- Conteo de items completados/totales
- Contadores de items críticos y obligatorios pendientes

## ⚡ Funcionalidades

### 1. Check/Uncheck de Items

#### Completar Item
```
Click en checkbox → Item marcado → Timestamp automático → Sincronización
```
- ✅ Animación suave
- ✅ Haptic feedback (vibración)
- ✅ Timestamp automático
- ✅ Registro de usuario
- ✅ Sincronización inmediata

#### Desmarcar Item
```
Click en checkbox marcado → Modal de confirmación → Razón opcional → Desmarcado
```
- ⚠️ Modal de confirmación (previene errores)
- 📝 Campo de razón opcional
- 🔄 Revierte el estado
- 🗑️ Elimina timestamp

### 2. Filtros Avanzados

Panel de filtros desplegable:
- **Por Rol:** Filtrar items por rol responsable
- **Mostrar Completados:** Toggle on/off
- **Solo Críticos:** Mostrar solo items marcados como críticos

### 3. Navegación entre Fases

- Flechas anterior/siguiente
- Click en header de fase para expandir/colapsar
- Indicador visual de fase actual
- Persistencia de estado de expansión

### 4. Sincronización y Offline

#### Indicadores de Estado
```
🟢 En línea + Sincronizado
🟠 Modo offline
🔵 Sincronizando...
🟡 Pendiente de sincronizar
```

#### Funcionamiento Offline
- ✅ Todos los cambios se guardan localmente (IndexedDB)
- ✅ Funciona 100% sin conexión
- ✅ Sincronización automática al reconectar
- ✅ Cola de acciones pendientes

### 5. Exportación e Impresión

#### Exportar a PDF/Imprimir
```
Click en icono de impresora → Genera versión imprimible → Print dialog
```

**Incluye:**
- Todos los items con estado
- Timestamps de completados
- Usuario que completó
- Formato limpio para impresión
- Sin elementos de UI no esenciales

#### Compartir
```
Click en icono compartir → Share API (mobile) / Copy to clipboard (desktop)
```

## 🎭 Roles y Permisos

Cada item puede estar asignado a roles específicos:

```typescript
role: ['leader', 'security'] // Solo visible para líder y seguridad
```

### Roles Soportados
- **Líder** - Gestión general, toma de decisiones
- **Seguridad** - Evaluación de amenazas, retirada
- **Médico** - Primeros auxilios, evaluación médica
- **Legal** - Documentación, cadena de custodia
- **Dispatch** - Comunicaciones, coordinación
- **Logística** - Recursos, puntos seguros

## 📱 Interacciones Táctiles

### Gestos Soportados
- **Tap** - Completar/desmarcar item
- **Long-press** - Acciones adicionales (futuro)
- **Swipe** - Navegar entre fases (futuro)

### Feedback Háptico
- ✅ Vibración corta (50ms) al completar item
- ✅ Vibración larga al desmarcar
- ✅ Patrón especial para acciones críticas

## ♿ Accesibilidad

### Características
- ✅ **Screen reader labels** - Todos los elementos etiquetados
- ✅ **Keyboard navigation** - Navegación completa por teclado
- ✅ **ARIA attributes** - Estados y roles definidos
- ✅ **High contrast** - Colores con buen contraste
- ✅ **Large touch targets** - Mínimo 44x44px
- ✅ **Focus indicators** - Indicadores visuales claros

### Atributos ARIA
```html
<button aria-label="Completar item: Alerta recibida">
<div role="progressbar" aria-valuenow="45" aria-valuemax="100">
<section aria-expanded="true" aria-label="Fase 1: Activación Inmediata">
```

## 🔧 Integración con Store

### Zustand Store
```typescript
const store = useProtocoloStore()

// Inicializar checklist para incidente
store.initializeChecklist(incidentId)

// Completar item
store.toggleItem(incidentId, itemId, userPseudonym)

// Obtener progreso
const progress = store.getProgress(incidentId)
const phaseProgress = store.getPhaseProgress(incidentId, '0-5min')

// Obtener items
const phaseItems = store.getItemsByPhase(incidentId, '0-5min')
const completed = store.getCompletedItems(incidentId)
const pending = store.getPendingItems(incidentId)
```

### Persistencia Automática
- ✅ Guardado inmediato en IndexedDB
- ✅ Encriptación opcional
- ✅ Sincronización entre dispositivos
- ✅ Recuperación de estado tras recarga

## 📊 Estadísticas y Métricas

El componente calcula automáticamente:

```typescript
stats = {
  total: 28,           // Total de items
  completed: 15,       // Items completados
  progress: 54,        // Porcentaje general
  critical: 3,         // Críticos pendientes
  mandatory: 5         // Obligatorios pendientes
}
```

### Métricas por Fase
- Progreso individual por fase
- Items completados/pendientes
- Tiempo estimado vs real (futuro)

## 🎨 Personalización

### Temas
Soporta modo claro/oscuro automáticamente:
```
bg-white dark:bg-gray-900
text-gray-900 dark:text-white
```

### Colores de Fase
Modificar en `PHASES_DATA`:
```typescript
{
  id: '0-5min',
  color: 'text-red-600',
  bgColor: 'bg-red-50',
  borderColor: 'border-red-200'
}
```

### Items Personalizados
Agregar nuevos items al array `PHASES_DATA`:
```typescript
{
  id: 'f1-7',
  text: 'Nuevo item personalizado',
  completed: false,
  category: 'safety',
  timeWindow: '0-5min',
  mandatory: true,
  isCritical: true,
  role: ['leader', 'security'],
  description: 'Descripción opcional'
}
```

## 🧪 Testing

### Casos de Prueba

1. **Completar Item**
   ```
   Click en checkbox → Verificar timestamp → Verificar usuario
   ```

2. **Desmarcar Item**
   ```
   Click en completado → Modal aparece → Confirmar → Item desmarcado
   ```

3. **Filtros**
   ```
   Aplicar filtro por rol → Verificar items mostrados → Resetear filtro
   ```

4. **Offline**
   ```
   Desconectar internet → Completar items → Reconectar → Sincronización
   ```

## 🐛 Troubleshooting

### Problemas Comunes

**Items no se guardan:**
- Verificar que `incidentId` sea válido
- Revisar consola por errores de IndexedDB
- Verificar permisos de almacenamiento

**Filtros no funcionan:**
- Asegurar que los items tengan definido el campo `role`
- Verificar que el rol del usuario esté definido

**Progreso incorrecto:**
- Verificar que `checklist` esté inicializado
- Revisar que los IDs de items sean únicos

## 📝 Notas de Implementación

### Dependencias
- React 18+
- Zustand (state management)
- Lucide React (icons)
- Tailwind CSS (styling)

### Rendimiento
- ✅ Memoización de items filtrados
- ✅ Lazy rendering de fases colapsadas
- ✅ Debounce en actualizaciones
- ✅ Virtualización (para listas muy largas)

### Seguridad
- ✅ Sanitización de inputs
- ✅ Validación de IDs
- ✅ Encriptación de datos sensibles
- ✅ Sin exposición de información personal

## 🎉 Ejemplo Completo

```tsx
import { EmergencyChecklist } from '@/components/features'
import { useProtocoloStore } from '@/store'

function IncidentPage({ incidentId }: { incidentId: string }) {
  const store = useProtocoloStore()
  const currentUser = store.currentUser

  // Initialize checklist on mount
  useEffect(() => {
    if (!store.checklists[incidentId]) {
      store.initializeChecklist(incidentId)
    }
  }, [incidentId])

  const handleItemComplete = (itemId: string, completed: boolean) => {
    // Analytics tracking
    analytics.track('checklist_item_toggle', {
      incidentId,
      itemId,
      completed,
      user: currentUser?.pseudonym
    })
  }

  const handleExport = () => {
    // Generate PDF report
    generatePDFReport(incidentId)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EmergencyChecklist 
        incidentId={incidentId}
        onItemComplete={handleItemComplete}
        onPhaseChange={(phase) => console.log('Phase:', phase)}
        onExport={handleExport}
      />
    </div>
  )
}
```

---

**¡Checklist operativo listo para producción!** ✅

**Total:** 28 items organizados en 4 fases críticas
**Cobertura:** 100% del protocolo de respuesta de primera hora
**Features:** Offline, encriptado, accesible, imprimible