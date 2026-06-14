/**
 * Security Settings Component
 * Grito & Barrio
 *
 * Comprehensive security configuration UI. Self-contained: it reads/writes the
 * real securityManager + vault directly and routes with react-router, so it can
 * be mounted as a standalone screen without any props.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Eye,
  Clock,
  Trash2,
  FileDown,
  History,
  AlertTriangle,
  Check,
  X,
  MapPin,
  Key,
  Download,
  Upload,
  AlertOctagon,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Input,
  Label,
  Slider,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  securityManager,
  type SecurityConfig,
  type SecurityLog,
} from "@/lib/security";
import { changePassphrase } from "@/lib/vault";
import { repersistPersistedState } from "@/lib/store-helpers";
import { isCryptoSupported } from "@/lib/crypto";
import {
  createComprehensiveBackup,
  restoreFromComprehensiveBackup,
} from "@/store";

// =============================================================================
// TYPES
// =============================================================================

interface SecuritySettingsProps {
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  className,
}) => {
  const navigate = useNavigate();

  // State
  const [config, setConfig] = useState<SecurityConfig>(
    securityManager.getConfig(),
  );
  const [hasPassword, setHasPassword] = useState(false);
  const [hasDuress, setHasDuress] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);

  // Dialogs
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDuressSetup, setShowDuressSetup] = useState(false);
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [showConfirmWipeDialog, setShowConfirmWipeDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [duressPassword, setDuressPasswordValue] = useState("");
  const [confirmDuress, setConfirmDuress] = useState("");
  const [exportPass, setExportPass] = useState("");
  const [importPass, setImportPass] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [wipeMinutes, setWipeMinutes] = useState(10);
  const [wipeConfirmText, setWipeConfirmText] = useState("");

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [cryptoSupported, setCryptoSupported] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Load initial state
  const refreshState = useCallback(() => {
    setHasPassword(securityManager.hasPassword());
    setHasDuress(securityManager.hasDuressPassword());
    setLogs(securityManager.getLogs().slice(-50));
    setConfig(securityManager.getConfig());
  }, []);

  useEffect(() => {
    refreshState();
    setCryptoSupported(isCryptoSupported());
  }, [refreshState]);

  // Clear messages after a few seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Update configuration
  const updateSecurityConfig = useCallback(
    (updates: Partial<SecurityConfig>) => {
      securityManager.updateConfig(updates);
      setConfig(securityManager.getConfig());
      setSuccess("Configuración actualizada");
    },
    [],
  );

  // Set up master password (creates vault)
  const handleSetupPassword = async () => {
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    try {
      await securityManager.setRealPassword(password);
      await repersistPersistedState();
      refreshState();
      setShowSetupDialog(false);
      setPassword("");
      setConfirmPassword("");
      setSuccess("Contraseña maestra configurada. Tus datos están protegidos.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al configurar contraseña",
      );
    } finally {
      setBusy(false);
    }
  };

  // Change master password (vault already exists)
  const handleChangePassword = async () => {
    setError("");
    if (password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    try {
      await changePassphrase(currentPassword, password);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Contraseña actualizada");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar contraseña",
      );
    } finally {
      setBusy(false);
    }
  };

  // Set up duress password
  const handleSetupDuress = async () => {
    setError("");
    if (duressPassword.length < 8) {
      setError("La contraseña de emergencia debe tener al menos 8 caracteres");
      return;
    }
    if (duressPassword !== confirmDuress) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    try {
      await securityManager.setDuressPassword(duressPassword);
      refreshState();
      setShowDuressSetup(false);
      setDuressPasswordValue("");
      setConfirmDuress("");
      setSuccess("Contraseña de emergencia configurada");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al configurar contraseña de emergencia",
      );
    } finally {
      setBusy(false);
    }
  };

  // Clear duress password
  const handleClearDuress = () => {
    securityManager.clearDuressPassword();
    refreshState();
    setSuccess("Contraseña de emergencia eliminada");
  };

  // Schedule panic wipe
  const handleScheduleWipe = () => {
    securityManager.scheduleWipe(wipeMinutes);
    setShowWipeDialog(false);
    setSuccess(`Eliminación automática programada en ${wipeMinutes} minutos`);
  };

  const handleCancelScheduledWipe = () => {
    securityManager.cancelWipe();
    setSuccess("Eliminación programada cancelada");
  };

  // Execute immediate wipe
  const handleImmediateWipe = () => {
    void securityManager.executeWipe();
  };

  // Export backup
  const handleExport = async () => {
    setError("");
    setBusy(true);
    try {
      const pass = exportPass.trim() ? exportPass : undefined;
      const blob = await createComprehensiveBackup(pass);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `grito-barrio-respaldo-${date}.${pass ? "enc" : "json"}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
      setExportPass("");
      setSuccess("Copia de seguridad exportada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al exportar datos");
    } finally {
      setBusy(false);
    }
  };

  // Import from backup
  const handleImport = async () => {
    if (!importFile) {
      setError("Selecciona un archivo de respaldo");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const pass = importPass.trim() ? importPass : undefined;
      const ok = await restoreFromComprehensiveBackup(importFile, pass);
      if (!ok) {
        setError("No se pudo restaurar. Verifica el archivo y la contraseña.");
        return;
      }
      setShowImportDialog(false);
      setImportFile(null);
      setImportPass("");
      setSuccess("Datos restaurados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar datos");
    } finally {
      setBusy(false);
    }
  };

  // Logs
  const handleClearLogs = () => {
    securityManager.clearLogs();
    setLogs([]);
    setSuccess("Registros borrados");
  };

  const handleExportLogs = () => {
    const logsJson = securityManager.exportLogs();
    const blob = new Blob([logsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registros-seguridad-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6 pb-20", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Seguridad</h1>
          <p className="text-muted-foreground">
            Configure la protección de sus datos
          </p>
        </div>
      </div>

      {/* Crypto Support Warning */}
      {!cryptoSupported && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Navegador no compatible</AlertTitle>
          <AlertDescription>
            Su navegador no soporta cifrado avanzado. Algunas funciones de
            seguridad no estarán disponibles.
          </AlertDescription>
        </Alert>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <X className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Estado de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Contraseña principal</span>
            <Badge variant={hasPassword ? "default" : "destructive"}>
              {hasPassword ? "Configurada" : "No configurada"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Contraseña de emergencia</span>
            <Badge variant={hasDuress ? "default" : "secondary"}>
              {hasDuress ? "Configurada" : "No configurada"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cifrado</span>
            <Badge variant={hasPassword ? "default" : "secondary"}>
              {hasPassword ? "Activado" : "Desactivado"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="password">Contraseñas</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          {/* Auto-lock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Bloqueo Automático
              </CardTitle>
              <CardDescription>
                Bloquear la aplicación después de inactividad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autolock">Activar bloqueo automático</Label>
                <Switch
                  id="autolock"
                  checked={config.autoLockTimeout > 0}
                  onCheckedChange={(checked) =>
                    updateSecurityConfig({ autoLockTimeout: checked ? 5 : 0 })
                  }
                />
              </div>

              {config.autoLockTimeout > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Tiempo de inactividad</Label>
                    <span className="text-sm text-muted-foreground">
                      {config.autoLockTimeout} minutos
                    </span>
                  </div>
                  <Slider
                    value={[config.autoLockTimeout]}
                    onValueChange={([value]) =>
                      updateSecurityConfig({ autoLockTimeout: value })
                    }
                    min={1}
                    max={60}
                    step={1}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Stripping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Limpieza de Metadatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Eliminar metadatos EXIF</p>
                  <p className="text-sm text-muted-foreground">
                    De fotos y videos antes de guardar
                  </p>
                </div>
                <Switch
                  checked={config.metadataStrippingEnabled}
                  onCheckedChange={(checked) =>
                    updateSecurityConfig({ metadataStrippingEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Fuzzing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Difuminar Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Agregar ruido a coordenadas</p>
                  <p className="text-sm text-muted-foreground">
                    Proteger ubicación exacta
                  </p>
                </div>
                <Switch
                  checked={config.locationFuzzingEnabled}
                  onCheckedChange={(checked) =>
                    updateSecurityConfig({ locationFuzzingEnabled: checked })
                  }
                />
              </div>

              {config.locationFuzzingEnabled && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Radio de difuminación</Label>
                    <span className="text-sm text-muted-foreground">
                      {config.locationFuzzingRadius} metros
                    </span>
                  </div>
                  <Slider
                    value={[config.locationFuzzingRadius]}
                    onValueChange={([value]) =>
                      updateSecurityConfig({ locationFuzzingRadius: value })
                    }
                    min={100}
                    max={2000}
                    step={100}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4">
          {!hasPassword ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Shield className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="font-semibold">Configurar Seguridad</h3>
                  <p className="text-sm text-muted-foreground">
                    Establezca una contraseña maestra para cifrar y proteger sus
                    datos
                  </p>
                  <Button onClick={() => setShowSetupDialog(true)}>
                    Configurar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>
                    Introduce tu contraseña actual y la nueva.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contraseña actual</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Contraseña actual"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nueva contraseña</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita la contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    className="w-full"
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Cambiar Contraseña
                  </Button>
                </CardContent>
              </Card>

              {/* Duress Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5" />
                    Contraseña de Emergencia
                  </CardTitle>
                  <CardDescription>
                    Si se ve obligado a desbloquear, esta contraseña abre una
                    bóveda señuelo aislada y programa el borrado de los datos
                    reales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasDuress ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowDuressSetup(true)}
                    >
                      Configurar Contraseña de Emergencia
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          La contraseña de emergencia está activa
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleClearDuress}
                      >
                        Eliminar Contraseña de Emergencia
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          {/* Panic Wipe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Eliminación de Emergencia
              </CardTitle>
              <CardDescription>
                Elimine todos los datos inmediatamente o programe eliminación
                automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityManager.getWipeState().scheduled && (
                <Alert variant="destructive">
                  <Clock className="w-4 h-4" />
                  <AlertDescription>
                    Eliminación automática programada. Puedes cancelarla.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowWipeDialog(true)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Programar Eliminación
              </Button>
              {securityManager.getWipeState().scheduled && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelScheduledWipe}
                >
                  Cancelar Eliminación Programada
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setWipeConfirmText("");
                  setShowConfirmWipeDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Datos Ahora
              </Button>
            </CardContent>
          </Card>

          {/* Backup & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileDown className="w-5 h-5" />
                Copias de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Datos
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar desde Copia
              </Button>
            </CardContent>
          </Card>

          {/* Failed Attempts Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Protección contra Fuerza Bruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Intentos fallidos permitidos</Label>
                  <span className="text-sm text-muted-foreground">
                    {config.maxFailedAttempts}
                  </span>
                </div>
                <Slider
                  value={[config.maxFailedAttempts]}
                  onValueChange={([value]) =>
                    updateSecurityConfig({ maxFailedAttempts: value })
                  }
                  min={3}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Duración del bloqueo (minutos)</Label>
                <Select
                  value={String(config.lockoutDuration)}
                  onValueChange={(value) =>
                    updateSecurityConfig({ lockoutDuration: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Registro de Seguridad
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportLogs}
                    aria-label="Exportar registros"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLogs}
                    aria-label="Borrar registros"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay registros
                    </p>
                  ) : (
                    logs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-muted text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                log.type === "duress"
                                  ? "destructive"
                                  : log.type === "failed_attempt"
                                    ? "secondary"
                                    : "default"
                              }
                              className="text-xs"
                            >
                              {log.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString("es-MX")}
                            </span>
                          </div>
                          <p className="mt-1">{log.details}</p>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Master Password Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Contraseña Maestra</DialogTitle>
            <DialogDescription>
              Esta contraseña cifra todos tus datos. Si la olvidas no podrás
              recuperarlos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSetupDialog(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleSetupPassword} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup Duress Dialog */}
      <Dialog open={showDuressSetup} onOpenChange={setShowDuressSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Contraseña de Emergencia</DialogTitle>
            <DialogDescription>
              Al ingresarla se abre una bóveda señuelo y se programa el borrado
              de los datos reales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Debe ser distinta de tu contraseña principal.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Contraseña de emergencia</Label>
              <Input
                type="password"
                value={duressPassword}
                onChange={(e) => setDuressPasswordValue(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña de emergencia</Label>
              <Input
                type="password"
                value={confirmDuress}
                onChange={(e) => setConfirmDuress(e.target.value)}
                placeholder="Repita la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDuressSetup(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleSetupDuress} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Wipe Dialog */}
      <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar Eliminación Automática</DialogTitle>
            <DialogDescription>
              Todos los datos se eliminarán automáticamente cuando transcurra el
              tiempo seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Tiempo</Label>
              <span className="text-sm text-muted-foreground">
                {wipeMinutes} minutos
              </span>
            </div>
            <Slider
              value={[wipeMinutes]}
              onValueChange={([value]) => setWipeMinutes(value)}
              min={1}
              max={60}
              step={1}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWipeDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleScheduleWipe}>
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Immediate Wipe Dialog */}
      <Dialog
        open={showConfirmWipeDialog}
        onOpenChange={setShowConfirmWipeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Eliminar Datos Ahora
            </DialogTitle>
            <DialogDescription>
              Esta acción elimina permanentemente TODOS los datos y no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertOctagon className="w-4 h-4" />
              <AlertDescription>
                Escribe <strong>BORRAR</strong> para confirmar.
              </AlertDescription>
            </Alert>
            <Input
              value={wipeConfirmText}
              onChange={(e) => setWipeConfirmText(e.target.value)}
              placeholder="BORRAR"
              aria-label="Confirmar borrado"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmWipeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleImmediateWipe}
              disabled={wipeConfirmText.trim().toUpperCase() !== "BORRAR"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogDescription>
              Opcional: protege el respaldo con una contraseña. Sin contraseña
              el archivo se guarda como texto plano legible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Contraseña del respaldo (opcional)</Label>
              <Input
                type="password"
                value={exportPass}
                onChange={(e) => setExportPass(e.target.value)}
                placeholder="Dejar vacío para texto plano"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar desde Copia</DialogTitle>
            <DialogDescription>
              Selecciona el archivo de respaldo. Si está cifrado, introduce su
              contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Archivo de respaldo</Label>
              <Input
                type="file"
                accept=".json,.enc,.backup,application/json,application/octet-stream"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                aria-label="Archivo de respaldo"
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña del respaldo (si aplica)</Label>
              <Input
                type="password"
                value={importPass}
                onChange={(e) => setImportPass(e.target.value)}
                placeholder="Dejar vacío si no tiene contraseña"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={busy || !importFile}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
