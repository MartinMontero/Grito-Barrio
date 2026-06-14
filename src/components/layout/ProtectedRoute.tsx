/**
 * ProtectedRoute Component
 * Protocolo CDMX
 *
 * Route guard that checks for authentication, role requirements,
 * and certification levels before allowing access to protected routes
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle, Shield, Award } from "lucide-react";
import { Button, Alert, AlertTitle, AlertDescription } from "@/components/ui";
import { useProtocoloStore } from "@/store";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredCertification?: number;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredCertification,
  fallback,
}) => {
  const location = useLocation();
  const currentUser = useProtocoloStore((state) => state.currentUser);
  const isLoading = useProtocoloStore(
    (state) => (state as any).loadingStates?.user ?? false,
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6">
          Debes iniciar sesión para acceder a esta sección
        </p>
        <Button onClick={() => (window.location.href = "/login")}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(currentUser.role);

    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="w-5 h-5" />
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              Tu rol actual ({currentUser.role}) no tiene permiso para acceder a
              esta sección. Se requiere uno de los siguientes roles:{" "}
              {requiredRoles.join(", ")}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </div>
      );
    }
  }

  // Check certification requirements
  if (requiredCertification && requiredCertification > 0) {
    const userCertLevel = currentUser.certificationLevel || 0;

    if (userCertLevel < requiredCertification) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <Alert className="max-w-md border-orange-200 bg-orange-50">
            <Award className="w-5 h-5 text-orange-600" />
            <AlertTitle className="text-orange-800">
              Certificación Requerida
            </AlertTitle>
            <AlertDescription className="text-orange-700">
              Esta sección requiere certificación nivel {requiredCertification}.
              Tu nivel actual es {userCertLevel}.
              <br />
              <br />
              Completa los módulos de capacitación necesarios para desbloquear
              esta función.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
            <Button onClick={() => (window.location.href = "/training")}>
              Ir a Capacitación
            </Button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;
