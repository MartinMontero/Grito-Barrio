# Training and Certification System

Protocolo CDMX includes a comprehensive training and certification system to ensure all brigade members are properly prepared for emergency response.

## Overview

The training system provides:
- **3 Certification Levels** with progressive difficulty
- **Interactive Modules** with videos, text, and quizzes
- **Scenario Simulator** for practice in realistic situations
- **Progress Tracking** with gamification elements
- **Certificate Generation** with PDF download
- **Offline Support** for downloaded modules

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Training System                           │
├─────────────────────────────────────────────────────────────┤
│  TrainingDashboard │ TrainingModule │ CertificationTracker │
│  ├─ Overview       │  ├─ Lessons    │  ├─ Progress        │
│  ├─ Progress       │  ├─ Videos     │  ├─ Certificates    │
│  ├─ Modules        │  ├─ Quizzes    │  └─ Refresher       │
│  └─ Achievements   │  └─ Checklists │                     │
├─────────────────────────────────────────────────────────────┤
│              ScenarioSimulator                              │
│  ├─ Interactive Scenarios  ├─ Decision Points              │
│  ├─ Time Pressure          └─ Performance Scoring           │
│  └─ Consequence Feedback                                    │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. TrainingDashboard

Overview page showing training progress and recommendations.

```tsx
import { TrainingDashboard } from '@/components/features'

function TrainingPage() {
  return (
    <TrainingDashboard
      modules={modules}
      progress={userProgress}
      achievements={userAchievements}
      onModuleClick={(moduleId) => openModule(moduleId)}
      onScenarioClick={() => openSimulator()}
    />
  )
}
```

**Features:**
- Overall progress statistics
- Current certification level
- Module completion tracking
- Streak counter
- Recommended next steps
- Achievement badges
- Certification pathway visualization

### 2. TrainingModule

Individual module viewer supporting multiple content types.

```tsx
import { TrainingModuleViewer } from '@/components/features'

function ModulePage() {
  return (
    <TrainingModuleViewer
      module={currentModule}
      onComplete={(moduleId, score) => completeModule(moduleId, score)}
      onBack={() => navigateBack()}
    />
  )
}
```

**Content Types:**
- **Video**: Streaming with progress tracking
- **Text**: Rich content with images
- **Quiz**: Multiple choice, true/false, multiple select
- **Checklist**: Interactive completion tracking
- **Interactive**: Hands-on exercises

**Lesson Structure:**
```typescript
interface Lesson {
  id: string
  title: string
  type: 'text' | 'video' | 'quiz' | 'interactive' | 'checklist'
  content: string
  videoUrl?: string
  duration: number // minutes
  quiz?: Quiz
  checkpoint?: Checkpoint
}
```

### 3. CertificationTracker

Track certification progress and manage certificates.

```tsx
import { CertificationTracker } from '@/components/features'

function CertificationsPage() {
  return (
    <CertificationTracker
      certifications={userCertifications}
      progress={trainingProgress}
      modules={completedModules}
      onDownloadCertificate={(certId) => downloadPDF(certId)}
      onRequestEvaluation={(level) => requestEval(level)}
    />
  )
}
```

**Features:**
- Visual progress bars for each level
- Certificate viewer and download
- Expiration tracking
- Refresher reminders
- Level progression requirements

### 4. ScenarioSimulator

Interactive practice scenarios with decision-making.

```tsx
import { ScenarioSimulator } from '@/components/features'

function SimulatorPage() {
  return (
    <ScenarioSimulator
      scenarios={availableScenarios}
      progress={scenarioProgress}
      onComplete={(scenarioId, score, time) => 
        saveResult(scenarioId, score, time)
      }
    />
  )
}
```

**Scenario Features:**
- Multi-stage decision trees
- Time pressure (optional)
- Consequence feedback
- Performance scoring
- Best practice comparison
- Replay capability

## Certification Levels

### Level 1: Fundamentos (8 hours)
**Required for all volunteers**

Modules:
1. **P.A.S. Fundamentos** (2h)
   - Proteger - Avisar - Socorrer
   - Principios básicos de respuesta
   
2. **Cultura de Seguridad** (1.5h)
   - Protocolos de seguridad
   - Identificación de riesgos
   
3. **Consentimiento y Confidencialidad** (1h)
   - Manejo ético de información
   - Privacidad de datos
   
4. **Identificación de Roles** (1.5h)
   - 6 roles del equipo
   - Responsabilidades
   
5. **Desencadenantes de Retirada** (2h)
   - Cuándo evacuar
   - Protocolos de seguridad

**Requirements:**
- 8 hours of training
- 4 modules completed
- 70% average quiz score
- 2 scenarios completed

### Level 2: Especialización (16 hours)
**Role-specific training**

**Security Track:**
- Escenarios de seguridad
- Técnicas de desescalada
- Evaluación de amenazas
- Control de multitudes

