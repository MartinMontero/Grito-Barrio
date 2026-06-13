/**
 * Role Configuration and Types
 * Protocolo CDMX
 *
 * Centralized role definitions, configurations, and utilities
 */

import {
  Shield,
  Users,
  Heart,
  Scale,
  Phone,
  Package,
  AlertTriangle,
  ClipboardList,
  MapPin,
  FileText,
  Camera,
  Radio,
  Building2,
  Truck,
  Stethoscope,
  Share2,
  Bell,
  LogOut,
  Activity,
  UserCheck,
  Hash,
  MessagesSquare,
  Warehouse,
  HeartPulse as FirstAid,
} from "lucide-react";
import type { TeamRole } from "@/types";

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

export type CertificationLevel = 1 | 2 | 3;

export interface RoleDefinition {
  id: TeamRole;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  certificationRequired: CertificationLevel;
  features: string[];
  primaryActions: PrimaryAction[];
  quickAccess: QuickAccessItem[];
  dashboardWidgets: DashboardWidget[];
}

export interface PrimaryAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: string;
  priority: "high" | "medium" | "low";
  certificationRequired: CertificationLevel;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

export interface DashboardWidget {
  id: string;
  type: "stats" | "list" | "actions" | "alerts" | "checklist";
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: WidgetItem[];
}

export interface WidgetItem {
  id: string;
  label: string;
  value?: string | number;
  status?: "active" | "pending" | "completed" | "alert";
  timestamp?: string;
}

// =============================================================================
// ROLE CONFIGURATIONS
// =============================================================================

