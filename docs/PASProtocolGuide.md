# P.A.S. Protocol Guide Component

## 📍 Ubicación
`src/components/features/PASProtocolGuide.tsx`

## 🎯 Descripción
El Protocolo P.A.S. (Proteger - Avisar - Socorrer) es la guía de primeros auxilios básicos para respondedores médicos en la aplicación Grito & Barrio. Proporciona instrucciones paso a paso para evaluar seguridad, activar emergencias y proporcionar soporte vital básico.

## 🔄 Los Tres Pasos del Protocolo

### 1️⃣ PROTEGER (Paso 1) - 🔵 Azul
**Color:** Azul | **Icono:** 🛡️

#### Objetivo
Evaluar y asegurar la seguridad de la escena antes de proporcionar asistencia.

#### Contenido
- **Evaluación de seguridad:**
  - Yo (rescatista)
  - Transeúntes (público)
  - Sobreviviente (víctima)

- **Peligros ambientales:**
  - Tráfico vehicular
  - Riesgos estructurales
  - Incendio o explosión
  - Sustancias peligrosas

- **Peligros humanos:**
  - Violencia continua
  - Individuos inestables
  - Situaciones de rehenes

- **Medidas de protección:**
  - Posicionamiento seguro
  - Barreras físicas si disponibles
  - Vía de escape identificada

#### ⚠️ Advertencia Crítica
> "Sin asistencia si la escena no está segura. Tu seguridad es primero."

#### Checklist
- [ ] Escena segura evaluada
- [ ] Peligros ambientales identificados
- [ ] Peligros humanos evaluados
- [ ] Medidas de protección establecidas

---

### 2️⃣ AVISAR (Paso 2) - 🟡 Amarillo
**Color:** Amarillo | **Icono:** 📞

#### Objetivo
Activar servicios de emergencia y proporcionar información clara sobre la situación.

#### Contactos de Emergencia

| Servicio | Número | Alternativa | Color |
|----------|---------|-------------|-------|
| **C5** (Centro de Comando) | 55-5533-5533 | 911 | 🔴 Rojo |
| **ERUM** (Rescate Urbano) | 55-5683-2222 | - | 🟠 Naranja |
| **Cruz Roja** | 55-5557-5757 | - | 🔵 Azul |

#### Información a Comunicar
1. **📍 Ubicación clara**
   - Dirección exacta
   - Puntos de referencia visibles
   - Colonia y alcaldía

2. **⚡ Naturaleza de la emergencia**
   - Tipo de incidente
   - Gravedad estimada
   - Recursos necesarios

3. **👥 Número y condición de personas**
   - Total de involucrados
   - Heridos y su estado
   - Atrapados o inconscientes

#### Checklist
- [ ] Emergencias activadas
- [ ] Ubicación comunicada claramente
- [ ] Naturaleza de emergencia explicada
- [ ] Número de personas reportado

---

### 3️⃣ SOCORRER (Paso 3) - 🟢 Verde
**Color:** Verde | **Icono:** 🏥

#### Objetivo
Proporcionar soporte de vida básico dentro de los límites de la capacitación del respondedor.

#### Procedimientos Permitidos
✅ **SÍ se pueden realizar:**
- Control de sangrado
- Posicionamiento de vía aérea
- Manejo de shock
- Reevaluación continua

#### ⚠️ Prohibiciones
> **NO procedimientos invasivos**
> 
> **NO administración de medicamentos**

#### Guías de Procedimiento Expandibles

##### Control de Sangrado 🔴
**Reconocimiento:**
- **Arterial:** Brota en chorros, color rojo brillante
- **Venoso:** Fluye constantemente, color rojo oscuro
- **Capilar:** Sangrado superficial

**Acción inmediata:**
1. Presión directa con tela limpia o guantes
2. Mantener presión mínimo 10 minutos sin verificar
3. Elevar extremidad por encima del corazón si es posible
4. Si está capacitado y disponible: aplicar torniquete

##### Manejo de Shock 🔵
**Signos de shock:**
- Piel pálida, fría y húmeda
- Pulso rápido y débil
- Respiración rápida
- Confusión o pérdida de consciencia

