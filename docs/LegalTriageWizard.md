# Legal Triage Wizard

## 📍 Ubicación
`src/components/features/LegalTriageWizard.tsx`

## 🎯 Descripción
El Legal Triage Wizard es un asistente de decisiones legales que guía a observadores legales a través de un árbol de decisiones para determinar el camino legal apropiado en casos de desalojo. Evalúa la presencia de orden judicial, categoría del ocupante y violencia/amenazas para generar recomendaciones personalizadas.

## 🔀 Árbol de Decisiones

### Pregunta 1: ¿Orden Judicial Presente?

#### Opción SÍ → Camino: Verificación Requerida
Si hay orden judicial, se solicitan detalles de verificación:

**Campos de Verificación:**
- **Nombre del tribunal** - Juzgado que emitió la orden
- **Fecha de emisión** - Validar cronología procesal
- **Número de expediente** - Formato consistente
- **¿Orden firmada?** - Checkbox de verificación

**Resultado:**
> "Evaluar proporcionalidad, cumplimiento de debido proceso y derechos humanos"

**Artículo:** Art. 12 Ley de Vivienda CDMX

**Prioridad:** Alta

#### Opción NO → Camino: Presunción de Ilegalidad (Despojo)

**Resultado:**
> **Camino de Despojo (Artículo 395 Código Penal)**

**Acciones Prioritarias:**
- ✅ Documentar violencia, amenazas o engaño
- ✅ Énfasis en presión política inmediata
- ✅ Activar alerta de Derechos Humanos
- ✅ Solicitar medidas cautelares

**Artículo:** Art. 395 Código Penal Federal

**Prioridad:** Máxima 🔴

---

### Pregunta 2: ¿Categoría de Ocupante?

#### Inquilino Formal
**Protecciones Legales:**
- Contrato de arrendamiento vigente
- Protección bajo Ley de Vivienda CDMX
- Debido proceso judicial obligatorio
- Contrademanda por arrendamiento

**Documentación Prioritaria:**
- Contrato de arrendamiento
- Recibos de pago de renta
- Comprobantes de servicios
- Historial de pagos

**Acciones:**
- Verificar vigencia del contrato
- Documentar cumplimiento de obligaciones
- Preparar contrademanda

---

#### Ocupante Informal
**Protecciones Legales:**
- Derecho a vivienda digna (Art. 1° Ley de Vivienda)
- Prohibición de desalojo forzoso
- Proceso legal obligatorio
- Asesoría jurídica gratuita

**Documentación Prioritaria:**
- Prueba de residencia (recibos, testimonios)
- Mejoras realizadas al inmueble
- Documentación de ocupación prolongada
- Testimonios de vecinos

**Acciones:**
- Documentar tiempo de residencia
- Reunir testimonios de vecinos
- Verificar servicios a nombre del ocupante

---

#### Colectivo Indígena
**Protecciones Legales:**
- Derechos colectivos de pueblos indígenas
- Consulta previa obligatoria
- Protección especial bajo DH
- Acceso a defensoría especializada

**Documentación Prioritaria:**
- Documentación de pertenencia étnica
- Resoluciones de territorio
- Testimonios de autoridades comunitarias
- Documentación histórica de ocupación

**Acciones:**
- Contactar defensoría especializada
- Activar alerta de pueblos indígenas
- Documentar afectación colectiva

**Prioridad:** Máxima 🔴

---

#### Subarrendatario
**Protecciones Legales:**
- Derechos derivados del arrendamiento principal
- Notificación al arrendador principal
- Posibilidad de negociación
- Asesoría sobre obligaciones del inquilino principal

**Documentación Prioritaria:**
- Contrato de subarrendamiento
- Pagos al inquilino principal
- Comunicaciones con inquilino principal
- Contrato principal (si disponible)

**Acciones:**
- Contactar inquilino principal
- Verificar vigencia de contrato principal
- Documentar pagos realizados

---

### Pregunta 3: ¿Violencia/Amenazas/Robo?

#### Violencia Física con Documentación Médica
**Prioridad:** Máxima 🔴

**Vía Penal:**
Fiscalía General de Justicia - Denuncia por lesiones

**Vía DH:**
CDHCM - Queja por violencia

**Acciones Inmediatas:**
- ✅ Asegurar constancia médica
- ✅ Fotografiar lesiones
- ✅ Levantar acta en Ministerio Público
- ✅ Activar protocolo de seguridad

---

#### Amenazas Continuas
**Prioridad:** Alta 🟠

**Vía Penal:**
Fiscalía - Denuncia por amenazas

**Vía DH:**
CDHCM - Queja por intimidación

**Acciones Inmediatas:**
- ✅ Documentar amenazas (audio, video)
- ✅ Testimonios de amenazas
- ✅ Medidas de protección
- ✅ Alerta a redes de apoyo

