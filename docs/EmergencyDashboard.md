# Emergency Dashboard Component

## 📍 Ubicación
`src/components/features/EmergencyDashboard.tsx`

## 🎯 Descripción
El Emergency Dashboard es la pantalla principal de respuesta a incidentes para la aplicación Protocolo CDMX. Proporciona una interfaz completa para gestionar incidentes activos, incluyendo temporizador de fases, checklist de respuesta, estado del equipo, y activación de retirada.

## 📦 Estructura del Componente

El componente está compuesto por varios sub-componentes:

### 1. EmergencyTimer
- Temporizador en tiempo real desde el inicio del incidente
- Indicador de fase actual (0-5min, 5-20min, 20-45min, 45-60min)
- Barra de progreso visual por fase
- Timeline de todas las fases

### 2. TeamStatus
- Lista de miembros del equipo asignados
- Estado de cada miembro (En camino, En escena, Activo, etc.)
- Nivel de certificación y rol
- ETA (tiempo estimado de llegada)

### 3. ChecklistSection
- Checklist organizado por fases temporales
- Items categorizados (Seguridad, Legal, Médico, etc.)
- Auto-timestamp al completar items
- Indicadores de progreso por fase y global
- Soporte para items obligatorios

### 4. RoleSpecificPanel
- Panel de acciones específicas según el rol del usuario:
  - **Líder**: Gestión de equipo, escalación
  - **Seguridad**: Evaluación de amenazas, activar retirada
  - **Médico**: Protocolo P.A.S., evaluar heridos
  - **Legal**: Cadena de custodia, documentar evidencia
  - **Dispatch**: Árbol de contactos, coordinar recursos

### 5. WithdrawalTriggers
- Grid de desencadenantes de retirada
- Activación con doble-tap para prevenir errores
- Feedback háptico (vibración)
- Triggers incluidos:
  - Armas de fuego presentes
  - Grupos armados
  - Amenazas de secuestro
  - Escalación hacia menores
  - Emergencia médica grave
  - Violencia por autoridades

## 🚀 Uso

### Uso Básico
```tsx
import { EmergencyDashboard } from '@/components/features'

function App() {
  return (
    <EmergencyDashboard 
      onWithdrawalTrigger={(reason) => console.log('Retirada:', reason)}
      onDocumentPress={() => console.log('Abrir cámara')}
      onContactPress={() => console.log('Abrir contactos')}
    />
  )
}
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `onWithdrawalTrigger` | `(reason: string) => void` | Callback cuando se activa retirada |
| `onDocumentPress` | `() => void` | Callback al presionar botón de documentar |
| `onContactPress` | `() => void` | Callback al presionar botón de contactos |

## 🎨 Diseño

### Características Visuales
- **Mobile-first**: Diseñado para dispositivos móviles
- **Alto contraste**: Colores brillantes para visibilidad al aire libre
- **Touch targets grandes**: Mínimo 44px para fácil interacción
- **Paleta de colores**:
  - Rojo: Alertas, emergencias, crítico
  - Naranja: Retirada, advertencias
  - Amarillo: Fases intermedias
  - Verde: Completado, éxito
  - Azul: Información, fases finales

### Fases del Temporizador
```
0-5 min:   Rojo    (Activación Inmediata)
5-20 min:  Naranja (Evaluación en Escena)
20-45 min: Amarillo(Documentación Legal)
45-60 min: Azul    (Soporte Sostenido)
```

### Niveles de Amenaza
```
Bajo:      Verde
Moderado:  Amarillo
Alto:      Naranja
Crítico:   Rojo
Extremo:   Púrpura
```

## ⚡ Funcionalidades Interactivas

### Temporizador
- Actualización en tiempo real cada segundo
- Cálculo automático de fase basado en tiempo transcurrido
- Transiciones suaves en barras de progreso
- Persistencia del tiempo de inicio

### Checklist
- Animaciones suaves al completar items
- Haptic feedback (vibración) al marcar items
- Timestamps automáticos
- Persistencia del estado
- Items obligatorios marcados con asterisco (*)

### Retirada
- Doble-tap requerido para activar (previene errores)
- Confirmación visual antes de activar
- Feedback háptico prolongado
- Registro automático en el incidente

## ♿ Accesibilidad

### Características Incluidas
- ✅ Labels descriptivos para screen readers
- ✅ Navegación por teclado completa
- ✅ Contraste alto para modo outdoor
- ✅ Iconos con texto alternativo
- ✅ Estados visuales claros (completado/pendiente)
- ✅ Tamaños de touch target adecuados

### Atributos ARIA
- Botones con `aria-label` descriptivo
- Checkboxes con estados `aria-checked`
- Alertas con `role="alert"`
- Progreso con `role="progressbar"`

## 🔧 Integración con Store

El componente se integra directamente con el Zustand store:

```typescript
const store = useProtocoloStore()
const activeIncident = store.getActiveIncident()
const currentUser = store.currentUser

