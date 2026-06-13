/**
 * Checklist Slice
 * Protocolo CDMX - Zustand Store
 *
 * Manages emergency response checklists with time-based phases
 */

import type { StateCreator } from "zustand";
import type { ChecklistItem, EmergencyPhase, ChecklistCategory } from "@/types";
import {
  getCurrentTimestamp,
  calculateProgress,
  persistToIndexedDB,
} from "@/lib/store-helpers";

// =============================================================================
// TYPES
// =============================================================================

export interface ChecklistState {
  [incidentId: string]: ChecklistItem[];
}

export interface ChecklistSlice {
  // State
  checklists: ChecklistState;
  currentPhase: EmergencyPhase;

  // Actions
  initializeChecklist: (incidentId: string) => void;
  toggleItem: (incidentId: string, itemId: string, completedBy: string) => void;
  getProgress: (incidentId: string) => number;
  getItemsByPhase: (
    incidentId: string,
    phase: EmergencyPhase,
  ) => ChecklistItem[];
  getItemsByCategory: (
    incidentId: string,
    category: ChecklistCategory,
  ) => ChecklistItem[];
  getCompletedItems: (incidentId: string) => ChecklistItem[];
  getPendingItems: (incidentId: string) => ChecklistItem[];
  getMandatoryPending: (incidentId: string) => ChecklistItem[];
  setCurrentPhase: (phase: EmergencyPhase) => void;
  getPhaseProgress: (incidentId: string, phase: EmergencyPhase) => number;
  resetChecklist: (incidentId: string) => void;
  addCustomItem: (
    incidentId: string,
    item: Omit<ChecklistItem, "id" | "completed">,
  ) => void;
  removeItem: (incidentId: string, itemId: string) => void;
}

// =============================================================================
// DEFAULT CHECKLIST ITEMS
// =============================================================================

/**
 * Canonical checklist template for an illegal-eviction rapid response.
 *
 * IMPORTANT: the ID for each item is derived from its INDEX in this array as
 * `${incidentId}-item-${index}` (see initializeChecklist). This is the SINGLE
 * canonical id scheme used by every component (EmergencyDashboard checklist
 * section, EmergencyChecklist, etc.). Do not reorder items without
 * understanding that completion records are keyed by index-derived ids.
 *
 * Phases follow the CDMX 60-minute protocol:
 *   - 0-5min   : Primeros 5 minutos (activación / seguridad inmediata)
 *   - 5-20min  : Llegada y evaluación en escena
 *   - 20-45min : Documentación y escalación legal
 *   - 45-60min : Soporte sostenido y retirada/seguimiento
 */
