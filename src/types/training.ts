/**
 * Training Types
 * Protocolo CDMX
 * 
 * TypeScript definitions for training and certification system
 */

export type CertificationLevel = 1 | 2 | 3

export type TrainingModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export type ContentType = 'text' | 'video' | 'quiz' | 'interactive' | 'checklist'

export type ScenarioDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'fundamentos' | 'rol' | 'liderazgo'
  certificationLevel: CertificationLevel
  duration: number // hours
  status: TrainingModuleStatus
  progress: number // 0-100
  lessons: Lesson[]
  prerequisites: string[]
  completedAt?: string
  startedAt?: string
  certificateUrl?: string
  isDownloaded: boolean
  order: number
}

export interface Lesson {
  id: string
  title: string
  type: ContentType
  content: string
  videoUrl?: string
  duration: number // minutes
  isCompleted: boolean
  quiz?: Quiz
  checkpoint?: Checkpoint
}

export interface Quiz {
  id: string
  questions: Question[]
  passingScore: number // percentage
  maxAttempts: number
  attempts: number
  bestScore: number
}

export interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'multiple_select'
  options: Option[]
  correctAnswer: string | string[]
  explanation: string
  points: number
}

export interface Option {
  id: string
  text: string
}

export interface Checkpoint {
  id: string
  description: string
  isCompleted: boolean
  completedAt?: string
}

export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: ScenarioDifficulty
  category: string
  estimatedTime: number // minutes
  imageUrl?: string
  stages: ScenarioStage[]
  bestScore: number
  attempts: number
  completed: boolean
}

export interface ScenarioStage {
  id: string
  title: string
  description: string
  situation: string
  options: ScenarioOption[]
  correctOptionId: string
  timeLimit?: number // seconds
  hint?: string
}

export interface ScenarioOption {
  id: string
  text: string
  consequence: string
  isCorrect: boolean
  score: number
}

export interface Certification {
  level: CertificationLevel
  title: string
  description: string
  requirements: {
    totalHours: number
    modulesRequired: number
    scenariosRequired: number
    minimumScore: number
  }
  modules: string[] // module IDs
  earnedAt?: string
  expiresAt?: string
  isValid: boolean
}

export interface TrainingProgress {
  userId: string
  certificationLevel: CertificationLevel
  totalHoursCompleted: number
  modulesCompleted: number
  scenariosCompleted: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  lastActivityAt: string
  modules: Record<string, ModuleProgress>
  scenarios: Record<string, ScenarioProgress>
}

export interface ModuleProgress {
  moduleId: string
  status: TrainingModuleStatus
  progress: number
  lessonsCompleted: number
  totalLessons: number
  quizScore?: number
  startedAt?: string
  completedAt?: string
}

export interface ScenarioProgress {
  scenarioId: string
  attempts: number
  bestScore: number
  bestTime: number // seconds
  lastAttemptAt?: string
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  isUnlocked: boolean
}

export const CERTIFICATION_LEVELS: Record<CertificationLevel, { title: string; hours: number; color: string }> = {
  1: { title: 'Nivel 1: Fundamentos', hours: 8, color: 'bg-green-500' },
  2: { title: 'Nivel 2: Especialización', hours: 16, color: 'bg-blue-500' },
  3: { title: 'Nivel 3: Liderazgo', hours: 24, color: 'bg-purple-500' }
}

export const MODULE_CATEGORIES = {
  fundamentos: { label: 'Fundamentos', color: 'bg-green-100 text-green-800', icon: 'BookOpen' },
  rol: { label: 'Específico del Rol', color: 'bg-blue-100 text-blue-800', icon: 'UserCog' },
  liderazgo: { label: 'Liderazgo', color: 'bg-purple-100 text-purple-800', icon: 'Crown' }
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_module', title: 'Primeros Pasos', description: 'Completa tu primer módulo', icon: '🎯', isUnlocked: false },
  { id: 'level_1_complete', title: 'Fundamentado', description: 'Completa el Nivel 1', icon: '📚', isUnlocked: false },
  { id: 'level_2_complete', title: 'Especialista', description: 'Completa el Nivel 2', icon: '🛡️', isUnlocked: false },
  { id: 'level_3_complete', title: 'Líder', description: 'Completa el Nivel 3', icon: '👑', isUnlocked: false },
  { id: 'perfect_quiz', title: 'Perfecto', description: 'Obtén 100% en un quiz', icon: '⭐', isUnlocked: false },
  { id: 'scenario_master', title: 'Maestro de Escenarios', description: 'Completa 10 escenarios', icon: '🎭', isUnlocked: false },
  { id: 'speed_demon', title: 'Velocista', description: 'Completa un escenario en tiempo récord', icon: '⚡', isUnlocked: false },
  { id: 'streak_7', title: 'Constancia', description: '7 días de actividad consecutiva', icon: '🔥', isUnlocked: false }
]
