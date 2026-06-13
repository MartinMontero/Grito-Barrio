import React from 'react'
import { AlertTriangle, Phone, Shield, FileText, Users } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { useProtocoloStore } from '@/store'
import { protocols } from '@/data/protocols'

interface HomePageProps {
  onEmergencyPress: () => void
  onNavigate: (page: string) => void
}

export function HomePage({ onEmergencyPress, onNavigate }: HomePageProps) {
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const incidents = useProtocoloStore((state) => state.incidents)
  
  const activeIncidents = incidents.filter(i => ['detected', 'verified', 'responding', 'contained'].includes(i.status))
  const emergencyProtocols = protocols.filter(p => p.isEmergency)
  
  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Section */}
      <section className="px-4 pt-2">
        <h1 className="text-2xl font-bold text-foreground">
          {currentUser ? `Hola, ${currentUser.pseudonym}` : 'Bienvenido a Protocolo CDMX'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Herramienta de apoyo para prevención y respuesta a desalojos ilegales
        </p>
      </section>
      
      {/* Quick Emergency Action */}
      <section className="px-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-destructive">¿Estás en riesgo de desalojo?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Activa el protocolo de emergencia inmediatamente para obtener ayuda
                </p>
                <Button 
                  variant="destructive" 
                  className="mt-3 w-full emergency-pulse"
                  onClick={onEmergencyPress}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Activar Emergencia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Active Incidents Summary */}
      {activeIncidents.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Incidentes Activos</h2>
            <Badge variant="secondary">{activeIncidents.length}</Badge>
          </div>
          <div className="space-y-2">
            {activeIncidents.slice(0, 2).map(incident => (
              <Card key={incident.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{incident.description.slice(0, 50)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(incident.timestamp).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <Badge variant={incident.status === 'responding' ? 'destructive' : 'default'}>
                      {incident.status === 'responding' ? 'Respondiendo' : 'Detectado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Quick Actions */}
      <section className="px-4">
        <h2 className="text-lg font-semibold mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onNavigate('protocols')}
          >
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Ver Protocolos</p>
              <p className="text-xs text-muted-foreground mt-1">Guías paso a paso</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onNavigate('resources')}
          >
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Contactos</p>
              <p className="text-xs text-muted-foreground mt-1">Líneas de ayuda</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onNavigate('legal')}
          >
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Derechos</p>
              <p className="text-xs text-muted-foreground mt-1">Información legal</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onNavigate('settings')}
          >
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Mi Perfil</p>
              <p className="text-xs text-muted-foreground mt-1">Configuración</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Emergency Protocols Preview */}
      <section className="px-4">
        <h2 className="text-lg font-semibold mb-3">Protocolos de Emergencia</h2>
        <div className="space-y-2">
          {emergencyProtocols.slice(0, 2).map(protocol => (
            <Card 
              key={protocol.id}
              className="border-destructive/20 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onNavigate('protocols')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium">{protocol.title}</p>
                    <p className="text-sm text-muted-foreground">{protocol.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Safety Notice */}
      <section className="px-4 pb-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Nota importante:</strong> Esta aplicación proporciona información de apoyo. 
            No sustituye el asesoramiento legal profesional. En caso de emergencia, llama al 911.
          </p>
        </div>
      </section>
    </div>
  )
}