const defaultChecklistItems: Omit<ChecklistItem, "id">[] = [
  // ===========================================================================
  // Fase 0-5min: Primeros 5 minutos — Activación inmediata
  // ===========================================================================
  {
    text: "Confirmar la alerta (ubicación, hora y naturaleza de la amenaza)",
    completed: false,
    category: "communication",
    timeWindow: "0-5min",
    mandatory: true,
  },
  {
    text: "Verificar seguridad de la escena - Evaluar riesgos inmediatos",
    completed: false,
    category: "safety",
    timeWindow: "0-5min",
    mandatory: true,
  },
  {
    text: "Designar líder de incidente y activar protocolo de respuesta rápida",
    completed: false,
    category: "communication",
    timeWindow: "0-5min",
    mandatory: true,
  },
  {
    text: "Identificar número de ocupantes en riesgo",
    completed: false,
    category: "safety",
    timeWindow: "0-5min",
    mandatory: true,
  },
  {
    text: "Verificar presencia de menores o personas vulnerables",
    completed: false,
    category: "safety",
    timeWindow: "0-5min",
    mandatory: true,
  },
  {
    text: "Iniciar documentación fotográfica/video",
    completed: false,
    category: "documentation",
    timeWindow: "0-5min",
    mandatory: false,
  },

  // ===========================================================================
  // Fase 5-20min: Llegada y evaluación en escena
  // ===========================================================================
  {
    text: "Iniciar protocolo P.A.S. (Proteger, Avisar, Socorrer)",
    completed: false,
    category: "safety",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Evaluar presencia de actores armados y autoridades",
    completed: false,
    category: "safety",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Evaluar desencadenantes de retirada controlada",
    completed: false,
    category: "safety",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Contactar abogado de guardia",
    completed: false,
    category: "legal",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Verificar orden judicial (si existe)",
    completed: false,
    category: "legal",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Establecer línea de comunicación segura",
    completed: false,
    category: "communication",
    timeWindow: "5-20min",
    mandatory: true,
  },
  {
    text: "Localizar testigos (mínimo 2 identificados)",
    completed: false,
    category: "documentation",
    timeWindow: "5-20min",
    mandatory: false,
  },
  {
    text: "Preparar punto seguro de evacuación",
    completed: false,
    category: "logistics",
    timeWindow: "5-20min",
    mandatory: false,
  },

  // ===========================================================================
  // Fase 20-45min: Documentación y escalación legal
  // ===========================================================================
  {
    text: "Realizar triage legal completo",
    completed: false,
    category: "legal",
    timeWindow: "20-45min",
    mandatory: true,
  },
  {
    text: "Documentar toda evidencia disponible (cadena de custodia)",
    completed: false,
    category: "documentation",
    timeWindow: "20-45min",
    mandatory: true,
  },
  {
    text: "Determinar ruta de queja de DH (CDHCM / CNDH)",
    completed: false,
    category: "legal",
    timeWindow: "20-45min",
    mandatory: true,
  },
  {
    text: "Verificar consentimiento informado del sobreviviente",
    completed: false,
    category: "legal",
    timeWindow: "20-45min",
    mandatory: true,
  },
  {
    text: "Contactar medios/comunicación estratégica",
    completed: false,
    category: "communication",
    timeWindow: "20-45min",
    mandatory: false,
  },
  {
    text: "Coordinar recursos de apoyo psicológico",
    completed: false,
    category: "medical",
    timeWindow: "20-45min",
    mandatory: false,
  },

  // ===========================================================================
  // Fase 45-60min: Soporte sostenido, retirada y seguimiento
  // ===========================================================================
  {
    text: "Revisar progreso y ajustar estrategia",
    completed: false,
    category: "follow_up",
    timeWindow: "45-60min",
    mandatory: true,
  },
  {
    text: "Confirmar plan de seguimiento y acompañamiento",
    completed: false,
    category: "follow_up",
    timeWindow: "45-60min",
    mandatory: true,
  },
  {
    text: "Documentar resolución o estado actual del incidente",
    completed: false,
    category: "documentation",
    timeWindow: "45-60min",
    mandatory: true,
  },
  {
    text: "Confirmar retirada segura del equipo (si aplica)",
    completed: false,
    category: "safety",
    timeWindow: "45-60min",
    mandatory: false,
  },
  {
    text: "Briefing de cierre con el equipo completo",
    completed: false,
    category: "follow_up",
    timeWindow: "45-60min",
    mandatory: false,
  },
];

// =============================================================================
// INITIAL STATE
// =============================================================================

type ChecklistActions =
  | "initializeChecklist"
  | "toggleItem"
  | "getProgress"
  | "getItemsByPhase"
  | "getItemsByCategory"
  | "getCompletedItems"
  | "getPendingItems"
  | "getMandatoryPending"
  | "setCurrentPhase"
  | "getPhaseProgress"
  | "resetChecklist"
  | "addCustomItem"
  | "removeItem";

const initialChecklistState: Omit<ChecklistSlice, ChecklistActions> = {
  checklists: {},
  currentPhase: "0-5min",
};

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createChecklistSlice: StateCreator<
  ChecklistSlice,
  [],
  [],
  ChecklistSlice