---

#### Robo/Daño a Propiedad
**Prioridad:** Alta 🟠

**Vía Penal:**
Fiscalía - Denuncia por robo/daño

**Vía DH:**
CDHCM - Queja por afectación patrimonial

**Acciones Inmediatas:**
- ✅ Inventariar bienes faltantes/dañados
- ✅ Fotografiar daños
- ✅ Levantar acta MP
- ✅ Asegurar evidencia

---

#### Sin Violencia Documentada
**Prioridad:** Media 🟡

**Vía Penal:**
No aplica

**Vía DH:**
CDHCM - Prevención

**Acciones Inmediatas:**
- ✅ Documentar situación
- ✅ Asesoría preventiva
- ✅ Preparar defensas legales

---

## 🚀 Uso

### Uso Básico
```tsx
import { LegalTriageWizard } from '@/components/features'

function LegalObserverPage() {
  return (
    <LegalTriageWizard 
      incidentId="CDMX-2024-01-15-1430-001"
    />
  )
}
```

### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `incidentId` | `string` | ID del incidente asociado | ❌ No |

---

## 📊 Pantalla de Resultados

### Componentes del Resultado

#### 1. Badge de Prioridad
Muestra el nivel de prioridad más alto de todas las recomendaciones:
- 🔴 **Máxima** - Emergencia inmediata
- 🟠 **Alta** - Acción urgente
- 🟡 **Media** - Atención prioritaria
- 🟢 **Baja** - Seguimiento normal

#### 2. Resumen de Respuestas
```
Orden Judicial: [Sí/No]
Categoría: [Tipo de ocupante]
Violencia: [Tipo documentada]
```

#### 3. Recomendaciones Legales
Cada recomendación incluye:
- **Título** del camino legal
- **Descripción** detallada
- **Artículo** de ley aplicable
- **Prioridad** (color-coded)
- **Lista de acciones** recomendadas
- **Contactos** específicos con botón para llamar

#### 4. Contactos Auto-Poblados
Según el camino legal, se muestran:
- **CDHCM** - Comisión de Derechos Humanos CDMX
- **CNDH** - Comisión Nacional de Derechos Humanos
- **Fiscalía** - Fiscalía Especializada en Delitos Patrimoniales
- **Defensoría** - Instituto de Defensoría Pública

Cada contacto incluye:
- Nombre de la institución
- Rol/departamento
- Teléfono (click para llamar)
- Horario de atención

---

## 🎨 Características de UI

### Navegación del Wizard

#### Indicadores de Progreso
```
[Paso 1] ---- [Paso 2] ---- [Paso 3]
  ●           ○           ○
  33%
```

#### Botones de Navegación
- **Anterior** - Volver al paso previo
- **Siguiente** - Avanzar (valida respuesta)
- **Validación** - No permite avanzar sin responder

### Diseño de Preguntas

#### Tarjetas de Opción
```
┌─────────────────────────────────────┐
│  ⚪ SÍ                              │
│     Hay orden judicial emitida      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⚪ NO                              │
│     Presunción de Ilegalidad        │
└─────────────────────────────────────┘
```

#### Expansión de Detalles
Al seleccionar una opción, se expande mostrando:
- Protecciones legales
- Documentación requerida
- Acciones prioritarias
- Recomendaciones específicas

### Colores por Prioridad
```
🔴 Máxima: bg-red-600    border-red-200    text-red-700
🟠 Alta:   bg-orange-500 border-orange-200 text-orange-700
🟡 Media:  bg-yellow-500 border-yellow-200 text-yellow-700
🟢 Baja:   bg-green-500  border-green-200  text-green-700
```

---

## ⚡ Funcionalidades

### 1. Wizard Paso a Paso
- 3 preguntas con navegación
- Validación de respuestas
- Progreso visual
- Botones anterior/siguiente

### 2. Caminos Condicionales
Según respuestas, muestra:
- Formularios adicionales (orden judicial)
- Información específica (categoría)
- Recomendaciones personalizadas

### 3. Contactos con Tap-to-Call
```
┌────────────────────────────────────┐
│ CDHCM                              │
│ Quejas y Orientación               │
│                    55-5029-9300 📞 │
│ 24 horas                           │
└────────────────────────────────────┘
```

### 4. Exportación de Resultados
**Botones disponibles:**
- 📄 **Exportar** - Genera archivo TXT
- 🖨️ **Imprimir** - Vista de impresión
- 💾 **Guardar** - Almacena en localStorage
- 🔄 **Nuevo Triage** - Reinicia el wizard

### 5. Persistencia Local
```typescript
// Guardado automático
localStorage.setItem(`triage-${incidentId}`, JSON.stringify({
  timestamp: Date.now(),
  state,
  recommendations
}))
```

