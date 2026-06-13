/**
 * Evidence Collection Component
 * Protocolo CDMX
 *
 * Comprehensive evidence capture and management with chain of custody.
 * Evidence is persisted through documentationSlice (addEntry / getEntriesByIncident)
 * so it is encrypted at rest and shared across the app — NOT localStorage.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Camera,
  Video,
  Mic,
  FileText,
  Lock,
  Shield,
  Check,
  X,
  MoreVertical,
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Fingerprint,
  Image as ImageIcon,
  Play,
  Square
} from 'lucide-react'
import { Input, Textarea, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'
import type { StoredDocumentationEntry } from '@/store/documentationSlice'
import type { DocumentationType, IncidentLocation, CDMXAlcaldia } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

type EvidenceType = DocumentationType extends infer T
  ? T extends 'witness_statement'
    ? never
    : T
  : never // 'photo' | 'video' | 'audio' | 'text'
type EvidenceCategory = 'lesiones' | 'autoridades' | 'documentos' | 'escena' | 'testigos' | 'otros'
type CaptureMode = 'camera' | 'video' | 'audio' | 'text' | 'gallery'
type ViewMode = 'grid' | 'list'
type SortBy = 'date-desc' | 'date-asc' | 'type' | 'category'

interface CaptureLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
}

/** Display shape derived from a persisted documentation entry. */
interface EvidenceItem {
  id: string
  type: EvidenceType
  category: EvidenceCategory
  timestamp: string
  collector: string
  caption: string
  description: string
  fileData: string
  fileSize: number
  mimeType: string
  sha256: string
  encrypted: boolean
  location?: CaptureLocation
}

