# Evidence Collection Component

## 📍 Ubicación
`src/components/features/EvidenceCollection.tsx`

## 🎯 Descripción
El componente EvidenceCollection proporciona una interfaz completa para la captura y gestión de evidencia forense en la aplicación Protocolo CDMX. Incluye cámara integrada, grabación de audio, gestión de cadena de custodia y características de seguridad avanzadas.

## 📸 Captura de Evidencia

### Tipos de Evidencia Soportados

#### 1. Fotos (Photo)
**Características:**
- Acceso a cámara del dispositivo
- Overlay automático de timestamp
- Captura de ubicación GPS
- Preview en tiempo real
- Flash y controles de cámara

**Flujo de Captura:**
```
Click "Foto" → Acceso cámara → Preview → Captura → Título → Categoría → Guardar
```

**Metadatos Capturados:**
- Timestamp exacto
- Coordenadas GPS (latitud/longitud)
- Precisión del GPS
- ID del colector
- Hash SHA-256 del archivo

---

#### 2. Videos (Video)
**Características:**
- Grabación de video con duración configurable
- Calidad ajustable (para optimizar almacenamiento)
- Timestamp overlay
- GPS tracking

**Configuración:**
- Duración máxima: 5 minutos (por defecto)
- Calidad: HD/SD seleccionable
- Formato: WebM para compatibilidad

---

#### 3. Audio (Audio)
**Características:**
- Grabación de voz/memorandos
- Visualizador de ondas
- Contador de duración
- Pausa/reanudación

**Usos:**
- Declaraciones de testigos
- Observaciones del colector
- Notas de voz

---

#### 4. Notas de Texto (Text)
**Características:**
- Formulario estructurado
- Campos personalizables
- Plantillas disponibles

**Categorías de Evidencia**

Toda evidencia debe clasificarse en una categoría:

| Categoría | Icono | Uso |
|-----------|-------|-----|
| **Lesiones** | ⚠️ | Documentación de lesiones físicas |
| **Autoridades** | 🛡️ | Presencia de policía/servidores públicos |
| **Documentos** | 📄 | Contratos, órdenes, identificaciones |
| **Escena** | 📷 | Fotos generales del lugar |
| **Testigos** | 👤 | Declaraciones, testimonios |
| **Otros** | ⋮ | Cualquier otra evidencia |

---

## 🔒 Seguridad y Privacidad

### Características de Seguridad

#### 1. Encriptación Automática
```typescript
security: {
  encrypted: true,        // AES-256 encryption
  metadataStripped: true, // Remove EXIF data
  locationFuzzed: false,  // ±100m location obfuscation
  facesBlurred: false,    // AI face blurring
  audioRemoved: false     // Strip audio from video
}
```

#### 2. Cadena de Custodia
Cada evidencia incluye un registro completo:

```typescript
interface ChainOfCustodyEntry {
  timestamp: string      // ISO 8601
  action: 'created' | 'accessed' | 'modified' | 'transferred' | 'deleted'
  actor: string          // Pseudonym
  reason?: string        // Justification
  method?: string        // How accessed
  recipient?: string     // If transferred
}
```

**Acciones Registradas:**
- ✅ Creación (automático)
- 👁️ Visualización (con timestamp)
- ✏️ Modificación (con razón)
- 📤 Transferencia (destinatario)
- 🗑️ Eliminación (con autorización)

#### 3. Hash SHA-256
Cada archivo se hashea para verificar integridad:
```typescript
sha256: "a1b2c3d4e5f6..." // 64 caracteres hex
```

**Verificación:**
```
Original: a1b2c3...
Actual:   a1b2c3...
✅ Integridad verificada
```

---

## 🎨 Galería de Evidencia

### Vistas Disponibles

#### Vista Grid (Cuadrícula)
```
┌──────────┬──────────┐
│ Foto 1   │ Video 1  │
│ Lesiones │ Autorid. │
├──────────┼──────────┤
│ Audio 1  │ Foto 2   │
│ Testigo  │ Escena   │
└──────────┴──────────┘
```

**Características:**
- 2 columnas
- Thumbnails con aspect ratio
- Info superpuesta
- Selección múltiple

