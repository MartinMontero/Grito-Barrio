/**
 * Resources Slice
 * Protocolo CDMX - Zustand Store
 *
 * Manages safe points, contacts, and supplies for incident response
 */

import type { StateCreator } from "zustand";
import type {
  SafePoint,
  SupplyItem,
  ContactTree,
  UserRole,
  SafePointType,
  SupplyCategory,
} from "@/types";
import {
  getCurrentTimestamp,
  updateInArray,
  findById,
  persistToIndexedDB,
} from "@/lib/store-helpers";

// =============================================================================
// TYPES
// =============================================================================

export interface ResourcesState {
  safePoints: SafePoint[];
  contacts: ContactTree[];
  supplies: SupplyItem[];
  lastUpdated: string;
}

export interface ResourcesSlice {
  // State
  safePoints: SafePoint[];
  contacts: ContactTree[];
  supplies: SupplyItem[];
  lastUpdated: string;

  // Safe Point Actions
  addSafePoint: (point: Omit<SafePoint, "id" | "lastVerified">) => string;
  updateSafePoint: (id: string, updates: Partial<SafePoint>) => void;
  removeSafePoint: (id: string) => void;
  getSafePointById: (id: string) => SafePoint | undefined;
  getSafePointsByType: (type: SafePointType) => SafePoint[];
  getAvailableSafePoints: () => SafePoint[];
  getNearbySafePoints: (
    coordinates: { latitude: number; longitude: number },
    radiusKm: number,
  ) => SafePoint[];
  verifySafePoint: (id: string) => void;
  toggleSafePointAvailability: (id: string) => void;

  // Contact Actions
  addContact: (
    contact: Omit<ContactTree, "priority"> & { priority: 1 | 2 | 3 | 4 | 5 },
  ) => void;
  updateContact: (id: string, updates: Partial<ContactTree>) => void;
  removeContact: (id: string) => void;
  getContactById: (id: string) => ContactTree | undefined;
  getContactsByRole: (role: UserRole) => ContactTree[];
  getContactsByPriority: (priority: number) => ContactTree[];
  getEmergencyContacts: () => ContactTree[];
  reorderContactsByPriority: () => void;

  // Supply Actions
  addSupply: (item: Omit<SupplyItem, "id">) => void;
  updateSupply: (name: string, updates: Partial<SupplyItem>) => void;
  removeSupply: (name: string) => void;
  getSupplyByName: (name: string) => SupplyItem | undefined;
  getSuppliesByCategory: (category: SupplyCategory) => SupplyItem[];
  getLowStockSupplies: (threshold?: number) => SupplyItem[];
  updateSupplyQuantity: (name: string, quantity: number) => void;
  consumeSupply: (name: string, amount: number) => void;
  restockSupply: (name: string, amount: number) => void;

  // General Actions
  exportResources: () => ResourcesState;
  importResources: (data: ResourcesState) => void;
  getResourceStats: () => {
    totalSafePoints: number;
    availableSafePoints: number;
    totalContacts: number;
    totalSupplies: number;
    lowStockItems: number;
  };
}

// =============================================================================
// DEFAULT DATA
// =============================================================================

const defaultSafePoints: SafePoint[] = [
  {
    id: "sp-1",
    name: "Centro Comunitario Santa María",
    type: "community_center",
    address: "Calle de la Resistencia 123, Col. Centro",
    coordinates: { latitude: 19.4326, longitude: -99.1332 },
    capacity: 50,
    accessibility: {
      wheelchairAccessible: true,
      groundFloor: true,
      hasRestroom: true,
      publicTransportNearby: true,
    },
    contact: {
      pseudonym: "coordinador1",
      secureContact: "signal:centro.comunitario",
    },
    accessAgreement: true,
    hours: "24 horas",
    notes: "Acceso por callejón lateral",
    lastVerified: new Date().toISOString(),
    available: true,
  },
];

const defaultContacts: ContactTree[] = [
  {
    name: "Coordinador General",
    role: "coordinator",
    phone: "signal:coordinador.cdmx",
    availability: "24/7",
    priority: 1,
    responseTime: "5 minutos",
  },
  {
    name: "Abogado de Guardia",
    role: "legal",
    phone: "signal:abogado.cdmx",
    email: "legal@protocolo.cdmx",
    availability: "L-V 8:00-20:00",
    priority: 2,
    responseTime: "15 minutos",
  },
  {
    name: "Médico de Emergencia",
    role: "medical_volunteer",
    phone: "signal:medico.cdmx",
    availability: "24/7",
    priority: 2,
    responseTime: "20 minutos",
  },
];