**Medical Track:**
- Habilidades médicas con maniquíes
- P.A.P. (Primeros Auxilios Psicológicos)
- Triage médico
- Manejo de trauma

**Legal Track:**
- Investigación legal
- Redacción de quejas
- Derechos de ocupantes
- Proceso legal

**Documentation Track:**
- Disciplina de documentación
- Cadena de custodia
- Fotografía forense
- Archivo de evidencia

**Requirements:**
- Level 1 certified
- 16 hours total
- 6 modules completed
- 4 scenarios completed
- 75% average score

### Level 3: Liderazgo (24 hours)
**Incident leadership**

Modules:
- Coordinación multifuncional
- Gestión de múltiples demandas
- Triage de prioridades
- Delegación efectiva
- Toma de decisiones bajo presión
- Comunicación con medios
- Gestión de recursos

**Requirements:**
- Level 2 certified
- 24 hours total
- 8 modules completed
- 6 scenarios completed
- 80% average score
- Practical evaluation

## Types

### TrainingModule

```typescript
interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'fundamentos' | 'rol' | 'liderazgo'
  certificationLevel: 1 | 2 | 3
  duration: number // hours
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  progress: number // 0-100
  lessons: Lesson[]
  prerequisites: string[]
  completedAt?: string
  certificateUrl?: string
  isDownloaded: boolean
}
```

### Scenario

```typescript
interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  category: string
  estimatedTime: number // minutes
  stages: ScenarioStage[]
  bestScore: number
  attempts: number
}

interface ScenarioStage {
  id: string
  title: string
  description: string
  situation: string
  options: ScenarioOption[]
  correctOptionId: string
  timeLimit?: number // seconds
  hint?: string
}
```

### TrainingProgress

```typescript
interface TrainingProgress {
  userId: string
  certificationLevel: CertificationLevel
  totalHoursCompleted: number
  modulesCompleted: number
  scenariosCompleted: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  modules: Record<string, ModuleProgress>
  scenarios: Record<string, ScenarioProgress>
}
```

## Default Scenarios

### 1. Desalojo Violento Nocturno
**Difficulty:** Hard
**Duration:** 15 minutes

**Stages:**
1. **Evaluación Inicial**
   - Arrive at 3:00 AM
   - Armed individuals present
   - Families with children inside

2. **Comunicación**
   - Establish contact with families
   - Use pre-arranged signals
   - Maintain safety distance

3. **Activación de Protocolo**
   - Assess threat level
   - Activate controlled withdrawal
   - Move to safe point

### 2. Desalojo "de Papel" Mediático
**Difficulty:** Medium
**Duration:** 12 minutes

Legal verification scenario with media presence.

### 3. Corte de Servicios
**Difficulty:** Easy
**Duration:** 10 minutes

Rights violation documentation scenario.

## Usage Examples

### Complete Training Flow

```typescript
// 1. View dashboard
function TrainingDashboardPage() {
  const { modules, progress } = useTrainingStore()
  
  return (
    <TrainingDashboard
      modules={modules}
      progress={progress}
      onModuleClick={(id) => router.push(`/training/${id}`)}
    />
  )
}

// 2. Complete a module
function ModulePage({ moduleId }: { moduleId: string }) {
  const module = useModule(moduleId)
  
  return (
    <TrainingModuleViewer
      module={module}
      onComplete={async (id, score) => {
        await completeModule(id, score)
        // Check for achievements
        checkAchievements()
      }}
    />
  )
}

// 3. Practice scenarios
function SimulatorPage() {
  return (
    <ScenarioSimulator
      scenarios={scenarios}
      onComplete={(id, score, time) => {
        saveScenarioResult(id, score, time)
        // Unlock achievements
        if (score === 100) unlockAchievement('perfect_scenario')
      }}
    />
  )
}

// 4. Track certification
function CertificationsPage() {
  const { certifications, progress } = useTrainingStore()
  
  return (
    <CertificationTracker
      certifications={certifications}
      progress={progress}
      onRequestEvaluation={(level) => {
        submitEvaluationRequest(level)
      }}
    />
  )
}
```

### Quiz Implementation

```typescript
// Module with quiz
const moduleWithQuiz: TrainingModule = {
  id: 'mod-1',
  title: 'P.A.S. Fundamentos',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Evaluación de Conocimientos',
      type: 'quiz',
      content: '',
      duration: 15,
      quiz: {
        id: 'quiz-1',
        questions: [
          {
            id: 'q1',
            text: '¿Qué significa P.A.S.?',
            type: 'multiple_choice',
            options: [
              { id: 'a', text: 'Proteger, Atender, Socorrer' },
              { id: 'b', text: 'Proteger, Avisar, Socorrer' },
              { id: 'c', text: 'Prevenir, Avisar, Socorrer' }
            ],
            correctAnswer: 'b',
            explanation: 'P.A.S. significa Proteger, Avisar, Socorrer',
            points: 10
          }
        ],
        passingScore: 70,
        maxAttempts: 3,
        attempts: 0,
        bestScore: 0
      }
    }
  ]
}
```

