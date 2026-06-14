/**
 * EmergencyOverlay Component
 * Protocolo CDMX
 *
 * Floating panic button overlay with expandable emergency options
 * Draggable position, always on top, quick access to emergency actions
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Phone,
  Shield,
  X,
  Navigation,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import {
  Button,
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
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useProtocoloStore } from "@/store";

interface Position {
  x: number;
  y: number;
}

export const EmergencyOverlay: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "alert" | "withdrawal" | null
  >(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get store state
  const isDuressMode = useProtocoloStore((state) => state.isDuressMode);
  const activeIncident = useProtocoloStore((state) =>
    state.getActiveIncident?.(),
  );

  // Check if overlay should be enabled in settings
  const emergencyOverlayEnabled = useProtocoloStore(
    (state) => (state.settings as any)?.emergencyOverlay !== false,
  );

  // Initialize position (bottom right corner)
  useEffect(() => {
    const updatePosition = () => {
      const padding = 20;
      setPosition({
        x: window.innerWidth - 72 - padding,
        y: window.innerHeight - 200 - padding,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 72, clientX - dragStartPos.current.x),
    );
    const newY = Math.max(
      60,
      Math.min(window.innerHeight - 72, clientY - dragStartPos.current.y),
    );

    setPosition({ x: newX, y: newY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(window.innerWidth - 72, e.clientX - dragStartPos.current.x),
        );
        const newY = Math.max(
          60,
          Math.min(window.innerHeight - 72, e.clientY - dragStartPos.current.y),
        );
        setPosition({ x: newX, y: newY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchmove", handleGlobalMouseMove as any);
      window.addEventListener("touchend", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalMouseMove as any);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Handle main button click
  const handleMainClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle emergency actions
  const handleActivateAlert = () => {
    setConfirmAction("alert");
    setShowConfirmDialog(true);
    setIsExpanded(false);
  };

  const handleActivateWithdrawal = () => {
    setConfirmAction("withdrawal");
    setShowConfirmDialog(true);
    setIsExpanded(false);
  };

  const handleEmergencyCall = () => {
    window.location.href = "tel:5555555555";
    setIsExpanded(false);
  };

  const handleToggleDuress = () => {
    navigate("/security/duress");
    setIsExpanded(false);
  };

  const confirmEmergencyAction = () => {
    if (confirmAction === "alert") {
      navigate("/emergency");
    } else if (confirmAction === "withdrawal") {
      // Trigger withdrawal protocol
      navigate("/emergency?withdrawal=true");
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Don't render if disabled or in duress mode
  if (!emergencyOverlayEnabled || isDuressMode || !isVisible) {
    return null;
  }

  return (
    <TooltipProvider>
      <>
        {/* Expanded Menu */}
        {isExpanded && (
          <div
            className="fixed z-[60] flex flex-col gap-2"
            style={{
              left: position.x,
              top: position.y - 280,
              transform: "translateX(-50%)",
              marginLeft: 36,
            }}
          >
            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg self-end bg-background"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Action buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full shadow-lg gap-2 px-4 animate-in slide-in-from-bottom-2"
                  onClick={handleActivateAlert}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Activar Alerta
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Iniciar protocolo de emergencia</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full shadow-lg gap-2 px-4 animate-in slide-in-from-bottom-2"
                  onClick={handleActivateWithdrawal}
                >
                  <Navigation className="w-5 h-5" />
                  Activar Retirada
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Iniciar protocolo de retirada</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full shadow-lg gap-2 px-4 animate-in slide-in-from-bottom-2"
                  onClick={handleEmergencyCall}
                >
                  <Phone className="w-5 h-5" />
                  Llamada de Emergencia
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Llamar a línea de emergencia</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full shadow-lg gap-2 px-4 animate-in slide-in-from-bottom-2"
                  onClick={handleToggleDuress}
                >
                  <Shield className="w-5 h-5" />
                  Modo Dureza
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Activar modo discreto</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Main Panic Button */}
        <button
          ref={buttonRef}
          className={cn(
            "fixed z-[60] w-14 h-14 rounded-full shadow-2xl",
            "flex items-center justify-center",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-destructive/30",
            isExpanded
              ? "bg-destructive text-destructive-foreground scale-110"
              : "bg-destructive text-destructive-foreground hover:scale-105 animate-pulse",
            isDragging && "cursor-grabbing scale-110",
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onClick={handleMainClick}
          aria-label="Botón de emergencia"
        >
          {/* Drag Handle Indicator */}
          <div className="absolute top-1 opacity-50">
            <GripVertical className="w-3 h-3 rotate-90" />
          </div>

          {/* Icon */}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}

          {/* Pulse Effect Ring */}
          {!isExpanded && (
            <span className="absolute inset-0 rounded-full animate-ping bg-destructive/30" />
          )}
        </button>

        {/* Drag Hint */}
        {!isExpanded && (
          <div
            className="fixed z-[55] pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
            style={{
              left: position.x - 60,
              top: position.y + 60,
              width: 180,
            }}
          >
            <p className="text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded shadow text-center">
              Arrastra para mover · Toca para opciones
            </p>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                {confirmAction === "alert"
                  ? "Confirmar Alerta de Emergencia"
                  : "Confirmar Protocolo de Retirada"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "alert"
                  ? "¿Estás seguro de activar el protocolo de emergencia? Esto notificará a tu equipo y coalition."
                  : "¿Estás seguro de activar el protocolo de retirada? Esto iniciará el proceso de evacuación segura."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmEmergencyAction}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                {confirmAction === "alert"
                  ? "Activar Alerta"
                  : "Activar Retirada"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hide Button (small, discreet) */}
        <button
          className="fixed bottom-2 right-2 z-[55] p-1 rounded text-muted-foreground hover:text-foreground opacity-30 hover:opacity-100 transition-opacity"
          onClick={() => setIsVisible(false)}
          title="Ocultar botón de emergencia"
        >
          <X className="w-3 h-3" />
        </button>
      </>
    </TooltipProvider>
  );
};

export default EmergencyOverlay;
