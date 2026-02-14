/**
 * Message Templates Component
 * Protocolo CDMX
 * 
 * Pre-written message templates for rapid communication
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  MessageSquare,
  Copy,
  Share2,
  Edit3,
  Plus,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Shield,
  Home,
  Newspaper,
  FileText,
  Send,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  MoreVertical,
  Download,
  Upload,
  Search
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MessageTemplate } from '@/types/contacts'

// =============================================================================
// TYPES
// =============================================================================

interface MessageTemplatesProps {
  templates?: MessageTemplate[]
  brigadeName?: string
  onSend?: (content: string, platform: 'whatsapp' | 'sms' | 'copy') => void
  onSaveTemplate?: (template: MessageTemplate) => void
  onDeleteTemplate?: (templateId: string) => void
  className?: string
}

interface TemplateVariable {
  name: string
  placeholder: string
  value: string
}

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'alert-1',
    name: 'Alerta de Desalojo',
    category: 'alert',
    content: 'Alerta de la Brigada [brigada]. Posible desalojo en [direccion]. Solicitamos apoyo urgente. Amenaza: [nivel]. Personas en riesgo: [numero]. Contacto: [contacto].',
    variables: ['brigada', 'direccion', 'nivel', 'numero', 'contacto'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'request-1',
    name: 'Solicitud de Punto Seguro',
    category: 'request',
    content: 'Solicitamos activación de punto seguro [albergue] para [numero] personas afectadas por desalojo en [direccion]. ETA: [tiempo]. Contacto: [contacto].',
    variables: ['albergue', 'numero', 'direccion', 'tiempo', 'contacto'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'request-2',
    name: 'Solicitud Legal Urgente',
    category: 'request',
    content: 'Urgente: Se requiere presencia legal inmediata en [direccion]. Desalojo en progreso. Juez/actuario presente: [detalles]. Tiempo estimado: [tiempo].',
    variables: ['direccion', 'detalles', 'tiempo'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'response-1',
    name: 'Respuesta a Prensa',
    category: 'response',
    content: 'Gracias por su interés. La Brigada [brigada] puede ofrecer información verificada sobre el caso en [direccion]. Solicitamos respeto a la privacidad de las personas afectadas. Contacto prensa: [contacto].',
    variables: ['brigada', 'direccion', 'contacto'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'doc-1',
    name: 'Documentación Amenaza',
    category: 'documentation',
    content: 'Documentando amenaza de represalia: Fecha/hora: [fecha]. Ubicación: [direccion]. Agresores: [descripcion]. Testigos: [testigos]. Evidencia adjunta.',
    variables: ['fecha', 'direccion', 'descripcion', 'testigos'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-2',
    name: 'Activación Brigada',
    category: 'alert',
    content: 'ATENCIÓN BRIGADISTAS: Activación inmediata. Incidente en [direccion]. Punto de encuentro: [punto]. Hora: [hora]. Traer: [equipo]. Coordinador: [coordinador].',
    variables: ['direccion', 'punto', 'hora', 'equipo', 'coordinador'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'request-3',
    name: 'Solicitud Médica',
    category: 'request',
    content: 'Se solicita apoyo médico urgente en [direccion]. [numero] personas lesionadas. Tipo de lesiones: [lesiones]. Ambulancia requerida: [si/no].',
    variables: ['direccion', 'numero', 'lesiones'],
    isDefault: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
]

const CATEGORY_ICONS = {
  alert: AlertTriangle,
  request: Shield,
  response: MessageSquare,
  documentation: FileText,
  custom: Edit3
}

const CATEGORY_COLORS = {
  alert: 'bg-red-100 text-red-800 border-red-200',
  request: 'bg-blue-100 text-blue-800 border-blue-200',
  response: 'bg-green-100 text-green-800 border-green-200',
  documentation: 'bg-purple-100 text-purple-800 border-purple-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200'
}

const CATEGORY_LABELS = {
  alert: 'Alertas',
  request: 'Solicitudes',
  response: 'Respuestas',
  documentation: 'Documentación',
  custom: 'Personalizadas'
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  templates: propTemplates,
  brigadeName = 'CDMX',
  onSend,
  onSaveTemplate,
  onDeleteTemplate,
  className
}) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(propTemplates || DEFAULT_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTab = 
        activeTab === 'all' || 
        template.category === activeTab ||
        (activeTab === 'favorites' && template.usageCount > 5)

      return matchesSearch && matchesTab
    }).sort((a, b) => b.usageCount - a.usageCount)
  }, [templates, searchQuery, activeTab])

  // Get processed message with variables replaced
  const getProcessedMessage = useCallback(() => {
    if (!selectedTemplate) return ''
    
    let message = selectedTemplate.content
    
    // Replace variables
    selectedTemplate.variables.forEach(variable => {
      const value = variableValues[variable] || `[${variable}]`
      message = message.replace(new RegExp(`\\[${variable}\\]`, 'g'), value)
    })

    // Replace brigade name if not in variables
    if (!selectedTemplate.variables.includes('brigada')) {
      message = message.replace(/\[brigada\]/g, brigadeName)
    }

    return message
  }, [selectedTemplate, variableValues, brigadeName])

  // Handle variable change
  const handleVariableChange = useCallback((variable: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [variable]: value }))
  }, [])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    const message = getProcessedMessage()
    await navigator.clipboard.writeText(message)
    setCopied(true)
    onSend?.(message, 'copy')
    setTimeout(() => setCopied(false), 2000)
  }, [getProcessedMessage, onSend])

  // Share to WhatsApp
  const handleShareWhatsApp = useCallback(() => {
    const message = getProcessedMessage()
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    onSend?.(message, 'whatsapp')
  }, [getProcessedMessage, onSend])

  // Share to SMS
  const handleShareSMS = useCallback(() => {
    const message = getProcessedMessage()
    window.location.href = `sms:?body=${encodeURIComponent(message)}`
    onSend?.(message, 'sms')
  }, [getProcessedMessage, onSend])

  // Save custom template
  const handleSaveTemplate = useCallback((templateData: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt'>) => {
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: `custom-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      isDefault: false
    }

    setTemplates(prev => [...prev, newTemplate])
    onSaveTemplate?.(newTemplate)
    setShowEditor(false)
  }, [onSaveTemplate])

  // Delete template
  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      onDeleteTemplate?.(templateId)
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
    }
  }, [onDeleteTemplate, selectedTemplate])

  // Export templates
  const handleExport = useCallback(() => {
    const data = JSON.stringify(templates, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protocolo_plantillas_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [templates])

  // Import templates
  const handleImport = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as MessageTemplate[]
        setTemplates(prev => [...prev, ...imported])
      } catch (error) {
        alert('Error al importar plantillas')
      }
    }
    reader.readAsText(file)
  }, [])

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Plantillas de Mensajes
              </h1>
              <p className="text-sm text-muted-foreground">
                Mensajes pre-escritos para comunicación rápida
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                />
                <Button variant="outline" size="icon" asChild>
                  <span><Upload className="w-4 h-4" /></span>
                </Button>
              </label>
              <Button onClick={() => {
                setEditingTemplate(null)
                setShowEditor(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 border-r overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-6">
                <TabsTrigger value="all">Todas</TabsTrigger>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-4 space-y-2">
                  {filteredTemplates.map(template => {
                    const Icon = CATEGORY_ICONS[template.category]
                    return (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedTemplate?.id === template.id && "border-primary ring-1 ring-primary"
                        )}
                        onClick={() => {
                          setSelectedTemplate(template)
                          setVariableValues({})
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg", CATEGORY_COLORS[template.category])}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{template.name}</h3>
                                {template.usageCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {template.usageCount} usos
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {template.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {CATEGORY_LABELS[template.category]}
                                </Badge>
                                {template.variables.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {template.variables.length} variables
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Preview/Edit Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                  <div className="flex gap-1">
                    {!selectedTemplate.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTemplate(selectedTemplate)
                            setShowEditor(true)
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Variables */}
                {selectedTemplate.variables.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Variables
                    </h3>
                    <div className="grid gap-2">
                      {selectedTemplate.variables.map(variable => (
                        <div key={variable} className="space-y-1">
                          <Label className="text-xs capitalize">
                            {variable.replace(/_/g, ' ')}
                          </Label>
                          <Input
                            placeholder={`Ingrese ${variable}...`}
                            value={variableValues[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Vista Previa
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <p className="whitespace-pre-wrap text-sm">
                      {getProcessedMessage()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCopy} variant="outline" className="w-full">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copiar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar al portapapeles</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleShareWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Compartir por WhatsApp</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleShareSMS} variant="secondary" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enviar por SMS</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Seleccione una plantilla</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Editor Dialog */}
        <TemplateEditor
          open={showEditor}
          onClose={() => {
            setShowEditor(false)
            setEditingTemplate(null)
          }}
          onSave={handleSaveTemplate}
          template={editingTemplate}
        />
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// TEMPLATE EDITOR
// =============================================================================

interface TemplateEditorProps {
  open: boolean
  onClose: () => void
  onSave: (template: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt'>) => void
  template: MessageTemplate | null
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ open, onClose, onSave, template }) => {
  const [name, setName] = useState(template?.name || '')
  const [category, setCategory] = useState<MessageTemplate['category']>(template?.category || 'custom')
  const [content, setContent] = useState(template?.content || '')
  const [variables, setVariables] = useState<string[]>(template?.variables || [])
  const [newVariable, setNewVariable] = useState('')

  const handleAddVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable])
      setNewVariable('')
    }
  }

  const handleRemoveVariable = (v: string) => {
    setVariables(variables.filter(varName => varName !== v))
  }

  const handleSave = () => {
    if (!name || !content) {
      alert('Nombre y contenido son requeridos')
      return
    }
    onSave({ name, category, content, variables, isDefault: false })
  }

  const insertVariable = (variable: string) => {
    setContent(content + `[${variable}]`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Alerta de Desalojo"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contenido *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escriba el mensaje. Use [variable] para campos dinámicos."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use corchetes para variables: [nombre], [direccion], [numero]
            </p>
          </div>

          <div className="space-y-2">
            <Label>Variables</Label>
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Nueva variable"
                onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
              />
              <Button type="button" onClick={handleAddVariable}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {variables.map(v => (
                <Badge key={v} variant="secondary" className="cursor-pointer" onClick={() => insertVariable(v)}>
                  [{v}]
                  <X 
                    className="w-3 h-3 ml-1 hover:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveVariable(v)
                    }}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {template ? 'Guardar Cambios' : 'Crear Plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Label component
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <label className={cn("text-sm font-medium", className)}>{children}</label>
)

export default MessageTemplates