### Scenario Implementation

```typescript
// Define a scenario
const scenario: Scenario = {
  id: 'scenario-1',
  title: 'Desalojo Nocturno',
  difficulty: 'hard',
  stages: [
    {
      id: 'stage-1',
      title: 'Llegada a la Escena',
      situation: 'Son las 3:00 AM. Hay individuos armados...',
      options: [
        {
          id: 'opt-1',
          text: 'Acercarse directamente',
          consequence: 'Demasiado peligroso...',
          isCorrect: false,
          score: 0
        },
        {
          id: 'opt-2',
          text: 'Mantener distancia segura',
          consequence: 'Correcto. Identificas puntos de riesgo...',
          isCorrect: true,
          score: 100
        }
      ],
      correctOptionId: 'opt-2',
      timeLimit: 60,
      hint: 'La seguridad del equipo es prioridad #1'
    }
  ]
}
```

## Gamification

### Achievements

Default achievements:
- 🎯 **Primeros Pasos**: Complete your first module
- 📚 **Fundamentado**: Complete Level 1
- 🛡️ **Especialista**: Complete Level 2
- 👑 **Líder**: Complete Level 3
- ⭐ **Perfecto**: Get 100% on a quiz
- 🎭 **Maestro de Escenarios**: Complete 10 scenarios
- ⚡ **Velocista**: Complete a scenario in record time
- 🔥 **Constancia**: 7-day activity streak

### Progress Tracking

- **Streak Counter**: Consecutive days of activity
- **Level Progress**: Visual bars for each certification level
- **Achievement Badges**: Unlocked achievements display
- **Leaderboards**: Compare with other brigade members

## Offline Support

### Downloading Modules

```typescript
// Download for offline
async function downloadModule(moduleId: string) {
  const module = await fetchModule(moduleId)
  
  // Store locally
  await db.put('training_modules', {
    ...module,
    isDownloaded: true,
    downloadedAt: new Date().toISOString()
  })
  
  // Download videos
  for (const lesson of module.lessons) {
    if (lesson.videoUrl) {
      await downloadVideo(lesson.videoUrl)
    }
  }
}
```

### Sync When Online

```typescript
// Sync progress when back online
async function syncTrainingProgress() {
  const offlineProgress = await db.getAll('module_progress')
  
  for (const progress of offlineProgress) {
    if (progress.syncPending) {
      await api.post('/training/progress', progress)
      await db.put('module_progress', {
        ...progress,
        syncPending: false
      })
    }
  }
}
```

## Certificate Generation

### PDF Generation

```typescript
async function generateCertificate(certification: Certification) {
  const template = `
    <html>
      <body style="text-align: center; font-family: serif;">
        <h1>CERTIFICADO DE CAPACITACIÓN</h1>
        <p>Se otorga a: [NOMBRE]</p>
        <h2>${certification.title}</h2>
        <p>${certification.description}</p>
        <p>Fecha: ${new Date().toLocaleDateString()}</p>
      </body>
    </html>
  `
  
  // Generate PDF
  const pdf = await generatePDF(template)
  return pdf
}
```

## Best Practices

1. **Module Design**
   - Keep lessons under 20 minutes
   - Include checkpoints every 5-10 minutes
   - Use varied content types
   - Add real-world examples

2. **Quiz Design**
   - Mix question types
   - Provide detailed explanations
   - Allow multiple attempts
   - Set reasonable passing scores (70-80%)

3. **Scenario Design**
   - Base on real incidents
   - Include time pressure for realism
   - Show consequences of decisions
   - Allow replay for learning

4. **Progress Tracking**
   - Celebrate milestones
   - Send reminders for inactive users
   - Track time spent, not just completion
   - Provide detailed feedback

## Integration

### With User Store

```typescript
// Update certification level
const useUserStore = create((set, get) => ({
  updateCertification: (level) => {
    set({ certificationLevel: level })
    // Update role permissions
    updateRolePermissions(level)
  }
}))
```

### With Incident Response

```typescript
// Check certification before allowing incident creation
function canCreateIncident(user: UserProfile) {
  return user.certificationLevel >= 1
}

// Assign roles based on certification
function assignRole(user: UserProfile, requestedRole: TeamRole) {
  const requiredLevel = getRequiredCertification(requestedRole)
  return user.certificationLevel >= requiredLevel
}
```

## Security

- Track who completes training
- Verify certificate authenticity
- Prevent cheating on quizzes
- Log all training activity
- Encrypt certificates

## Analytics

Track:
- Time spent per module
- Quiz attempt patterns
- Scenario performance
- Drop-off points
- Most/least effective content
- Certification completion rates
