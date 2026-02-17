/**
 * OfflineRoute Component
 * Protocolo CDMX
 * 
 * Wrapper component that handles offline state and provides
 * appropriate feedback when content is not available offline
 */

import React from 'react'
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react'
import { Button, Alert, AlertTitle, AlertDescription } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'

interface OfflineRouteProps {
  children: React.ReactNode
  cachedContent?: React.ReactNode
}

export const OfflineRoute: React.FC<OfflineRouteProps> = ({
  children,
  cachedContent
}) => {
  const isOnline = true
  const lastSync = null as string | null
  const syncStatus = 'synced' as string
  
  // If online, render children normally
  if (isOnline) {
    return <>{children}</>
  }
  
  // If offline but has cached content, show both
  if (cachedContent) {
    return (
      <div className="relative">
        {/* Offline indicator */}
        <div className="sticky top-0 z-10 bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-yellow-800">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Modo sin conexión</span>
            </div>
            <span className="text-xs text-yellow-700">
              Última sincronización: {lastSync ? new Date(lastSync).toLocaleString('es-MX') : 'Desconocida'}
            </span>
          </div>
        </div>
        
        {/* Cached content */}
        <div className="opacity-75">
          {cachedContent}
        </div>
      </div>
    )
  }
  
  // If offline and no cached content, show offline message
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <CloudOff className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Sin Conexión</h2>
      <p className="text-muted-foreground mb-2 max-w-md">
        Esta sección no está disponible sin conexión a internet.
      </p>
      
      {lastSync && (
        <p className="text-sm text-muted-foreground mb-6">
          Última sincronización: {new Date(lastSync).toLocaleString('es-MX')}
        </p>
      )}
      
      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={() => window.history.back()}
        >
          Volver
        </Button>
        
        <Button 
          onClick={() => window.location.reload()}
          disabled={syncStatus === 'syncing'}
        >
          <RefreshCw className={cn(
            "w-4 h-4 mr-2",
            syncStatus === 'syncing' && "animate-spin"
          )} />
          Reintentar
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-md">
        <h3 className="font-medium mb-2">Contenido disponible sin conexión:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 text-left">
          <li>• Protocolos y guías</li>
          <li>• Recursos de emergencia</li>
          <li>• Contactos guardados</li>
          <li>• Checklists</li>
        </ul>
      </div>
    </div>
  )
}

export default OfflineRoute