---

## ♿ Accesibilidad

### Características
- ✅ **Validación visual** - Respuestas requeridas marcadas
- ✅ **Colores intuitivos** - Prioridad fácil de identificar
- ✅ **Touch targets grandes** - Mínimo 44x44px
- ✅ **Contraste alto** - Cumple WCAG AA
- ✅ **Navegación por teclado** - Tabs funcionales
- ✅ **Screen reader friendly** - Labels descriptivos

### Estados de Validación
```
❌ Botón "Siguiente" deshabilitado - muestra hint
✅  Opción seleccionada - resaltado visual claro
⚠️  Campo requerido - indicador rojo
```

---

## 📱 Diseño Responsive

### Layout
```
┌─────────────────────────────┐
│  Header                     │
│  • Título + Progreso        │
│  • [1]---[2]---[3]         │
├─────────────────────────────┤
│  Pregunta                   │
│  ┌─────────────────────┐    │
│  │ Opción 1           │    │
│  │ Opción 2           │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  [Anterior]  [Siguiente]    │
└─────────────────────────────┘
```

### Mobile-First
- Optimizado para pantallas pequeñas
- Scrolling fluido
- Botones grandes para dedos
- Texto legible (16px+)

---

## 🔧 Integración

### Estado Interno
```typescript
interface TriageState {
  step: 1 | 2 | 3
  judicialOrder: {
    present: 'present' | 'absent' | null
    details?: {
      tribunalName: string
      date: string
      caseNumber: string
      judgeSigned: boolean
    }
  }
  occupantCategory: OccupantCategory
  violenceType: ViolenceType
}
```

### Cálculo de Recomendaciones
```typescript
const recommendations = useMemo(() => {
  const recs: LegalRecommendation[] = []
  
  // Basado en orden judicial
  if (state.judicialOrder.present === 'present') {
    recs.push({
      path: 'verification_required',
      title: 'Verificación de Orden Judicial',
      priority: 'alta',
      actions: [...],
      contacts: [...]
    })
  }
  
  // Basado en categoría
  if (state.occupantCategory) {
    recs.push({
      path: 'dh_cdhcm',
      title: `Protección para ${category}`,
      priority: category === 'indigenous' ? 'maxima' : 'alta',
      actions: [...],
      contacts: [...]
    })
  }
  
  // Basado en violencia
  if (state.violenceType) {
    recs.push({
      path: 'penal_fiscalia',
      title: 'Vía Penal',
      priority: VIOLENCE_PATHS[state.violenceType].priority,
      actions: [...],
      contacts: [...]
    })
  }
  
  return recs
}, [state])
```

---

## 🧪 Testing

### Casos de Prueba

1. **Flujo Completo**
   ```
   Orden: NO → Categoría: Indígena → Violencia: Física
   Esperado: 3 recomendaciones, prioridad Máxima
   ```

2. **Orden Judicial Presente**
   ```
   Orden: SÍ → Llenar formulario → Categoría: Formal
   Esperado: Formulario expandido, verificación requerida
   ```

3. **Sin Violencia**
   ```
   Orden: SÍ → Categoría: Informal → Violencia: Ninguna
   Esperado: Prioridad Media, vía DH únicamente
   ```

4. **Exportación**
   ```
   Completar wizard → Click Exportar → Archivo TXT generado
   ```

---

## 📝 Notas de Implementación

### Dependencias
- React 18+
- Lucide React (icons)
- Tailwind CSS
- Componentes UI (Card, Button, Input, Badge, Checkbox)

### Performance
- ✅ useMemo para recomendaciones
- ✅ useCallback para handlers
- ✅ Lazy rendering de detalles
- ✅ Sin re-renders innecesarios

### Seguridad
- ✅ Sanitización de inputs
- ✅ Validación de datos
- ✅ Sin exposición de información sensible
- ✅ localStorage seguro (datos encriptados opcional)

---

## 🎉 Ejemplo Completo

```tsx
import { LegalTriageWizard } from '@/components/features'
import { useProtocoloStore } from '@/store'

function LegalObserverDashboard() {
  const store = useProtocoloStore()
  const activeIncident = store.getActiveIncident()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto">
        {activeIncident ? (
          <LegalTriageWizard 
            incidentId={activeIncident.id}
          />
        ) : (
          <div className="p-8 text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">
              Selecciona un incidente
            </h2>
            <p className="text-gray-600 mt-2">
              Elige un incidente activo para iniciar el triage legal
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📊 Métricas Sugeridas

Trackear para mejorar el wizard:
- Tiempo promedio de completitud
- Caminos más comunes
- Contactos más usados
- Tasa de exportación
- Errores de validación

---

**¡Legal Triage Wizard listo para defender derechos!** ⚖️✅