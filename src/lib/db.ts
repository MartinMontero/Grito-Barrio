/**
 * IndexedDB Wrapper
 * Protocolo CDMX
 *
 * Comprehensive IndexedDB abstraction layer with encryption support
 * for offline-first data persistence
 */

import { encryptData, decryptData } from "./encryption";
import { getDataKey, isVaultInitialized } from "./vault";

// =============================================================================
// TYPES
// =============================================================================

export type StoreName =
  | "incidents"
  | "documentation"
  | "safePoints"
  | "contacts"
  | "checklists"
  | "users"
  | "settings"
  | "syncQueue"
  | "backups";

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: StoreName;
  keyPath: string;
  indexes?: IndexConfig[];
  encrypted?: boolean;
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  unique?: boolean;
  multiEntry?: boolean;
}

export interface QueryOptions {
  index?: string;
  range?: IDBKeyRange;
  direction?: IDBCursorDirection;
  limit?: number;
  offset?: number;
}

export interface DBOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  retryable?: boolean;
}

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

const DB_NAME = "ProtocoloCDMX";
const DB_VERSION = 1;

const STORE_CONFIGS: StoreConfig[] = [
  {
    name: "incidents",
    keyPath: "id",
    encrypted: true,
    indexes: [
      { name: "timestamp", keyPath: "timestamp" },
      { name: "status", keyPath: "status" },
      { name: "threatLevel", keyPath: "threatLevel" },
      { name: "location", keyPath: "location.colonia" },
    ],
  },
  {
    name: "documentation",
    keyPath: "id",
    encrypted: true,
    indexes: [
      { name: "incidentId", keyPath: "incidentId" },
      { name: "timestamp", keyPath: "timestamp" },
      { name: "type", keyPath: "type" },
    ],
  },
  {
    name: "safePoints",
    keyPath: "id",
    indexes: [
      { name: "alcaldia", keyPath: "alcaldia" },
      { name: "active", keyPath: "isActive" },
    ],
  },
  {
    name: "contacts",
    keyPath: "id",
    indexes: [
      { name: "role", keyPath: "role" },
      { name: "priority", keyPath: "priority" },
      { name: "available", keyPath: "isAvailable" },
    ],
  },
  {
    name: "checklists",
    keyPath: "id",
    indexes: [
      { name: "incidentId", keyPath: "incidentId" },
      { name: "phase", keyPath: "phase" },
    ],
  },
  {
    name: "users",
    keyPath: "pseudonym",
    encrypted: true,
    indexes: [
      { name: "role", keyPath: "role" },
      { name: "certification", keyPath: "certificationLevel" },
    ],
  },
  {
    name: "settings",
    keyPath: "key",
    indexes: [],
  },
  {
    name: "syncQueue",
    keyPath: "id",
    indexes: [
      { name: "timestamp", keyPath: "timestamp" },
      { name: "status", keyPath: "status" },
      { name: "priority", keyPath: "priority" },
    ],
  },
  {
    name: "backups",
    keyPath: "id",
    indexes: [
      { name: "timestamp", keyPath: "timestamp" },
      { name: "type", keyPath: "type" },
    ],
  },
];

// =============================================================================
// DATABASE CLASS
// =============================================================================