**Posición de shock:**
1. Posición supina (boca arriba)
2. Elevar extremidades 30cm (12 pulgadas)
3. Mantener calor (manta, calor corporal)
4. No dar líquidos si hay vómito o pérdida de consciencia
5. Transporte urgente prioritario

##### Emergencia por Calor 🟠
**Signos de golpe de calor:**
- Temperatura corporal alta (mayor a 40°C)
- Piel caliente y seca (o sudorosa)
- Confusión, delirio o pérdida de consciencia
- Náuseas o vómitos

**Acción inmediata:**
1. Mover a lugar fresco y sombreado
2. Quitar ropa excesiva
3. Enfriar con agua, toallas húmedas o ventilador
4. Si está consciente: pequeños sorbos de agua
5. **Emergencia médica inmediata**

#### Checklist
- [ ] Soporte vital básico iniciado
- [ ] Control de sangrado aplicado
- [ ] Manejo de shock iniciado
- [ ] Reevaluación continua establecida

---

## 🚀 Uso

### Uso Básico
```tsx
import { PASProtocolGuide } from '@/components/features'

function MedicalResponsePage() {
  return (
    <PASProtocolGuide 
      onComplete={() => console.log('Protocolo completado')}
      onEmergencyCall={(contact) => console.log('Llamando a:', contact)}
    />
  )
}
```

### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `onComplete` | `() => void` | Callback al completar el protocolo | ❌ No |
| `onEmergencyCall` | `(contact: EmergencyContact) => void` | Callback al llamar emergencia | ❌ No |

### Tipos

```typescript
type PASStep = 'proteger' | 'avisar' | 'socorrer'
type EmergencyContact = 'c5' | 'erum' | 'cruz-roja'
```

---

## 🎨 Características de UI

### Navegación por Pasos
- **Indicadores visuales:** 3 círculos numerados (1-2-3)
- **Navegación directa:** Click en cualquier paso
- **Botones anterior/siguiente:** Navegación secuencial
- **Progreso global:** Barra con gradiente de colores

### Colores por Paso
```
Paso 1 (Proteger): 🔵 Azul    #2563EB
Paso 2 (Avisar):   🟡 Amarillo #EAB308  
Paso 3 (Socorrer): 🟢 Verde   #16A34A
```

### Diseño de Tarjetas
- Header con color de paso
- Contenido claro y estructurado
- Checklist interactivo
- Advertencias destacadas en rojo

### Botones de Emergencia
- Grandes y prominentes
- Colores distintivos por servicio
- Números grandes y legibles
- Tap para llamar directamente

---

## ⚡ Funcionalidades

### 1. Checklist Interactivo
Cada paso tiene su propio checklist:
- ✅ Toggle on/off
- ✅ Haptic feedback (vibración)
- ✅ Persistencia en estado
- ✅ Indicador visual claro

### 2. Contactos de Emergencia (Paso 2)
```
┌─────────────────────────────────────┐
│  📞 C5 (Centro de Comando)          │
│     55-5533-5533                    │
│     o 911                           │
│  Coordinación general emergencias   │
└─────────────────────────────────────┘
```

- **Tap** → Abre app de teléfono
- **Callback** → `onEmergencyCall(contact)`
- **Visual** → Icono, nombre, número, descripción

### 3. Referencias Rápidas Expandibles (Paso 3)
Subsecciones colapsables:
- Control de Sangrado
- Manejo de Shock
- Emergencia por Calor

Cada una incluye:
- Reconocimiento de signos
- Acciones inmediatas
- Pasos numerados

### 4. Progreso Global
Barra de progreso con gradiente:
```
0%  ──────────────────────────────  100%
    🟦──────🟨────────🟩
```

---

## ♿ Accesibilidad

### Características
- ✅ **Touch targets grandes** - Mínimo 44x44px
- ✅ **Contraste alto** - Cumple WCAG AA
- ✅ **Screen reader labels** - Todo etiquetado
- ✅ **Navegación por teclado** - Tabs y flechas
- ✅ **Haptic feedback** - Vibración en acciones
- ✅ **Iconos + texto** - Doble codificación

### ARIA Labels
```html
<button aria-label="Llamar a C5: 55-5533-5533">
<div role="progressbar" aria-valuenow="65" aria-valuemax="100">
<section aria-label="Paso 1: Proteger">
```