const defaultSupplies: SupplyItem[] = [
  {
    name: "Kit de Primeros Auxilios",
    category: "medical",
    quantity: 10,
    unit: "unidades",
    priority: "high",
  },
  {
    name: "Agua Embotellada",
    category: "water",
    quantity: 100,
    unit: "litros",
    priority: "high",
  },
  {
    name: "Alimentos No Perecederos",
    category: "food",
    quantity: 50,
    unit: "raciones",
    priority: "medium",
  },
  {
    name: "Cobijas",
    category: "shelter",
    quantity: 30,
    unit: "unidades",
    priority: "medium",
  },
  {
    name: "Cargadores Portátiles",
    category: "communication",
    quantity: 15,
    unit: "unidades",
    priority: "high",
  },
];

// =============================================================================
// INITIAL STATE
// =============================================================================

type ResourcesActions =
  | "addSafePoint"
  | "updateSafePoint"
  | "removeSafePoint"
  | "getSafePointById"
  | "getSafePointsByType"
  | "getAvailableSafePoints"
  | "getNearbySafePoints"
  | "verifySafePoint"
  | "toggleSafePointAvailability"
  | "addContact"
  | "updateContact"
  | "removeContact"
  | "getContactById"
  | "getContactsByRole"
  | "getContactsByPriority"
  | "getEmergencyContacts"
  | "reorderContactsByPriority"
  | "addSupply"
  | "updateSupply"
  | "removeSupply"
  | "getSupplyByName"
  | "getSuppliesByCategory"
  | "getLowStockSupplies"
  | "updateSupplyQuantity"
  | "consumeSupply"
  | "restockSupply"
  | "exportResources"
  | "importResources"
  | "getResourceStats";

const initialResourcesState: Omit<ResourcesSlice, ResourcesActions> = {
  safePoints: defaultSafePoints,
  contacts: defaultContacts,
  supplies: defaultSupplies,
  lastUpdated: getCurrentTimestamp(),
};

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createResourcesSlice: StateCreator<
  ResourcesSlice,
  [],
  [],
  ResourcesSlice
