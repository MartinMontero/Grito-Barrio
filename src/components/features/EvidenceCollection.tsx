/**
 * Evidence Collection Component
 * Protocolo CDMX
 * 
 * Comprehensive evidence capture and management with chain of custody
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Camera,
  Video,
  Mic,
  FileText,
  Lock,
  Unlock,
  Shield,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  User,
  Hash,
  Fingerprint,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Play,
  Square,
  Pause,
  FileSignature,
  Blur,
  VolumeX,
  Archive,
  FileCheck,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input, Textarea, Select } from '@/components/ui'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type EvidenceType = 'photo' | 'video' | 'audio' | 'text'
type EvidenceCategory = 'lesiones' | 'autoridades' | 'documentos' | 'escena' | 'testigos' | 'otros'
type CaptureMode = 'camera' | 'video' | 'audio' | 'text' | 'gallery'
type ViewMode = 'grid' | 'list'
type SortBy = 'date-desc' | 'date-asc' | 'type' | 'category'

interface Location {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
}

interface ChainOfCustodyEntry {
  timestamp: string
  action: 'created' | 'accessed' | 'modified' | 'transferred' | 'deleted'
  actor: string
  reason?: string
  method?: string
  recipient?: string
}

interface EvidenceItem {
  id: string
  type: EvidenceType
  category: EvidenceCategory
  timestamp: string
  collector: string
  location?: Location
  caption: string
  description: string
  fileData: string // base64 or blob URL
  fileSize: number
  fileName: string
  mimeType: string
  sha256: string
  chainOfCustody: ChainOfCustodyEntry[]
  metadata: {
    deviceId: string
    deviceModel: string
    userAgent: string
  }
  security: {
    encrypted: boolean
    metadataStripped: boolean
    locationFuzzed: boolean
    facesBlurred: boolean
    audioRemoved: boolean
  }
  consent?: {
    obtained: boolean
    withdrawable: boolean
    withdrawn?: boolean
  }
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

async function generateSHA256(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateEvidenceId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

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

function getCategoryIcon(category: EvidenceCategory): React.ReactNode {
  return EVIDENCE_CATEGORIES.find(c => c.value === category)?.icon || <MoreVertical className="w-4 h-4" />
}

// =============================================================================
// SUB-COMPONENT: Camera Capture
// =============================================================================

interface CameraCaptureProps {
  onCapture: (imageData: string, location?: Location) => void
  onCancel: () => void
  collector: string
  security: typeof INITIAL_SECURITY_SETTINGS
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, collector, security }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    // Get camera access
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(mediaStream => {
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      })
      .catch(err => {
        console.error('Camera access denied:', err)
        alert('No se pudo acceder a la cámara. Por favor verifica los permisos.')
      })

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          })
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    setCapturing(true)
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    // Add timestamp overlay
    if (security.autoEncrypt) {
      context.fillStyle = 'rgba(0, 0, 0, 0.5)'
      context.fillRect(10, canvas.height - 50, 300, 40)
      context.fillStyle = 'white'
      context.font = '16px monospace'
      context.fillText(new Date().toLocaleString('es-MX'), 20, canvas.height - 25)
      context.fillText(`Collector: ${collector}`, 20, canvas.height - 10)
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    onCapture(imageData, location || undefined)
    setCapturing(false)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
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
        <button onClick={onCancel} className="text-white p-3">
          <X className="w-8 h-8" />
        </button>
        
        <button
          onClick={handleCapture}
          disabled={capturing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
        
        <div className="w-14" /> {/* Spacer for alignment */}
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onCapture(audioBlob, duration)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert('No se pudo acceder al micrófono.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
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

      {/* Recording Visualizer */}
      <div className="w-full max-w-md h-32 bg-gray-800 rounded-lg mb-8 flex items-center justify-center">
        {isRecording ? (
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        ) : (
          <Mic className="w-16 h-16 text-gray-600" />
        )}
      </div>

      {/* Duration */}
      <div className="text-4xl font-mono text-white mb-8">
        {formatDuration(duration)}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="p-4 rounded-full bg-gray-700 text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            className="p-6 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/50"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="p-6 rounded-full bg-gray-200 text-gray-900"
          >
            <Square className="w-8 h-8" />
          </button>
        )}
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
  const [mode, setMode] = useState<CaptureMode>('gallery')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<EvidenceCategory | null>(null)
  const [filterType, setFilterType] = useState<EvidenceType | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewingItem, setViewingItem] = useState<EvidenceItem | null>(null)
  const [securitySettings, setSecuritySettings] = useState(INITIAL_SECURITY_SETTINGS)
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])

  // Load evidence from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`evidence-${incidentId}`)
    if (stored) {
      setEvidence(JSON.parse(stored))
    }
  }, [incidentId])

  // Save evidence to localStorage
  useEffect(() => {
    localStorage.setItem(`evidence-${incidentId}`, JSON.stringify(evidence))
  }, [evidence, incidentId])

  // Filter and sort evidence
  const filteredEvidence = useCallback(() => {
    let result = [...evidence]
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.caption.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    
    // Filter by category
    if (filterCategory) {
      result = result.filter(item => item.category === filterCategory)
    }
    
    // Filter by type
    if (filterType) {
      result = result.filter(item => item.type === filterType)
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'date-asc':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'type':
          return a.type.localeCompare(b.type)
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })
    
    return result
  }, [evidence, searchQuery, filterCategory, filterType, sortBy])

  // Add evidence item
  const addEvidence = async (
    type: EvidenceType,
    fileData: string | Blob,
    caption: string,
    category: EvidenceCategory,
    description: string = '',
    location?: Location
  ) => {
    const id = generateEvidenceId()
    const timestamp = new Date().toISOString()
    
    // Convert blob to base64 if needed
    let dataUrl: string
    let fileSize: number
    let mimeType: string
    let fileName: string
    
    if (fileData instanceof Blob) {
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(fileData)
      })
      fileSize = fileData.size
      mimeType = fileData.type
      fileName = `${id}.${fileData.type.split('/')[1] || 'bin'}`
    } else {
      dataUrl = fileData
      fileSize = Math.round((fileData.length * 3) / 4) // Approximate base64 size
      mimeType = type === 'photo' ? 'image/jpeg' : type === 'video' ? 'video/webm' : 'audio/webm'
      fileName = `${id}.${type === 'photo' ? 'jpg' : type === 'video' ? 'webm' : 'webm'}`
    }
    
    // Generate hash
    const sha256 = await generateSHA256(dataUrl)
    
    // Fuzz location if enabled
    let finalLocation = location
    if (location && securitySettings.fuzzLocation) {
      const fuzzAmount = 0.001 // ~100m
      finalLocation = {
        ...location,
        latitude: location.latitude + (Math.random() - 0.5) * fuzzAmount,
        longitude: location.longitude + (Math.random() - 0.5) * fuzzAmount
      }
    }
    
    const newItem: EvidenceItem = {
      id,
      type,
      category,
      timestamp,
      collector: collectorPseudonym,
      location: finalLocation,
      caption,
      description,
      fileData: dataUrl,
      fileSize,
      fileName,
      mimeType,
      sha256,
      chainOfCustody: [{
        timestamp,
        action: 'created',
        actor: collectorPseudonym
      }],
      metadata: {
        deviceId: navigator.userAgent,
        deviceModel: navigator.platform,
        userAgent: navigator.userAgent
      },
      security: {
        encrypted: securitySettings.autoEncrypt,
        metadataStripped: securitySettings.stripMetadata,
        locationFuzzed: securitySettings.fuzzLocation,
        facesBlurred: securitySettings.blurFaces,
        audioRemoved: securitySettings.removeAudio
      },
      consent: {
        obtained: category === 'testigos',
        withdrawable: category === 'testigos'
      }
    }
    
    setEvidence(prev => [newItem, ...prev])
    onEvidenceAdded?.(newItem)
    setMode('gallery')
  }

  // Delete evidence
  const deleteEvidence = (itemId: string) => {
    if (confirm('¿Estás seguro de eliminar esta evidencia? Esta acción no se puede deshacer.')) {
      setEvidence(prev => prev.filter(item => item.id !== itemId))
      onEvidenceDeleted?.(itemId)
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  // Toggle item selection
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Export single item
  const exportItem = (item: EvidenceItem) => {
    const report = `
EVIDENCIA - PROTOCOLO CDMX
===========================

ID: ${item.id}
Incidente: ${incidentId}
Tipo: ${item.type}
Categoría: ${getCategoryLabel(item.category)}

Recopilado por: ${item.collector}
Fecha: ${new Date(item.timestamp).toLocaleString('es-MX')}

UBICACIÓN
---------
${item.location ? `
Latitud: ${item.location.latitude}
Longitud: ${item.location.longitude}
Precisión: ${item.location.accuracy}m
` : 'No disponible'}

CONTENIDO
---------
Título: ${item.caption}
Descripción: ${item.description}

HASH SHA-256
------------
${item.sha256}

CADENA DE CUSTODIA
------------------
${item.chainOfCustody.map(entry => `
[${new Date(entry.timestamp).toLocaleString('es-MX')}]
Acción: ${entry.action}
Actor: ${entry.actor}
${entry.reason ? `Razón: ${entry.reason}` : ''}
`).join('\n')}

SEGURIDAD
---------
Encriptado: ${item.security.encrypted ? 'Sí' : 'No'}
Metadata removida: ${item.security.metadataStripped ? 'Sí' : 'No'}
Ubicación difuminada: ${item.security.locationFuzzed ? 'Sí' : 'No'}

===========================
Protocolo CDMX - Evidencia Legal
    `
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.id}-report.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export selected items
  const exportSelected = () => {
    const selected = evidence.filter(item => selectedItems.has(item.id))
    // Implementation for bulk export would go here
    alert(`Exportando ${selected.length} elementos...`)
  }

  // Calculate stats
  const stats = {
    total: evidence.length,
    photos: evidence.filter(e => e.type === 'photo').length,
    videos: evidence.filter(e => e.type === 'video').length,
    audio: evidence.filter(e => e.type === 'audio').length,
    text: evidence.filter(e => e.type === 'text').length,
    encrypted: evidence.filter(e => e.security.encrypted).length
  }

  const displayEvidence = filteredEvidence()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
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
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-lg"
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
                  onChange={(e) => setFilterCategory(e.target.value as EvidenceCategory || null)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {EVIDENCE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <select
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value as EvidenceType || null)}
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
                <button
                  onClick={exportSelected}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
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
              Captura fotos, videos o audio para documentar el incidente
            </p>
            <button
              onClick={() => setMode('camera')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Capturar Evidencia
            </button>
          </div>
        ) : (
          <div className={cn(
            "gap-3",
            viewMode === 'grid' ? "grid grid-cols-2" : "flex flex-col"
          )}>
            {displayEvidence.map(item => (
              <div
                key={item.id}
                onClick={() => viewMode === 'grid' ? setViewingItem(item) : null}
                className={cn(
                  "relative group cursor-pointer rounded-lg overflow-hidden",
                  viewMode === 'grid' ? "aspect-square" : "flex gap-4 p-3 bg-white dark:bg-gray-900",
                  selectedItems.has(item.id) && "ring-2 ring-purple-500"
                )}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelection(item.id)
                  }}
                  className={cn(
                    "absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedItems.has(item.id)
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white/80 border-gray-400 opacity-0 group-hover:opacity-100"
                  )}
                >
                  {selectedItems.has(item.id) && <Check className="w-4 h-4" />}
                </button>

                {/* Thumbnail */}
                <div className={cn(
                  "relative",
                  viewMode === 'grid' ? "w-full h-full" : "w-20 h-20 flex-shrink-0"
                )}>
                  {item.type === 'photo' && (
                    <img
                      src={item.fileData}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                    />
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

                  {/* Security Badge */}
                  {item.security.encrypted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={cn(
                  viewMode === 'grid' && "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3"
                )}>
                  <div className={cn(
                    "text-sm font-medium truncate",
                    viewMode === 'grid' ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    {item.caption}
                  </div>
                  <div className={cn(
                    "text-xs flex items-center gap-2",
                    viewMode === 'grid' ? "text-white/80" : "text-gray-500"
                  )}>
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
      {mode === 'gallery' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-lg mx-auto flex justify-around">
            <button
              onClick={() => setMode('camera')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">Foto</span>
            </button>
            <button
              onClick={() => setMode('video')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
            >
              <Video className="w-6 h-6" />
              <span className="text-xs">Video</span>
            </button>
            <button
              onClick={() => setMode('audio')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs">Audio</span>
            </button>
            <button
              onClick={() => setMode('text')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs">Nota</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera Capture */}
      {mode === 'camera' && (
        <CameraCapture
          onCapture={(imageData, location) => {
            // Show caption/category dialog
            const caption = prompt('Título de la evidencia:') || 'Sin título'
            const category = prompt('Categoría (lesiones/autoridades/documentos/escena/testigos/otros):') as EvidenceCategory || 'otros'
            addEvidence('photo', imageData, caption, category, '', location)
          }}
          onCancel={() => setMode('gallery')}
          collector={collectorPseudonym}
          security={securitySettings}
        />
      )}

      {/* Audio Recorder */}
      {mode === 'audio' && (
        <AudioRecorder
          onCapture={(blob, duration) => {
            const caption = prompt('Título de la grabación:') || 'Grabación de audio'
            const category = prompt('Categoría:', 'testigos') as EvidenceCategory || 'testigos'
            addEvidence('audio', blob, caption, category, `Duración: ${Math.round(duration)}s`)
          }}
          onCancel={() => setMode('gallery')}
        />
      )}

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <h3 className="font-bold">{viewingItem.caption}</h3>
              <p className="text-sm text-gray-400">
                {getCategoryLabel(viewingItem.category)} • {new Date(viewingItem.timestamp).toLocaleString('es-MX')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportItem(viewingItem)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteEvidence(viewingItem.id)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-4">
            {viewingItem.type === 'photo' && (
              <img
                src={viewingItem.fileData}
                alt={viewingItem.caption}
                className="max-w-full max-h-full object-contain"
              />
            )}
            {viewingItem.type === 'video' && (
              <video
                src={viewingItem.fileData}
                controls
                className="max-w-full max-h-full"
              />
            )}
            {viewingItem.type === 'audio' && (
              <audio src={viewingItem.fileData} controls className="w-full max-w-md" />
            )}
            {viewingItem.type === 'text' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {viewingItem.description}
                </p>
              </div>
            )}
          </div>

          {/* Details */}
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
