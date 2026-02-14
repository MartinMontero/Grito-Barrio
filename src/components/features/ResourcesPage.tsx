import React from 'react'
import { Phone, MapPin, Clock, Mail, ExternalLink, Building2, Heart, Shield, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { cn, formatPhone } from '@/lib/utils'
import { externalResources, emergencyContacts } from '@/data/protocols'
import type { Resource, ResourceType } from '@/types'

interface ResourcesPageProps {
  onResourceSelect?: (resource: Resource) => void
}

const typeIcons: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
  organization: Heart,
  legal_aid: Scale,
  government: Building2,
  emergency_service: Shield,
  community: Heart
}

const typeLabels: Record<ResourceType, string> = {
  organization: 'Organización',
  legal_aid: 'Asesoría Legal',
  government: 'Gobierno',
  emergency_service: 'Emergencia',
  community: 'Comunitario'
}

export function ResourcesPage({ onResourceSelect }: ResourcesPageProps) {
  const emergencyServices = externalResources.filter(r => r.type === 'emergency_service')
  const legalServices = externalResources.filter(r => r.type === 'legal_aid')
  const governmentServices = externalResources.filter(r => r.type === 'government')
  const organizations = externalResources.filter(r => r.type === 'organization')

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Recursos y Contactos</h1>
        <p className="text-muted-foreground">Organizaciones y líneas de ayuda disponibles</p>
      </div>
      
      {/* Emergency Numbers */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3 text-destructive flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          Números de Emergencia
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {emergencyContacts.map((contact, index) => (
            <a 
              key={index}
              href={`tel:${contact.number.replace(/-/g, '')}`}
              className="block"
            >
              <Card className="bg-destructive/5 border-destructive/20 hover:bg-destructive/10 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground uppercase">{contact.type}</p>
                  <p className="font-bold text-lg">{contact.number}</p>
                  <p className="text-sm">{contact.name}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
      
      {/* Emergency Services */}
      {emergencyServices.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Servicios de Emergencia</h2>
          <div className="space-y-2">
            {emergencyServices.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
      
      {/* Legal Aid */}
      {legalServices.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Asesoría Legal Gratuita</h2>
          <div className="space-y-2">
            {legalServices.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
      
      {/* Government Services */}
      {governmentServices.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Instituciones Gubernamentales</h2>
          <div className="space-y-2">
            {governmentServices.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
      
      {/* Organizations */}
      {organizations.length > 0 && (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Organizaciones de Apoyo</h2>
          <div className="space-y-2">
            {organizations.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
      
      {/* Information Note */}
      <div className="px-4 pb-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Nota:</strong> Los datos de contacto pueden cambiar. 
            Te recomendamos verificar la información antes de contactar.
          </p>
        </div>
      </div>
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource
}

function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type]
  
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{resource.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {typeLabels[resource.type]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
            
            {/* Contact Info */}
            <div className="mt-2 space-y-1">
              {resource.contact?.phone && (
                <a 
                  href={`tel:${resource.contact.phone.replace(/\D/g, '')}`}
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {formatPhone(resource.contact.phone)}
                </a>
              )}
              {resource.contact?.email && (
                <a 
                  href={`mailto:${resource.contact.email}`}
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {resource.contact.email}
                </a>
              )}
              {resource.address && (
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                  {resource.address}
                </div>
              )}
              {resource.hours && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {resource.hours}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
