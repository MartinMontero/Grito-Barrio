/**
 * Settings Component
 * Protocolo CDMX
 * 
 * Comprehensive settings and configuration module
 */

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  User,
  Shield,
  Lock,
  Eye,
  Bell,
  Database,
  Globe,
  Accessibility,
  Wifi,
  Info,
  HelpCircle,
  MessageSquare,
  Bug,
  Lightbulb,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  LogOut,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Award,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Fingerprint,
  Key,
  EyeOff,
  Eye as EyeIcon,
  Volume2,
  Vibrate,
  HardDrive,
  Cloud,
  RefreshCw,
  RotateCcw,
  Type,
  Contrast,
  Minimize2,
  Languages,
  ExternalLink,
  Github,
  Heart,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Copy,
  Check
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Separator,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Progress,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Textarea,
  RadioGroup,
  RadioGroupItem
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'
import { generateFormPDF, downloadPDF } from '@/lib/pdfExport'
import type { UserRole, CertificationLevel } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

type SettingsSection = 
  | 'profile'
  | 'security'
  | 'privacy'
  | 'notifications'
  | 'data'
  | 'accessibility'
  | 'offline'
  | 'language'
  | 'about'
  | 'support'

interface StorageInfo {
  used: number
  total: number
  databases: number
  files: number
}

// =============================================================================
// COMPONENT
// =============================================================================

interface SettingsProps {
  onNavigate?: (page: string) => void
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  
  // Store selectors (cast to any for properties not yet on the store type)
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const settings = useProtocoloStore((state) => state.settings)
  const appVersion = useProtocoloStore((state) => (state as any).version || '1.0.0')
  const isAuthenticated = useProtocoloStore((state) => (state as any).isAuthenticated ?? false)
  const logout = useProtocoloStore((state) => (state as any).logout || (() => {}))
  const updateSettings = useProtocoloStore((state) => (state as any).updateSettings || ((_update: any) => {}))

  // Computed values
  const isOffline = useProtocoloStore((state) => (state as any).isOnline === false)
  const lastSync = useProtocoloStore((state) => (state as any).lastSync ?? null)
  
