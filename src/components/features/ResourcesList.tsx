/**
 * Resources List Component
 * Protocolo CDMX
 * 
 * Supplies and logistics management with checklists
 */

import React, { useState, useMemo } from 'react'
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Package,
  Plus,
  Minus,
  TrendingDown,
  ShoppingCart
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
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
  TooltipProvider,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { 
  SupplyItem, 
  SupplyChecklist, 
  ResourceKit,
  ResourceCategory,
  LogisticsRequest 
} from '@/types/resources'
import { RESOURCE_CATEGORIES, RESOURCE_LEVELS } from '@/types/resources'

// =============================================================================
// TYPES
// =============================================================================

interface ResourcesListProps {
  supplies: SupplyItem[]
  checklists: SupplyChecklist[]
  kits: ResourceKit[]
  requests: LogisticsRequest[]
  onUpdateSupply?: (supplyId: string, quantity: number) => void
  onCreateRequest?: (request: Omit<LogisticsRequest, 'id' | 'timestamp' | 'status'>) => void
  onUseKit?: (kitId: string, incidentId?: string) => void
  className?: string
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_SUPPLIES: SupplyItem[] = [
  {
    id: 'sup-1',
    name: 'Botellas de agua 1L',
    category: 'agua_alimentos',
    quantity: 150,
    unit: 'piezas',
    minQuantity: 50,
    idealQuantity: 200,
    location: 'Almacén Central',
    responsiblePerson: 'María García',
    status: 'adequate',
    needsRestock: false
  },
  {
    id: 'sup-2',
    name: 'Botiquín de primeros auxilios',
    category: 'primeros_auxilios',
    quantity: 8,
    unit: 'kits',
    minQuantity: 10,
    idealQuantity: 15,
    location: 'Almacén Central',
    expirationDate: '2025-06-01',
    status: 'low',
    needsRestock: true
  },
  {
    id: 'sup-3',
    name: 'Chalecos reflectantes',
    category: 'seguridad',
    quantity: 25,
    unit: 'piezas',
    minQuantity: 30,
    idealQuantity: 40,
    location: 'Vehículo de respuesta',
    status: 'low',
    needsRestock: true
  },
  {
    id: 'sup-4',
    name: 'Cámaras desechables',
    category: 'documentacion',
    quantity: 5,
    unit: 'piezas',
    minQuantity: 10,
    idealQuantity: 20,
    location: 'Kit de documentación',
    status: 'critical',
    needsRestock: true
  },
  {
    id: 'sup-5',
    name: 'Cargadores portátiles',
    category: 'comunicaciones',
    quantity: 12,
    unit: 'piezas',
    minQuantity: 8,
    idealQuantity: 15,
    location: 'Kit de comunicaciones',
    status: 'adequate',
    needsRestock: false
  }
]

const MOCK_KITS: ResourceKit[] = [
  {
    id: 'kit-1',
    name: 'Kit Básico de Respuesta',
    level: 'basico',
    description: 'Equipo esencial para 2-5 brigadistas',
    category: 'logistica',
    contents: [],
    totalCost: 2500,
    weight: 15
  },
  {
    id: 'kit-2',
    name: 'Kit Médico Completo',
    level: 'medio',
    description: 'Equipo médico para atención de emergencias',
    category: 'primeros_auxilios',
    contents: [],
    totalCost: 8500,
    weight: 25
  },
  {
    id: 'kit-3',
    name: 'Kit de Documentación',
    level: 'basico',
    description: 'Herramientas para documentación de incidentes',
    category: 'documentacion',
    contents: [],
    totalCost: 3500,
    weight: 8
  }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const ResourcesList: React.FC<ResourcesListProps> = ({
  supplies = MOCK_SUPPLIES,
  checklists = [],
  kits = MOCK_KITS,
  requests = [],
  onUpdateSupply,
  onCreateRequest,
  onUseKit,
  className
}) => {
  const [activeTab, setActiveTab] = useState('inventory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all')
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showKitDialog, setShowKitDialog] = useState(false)

  // Calculate statistics
  const stats = useMemo(() => {
    const total = supplies.length
    const critical = supplies.filter(s => s.status === 'critical').length
    const low = supplies.filter(s => s.status === 'low').length
    const expired = supplies.filter(s => s.status === 'expired').length
    const needsRestock = supplies.filter(s => s.needsRestock).length
    
    return { total, critical, low, expired, needsRestock }
  }, [supplies])

  // Filter supplies
  const filteredSupplies = useMemo(() => {
    return supplies.filter(supply => {
      const matchesSearch = 
        supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supply.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === 'all' || supply.category === selectedCategory
      
      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      // Sort by status priority
      const statusPriority = { critical: 0, low: 1, adequate: 2, expired: 3 }
      return statusPriority[a.status] - statusPriority[b.status]
    })
  }, [supplies, searchQuery, selectedCategory])

  // Group supplies by status
  const groupedSupplies = useMemo(() => {
    const groups: Record<string, SupplyItem[]> = {
      critical: [],
      low: [],
      adequate: []
    }
    
    filteredSupplies.forEach(supply => {
      if (groups[supply.status]) {
        groups[supply.status].push(supply)
      }
    })
    
    return groups
  }, [filteredSupplies])

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Boxes className="w-6 h-6 text-primary" />
                Recursos y Suministros
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión de inventario y logística
              </p>
            </div>
            <Button onClick={() => setShowRequestDialog(true)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Solicitar
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(stats.critical > 0 || stats.low > 0) && (
          <div className="px-4 pt-4 space-y-2">
            {stats.critical > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Stock crítico</AlertTitle>
                <AlertDescription>
                  {stats.critical} artículo(s) requieren reposición inmediata
                </AlertDescription>
              </Alert>
            )}
            {stats.low > 0 && (
              <Alert className="bg-orange-50 border-orange-200">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Stock bajo</AlertTitle>
                <AlertDescription className="text-orange-700">
                  {stats.low} artículo(s) por debajo del mínimo
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 p-4">
          <StatCard value={stats.total} label="Total" icon={<Boxes className="w-4 h-4" />} />
          <StatCard 
            value={stats.critical} 
            label="Crítico" 
            icon={<AlertTriangle className="w-4 h-4" />}
            variant="destructive"
          />
          <StatCard 
            value={stats.low} 
            label="Bajo" 
            icon={<TrendingDown className="w-4 h-4" />}
            variant="warning"
          />
          <StatCard 
            value={stats.expired} 
            label="Vencido" 
            icon={<AlertCircle className="w-4 h-4" />}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid grid-cols-3">
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="kits">Kits</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="flex-1 flex flex-col mt-0">
            {/* Filters */}
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar suministros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
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

            {/* Supply List */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {/* Critical Items */}
                {groupedSupplies.critical.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Stock Crítico
                    </h3>
                    <div className="space-y-2">
                      {groupedSupplies.critical.map(supply => (
                        <SupplyCard
                          key={supply.id}
                          supply={supply}
                          onUpdateQuantity={(qty) => onUpdateSupply?.(supply.id, qty)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Low Stock Items */}
                {groupedSupplies.low.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Stock Bajo
                    </h3>
                    <div className="space-y-2">
                      {groupedSupplies.low.map(supply => (
                        <SupplyCard
                          key={supply.id}
                          supply={supply}
                          onUpdateQuantity={(qty) => onUpdateSupply?.(supply.id, qty)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Adequate Items */}
                {groupedSupplies.adequate.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Stock Adecuado
                    </h3>
                    <div className="space-y-2">
                      {groupedSupplies.adequate.map(supply => (
                        <SupplyCard
                          key={supply.id}
                          supply={supply}
                          onUpdateQuantity={(qty) => onUpdateSupply?.(supply.id, qty)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Kits Tab */}
          <TabsContent value="kits" className="p-4 space-y-4 mt-0">
            <div className="grid gap-4">
              {kits.map(kit => (
                <Card key={kit.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{kit.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {kit.description}
                            </p>
                          </div>
                          <Badge>{RESOURCE_LEVELS[kit.level].label}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {kit.contents.length} items
                          </span>
                          {kit.weight && (
                            <span>{kit.weight} kg</span>
                          )}
                          {kit.totalCost && (
                            <span>${kit.totalCost.toLocaleString()}</span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowKitDialog(true)}
                          >
                            Ver contenido
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => onUseKit?.(kit.id)}
                          >
                            Usar Kit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="p-4 space-y-4 mt-0">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay solicitudes activas</p>
              </div>
            ) : (
              requests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            Solicitud #{request.id.slice(-4)}
                          </h3>
                          <Badge className={cn(
                            request.status === 'approved' ? 'bg-green-500' :
                            request.status === 'pending' ? 'bg-yellow-500' :
                            request.status === 'fulfilled' ? 'bg-blue-500' :
                            'bg-red-500'
                          )}>
                            {request.status === 'approved' ? 'Aprobada' :
                             request.status === 'pending' ? 'Pendiente' :
                             request.status === 'fulfilled' ? 'Entregada' :
                             'Rechazada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.items.length} artículo(s) · {request.requestedBy}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.timestamp).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Request Dialog - Simplified */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Suministros</DialogTitle>
              <DialogDescription>
                Crear nueva solicitud de recursos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Seleccione los artículos que necesita:
              </p>
              {/* Item selection would go here */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowRequestDialog(false)}>
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  variant?: 'default' | 'destructive' | 'warning'
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, variant = 'default' }) => (
  <Card className={cn(
    variant === 'destructive' && value > 0 && "border-red-200 bg-red-50",
    variant === 'warning' && value > 0 && "border-orange-200 bg-orange-50"
  )}>
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={cn(
            "text-2xl font-bold",
            variant === 'destructive' && value > 0 ? "text-red-600" :
            variant === 'warning' && value > 0 ? "text-orange-600" :
            ""
          )}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'destructive' ? "bg-red-100 text-red-600" :
          variant === 'warning' ? "bg-orange-100 text-orange-600" :
          "bg-gray-100 text-gray-600"
        )}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

interface SupplyCardProps {
  supply: SupplyItem
  onUpdateQuantity?: (quantity: number) => void
}

const SupplyCard: React.FC<SupplyCardProps> = ({ supply, onUpdateQuantity }) => {
  const category = RESOURCE_CATEGORIES[supply.category]
  const percentage = Math.min((supply.quantity / supply.idealQuantity) * 100, 100)

  return (
    <Card className={cn(
      supply.status === 'critical' && "border-red-200",
      supply.status === 'low' && "border-orange-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            category.color.split(' ')[0]
          )}>
            <Package className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{supply.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {category.label} · {supply.location}
                </p>
              </div>
              <Badge className={cn(
                supply.status === 'critical' ? 'bg-red-500' :
                supply.status === 'low' ? 'bg-orange-500' :
                'bg-green-500'
              )}>
                {supply.quantity} {supply.unit}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Stock actual</span>
                <span className="text-muted-foreground">
                  Mín: {supply.minQuantity} · Ideal: {supply.idealQuantity}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-1.5"
              />
            </div>

            {/* Actions */}
            {onUpdateQuantity && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(Math.max(0, supply.quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-mono">
                  {supply.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(supply.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Expiration warning */}
            {supply.expirationDate && (
              <p className="text-xs text-orange-600 mt-2">
                Vence: {new Date(supply.expirationDate).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResourcesList
