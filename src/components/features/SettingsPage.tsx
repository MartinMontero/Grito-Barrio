import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Moon,
  Shield,
  Database,
  ChevronRight,
  LogOut,
  Info,
  Smartphone,
  Lock,
  KeyRound,
  Download,
  Upload,
  Trash2,
  AlertOctagon,
  Check,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Switch,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useProtocoloStore } from "@/store";
import {
  createComprehensiveBackup,
  restoreFromComprehensiveBackup,
} from "@/store";
import type { AppSettings } from "@/store";
import { securityManager } from "@/lib/security";
import {
  getVaultState,
  changePassphrase,
  lock,
  type VaultState,
} from "@/lib/vault";
import { repersistPersistedState } from "@/lib/store-helpers";

interface SettingsPageProps {
  /** Optional legacy navigation callback. When absent, react-router is used. */
  onNavigate?: (page: string) => void;
}

const THEME_LABELS: Record<AppSettings["theme"], string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Automático (sistema)",
};

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const navigate = useNavigate();

  const settings = useProtocoloStore((state) => state.settings);
  const currentUser = useProtocoloStore((state) => state.currentUser);
  const isAuthenticated = useProtocoloStore((state) => state.isAuthenticated);
  const toggleNotifications = useProtocoloStore(
    (state) => state.toggleNotifications,
  );
  const toggleBiometric = useProtocoloStore((state) => state.toggleBiometric);
  const toggleAutoSync = useProtocoloStore((state) => state.toggleAutoSync);
  const setTheme = useProtocoloStore((state) => state.setTheme);
  const logout = useProtocoloStore((state) => state.logout);

  // Vault / encryption state
  const [vaultState, setVaultState] = useState<VaultState>(() =>
    getVaultState(),
  );

  // Protect (create master password) dialog
  const [showProtectDialog, setShowProtectDialog] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Change password dialog
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [changeNewPass, setChangeNewPass] = useState("");
  const [changeConfirmPass, setChangeConfirmPass] = useState("");

  // Export / import dialogs
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportPass, setExportPass] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPass, setImportPass] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wipe confirmation
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const refreshVaultState = () => setVaultState(getVaultState());

  const goTo = (path: string, legacyPage: string) => {
    if (onNavigate) onNavigate(legacyPage);
    else navigate(path);
  };

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate("home");
    else navigate("/");
  };

  // ---------------------------------------------------------------------------
  // Protect with master password (creates the vault)
  // ---------------------------------------------------------------------------
  const handleProtect = async () => {
    setError("");
    if (newPass.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await securityManager.setRealPassword(newPass);
      await repersistPersistedState();
      refreshVaultState();
      setShowProtectDialog(false);
      setNewPass("");
      setConfirmPass("");
      setSuccess("Tus datos ahora están protegidos con contraseña.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo activar la protección.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Change master password
  // ---------------------------------------------------------------------------
  const handleChangePassword = async () => {
    setError("");
    if (changeNewPass.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (changeNewPass !== changeConfirmPass) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await changePassphrase(currentPass, changeNewPass);
      setShowChangeDialog(false);
      setCurrentPass("");
      setChangeNewPass("");
      setChangeConfirmPass("");
      setSuccess("Contraseña maestra actualizada.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Lock now
  // ---------------------------------------------------------------------------
  const handleLockNow = () => {
    lock();
    window.location.reload();
  };

  // ---------------------------------------------------------------------------
  // Export data
  // ---------------------------------------------------------------------------
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
      setSuccess("Respaldo exportado.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo exportar el respaldo.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Import data
  // ---------------------------------------------------------------------------
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImportFile(file);
    if (file) {
      setShowImportDialog(true);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setError("");
    setBusy(true);
    try {
      const pass = importPass.trim() ? importPass : undefined;
      const ok = await restoreFromComprehensiveBackup(importFile, pass);
      if (!ok) {
        setError(
          "No se pudo restaurar el respaldo. Verifica el archivo y la contraseña.",
        );
        return;
      }
      setShowImportDialog(false);
      setImportFile(null);
      setImportPass("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Datos restaurados correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo importar el respaldo.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Wipe all data
  // ---------------------------------------------------------------------------
  const handleWipe = () => {
    // executeWipe reloads the app; no further UI needed.
    void securityManager.executeWipe();
  };

  const isProtected = vaultState !== "uninitialized";

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura la aplicación según tus necesidades
        </p>
      </div>

      {/* Feedback messages */}
      {(success || error) && (
        <div className="px-4">
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
              <AlertOctagon className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Profile Card */}
      <div className="px-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {currentUser ? currentUser.pseudonym : "Configurar Perfil"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentUser
                    ? `Nivel ${currentUser.certificationLevel} • ${currentUser.role}`
                    : "Añade tu información personal"}
                </p>
                {isAuthenticated && (
                  <Badge variant="secondary" className="mt-1">
                    Autenticado
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protección / Encriptación */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">
          Protección / Encriptación
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Lock
                className={`w-5 h-5 mt-0.5 ${isProtected ? "text-green-600" : "text-amber-600"}`}
              />
              <div className="flex-1">
                {isProtected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Protegido con contraseña</p>
                      <Badge variant="default">Protegido</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tus datos sensibles se guardan cifrados en este
                      dispositivo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Sin protección</p>
                    <p className="text-sm text-muted-foreground">
                      Tus datos se guardan sin cifrar. Establece una contraseña
                      maestra para protegerlos.
                    </p>
                  </>
                )}
              </div>
            </div>

            {isProtected ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowChangeDialog(true)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Cambiar contraseña
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleLockNow}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Bloquear ahora
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setShowProtectDialog(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Proteger con contraseña
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appearance */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Apariencia</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    {THEME_LABELS[settings.theme]}
                  </p>
                </div>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setTheme(value as AppSettings["theme"])
                }
              >
                <SelectTrigger className="w-40" aria-label="Seleccionar tema">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Notificaciones</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Notificaciones</p>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Seguridad</h2>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Bloqueo Biométrico</p>
                  <p className="text-sm text-muted-foreground">
                    Usar huella o face ID
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.biometricEnabled}
                onCheckedChange={toggleBiometric}
              />
            </div>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b"
              onClick={() => goTo("/security", "security")}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Centro de Seguridad</p>
                  <p className="text-sm text-muted-foreground">
                    Contraseñas, bloqueo automático, registros
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              onClick={() => goTo("/security/duress", "security/duress")}
            >
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Modo de Emergencia</p>
                  <p className="text-sm text-muted-foreground">
                    Configuración del modo de coerción
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Datos</h2>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Sincronización Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar cuando haya conexión
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={toggleAutoSync}
              />
            </div>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b"
              onClick={() => setShowExportDialog(true)}
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-primary" />
                <p className="font-medium">Exportar Datos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-primary" />
                <p className="font-medium">Importar Datos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.enc,.backup,application/json,application/octet-stream"
              className="hidden"
              onChange={handleImportFileChange}
            />
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-destructive"
              onClick={() => {
                setWipeConfirmText("");
                setShowWipeDialog(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5" />
                <p className="font-medium">Borrar todos los datos</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      {isAuthenticated && (
        <div className="px-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      {/* About */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold mb-3">Acerca de</h2>
        <Card>
          <CardContent className="p-0">
            <div className="w-full flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-primary" />
                <p className="font-medium">Versión de la App</p>
              </div>
              <span className="text-sm text-muted-foreground">v1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protect dialog (create master password) */}
      <Dialog open={showProtectDialog} onOpenChange={setShowProtectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proteger con contraseña</DialogTitle>
            <DialogDescription>
              Esta contraseña maestra cifra tus datos en este dispositivo. Si la
              olvidas no podrás recuperar la información.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="protect-pass">Contraseña maestra</Label>
              <Input
                id="protect-pass"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protect-confirm">Confirmar contraseña</Label>
              <Input
                id="protect-confirm"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProtectDialog(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleProtect} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Proteger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña maestra</DialogTitle>
            <DialogDescription>
              Introduce tu contraseña actual y la nueva contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="change-current">Contraseña actual</Label>
              <Input
                id="change-current"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-new">Nueva contraseña</Label>
              <Input
                id="change-new"
                type="password"
                value={changeNewPass}
                onChange={(e) => setChangeNewPass(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-confirm">Confirmar nueva contraseña</Label>
              <Input
                id="change-confirm"
                type="password"
                value={changeConfirmPass}
                onChange={(e) => setChangeConfirmPass(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangeDialog(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar datos</DialogTitle>
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
              <Label htmlFor="export-pass">
                Contraseña del respaldo (opcional)
              </Label>
              <Input
                id="export-pass"
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

      {/* Import dialog */}
      <Dialog
        open={showImportDialog}
        onOpenChange={(open) => {
          setShowImportDialog(open);
          if (!open) {
            setImportFile(null);
            setImportPass("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar datos</DialogTitle>
            <DialogDescription>
              {importFile
                ? `Archivo: ${importFile.name}. Si el respaldo está cifrado, introduce su contraseña.`
                : "Selecciona un archivo de respaldo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="import-pass">
                Contraseña del respaldo (si aplica)
              </Label>
              <Input
                id="import-pass"
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

      {/* Wipe confirmation dialog */}
      <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Borrar todos los datos
            </DialogTitle>
            <DialogDescription>
              Esta acción elimina de forma permanente TODOS los datos de este
              dispositivo: incidentes, documentación, contactos y la bóveda
              cifrada. No se puede deshacer.
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
            <Button variant="outline" onClick={() => setShowWipeDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleWipe}
              disabled={wipeConfirmText.trim().toUpperCase() !== "BORRAR"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsPage;
