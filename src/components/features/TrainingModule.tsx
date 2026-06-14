/**
 * Training Module Component
 * Protocolo CDMX
 *
 * Individual training module viewer with lessons, videos, and quizzes
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Trophy,
  AlertCircle,
  Download,
  RotateCcw,
  BookOpen,
  ListChecks,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Progress,
  Badge,
  ScrollArea,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  TooltipProvider,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TrainingModule, Lesson, Quiz } from "@/types/training";

// =============================================================================
// TYPES
// =============================================================================

interface TrainingModuleProps {
  module: TrainingModule;
  onComplete?: (moduleId: string, score?: number) => void;
  onBack?: () => void;
  onNextModule?: () => void;
  className?: string;
}

interface LessonViewProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
}

interface QuizViewProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const TrainingModuleViewer: React.FC<TrainingModuleProps> = ({
  module,
  onComplete,
  onBack,
  onNextModule,
  className,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  const currentLesson = module.lessons[currentLessonIndex];
  const progress = (completedLessons.size / module.lessons.length) * 100;

  // Check if all lessons completed
  useEffect(() => {
    if (completedLessons.size === module.lessons.length && !moduleCompleted) {
      setModuleCompleted(true);
      setShowCompletionDialog(true);
      onComplete?.(module.id, calculateFinalScore());
    }
  }, [
    completedLessons,
    module.lessons.length,
    moduleCompleted,
    module.id,
    onComplete,
  ]);

  const calculateFinalScore = () => {
    const scores = Object.values(quizScores);
    if (scores.length === 0) return undefined;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const handleLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => new Set([...prev, lessonId]));
  }, []);

  const handleQuizComplete = useCallback(
    (lessonId: string, score: number) => {
      setQuizScores((prev) => ({ ...prev, [lessonId]: score }));
      handleLessonComplete(lessonId);
    },
    [handleLessonComplete],
  );

  const goToNextLesson = () => {
    if (currentLessonIndex < module.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
    }
  };

  const isLastLesson = currentLessonIndex === module.lessons.length - 1;
  const isFirstLesson = currentLessonIndex === 0;

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold line-clamp-1">{module.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Lección {currentLessonIndex + 1} de {module.lessons.length}
                </span>
                <span>·</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>

        {/* Lesson Navigation */}
        <div className="px-4 py-2 border-b overflow-x-auto">
          <div className="flex gap-2">
            {module.lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(lesson.id);
              const isCurrent = index === currentLessonIndex;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                    isCurrent && "bg-primary text-primary-foreground",
                    isCompleted && !isCurrent && "bg-green-100 text-green-800",
                    !isCompleted && !isCurrent && "bg-gray-100 text-gray-600",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 max-w-3xl mx-auto">
            {currentLesson && (
              <LessonContent
                lesson={currentLesson}
                isCompleted={completedLessons.has(currentLesson.id)}
                onComplete={() => handleLessonComplete(currentLesson.id)}
                onQuizComplete={(score) =>
                  handleQuizComplete(currentLesson.id, score)
                }
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer Navigation */}
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPreviousLesson}
              disabled={isFirstLesson}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {completedLessons.has(currentLesson?.id || "") ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completado
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Completa esta lección para continuar
              </span>
            )}

            <Button
              onClick={goToNextLesson}
              disabled={
                isLastLesson || !completedLessons.has(currentLesson?.id || "")
              }
            >
              {isLastLesson ? "Finalizar" : "Siguiente"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Completion Dialog */}
        <Dialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                ¡Módulo Completado!
              </DialogTitle>
              <DialogDescription>
                Has completado exitosamente el módulo "{module.title}"
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-lg font-semibold">
                  {calculateFinalScore() !== undefined
                    ? `Puntuación final: ${calculateFinalScore()}%`
                    : "Módulo completado"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {module.lessons.length} lecciones · {module.duration} horas
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Volver al Dashboard
              </Button>
              <Button onClick={onNextModule}>Siguiente Módulo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// =============================================================================
// LESSON CONTENT
// =============================================================================

interface LessonContentProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
  onQuizComplete: (score: number) => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  isCompleted,
  onComplete,
  onQuizComplete,
}) => {
  switch (lesson.type) {
    case "video":
      return (
        <VideoLesson
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onComplete}
        />
      );
    case "quiz":
      return <QuizLesson quiz={lesson.quiz!} onComplete={onQuizComplete} />;
    case "checklist":
      return (
        <ChecklistLesson
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onComplete}
        />
      );
    default:
      return (
        <TextLesson
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onComplete}
        />
      );
  }
};

// =============================================================================
// VIDEO LESSON
// =============================================================================