// Crear incidente
const incidentId = store.createIncident(alertData)

// Inicializar checklist
store.initializeChecklist(incidentId)

// Completar item
store.toggleItem(incidentId, itemId, userPseudonym)

// Asignar equipo
store.assignTeamMember(incidentId, teamMember)

// Activar retirada
store.triggerWithdrawal(incidentId, reason)
```

## 📱 Estados de la UI

### Sin Incidente Activo
Cuando no hay un incidente activo, el dashboard muestra:
- Logo de Protocolo CDMX
- Botón prominente "ACTIVAR ALERTA"
- Información del usuario autenticado

### Con Incidente Activo
Cuando hay un incidente activo, muestra:
- Header con ID del incidente y nivel de amenaza
- Botón de alerta general
- Detalles del incidente (colapsables)
- Temporizador en tiempo real
- Estado del equipo
- Acciones rápidas
- Panel según rol del usuario
- Desencadenantes de retirada
- Checklist de respuesta

## 🧪 Datos de Prueba

El componente incluye datos mock para demostración:

### Triggers de Retirada
```typescript
const WITHDRAWAL_TRIGGERS = [
  { id: 'firearms', label: 'Armas de fuego presentes', severity: 'critical' },
  { id: 'armed_groups', label: 'Grupos armados', severity: 'critical' },
  // ... más triggers
]
```

### Configuración de Fases
```typescript
const PHASE_CONFIG = {
  '0-5min': { label: 'Activación Inmediata', color: 'bg-red-500', maxMinutes: 5 },
  '5-20min': { label: 'Evaluación en Escena', color: 'bg-orange-500', maxMinutes: 20 },
  '20-45min': { label: 'Documentación Legal', color: 'bg-yellow-500', maxMinutes: 45 },
  '45-60min': { label: 'Soporte Sostenido', color: 'bg-blue-500', maxMinutes: 60 }
}
```

## 🔒 Seguridad

### Características de Seguridad
- ✅ Feedback háptico para acciones críticas
- ✅ Doble-tap para retirada (previene activación accidental)
- ✅ Pseudónimos en lugar de nombres reales
- ✅ Datos encriptados en persistencia
- ✅ Sin datos personales expuestos en UI

## 🚀 Optimizaciones

### Performance
- Selectores optimizados con Zustand
- Re-renders minimizados
- Animaciones con CSS transforms
- Lazy loading de componentes pesados

### Offline Support
- Funciona completamente offline
- Persistencia local automática
- Sincronización cuando hay conexión

## 📝 Notas de Implementación

### Requisitos del Sistema
- Soporte para Vibration API (opcional)
- LocalStorage/IndexedDB para persistencia
- Soporte para formatos de fecha localizados

### Compatibilidad
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+
- ✅ Chrome Desktop 90+
- ✅ Firefox 88+

## 🎨 Personalización

### Temas
El componente soporta modo claro y oscuro automáticamente mediante Tailwind CSS:
```
bg-white dark:bg-gray-900
text-gray-900 dark:text-white
```

### Colores de Amenaza
Puedes personalizar los colores modificando la función `getThreatLevelColor`:
```typescript
const colors: Record<ThreatLevel, string> = {
  'low': 'bg-green-500',
  'moderate': 'bg-yellow-500',
  // ... etc
}
```

## 📊 Métricas y Analytics

El componente puede trackear:
- Tiempo promedio de respuesta
- Tasa de completitud del checklist
- Frecuencia de activación de retirada
- Tiempo por fase
- Efectividad del equipo

## 🐛 Debugging

### Logs de Consola
El componente incluye logs para debugging:
```typescript
console.log('Incident created:', incidentId)
console.log('Team member assigned:', member)
console.log('Withdrawal triggered:', reason)
```

### DevTools
Integración con Redux DevTools a través de Zustand middleware.

---

**¡Componente listo para producción!** ✅