> = persistToIndexedDB<ResourcesSlice>(
  "protocolo-resources",
  false,
)((set, get) => ({
  ...initialResourcesState,

  /**
   * Add a new safe point
   */
  addSafePoint: (point: Omit<SafePoint, "id" | "lastVerified">): string => {
    const id = `sp-${Date.now()}`;
    const newPoint: SafePoint = {
      ...point,
      id,
      lastVerified: getCurrentTimestamp(),
    };

    set((state) => ({
      safePoints: [...state.safePoints, newPoint],
      lastUpdated: getCurrentTimestamp(),
    }));

    return id;
  },

  /**
   * Update a safe point
   */
  updateSafePoint: (id: string, updates: Partial<SafePoint>) => {
    set((state) => ({
      safePoints: updateInArray(state.safePoints, id, updates),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Remove a safe point
   */
  removeSafePoint: (id: string) => {
    set((state) => ({
      safePoints: state.safePoints.filter((sp) => sp.id !== id),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Get safe point by ID
   */
  getSafePointById: (id: string): SafePoint | undefined => {
    return findById(get().safePoints, id);
  },

  /**
   * Get safe points by type
   */
  getSafePointsByType: (type: SafePointType): SafePoint[] => {
    return get().safePoints.filter((sp) => sp.type === type);
  },

  /**
   * Get currently available safe points
   */
  getAvailableSafePoints: (): SafePoint[] => {
    return get().safePoints.filter((sp) => sp.available);
  },

  /**
   * Get safe points within radius of coordinates
   */
  getNearbySafePoints: (
    coordinates: { latitude: number; longitude: number },
    radiusKm: number,
  ): SafePoint[] => {
    return get().safePoints.filter((sp) => {
      const distance = calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        sp.coordinates.latitude,
        sp.coordinates.longitude,
      );
      return distance <= radiusKm && sp.available;
    });
  },

  /**
   * Mark safe point as verified
   */
  verifySafePoint: (id: string) => {
    set((state) => ({
      safePoints: state.safePoints.map((sp) =>
        sp.id === id ? { ...sp, lastVerified: getCurrentTimestamp() } : sp,
      ),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Toggle safe point availability
   */
  toggleSafePointAvailability: (id: string) => {
    set((state) => ({
      safePoints: state.safePoints.map((sp) =>
        sp.id === id ? { ...sp, available: !sp.available } : sp,
      ),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Add a new contact
   */
  addContact: (
    contact: Omit<ContactTree, "priority"> & { priority: 1 | 2 | 3 | 4 | 5 },
  ) => {
    set((state) => ({
      contacts: [...state.contacts, contact],
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Update a contact
   */
  updateContact: (id: string, updates: Partial<ContactTree>) => {
    set((state) => ({
      contacts: state.contacts.map((c, index) =>
        index.toString() === id ? { ...c, ...updates } : c,
      ),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Remove a contact
   */
  removeContact: (id: string) => {
    set((state) => ({
      contacts: state.contacts.filter((_, index) => index.toString() !== id),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Get contact by ID (index)
   */
  getContactById: (id: string): ContactTree | undefined => {
    return get().contacts[parseInt(id)];
  },

  /**
   * Get contacts filtered by role
   */
  getContactsByRole: (role: UserRole): ContactTree[] => {
    return get().contacts.filter((c) => c.role === role);
  },

  /**
   * Get contacts by priority level
   */
  getContactsByPriority: (priority: number): ContactTree[] => {
    return get().contacts.filter((c) => c.priority === priority);
  },

  /**
   * Get emergency contacts (priority 1-2)
   */
  getEmergencyContacts: (): ContactTree[] => {
    return get().contacts.filter((c) => c.priority <= 2);
  },

  /**
   * Reorder contacts by priority
   */
  reorderContactsByPriority: () => {
    set((state) => ({
      contacts: [...state.contacts].sort((a, b) => a.priority - b.priority),
    }));
  },

  /**
   * Add a new supply item
   */
  addSupply: (item: Omit<SupplyItem, "id">) => {
    set((state) => ({
      supplies: [...state.supplies, item],
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Update a supply item
   */
  updateSupply: (name: string, updates: Partial<SupplyItem>) => {
    set((state) => ({
      supplies: state.supplies.map((s) =>
        s.name === name ? { ...s, ...updates } : s,
      ),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Remove a supply item
   */
  removeSupply: (name: string) => {
    set((state) => ({
      supplies: state.supplies.filter((s) => s.name !== name),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Get supply by name
   */
  getSupplyByName: (name: string): SupplyItem | undefined => {
    return get().supplies.find((s) => s.name === name);
  },

  /**
   * Get supplies by category
   */
  getSuppliesByCategory: (category: SupplyCategory): SupplyItem[] => {
    return get().supplies.filter((s) => s.category === category);
  },

  /**
   * Get supplies with low stock
   */
  getLowStockSupplies: (threshold: number = 10): SupplyItem[] => {
    return get().supplies.filter((s) => s.quantity <= threshold);
  },

  /**
   * Update supply quantity
   */
  updateSupplyQuantity: (name: string, quantity: number) => {
    set((state) => ({
      supplies: state.supplies.map((s) =>
        s.name === name ? { ...s, quantity: Math.max(0, quantity) } : s,
      ),
      lastUpdated: getCurrentTimestamp(),
    }));
  },

  /**
   * Consume (reduce) supply quantity
   */
  consumeSupply: (name: string, amount: number) => {
    const supply = get().getSupplyByName(name);
    if (supply) {
      get().updateSupplyQuantity(name, supply.quantity - amount);
    }
  },

  /**
   * Restock (increase) supply quantity
   */
  restockSupply: (name: string, amount: number) => {
    const supply = get().getSupplyByName(name);
    if (supply) {
      get().updateSupplyQuantity(name, supply.quantity + amount);
    }
  },

  /**
   * Export all resources
   */
  exportResources: (): ResourcesState => {
    return {
      safePoints: get().safePoints,
      contacts: get().contacts,
      supplies: get().supplies,
      lastUpdated: getCurrentTimestamp(),
    };
  },

  /**
   * Import resources from exported data
   */
  importResources: (data: ResourcesState) => {
    set({
      safePoints: data.safePoints || [],
      contacts: data.contacts || [],
      supplies: data.supplies || [],
      lastUpdated: getCurrentTimestamp(),
    });
  },

  /**
   * Get resource statistics
   */
  getResourceStats: () => {
    const state = get();
    return {
      totalSafePoints: state.safePoints.length,
      availableSafePoints: state.safePoints.filter((sp) => sp.available).length,
      totalContacts: state.contacts.length,
      totalSupplies: state.supplies.length,
      lowStockItems: state.getLowStockSupplies().length,
    };
  },
}));

// =============================================================================
// HELPER FUNCTION
// =============================================================================

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
