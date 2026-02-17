/**
 * Supply Checklist Component
 * Protocolo CDMX
 * 
 * Inventory management with pre-defined and custom checklists
 */

import React, { useState, useMemo } from 'react'
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  User,
  MapPin,
  Clock,
  MoreHorizontal,
  Download,
  Share2,
  Edit,
  Trash2,
  Save,
  X,
  Copy,
  PlusCircle,
  Minus,
  AlertCircle,
  FileText,
  Heart,
  Droplets,
  Shield,
  Radio,
  Boxes,
  Truck,
  Building2
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  Checkbox,
  Textarea,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type {
  SupplyChecklist as SupplyChecklistType,
  ChecklistItem as ChecklistItemType,
  ResourceLevel,
  ResourceCategory
} from '@/types/resources'
import { RESOURCE_LEVELS, RESOURCE_CATEGORIES } from '@/types/resources'

// =============================================================================
// TYPES
// =============================================================================

interface SupplyChecklistProps {
  checklists: SupplyChecklistType[]
  onCreateChecklist?: (checklist: Omit<SupplyChecklistType, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateChecklist?: (checklistId: string, updates: Partial<SupplyChecklistType>) => void
  onDeleteChecklist?: (checklistId: string) => void
  onToggleItem?: (checklistId: string, itemId: string, completed: boolean) => void
  onUpdateItemQuantity?: (checklistId: string, itemId: string, quantity: number) => void
  className?: string
}

// =============================================================================
// PRE-DEFINED CHECKLISTS
// =============================================================================

const PREDEFINED_CHECKLISTS: Omit<SupplyChecklistType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Kit Básico de Respuesta',
    description: 'Equipo esencial para 2-5 brigadistas',
    level: 'basico',
    category: 'logistica',
    isDefault: true,
    isCustom: false,
    items: [
      { id: 'item-1', name: 'Botellas de agua 1L', quantity: 10, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-2', name: 'Barras energéticas', quantity: 20, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-3', name: 'Botiquín básico', quantity: 1, unit: 'kit', isOptional: false, isCompleted: false },
      { id: 'item-4', name: 'Chalecos reflectantes', quantity: 5, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-5', name: 'Cargador portátil', quantity: 2, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-6', name: 'Linterna LED', quantity: 3, unit: 'piezas', isOptional: true, isCompleted: false },
      { id: 'item-7', name: 'Cinta de aislar', quantity: 2, unit: 'rollos', isOptional: false, isCompleted: false },
      { id: 'item-8', name: 'Guantes de trabajo', quantity: 5, unit: 'pares', isOptional: false, isCompleted: false }
    ]
  },
  {
    name: 'Kit Médico Completo',
    description: 'Equipo médico para atención de emergencias',
    level: 'medio',
    category: 'primeros_auxilios',
    isDefault: true,
    isCustom: false,
    items: [
      { id: 'item-9', name: 'Vendas elásticas', quantity: 10, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-10', name: 'Gasas estériles', quantity: 50, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-11', name: 'Antiséptico', quantity: 5, unit: 'botellas', isOptional: false, isCompleted: false },
      { id: 'item-12', name: 'Termómetro digital', quantity: 2, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-13', name: 'Tensiómetro', quantity: 1, unit: 'pieza', isOptional: false, isCompleted: false },
      { id: 'item-14', name: 'Oxímetro', quantity: 1, unit: 'pieza', isOptional: true, isCompleted: false },
      { id: 'item-15', name: 'Mascarillas N95', quantity: 20, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-16', name: 'Guantes quirúrgicos', quantity: 100, unit: 'pares', isOptional: false, isCompleted: false }
    ]
  },
  {
    name: 'Kit de Documentación',
    description: 'Herramientas para documentación de incidentes',
    level: 'basico',
    category: 'documentacion',
    isDefault: true,
    isCustom: false,
    items: [
      { id: 'item-17', name: 'Cámara desechable', quantity: 2, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-18', name: 'Libreta resistente', quantity: 3, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-19', name: 'Marcadores permanentes', quantity: 10, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-20', name: 'Cinta métrica', quantity: 1, unit: 'pieza', isOptional: false, isCompleted: false },
      { id: 'item-21', name: 'Brújula', quantity: 1, unit: 'pieza', isOptional: true, isCompleted: false },
      { id: 'item-22', name: 'GPS portátil', quantity: 1, unit: 'pieza', isOptional: true, isCompleted: false }
    ]
  },
  {
    name: 'Kit de Comunicaciones',
    description: 'Equipo de comunicación para operaciones',
    level: 'medio',
    category: 'comunicaciones',
    isDefault: true,
    isCustom: false,
    items: [
      { id: 'item-23', name: 'Radios portátiles', quantity: 5, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-24', name: 'Cargadores portátiles', quantity: 5, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-25', name: 'Cables USB variados', quantity: 10, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-26', name: 'Teléfono satelital', quantity: 1, unit: 'pieza', isOptional: true, isCompleted: false },
      { id: 'item-27', name: 'Baterías extra radios', quantity: 10, unit: 'piezas', isOptional: false, isCompleted: false },
      { id: 'item-28', name: 'Tarjetas SIM de respaldo', quantity: 3, unit: 'piezas', isOptional: true, isCompleted: false }
    ]
  }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const SupplyChecklist: React.FC<SupplyChecklistProps> = ({
  checklists: propChecklists = [],
  onCreateChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
  onToggleItem,
  onUpdateItemQuantity,
  className
}) => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<ResourceLevel | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showChecklistDetail, setShowChecklistDetail] = useState<string | null>(null)
  const [editingChecklist, setEditingChecklist] = useState<string | null>(null)
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set())

  // Merge predefined with custom checklists
  const allChecklists = useMemo(() => {
    const predefined = PREDEFINED_CHECKLISTS.map((template, index) => ({
      ...template,
      id: `template-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) as SupplyChecklistType[]
    
    return [...predefined, ...propChecklists]
  }, [propChecklists])

  // Filter checklists
  const filteredChecklists = useMemo(() => {
    return allChecklists.filter(checklist => {
      const matchesSearch = checklist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checklist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesLevel = selectedLevel === 'all' || checklist.level === selectedLevel
      const matchesCategory = selectedCategory === 'all' || checklist.category === selectedCategory
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'default' && checklist.isDefault) ||
        (activeTab === 'custom' && checklist.isCustom)
      
      return matchesSearch && matchesLevel && matchesCategory && matchesTab
    })
  }, [allChecklists, searchQuery, selectedLevel, selectedCategory, activeTab])

  // Calculate progress for a checklist
  const getChecklistProgress = (checklist: SupplyChecklistType) => {
    const total = checklist.items.length
    const completed = checklist.items.filter(item => item.isCompleted).length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allChecklists.length
    const defaultCount = allChecklists.filter(c => c.isDefault).length
    const customCount = allChecklists.filter(c => c.isCustom).length
    const completedCount = allChecklists.filter(c => {
      const progress = getChecklistProgress(c)
      return progress.completed === progress.total && progress.total > 0
    }).length
    
    return { total, defaultCount, customCount, completedCount }
  }, [allChecklists])

  const handleExpand = (checklistId: string) => {
    const newExpanded = new Set(expandedChecklists)
    if (newExpanded.has(checklistId)) {
      newExpanded.delete(checklistId)
    } else {
      newExpanded.add(checklistId)
    }
    setExpandedChecklists(newExpanded)
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                Listas de Verificación
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión de inventarios y suministros
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Lista
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 p-4">
          <StatCard value={stats.total} label="Total" icon={<ClipboardCheck className="w-4 h-4" />} />
          <StatCard value={stats.defaultCount} label="Predefinidas" icon={<Package className="w-4 h-4" />} />
          <StatCard value={stats.customCount} label="Personalizadas" icon={<Edit className="w-4 h-4" />} />
          <StatCard value={stats.completedCount} label="Completadas" icon={<CheckCircle2 className="w-4 h-4" />} />
        </div>

        {/* Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar listas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as ResourceLevel | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {Object.entries(RESOURCE_LEVELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(RESOURCE_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="default">Predefinidas</TabsTrigger>
            <TabsTrigger value="custom">Personalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pb-4">
                {filteredChecklists.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay listas de verificación</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                      Crear nueva lista
                    </Button>
                  </div>
                ) : (
                  filteredChecklists.map(checklist => {
                    const progress = getChecklistProgress(checklist)
                    const isExpanded = expandedChecklists.has(checklist.id)
                    const category = checklist.category ? RESOURCE_CATEGORIES[checklist.category] : null
                    
                    return (
                      <Card 
                        key={checklist.id} 
                        className={cn(
                          "transition-all duration-200",
                          progress.percentage === 100 && progress.total > 0 && "border-green-500 bg-green-50/30"
                        )}
                      >
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                checklist.isDefault ? "bg-primary/10" : "bg-orange-100",
                                checklist.isDefault ? "text-primary" : "text-orange-600"
                              )}>
                                {checklist.isDefault ? <Package className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{checklist.name}</h3>
                                  {progress.percentage === 100 && progress.total > 0 && (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {checklist.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {RESOURCE_LEVELS[checklist.level].label}
                                  </Badge>
                                  {category && (
                                    <Badge variant="outline">
                                      {category.label}
                                    </Badge>
                                  )}
                                  {checklist.isCustom && (
                                    <Badge className="bg-orange-100 text-orange-700">Personalizada</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleExpand(checklist.id)}
                              >
                                {isExpanded ? 'Colapsar' : 'Ver'}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setShowChecklistDetail(checklist.id)}>
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  {!checklist.isDefault && (
                                    <DropdownMenuItem onClick={() => setEditingChecklist(checklist.id)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => {/* Duplicate */}}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {/* Export */}}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                  </DropdownMenuItem>
                                  {!checklist.isDefault && (
                                    <DropdownMenuItem 
                                      onClick={() => onDeleteChecklist?.(checklist.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className={cn(
                                progress.percentage === 100 && progress.total > 0 && "text-green-600 font-medium"
                              )}>
                                {progress.completed} de {progress.total} completados
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(progress.percentage)}%
                              </span>
                            </div>
                            <Progress 
                              value={progress.percentage} 
                              className={cn(
                                "h-2",
                                progress.percentage === 100 && progress.total > 0 && "bg-green-100"
                              )}
                            />
                          </div>

                          {/* Items (when expanded) */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                              {checklist.items.map(item => (
                                <div 
                                  key={item.id} 
                                  className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                    item.isCompleted ? "bg-green-50" : "bg-gray-50"
                                  )}
                                >
                                  <Checkbox 
                                    checked={item.isCompleted}
                                    onCheckedChange={(checked) => 
                                      onToggleItem?.(checklist.id, item.id, checked as boolean)
                                    }
                                  />
                                  <div className="flex-1">
                                    <p className={cn(
                                      "font-medium",
                                      item.isCompleted && "line-through text-muted-foreground"
                                    )}>
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.quantity} {item.unit}
                                      {item.isOptional && (
                                        <span className="ml-2 text-orange-600">(Opcional)</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => onUpdateItemQuantity?.(checklist.id, item.id, Math.max(1, item.quantity - 1))}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => onUpdateItemQuantity?.(checklist.id, item.id, item.quantity + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => setShowChecklistDetail(checklist.id)}
                              >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Agregar ítem
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Create Checklist Dialog */}
        <CreateChecklistDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreate={onCreateChecklist}
        />

        {/* Detail Dialog */}
        {showChecklistDetail && (
          <ChecklistDetailDialog
            open={!!showChecklistDetail}
            onOpenChange={(open) => !open && setShowChecklistDetail(null)}
            checklist={allChecklists.find(c => c.id === showChecklistDetail)!}
            onToggleItem={onToggleItem}
            onUpdateItemQuantity={onUpdateItemQuantity}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatCardProps {
  value: number
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning'
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, variant = 'default' }) => (
  <Card>
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'success' ? "bg-green-100 text-green-600" :
          variant === 'warning' ? "bg-orange-100 text-orange-600" :
          "bg-gray-100 text-gray-600"
        )}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

interface CreateChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate?: (checklist: Omit<SupplyChecklistType, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const CreateChecklistDialog: React.FC<CreateChecklistDialogProps> = ({ open, onOpenChange, onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<ResourceLevel>('basico')
  const [category, setCategory] = useState<ResourceCategory>('logistica')
  const [items, setItems] = useState<ChecklistItemType[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [newItemUnit, setNewItemUnit] = useState('piezas')
  const [newItemOptional, setNewItemOptional] = useState(false)

  const handleAddItem = () => {
    if (!newItemName.trim()) return
    
    setItems([...items, {
      id: `temp-${Date.now()}`,
      name: newItemName,
      description: '',
      quantity: newItemQuantity,
      unit: newItemUnit,
      isOptional: newItemOptional,
      isCompleted: false
    }])
    
    setNewItemName('')
    setNewItemQuantity(1)
    setNewItemOptional(false)
  }

  const handleCreate = () => {
    if (!name.trim() || items.length === 0) return
    
    onCreate?.({
      name,
      description,
      level,
      category,
      items,
      isDefault: false,
      isCustom: true
    })
    
    // Reset
    setName('')
    setDescription('')
    setLevel('basico')
    setCategory('logistica')
    setItems([])
    onOpenChange(false)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Lista de Verificación
          </DialogTitle>
          <DialogDescription>
            Crea una lista personalizada para gestionar suministros
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej: Kit de Seguridad Personal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              placeholder="Describe el propósito de esta lista..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as ResourceLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RESOURCE_LEVELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RESOURCE_CATEGORIES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Ítems ({items.length})
            </Label>

            {/* Existing items */}
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                    {item.isOptional && (
                      <Badge variant="outline" className="text-xs">Opcional</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <Card className="border-dashed">
              <CardContent className="p-3 space-y-3">
                <Input
                  placeholder="Nombre del ítem"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piezas">Piezas</SelectItem>
                      <SelectItem value="pares">Pares</SelectItem>
                      <SelectItem value="kits">Kits</SelectItem>
                      <SelectItem value="rollos">Rollos</SelectItem>
                      <SelectItem value="botellas">Botellas</SelectItem>
                      <SelectItem value="cajas">Cajas</SelectItem>
                      <SelectItem value="kg">Kilogramos</SelectItem>
                      <SelectItem value="litros">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 ml-auto">
                    <Checkbox
                      id="optional"
                      checked={newItemOptional}
                      onCheckedChange={(checked) => setNewItemOptional(checked as boolean)}
                    />
                    <Label htmlFor="optional" className="text-sm cursor-pointer">Opcional</Label>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAddItem}
                  disabled={!newItemName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar ítem
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!name.trim() || items.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Crear Lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChecklistDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist: SupplyChecklistType
  onToggleItem?: (checklistId: string, itemId: string, completed: boolean) => void
  onUpdateItemQuantity?: (checklistId: string, itemId: string, quantity: number) => void
}

const ChecklistDetailDialog: React.FC<ChecklistDetailDialogProps> = ({
  open,
  onOpenChange,
  checklist,
  onToggleItem,
  onUpdateItemQuantity
}) => {
  const category = checklist.category ? RESOURCE_CATEGORIES[checklist.category] : null
  const progress = checklist.items.filter(i => i.isCompleted).length
  const total = checklist.items.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0",
              checklist.isDefault ? "bg-primary/10" : "bg-orange-100",
              checklist.isDefault ? "text-primary" : "text-orange-600"
            )}>
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{checklist.name}</DialogTitle>
              <DialogDescription>
                {checklist.description}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{RESOURCE_LEVELS[checklist.level].label}</Badge>
                {category && <Badge variant="outline">{category.label}</Badge>}
                <span className="text-sm text-muted-foreground">
                  {progress}/{total} completados
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {checklist.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Esta lista no tiene ítems</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checklist.items.map(item => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    item.isCompleted ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50"
                  )}
                >
                  <Checkbox 
                    checked={item.isCompleted}
                    onCheckedChange={(checked) => 
                      onToggleItem?.(checklist.id, item.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      item.isCompleted && "line-through text-muted-foreground"
                    )}>
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.isOptional && (
                        <Badge variant="secondary" className="text-xs">Opcional</Badge>
                      )}
                      {item.completedAt && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completado el {new Date(item.completedAt).toLocaleDateString('es-MX')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateItemQuantity?.(checklist.id, item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center min-w-[60px]">
                      <span className="font-mono font-medium">{item.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateItemQuantity?.(checklist.id, item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 gap-2">
          <div className="flex-1">
            <Progress value={(progress / total) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round((progress / total) * 100)}% completado
            </p>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SupplyChecklist