interface EvidenceCollectionProps {
  incidentId: string
  collectorPseudonym: string
  onEvidenceAdded?: (item: EvidenceItem) => void
  onEvidenceDeleted?: (itemId: string) => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EVIDENCE_CATEGORIES: { value: EvidenceCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'lesiones', label: 'Lesiones', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'autoridades', label: 'Autoridades', icon: <Shield className="w-4 h-4" /> },
  { value: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
  { value: 'escena', label: 'Escena', icon: <Camera className="w-4 h-4" /> },
  { value: 'testigos', label: 'Testigos', icon: <User className="w-4 h-4" /> },
  { value: 'otros', label: 'Otros', icon: <MoreVertical className="w-4 h-4" /> }
]

const INITIAL_SECURITY_SETTINGS = {
  autoEncrypt: true,
  stripMetadata: true,
  fuzzLocation: false,
  blurFaces: false,
  removeAudio: false
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getCategoryLabel(category: EvidenceCategory): string {
  return EVIDENCE_CATEGORIES.find(c => c.value === category)?.label || category
}

function isEvidenceCategory(value: string): value is EvidenceCategory {
  return EVIDENCE_CATEGORIES.some(c => c.value === value)
}

// =============================================================================
// SUB-COMPONENT: Metadata dialog (caption + category) — replaces prompt()
// =============================================================================

interface MetaDialogProps {
  title: string
  initialCaption?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: (caption: string, category: EvidenceCategory) => void
}

const MetaDialog: React.FC<MetaDialogProps> = ({ title, initialCaption = '', busy, onCancel, onConfirm }) => {
  const [caption, setCaption] = useState(initialCaption)
  const [category, setCategory] = useState<EvidenceCategory>('otros')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título
        </label>
        <Input
          autoFocus
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Ej: Daño en puerta principal"
          className="mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
          className="w-full px-3 py-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          {EVIDENCE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => onConfirm(caption.trim() || 'Sin título', category)}
            disabled={busy}
          >
            {busy ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Camera Capture
// =============================================================================

interface CameraCaptureProps {
  onCapture: (imageData: string, location?: CaptureLocation) => void
  onCancel: () => void
  collector: string
  security: typeof INITIAL_SECURITY_SETTINGS
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, collector, security }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [location, setLocation] = useState<CaptureLocation | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(mediaStream => {
        if (cancelled) {
          mediaStream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo acceder a la cámara. Verifica los permisos del dispositivo.')
        }
      })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          })
        },
        () => { /* location optional; ignore errors */ },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    setCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      setCapturing(false)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    // Add timestamp overlay
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'
    context.fillRect(10, canvas.height - 50, 300, 40)
    context.fillStyle = 'white'
    context.font = '16px monospace'
    context.fillText(new Date().toLocaleString('es-MX'), 20, canvas.height - 25)
    context.fillText(`Colector: ${collector}`, 20, canvas.height - 10)

    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    onCapture(imageData, location || undefined)
    setCapturing(false)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Inline error (no alert()) */}
        {error && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Overlay Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-sm">
          <div className="bg-black/50 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 inline mr-1" />
            {new Date().toLocaleTimeString('es-MX')}
          </div>
          {location && (
            <div className="bg-black/50 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4 inline mr-1" />
              GPS {security.fuzzLocation ? '±100m' : 'Activo'}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black p-6 flex items-center justify-between">
        <button onClick={onCancel} className="text-white p-3" aria-label="Cancelar">
          <X className="w-8 h-8" />
        </button>

        <button
          onClick={handleCapture}
          disabled={capturing || !!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          aria-label="Capturar foto"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>

        <div className="w-14" />
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Audio Recorder
// =============================================================================

interface AudioRecorderProps {
  onCapture: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onCapture, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      durationRef.current = 0
      setDuration(0)
      setError(null)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        onCapture(audioBlob, durationRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
      }, 1000)
    } catch {
      setError('No se pudo acceder al micrófono. Verifica los permisos del dispositivo.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Grabación de Audio</h2>
        <p className="text-gray-400">
          {isRecording ? 'Grabando...' : 'Presiona para comenzar'}
        </p>
      </div>

      {error && (
        <div className="w-full max-w-md mb-6 bg-red-600 text-white p-3 rounded-lg text-center text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-md h-32 bg-gray-800 rounded-lg mb-8 flex items-center justify-center">
        {isRecording ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-red-500 rounded-full animate-pulse"
                style={{ height: `${((i * 37) % 80) + 20}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <Mic className="w-16 h-16 text-gray-600" />
        )}
      </div>

      <div className="text-4xl font-mono text-white mb-8">{formatDuration(duration)}</div>

      <div className="flex gap-4">
        <button onClick={onCancel} className="p-4 rounded-full bg-gray-700 text-white" aria-label="Cancelar">
          <X className="w-6 h-6" />
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            className="p-6 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/50"
            aria-label="Iniciar grabación"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="p-6 rounded-full bg-gray-200 text-gray-900"
            aria-label="Detener grabación"
          >
            <Square className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Video Recorder (MediaRecorder, mirrors the audio path)
// =============================================================================

interface VideoRecorderProps {
  onCapture: (videoBlob: Blob, duration: number) => void
  onCancel: () => void
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo acceder a la cámara/micrófono. Verifica los permisos.')
      })

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    try {
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      durationRef.current = 0
      setDuration(0)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' })
        onCapture(videoBlob, durationRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
      }, 1000)
    } catch {
      setError('No se pudo iniciar la grabación de video.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {error && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-sm">
          <div className={cn("px-3 py-1 rounded-full", isRecording ? "bg-red-600 animate-pulse" : "bg-black/50")}>
            {isRecording ? 'REC' : 'Video'} {formatDuration(duration)}
          </div>
        </div>
      </div>

      <div className="bg-black p-6 flex items-center justify-between">
        <button onClick={onCancel} className="text-white p-3" aria-label="Cancelar">
          <X className="w-8 h-8" />
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!ready || !!error}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            aria-label="Iniciar grabación de video"
          >
            <div className="w-10 h-10 rounded-full bg-red-600" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Detener grabación de video"
          >
            <Square className="w-10 h-10 text-white" />
          </button>
        )}

        <div className="w-14" />
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Text Note (Nota) capture — a real form, not a stub
// =============================================================================

interface TextNoteCaptureProps {
  busy?: boolean
  onCapture: (caption: string, body: string, category: EvidenceCategory) => void
  onCancel: () => void
}

const TextNoteCapture: React.FC<TextNoteCaptureProps> = ({ busy, onCapture, onCancel }) => {
  const [caption, setCaption] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<EvidenceCategory>('testigos')

  const canSave = body.trim().length > 0

  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col p-4">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full">
        <div className="flex items-center justify-between py-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-yellow-400" />
            Nueva Nota
          </h2>
          <button onClick={onCancel} className="p-2 text-white" aria-label="Cancelar">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 bg-white dark:bg-gray-900 rounded-xl p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej: Testimonio de vecino"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            >
              {EVIDENCE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenido de la nota
            </label>
            <Textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe lo observado, testimonios, hora, personas involucradas..."
              rows={10}
              className="min-h-[200px]"
            />
          </div>
        </div>

        <div className="flex gap-2 py-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!canSave || busy}
            onClick={() => onCapture(caption.trim() || 'Nota', body, category)}
          >
            {busy ? 'Guardando...' : 'Guardar Nota'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EvidenceCollection: React.FC<EvidenceCollectionProps> = ({
  incidentId,
  collectorPseudonym,
  onEvidenceAdded,
  onEvidenceDeleted
}) => {
  const store = useProtocoloStore()
  const activeIncident = store.getIncidentById(incidentId)

  const [mode, setMode] = useState<CaptureMode>('gallery')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<EvidenceCategory | null>(null)
  const [filterType, setFilterType] = useState<EvidenceType | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewingItem, setViewingItem] = useState<EvidenceItem | null>(null)
  const [securitySettings] = useState(INITIAL_SECURITY_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Pending media awaiting caption/category metadata (photo/video/audio).
  const [pendingMedia, setPendingMedia] = useState<
    { type: EvidenceType; dataUrl: string; blob?: Blob; location?: CaptureLocation; durationNote?: string } | null
  >(null)

  // All entries for this incident come from the encrypted documentation store.
  const entriesVersion = store.entries.length // re-render when entries change
  const evidence: EvidenceItem[] = React.useMemo(() => {
    void entriesVersion
    return (store.getEntriesByIncident(incidentId) as StoredDocumentationEntry[]).map(entry => {
      const category = entry.category && isEvidenceCategory(entry.category) ? entry.category : 'otros'
      const type = (['photo', 'video', 'audio', 'text'].includes(entry.type) ? entry.type : 'text') as EvidenceType
      return {
        id: entry.id,
        type,
        category,
        timestamp: entry.timestamp,
        collector: entry.capturedBy,
        caption: entry.caption || entry.description || 'Sin título',
        description: entry.description || '',
        fileData: entry.fileData || '',
        fileSize: entry.metadata.fileSize || 0,
        mimeType: entry.metadata.mimeType || '',
        sha256: entry.hash,
        encrypted: entry.encrypted,
        location: entry.metadata.gpsCoordinates
          ? {
              latitude: entry.metadata.gpsCoordinates.latitude,
              longitude: entry.metadata.gpsCoordinates.longitude,
              timestamp: entry.timestamp
            }
          : undefined
      }
    })
  }, [store, incidentId, entriesVersion])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 2500)
  }

  // Build an IncidentLocation for the documentation entry (required field).
  const buildEntryLocation = useCallback((): IncidentLocation => {
    if (activeIncident) return activeIncident.location
    return {
      address: 'Ubicación no especificada',
      colonia: 'N/D',
      alcaldia: 'Cuauhtémoc' as CDMXAlcaldia,
      postalCode: '00000'
    }
  }, [activeIncident])

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

  // Persist an evidence item through documentationSlice.addEntry.
  const persistEvidence = useCallback(async (params: {
    type: EvidenceType
    dataUrl: string
    caption: string
    category: EvidenceCategory
    description?: string
    fileSize: number
    mimeType: string
    location?: CaptureLocation
  }) => {
    setSaving(true)
    try {
      const entryData: Omit<StoredDocumentationEntry, 'id' | 'hash' | 'chainOfCustody' | 'timestamp'> = {
        incidentId,
        type: params.type as DocumentationType,
        capturedBy: collectorPseudonym,
        location: buildEntryLocation(),
        encrypted: securitySettings.autoEncrypt,
        metadata: {
          deviceInfo: navigator.userAgent,
          mimeType: params.mimeType,
          fileSize: params.fileSize,
          tags: [params.category],
          gpsCoordinates: params.location
            ? { latitude: params.location.latitude, longitude: params.location.longitude }
            : undefined
        },
        description: params.description || params.caption,
        fileData: params.dataUrl,
        caption: params.caption,
        category: params.category
      }

      const id = await store.addEntry(entryData, params.dataUrl)
      onEvidenceAdded?.({
        id,
        type: params.type,
        category: params.category,
        timestamp: new Date().toISOString(),
        collector: collectorPseudonym,
        caption: params.caption,
        description: params.description || params.caption,
        fileData: params.dataUrl,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        sha256: '',
        encrypted: securitySettings.autoEncrypt,
        location: params.location
      })
      showNotice('Evidencia guardada y cifrada')
    } finally {
      setSaving(false)
      setPendingMedia(null)
      setMode('gallery')
    }
  }, [incidentId, collectorPseudonym, buildEntryLocation, securitySettings.autoEncrypt, store, onEvidenceAdded])

  // Filter and sort evidence for display.
  const displayEvidence = React.useMemo(() => {
    let result = [...evidence]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.caption.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    if (filterCategory) result = result.filter(item => item.category === filterCategory)
    if (filterType) result = result.filter(item => item.type === filterType)

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'date-asc': return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'type': return a.type.localeCompare(b.type)
        case 'category': return a.category.localeCompare(b.category)
        default: return 0
      }
    })

    return result
  }, [evidence, searchQuery, filterCategory, filterType, sortBy])

  // Delete evidence (with in-component confirmation dialog).
  const confirmDelete = () => {
    if (!deleteCandidate) return
    store.deleteEntry(deleteCandidate)
    onEvidenceDeleted?.(deleteCandidate)
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.delete(deleteCandidate)
      return next
    })
    if (viewingItem?.id === deleteCandidate) setViewingItem(null)
    setDeleteCandidate(null)
    showNotice('Evidencia eliminada')
  }

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  // Export a single item as a text report (chain-of-custody summary).
  const buildItemReport = (item: EvidenceItem): string => `EVIDENCIA - PROTOCOLO CDMX
===========================

ID: ${item.id}
Incidente: ${incidentId}
Tipo: ${item.type}
Categoría: ${getCategoryLabel(item.category)}

Recopilado por: ${item.collector}
Fecha: ${new Date(item.timestamp).toLocaleString('es-MX')}

UBICACIÓN
---------
${item.location ? `Latitud: ${item.location.latitude}
Longitud: ${item.location.longitude}` : 'No disponible'}

CONTENIDO
---------
Título: ${item.caption}
Descripción: ${item.description}

HASH SHA-256
------------
${item.sha256}

SEGURIDAD
---------
Encriptado: ${item.encrypted ? 'Sí' : 'No'}

===========================
Protocolo CDMX - Evidencia Legal`

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportItem = (item: EvidenceItem) => {
    downloadText(`${item.id}-report.txt`, buildItemReport(item))
  }

  const exportSelected = () => {
    const selected = evidence.filter(item => selectedItems.has(item.id))
    if (selected.length === 0) return
    const separator = '\n' + '='.repeat(44) + '\n\n'
    const header = `REPORTE MASIVO DE EVIDENCIA - PROTOCOLO CDMX
Incidente: ${incidentId}
Total de elementos: ${selected.length}
Generado: ${new Date().toLocaleString('es-MX')}

`
    downloadText(
      `incidente-${incidentId}-${selected.length}-elementos.txt`,
      header + selected.map(buildItemReport).join(separator)
    )
  }

  const stats = {
    total: evidence.length,
    photos: evidence.filter(e => e.type === 'photo').length,
    videos: evidence.filter(e => e.type === 'video').length,
    audio: evidence.filter(e => e.type === 'audio').length,
    text: evidence.filter(e => e.type === 'text').length,
    encrypted: evidence.filter(e => e.encrypted).length
  }

  // Handle media captured from camera/video/audio: stash it, then collect meta.
  const handleMediaCaptured = async (
    type: EvidenceType,
    blob: Blob | string,
    location?: CaptureLocation,
    durationNote?: string
  ) => {
    const dataUrl = typeof blob === 'string' ? blob : await blobToDataUrl(blob)
    setPendingMedia({
      type,
      dataUrl,
      blob: typeof blob === 'string' ? undefined : blob,
      location,
      durationNote
    })
  }

  const finalizePendingMedia = (caption: string, category: EvidenceCategory) => {
    if (!pendingMedia) return
    const { type, dataUrl, blob, location, durationNote } = pendingMedia
    const fileSize = blob ? blob.size : Math.round((dataUrl.length * 3) / 4)
    const mimeType = blob?.type || (type === 'photo' ? 'image/jpeg' : type === 'video' ? 'video/webm' : 'audio/webm')
    void persistEvidence({
      type,
      dataUrl,
      caption,
      category,
      description: durationNote ? `${caption} • ${durationNote}` : caption,
      fileSize,
      mimeType,
      location
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Inline notice (replaces alert()) */}
      {notice && (
        <div
          role="status"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg"
        >
          {notice}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-purple-600" />
                Evidencia
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.total} elementos • {stats.encrypted} encriptados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showFilters ? "bg-purple-100 text-purple-600" : "hover:bg-gray-100"
                )}
                aria-label="Filtros"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Cambiar vista"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar evidencia..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterCategory || ''}
                  onChange={(e) => setFilterCategory((e.target.value as EvidenceCategory) || null)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {EVIDENCE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <select
                  value={filterType || ''}
                  onChange={(e) => setFilterType((e.target.value as EvidenceType) || null)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="photo">Fotos</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="text">Texto</option>
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="date-desc">Más reciente primero</option>
                <option value="date-asc">Más antiguo primero</option>
                <option value="type">Por tipo</option>
                <option value="category">Por categoría</option>
              </select>
            </div>
          )}

          {/* Selected Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {selectedItems.size} seleccionados
              </span>
              <div className="flex gap-2">
                <button onClick={exportSelected} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg" aria-label="Exportar seleccionados">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedItems(new Set())} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Limpiar selección">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { icon: <ImageIcon className="w-4 h-4" />, count: stats.photos, label: 'Fotos' },
            { icon: <Video className="w-4 h-4" />, count: stats.videos, label: 'Videos' },
            { icon: <Mic className="w-4 h-4" />, count: stats.audio, label: 'Audio' },
            { icon: <FileText className="w-4 h-4" />, count: stats.text, label: 'Texto' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                {stat.icon}
                <span className="font-bold text-lg">{stat.count}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Evidence Gallery */}
        {displayEvidence.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sin evidencia aún
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Captura fotos, videos, audio o notas para documentar el incidente
            </p>
            <button onClick={() => setMode('camera')} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              Capturar Evidencia
            </button>
          </div>
        ) : (
          <div className={cn("gap-3", viewMode === 'grid' ? "grid grid-cols-2" : "flex flex-col")}>
            {displayEvidence.map(item => (
              <div
                key={item.id}
                onClick={() => setViewingItem(item)}
                className={cn(
                  "relative group cursor-pointer rounded-lg overflow-hidden",
                  viewMode === 'grid' ? "aspect-square" : "flex gap-4 p-3 bg-white dark:bg-gray-900",
                  selectedItems.has(item.id) && "ring-2 ring-purple-500"
                )}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelection(item.id) }}
                  className={cn(
                    "absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedItems.has(item.id)
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white/80 border-gray-400 opacity-0 group-hover:opacity-100"
                  )}
                  aria-label="Seleccionar"
                >
                  {selectedItems.has(item.id) && <Check className="w-4 h-4" />}
                </button>

                <div className={cn("relative", viewMode === 'grid' ? "w-full h-full" : "w-20 h-20 flex-shrink-0")}>
                  {item.type === 'photo' && item.fileData && (
                    <img src={item.fileData} alt={item.caption} className="w-full h-full object-cover" />
                  )}
                  {item.type === 'video' && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {item.type === 'audio' && (
                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Mic className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  {item.type === 'text' && (
                    <div className="w-full h-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-yellow-600" />
                    </div>
                  )}

                  {item.encrypted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className={cn(viewMode === 'grid' && "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3")}>
                  <div className={cn("text-sm font-medium truncate", viewMode === 'grid' ? "text-white" : "text-gray-900 dark:text-white")}>
                    {item.caption}
                  </div>
                  <div className={cn("text-xs flex items-center gap-2", viewMode === 'grid' ? "text-white/80" : "text-gray-500")}>
                    <span>{getCategoryLabel(item.category)}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleDateString('es-MX')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Capture Mode Selector */}
      {mode === 'gallery' && !pendingMedia && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-lg mx-auto flex justify-around">
            <button onClick={() => setMode('camera')} className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600">
              <Camera className="w-6 h-6" />
              <span className="text-xs">Foto</span>
            </button>
            <button onClick={() => setMode('video')} className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600">
              <Video className="w-6 h-6" />
              <span className="text-xs">Video</span>
            </button>
            <button onClick={() => setMode('audio')} className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600">
              <Mic className="w-6 h-6" />
              <span className="text-xs">Audio</span>
            </button>
            <button onClick={() => setMode('text')} className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600">
              <FileText className="w-6 h-6" />
              <span className="text-xs">Nota</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera Capture */}
      {mode === 'camera' && !pendingMedia && (
        <CameraCapture
          onCapture={(imageData, location) => { void handleMediaCaptured('photo', imageData, location) }}
          onCancel={() => setMode('gallery')}
          collector={collectorPseudonym}
          security={securitySettings}
        />
      )}

      {/* Video Recorder */}
      {mode === 'video' && !pendingMedia && (
        <VideoRecorder
          onCapture={(blob, duration) => { void handleMediaCaptured('video', blob, undefined, `Duración: ${Math.round(duration)}s`) }}
          onCancel={() => setMode('gallery')}
        />
      )}

      {/* Audio Recorder */}
      {mode === 'audio' && !pendingMedia && (
        <AudioRecorder
          onCapture={(blob, duration) => { void handleMediaCaptured('audio', blob, undefined, `Duración: ${Math.round(duration)}s`) }}
          onCancel={() => setMode('gallery')}
        />
      )}

      {/* Text Note Capture */}
      {mode === 'text' && (
        <TextNoteCapture
          busy={saving}
          onCancel={() => setMode('gallery')}
          onCapture={(caption, body, category) => {
            const dataUrl = `data:text/plain;base64,${btoa(unescape(encodeURIComponent(body)))}`
            void persistEvidence({
              type: 'text',
              dataUrl,
              caption,
              category,
              description: body,
              fileSize: new Blob([body]).size,
              mimeType: 'text/plain'
            })
          }}
        />
      )}

      {/* Metadata dialog for captured media (caption + category) */}
      {pendingMedia && (
        <MetaDialog
          title="Detalles de la evidencia"
          busy={saving}
          onCancel={() => { setPendingMedia(null); setMode('gallery') }}
          onConfirm={finalizePendingMedia}
        />
      )}

      {/* Delete confirmation (replaces confirm()) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">¿Eliminar evidencia?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Esta acción no se puede deshacer. El elemento se eliminará del registro cifrado.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteCandidate(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <h3 className="font-bold">{viewingItem.caption}</h3>
              <p className="text-sm text-gray-400">
                {getCategoryLabel(viewingItem.category)} • {new Date(viewingItem.timestamp).toLocaleString('es-MX')}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportItem(viewingItem)} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Exportar">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={() => setDeleteCandidate(viewingItem.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg" aria-label="Eliminar">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {viewingItem.type === 'photo' && viewingItem.fileData && (
              <img src={viewingItem.fileData} alt={viewingItem.caption} className="max-w-full max-h-full object-contain" />
            )}
            {viewingItem.type === 'video' && viewingItem.fileData && (
              <video src={viewingItem.fileData} controls className="max-w-full max-h-full" />
            )}
            {viewingItem.type === 'audio' && viewingItem.fileData && (
              <audio src={viewingItem.fileData} controls className="w-full max-w-md" />
            )}
            {viewingItem.type === 'text' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {viewingItem.description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-4 text-sm text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Recopilado por:</span>
                <div className="text-white">{viewingItem.collector}</div>
              </div>
              <div>
                <span className="text-gray-600">Tamaño:</span>
                <div className="text-white">{formatFileSize(viewingItem.fileSize)}</div>
              </div>
              {viewingItem.location && (
                <div>
                  <span className="text-gray-600">Ubicación:</span>
                  <div className="text-white">
                    {viewingItem.location.latitude.toFixed(6)}, {viewingItem.location.longitude.toFixed(6)}
                  </div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Hash:</span>
                <div className="text-white font-mono text-xs truncate">{viewingItem.sha256}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvidenceCollection
