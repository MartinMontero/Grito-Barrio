/**
 * Certification Tracker Component
 * Protocolo CDMX
 * 
 * Track certification progress and display certificates
 */

import React, { useState, useMemo } from 'react'
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  TrendingUp,
  Calendar,
  Shield,
  Star,
  Printer,
  Target,
  RefreshCw
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Progress,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  TooltipProvider,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Certification, CertificationLevel, TrainingModule, TrainingProgress } from '@/types/training'
import { CERTIFICATION_LEVELS } from '@/types/training'

// =============================================================================
// TYPES
// =============================================================================

interface CertificationTrackerProps {
  certifications: Certification[]
  progress: TrainingProgress
  modules: TrainingModule[]
  onDownloadCertificate?: (certId: string) => void
  onShareCertificate?: (certId: string) => void
  onRequestEvaluation?: (level: CertificationLevel) => void
  className?: string
}

interface CertificateCardProps {
  certification: Certification
  isValid: boolean
  onDownload: () => void
  onShare: () => void
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    level: 1,
    title: 'Nivel 1: Fundamentos',
    description: 'Certificación en fundamentos de respuesta a desalojos',
    requirements: {
      totalHours: 8,
      modulesRequired: 4,
      scenariosRequired: 2,
      minimumScore: 70
    },
    modules: ['mod-1', 'mod-2', 'mod-3'],
    earnedAt: '2024-01-10T10:00:00Z',
    expiresAt: '2025-01-10T10:00:00Z',
    isValid: true
  }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const CertificationTracker: React.FC<CertificationTrackerProps> = ({
  certifications = MOCK_CERTIFICATIONS,
  progress,
  modules,
  onDownloadCertificate,
  onShareCertificate,
  onRequestEvaluation,
  className
}) => {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null)
  const [showCertificate, setShowCertificate] = useState(false)
  const [activeTab, setActiveTab] = useState('progress')

  // Calculate progress for each level
  const levelProgress = useMemo(() => {
    return [1, 2, 3].map(level => {
      const levelModules = modules.filter(m => m.certificationLevel === level)
      const completedModules = levelModules.filter(m => m.status === 'completed').length
      const hoursCompleted = levelModules
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.duration, 0)
      
      const requirements = CERTIFICATION_LEVELS[level as CertificationLevel]
      const existingCert = certifications.find(c => c.level === level)
      
      return {
        level: level as CertificationLevel,
        title: requirements.title,
        hours: requirements.hours,
        color: requirements.color,
        completedModules,
        totalModules: levelModules.length,
        hoursCompleted,
        progress: levelModules.length > 0 ? (completedModules / levelModules.length) * 100 : 0,
        hoursProgress: Math.min((hoursCompleted / requirements.hours) * 100, 100),
        isEarned: !!existingCert,
        isValid: existingCert?.isValid ?? false,
        expiresAt: existingCert?.expiresAt,
        canRequest: hoursCompleted >= requirements.hours && completedModules >= 3
      }
    })
  }, [modules, certifications])

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalCerts = certifications.filter(c => c.isValid).length
    const expiringSoon = certifications.filter(c => {
      if (!c.expiresAt) return false
      const daysUntilExpiry = Math.ceil((new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length
    
    return {
      totalCerts,
      expiringSoon,
      currentLevel: progress.certificationLevel,
      nextLevel: progress.certificationLevel < 3 ? progress.certificationLevel + 1 : null
    }
  }, [certifications, progress])

  const handleViewCertificate = (cert: Certification) => {
    setSelectedCert(cert)
    setShowCertificate(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Mis Certificaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Sigue tu progreso y descarga tus certificados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Certificados</p>
                  <p className="text-xl font-bold">{stats.totalCerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nivel Actual</p>
                  <p className="text-xl font-bold">{stats.currentLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Por Vencer</p>
                  <p className="text-xl font-bold">{stats.expiringSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Puntuación</p>
                  <p className="text-xl font-bold">{progress.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Warning */}
        {stats.expiringSoon > 0 && (
          <Alert className="mx-4 mb-4 border-orange-500 bg-orange-50">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <AlertTitle className="text-orange-800">
              Certificaciones por vencer
            </AlertTitle>
            <AlertDescription className="text-orange-700">
              Tienes {stats.expiringSoon} certificación(es) que vencerán en los próximos 30 días.
              Programa tu refresco cuanto antes.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid grid-cols-2">
            <TabsTrigger value="progress">Progreso</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Progress Tab */}
            <TabsContent value="progress" className="p-4 space-y-4 mt-0">
              {levelProgress.map((level) => (
                <Card key={level.level} className={cn(
                  level.isEarned && "border-green-500"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Level Badge */}
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0",
                        level.color
                      )}>
                        {level.isEarned ? (
                          <Award className="w-8 h-8" />
                        ) : (
                          level.level
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{level.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {level.hours} horas · {level.totalModules} módulos
                            </p>
                          </div>
                          
                          {level.isEarned ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Certificado
                            </Badge>
                          ) : level.canRequest ? (
                            <Button 
                              size="sm"
                              onClick={() => onRequestEvaluation?.(level.level)}
                            >
                              Solicitar
                            </Button>
                          ) : (
                            <Badge variant="secondary">En progreso</Badge>
                          )}
                        </div>

                        {/* Progress Bars */}
                        <div className="space-y-2 mt-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Módulos</span>
                              <span>{level.completedModules}/{level.totalModules}</span>
                            </div>
                            <Progress value={level.progress} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Horas</span>
                              <span>{level.hoursCompleted.toFixed(1)}/{level.hours}h</span>
                            </div>
                            <Progress value={level.hoursProgress} className="h-2" />
                          </div>
                        </div>

                        {/* Expiry Info */}
                        {level.isEarned && level.expiresAt && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Vence: {formatDate(level.expiresAt)}
                            </span>
                            {getDaysUntilExpiry(level.expiresAt) <= 30 && (
                              <Badge variant="destructive" className="text-xs">
                                {getDaysUntilExpiry(level.expiresAt)} días
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Next Steps */}
              {stats.nextLevel && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Próximo Objetivo</h3>
                        <p className="text-sm text-muted-foreground">
                          Completa los requisitos para el Nivel {stats.nextLevel}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Ruta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="p-4 space-y-4 mt-0">
              {certifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Aún no tienes certificaciones</h3>
                  <p className="text-sm mb-4">Completa los módulos de capacitación para obtener tu primera certificación</p>
                  <Button>Comenzar Capacitación</Button>
                </div>
              ) : (
                certifications.map(cert => (
                  <CertificateCard
                    key={cert.level}
                    certification={cert}
                    isValid={cert.isValid}
                    onDownload={() => onDownloadCertificate?.(String(cert.level))}
                    onShare={() => onShareCertificate?.(String(cert.level))}
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Certificate Viewer Dialog */}
        <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Certificado</DialogTitle>
            </DialogHeader>
            
            {selectedCert && (
              <div className="bg-white dark:bg-gray-900 border-4 border-double border-primary/30 p-8 rounded-lg text-center">
                <div className="mb-6">
                  <Shield className="w-16 h-16 mx-auto text-primary" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold mb-2">
                  CERTIFICADO DE CAPACITACIÓN
                </h2>
                
                <p className="text-lg mb-6">
                  Se otorga el presente certificado a
                </p>
                
                <h3 className="text-3xl font-bold text-primary mb-6">
                  [Nombre del Brigadista]
                </h3>
                
                <p className="mb-4">
                  Por haber completado satisfactoriamente el programa de
                </p>
                
                <h4 className="text-xl font-bold mb-2">
                  {selectedCert.title}
                </h4>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedCert.description}
                </p>
                
                <div className="flex justify-center gap-8 text-sm">
                  <div>
                    <p className="font-semibold">Fecha de emisión:</p>
                    <p>{selectedCert.earnedAt ? formatDate(selectedCert.earnedAt) : '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Válido hasta:</p>
                    <p>{selectedCert.expiresAt ? formatDate(selectedCert.expiresAt) : '-'}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t">
                  <p className="text-xs text-muted-foreground">
                    Protocolo CDMX · Brigada de Apoyo Comunitario
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCertificate(false)}>
                Cerrar
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button onClick={() => selectedCert && onDownloadCertificate?.(String(selectedCert.level))}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// CERTIFICATE CARD
// =============================================================================

const CertificateCard: React.FC<CertificateCardProps> = ({
  certification,
  isValid,
  onDownload,
  onShare
}) => {
  const levelInfo = CERTIFICATION_LEVELS[certification.level]
  const daysUntilExpiry = certification.expiresAt 
    ? Math.ceil((new Date(certification.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card className={cn(
      !isValid && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Certificate Icon */}
          <div className={cn(
            "w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0",
            levelInfo.color
          )}>
            <Award className="w-10 h-10 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{certification.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {certification.description}
                </p>
              </div>
              
              {!isValid && (
                <Badge variant="destructive">Vencido</Badge>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
              {certification.earnedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Emitido: {new Date(certification.earnedAt).toLocaleDateString('es-MX')}
                </span>
              )}
              
              {daysUntilExpiry !== null && (
                <span className={cn(
                  "flex items-center gap-1",
                  daysUntilExpiry <= 30 && "text-orange-600"
                )}>
                  <Clock className="w-4 h-4" />
                  {daysUntilExpiry > 0 
                    ? `Vence en ${daysUntilExpiry} días`
                    : 'Vencido'
                  }
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                <Button size="sm" variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refrescar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CertificationTracker