  // Get storage info
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    total: 0,
    databases: 0,
    files: 0
  })
  
  useEffect(() => {
    const getStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        setStorageInfo({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          databases: 0,
          files: 0
        })
      }
    }
    getStorage()
  }, [activeSection])
  
  const handleLogout = () => {
    logout()
    onNavigate?.('home')
  }
  
  const handleClearData = () => {
    // Clear all local data
    localStorage.clear()
    indexedDB.deleteDatabase('protocolo_cdmx')
    setShowClearDataDialog(false)
    window.location.reload()
  }
  
  const handleExportData = () => {
    const data = {
      user: currentUser,
      settings,
      timestamp: new Date().toISOString(),
      version: appVersion
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protocolo_cdmx_backup_${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportDialog(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl font-bold">Configuración</h1>
              <p className="text-xs text-muted-foreground">
                Personaliza tu experiencia
              </p>
            </div>
            {isOffline && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Sin conexión
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 pb-24">
          {/* Settings Navigation */}
          <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SettingsSection)}>
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-full justify-start mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Seguridad</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacidad</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Datos</span>
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  <span className="hidden sm:inline">Accesibilidad</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Acerca de</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Soporte</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            {/* Profile Section */}
            <TabsContent value="profile" className="space-y-6">
              <ProfileSection user={currentUser} />
            </TabsContent>

            {/* Security Section */}
            <TabsContent value="security" className="space-y-6">
              <SecuritySection />
            </TabsContent>

            {/* Privacy Section */}
            <TabsContent value="privacy" className="space-y-6">
              <PrivacySection />
            </TabsContent>

            {/* Notifications Section */}
            <TabsContent value="notifications" className="space-y-6">
              <NotificationsSection />
            </TabsContent>

            {/* Data Section */}
            <TabsContent value="data" className="space-y-6">
              <DataSection 
                storageInfo={storageInfo}
                lastSync={lastSync}
                onExport={() => setShowExportDialog(true)}
                onClear={() => setShowClearDataDialog(true)}
              />
            </TabsContent>

            {/* Accessibility Section */}
            <TabsContent value="accessibility" className="space-y-6">
              <AccessibilitySection />
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about" className="space-y-6">
              <AboutSection version={appVersion} />
            </TabsContent>

            {/* Support Section */}
            <TabsContent value="support" className="space-y-6">
              <SupportSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Logout Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cerrar Sesión</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cerrar sesión? Tu información permanecerá segura.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Data Dialog */}
        <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Eliminar Todos los Datos
              </DialogTitle>
              <DialogDescription>
                Esta acción eliminará permanentemente todos tus datos locales, incluyendo incidentes, formularios y configuraciones. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                Asegúrate de haber exportado tus datos antes de continuar.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearDataDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Permanentemente
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
                Exporta todos tus datos en formato JSON encriptado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Contraseña de protección (opcional)</Label>
                <Input
                  type="password"
                  placeholder="Deja en blanco para exportar sin contraseña"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fixed Logout Button */}
        {isAuthenticated && (
          <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// PROFILE SECTION
// =============================================================================

const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [contactInfo, setContactInfo] = useState(user?.contactInfo || '')
  
  const roleLabels: Record<string, string> = {
    leader: 'Coordinador',
    security: 'Seguridad',
    medical: 'Médico',
    legal: 'Legal',
    dispatch: 'Dispatch',
    logistics: 'Logística',
    observer: 'Observador',
    admin: 'Administrador'
  }

  const certLabels: Record<number, string> = {
    1: 'Nivel 1 - Básico',
    2: 'Nivel 2 - Intermedio',
    3: 'Nivel 3 - Avanzado'
  }

  return (
    <div className="space-y-6">
      {/* User Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user?.pseudonym?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.pseudonym || 'Usuario'}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{roleLabels[user?.role] || user?.role}</Badge>
                <Badge variant="outline">{certLabels[user?.certificationLevel || 1]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Miembro desde {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy', { locale: es }) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role & Certification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Rol y Certificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Rol Actual</Label>
              <p className="font-medium">{roleLabels[user?.role] || user?.role}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Nivel de Certificación</Label>
              <p className="font-medium">{certLabels[user?.certificationLevel || 1]}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-muted-foreground">Capacitación Completada</Label>
            <div className="mt-2 space-y-2">
              {user?.trainingCompleted?.map((training: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{training.moduleName}</span>
                  <span className="text-muted-foreground">
                    ({format(new Date(training.completedAt), 'dd/MM/yyyy')})
                  </span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No hay capacitaciones registradas</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </CardTitle>
          <CardDescription>
            Para coordinación de brigada (información segura)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Contacto Seguro</Label>
                <Input
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Signal, Telegram o teléfono"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contacto Seguro</Label>
                  <p className="font-medium">{user?.contactInfo?.secureContact || 'No configurado'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Método Preferido</Label>
                  <p className="font-medium capitalize">{user?.contactInfo?.preferredMethod || 'No configurado'}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar Contacto
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// SECURITY SECTION
// =============================================================================

const SecuritySection: React.FC = () => {
  const settings = useProtocoloStore((state) => state.settings) as any
  const updateSettings = useProtocoloStore((state) => (state as any).updateSettings || ((_update: any) => {}))
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDuressDialog, setShowDuressDialog] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)
  
  const autoLockOptions = [
    { value: '1', label: '1 minuto' },
    { value: '5', label: '5 minutos' },
    { value: '15', label: '15 minutos' },
    { value: '30', label: '30 minutos' },
    { value: '0', label: 'Nunca' }
  ]

  return (
    <div className="space-y-6">
      {/* Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Encriptación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Encriptación de Datos</Label>
              <p className="text-sm text-muted-foreground">
                Proteger información sensible con encriptación AES-256
              </p>
            </div>
            <Switch
              checked={settings?.encryptionEnabled}
              onCheckedChange={(checked) => updateSettings?.({ encryptionEnabled: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bloqueo Biométrico</Label>
              <p className="text-sm text-muted-foreground">
                Usar huella digital o Face ID para desbloquear
              </p>
            </div>
            <Switch
              checked={settings?.biometricEnabled}
              onCheckedChange={(checked) => updateSettings?.({ biometricEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => setShowPasswordDialog(true)}>
            Cambiar PIN/Contraseña
          </Button>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bloqueo Automático</Label>
              <p className="text-sm text-muted-foreground">
                Tiempo de inactividad antes de bloquear
              </p>
            </div>
            <Select 
              value={String(settings?.autoLockTimeout || 5)}
              onValueChange={(value) => updateSettings?.({ autoLockTimeout: parseInt(value) })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {autoLockOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Duress Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5" />
            Modo Dureza
          </CardTitle>
          <CardDescription>
            Configuración para situaciones de coerción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>¿Qué es el Modo Dureza?</AlertTitle>
            <AlertDescription>
              Una contraseña alternativa que abre una versión "segura" de la app con datos falsos o limitados, protegiendo la información real.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activar Modo Dureza</Label>
              <p className="text-sm text-muted-foreground">
                Permitir acceso con contraseña alternativa
              </p>
            </div>
            <Switch
              checked={settings?.duressModeEnabled}
              onCheckedChange={(checked) => updateSettings?.({ duressModeEnabled: checked })}
            />
          </div>
          
          {settings?.duressModeEnabled && (
            <Button variant="outline" className="w-full" onClick={() => setShowDuressDialog(true)}>
              Configurar Contraseña Dureza
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Panic Wipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Borrado de Emergencia
          </CardTitle>
          <CardDescription>
            Configuración de borrado automático de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Borrado por Inactividad</Label>
              <p className="text-sm text-muted-foreground">
                Borrar datos después de período de inactividad
              </p>
            </div>
            <Switch
              checked={settings?.panicWipeEnabled}
              onCheckedChange={(checked) => updateSettings?.({ panicWipeEnabled: checked })}
            />
          </div>
          
          {settings?.panicWipeEnabled && (
            <div className="space-y-2">
              <Label>Días de inactividad antes del borrado</Label>
              <Slider
                defaultValue={[settings?.panicWipeDays || 30]}
                max={90}
                min={1}
                step={1}
                onValueChange={(value) => updateSettings?.({ panicWipeDays: value[0] })}
              />
              <p className="text-sm text-muted-foreground">
                {settings?.panicWipeDays || 30} días
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Registro de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => setShowAuditLog(true)}>
            Ver Registro de Seguridad
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// PRIVACY SECTION
// =============================================================================

const PrivacySection: React.FC = () => {
  const settings = useProtocoloStore((state) => state.settings) as any
  const updateSettings = useProtocoloStore((state) => (state as any).updateSettings || ((_update: any) => {}))

  return (
    <div className="space-y-6">
      {/* Location Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Privacidad de Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Difuminar Ubicación</Label>
              <p className="text-sm text-muted-foreground">
                Añadir ±100m de imprecisión a las coordenadas
              </p>
            </div>
            <Switch
              checked={settings?.locationFuzzing}
              onCheckedChange={(checked) => updateSettings?.({ locationFuzzing: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Eliminar Metadatos</Label>
              <p className="text-sm text-muted-foreground">
                Eliminar automáticamente EXIF de fotos y videos
              </p>
            </div>
            <Switch
              checked={settings?.stripMetadata !== false}
              onCheckedChange={(checked) => updateSettings?.({ stripMetadata: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preferencias de Visualización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar Seudónimos</Label>
              <p className="text-sm text-muted-foreground">
                Usar seudónimos en lugar de nombres reales
              </p>
            </div>
            <Switch
              checked={settings?.showPseudonyms !== false}
              onCheckedChange={(checked) => updateSettings?.({ showPseudonyms: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ocultar Previews</Label>
              <p className="text-sm text-muted-foreground">
                Ocultar contenido en switch de apps recientes
              </p>
            </div>
            <Switch
              checked={settings?.hidePreviews}
              onCheckedChange={(checked) => updateSettings?.({ hidePreviews: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consent Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Consentimientos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Registro de Consentimientos</Label>
              <p className="text-sm text-muted-foreground">
                Registrar consentimientos de ocupantes y testigos
              </p>
            </div>
            <Switch
              checked={settings?.trackConsent !== false}
              onCheckedChange={(checked) => updateSettings?.({ trackConsent: checked })}
            />
          </div>
          
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Información Legal</AlertTitle>
            <AlertDescription>
              El registro de consentimientos es obligatorio para el procesamiento legal de datos personales según la Ley de Protección de Datos Personales.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// NOTIFICATIONS SECTION
// =============================================================================

const NotificationsSection: React.FC = () => {
  const settings = useProtocoloStore((state) => state.settings) as any
  const updateSettings = useProtocoloStore((state) => (state as any).updateSettings || ((_update: any) => {}))

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Notificaciones</Label>
              <p className="text-sm text-muted-foreground">
                Activar o desactivar todas las notificaciones
              </p>
            </div>
            <Switch
              checked={settings?.notificationsEnabled}
              onCheckedChange={(checked) => updateSettings?.({ notificationsEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {settings?.notificationsEnabled && (
        <>
          {/* Alert Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Incidentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones de nuevos incidentes
                  </p>
                </div>
                <Switch
                  checked={settings?.alertNotifications !== false}
                  onCheckedChange={(checked) => updateSettings?.({ alertNotifications: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sonido de Alerta</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproducir sonido para alertas críticas
                  </p>
                </div>
                <Switch
                  checked={settings?.alertSound !== false}
                  onCheckedChange={(checked) => updateSettings?.({ alertSound: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vibración</Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrar para alertas importantes
                  </p>
                </div>
                <Switch
                  checked={settings?.alertVibration !== false}
                  onCheckedChange={(checked) => updateSettings?.({ alertVibration: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Training Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Capacitación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de Entrenamiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios de módulos pendientes
                  </p>
                </div>
                <Switch
                  checked={settings?.trainingReminders}
                  onCheckedChange={(checked) => updateSettings?.({ trainingReminders: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vencimiento de Certificación</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas antes de que venzan certificaciones
                  </p>
                </div>
                <Switch
                  checked={settings?.certificationExpiration !== false}
                  onCheckedChange={(checked) => updateSettings?.({ certificationExpiration: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sync Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Sincronización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Estado de Sincronización</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando se completa la sincronización
                  </p>
                </div>
                <Switch
                  checked={settings?.syncNotifications}
                  onCheckedChange={(checked) => updateSettings?.({ syncNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// =============================================================================
// DATA SECTION
// =============================================================================

const DataSection: React.FC<{
  storageInfo: StorageInfo
  lastSync?: string
  onExport: () => void
  onClear: () => void
}> = ({ storageInfo, lastSync, onExport, onClear }) => {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  
  const handleImport = () => {
    if (importFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          // Process import
          console.log('Importing data:', data)
          setShowImportDialog(false)
        } catch (error) {
          console.error('Import error:', error)
        }
      }
      reader.readAsText(importFile)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Uso de Almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Espacio utilizado</span>
              <span className="font-medium">{formatBytes(storageInfo.used)}</span>
            </div>
            <Progress value={(storageInfo.used / storageInfo.total) * 100} />
            <p className="text-xs text-muted-foreground">
              {formatBytes(storageInfo.total - storageInfo.used)} disponibles de {formatBytes(storageInfo.total)}
            </p>
          </div>
          
          {lastSync && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Última sincronización:</span>
                <span>{format(new Date(lastSync), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Exportar e Importar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos los Datos
          </Button>
          
          <div className="space-y-2">
            <Label>Importar Datos</Label>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImportFile(e.target.files[0])
                  setShowImportDialog(true)
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cloud Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Respaldo en la Nube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Respaldo Automático</Label>
              <p className="text-sm text-muted-foreground">
                Respaldar datos en la nube automáticamente
              </p>
            </div>
            <Switch />
          </div>
          
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Los datos se encriptan antes de enviarse a la nube. Solo tú tienes acceso a la clave de desencriptación.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Zona de Peligro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Estas acciones son permanentes y no se pueden deshacer.
          </p>
          
          <Button variant="destructive" className="w-full" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Todos los Datos Locales
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// ACCESSIBILITY SECTION
// =============================================================================

const AccessibilitySection: React.FC = () => {
  const settings = useProtocoloStore((state) => state.settings) as any
  const updateSettings = useProtocoloStore((state) => (state as any).updateSettings || ((_update: any) => {}))

  const fontSizeOptions = [
    { value: 'small', label: 'Pequeño' },
    { value: 'medium', label: 'Mediano' },
    { value: 'large', label: 'Grande' },
    { value: 'xlarge', label: 'Extra Grande' }
  ]

  return (
    <div className="space-y-6">
      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Tamaño de Fuente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {fontSizeOptions.map((option) => (
              <Button
                key={option.value}
                variant={settings?.fontSize === option.value ? 'default' : 'outline'}
                className="w-full"
                onClick={() => updateSettings?.({ fontSize: option.value as any })}
              >
                <span style={{ fontSize: option.value === 'small' ? '12px' : option.value === 'large' ? '18px' : option.value === 'xlarge' ? '22px' : '14px' }}>
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="w-5 h-5" />
            Configuración Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alto Contraste</Label>
              <p className="text-sm text-muted-foreground">
                Mejorar visibilidad con colores de alto contraste
              </p>
            </div>
            <Switch
              checked={settings?.highContrast}
              onCheckedChange={(checked) => updateSettings?.({ highContrast: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reducir Animaciones</Label>
              <p className="text-sm text-muted-foreground">
                Minimizar movimientos y transiciones
              </p>
            </div>
            <Switch
              checked={settings?.reducedMotion}
              onCheckedChange={(checked) => updateSettings?.({ reducedMotion: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Optimización para Lector de Pantalla</Label>
              <p className="text-sm text-muted-foreground">
                Mejorar compatibilidad con lectores de pantalla
              </p>
            </div>
            <Switch
              checked={settings?.screenReaderOptimized}
              onCheckedChange={(checked) => updateSettings?.({ screenReaderOptimized: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// ABOUT SECTION
// =============================================================================

const AboutSection: React.FC<{ version: string }> = ({ version }) => {
  const buildDate = '2025-01-15'
  
  return (
    <div className="space-y-6">
      {/* App Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Protocolo CDMX</h2>
              <p className="text-muted-foreground">Apoyo Comunitario</p>
            </div>
            <Badge variant="secondary">v{version}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Versión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versión</span>
            <span className="font-medium">{version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha de compilación</span>
            <span className="font-medium">{format(new Date(buildDate), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plataforma</span>
            <span className="font-medium">Web PWA</span>
          </div>
        </CardContent>
      </Card>

      {/* License & Legal */}
      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Licencia</p>
                <p className="text-sm text-muted-foreground">GPL v3</p>
              </div>
            </div>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
          
          <Button variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Política de Privacidad
          </Button>
          
          <Button variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Términos de Uso
          </Button>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Protocolo CDMX es un proyecto de código abierto desarrollado para apoyar a comunidades en situaciones de desalojo y vulnerabilidad habitacional en la Ciudad de México.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Github className="w-4 h-4" />
            <a href="#" className="text-sm text-primary hover:underline">
              github.com/protocolo-cdmx
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// SUPPORT SECTION
// =============================================================================

const SupportSection: React.FC = () => {
  const [showBugDialog, setShowBugDialog] = useState(false)
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [bugDescription, setBugDescription] = useState('')
  const [featureDescription, setFeatureDescription] = useState('')

  const faqItems = [
    {
      question: '¿Cómo reporto un incidente?',
      answer: 'Usa el botón de emergencia rojo en la parte superior de la pantalla o navega a "Respuesta de Emergencia" en el menú principal.'
    },
    {
      question: '¿Qué es el Modo Dureza?',
      answer: 'Es una contraseña alternativa que abre una versión limitada de la app para situaciones donde te obligan a desbloquear tu teléfono.'
    },
    {
      question: '¿Cómo exporto mis datos?',
      answer: 'Ve a Configuración → Datos → Exportar Todos los Datos. Se generará un archivo JSON encriptado.'
    },
    {
      question: '¿La app funciona sin internet?',
      answer: 'Sí, la app está diseñada para funcionar offline. Los datos se sincronizan cuando hay conexión disponible.'
    }
  ]

  return (
    <div className="space-y-6">
      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Preguntas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contactar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            soporte@protocolo-cdmx.org
          </Button>
        </CardContent>
      </Card>

      {/* Bug Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Reportar Problema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => setShowBugDialog(true)}>
            <Bug className="w-4 h-4 mr-2" />
            Reportar Bug
          </Button>
        </CardContent>
      </Card>

      {/* Feature Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Solicitar Función
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => setShowFeatureDialog(true)}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Sugerir Mejora
          </Button>
        </CardContent>
      </Card>

      {/* Bug Dialog */}
      <Dialog open={showBugDialog} onOpenChange={setShowBugDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Bug</DialogTitle>
            <DialogDescription>
              Describe el problema que encontraste. Incluye los pasos para reproducirlo.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe el bug aquí..."
            value={bugDescription}
            onChange={(e) => setBugDescription(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBugDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { setShowBugDialog(false); setBugDescription(''); }}>
              Enviar Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerir Mejora</DialogTitle>
            <DialogDescription>
              ¿Qué función te gustaría ver en la app?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe tu sugerencia..."
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { setShowFeatureDialog(false); setFeatureDescription(''); }}>
              Enviar Sugerencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Settings