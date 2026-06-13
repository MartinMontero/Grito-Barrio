/**
 * FormViewer Component
 * Protocolo CDMX
 *
 * Displays forms in a read-only manner with print optimization
 */

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Printer,
  Download,
  FileText,
  CheckCircle,
  Hash,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { FormData, FormTemplate } from "@/types/forms";

interface FormViewerProps {
  formData: FormData;
  template: FormTemplate;
  onPrint?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

export const FormViewer: React.FC<FormViewerProps> = ({
  formData,
  template,
  onPrint,
  onExportPDF,
  className,
}) => {
  const getStatusBadge = (status: FormData["status"]) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      draft: { variant: "secondary", label: "Borrador" },
      completed: { variant: "default", label: "Completado" },
      signed: { variant: "outline", label: "Firmado" },
      archived: { variant: "destructive", label: "Archivado" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderFieldValue = (fieldId: string, value: any) => {
    if (value === undefined || value === null || value === "") {
      return (
        <span className="text-muted-foreground italic">No especificado</span>
      );
    }

    if (typeof value === "boolean") {
      return value ? (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" /> Sí
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="w-4 h-4" /> No
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">Ninguno</span>;
      }
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium capitalize">{key}:</span>
              <span>
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Check if it's a date
    if (
      fieldId.includes("Date") ||
      fieldId.includes("date") ||
      fieldId.includes("At")
    ) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return format(date, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
            locale: es,
          });
        }
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">{template.title}</h1>
            </div>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimir formulario</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar como PDF/A</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Form Metadata */}
        <Card className="border-2 print:border-black print:shadow-none">
          <CardHeader className="bg-muted/50 print:bg-white print:border-b-2 print:border-black">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription className="mt-1">
                  Versión {template.version} · Actualizado{" "}
                  {format(new Date(template.lastUpdated), "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(formData.status)}
                {formData.hash && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {formData.hash.slice(0, 8)}...
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">{formData.hash}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6 print:p-4">
            {/* Form Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  ID del Formulario:
                </span>
                <p className="font-mono">{formData.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Creado:</span>
                <p>
                  {format(new Date(formData.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Por:</span>
                <p className="font-medium">{formData.createdBy}</p>
              </div>
              {formData.incidentId && (
                <div>
                  <span className="text-muted-foreground">Incidente:</span>
                  <p className="font-mono">{formData.incidentId}</p>
                </div>
              )}
            </div>

            <Separator className="print:border-black" />

            {/* Form Sections */}
            {template.sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="space-y-4 page-break-inside-avoid"
              >
                <h2 className="text-lg font-semibold border-b pb-2 print:border-black">
                  {sectionIndex + 1}. {section.title}
                </h2>
                {section.description && (
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                )}

                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="font-medium text-sm">
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      <div className="p-3 bg-muted/30 rounded-md print:bg-gray-50 print:border print:border-gray-300">
                        {renderFieldValue(field.id, formData.values[field.id])}
                      </div>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">
                          {field.helpText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer */}
            {template.footer && (
              <div className="mt-8 pt-4 border-t print:border-black text-sm text-muted-foreground">
                {template.footer}
              </div>
            )}

            {/* Legal Notice */}
            {template.legalNotice && (
              <div className="mt-4 p-4 bg-muted/50 rounded-md print:bg-gray-100 print:border print:border-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{template.legalNotice}</p>
                </div>
              </div>
            )}

            {/* Signatures */}
            {(formData.signedBy || formData.signedAt) && (
              <div className="mt-8 pt-6 border-t print:border-black">
                <h3 className="font-semibold mb-4">Firmas</h3>
                <div className="grid grid-cols-2 gap-8">
                  {formData.createdBy && (
                    <div className="space-y-2">
                      <div className="h-20 border-b-2 border-black print:border-black" />
                      <p className="font-medium">{formData.createdBy}</p>
                      <p className="text-sm text-muted-foreground">
                        Preparado por
                      </p>
                      <p className="text-xs">
                        {format(
                          new Date(formData.createdAt),
                          "dd/MM/yyyy HH:mm",
                        )}
                      </p>
                    </div>
                  )}
                  {formData.signedBy && (
                    <div className="space-y-2">
                      <div className="h-20 border-b-2 border-black print:border-black" />
                      <p className="font-medium">{formData.signedBy}</p>
                      <p className="text-sm text-muted-foreground">
                        Revisado y firmado
                      </p>
                      <p className="text-xs">
                        {formData.signedAt &&
                          format(
                            new Date(formData.signedAt),
                            "dd/MM/yyyy HH:mm",
                          )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t print:border-black">
                <h3 className="font-semibold mb-2">
                  Adjuntos ({formData.attachments.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {formData.attachments.map((attachment, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <FileText className="w-4 h-4" />
                      {attachment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hash Verification */}
            {formData.hash && (
              <div className="mt-6 pt-4 border-t print:border-black print:hidden">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Integridad verificada:</span>
                  <code className="font-mono bg-muted px-1 rounded">
                    {formData.hash}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print-only footer */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-black">
          <p className="text-xs text-center text-gray-500">
            Protocolo CDMX · Documento generado el{" "}
            {format(new Date(), "dd/MM/yyyy HH:mm")} · Este documento es
            confidencial y está protegido por las leyes de protección de datos.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FormViewer;
