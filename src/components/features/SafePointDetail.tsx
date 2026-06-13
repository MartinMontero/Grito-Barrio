/**
 * Safe Point Detail Component
 * Protocolo CDMX
 *
 * Individual safe point detailed view with history and management
 */

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Edit2,
  Navigation,
  Share2,
  AlertTriangle,
  Building,
  Accessibility,
  Wifi,
  Car,
  Droplets,
  Utensils,
  Heart,
  Bath,
  UtensilsCrossed as CookingPot,
  User,
  FileText,
  Plus,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Input,
  TooltipProvider,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type {
  SafePoint,
  SafePointHistoryEntry,
  ActivationRecord,
} from "@/types/resources";
import { SAFE_POINT_TYPES, ACCESSIBILITY_LABELS } from "@/types/resources";

// =============================================================================
// TYPES
// =============================================================================

interface SafePointDetailProps {
  safePoint: SafePoint;
  onEdit?: (safePoint: SafePoint) => void;
  onActivate?: (
    safePointId: string,
    activation: Partial<ActivationRecord>,
  ) => void;
  onAddHistory?: (
    safePointId: string,
    entry: Omit<SafePointHistoryEntry, "id" | "timestamp">,
  ) => void;
  onGetDirections?: (safePoint: SafePoint) => void;
  canEdit?: boolean;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SafePointDetail: React.FC<SafePointDetailProps> = ({
  safePoint,
  onEdit,
  onActivate,
  onAddHistory,
  onGetDirections,
  canEdit = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("info");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Draft occupancy used by the editable capacity controls (canEdit only).
  const [draftOccupancy, setDraftOccupancy] = useState(
    safePoint.currentOccupancy,
  );

  const flash = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3000);
  };

