/**
 * Safe Points Map Component
 * Protocolo CDMX
 *
 * Map and list view for safe points with activation
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  MapPin,
  List,
  Filter,
  Search,
  Navigation,
  Phone,
  CheckCircle2,
  Users,
  Clock,
  Home,
  Building,
  Church,
  School,
  Accessibility,
  Wifi,
  Car,
  Droplets,
  Utensils,
  Plus,
  Minus,
  LocateFixed,
  AlertCircle,
  Send,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
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
  ScrollArea,
  Switch,
  TooltipProvider,
  Alert,
  AlertDescription,
  Progress,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SafePoint, ActivationRecord } from "@/types/resources";
import { SAFE_POINT_TYPES, ACCESSIBILITY_LABELS } from "@/types/resources";

// =============================================================================
// TYPES
// =============================================================================

interface SafePointsMapProps {
  safePoints: SafePoint[];
  userLocation?: { lat: number; lng: number };
  onSafePointClick?: (safePoint: SafePoint) => void;
  onActivate?: (
    safePointId: string,
    activation: Omit<ActivationRecord, "id" | "timestamp" | "status">,
  ) => void;
  onGetDirections?: (safePoint: SafePoint) => void;
  className?: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_SAFE_POINTS: SafePoint[] = [
  {
    id: "sp-1",
    name: "Parroquia San Judas Tadeo",
    type: "church",
    address: "Calle Zaragoza 123, Colonia Centro",
    coordinates: { lat: 19.4326, lng: -99.1332 },
    alcaldia: "Cuauhtémoc",
    colonia: "Centro",
    totalCapacity: 50,
    currentOccupancy: 0,
    availableSpots: 50,
    contactName: "Padre Miguel Hernández",
    contactPhone: "55-1234-5678",
    accessAgreement: true,
    accessAgreementDate: "2023-06-15",
    hours: "24 horas",
    requiresAdvanceNotice: false,
    accessibility: ["wheelchair_accessible", "pet_friendly", "family_friendly"],
    amenities: {
      water: true,
      food: true,
      medical: false,
      wash: true,
      wifi: false,
      kitchen: true,
      showers: true,
      parking: true,
    },
    status: "active",
    isActive: true,
    lastUpdated: "2024-01-15T10:00:00Z",
    activationHistory: [],
    notes: "Acceso por entrada lateral. Llave con el sacristán.",
  },
  {
    id: "sp-2",
    name: "Centro Cultural Casa del Pueblo",
    type: "community_center",
    address: "Avenida Revolución 456, Colonia San Ángel",
    coordinates: { lat: 19.3456, lng: -99.189 },
    alcaldia: "Álvaro Obregón",
    colonia: "San Ángel",
    totalCapacity: 100,
    currentOccupancy: 25,
    availableSpots: 75,
    contactName: "María González",
    contactPhone: "55-9876-5432",
    contactEmail: "contacto@casapueblo.org",
    accessAgreement: true,
    accessAgreementDate: "2023-08-20",
    hours: "8:00 - 22:00",
    requiresAdvanceNotice: true,
    advanceNoticeHours: 2,
    accessibility: ["wheelchair_accessible", "gender_separated", "quiet_space"],
    amenities: {
      water: true,
      food: false,
      medical: true,
      wash: true,
      wifi: true,
      kitchen: false,
      showers: true,
      parking: false,
    },
    status: "active",
    isActive: true,
    lastUpdated: "2024-01-15T12:00:00Z",
    activationHistory: [],
  },
  {
    id: "sp-3",
    name: "Escuela Primaria Miguel Hidalgo",
    type: "school",
    address: "Calle Allende 789, Colonia Roma",
    coordinates: { lat: 19.4156, lng: -99.159 },
    alcaldia: "Cuauhtémoc",
    colonia: "Roma Norte",
    totalCapacity: 200,
    currentOccupancy: 0,
    availableSpots: 200,
    contactName: "Director Carlos Ruiz",
    contactPhone: "55-2468-1357",
    accessAgreement: false,
    hours: "Lunes a Viernes 7:00 - 20:00",
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24,
    accessibility: ["wheelchair_accessible", "family_friendly"],
    amenities: {
      water: true,
      food: false,
      medical: false,
      wash: true,
      wifi: false,
      kitchen: false,
      showers: false,
      parking: true,
    },
    status: "pending",
    isActive: false,
    lastUpdated: "2024-01-14T15:00:00Z",
    activationHistory: [],
    notes: "Pendiente de firma de convenio. Contactar a dirección escolar.",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export const SafePointsMap: React.FC<SafePointsMapProps> = ({
  safePoints = MOCK_SAFE_POINTS,
  userLocation,
  onSafePointClick,
  onActivate,
  onGetDirections,
  className,
}) => {
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [selectedSafePoint, setSelectedSafePoint] = useState<SafePoint | null>(
    null,
  );
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    alcaldia: "all",
    type: "all",
    hasCapacity: false,
    accessible: false,
    activeOnly: true,
  });

  // Filter safe points
  const filteredSafePoints = useMemo(() => {
    return safePoints.filter((sp) => {
      // Search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          sp.name.toLowerCase().includes(searchLower) ||
          sp.address.toLowerCase().includes(searchLower) ||
          sp.colonia.toLowerCase().includes(searchLower) ||
          sp.contactName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Alcaldia
      if (filters.alcaldia !== "all" && sp.alcaldia !== filters.alcaldia)
        return false;

      // Type
      if (filters.type !== "all" && sp.type !== filters.type) return false;

      // Capacity
      if (filters.hasCapacity && sp.availableSpots === 0) return false;

      // Accessibility (at least wheelchair accessible)
      if (
        filters.accessible &&
        !sp.accessibility.includes("wheelchair_accessible")
      )
        return false;

      // Active only
      if (filters.activeOnly && !sp.isActive) return false;

      return true;
    });
  }, [safePoints, searchQuery, filters]);

  // Get unique alcaldias
  const alcaldias = useMemo(() => {
    return [...new Set(safePoints.map((sp) => sp.alcaldia))].sort();
  }, [safePoints]);

  const handleSafePointClick = useCallback(
    (safePoint: SafePoint) => {
      setSelectedSafePoint(safePoint);
      onSafePointClick?.(safePoint);
    },
    [onSafePointClick],
  );

  const handleActivate = useCallback(
    (safePointId: string, activationData: any) => {
      onActivate?.(safePointId, activationData);
      setShowActivationDialog(false);
      setSelectedSafePoint(null);
    },
    [onActivate],
  );

  // Calculate distance (simplified)
  const calculateDistance = (sp: SafePoint) => {
    if (!userLocation) return null;
    // Simplified distance calculation
    const latDiff = Math.abs(sp.coordinates.lat - userLocation.lat);
    const lngDiff = Math.abs(sp.coordinates.lng - userLocation.lng);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Puntos Seguros
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredSafePoints.length} ubicaciones disponibles
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Mapa
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar puntos seguros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <Label className="text-xs">Alcaldía</Label>
                <Select
                  value={filters.alcaldia}
                  onValueChange={(v) =>
                    setFilters((prev) => ({ ...prev, alcaldia: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {alcaldias.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={filters.type}
                  onValueChange={(v) =>
                    setFilters((prev) => ({ ...prev, type: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(SAFE_POINT_TYPES).map(
                      ([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.hasCapacity}
                  onCheckedChange={(v) =>
                    setFilters((prev) => ({ ...prev, hasCapacity: v }))
                  }
                  id="capacity"
                />
                <Label htmlFor="capacity" className="text-sm cursor-pointer">
                  Con capacidad
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.accessible}
                  onCheckedChange={(v) =>
                    setFilters((prev) => ({ ...prev, accessible: v }))
                  }
                  id="accessible"
                />
                <Label htmlFor="accessible" className="text-sm cursor-pointer">
                  Accesible
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === "map" ? (
          // Map View (Simplified - would integrate with actual map library)
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Vista de mapa</p>
                <p className="text-sm text-gray-400">
                  Integrar con OpenStreetMap o Mapbox
                </p>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Minus className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <LocateFixed className="w-4 h-4" />
              </Button>
            </div>

            {/* Safe Point Markers (simplified) */}
            {filteredSafePoints.map((sp, index) => (
              <button
                key={sp.id}
                className={cn(
                  "absolute w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2",
                  SAFE_POINT_TYPES[sp.type].color,
                  selectedSafePoint?.id === sp.id &&
                    "ring-4 ring-primary scale-110",
                )}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`,
                }}
                onClick={() => handleSafePointClick(sp)}
              >
                <span className="text-xs font-bold">
                  {sp.availableSpots > 0 ? sp.availableSpots : "!"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // List View
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredSafePoints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron puntos seguros</p>
                </div>
              ) : (
                filteredSafePoints.map((safePoint) => {
                  const distance = calculateDistance(safePoint);
                  const typeInfo = SAFE_POINT_TYPES[safePoint.type];
                  const capacityPercent =
                    (safePoint.currentOccupancy / safePoint.totalCapacity) *
                    100;

                  return (
                    <Card
                      key={safePoint.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedSafePoint?.id === safePoint.id &&
                          "border-primary ring-1 ring-primary",
                        !safePoint.isActive && "opacity-60",
                      )}
                      onClick={() => handleSafePointClick(safePoint)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0",
                              typeInfo.color,
                            )}
                          >
                            {safePoint.type === "church" ? (
                              <Church className="w-6 h-6" />
                            ) : safePoint.type === "school" ? (
                              <School className="w-6 h-6" />
                            ) : safePoint.type === "private" ? (
                              <Home className="w-6 h-6" />
                            ) : (
                              <Building className="w-6 h-6" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  {safePoint.name}
                                  {!safePoint.isActive && (
                                    <Badge variant="secondary">Inactivo</Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {safePoint.address}
                                </p>
                              </div>
                              {distance && (
                                <Badge
                                  variant="outline"
                                  className="flex-shrink-0"
                                >
                                  {distance.toFixed(1)} km
                                </Badge>
                              )}
                            </div>

                            {/* Capacity */}
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Capacidad
                                </span>
                                <span
                                  className={cn(
                                    capacityPercent > 80
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {safePoint.availableSpots} /{" "}
                                  {safePoint.totalCapacity} disponibles
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    capacityPercent > 80
                                      ? "bg-red-500"
                                      : capacityPercent > 50
                                        ? "bg-yellow-500"
                                        : "bg-green-500",
                                  )}
                                  style={{ width: `${capacityPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {safePoint.amenities.water && (
                                <Badge variant="secondary" className="text-xs">
                                  <Droplets className="w-3 h-3 mr-1" />
                                  Agua
                                </Badge>
                              )}
                              {safePoint.amenities.food && (
                                <Badge variant="secondary" className="text-xs">
                                  <Utensils className="w-3 h-3 mr-1" />
                                  Comida
                                </Badge>
                              )}
                              {safePoint.amenities.wifi && (
                                <Badge variant="secondary" className="text-xs">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  WiFi
                                </Badge>
                              )}
                              {safePoint.amenities.parking && (
                                <Badge variant="secondary" className="text-xs">
                                  <Car className="w-3 h-3 mr-1" />
                                  Parking
                                </Badge>
                              )}
                              {safePoint.accessibility.includes(
                                "wheelchair_accessible",
                              ) && (
                                <Badge variant="secondary" className="text-xs">
                                  <Accessibility className="w-3 h-3 mr-1" />
                                  Accesible
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}

        {/* Safe Point Detail Dialog */}
        <SafePointDetailDialog
          safePoint={selectedSafePoint}
          open={!!selectedSafePoint}
          onClose={() => setSelectedSafePoint(null)}
          onActivate={() => setShowActivationDialog(true)}
          onGetDirections={() =>
            selectedSafePoint && onGetDirections?.(selectedSafePoint)
          }
        />

        {/* Activation Dialog */}
        <ActivationDialog
          safePoint={selectedSafePoint}
          open={showActivationDialog}
          onClose={() => setShowActivationDialog(false)}
          onActivate={handleActivate}
        />
      </div>
    </TooltipProvider>
  );
};

// =============================================================================
// SAFE POINT DETAIL DIALOG
// =============================================================================

interface SafePointDetailDialogProps {
  safePoint: SafePoint | null;
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
  onGetDirections: () => void;
}

const SafePointDetailDialog: React.FC<SafePointDetailDialogProps> = ({
  safePoint,
  open,
  onClose,
  onActivate,
  onGetDirections,
}) => {
  if (!safePoint) return null;

  const typeInfo = SAFE_POINT_TYPES[safePoint.type];
  const capacityPercent =
    (safePoint.currentOccupancy / safePoint.totalCapacity) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white",
                typeInfo.color,
              )}
            >
              <Building className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle>{safePoint.name}</DialogTitle>
              <DialogDescription>{typeInfo.label}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                safePoint.isActive ? "bg-green-500" : "bg-gray-500",
              )}
            >
              {safePoint.isActive ? "Activo" : "Inactivo"}
            </Badge>
            {safePoint.accessAgreement && (
              <Badge variant="outline">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Convenio firmado
              </Badge>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p>{safePoint.address}</p>
              <p className="text-sm text-muted-foreground">
                {safePoint.colonia}, {safePoint.alcaldia}
              </p>
            </div>
          </div>

          {/* Capacity */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Capacidad</span>
                <span
                  className={cn(
                    "font-bold",
                    capacityPercent > 80 ? "text-red-600" : "text-green-600",
                  )}
                >
                  {safePoint.availableSpots} disponibles
                </span>
              </div>
              <Progress value={capacityPercent} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {safePoint.currentOccupancy} ocupados de{" "}
                {safePoint.totalCapacity} totales
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="font-semibold">Contacto</h4>
            <p className="font-medium">{safePoint.contactName}</p>
            <Button variant="outline" className="w-full" asChild>
              <a href={`tel:${safePoint.contactPhone}`}>
                <Phone className="w-4 h-4 mr-2" />
                {safePoint.contactPhone}
              </a>
            </Button>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>{safePoint.hours}</span>
            {safePoint.requiresAdvanceNotice && (
              <Badge variant="secondary">
                Aviso: {safePoint.advanceNoticeHours}h
              </Badge>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h4 className="font-semibold mb-2">Servicios</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(safePoint.amenities).map(
                ([key, value]) =>
                  value && (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="capitalize">
                        {key === "wash" ? "WASH" : key}
                      </span>
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Accessibility */}
          {safePoint.accessibility.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Accesibilidad</h4>
              <div className="flex flex-wrap gap-1">
                {safePoint.accessibility.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {ACCESSIBILITY_LABELS[feature]}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {safePoint.notes && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{safePoint.notes}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onGetDirections}
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Cómo llegar
          </Button>
          {safePoint.isActive && (
            <Button onClick={onActivate} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Activar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// ACTIVATION DIALOG
// =============================================================================

interface ActivationDialogProps {
  safePoint: SafePoint | null;
  open: boolean;
  onClose: () => void;
  onActivate: (safePointId: string, data: any) => void;
}

const ActivationDialog: React.FC<ActivationDialogProps> = ({
  safePoint,
  open,
  onClose,
  onActivate,
}) => {
  const [peopleCount, setPeopleCount] = useState("");
  const [eta, setEta] = useState("30");
  const [needs, setNeeds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  if (!safePoint) return null;

  const handleActivate = () => {
    onActivate(safePoint.id, {
      peopleCount: parseInt(peopleCount) || 0,
      eta: `${eta} minutos`,
      needs,
      notes,
    });
  };

  const toggleNeed = (need: string) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activar Punto Seguro</DialogTitle>
          <DialogDescription>
            Notificar a {safePoint.name} sobre llegada de personas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Número de personas</Label>
            <Input
              type="number"
              placeholder="Ej: 15"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tiempo estimado de llegada</Label>
            <Select value={eta} onValueChange={setEta}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1.5 horas</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Necesidades específicas</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Agua",
                "Comida",
                "Atención médica",
                "WASH",
                "Privacidad",
                "Silencio",
              ].map((need) => (
                <Badge
                  key={need}
                  variant={needs.includes(need) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleNeed(need)}
                >
                  {need}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Información adicional para el punto seguro..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Se enviará notificación a {safePoint.contactName} al{" "}
              {safePoint.contactPhone}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleActivate} disabled={!peopleCount}>
            <Send className="w-4 h-4 mr-2" />
            Enviar Activación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Label component
const Label: React.FC<{
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}> = ({ children, className, htmlFor }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium", className)}>
    {children}
  </label>
);

export default SafePointsMap;
