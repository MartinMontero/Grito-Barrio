import React from 'react'
import { ArrowLeft, Clock, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { Button, Card, CardContent, Badge, Alert, AlertTitle, AlertDescription } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Protocol } from '@/types'

interface ProtocolDetailPageProps {
  protocol: Protocol
  onBack: () => void
}

export function ProtocolDetailPage({ protocol, onBack }: ProtocolDetailPageProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{protocol.title}</h1>
          </div>
        </div>
      </div>
      
      {/* Protocol Info */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={protocol.isEmergency ? "destructive" : "default"}>
            {protocol.isEmergency ? 'Emergencia' : 'Protocolo'}
          </Badge>
        </div>
        <p className="text-muted-foreground">{protocol.description}</p>
      </div>
      
      {/* Steps */}
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-semibold">Pasos a Seguir</h2>
        
        {protocol.steps.map((step, index) => (
          <Card key={step.id} className={cn(
            step.warnings && step.warnings.length > 0 && "border-amber-500/50"
          )}>
            <CardContent className="p-4">
              {/* Step Header */}
              <div className="flex items-start space-x-3 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm",
                  protocol.isEmergency 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-primary/10 text-primary"
                )}>
                  {step.order}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.estimatedTime && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.estimatedTime}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Step Description */}
              <p className="text-sm text-muted-foreground mb-3 ml-11">
                {step.description}
              </p>
              
              {/* Actions List */}
              {step.actions && step.actions.length > 0 && (
                <div className="ml-11 space-y-2">
                  <p className="text-sm font-medium">Acciones:</p>
                  <ul className="space-y-1">
                    {step.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Warnings */}
              {step.warnings && step.warnings.length > 0 && (
                <div className="ml-11 mt-3">
                  <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 text-sm">Importante</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-1 space-y-1">
                        {step.warnings.map((warning, warningIndex) => (
                          <li key={warningIndex} className="text-xs text-amber-700">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Resources */}
      {protocol.resources && protocol.resources.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Recursos Relacionados</h2>
          <div className="space-y-2">
            {protocol.resources.map(resource => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      {resource.contact?.phone && (
                        <a 
                          href={`tel:${resource.contact.phone.replace(/\D/g, '')}`}
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          {resource.contact.phone}
                        </a>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Bottom Action */}
      <div className="px-4 pb-4">
        <Button 
          className="w-full"
          size="lg"
          variant={protocol.isEmergency ? "destructive" : "default"}
        >
          Marcar como Completado
        </Button>
      </div>
    </div>
  )
}
