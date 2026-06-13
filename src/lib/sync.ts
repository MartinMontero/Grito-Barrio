/**
 * Sync Logic
 * Protocolo CDMX
 *
 * Offline-first synchronization with queue management,
 * conflict resolution, and retry logic
 */

import { db, type StoreName } from "./db";
import { storage } from "./storage";

// =============================================================================
// TYPES
// =============================================================================

export type SyncActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "UPLOAD_FILE"
  | "DOWNLOAD_FILE";

export type SyncStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "retrying";

export interface SyncAction {
  id: string;
  type: SyncActionType;
  store: StoreName;
  data: unknown;
  originalId?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: SyncStatus;
  priority: number; // 1 = highest, 10 = lowest
  error?: string;
  lastAttempt?: number;
  dependencies?: string[]; // IDs of actions that must complete first
}

export interface SyncResult {
  actionId: string;
  success: boolean;
  serverData?: unknown;
  error?: string;
  timestamp: number;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  retryDelay: number;
  maxRetries: number;
  batchSize: number;
  conflictResolution: "server_wins" | "client_wins" | "manual";
  priorityRules: Record<SyncActionType, number>;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
  syncProgress: number; // 0-100
  currentAction?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  retryDelay: 5000, // 5 seconds
  maxRetries: 5,
  batchSize: 10,
  conflictResolution: "manual",
  priorityRules: {
    CREATE: 1,
    UPDATE: 2,
    DELETE: 1,
    UPLOAD_FILE: 3,
    DOWNLOAD_FILE: 4,
  },
};

const SYNC_STATE_KEY = "sync_state";
const SYNC_QUEUE_KEY = "sync_queue";

// =============================================================================
// SYNC QUEUE MANAGER
// =============================================================================