#### Vista Lista
```
┌─────────────────────────────────────┐
│ 📷 Foto 1 - Lesiones               │
│ 15/01/2024 • 2.5MB • Encriptado    │
├─────────────────────────────────────┤
│ 🎥 Video 1 - Autoridades           │
│ 15/01/2024 • 15.2MB • Encriptado   │
└─────────────────────────────────────┘
```

---

### Filtros y Búsqueda

#### Filtros Disponibles
- **Por categoría:** Lesiones, Autoridades, Documentos, etc.
- **Por tipo:** Foto, Video, Audio, Texto
- **Por fecha:** Más reciente/antiguo
- **Por tipo:** Alfabético

#### Búsqueda
Búsqueda por:
- Título de evidencia
- Descripción
- Categoría
- Fecha

---

## 📤 Exportación

### Exportar Individual

**Contenido del Reporte:**
```
EVIDENCIA - PROTOCOLO CDMX
===========================

ID: ev-1234567890-abc
Incidente: CDMX-2024-01-15-1430-001
Tipo: photo
Categoría: Lesiones

Recopilado por: defensor1
Fecha: 15/01/2024, 14:30:15

UBICACIÓN
---------
Latitud: 19.4326
Longitud: -99.1332
Precisión: 5m

HASH SHA-256
------------
a1b2c3d4e5f6...

CADENA DE CUSTODIA
------------------
[15/01/2024, 14:30:15]
Acción: created
Actor: defensor1

SEGURIDAD
---------
Encriptado: Sí
Metadata removida: Sí
Ubicación difuminada: No

===========================
```

### Exportar Múltiple (Bulk)

**Opciones:**
- ✅ Selección múltiple
- 📦 ZIP encriptado
- 📄 Índice automático
- 🔗 Cadena de custodia completa

---

## 🚀 Uso

### Uso Básico
```tsx
import { EvidenceCollection } from '@/components/features'

function IncidentEvidencePage({ incidentId }: { incidentId: string }) {
  return (
    <EvidenceCollection 
      incidentId={incidentId}
      collectorPseudonym="defensor1"
      onEvidenceAdded={(item) => {
        console.log('Evidencia agregada:', item.id)
      }}
      onEvidenceDeleted={(id) => {
        console.log('Evidencia eliminada:', id)
      }}
    />
  )
}
```

### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `incidentId` | `string` | ID del incidente | ✅ Sí |
| `collectorPseudonym` | `string` | Pseudónimo del colector | ✅ Sí |
| `onEvidenceAdded` | `(item) => void` | Callback al agregar | ❌ No |
| `onEvidenceDeleted` | `(id) => void` | Callback al eliminar | ❌ No |

---

## 🎨 Interfaz de Usuario

### Barra de Navegación Inferior
```
┌─────────────────────────────────────┐
│    📷      🎥      🎙️      📝      │
│   Foto   Video   Audio   Nota      │
└─────────────────────────────────────┘
```

### Pantalla de Cámara
```
┌─────────────────────────────────────┐
│                                     │
│         [Preview Cámara]            │
│         14:30:25                    │
│         GPS Activo                  │
│                                     │
├─────────────────────────────────────┤
│  ❌          ⏺️           [spacer]   │
│ Cancelar   Capturar                 │
└─────────────────────────────────────┘
```

### Modal de Visualización
```
┌─────────────────────────────────────┐
│ Título Evidencia          ✕ ⬇️ 🗑️  │
│ Categoría • Fecha                   │
├─────────────────────────────────────┤
│                                     │
│      [Imagen/Video Completo]        │
│                                     │
├─────────────────────────────────────┤
│ Recopilado por: defensor1           │
│ Tamaño: 2.5 MB                      │
│ Ubicación: 19.4326, -99.1332        │
│ Hash: a1b2c3...                     │
└─────────────────────────────────────┘
```

---

## 🔧 Configuración de Seguridad

### Settings por Defecto
```typescript
const INITIAL_SECURITY_SETTINGS = {
  autoEncrypt: true,      // Encriptar automáticamente
  stripMetadata: true,    // Remover EXIF/metadata
  fuzzLocation: false,    // Difuminar ubicación ±100m
  blurFaces: false,       // Difuminar rostros (AI)
  removeAudio: false      // Remover audio de videos
}
```

### Opciones de Privacidad

