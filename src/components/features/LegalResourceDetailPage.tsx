import React from 'react'
import { ArrowLeft, Scale, ExternalLink } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import type { LegalResource } from '@/types'

interface LegalResourceDetailPageProps {
  resource: LegalResource
  onBack: () => void
}

export function LegalResourceDetailPage({ resource, onBack }: LegalResourceDetailPageProps) {
  // Split content by newlines and format
  const formattedContent = resource.content.split('\n').map((paragraph, index) => {
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      // Header
      return (
        <h3 key={index} className="font-bold text-lg mt-6 mb-3">
          {paragraph.replace(/\*\*/g, '')}
        </h3>
      )
    } else if (paragraph.match(/^\*\*[\d°]+\*\*/)) {
      // Article reference
      return (
        <h4 key={index} className="font-semibold text-base mt-4 mb-2 text-primary">
          {paragraph.replace(/\*\*/g, '')}
        </h4>
      )
    } else if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
      // List item
      return (
        <li key={index} className="ml-4 text-sm text-muted-foreground leading-relaxed">
          {paragraph.substring(2)}
        </li>
      )
    } else if (paragraph.match(/^\d+\./)) {
      // Numbered list
      const [number, ...text] = paragraph.split('. ')
      return (
        <div key={index} className="flex space-x-2 mt-2">
          <span className="font-bold text-primary min-w-[1.5rem]">{number}.</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {text.join('. ')}
          </p>
        </div>
      )
    } else if (paragraph.trim() === '') {
      return null
    } else {
      // Regular paragraph
      return (
        <p key={index} className="text-sm text-muted-foreground leading-relaxed mb-3">
          {paragraph}
        </p>
      )
    }
  })

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">Información Legal</h1>
          </div>
        </div>
      </div>
      
      {/* Resource Content */}
      <div className="px-4">
        {/* Category Badge */}
        <Badge variant="secondary" className="mb-3">
          {resource.category === 'rights' && 'Derechos'}
          {resource.category === 'laws' && 'Leyes'}
          {resource.category === 'procedures' && 'Procedimientos'}
          {resource.category === 'defenses' && 'Defensas'}
          {resource.category === 'resources' && 'Recursos'}
        </Badge>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
        
        {/* Law Reference */}
        {resource.lawReference && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-primary">
              <Scale className="w-4 h-4" />
              <span className="font-medium text-sm">{resource.lawReference}</span>
            </div>
            {resource.articleReference && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {resource.articleReference}
              </p>
            )}
          </div>
        )}
        
        {/* Last Updated */}
        <p className="text-xs text-muted-foreground mb-6">
          Última actualización: {new Date(resource.lastUpdated).toLocaleDateString('es-MX')}
        </p>
        
        {/* Content */}
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              {formattedContent}
            </div>
          </CardContent>
        </Card>
        
        {/* Disclaimer */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Aviso Legal</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Esta información tiene fines informativos y educativos únicamente. 
            No constituye asesoría legal profesional. Para casos específicos, 
            te recomendamos consultar con un abogado o defensor especializado 
            en derecho de vivienda.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button className="w-full" variant="outline">
            <Scale className="w-4 h-4 mr-2" />
            Buscar Asesoría Legal
          </Button>
          <Button className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Compartir Información
          </Button>
        </div>
      </div>
    </div>
  )
}