class SyncQueue {
  private actions: Map<string, SyncAction> = new Map();
  private listeners: Set<(actions: SyncAction[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add an action to the queue
   */
  add(
    action: Omit<SyncAction, "id" | "timestamp" | "retryCount" | "status">,
  ): string {
    const id = this.generateId();
    const fullAction: SyncAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
      priority:
        action.priority || DEFAULT_CONFIG.priorityRules[action.type] || 5,
    };

    this.actions.set(id, fullAction);
    this.persist();
    this.notifyListeners();

    console.log(`[Sync] Added action ${id}: ${action.type} on ${action.store}`);
    return id;
  }

  /**
   * Get all pending actions sorted by priority
   */
  getPending(): SyncAction[] {
    return Array.from(this.actions.values())
      .filter((a) => a.status === "pending" || a.status === "retrying")
      .sort((a, b) => {
        // Sort by priority first
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then by timestamp
        return a.timestamp - b.timestamp;
      });
  }

  /**
   * Get actions that are ready to sync (dependencies met)
   */
  getReadyToSync(): SyncAction[] {
    const pending = this.getPending();
    const completedIds = new Set(
      Array.from(this.actions.values())
        .filter((a) => a.status === "completed")
        .map((a) => a.id),
    );

    return pending.filter((action) => {
      if (!action.dependencies) return true;
      return action.dependencies.every((depId) => completedIds.has(depId));
    });
  }

  /**
   * Get next batch of actions to sync
   */
  getBatch(size: number = DEFAULT_CONFIG.batchSize): SyncAction[] {
    return this.getReadyToSync().slice(0, size);
  }

  /**
   * Update action status
   */
  updateStatus(id: string, status: SyncStatus, error?: string): void {
    const action = this.actions.get(id);
    if (action) {
      action.status = status;
      action.lastAttempt = Date.now();

      if (status === "failed") {
        action.retryCount++;
        action.error = error;

        // Auto-retry if under max retries
        if (action.retryCount < action.maxRetries) {
          action.status = "retrying";
        }
      }

      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Mark action as completed
   */
  complete(id: string, serverData?: unknown): void {
    const action = this.actions.get(id);
    if (action) {
      action.status = "completed";
      action.error = undefined;

      // Update local data with server data if provided
      if (serverData) {
        db.put(action.store, serverData).catch(console.error);
      }

      this.persist();
      this.notifyListeners();
      console.log(`[Sync] Completed action ${id}`);
    }
  }

  /**
   * Remove a completed action
   */
  remove(id: string): boolean {
    const deleted = this.actions.delete(id);
    if (deleted) {
      this.persist();
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * Clear all completed actions
   */
  clearCompleted(): number {
    let count = 0;
    for (const [id, action] of this.actions) {
      if (action.status === "completed") {
        this.actions.delete(id);
        count++;
      }
    }

    if (count > 0) {
      this.persist();
      this.notifyListeners();
    }

    return count;
  }

  /**
   * Get count of pending actions
   */
  getPendingCount(): number {
    return Array.from(this.actions.values()).filter(
      (a) => a.status === "pending" || a.status === "retrying",
    ).length;
  }

  /**
   * Get count of failed actions
   */
  getFailedCount(): number {
    return Array.from(this.actions.values()).filter(
      (a) => a.status === "failed",
    ).length;
  }

  /**
   * Get action by ID
   */
  get(id: string): SyncAction | undefined {
    return this.actions.get(id);
  }

  /**
   * Get all actions
   */
  getAll(): SyncAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback: (actions: SyncAction[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getAll());

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Clear all actions
   */
  clear(): void {
    this.actions.clear();
    this.persist();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const actions = this.getAll();
    this.listeners.forEach((cb) => cb(actions));
  }

  private persist(): void {
    storage.session.set(SYNC_QUEUE_KEY, Array.from(this.actions.entries()));
  }

  private loadFromStorage(): void {
    const stored = storage.session.get<[string, SyncAction][]>(SYNC_QUEUE_KEY);
    if (stored) {
      this.actions = new Map(stored);
    }
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// SYNC ENGINE
// =============================================================================

class SyncEngine {
  private queue: SyncQueue;
  private config: SyncConfig;
  private state: SyncState;
  private syncInterval: number | null = null;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private isDestroyed = false;

  constructor(config: Partial<SyncConfig> = {}) {
    this.queue = new SyncQueue();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSyncTime: null,
      pendingCount: 0,
      failedCount: 0,
      syncProgress: 0,
    };

    this.setupOnlineDetection();
    this.updateState();
  }

  /**
   * Initialize sync engine
   */
  async init(): Promise<void> {
    // Load persisted state
    const persistedState =
      storage.local.get<Partial<SyncState>>(SYNC_STATE_KEY);
    if (persistedState) {
      this.state = { ...this.state, ...persistedState };
    }

    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    console.log("[Sync] Engine initialized");
  }

  /**
   * Destroy sync engine
   */
  destroy(): void {
    this.isDestroyed = true;
    this.stopAutoSync();
    this.listeners.clear();
  }

  /**
   * Queue a create action
   */
  queueCreate(store: StoreName, data: unknown, priority?: number): string {
    return this.queue.add({
      type: "CREATE",
      store,
      data,
      priority: priority ?? 5,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Queue an update action
   */
  queueUpdate(
    store: StoreName,
    id: string,
    data: unknown,
    priority?: number,
  ): string {
    return this.queue.add({
      type: "UPDATE",
      store,
      data: { ...(data as object), id },
      originalId: id,
      priority: priority ?? 5,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Queue a delete action
   */
  queueDelete(store: StoreName, id: string, priority?: number): string {
    return this.queue.add({
      type: "DELETE",
      store,
      data: { id },
      originalId: id,
      priority: priority ?? 5,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<SyncResult[]> {
    if (this.state.isSyncing || !this.state.isOnline) {
      return [];
    }

    this.state.isSyncing = true;
    this.updateState();

    const batch = this.queue.getBatch(this.config.batchSize);
    const results: SyncResult[] = [];

    console.log(`[Sync] Starting sync of ${batch.length} items`);

    for (let i = 0; i < batch.length; i++) {
      if (this.isDestroyed) break;

      const action = batch[i];
      this.state.currentAction = action.id;
      this.state.syncProgress = Math.round((i / batch.length) * 100);
      this.updateState();

      try {
        const result = await this.executeAction(action);
        results.push(result);

        if (result.success) {
          this.queue.complete(action.id, result.serverData);
        } else {
          this.queue.updateStatus(action.id, "failed", result.error);
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        this.queue.updateStatus(action.id, "failed", errorMsg);
        results.push({
          actionId: action.id,
          success: false,
          error: errorMsg,
          timestamp: Date.now(),
        });
      }

      // Wait between actions to avoid overwhelming the server
      if (i < batch.length - 1) {
        await this.delay(100);
      }
    }

    this.state.isSyncing = false;
    this.state.currentAction = undefined;
    this.state.syncProgress = 0;
    this.state.lastSyncTime = Date.now();
    this.updateState();

    // Clear completed actions
    this.queue.clearCompleted();

    console.log(
      `[Sync] Completed. Success: ${results.filter((r) => r.success).length}/${results.length}`,
    );

    return results;
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: SyncState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart auto-sync if interval changed
    if (config.syncInterval !== undefined || config.autoSync !== undefined) {
      this.stopAutoSync();
      if (this.config.autoSync) {
        this.startAutoSync();
      }
    }
  }

  /**
   * Start auto-sync
   */
  startAutoSync(): void {
    this.stopAutoSync();

    this.syncInterval = window.setInterval(() => {
      if (
        this.state.isOnline &&
        !this.state.isSyncing &&
        this.queue.getPendingCount() > 0
      ) {
        this.sync();
      }
    }, this.config.syncInterval);

    console.log(`[Sync] Auto-sync started (${this.config.syncInterval}ms)`);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("[Sync] Auto-sync stopped");
    }
  }

  /**
   * Retry failed actions
   */
  async retryFailed(): Promise<void> {
    const failed = this.queue.getAll().filter((a) => a.status === "failed");

    for (const action of failed) {
      this.queue.updateStatus(action.id, "pending");
    }

    if (failed.length > 0) {
      console.log(`[Sync] Retrying ${failed.length} failed actions`);
      await this.sync();
    }
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.queue.clear();
    this.updateState();
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async executeAction(action: SyncAction): Promise<SyncResult> {
    // This would normally make an API call
    // For now, simulate success with a delay
    await this.delay(500 + Math.random() * 500);

    // Simulate random failures for testing
    if (Math.random() < 0.1) {
      throw new Error("Simulated network error");
    }

    // Mock server response
    const serverData = {
      ...(action.data as Record<string, unknown>),
      syncedAt: new Date().toISOString(),
      serverId: `server_${Date.now()}`,
    };

    return {
      actionId: action.id,
      success: true,
      serverData,
      timestamp: Date.now(),
    };
  }

  private setupOnlineDetection(): void {
    window.addEventListener("online", () => {
      this.state.isOnline = true;
      this.updateState();

      // Auto-sync when coming back online
      if (this.config.autoSync && this.queue.getPendingCount() > 0) {
        this.sync();
      }
    });

    window.addEventListener("offline", () => {
      this.state.isOnline = false;
      this.updateState();
    });
  }

  private updateState(): void {
    this.state.pendingCount = this.queue.getPendingCount();
    this.state.failedCount = this.queue.getFailedCount();

    // Persist state
    storage.local.set(SYNC_STATE_KEY, {
      lastSyncTime: this.state.lastSyncTime,
      isOnline: this.state.isOnline,
    });

    // Notify listeners
    this.listeners.forEach((cb) => cb({ ...this.state }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// CONFLICT RESOLUTION
// =============================================================================

export class ConflictResolver {
  /**
   * Resolve a conflict between client and server data
   */
  static resolve(
    clientData: unknown,
    serverData: unknown,
    strategy: SyncConfig["conflictResolution"],
    timestamp?: number,
  ): { winner: "client" | "server"; data: unknown } {
    switch (strategy) {
      case "server_wins":
        return { winner: "server", data: serverData };

      case "client_wins":
        return { winner: "client", data: clientData };

      case "manual":
      default:
        // For manual resolution, mark for review
        return {
          winner: "server",
          data: {
            ...(serverData as Record<string, unknown>),
            _conflict: {
              clientData,
              timestamp: timestamp || Date.now(),
              needsResolution: true,
            },
          },
        };
    }
  }

  /**
   * Merge data from both sources
   */
  static merge(
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>,
  ): Record<string, unknown> {
    const merged = { ...serverData };

    for (const [key, value] of Object.entries(clientData)) {
      if (!(key in serverData)) {
        merged[key] = value;
      } else if (JSON.stringify(value) !== JSON.stringify(serverData[key])) {
        // If values differ, keep the more recent one
        const clientTime = (clientData.updatedAt as string) || "";
        const serverTime = (serverData.updatedAt as string) || "";

        if (clientTime > serverTime) {
          merged[key] = value;
        }
      }
    }

    merged._merged = true;
    merged._mergedAt = new Date().toISOString();

    return merged;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const syncQueue = new SyncQueue();
export const syncEngine = new SyncEngine();

export function initSync(): Promise<void> {
  return syncEngine.init();
}

export function queueAction(
  type: SyncActionType,
  store: StoreName,
  data: unknown,
  priority?: number,
): string {
  return syncQueue.add({
    type,
    store,
    data,
    priority: priority ?? 5,
    maxRetries: DEFAULT_CONFIG.maxRetries,
  });
}

export default {
  engine: syncEngine,
  queue: syncQueue,
  init: initSync,
  ConflictResolver,
};