const VideoLesson: React.FC<LessonViewProps> = ({
  lesson,
  isCompleted,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate video progress
  useEffect(() => {
    if (isPlaying && progress < 100) {
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 90 && !isCompleted) {
            onComplete();
          }
          return Math.min(p + 2, 100);
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, progress, isCompleted, onComplete]);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
        {!isPlaying ? (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-pulse">Reproduciendo video...</div>
              <Progress value={progress} className="w-64 mt-4" />
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{lesson.duration} minutos</span>
          {lesson.videoUrl && (
            <>
              <span>·</span>
              <Badge variant="secondary">
                <Download className="w-3 h-3 mr-1" />
                Disponible offline
              </Badge>
            </>
          )}
        </div>

        {isCompleted && (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Visto
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <h2>{lesson.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
    </div>
  );
};

// =============================================================================
// TEXT LESSON
// =============================================================================

const TextLesson: React.FC<LessonViewProps> = ({
  lesson,
  isCompleted,
  onComplete,
}) => {
  const [hasRead, setHasRead] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="w-4 h-4" />
        <span>Lectura · {lesson.duration} min</span>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        <div
          className="space-y-4"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* Checkpoint */}
      {lesson.checkpoint && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Punto de Control
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {lesson.checkpoint.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mark as Complete */}
      {!isCompleted && (
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <Checkbox
            id="complete"
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked as boolean)}
          />
          <Label htmlFor="complete" className="flex-1 cursor-pointer">
            He leído y comprendido este contenido
          </Label>
          <Button onClick={onComplete} disabled={!hasRead}>
            Marcar como completado
          </Button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// QUIZ LESSON
// =============================================================================

const QuizLesson: React.FC<QuizViewProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswer = (answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      const answer = answers[q.id];
      if (Array.isArray(q.correctAnswer)) {
        if (
          Array.isArray(answer) &&
          answer.length === q.correctAnswer.length &&
          answer.every((a) => q.correctAnswer.includes(a))
        ) {
          correct++;
        }
      } else {
        if (answer === q.correctAnswer) correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    if (finalScore >= quiz.passingScore) {
      onComplete(finalScore);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= quiz.passingScore;
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl mb-4">{passed ? "🎉" : "📝"}</div>
        <h2 className="text-2xl font-bold">
          {passed ? "¡Felicitaciones!" : "Sigue practicando"}
        </h2>
        <p className="text-muted-foreground">
          Obtuviste {score}% de {quiz.questions.length} preguntas
        </p>

        <div className="flex justify-center">
          <div
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold",
              passed
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800",
            )}
          >
            {score}%
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Puntuación mínima requerida: {quiz.passingScore}%
        </p>

        {!passed && (
          <Button onClick={handleRetry} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reintentar Quiz
          </Button>
        )}

        {passed && (
          <Alert className="bg-green-50 border-green-200 text-left">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <AlertTitle>Quiz completado</AlertTitle>
            <AlertDescription>
              Has demostrado dominio de este tema. Puedes continuar con el
              siguiente módulo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
        </span>
        <Progress
          value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
          className="w-32 h-2"
        />
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.text}</h3>

          {currentQuestion.type === "multiple_choice" && (
            <RadioGroup
              value={answers[currentQuestion.id] as string}
              onValueChange={handleAnswer}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="cursor-pointer flex-1"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "true_false" && (
            <RadioGroup
              value={answers[currentQuestion.id] as string}
              onValueChange={handleAnswer}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Verdadero</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Falso</Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "multiple_select" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={(
                      (answers[currentQuestion.id] as string[]) || []
                    ).includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current =
                        (answers[currentQuestion.id] as string[]) || [];
                      if (checked) {
                        handleAnswer([...current, option.id]);
                      } else {
                        handleAnswer(current.filter((id) => id !== option.id));
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Anterior
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!answers[currentQuestion.id]}
          >
            Finalizar Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={!answers[currentQuestion.id]}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// CHECKLIST LESSON
// =============================================================================

const ChecklistLesson: React.FC<LessonViewProps> = ({
  lesson,
  isCompleted,
  onComplete,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Parse checklist items from content
  const checklistItems = lesson.content
    .split("\n")
    .filter(
      (line) => line.trim().startsWith("- ") || line.trim().startsWith("* "),
    )
    .map((line) => line.trim().substring(2));

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const allChecked = checkedItems.size === checklistItems.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ListChecks className="w-4 h-4" />
        <span>Lista de Verificación · {checklistItems.length} items</span>
      </div>

      <h2 className="text-2xl font-bold">{lesson.title}</h2>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  checkedItems.has(item) && "bg-green-50 border-green-200",
                )}
                onClick={() => toggleItem(item)}
              >
                <Checkbox
                  checked={checkedItems.has(item)}
                  onCheckedChange={() => toggleItem(item)}
                />
                <span
                  className={cn(
                    "flex-1",
                    checkedItems.has(item) &&
                      "line-through text-muted-foreground",
                  )}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Progress
        value={(checkedItems.size / checklistItems.length) * 100}
        className="h-2"
      />

      {!isCompleted && (
        <Button onClick={onComplete} disabled={!allChecked} className="w-full">
          {allChecked ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completar Lección
            </>
          ) : (
            `${checkedItems.size} de ${checklistItems.length} items completados`
          )}
        </Button>
      )}
    </div>
  );
};

export default TrainingModuleViewer;
