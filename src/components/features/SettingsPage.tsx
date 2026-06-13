import React, { useState } from 'react'
import { User, Bell, Moon, Shield, Database, ChevronRight, LogOut, Info, Smartphone } from 'lucide-react'
import { Card, CardContent, Button, Switch, Badge } from '@/components/ui'
import { useProtocoloStore } from '@/store'

interface SettingsPageProps {
  onNavigate: (page: string) => void
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const settings = useProtocoloStore((state) => state.settings)
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const isAuthenticated = useProtocoloStore((state) => state.isAuthenticated)
  const toggleEncryption = useProtocoloStore((state) => state.toggleEncryption)
  const toggleNotifications = useProtocoloStore((state) => state.toggleNotifications)
  const toggleBiometric = useProtocoloStore((state) => state.toggleBiometric)
  const toggleAutoSync = useProtocoloStore((state) => state.toggleAutoSync)
  const logout = useProtocoloStore((state) => state.logout)
  
  const [isDark, setIsDark] = useState(false)
  
  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }
  
  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">Configura la aplicación según tus necesidades</p>
      </div>
      
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
                  {currentUser ? currentUser.pseudonym : 'Configurar Perfil'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentUser ? `Nivel ${currentUser.certificationLevel} • ${currentUser.role}` : 'Añade tu información personal'}
                </p>
                {isAuthenticated && (
                  <Badge variant="secondary" className="mt-1">Autenticado</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Appearance */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Apariencia</h2>
        <Card>
          <CardContent className="p-0">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              onClick={toggleTheme}
            >
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    {isDark ? 'Oscuro' : 'Claro'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
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
                  <p className="text-sm text-muted-foreground">Recibir alertas importantes</p>
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
                  <p className="text-sm text-muted-foreground">Usar huella o face ID</p>
                </div>
              </div>
              <Switch
                checked={settings.biometricEnabled}
                onCheckedChange={toggleBiometric}
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Encriptación de Datos</p>
                  <p className="text-sm text-muted-foreground">Proteger información sensible</p>
                </div>
              </div>
              <Switch
                checked={settings.encryptionEnabled}
                onCheckedChange={toggleEncryption}
              />
            </div>
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
                  <p className="text-sm text-muted-foreground">Sincronizar cuando haya conexión</p>
                </div>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={toggleAutoSync}
              />
            </div>
            <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-primary" />
                <p className="font-medium">Exportar Datos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-primary" />
                <p className="font-medium">Importar Datos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-primary" />
                <p className="font-medium">Versión de la App</p>
              </div>
              <span className="text-sm text-muted-foreground">v1.0.0</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <p className="font-medium">Política de Privacidad</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