export const ROLE_DEFINITIONS: Record<TeamRole, RoleDefinition> = {
  leader: {
    id: "leader",
    name: "Líder de Incidente",
    description: "Coordinación general, toma de decisiones, escalamiento",
    icon: Users,
    color: "purple",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-200",
    textColor: "text-purple-600",
    certificationRequired: 3,
    features: [
      "Asignación de roles",
      "Toma de decisiones",
      "Escalamiento a coalición",
      "Supervisión de equipo",
      "Reportes de incidente",
    ],
    primaryActions: [
      {
        id: "assign-roles",
        label: "Asignar Roles",
        icon: UserCheck,
        path: "/team/assign",
        priority: "high",
        certificationRequired: 3,
      },
      {
        id: "activate-withdrawal",
        label: "Activar Retirada",
        icon: LogOut,
        action: "withdrawal",
        priority: "high",
        certificationRequired: 3,
      },
      {
        id: "escalate-coalition",
        label: "Escalar a Coalición",
        icon: Share2,
        action: "escalate",
        priority: "high",
        certificationRequired: 3,
      },
      {
        id: "contact-authorities",
        label: "Contactar Autoridades",
        icon: Building2,
        path: "/contacts/authorities",
        priority: "medium",
        certificationRequired: 2,
      },
    ],
    quickAccess: [
      { id: "team", label: "Equipo", icon: Users, path: "/team", badge: 0 },
      {
        id: "incidents",
        label: "Incidentes",
        icon: AlertTriangle,
        path: "/incidents",
        badge: 0,
      },
      {
        id: "contacts",
        label: "Contactos",
        icon: Phone,
        path: "/contacts",
        badge: 0,
      },
      {
        id: "reports",
        label: "Reportes",
        icon: FileText,
        path: "/reports",
        badge: 0,
      },
    ],
    dashboardWidgets: [
      {
        id: "team-status",
        type: "list",
        title: "Estado del Equipo",
        icon: Users,
      },
      {
        id: "active-incidents",
        type: "list",
        title: "Incidentes Activos",
        icon: AlertTriangle,
      },
      {
        id: "recent-activity",
        type: "list",
        title: "Actividad Reciente",
        icon: Activity,
      },
    ],
  },

  security: {
    id: "security",
    name: "Seguridad/Desescalada",
    description: "Evaluación de seguridad, presencia protectora",
    icon: Shield,
    color: "red",
    bgColor: "bg-red-600",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    certificationRequired: 2,
    features: [
      "Evaluación de amenazas",
      "P.A.S. (Proteger-Avisar-Socorrer)",
      "Desencadenantes de retirada",
      "Técnicas de desescalada",
      "Evaluación de escena",
    ],
    primaryActions: [
      {
        id: "threat-assessment",
        label: "Evaluar Amenazas",
        icon: AlertTriangle,
        path: "/security/threats",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "pas-protocol",
        label: "Protocolo P.A.S.",
        icon: FirstAid,
        path: "/protocols/pas",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "withdrawal-triggers",
        label: "Retirada",
        icon: LogOut,
        action: "withdrawal",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "scene-safety",
        label: "Seguridad de Escena",
        icon: Shield,
        path: "/security/scene",
        priority: "medium",
        certificationRequired: 1,
      },
    ],
    quickAccess: [
      { id: "pas", label: "P.A.S.", icon: FirstAid, path: "/protocols/pas" },
      {
        id: "threats",
        label: "Amenazas",
        icon: AlertTriangle,
        path: "/security/threats",
      },
      {
        id: "withdrawal",
        label: "Retirada",
        icon: LogOut,
        path: "/security/withdrawal",
      },
      {
        id: "deescalation",
        label: "Desescalada",
        icon: MessagesSquare,
        path: "/security/deescalation",
      },
    ],
    dashboardWidgets: [
      {
        id: "threat-checklist",
        type: "checklist",
        title: "Evaluación de Amenazas",
        icon: ClipboardList,
      },
      {
        id: "withdrawal-triggers",
        type: "alerts",
        title: "Desencadenantes de Retirada",
        icon: AlertTriangle,
      },
      {
        id: "scene-safety",
        type: "checklist",
        title: "Seguridad de Escena",
        icon: Shield,
      },
    ],
  },

  medical: {
    id: "medical",
    name: "Médico/Primeros Auxilios",
    description: "Triaje, control de sangrado, manejo de shock",
    icon: Heart,
    color: "rose",
    bgColor: "bg-rose-600",
    borderColor: "border-rose-200",
    textColor: "text-rose-600",
    certificationRequired: 2,
    features: [
      "Protocolo P.A.S.",
      "P.A.P. (Primeros Auxilios Psicológicos)",
      "Registro de lesiones",
      "Contactos de emergencia",
      "Checklist de botiquín",
    ],
    primaryActions: [
      {
        id: "pas-protocol",
        label: "Protocolo P.A.S.",
        icon: FirstAid,
        path: "/protocols/pas",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "pap-protocol",
        label: "P.A.P. Psicológico",
        icon: Heart,
        path: "/protocols/pap",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "injury-log",
        label: "Registro de Lesiones",
        icon: Stethoscope,
        path: "/medical/injuries",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "emergency-contacts",
        label: "Emergencias",
        icon: Phone,
        path: "/contacts/emergency",
        priority: "high",
        certificationRequired: 1,
      },
    ],
    quickAccess: [
      { id: "pas", label: "P.A.S.", icon: FirstAid, path: "/protocols/pas" },
      { id: "pap", label: "P.A.P.", icon: Heart, path: "/protocols/pap" },
      {
        id: "injuries",
        label: "Lesiones",
        icon: Stethoscope,
        path: "/medical/injuries",
      },
      { id: "kit", label: "Botiquín", icon: Package, path: "/medical/kit" },
    ],
    dashboardWidgets: [
      {
        id: "pas-guide",
        type: "actions",
        title: "Guía P.A.S.",
        icon: FirstAid,
      },
      {
        id: "injury-log",
        type: "list",
        title: "Registro de Lesiones",
        icon: Stethoscope,
      },
      {
        id: "medical-kit",
        type: "checklist",
        title: "Checklist Botiquín",
        icon: Package,
      },
    ],
  },

  legal: {
    id: "legal",
    name: "Observador Legal",
    description: "Documentación, cadena de custodia, triaje legal",
    icon: Scale,
    color: "blue",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    certificationRequired: 2,
    features: [
      "Triage legal wizard",
      "Colección de evidencia",
      "Formularios de documentación",
      "Cadena de custodia",
      "Contactos legales",
    ],
    primaryActions: [
      {
        id: "legal-triage",
        label: "Triage Legal",
        icon: Scale,
        path: "/legal/triage",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "evidence",
        label: "Evidencia",
        icon: Camera,
        path: "/evidence/collect",
        priority: "high",
        certificationRequired: 2,
      },
      {
        id: "documentation",
        label: "Documentación",
        icon: FileText,
        path: "/legal/forms",
        priority: "medium",
        certificationRequired: 2,
      },
      {
        id: "custody",
        label: "Cadena de Custodia",
        icon: Hash,
        path: "/legal/custody",
        priority: "medium",
        certificationRequired: 2,
      },
    ],
    quickAccess: [
      { id: "triage", label: "Triage", icon: Scale, path: "/legal/triage" },
      {
        id: "evidence",
        label: "Evidencia",
        icon: Camera,
        path: "/evidence/collect",
      },
      {
        id: "forms",
        label: "Formularios",
        icon: FileText,
        path: "/legal/forms",
      },
      {
        id: "contacts",
        label: "Legales",
        icon: Phone,
        path: "/contacts/legal",
      },
    ],
    dashboardWidgets: [
      {
        id: "legal-triage",
        type: "actions",
        title: "Triage Legal",
        icon: Scale,
      },
      {
        id: "evidence-status",
        type: "stats",
        title: "Evidencia Recolectada",
        icon: Camera,
      },
      {
        id: "custody-log",
        type: "list",
        title: "Cadena de Custodia",
        icon: Hash,
      },
    ],
  },

  dispatch: {
    id: "dispatch",
    name: "Despacho/Comunicaciones",
    description: "Árbol de contactos, activación de recursos",
    icon: Radio,
    color: "orange",
    bgColor: "bg-orange-600",
    borderColor: "border-orange-200",
    textColor: "text-orange-600",
    certificationRequired: 1,
    features: [
      "Árbol de contactos",
      "Ruteo de alertas",
      "Contactos de coalición",
      "Protocolo de medios",
      "Plantillas de mensajes",
    ],
    primaryActions: [
      {
        id: "contact-tree",
        label: "Árbol de Contactos",
        icon: Users,
        path: "/contacts/tree",
        priority: "high",
        certificationRequired: 1,
      },
      {
        id: "alert-routing",
        label: "Ruteo de Alertas",
        icon: Bell,
        path: "/dispatch/alerts",
        priority: "high",
        certificationRequired: 1,
      },
      {
        id: "coalition",
        label: "Coalición",
        icon: Share2,
        path: "/contacts/coalition",
        priority: "medium",
        certificationRequired: 1,
      },
      {
        id: "templates",
        label: "Plantillas",
        icon: FileText,
        path: "/dispatch/templates",
        priority: "low",
        certificationRequired: 1,
      },
    ],
    quickAccess: [
      {
        id: "contacts",
        label: "Contactos",
        icon: Phone,
        path: "/contacts/tree",
      },
      { id: "alerts", label: "Alertas", icon: Bell, path: "/dispatch/alerts" },
      {
        id: "coalition",
        label: "Coalición",
        icon: Share2,
        path: "/contacts/coalition",
      },
      {
        id: "templates",
        label: "Plantillas",
        icon: FileText,
        path: "/dispatch/templates",
      },
    ],
    dashboardWidgets: [
      {
        id: "contact-tree",
        type: "list",
        title: "Árbol de Contactos",
        icon: Users,
      },
      {
        id: "active-alerts",
        type: "alerts",
        title: "Alertas Activas",
        icon: Bell,
      },
      {
        id: "message-templates",
        type: "list",
        title: "Plantillas",
        icon: FileText,
      },
    ],
  },

  logistics: {
    id: "logistics",
    name: "Logística/Albergue",
    description: "Cadena de suministro, operaciones de albergue",
    icon: Package,
    color: "green",
    bgColor: "bg-green-600",
    borderColor: "border-green-200",
    textColor: "text-green-600",
    certificationRequired: 1,
    features: [
      "Checklists de suministros",
      "Directorio de puntos seguros",
      "Guía de albergue",
      "Protocolos WASH",
      "Seguimiento de recursos",
    ],
    primaryActions: [
      {
        id: "supplies",
        label: "Suministros",
        icon: Package,
        path: "/logistics/supplies",
        priority: "high",
        certificationRequired: 1,
      },
      {
        id: "safe-points",
        label: "Puntos Seguros",
        icon: MapPin,
        path: "/logistics/safepoints",
        priority: "high",
        certificationRequired: 1,
      },
      {
        id: "shelter",
        label: "Albergue",
        icon: Warehouse,
        path: "/logistics/shelter",
        priority: "medium",
        certificationRequired: 1,
      },
      {
        id: "transport",
        label: "Transporte",
        icon: Truck,
        path: "/logistics/transport",
        priority: "medium",
        certificationRequired: 1,
      },
    ],
    quickAccess: [
      {
        id: "supplies",
        label: "Suministros",
        icon: Package,
        path: "/logistics/supplies",
      },
      {
        id: "safepoints",
        label: "Puntos Seguros",
        icon: MapPin,
        path: "/logistics/safepoints",
      },
      {
        id: "shelter",
        label: "Albergue",
        icon: Warehouse,
        path: "/logistics/shelter",
      },
      {
        id: "tracking",
        label: "Seguimiento",
        icon: Activity,
        path: "/logistics/tracking",
      },
    ],
    dashboardWidgets: [
      {
        id: "supply-status",
        type: "stats",
        title: "Estado de Suministros",
        icon: Package,
      },
      {
        id: "safe-points",
        type: "list",
        title: "Puntos Seguros",
        icon: MapPin,
      },
      {
        id: "shelter-setup",
        type: "checklist",
        title: "Setup de Albergue",
        icon: Warehouse,
      },
    ],
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getRoleDefinition(role: TeamRole): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

export function getRoleColor(role: TeamRole): string {
  return ROLE_DEFINITIONS[role].color;
}

export function getRoleIcon(
  role: TeamRole,
): React.ComponentType<{ className?: string }> {
  return ROLE_DEFINITIONS[role].icon;
}

export function getRoleName(role: TeamRole): string {
  return ROLE_DEFINITIONS[role].name;
}

export function checkCertificationLevel(
  userLevel: CertificationLevel,
  requiredLevel: CertificationLevel,
): boolean {
  return userLevel >= requiredLevel;
}

export function filterActionsByCertification(
  actions: PrimaryAction[],
  userLevel: CertificationLevel,
): PrimaryAction[] {
  return actions.filter((action) => action.certificationRequired <= userLevel);
}

export const AVAILABLE_ROLES: TeamRole[] = [
  "leader",
  "security",
  "medical",
  "legal",
  "dispatch",
  "logistics",
];

export const ROLE_CERTIFICATION_LABELS: Record<CertificationLevel, string> = {
  1: "Básico",
  2: "Intermedio",
  3: "Avanzado",
};
