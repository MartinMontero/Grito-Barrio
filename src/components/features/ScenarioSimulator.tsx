/**
 * Scenario Simulator Component
 * Protocolo CDMX
 *
 * Interactive practice scenarios for training
 */

import React, { useState, useEffect } from "react";
import {
  Play,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  History,
  Shield,
  AlertOctagon,
  ChevronLeft,
  Star,
  Timer,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  RadioGroup,
  RadioGroupItem,
  Label,
  TooltipProvider,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Scenario, ScenarioProgress } from "@/types/training";

// =============================================================================
// TYPES
// =============================================================================

interface ScenarioSimulatorProps {
  scenarios?: Scenario[];
  progress?: Record<string, ScenarioProgress>;
  onComplete?: (scenarioId: string, score: number, time: number) => void;
  className?: string;
}

interface ScenarioCardProps {
  scenario: Scenario;
  progress?: ScenarioProgress;
  onStart: () => void;
}

interface ActiveScenarioProps {
  scenario: Scenario;
  onComplete: (score: number, time: number) => void;
  onExit: () => void;
}

// =============================================================================
// MOCK SCENARIOS
// =============================================================================

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: "scenario-1",
    title: "Desalojo Violento Nocturno",
    description:
      "Un desalojo inesperado en horario nocturno con presencia de grupos armados.",
    difficulty: "hard",
    category: "Seguridad",
    estimatedTime: 15,
    imageUrl: "/scenarios/night-eviction.jpg",
    stages: [
      {
        id: "stage-1",
        title: "Evaluación Inicial",
        description:
          "Llegas a la escena a las 3:00 AM. Hay personas armadas en la entrada.",
        situation:
          "Observas 3 individuos con armas largas en la puerta principal. Hay familias con niños dentro del inmueble.",
        options: [
          {
            id: "opt-1",
            text: "Acercarse directamente para hablar con los agresores",
            consequence:
              "Demasiado peligroso. Los agresores te amenazan con las armas.",
            isCorrect: false,
            score: 0,
          },
          {
            id: "opt-2",
            text: "Mantener distancia segura y evaluar desde lejos",
            consequence:
              "Correcto. Identificas puntos de riesgo y rutas de escape.",
            isCorrect: true,
            score: 100,
          },
          {
            id: "opt-3",
            text: "Llamar inmediatamente a la prensa",
            consequence:
              "Prematuro. Primero debes asegurar la seguridad de las personas.",
            isCorrect: false,
            score: 25,
          },
        ],
        correctOptionId: "opt-2",
        timeLimit: 60,
        hint: "La seguridad del equipo es prioridad #1",
      },
      {
        id: "stage-2",
        title: "Comunicación",
        description:
          "Necesitas establecer contacto con las familias afectadas.",
        situation:
          "Las familias están asustadas y no saben si confiar en brigadistas desconocidos a esta hora.",
        options: [
          {
            id: "opt-1",
            text: "Gritar desde la calle que son de la brigada",
            consequence:
              "No funciona. El ruido y el miedo hacen que no te escuchen.",
            isCorrect: false,
            score: 10,
          },
          {
            id: "opt-2",
            text: "Usar señales acordadas previamente con la comunidad",
            consequence:
              "Excelente. Las familias reconocen la señal y responden.",
            isCorrect: true,
            score: 100,
          },
          {
            id: "opt-3",
            text: "Intentar entrar por la parte trasera",
            consequence:
              "Riesgoso. Podrías encontrar más agresores o ser confundido con uno de ellos.",
            isCorrect: false,
            score: 30,
          },
        ],
        correctOptionId: "opt-2",
        timeLimit: 90,
        hint: "¿Tienes señales de seguridad establecidas con la comunidad?",
      },
      {
        id: "stage-3",
        title: "Activación de Protocolo",
        description:
          "Las familias están seguras temporalmente pero la situación es grave.",
        situation:
          "Las familias están agrupadas en una habitación interior. Los agresores están cada vez más violentos.",
        options: [
          {
            id: "opt-1",
            text: "Confrontar a los agresores para defender el inmueble",
            consequence:
              "Extremadamente peligroso. No es el rol de la brigada confrontar físicamente.",
            isCorrect: false,
            score: 0,
          },
          {
            id: "opt-2",
            text: "Activar retiro controlado hacia punto seguro preestablecido",
            consequence:
              "Correcto. La seguridad de las personas es lo primero.",
            isCorrect: true,
            score: 100,
          },
          {
            id: "opt-3",
            text: "Esperar a que llegue la policía",
            consequence:
              "Peligroso. No sabes cuándo llegarán y la situación se deteriora.",
            isCorrect: false,
            score: 40,
          },
        ],
        correctOptionId: "opt-2",
        timeLimit: 45,
        hint: "¿Recuerdas el protocolo PAS? Proteger primero.",
      },
    ],
    bestScore: 0,
    attempts: 0,
    completed: false,
  },
  {
    id: "scenario-2",
    title: 'Desalojo "de Papel" Mediático',
    description:
      "Un desalojo con orden judicial durante el día con presencia de medios.",
    difficulty: "medium",
    category: "Legal/Prensa",
    estimatedTime: 12,
    stages: [
      {
        id: "stage-1",
        title: "Verificación Legal",
        description: "Llega un actuario con una orden de desalojo.",
        situation:
          "El actuario muestra documentos pero la comunidad duda de su autenticidad.",
        options: [
          {
            id: "opt-1",
            text: "Ignorar los documentos y negar el acceso",
            consequence:
              "Ilegal. Si la orden es válida, estás obstruyendo la justicia.",
            isCorrect: false,
            score: 20,
          },
          {
            id: "opt-2",
            text: "Verificar la orden revisando sellos, firmas y fecha",
            consequence:
              "Correcto. Identificas inconsistencias en la documentación.",
            isCorrect: true,
            score: 100,
          },
          {
            id: "opt-3",
            text: "Aceptar la orden sin cuestionar",
            consequence: "Negligente. Podría ser una orden falsa o vencida.",
            isCorrect: false,
            score: 30,
          },
        ],
        correctOptionId: "opt-2",
        timeLimit: 120,
      },
    ],
    bestScore: 0,
    attempts: 0,
    completed: false,
  },
  {
    id: "scenario-3",
    title: "Corte de Servicios",
    description: "Corte de agua y luz como método de presión para desalojo.",
    difficulty: "easy",
    category: "Derechos Humanos",
    estimatedTime: 10,
    stages: [
      {
        id: "stage-1",
        title: "Documentación",
        description:
          "Los vecinos reportan corte de servicios sin previo aviso.",
        situation:
          "20 familias sin agua ni luz por 3 días. Hay niños y adultos mayores afectados.",
        options: [
          {
            id: "opt-1",
            text: "Documentar todo y presentar queja ante CDHCM",
            consequence:
              "Correcto. Esto es una violación a derechos humanos documentable.",
            isCorrect: true,
            score: 100,
          },
          {
            id: "opt-2",
            text: "Contactar a la empresa directamente",
            consequence:
              "Ineficiente. La empresa probablemente actúa por órdenes del dueño.",
            isCorrect: false,
            score: 50,
          },
          {
            id: "opt-3",
            text: "Recomendar que las familias se muden",
            consequence: "Incorrecto. Esto sería ceder ante la presión ilegal.",
            isCorrect: false,
            score: 10,
          },
        ],
        correctOptionId: "opt-1",
        timeLimit: 90,
      },
    ],
    bestScore: 0,
    attempts: 0,
    completed: false,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  scenarios = MOCK_SCENARIOS,
  progress: initialProgress = {},
  onComplete,
  className,
}) => {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  // Track attempts/results locally so the simulator records progress on its own.
  const [progress, setProgress] =
    useState<Record<string, ScenarioProgress>>(initialProgress);

  // Filter scenarios
  const availableScenarios = scenarios.filter(
    (s) => !progress[s.id]?.completed,
  );
  const completedScenarios = scenarios.filter((s) => progress[s.id]?.completed);

  const handleStartScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
  };

  const handleCompleteScenario = (
    scenarioId: string,
    score: number,
    time: number,
  ) => {
    setProgress((prev) => {
      const existing = prev[scenarioId];
      return {
        ...prev,
        [scenarioId]: {
          scenarioId,
          attempts: (existing?.attempts ?? 0) + 1,
          bestScore: Math.max(existing?.bestScore ?? 0, score),
          bestTime: existing?.bestTime
            ? Math.min(existing.bestTime, time)
            : time,
          lastAttemptAt: new Date().toISOString(),
          completed: true,
        },
      };
    });
    onComplete?.(scenarioId, score, time);
    setActiveScenario(null);
  };

  if (activeScenario) {
    return (
      <ActiveScenario
        scenario={activeScenario}
        onComplete={(score, time) =>
          handleCompleteScenario(activeScenario.id, score, time)
        }
        onExit={() => setActiveScenario(null)}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Simulador de Escenarios
              </h1>
              <p className="text-sm text-muted-foreground">
                Practica situaciones reales en un entorno seguro
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Trophy className="w-4 h-4 mr-1" />
                {Object.keys(progress).length} completados
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{availableScenarios.length}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{completedScenarios.length}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                {Object.values(progress).reduce(
                  (max, p) => Math.max(max, p.bestScore),
                  0,
                )}
                %
              </p>
              <p className="text-xs text-muted-foreground">Mejor Puntuación</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mx-4 grid grid-cols-2">
            <TabsTrigger value="available">Disponibles</TabsTrigger>
            <TabsTrigger value="completed">Historial</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="available" className="p-4 space-y-4 mt-0">
              {availableScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="font-semibold text-lg">¡Felicitaciones!</h3>
                  <p className="text-muted-foreground">
                    Has completado todos los escenarios disponibles
                  </p>
                </div>
              ) : (
                availableScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    progress={progress[scenario.id]}
                    onStart={() => handleStartScenario(scenario)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="p-4 space-y-4 mt-0">
              {completedScenarios.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aún no has completado ningún escenario</p>
                </div>
              ) : (
                completedScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    progress={progress[scenario.id]}
                    onStart={() => handleStartScenario(scenario)}
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

// =============================================================================
// SCENARIO CARD
// =============================================================================

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  progress,
  onStart,
}) => {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-orange-100 text-orange-800",
    expert: "bg-red-100 text-red-800",
  };

  const difficultyLabels = {
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    expert: "Experto",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        progress?.completed && "border-green-500",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            {scenario.category === "Seguridad" ? (
              <Shield className="w-8 h-8 text-blue-600" />
            ) : scenario.category === "Legal/Prensa" ? (
              <Target className="w-8 h-8 text-purple-600" />
            ) : (
              <AlertOctagon className="w-8 h-8 text-orange-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{scenario.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>
              </div>
              {progress?.completed && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completado
                </Badge>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <Badge
                className={cn("text-xs", difficultyColors[scenario.difficulty])}
              >
                {difficultyLabels[scenario.difficulty]}
              </Badge>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {scenario.estimatedTime} min
              </span>
              <span className="text-muted-foreground">
                {scenario.stages.length} etapas
              </span>
            </div>

            {/* Progress */}
            {progress && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Mejor intento</span>
                  <span className="font-semibold">{progress.bestScore}%</span>
                </div>
                <Progress value={progress.bestScore} className="h-1" />
                {progress.attempts > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress.attempts} intento(s)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action */}
          <Button onClick={onStart} className="flex-shrink-0">
            {progress?.completed ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reintentar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// ACTIVE SCENARIO
// =============================================================================

const ActiveScenario: React.FC<ActiveScenarioProps> = ({
  scenario,
  onComplete,
  onExit,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentStage = scenario.stages[currentStageIndex];
  const isLastStage = currentStageIndex === scenario.stages.length - 1;

  // Timer
  useEffect(() => {
    if (currentStage.timeLimit && isTimerRunning && !showResult) {
      setTimeLeft(currentStage.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStage, isTimerRunning, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setScores((prev) => [...prev, 0]);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    const option = currentStage.options.find((o) => o.id === selectedOption);
    if (option) {
      setScores((prev) => [...prev, option.score]);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (isLastStage) {
      const totalScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      onComplete(totalScore, timeTaken);
    } else {
      setCurrentStageIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setIsTimerRunning(true);
    }
  };

  const selectedOptionData = currentStage.options.find(
    (o) => o.id === selectedOption,
  );
  const isCorrect = selectedOptionData?.isCorrect;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onExit}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold">{scenario.title}</h2>
              <p className="text-sm text-muted-foreground">
                Etapa {currentStageIndex + 1} de {scenario.stages.length}
              </p>
            </div>
          </div>

          {timeLeft !== null && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full",
                timeLeft < 10 ? "bg-red-100 text-red-800" : "bg-gray-100",
              )}
            >
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>

        <Progress
          value={((currentStageIndex + 1) / scenario.stages.length) * 100}
          className="mt-3 h-2"
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Stage Title */}
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentStage.title}</h3>
            <p className="text-muted-foreground">{currentStage.description}</p>
          </div>

          {/* Situation Card */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                    Situación
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200 mt-1">
                    {currentStage.situation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hint */}
          {currentStage.hint && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHint ? "Ocultar pista" : "Ver pista"}
              </Button>
            </div>
          )}

          {showHint && currentStage.hint && (
            <Alert className="bg-blue-50 border-blue-200">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {currentStage.hint}
              </AlertDescription>
            </Alert>
          )}

          {/* Options */}
          {!showResult ? (
            <div className="space-y-3">
              <h4 className="font-semibold">¿Qué decides hacer?</h4>
              <RadioGroup
                value={selectedOption || ""}
                onValueChange={setSelectedOption}
              >
                {currentStage.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedOption === option.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={option.id}
                      className="cursor-pointer flex-1 font-normal"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedOption}
              >
                Confirmar Decisión
              </Button>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4">
              <Card
                className={cn(
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4
                        className={cn(
                          "font-semibold",
                          isCorrect ? "text-green-900" : "text-red-900",
                        )}
                      >
                        {isCorrect ? "¡Correcto!" : "No es la mejor opción"}
                      </h4>
                      <p
                        className={cn(
                          "mt-1",
                          isCorrect ? "text-green-800" : "text-red-800",
                        )}
                      >
                        {selectedOptionData?.consequence}
                      </p>
                      <div className="mt-3">
                        <Badge
                          className={cn(
                            isCorrect ? "bg-green-500" : "bg-red-500",
                          )}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {selectedOptionData?.score} puntos
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Answer */}
              {!isCorrect && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Mejor respuesta:
                    </h4>
                    <p className="text-blue-800">
                      {currentStage.options.find((o) => o.isCorrect)?.text}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button className="w-full" size="lg" onClick={handleNext}>
                {isLastStage ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Resultados
                  </>
                ) : (
                  <>
                    Siguiente Etapa
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ScenarioSimulator;
