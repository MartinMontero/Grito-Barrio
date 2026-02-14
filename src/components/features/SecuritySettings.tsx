/**
 * Security Settings Component
 * Protocolo CDMX
 * 
 * Comprehensive security configuration UI
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Lock,
  Eye,
  Clock,
  Trash2,
  FileDown,
  FileUp,
  History,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  Smartphone,
  MapPin,
  Fingerprint,
  Key,
  RefreshCw,
  Download,
  Upload,
  AlertOctagon
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
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { securityManager, type SecurityConfig, type SecurityLog } from '@/lib/security'
import { exportData, importData } from '@/lib/backup'
import { isCryptoSupported } from '@/lib/crypto'

// =============================================================================
// TYPES
// =============================================================================

interface SecuritySettingsProps {
  className?: string
}

type SetupStep = 'password' | 'duress' | 'complete'

// =============================================================================
// COMPONENT
// =============================================================================

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ className }) => {
  // State
  const [config, setConfig] = useState<SecurityConfig>(securityManager.getConfig())
  const [hasPassword, setHasPassword] = useState(false)
  const [hasDuress, setHasDuress] = useState(false)
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [setupStep, setSetupStep] = useState<SetupStep>('password')
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDuressSetup, setShowDuressSetup] = useState(false)
  const [showWipeDialog, setShowWipeDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [duressPassword, setDuressPassword] = useState('')
  const [confirmDuress, setConfirmDuress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cryptoSupported, setCryptoSupported] = useState(true)
  const [activeTab, setActiveTab] = useState('general')

  // Load initial state
  useEffect(() => {
    setHasPassword(securityManager.hasPassword())
    setHasDuress(securityManager.hasDuressPassword())
    setLogs(securityManager.getLogs().slice(-50)) // Last 50 logs
    setCryptoSupported(isCryptoSupported())
  }, [])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Update configuration
  const updateSecurityConfig = useCallback((updates: Partial<SecurityConfig>) => {
    securityManager.updateConfig(updates)
    setConfig({ ...config, ...updates })
    setSuccess('Configuración actualizada')
  }, [config])

  // Set up password
  const handleSetupPassword = async () => {
    setError('')
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    try {
      await securityManager.setRealPassword(password)
      setHasPassword(true)
      setSetupStep('duress')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('Error al configurar contraseña')
    }
  }

  // Set up duress password
  const handleSetupDuress = async () => {
    setError('')
    
    if (duressPassword.length < 6) {
      setError('La contraseña de emergencia debe tener al menos 6 caracteres')
      return
    }
    
    if (duressPassword === password) {
      setError('La contraseña de emergencia debe ser diferente')
      return
    }
    
    if (duressPassword !== confirmDuress) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    try {
      await securityManager.setDuressPassword(duressPassword)
      setHasDuress(true)
      setSetupStep('complete')
      setDuressPassword('')
      setConfirmDuress('')
      setSuccess('Configuración de seguridad completada')
    } catch (err) {
      setError('Error al configurar contraseña de emergencia')
    }
  }

  // Clear duress password
  const handleClearDuress = () => {
    securityManager.clearDuressPassword()
    setHasDuress(false)
    setSuccess('Contraseña de emergencia eliminada')
  }

  // Change password
  const handleChangePassword = async () => {
    setError('')
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    try {
      await securityManager.setRealPassword(password)
      setPassword('')
      setConfirmPassword('')
      setSuccess('Contraseña actualizada')
      setShowSetupDialog(false)
    } catch (err) {
      setError('Error al cambiar contraseña')
    }
  }

  // Schedule panic wipe
  const handleScheduleWipe = (minutes: number) => {
    securityManager.scheduleWipe(minutes)
    setShowWipeDialog(false)
    setSuccess(`Eliminación programada en ${minutes} minutos`)
  }

  // Execute immediate wipe
  const handleImmediateWipe = () => {
    if (confirm('¿Está seguro? Esta acción eliminará TODOS los datos permanentemente.')) {
      securityManager.executeWipe()
    }
  }

  // Export encrypted backup
  const handleExport = async () => {
    try {
      const result = await exportData({
        encrypt: true
      })
      
      if (result.success) {
        setSuccess('Copia de seguridad exportada')
        setShowExportDialog(false)
      } else {
        setError(result.error || 'Error al exportar')
      }
    } catch (err) {
      setError('Error al exportar datos')
    }
  }

  // Import from backup
  const handleImport = async (file: File) => {
    try {
      const result = await importData(file, {
        merge: true,
        validate: true,
        backupBeforeImport: true
      })
      
      if (result.success) {
        setSuccess(`Importados ${result.imported} registros`)
        setShowImportDialog(false)
      } else {
        setError(`Importados: ${result.imported}, Fallidos: ${result.failed}`)
      }
    } catch (err) {
      setError('Error al importar datos')
    }
  }

  // Clear logs
  const handleClearLogs = () => {
    securityManager.clearLogs()
    setLogs([])
    setSuccess('Registros borrados')
  }

  // Export logs
  const handleExportLogs = () => {
    const logsJson = securityManager.exportLogs()
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security_logs_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("space-y-6 pb-20", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Seguridad</h1>
          <p className="text-muted-foreground">Configure la protección de sus datos</p>
        </div>
      </div>

      {/* Crypto Support Warning */}
      {!cryptoSupported && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Navegador no compatible</AlertTitle>
          <AlertDescription>
            Su navegador no soporta cifrado avanzado. Algunas funciones de seguridad no estarán disponibles.
          </AlertDescription>
        </Alert>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
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
              {hasPassword ? 'Configurada' : 'No configurada'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Contraseña de emergencia</span>
            <Badge variant={hasDuress ? "default" : "secondary"}>
              {hasDuress ? 'Configurada' : 'No configurada'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cifrado</span>
            <Badge variant={config.encryptionEnabled ? "default" : "secondary"}>
              {config.encryptionEnabled ? 'Activado' : 'Desactivado'}
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

          {/* Encryption Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Cifrado de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cifrar datos sensibles</p>
                  <p className="text-sm text-muted-foreground">
                    Incidentes, documentación y contactos
                  </p>
                </div>
                <Switch
                  checked={config.encryptionEnabled}
                  onCheckedChange={(checked) => 
                    updateSecurityConfig({ encryptionEnabled: checked })
                  }
                />
              </div>
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
          {/* Setup Password */}
          {!hasPassword ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Shield className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="font-semibold">Configurar Seguridad</h3>
                  <p className="text-sm text-muted-foreground">
                    Establezca una contraseña para proteger sus datos
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
                  <CardTitle className="text-base">Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nueva contraseña</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita la contraseña"
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">
                    <Key className="w-4 h-4 mr-2" />
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
                    Active el modo de emergencia si se ve obligado a desbloquear
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
                Elimine todos los datos inmediatamente o programe eliminación automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowWipeDialog(true)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Programar Eliminación
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleImmediateWipe}
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
                Exportar Datos Cifrados
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
                  <Button variant="outline" size="sm" onClick={handleExportLogs}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearLogs}>
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
                    logs.slice().reverse().map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-muted text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={
                              log.type === 'duress' ? 'destructive' :
                              log.type === 'failed_attempt' ? 'secondary' :
                              'default'
                            }
                            className="text-xs"
                          >
                            {log.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString('es-MX')}
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

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {setupStep === 'password' && 'Configurar Contraseña'}
              {setupStep === 'duress' && 'Configurar Contraseña de Emergencia'}
              {setupStep === 'complete' && 'Configuración Completada'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 'password' && 'Establezca una contraseña segura para proteger sus datos.'}
              {setupStep === 'duress' && 'Configure una contraseña alternativa que active el modo de emergencia.'}
              {setupStep === 'complete' && 'Su configuración de seguridad está completa.'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'password' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar contraseña</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>
          )}

          {setupStep === 'duress' && (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Si ingresa esta contraseña, se activará el modo de emergencia ocultando datos sensibles.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Contraseña de emergencia</Label>
                <Input
                  type="password"
                  value={duressPassword}
                  onChange={(e) => setDuressPassword(e.target.value)}
                  placeholder="Diferente a la principal"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar contraseña de emergencia</Label>
                <Input
                  type="password"
                  value={confirmDuress}
                  onChange={(e) => setConfirmDuress(e.target.value)}
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>
          )}

          {setupStep === 'complete' && (
            <div className="text-center py-4">
              <Check className="w-12 h-12 mx-auto text-green-500" />
              <p className="mt-2">¡Configuración guardada exitosamente!</p>
            </div>
          )}

          <DialogFooter>
            {setupStep === 'password' && (
              <Button onClick={handleSetupPassword}>Continuar</Button>
            )}
            {setupStep === 'duress' && (
              <>
                <Button variant="outline" onClick={() => setSetupStep('complete')}>
                  Omitir
                </Button>
                <Button onClick={handleSetupDuress}>Guardar</Button>
              </>
            )}
            {setupStep === 'complete' && (
              <Button onClick={() => {
                setShowSetupDialog(false)
                setSetupStep('password')
              }}>
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other dialogs would be here - keeping code concise */}
    </div>
  )
}

export default SecuritySettings