#### Difuminar Ubicación
```
Real:     19.432612, -99.133215
Fuzzed:   19.4325xx, -99.1332xx  (±100m)
```

#### Difuminar Rostros
- Detección automática de rostros
- Aplicación de blur gaussiano
- Preservación de otras áreas

#### Remover Audio
- Videos sin pista de audio
- Útil para proteger identidades
- Reducción de tamaño de archivo

---

## 💾 Almacenamiento

### LocalStorage
```typescript
// Clave única por incidente
localStorage.setItem(`evidence-${incidentId}`, JSON.stringify(evidence))
```

**Estructura:**
```typescript
{
  id: "ev-timestamp-random",
  type: "photo",
  fileData: "data:image/jpeg;base64,...",
  fileSize: 2560000,
  sha256: "a1b2c3...",
  chainOfCustody: [...],
  security: { encrypted: true, ... },
  ...
}
```

### Límites
- **Máximo por evidencia:** 50MB
- **Total recomendado:** 100MB por incidente
- **Formatos:** JPEG, WebM, WebP

---

## 📊 Estadísticas

El componente muestra estadísticas en tiempo real:

```
┌──────┬──────┬──────┬──────┐
│ 📷 5 │ 🎥 2 │ 🎙️ 3 │ 📝 1 │
│ Fotos│Videos│Audio │Texto │
└──────┴──────┴──────┴──────┘

Total: 11 elementos
Encriptados: 11 🔒
```

---

## 🧪 Testing

### Casos de Prueba

1. **Captura de Foto**
   ```
   Click Foto → Permitir cámara → Capturar → Agregar título → Guardar
   Esperado: Evidencia aparece en galería con timestamp
   ```

2. **Verificación de Hash**
   ```
   Capturar foto → Verificar SHA-256 → Re-calcular
   Esperado: Hash coincide, integridad confirmada
   ```

3. **Exportación**
   ```
   Seleccionar evidencia → Exportar → Verificar reporte TXT
   Esperado: Reporte incluye toda metadata y cadena de custodia
   ```

4. **Cadena de Custodia**
   ```
   Crear evidencia → Visualizar → Transferir
   Esperado: Log muestra todas las acciones con timestamps
   ```

---

## 🔐 Seguridad Implementada

### Checklist de Seguridad
- ✅ Encriptación AES-256
- ✅ Hash SHA-256 para integridad
- ✅ Cadena de custodia inmutable
- ✅ Metadatos sensibles removidos
- ✅ Ubicación difuminable
- ✅ Pseudónimos en lugar de nombres reales
- ✅ Confirmación para eliminación
- ✅ Logs de auditoría completos

### Mejores Prácticas
1. **Siempre encriptar** evidencia sensible
2. **Verificar hash** antes de exportar
3. **Documentar accesos** en cadena de custodia
4. **Respaldar** evidencia crítica
5. **Usar pseudónimos** consistentes

---

## 🎉 Ejemplo Completo

```tsx
import { EvidenceCollection } from '@/components/features'
import { useProtocoloStore } from '@/store'

function LegalObserverEvidence() {
  const store = useProtocoloStore()
  const activeIncident = store.getActiveIncident()
  const currentUser = store.currentUser

  if (!activeIncident) {
    return (
      <div className="p-8 text-center">
        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold">No hay incidente activo</h2>
        <p>Selecciona un incidente para capturar evidencia</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EvidenceCollection 
        incidentId={activeIncident.id}
        collectorPseudonym={currentUser?.pseudonym || 'anonymous'}
        onEvidenceAdded={(item) => {
          // Analytics
          analytics.track('evidence_captured', {
            type: item.type,
            category: item.category,
            incidentId: activeIncident.id
          })
          
          // Auto-sync if online
          if (navigator.onLine) {
            syncEvidence(item)
          }
        }}
        onEvidenceDeleted={(id) => {
          analytics.track('evidence_deleted', { id })
        }}
      />
    </div>
  )
}
```

---

## 📈 Métricas Sugeridas

Trackear para optimizar:
- Tipos de evidencia más usados
- Tamaño promedio de archivos
- Tasa de exportación
- Errores de cámara
- Tiempo promedio de captura

---

**¡Evidence Collection listo para documentar la verdad!** 📸🔒