> = persistToIndexedDB<ChecklistSlice>(
  "protocolo-checklists",
  true,
)((set, get) => ({
  ...initialChecklistState,

  /**
   * Initialize a new checklist for an incident
   */
  initializeChecklist: (incidentId: string) => {
    set((state) => {
      // Don't overwrite existing checklist
      if (state.checklists[incidentId]?.length > 0) {
        return state;
      }

      // Generate unique IDs for each item
      const items: ChecklistItem[] = defaultChecklistItems.map(
        (item, index) => ({
          ...item,
          id: `${incidentId}-item-${index}`,
        }),
      );

      return {
        checklists: {
          ...state.checklists,
          [incidentId]: items,
        },
      };
    });
  },

  /**
   * Toggle an item's completed status with auto-timestamp
   */
  toggleItem: (incidentId: string, itemId: string, completedBy: string) => {
    set((state) => {
      const checklist = state.checklists[incidentId];
      if (!checklist) return state;

      const updatedChecklist = checklist.map((item) => {
        if (item.id !== itemId) return item;

        const newCompleted = !item.completed;

        return {
          ...item,
          completed: newCompleted,
          timestamp: newCompleted ? getCurrentTimestamp() : undefined,
          completedBy: newCompleted ? completedBy : undefined,
        };
      });

      return {
        checklists: {
          ...state.checklists,
          [incidentId]: updatedChecklist,
        },
      };
    });
  },

  /**
   * Get overall progress percentage for an incident
   */
  getProgress: (incidentId: string): number => {
    const checklist = get().checklists[incidentId];
    if (!checklist || checklist.length === 0) return 0;

    const completed = checklist.filter((item) => item.completed).length;
    return calculateProgress(completed, checklist.length);
  },

  /**
   * Get items filtered by phase
   */
  getItemsByPhase: (
    incidentId: string,
    phase: EmergencyPhase,
  ): ChecklistItem[] => {
    const checklist = get().checklists[incidentId];
    if (!checklist) return [];

    return checklist.filter((item) => item.timeWindow === phase);
  },

  /**
   * Get items filtered by category
   */
  getItemsByCategory: (
    incidentId: string,
    category: ChecklistCategory,
  ): ChecklistItem[] => {
    const checklist = get().checklists[incidentId];
    if (!checklist) return [];

    return checklist.filter((item) => item.category === category);
  },

  /**
   * Get all completed items
   */
  getCompletedItems: (incidentId: string): ChecklistItem[] => {
    const checklist = get().checklists[incidentId];
    if (!checklist) return [];

    return checklist.filter((item) => item.completed);
  },

  /**
   * Get all pending (not completed) items
   */
  getPendingItems: (incidentId: string): ChecklistItem[] => {
    const checklist = get().checklists[incidentId];
    if (!checklist) return [];

    return checklist.filter((item) => !item.completed);
  },

  /**
   * Get mandatory items that are still pending
   */
  getMandatoryPending: (incidentId: string): ChecklistItem[] => {
    const checklist = get().checklists[incidentId];
    if (!checklist) return [];

    return checklist.filter((item) => item.mandatory && !item.completed);
  },

  /**
   * Set the current emergency phase
   */
  setCurrentPhase: (phase: EmergencyPhase) => {
    set({ currentPhase: phase });
  },

  /**
   * Get progress for a specific phase
   */
  getPhaseProgress: (incidentId: string, phase: EmergencyPhase): number => {
    const phaseItems = get().getItemsByPhase(incidentId, phase);
    if (phaseItems.length === 0) return 0;

    const completed = phaseItems.filter((item) => item.completed).length;
    return calculateProgress(completed, phaseItems.length);
  },

  /**
   * Reset a checklist to initial state
   */
  resetChecklist: (incidentId: string) => {
    set((state) => {
      const items = state.checklists[incidentId];
      if (!items) return state;

      const resetItems = items.map((item, index) => ({
        ...item,
        id: `${incidentId}-item-${index}`,
        completed: false,
        timestamp: undefined,
        completedBy: undefined,
      }));

      return {
        checklists: {
          ...state.checklists,
          [incidentId]: resetItems,
        },
      };
    });
  },

  /**
   * Add a custom item to a checklist
   */
  addCustomItem: (
    incidentId: string,
    item: Omit<ChecklistItem, "id" | "completed">,
  ) => {
    set((state) => {
      const checklist = state.checklists[incidentId] || [];
      const newItem: ChecklistItem = {
        ...item,
        id: `${incidentId}-custom-${Date.now()}`,
        completed: false,
      };

      return {
        checklists: {
          ...state.checklists,
          [incidentId]: [...checklist, newItem],
        },
      };
    });
  },

  /**
   * Remove an item from a checklist
   */
  removeItem: (incidentId: string, itemId: string) => {
    set((state) => {
      const checklist = state.checklists[incidentId];
      if (!checklist) return state;

      return {
        checklists: {
          ...state.checklists,
          [incidentId]: checklist.filter((item) => item.id !== itemId),
        },
      };
    });
  },
}));
