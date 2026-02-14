/**
 * Training Dashboard Component
 * Protocolo CDMX
 * 
 * Overview of all training modules and progress
 */

import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Award,
  Target,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ChevronRight,
  Star,
  Trophy,
  Zap,
  Calendar,
  Download,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Progress,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Avatar,
  AvatarFallback,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { 
  TrainingModule, 
  TrainingProgress, 
  CertificationLevel,
  Achievement 
} from '@/types/training'
import { CERTIFICATION_LEVELS, MODULE_CATEGORIES, ACHIEVEMENTS } from '@/types/training'

// =============================================================================
// TYPES
// =============================================================================

interface TrainingDashboardProps {
  modules: TrainingModule[]
  progress: TrainingProgress
  achievements?: Achievement[]
  onModuleClick?: (moduleId: string) => void
  onScenarioClick?: () => void
  onDownloadModule?: (moduleId: string) => void
  className?: string
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_MODULES: TrainingModule[] = [
  {
    id: 'mod-1',
    title: 'P.A.S. Fundamentos',
    description: 'Proteger - Avisar - Socorrer: Principios básicos de respuesta',
    category: 'fundamentos',
    certificationLevel: 1,
    duration: 2,
    status: 'completed',
    progress: 100,
    lessons: [],
    prerequisites: [],
    completedAt: '2024-01-10T10:00:00Z',
    isDownloaded: true,
    order: 1
  },
  {
    id: 'mod-2',
    title: 'Cultura de Seguridad',
    description: 'Protocolos de seguridad para brigadistas',
    category: 'fundamentos',
    certificationLevel: 1,
    duration: 1.5,
    status: 'completed',
    progress: 100,
    lessons: [],
    prerequisites: [],
    completedAt: '2024-01-12T14:30:00Z',
    isDownloaded: true,
    order: 2
  },
  {
    id: 'mod-3',
    title: 'Consentimiento y Confidencialidad',
    description: 'Manejo ético de información sensible',
    category: 'fundamentos',
    certificationLevel: 1,
    duration: 1,
    status: 'in_progress',
    progress: 60,
    lessons: [],
    prerequisites: [],
    startedAt: '2024-01-15T09:00:00Z',
    isDownloaded: false,
    order: 3
  },
  {
    id: 'mod-4',
    title: 'Seguridad y Desescalada',
    description: 'Técnicas de desescalación y gestión de riesgos',
    category: 'rol',
    certificationLevel: 2,
    duration: 4,
    status: 'available',
    progress: 0,
    lessons: [],
    prerequisites: ['mod-1', 'mod-2', 'mod-3'],
    isDownloaded: false,
    order: 4
  },
  {
    id: 'mod-5',
    title: 'Coordinación Multifuncional',
    description: 'Gestión de equipos en incidentes complejos',
    category: 'liderazgo',
    certificationLevel: 3,
    duration: 6,
    status: 'locked',
    progress: 0,
    lessons: [],
    prerequisites: ['mod-4'],
    isDownloaded: false,
    order: 5
  }
]

const MOCK_PROGRESS: TrainingProgress = {
  userId: 'user-1',
  certificationLevel: 1,
  totalHoursCompleted: 3.5,
  modulesCompleted: 2,
  scenariosCompleted: 3,
  averageScore: 85,
  currentStreak: 5,
  longestStreak: 7,
  lastActivityAt: '2024-01-15T16:00:00Z',
  modules: {
    'mod-1': { moduleId: 'mod-1', status: 'completed', progress: 100, lessonsCompleted: 5, totalLessons: 5, completedAt: '2024-01-10T10:00:00Z' },
    'mod-2': { moduleId: 'mod-2', status: 'completed', progress: 100, lessonsCompleted: 4, totalLessons: 4, completedAt: '2024-01-12T14:30:00Z' },
    'mod-3': { moduleId: 'mod-3', status: 'in_progress', progress: 60, lessonsCompleted: 3, totalLessons: 5, startedAt: '2024-01-15T09:00:00Z' }
  },
  scenarios: {}
}

// =============================================================================
// COMPONENT
// =============================================================================

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  modules = MOCK_MODULES,
  progress = MOCK_PROGRESS,
  achievements = ACHIEVEMENTS,
  onModuleClick,
  onScenarioClick,
  onDownloadModule,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLevel, setSelectedLevel] = useState<CertificationLevel | 'all'>('all')

  // Calculate statistics
  const stats = useMemo(() => {
    const totalModules = modules.length
    const completedModules = modules.filter(m => m.status === 'completed').length
    const inProgressModules = modules.filter(m => m.status === 'in_progress').length
    const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0
    
    const nextLevelRequirements = CERTIFICATION_LEVELS[(progress.certificationLevel + 1) as CertificationLevel]
    const hoursNeeded = nextLevelRequirements ? nextLevelRequirements.hours - progress.totalHoursCompleted : 0
    
    return {
      totalModules,
      completedModules,
      inProgressModules,
      overallProgress,
      hoursNeeded: Math.max(0, hoursNeeded),
      canLevelUp: hoursNeeded <= 0 && progress.modulesCompleted >= getModulesForLevel(progress.certificationLevel + 1)
    }
  }, [modules, progress])

  // Filter modules
  const filteredModules = useMemo(() => {
    if (selectedLevel === 'all') return modules
    return modules.filter(m => m.certificationLevel === selectedLevel)
  }, [modules, selectedLevel])

  // Group modules by status
  const groupedModules = useMemo(() => {
    const groups: Record<string, TrainingModule[]> = {
      in_progress: [],
      available: [],
      completed: [],
      locked: []
    }
    
    filteredModules.forEach(module => {
      groups[module.status].push(module)
    })
    
    return groups
  }, [filteredModules])

  // Get next recommended module
  const nextModule = useMemo(() => {
    return modules.find(m => m.status === 'in_progress') || 
           modules.find(m => m.status === 'available')
  }, [modules])

  function getModulesForLevel(level: number): number {
    switch (level) {
      case 1: return 4
      case 2: return 6
      case 3: return 8
      default: return 4
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Centro de Capacitación
              </h1>
              <p className="text-sm text-muted-foreground">
                Desarrolla tus habilidades y avanza en tu certificación
              </p>
            </div>
            <Button onClick={onScenarioClick} variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Simulador
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-500" />}
            label="Nivel Actual"
            value={`Nivel ${progress.certificationLevel}`}
            subtext={CERTIFICATION_LEVELS[progress.certificationLevel].title}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-blue-500" />}
            label="Horas Completadas"
            value={`${progress.totalHoursCompleted}h`}
            subtext={`de ${CERTIFICATION_LEVELS[progress.certificationLevel].hours}h requeridas`}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            label="Módulos Completados"
            value={String(progress.modulesCompleted)}
            subtext={`de ${stats.totalModules} disponibles`}
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Racha Actual"
            value={`${progress.currentStreak} días`}
            subtext={`Mejor: ${progress.longestStreak} días`}
          />
        </div>

        {/* Overall Progress */}
        <div className="px-4 pb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Progreso General</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.overallProgress)}%
                </span>
              </div>
              <Progress value={stats.overallProgress} className="h-2" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{stats.completedModules} completados</span>
                <span>{stats.inProgressModules} en progreso</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Level Alert */}
        {stats.canLevelUp && (
          <Alert className="mx-4 mb-4 bg-green-50 border-green-200">
            <Award className="w-5 h-5 text-green-600" />
            <AlertTitle className="text-green-800">
              ¡Listo para el siguiente nivel!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Has completado todos los requisitos para el Nivel {progress.certificationLevel + 1}.
              <Button variant="link" className="text-green-700 p-0 h-auto font-semibold">
                Solicitar evaluación →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-4 space-y-4 mt-0">
              {/* Continue Learning */}
              {nextModule && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Continuar Aprendiendo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl",
                        MODULE_CATEGORIES[nextModule.category].color.split(' ')[0]
                      )}>
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{nextModule.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {nextModule.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {nextModule.duration}h
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {nextModule.progress}%
                          </span>
                        </div>
                        <Progress 
                          value={nextModule.progress} 
                          className="mt-2 h-1"
                        />
                      </div>
                      <Button onClick={() => onModuleClick?.(nextModule.id)}>
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certification Levels */}
              <div className="space-y-3">
                <h2 className="font-semibold">Ruta de Certificación</h2>
                {[1, 2, 3].map(level => {
                  const levelInfo = CERTIFICATION_LEVELS[level as CertificationLevel]
                  const isCurrent = progress.certificationLevel === level
                  const isCompleted = progress.certificationLevel > level
                  
                  return (
                    <Card 
                      key={level} 
                      className={cn(
                        isCurrent && "border-primary",
                        isCompleted && "opacity-75"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                            levelInfo.color
                          )}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              level
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{levelInfo.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {levelInfo.hours} horas de capacitación
                            </p>
                          </div>
                          {isCurrent && (
                            <Badge>Actual</Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="secondary">Completado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Recommended */}
              <div className="space-y-3">
                <h2 className="font-semibold">Recomendado para Ti</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium text-sm">Practicar Escenarios</p>
                      <p className="text-xs text-muted-foreground">3 escenarios disponibles</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium text-sm">Refrescar Nivel 1</p>
                      <p className="text-xs text-muted-foreground">Vence en 30 días</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="p-4 space-y-4 mt-0">
              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel('all')}
                >
                  Todos
                </Button>
                {[1, 2, 3].map(level => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel(level as CertificationLevel)}
                  >
                    Nivel {level}
                  </Button>
                ))}
              </div>

              {/* Module Lists */}
              {groupedModules.in_progress.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    En Progreso
                  </h3>
                  {groupedModules.in_progress.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onClick={() => onModuleClick?.(module.id)}
                      onDownload={() => onDownloadModule?.(module.id)}
                    />
                  ))}
                </div>
              )}

              {groupedModules.available.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Disponibles
                  </h3>
                  {groupedModules.available.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onClick={() => onModuleClick?.(module.id)}
                      onDownload={() => onDownloadModule?.(module.id)}
                    />
                  ))}
                </div>
              )}

              {groupedModules.completed.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Completados
                  </h3>
                  {groupedModules.completed.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onClick={() => onModuleClick?.(module.id)}
                      onDownload={() => onDownloadModule?.(module.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="p-4 mt-0">
              <div className="grid grid-cols-2 gap-3">
                {achievements.map(achievement => (
                  <Card 
                    key={achievement.id}
                    className={cn(
                      !achievement.isUnlocked && "opacity-50"
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString('es-MX')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext }) => (
  <Card>
    <CardContent className="p-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

interface ModuleCardProps {
  module: TrainingModule
  onClick: () => void
  onDownload: () => void
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, onDownload }) => {
  const category = MODULE_CATEGORIES[module.category]
  const StatusIcon = {
    locked: Lock,
    available: Circle,
    in_progress: Play,
    completed: CheckCircle2
  }[module.status]

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all",
        module.status === 'locked' && "opacity-60",
        module.status === 'in_progress' && "border-primary"
      )}
      onClick={module.status !== 'locked' ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0",
            category.color.split(' ')[0]
          )}>
            <StatusIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold truncate">{module.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {module.description}
                </p>
              </div>
              {module.isDownloaded && (
                <Badge variant="secondary" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {module.duration}h
              </span>
              <Badge className={cn("text-xs", category.color)}>
                {category.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Nivel {module.certificationLevel}
              </span>
            </div>

            {module.status === 'in_progress' && (
              <div className="mt-2">
                <Progress value={module.progress} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {module.progress}% completado
                </p>
              </div>
            )}
          </div>

          {module.status !== 'locked' && !module.isDownloaded && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onDownload()
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TrainingDashboard