  // Share the safe point via the Web Share API, falling back to the clipboard.
  const handleShare = async () => {
    const text = `${safePoint.name} - ${safePoint.address}, ${safePoint.colonia}, ${safePoint.alcaldia}. Tel: ${safePoint.contactPhone}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: safePoint.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        flash("Información copiada al portapapeles");
      }
    } catch {
      /* user cancelled share — no action needed */
    }
  };

  // Trigger a quick activation request for this safe point.
  const handleActivate = () => {
    onActivate?.(safePoint.id, {
      peopleCount: 0,
      eta: "30 minutos",
      needs: [],
      status: "pending",
    });
    flash(`Solicitud de activación enviada a ${safePoint.contactName}`);
  };

  // Append a history note (records the activation/visit in the log).
  const handleAddHistory = () => {
    onAddHistory?.(safePoint.id, {
      type: "note",
      description: "Nota registrada por el operador",
      userName: "Operador",
    });
    flash("Nota agregada al historial");
  };

  const typeInfo = SAFE_POINT_TYPES[safePoint.type];
  const capacityPercent =
    (safePoint.currentOccupancy / safePoint.totalCapacity) * 100;
  const isNearFull = capacityPercent > 80;
  const isFull = safePoint.availableSpots === 0;

  const adjustDraftOccupancy = (delta: number) => {
    setDraftOccupancy((prev) =>
      Math.max(0, Math.min(safePoint.totalCapacity, prev + delta)),
    );
  };

  const handleSaveCapacity = () => {
    onEdit?.({
      ...safePoint,
      currentOccupancy: draftOccupancy,
      availableSpots: Math.max(0, safePoint.totalCapacity - draftOccupancy),
      lastUpdated: new Date().toISOString(),
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0",
                typeInfo.color,
              )}
            >
              <Building className="w-8 h-8" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{safePoint.name}</h1>
                  <p className="text-muted-foreground">{typeInfo.label}</p>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(safePoint)}
                  >
                    <Edit2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
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
                {isFull && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Lleno
                  </Badge>
                )}
                {isNearFull && !isFull && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Casi lleno
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Capacity Alert */}
          {isNearFull && (
            <Alert
              className={cn(
                "mt-4",
                isFull
                  ? "bg-red-50 border-red-200"
                  : "bg-orange-50 border-orange-200",
              )}
            >
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  isFull ? "text-red-600" : "text-orange-600",
                )}
              />
              <AlertTitle
                className={isFull ? "text-red-800" : "text-orange-800"}
              >
                {isFull
                  ? "Punto seguro al máximo de capacidad"
                  : "Capacidad limitada disponible"}
              </AlertTitle>
              <AlertDescription
                className={isFull ? "text-red-700" : "text-orange-700"}
              >
                {isFull
                  ? "Este punto seguro ha alcanzado su capacidad máxima. Considere alternativas."
                  : `Solo quedan ${safePoint.availableSpots} espacios disponibles.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mx-4 grid grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="capacity">Capacidad</TabsTrigger>
            <TabsTrigger value="amenities">Servicios</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Info Tab */}
            <TabsContent value="info" className="p-4 space-y-4 mt-0">
              {/* Location */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{safePoint.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {safePoint.colonia}, {safePoint.alcaldia}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onGetDirections?.(safePoint)}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Cómo llegar
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{safePoint.contactName}</p>
                    <p className="text-sm text-muted-foreground">Responsable</p>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${safePoint.contactPhone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {safePoint.contactPhone}
                    </a>
                  </Button>

                  {safePoint.contactEmail && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${safePoint.contactEmail}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        {safePoint.contactEmail}
                      </a>
                    </Button>
                  )}

                  {safePoint.alternativeContact && (
                    <p className="text-sm text-muted-foreground">
                      Contacto alternativo: {safePoint.alternativeContact}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Hours */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{safePoint.hours}</p>
                  {safePoint.requiresAdvanceNotice && (
                    <Alert className="mt-3 bg-amber-50 border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Se requiere aviso previo de{" "}
                        {safePoint.advanceNoticeHours} horas
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Access Agreement */}
              {safePoint.accessAgreement && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Convenio de Acceso Firmado
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Fecha:{" "}
                          {safePoint.accessAgreementDate &&
                            formatDate(safePoint.accessAgreementDate)}
                        </p>
                        {safePoint.accessNotes && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {safePoint.accessNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {safePoint.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{safePoint.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Capacity Tab */}
            <TabsContent value="capacity" className="p-4 space-y-4 mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2">
                      {safePoint.availableSpots}
                    </div>
                    <p className="text-muted-foreground">
                      espacios disponibles
                    </p>
                    <p className="text-sm text-muted-foreground">
                      de {safePoint.totalCapacity} totales
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ocupación actual</span>
                      <span
                        className={cn(
                          "font-medium",
                          isNearFull ? "text-red-600" : "text-green-600",
                        )}
                      >
                        {Math.round(capacityPercent)}%
                      </span>
                    </div>
                    <Progress value={capacityPercent} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{safePoint.currentOccupancy} ocupados</span>
                      <span>{safePoint.totalCapacity} capacidad total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Historial de Ocupación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {safePoint.activationHistory
                      .slice(-5)
                      .reverse()
                      .map((activation) => (
                        <div
                          key={activation.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {activation.peopleCount} personas
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(activation.timestamp)}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              activation.status === "confirmed"
                                ? "bg-green-500"
                                : activation.status === "pending"
                                  ? "bg-yellow-500"
                                  : activation.status === "completed"
                                    ? "bg-blue-500"
                                    : "bg-red-500",
                            )}
                          >
                            {activation.status === "confirmed"
                              ? "Confirmado"
                              : activation.status === "pending"
                                ? "Pendiente"
                                : activation.status === "completed"
                                  ? "Completado"
                                  : "Rechazado"}
                          </Badge>
                        </div>
                      ))}

                    {safePoint.activationHistory.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Sin activaciones registradas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Update Capacity (if editable) */}
              {canEdit && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Actualizar Ocupación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustDraftOccupancy(-5)}
                      >
                        -5
                      </Button>
                      <Input
                        type="number"
                        value={draftOccupancy}
                        onChange={(e) =>
                          setDraftOccupancy(
                            Math.max(
                              0,
                              Math.min(
                                safePoint.totalCapacity,
                                parseInt(e.target.value) || 0,
                              ),
                            ),
                          )
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustDraftOccupancy(5)}
                      >
                        +5
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSaveCapacity}
                      disabled={draftOccupancy === safePoint.currentOccupancy}
                    >
                      Actualizar Capacidad
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Servicios Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(safePoint.amenities).map(([key, value]) => {
                      const icons: Record<string, React.ReactNode> = {
                        water: <Droplets className="w-5 h-5" />,
                        food: <Utensils className="w-5 h-5" />,
                        medical: <Heart className="w-5 h-5" />,
                        wash: <Bath className="w-5 h-5" />,
                        wifi: <Wifi className="w-5 h-5" />,
                        kitchen: <CookingPot className="w-5 h-5" />,
                        showers: <Bath className="w-5 h-5" />,
                        parking: <Car className="w-5 h-5" />,
                      };

                      const labels: Record<string, string> = {
                        water: "Agua",
                        food: "Comida",
                        medical: "Atención médica",
                        wash: "WASH",
                        wifi: "WiFi",
                        kitchen: "Cocina",
                        showers: "Regaderas",
                        parking: "Estacionamiento",
                      };

                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            value
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                              : "bg-gray-50 border-gray-200 dark:bg-gray-800 opacity-50",
                          )}
                        >
                          <div
                            className={cn(
                              value ? "text-green-600" : "text-gray-400",
                            )}
                          >
                            {icons[key]}
                          </div>
                          <span
                            className={cn(
                              "font-medium",
                              value
                                ? "text-green-900 dark:text-green-100"
                                : "text-gray-500",
                            )}
                          >
                            {labels[key]}
                          </span>
                          {value && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Accessibility className="w-5 h-5" />
                    Accesibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {safePoint.accessibility.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="text-sm py-1 px-3"
                      >
                        {ACCESSIBILITY_LABELS[feature]}
                      </Badge>
                    ))}

                    {safePoint.accessibility.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No hay información de accesibilidad disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-4 space-y-4 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Historial de Actividad</h3>
                {canEdit && (
                  <Button size="sm" onClick={handleAddHistory}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar nota
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {safePoint.history
                  ?.slice()
                  .reverse()
                  .map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              entry.type === "activation"
                                ? "bg-blue-100 text-blue-600"
                                : entry.type === "inspection"
                                  ? "bg-green-100 text-green-600"
                                  : entry.type === "visit"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600",
                            )}
                          >
                            <History className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {entry.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1">{entry.description}</p>
                            {entry.userName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Por: {entry.userName}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {(!safePoint.history || safePoint.history.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sin historial registrado</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onGetDirections?.(safePoint)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Direcciones
            </Button>
            {safePoint.isActive && !isFull && (
              <Button className="flex-1" onClick={handleActivate}>
                Activar Punto
              </Button>
            )}
          </div>
          {statusMessage && (
            <p className="mt-3 text-sm text-center text-green-600">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SafePointDetail;
