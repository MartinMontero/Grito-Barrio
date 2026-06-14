import React from "react";
import {
  ChevronRight,
  Scale,
  BookOpen,
  Shield,
  FileText,
  Gavel,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import { legalResources } from "@/data/protocols";
import type { LegalResource, LegalCategory } from "@/types";

interface LegalPageProps {
  onResourceSelect: (resource: LegalResource) => void;
}

const categoryIcons: Record<
  LegalCategory,
  React.ComponentType<{ className?: string }>
> = {
  rights: Shield,
  laws: Gavel,
  procedures: FileText,
  defenses: Scale,
  resources: BookOpen,
};

const categoryLabels: Record<LegalCategory, string> = {
  rights: "Tus Derechos",
  laws: "Legislación",
  procedures: "Procedimientos",
  defenses: "Defensas Legales",
  resources: "Recursos",
};

const categoryColors: Record<LegalCategory, string> = {
  rights: "bg-blue-500/10 text-blue-600",
  laws: "bg-purple-500/10 text-purple-600",
  procedures: "bg-orange-500/10 text-orange-600",
  defenses: "bg-green-500/10 text-green-600",
  resources: "bg-pink-500/10 text-pink-600",
};

export function LegalPage({ onResourceSelect }: LegalPageProps) {
  const groupedResources = legalResources.reduce(
    (acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    },
    {} as Record<LegalCategory, LegalResource[]>,
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Información Legal</h1>
        <p className="text-muted-foreground">
          Conoce tus derechos y las leyes que te protegen
        </p>
      </div>

      {/* Important Notice */}
      <div className="px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Scale className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Aviso Importante</h3>
              <p className="text-sm text-amber-700 mt-1">
                La información proporcionada es orientativa y no sustituye el
                asesoramiento legal profesional. Consulta siempre con un abogado
                o defensor especializado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Acceso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(categoryLabels)
            .slice(0, 4)
            .map(([key, label]) => {
              const Icon = categoryIcons[key as LegalCategory];
              const colorClass = categoryColors[key as LegalCategory];
              return (
                <Card
                  key={key}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                        colorClass,
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-sm">{label}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Resources by Category */}
      {Object.entries(groupedResources).map(([category, resources]) => {
        const Icon = categoryIcons[category as LegalCategory];
        return (
          <div key={category} className="px-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Icon className="w-5 h-5 mr-2 text-primary" />
              {categoryLabels[category as LegalCategory]}
            </h2>
            <div className="space-y-2">
              {resources.map((resource) => (
                <Card
                  key={resource.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onResourceSelect(resource)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{resource.title}</h3>
                        {resource.lawReference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {resource.lawReference}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {resource.content.slice(0, 100)}...
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Key Rights Summary */}
      <div className="px-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Derechos Fundamentales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm">Derecho a una vivienda digna</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm">
                  Prohibición de desalojo sin orden judicial
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm">Derecho al debido proceso</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm">
                  Derecho a asesoría legal gratuita
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm">Derecho a contrademanda</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
