/**
 * FormFiller Component
 * Protocolo CDMX
 *
 * Editable form component with input fields, validation, and auto-save
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Save,
  Send,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Label,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  TooltipProvider,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { FormData, FormTemplate, FormField } from "@/types/forms";
import { useProtocoloStore } from "@/store";

interface FormFillerProps {
  template: FormTemplate;
  initialData?: Partial<FormData>;
  incidentId?: string;
  onSave?: (data: FormData) => void;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  autoSave?: boolean;
  className?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface SignaturePadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  label,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="w-full cursor-crosshair bg-white touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="flex justify-end mt-2">
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            <Trash2 className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
};

export const FormFiller: React.FC<FormFillerProps> = ({
  template,
  initialData,
  incidentId,
  onSave,
  onSubmit,
  onCancel,
  autoSave = true,
  className,
}) => {
  const navigate = useNavigate();
  const currentUser = useProtocoloStore((state) => state.currentUser);

  const [values, setValues] = useState<Record<string, any>>(
    initialData?.values || {},
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    initialData?.updatedAt ? new Date(initialData.updatedAt) : null,
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    template.sections.map((s) => s.id),
  );

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty) return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [values, isDirty, autoSave]);

  const validateField = (field: FormField, value: any): string | null => {
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return "Este campo es requerido";
    }

    if (field.validation) {
      if (field.validation.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return "Formato inválido";
        }
      }

      if (
        field.validation.minLength &&
        value?.length < field.validation.minLength
      ) {
        return `Mínimo ${field.validation.minLength} caracteres`;
      }

      if (
        field.validation.maxLength &&
        value?.length > field.validation.maxLength
      ) {
        return `Máximo ${field.validation.maxLength} caracteres`;
      }

      if (field.validation.min !== undefined && value < field.validation.min) {
        return `Valor mínimo: ${field.validation.min}`;
      }

      if (field.validation.max !== undefined && value > field.validation.max) {
        return `Valor máximo: ${field.validation.max}`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const error = validateField(field, values[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setIsDirty(true);

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSave = (isAutoSave = false) => {
    const formData: FormData = {
      id: initialData?.id || `form-${Date.now()}`,
      templateId: template.id,
      incidentId: incidentId || initialData?.incidentId,
      status: initialData?.status || "draft",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: initialData?.createdBy || currentUser?.pseudonym || "Unknown",
      values,
      attachments: initialData?.attachments || [],
    };

    onSave?.(formData);
    setLastSaved(new Date());
    setIsDirty(false);

    if (!isAutoSave) {
      // Show success toast or feedback
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formData: FormData = {
      id: initialData?.id || `form-${Date.now()}`,
      templateId: template.id,
      incidentId: incidentId || initialData?.incidentId,
      status: "completed",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: initialData?.createdBy || currentUser?.pseudonym || "Unknown",
      values,
      attachments: initialData?.attachments || [],
    };

    onSubmit?.(formData);
    setShowSubmitDialog(false);
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const value = values[field.id];

    const fieldWrapperClass = cn("space-y-2", error && "text-destructive");

    switch (field.type) {
      case "text":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {field.helpText && !error && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={field.id}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {field.helpText && !error && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "datetime":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="datetime-local"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleFieldChange(field.id, parseFloat(e.target.value) || 0)
              }
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div className={fieldWrapperClass}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value || ""}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue
                  placeholder={field.placeholder || "Seleccionar..."}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-start space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {field.helpText && (
                <p className="text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              )}
            </div>
          </div>
        );

      case "radio":
        return (
          <div className={fieldWrapperClass}>
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${option.value}`}
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    className="h-4 w-4 text-primary"
                  />
                  <Label
                    htmlFor={`${field.id}-${option.value}`}
                    className="font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "signature":
        return (
          <SignaturePad
            label={field.label + (field.required ? " *" : "")}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
          />
        );

      case "list":
        return (
          <div className={fieldWrapperClass}>
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {(value || []).map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newList = [...(value || [])];
                      newList[index] = e.target.value;
                      handleFieldChange(field.id, newList);
                    }}
                    placeholder={`Item ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newList = (value || []).filter(
                        (_: any, i: number) => i !== index,
                      );
                      handleFieldChange(field.id, newList);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleFieldChange(field.id, [...(value || []), ""])
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">{template.title}</h1>
            </div>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Guardado: {format(lastSaved, "HH:mm")}
              </span>
            )}
            {isDirty && (
              <Badge variant="secondary" className="text-xs">
                Cambios sin guardar
              </Badge>
            )}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowSubmitDialog(true);
          }}
        >
          <Card>
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Información del Formulario</CardTitle>
                  <CardDescription>
                    Versión {template.version} · Complete todos los campos
                    requeridos
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSave()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Error de validación</AlertTitle>
                  <AlertDescription>
                    Por favor corrija los errores marcados en el formulario
                    antes de continuar.
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Sections */}
              <Accordion
                type="multiple"
                value={expandedSections}
                onValueChange={setExpandedSections}
                className="space-y-4"
              >
                {template.sections.map((section, index) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-2 text-left">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-semibold">{section.title}</span>
                          {section.description && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-6 pl-8">
                        {section.fields.map((field) => (
                          <div key={field.id}>{renderField(field)}</div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Footer */}
              {template.footer && (
                <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
                  {template.footer}
                </div>
              )}

              {/* Legal Notice */}
              {template.legalNotice && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm">
                  {template.legalNotice}
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Envío</DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea finalizar y enviar este formulario?
                Una vez enviado, no podrá realizar cambios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Formulario:</strong> {template.title}
                </p>
                <p>
                  <strong>Campos completados:</strong>{" "}
                  {Object.keys(values).length} de{" "}
                  {template.sections.reduce(
                    (acc, s) => acc + s.fields.length,
                    0,
                  )}
                </p>
                {incidentId && (
                  <p>
                    <strong>Incidente:</strong> {incidentId}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
              >
                Seguir Editando
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Envío
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default FormFiller;