class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.isInitializing) {
      return this.initPromise!;
    }

    this.isInitializing = true;
    this.initPromise = this.doInit();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async doInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;

        // Handle database errors
        this.db.onerror = (event) => {
          console.error("Database error:", (event.target as IDBRequest).error);
        };

        // Handle version changes from other tabs
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
          console.warn(
            "Database version changed in another tab. Please reload.",
          );
        };

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  /**
   * Create all object stores and indexes
   */
  private createStores(db: IDBDatabase): void {
    for (const config of STORE_CONFIGS) {
      // Delete existing store if it exists
      if (db.objectStoreNames.contains(config.name)) {
        db.deleteObjectStore(config.name);
      }

      // Create store
      const store = db.createObjectStore(config.name, {
        keyPath: config.keyPath,
      });

      // Create indexes
      for (const index of config.indexes || []) {
        store.createIndex(index.name, index.keyPath, {
          unique: index.unique || false,
          multiEntry: index.multiEntry || false,
        });
      }
    }

    console.log(
      `[DB] Database v${DB_VERSION} initialized with ${STORE_CONFIGS.length} stores`,
    );
  }

  /**
   * Get a single item by ID
   */
  async get<T>(
    storeName: StoreName,
    id: string | number,
  ): Promise<DBOperationResult<T>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = async () => {
          if (!request.result) {
            resolve({ success: true, data: undefined });
            return;
          }

          const data = await this.decryptIfNeeded(storeName, request.result);
          resolve({ success: true, data: data as T });
        };

        request.onerror = () => {
          reject(new Error(`Failed to get item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(
    storeName: StoreName,
    options?: QueryOptions,
  ): Promise<DBOperationResult<T[]>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);

        let request: IDBRequest;

        if (options?.index) {
          const index = store.index(options.index);
          request = options.range
            ? index.openCursor(options.range, options.direction)
            : index.openCursor(null, options.direction);
        } else {
          request = store.openCursor(null, options?.direction);
        }

        const results: T[] = [];
        let skipped = 0;
        let count = 0;

        request.onsuccess = async (event) => {
          const cursor = (event.target as IDBRequest)
            .result as IDBCursorWithValue;

          if (cursor) {
            // Handle offset
            if (options?.offset && skipped < options.offset) {
              skipped++;
              cursor.continue();
              return;
            }

            // Handle limit
            if (options?.limit && count >= options.limit) {
              resolve({ success: true, data: results });
              return;
            }

            const data = await this.decryptIfNeeded(storeName, cursor.value);
            results.push(data as T);
            count++;
            cursor.continue();
          } else {
            resolve({ success: true, data: results });
          }
        };

        request.onerror = () => {
          reject(
            new Error(`Failed to get all items: ${request.error?.message}`),
          );
        };
      });
    });
  }

  /**
   * Get items by index value
   */
  async getByIndex<T>(
    storeName: StoreName,
    indexName: string,
    value: IDBValidKey | IDBKeyRange,
    options?: QueryOptions,
  ): Promise<DBOperationResult<T[]>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);

        const request = index.openCursor(value, options?.direction);

        const results: T[] = [];
        let skipped = 0;
        let count = 0;

        request.onsuccess = async (event) => {
          const cursor = (event.target as IDBRequest)
            .result as IDBCursorWithValue;

          if (cursor) {
            if (options?.offset && skipped < options.offset) {
              skipped++;
              cursor.continue();
              return;
            }

            if (options?.limit && count >= options.limit) {
              resolve({ success: true, data: results });
              return;
            }

            const data = await this.decryptIfNeeded(storeName, cursor.value);
            results.push(data as T);
            count++;
            cursor.continue();
          } else {
            resolve({ success: true, data: results });
          }
        };

        request.onerror = () => {
          reject(
            new Error(
              `Failed to get items by index: ${request.error?.message}`,
            ),
          );
        };
      });
    });
  }

  /**
   * Add or update an item
   */
  async put<T>(storeName: StoreName, item: T): Promise<DBOperationResult<T>> {
    return this.withRetry(async () => {
      await this.init();

      const encryptedItem = await this.encryptIfNeeded(storeName, item);

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(encryptedItem);

        request.onsuccess = () => {
          resolve({ success: true, data: item });
        };

        request.onerror = () => {
          reject(new Error(`Failed to put item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * Add multiple items in a batch
   */
  async putBatch<T>(
    storeName: StoreName,
    items: T[],
  ): Promise<DBOperationResult<number>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);

        let completed = 0;
        let failed = 0;

        transaction.oncomplete = () => {
          resolve({
            success: failed === 0,
            data: completed,
            error:
              failed > 0
                ? new Error(`${failed} items failed to save`)
                : undefined,
          });
        };

        transaction.onerror = () => {
          reject(
            new Error(`Batch operation failed: ${transaction.error?.message}`),
          );
        };

        for (const item of items) {
          this.encryptIfNeeded(storeName, item).then((encryptedItem) => {
            const request = store.put(encryptedItem);

            request.onsuccess = () => {
              completed++;
            };

            request.onerror = () => {
              failed++;
              console.error("Failed to save item:", request.error);
            };
          });
        }
      });
    });
  }

  /**
   * Delete an item by ID
   */
  async delete(
    storeName: StoreName,
    id: string | number,
  ): Promise<DBOperationResult<void>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          reject(new Error(`Failed to delete item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * Delete multiple items by ID
   */
  async deleteBatch(
    storeName: StoreName,
    ids: (string | number)[],
  ): Promise<DBOperationResult<number>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);

        let completed = 0;
        let failed = 0;

        transaction.oncomplete = () => {
          resolve({
            success: failed === 0,
            data: completed,
            error:
              failed > 0
                ? new Error(`${failed} items failed to delete`)
                : undefined,
          });
        };

        transaction.onerror = () => {
          reject(
            new Error(`Batch delete failed: ${transaction.error?.message}`),
          );
        };

        for (const id of ids) {
          const request = store.delete(id);

          request.onsuccess = () => {
            completed++;
          };

          request.onerror = () => {
            failed++;
            console.error("Failed to delete item:", request.error);
          };
        }
      });
    });
  }

  /**
   * Clear all items from a store
   */
  async clear(storeName: StoreName): Promise<DBOperationResult<void>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          reject(new Error(`Failed to clear store: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * Count items in a store
   */
  async count(
    storeName: StoreName,
    keyRange?: IDBKeyRange,
  ): Promise<DBOperationResult<number>> {
    return this.withRetry(async () => {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = keyRange ? store.count(keyRange) : store.count();

        request.onsuccess = () => {
          resolve({ success: true, data: request.result });
        };

        request.onerror = () => {
          reject(new Error(`Failed to count items: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * Export all data from the database
   */
  async exportAll(): Promise<DBOperationResult<Record<string, unknown[]>>> {
    return this.withRetry(async () => {
      await this.init();

      const exportData: Record<string, unknown[]> = {};

      for (const config of STORE_CONFIGS) {
        const result = await this.getAll(config.name);
        if (result.success) {
          exportData[config.name] = result.data || [];
        }
      }

      return { success: true, data: exportData };
    });
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<
    DBOperationResult<{
      stores: Record<string, { count: number; size: number }>;
      totalSize: number;
    }>
  > {
    return this.withRetry(async () => {
      await this.init();

      const stats: Record<string, { count: number; size: number }> = {};
      let totalSize = 0;

      for (const config of STORE_CONFIGS) {
        const countResult = await this.count(config.name);
        const allResult = await this.getAll(config.name);

        const count = countResult.data || 0;
        const items = allResult.data || [];
        const size = new Blob([JSON.stringify(items)]).size;

        stats[config.name] = { count, size };
        totalSize += size;
      }

      return {
        success: true,
        data: { stores: stats, totalSize },
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("[DB] Database connection closed");
    }
  }

  /**
   * Delete the entire database
   */
  async deleteDatabase(): Promise<DBOperationResult<void>> {
    this.close();

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        resolve({ success: true });
      };

      request.onerror = () => {
        reject(
          new Error(`Failed to delete database: ${request.error?.message}`),
        );
      };

      request.onblocked = () => {
        reject(
          new Error("Database deletion blocked. Close all tabs and try again."),
        );
      };
    });
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Encrypt a record destined for an "encrypted" store. The stored shape is
   * ONLY `{ [keyPath]: key, __encrypted: ciphertext }` — no plaintext fields
   * are ever written, so seizing the IndexedDB profile yields only ciphertext.
   * Fails closed: if the vault is locked we refuse to write plaintext.
   */
  private async encryptIfNeeded<T>(storeName: StoreName, item: T): Promise<T> {
    const config = STORE_CONFIGS.find((c) => c.name === storeName);
    if (!config?.encrypted) return item;

    const dek = getDataKey();
    if (dek) {
      const encrypted = await encryptData(JSON.stringify(item));
      const keyPath = config.keyPath;
      const keyValue = (item as Record<string, unknown>)[keyPath];
      return { [keyPath]: keyValue, __encrypted: encrypted } as unknown as T;
    }

    if (isVaultInitialized()) {
      throw new Error(
        `[db] Vault locked; refusing to write plaintext to encrypted store "${storeName}".`,
      );
    }

    // No vault configured yet — encryption not enabled (disclosed in the UI).
    return item;
  }

  private async decryptIfNeeded<T>(storeName: StoreName, item: T): Promise<T> {
    const config = STORE_CONFIGS.find((c) => c.name === storeName);
    const encryptedItem = item as unknown as { __encrypted?: string };

    if (config?.encrypted && encryptedItem.__encrypted) {
      const dek = getDataKey();
      // Locked: cannot decrypt. Return the ciphertext envelope as-is (callers
      // such as backup re-store it unchanged); never expose plaintext.
      if (!dek) return item;
      const decrypted = await decryptData(encryptedItem.__encrypted);
      return JSON.parse(decrypted) as T;
    }

    return item;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts = this.retryAttempts,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1 && this.isRetryableError(error as Error)) {
        console.warn(`[DB] Retrying operation, ${attempts - 1} attempts left`);
        await this.delay(this.retryDelay * (this.retryAttempts - attempts + 1));
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      "TransactionInactiveError",
      "QuotaExceededError",
      "UnknownError",
      "InvalidStateError",
    ];
    return retryableErrors.some(
      (e) => error.name?.includes(e) || error.message?.includes(e),
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const db = new IndexedDBWrapper();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return "indexedDB" in window;
}

/**
 * Get storage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usageDetails?: Record<string, number>;
} | null> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageDetails: (estimate as any).usageDetails as Record<string, number>,
      };
    } catch (error) {
      console.error("Failed to get storage estimate:", error);
    }
  }
  return null;
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersistent = await navigator.storage.persist();
      console.log(
        `[DB] Persistent storage: ${isPersistent ? "granted" : "denied"}`,
      );
      return isPersistent;
    } catch (error) {
      console.error("Failed to request persistent storage:", error);
      return false;
    }
  }
  return false;
}

export default db;
