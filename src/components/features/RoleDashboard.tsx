/**
 * Role Dashboard Component
 * Protocolo CDMX
 *
 * Role-specific home screen with widgets and quick actions
 */

import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Heart,
  Phone,
  Package,
  MapPin,
  Camera,
  Bell,
  HeartPulse as FirstAid,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TeamRole, Incident } from "@/types";
import {
  getRoleDefinition,
  filterActionsByCertification,
  type CertificationLevel,
} from "@/lib/roles";

// =============================================================================
// TYPES
// =============================================================================

interface RoleDashboardProps {
  role: TeamRole;
  userCertificationLevel: CertificationLevel;
  userPseudonym: string;
  activeIncident?: Incident | null;
  teamMembers?: { pseudonym: string; role: TeamRole; status: string }[];
  recentActivity?: ActivityItem[];
  onActionClick?: (actionId: string) => void;
  onQuickAccessClick?: (itemId: string) => void;
}

interface ActivityItem {
  id: string;
  type: "incident" | "action" | "alert" | "update";
  description: string;
  timestamp: string;
  actor?: string;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
}> = ({ title, value, icon, trend, trendValue, color }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs mt-1",
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600",
              )}
            >
              {trend === "up" && <TrendingUp className="w-3 h-3" />}
              {trend === "down" && <TrendingDown className="w-3 h-3" />}
              {trend === "neutral" && <Minus className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-2 rounded-lg",
            color.replace("bg-", "bg-opacity-10"),
          )}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityItemCard: React.FC<{ item: ActivityItem; roleColor: string }> = ({
  item,
  roleColor,
}) => {
  const icons = {
    incident: <AlertTriangle className="w-4 h-4" />,
    action: <CheckCircle2 className="w-4 h-4" />,
    alert: <Bell className="w-4 h-4" />,
    update: <Activity className="w-4 h-4" />,
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          roleColor.replace("600", "100"),
          roleColor.replace("bg-", "text-"),
        )}
      >
        {icons[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          {item.description}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          {new Date(item.timestamp).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {item.actor && (
            <>
              <span>•</span>
              <span>{item.actor}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TeamMemberCard: React.FC<{
  member: { pseudonym: string; role: TeamRole; status: string };
  roleColor: string;
}> = ({ member, roleColor }) => {
  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    en_route: "bg-yellow-500",
    on_scene: "bg-blue-500",
    standby: "bg-gray-500",
    off_duty: "bg-gray-300",
  };

  const statusLabels: Record<string, string> = {
    active: "Activo",
    en_route: "En camino",
    on_scene: "En escena",
    standby: "En espera",
    off_duty: "Fuera de servicio",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
            roleColor,
          )}
        >
          {member.pseudonym.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {member.pseudonym}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {member.role}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            statusColors[member.status] || "bg-gray-400",
          )}
        />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {statusLabels[member.status] || member.status}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  role,
  userCertificationLevel,
  userPseudonym,
  activeIncident,
  teamMembers = [],
  recentActivity = [],
  onActionClick,
  onQuickAccessClick,
}) => {
  const definition = getRoleDefinition(role);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Filter actions by certification
  const availableActions = useMemo(
    () =>
      filterActionsByCertification(
        definition.primaryActions,
        userCertificationLevel,
      ),
    [definition.primaryActions, userCertificationLevel],
  );

  // Get high priority actions
  const highPriorityActions = availableActions.filter(
    (a) => a.priority === "high",
  );
  const otherActions = availableActions.filter((a) => a.priority !== "high");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b",
          definition.bgColor.replace("bg-", "bg-opacity-95"),
          "backdrop-blur supports-[backdrop-filter]:bg-opacity-80",
          "border-gray-200 dark:border-gray-800",
        )}
      >
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-white/20 backdrop-blur",
                )}
              >
                <definition.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">
                  {definition.name}
                </h1>
                <p className="text-white/80 text-sm">{userPseudonym}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              Nivel {userCertificationLevel}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Active Incident Alert */}
        {activeIncident ? (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-red-900 dark:text-red-200">
                      Incidente Activo
                    </h3>
                    <Badge variant="destructive">
                      {activeIncident.threatLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    {activeIncident.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-red-700 dark:text-red-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activeIncident.location.colonia}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activeIncident.timestamp).toLocaleTimeString(
                        "es-MX",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-200">
                    Sin Incidentes Activos
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    No hay incidentes que requieran atención actualmente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Acciones Principales
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {highPriorityActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onActionClick?.(action.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    "hover:shadow-lg active:scale-95",
                    definition.borderColor,
                    "bg-white dark:bg-gray-900",
                    "hover:" +
                      definition.bgColor.replace("bg-", "bg-opacity-5"),
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                      definition.bgColor.replace("600", "100"),
                    )}
                  >
                    <ActionIcon
                      className={cn("w-5 h-5", definition.textColor)}
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.label}
                  </p>
                  {action.priority === "high" && (
                    <Badge
                      variant="destructive"
                      className="mt-2 text-[10px] px-1.5 py-0"
                    >
                      Prioritario
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {otherActions.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {otherActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onActionClick?.(action.id)}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ActionIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {action.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Role-Specific Content */}
        {role === "leader" && (
          <>
            {/* Team Status */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estado del Equipo
                </h2>
                <Badge variant="secondary">{teamMembers.length} miembros</Badge>
              </div>

              <div className="space-y-2">
                {teamMembers.slice(0, 3).map((member, i) => (
                  <TeamMemberCard
                    key={i}
                    member={member}
                    roleColor={definition.bgColor}
                  />
                ))}
                {teamMembers.length > 3 && (
                  <button className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Ver {teamMembers.length - 3} más...
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {role === "security" && (
          <>
            {/* Threat Assessment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Evaluación de Amenazas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {[
                    "Armas de fuego presentes",
                    "Grupos armados",
                    "Amenazas directas",
                    "Violencia en progreso",
                  ].map((threat, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {threat}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {role === "medical" && (
          <>
            {/* P.A.S. Quick Access */}
            <Card className={cn(definition.borderColor)}>
              <CardHeader
                className={cn(definition.bgColor.replace("600", "50"))}
              >
                <CardTitle className="text-base flex items-center gap-2">
                  <FirstAid className={cn("w-5 h-5", definition.textColor)} />
                  Protocolo P.A.S.
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Proteger</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Phone className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Avisar</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Socorrer</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline">
                  Abrir Guía Completa
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {role === "legal" && (
          <>
            {/* Evidence Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Evidencia"
                value="12"
                icon={<Camera className="w-5 h-5 text-blue-600" />}
                trend="up"
                trendValue="+3 hoy"
                color="bg-blue-600"
              />
              <StatCard
                title="Custodia"
                value="100%"
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                color="bg-green-600"
              />
            </div>
          </>
        )}

        {role === "dispatch" && (
          <>
            {/* Contact Tree Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  Contactos Prioritarios
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { name: "CDHCM", phone: "55-5029-9300", priority: 1 },
                  { name: "C5", phone: "55-5533-5533", priority: 1 },
                  { name: "Cruz Roja", phone: "55-5557-5757", priority: 2 },
                ].map((contact, i) => (
                  <a
                    key={i}
                    href={`tel:${contact.phone.replace(/-/g, "")}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <Badge
                      variant={
                        contact.priority === 1 ? "destructive" : "secondary"
                      }
                    >
                      P{contact.priority}
                    </Badge>
                  </a>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {role === "logistics" && (
          <>
            {/* Supply Status */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Suministros"
                value="85%"
                icon={<Package className="w-5 h-5 text-green-600" />}
                color="bg-green-600"
              />
              <StatCard
                title="Puntos Seguros"
                value="3"
                icon={<MapPin className="w-5 h-5 text-blue-600" />}
                color="bg-blue-600"
              />
            </div>
          </>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Actividad Reciente
              </h2>
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showAllActivity ? "Ver menos" : "Ver todo"}
              </button>
            </div>

            <Card>
              <CardContent className="p-2">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(showAllActivity
                    ? recentActivity
                    : recentActivity.slice(0, 3)
                  ).map((item) => (
                    <ActivityItemCard
                      key={item.id}
                      item={item}
                      roleColor={definition.bgColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {definition.quickAccess.slice(0, 4).map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onQuickAccessClick?.(item.id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      definition.bgColor.replace("600", "100"),
                    )}
                  >
                    <ItemIcon className={cn("w-5 h-5", definition.textColor)} />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 text-center">
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleDashboard;
