import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  AlertTriangle,
  Shield,
  FileText,
  Heart,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { protocols } from "@/data/protocols";
import type { Protocol } from "@/types";

interface ProtocolsPageProps {
  onProtocolSelect: (protocol: Protocol) => void;
}

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  prevention: Shield,
  immediate_response: AlertTriangle,
  legal_process: FileText,
  documentation: BookOpen,
  support: Heart,
};

const categoryLabels: Record<string, string> = {
  prevention: "Prevención",
  immediate_response: "Respuesta Inmediata",
  legal_process: "Proceso Legal",
  documentation: "Documentación",
  support: "Apoyo",
};

export function ProtocolsPage({ onProtocolSelect }: ProtocolsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProtocols = protocols.filter((protocol) => {
    const matchesSearch =
      protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? protocol.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const emergencyProtocols = filteredProtocols.filter((p) => p.isEmergency);
  const regularProtocols = filteredProtocols.filter((p) => !p.isEmergency);

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Protocolos</h1>
        <p className="text-muted-foreground">
          Guías paso a paso para diferentes situaciones
        </p>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar protocolos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key];
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="whitespace-nowrap"
              >
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Emergency Protocols */}
      {emergencyProtocols.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
            Emergencia
          </h2>
          <div className="space-y-2">
            {emergencyProtocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                onClick={() => onProtocolSelect(protocol)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Protocols */}
      {regularProtocols.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">
            {emergencyProtocols.length > 0
              ? "Otros Protocolos"
              : "Protocolos Disponibles"}
          </h2>
          <div className="space-y-2">
            {regularProtocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                onClick={() => onProtocolSelect(protocol)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredProtocols.length === 0 && (
        <div className="px-4 text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No se encontraron protocolos</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProtocolCardProps {
  protocol: Protocol;
  onClick: () => void;
}

function ProtocolCard({ protocol, onClick }: ProtocolCardProps) {
  const Icon = categoryIcons[protocol.category] || BookOpen;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-accent/50 transition-colors",
        protocol.isEmergency && "border-destructive/30",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className={cn(
                  "w-4 h-4",
                  protocol.isEmergency ? "text-destructive" : "text-primary",
                )}
              />
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[protocol.category]}
              </Badge>
              {protocol.isEmergency && (
                <Badge variant="destructive" className="text-xs">
                  Emergencia
                </Badge>
              )}
            </div>
            <h3 className="font-semibold">{protocol.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {protocol.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {protocol.steps.length} pasos
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