---

## 📱 Diseño Responsive

### Mobile-First
- Optimizado para pantallas pequeñas
- Scrolling vertical fluido
- Botones grandes para dedos
- Texto legible (16px mínimo)

### Layout
```
┌─────────────────────────────┐
│  Header                     │
│  • Título PAS               │
│  • Progreso                 │
│  • Indicadores 1-2-3        │
├─────────────────────────────┤
│  Card de Paso Actual        │
│  • Título + icono           │
│  • Descripción              │
│  • Lista de items           │
│  • Advertencias             │
├─────────────────────────────┤
│  Checklist                  │
│  [ ] Item 1                 │
│  [✓] Item 2                 │
│  ...                        │
├─────────────────────────────┤
│  Referencias (expandible)   │
├─────────────────────────────┤
│  [Anterior] [Siguiente]     │
└─────────────────────────────┘
```

---

## 🔧 Integración

### Estado Local
El componente mantiene estado local para:
- Paso actual
- Checklist items
- Referencias expandidas

```typescript
const [currentStep, setCurrentStep] = useState<PASStep>('proteger')
const [checklist, setChecklist] = useState(INITIAL_CHECKLIST)
const [expandedRef, setExpandedRef] = useState<string | null>(null)
```

### Callbacks
```typescript
// Cuando se completa todo el protocolo
onComplete?.()

// Cuando se presiona botón de emergencia
onEmergencyCall?.(contactId) // 'c5' | 'erum' | 'cruz-roja'
```

---

## 🎨 Personalización

### Temas
Soporta modo claro/oscuro:
```css
bg-white dark:bg-gray-900
text-gray-900 dark:text-white
```

### Colores
Modificar en el objeto `STEP_CONTENT`:
```typescript
proteger: {
  color: 'blue', // Cambia a 'red', 'green', etc.
  // ...
}
```

### Contenido
Agregar items al checklist:
```typescript
proteger: [
  { id: 'p5', text: 'Nuevo item personalizado', checked: false }
]
```

---

## 🧪 Testing

### Casos de Prueba

1. **Navegación entre pasos**
   ```
   Click en paso 2 → Muestra Avisar → Checklist cambia
   ```

2. **Completar checklist**
   ```
   Click en checkbox → Se marca → Progreso aumenta
   ```

3. **Llamar emergencia**
   ```
   Click en C5 → Abre teléfono → Callback ejecutado
   ```

4. **Expandir referencia**
   ```
   Click en "Control de Sangrado" → Muestra contenido
   ```

---

## 📝 Notas de Implementación

### Dependencias
- React 18+
- Lucide React (icons)
- Tailwind CSS
- Componentes UI (Card, Button)

### Performance
- ✅ Memoización de cálculos
- ✅ Lazy loading de referencias
- ✅ Estado local eficiente
- ✅ Sin re-renders innecesarios

### Seguridad
- ✅ Sanitización de inputs
- ✅ Links telefónicos seguros (tel:)
- ✅ Sin datos personales expuestos

---

## 🎉 Ejemplo Completo

```tsx
import { PASProtocolGuide } from '@/components/features'
import { useProtocoloStore } from '@/store'

function EmergencyMedicalProtocol() {
  const store = useProtocoloStore()
  const currentUser = store.currentUser

  const handleComplete = () => {
    // Marcar entrenamiento como completado
    store.completeTraining('pas-basic', 'Protocolo P.A.S. Básico')
    
    // Navegar a siguiente pantalla
    navigate('/incident/active')
  }

  const handleEmergencyCall = (contact: EmergencyContact) => {
    // Log para analytics
    analytics.track('emergency_call_initiated', {
      contact,
      user: currentUser?.pseudonym,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PASProtocolGuide 
        onComplete={handleComplete}
        onEmergencyCall={handleEmergencyCall}
      />
    </div>
  )
}
```

---

## 📊 Métricas Sugeridas

Trackear para mejorar el protocolo:
- Tiempo promedio por paso
- Tasa de completitud
- Contactos más usados
- Referencias más consultadas
- Errores comunes

---

**¡Protocolo P.A.S. listo para salvar vidas!** 🏥✅