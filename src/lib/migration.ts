/**
 * Data Migration
 * Protocolo CDMX
 *
 * Version management and data migration utilities
 */

import { db, type StoreName } from "./db";
import { storage } from "./storage";

// =============================================================================
// TYPES
// =============================================================================

export interface Migration {
  version: number;
  name: string;
  description: string;
  migrate: () => Promise<boolean>;
  rollback?: () => Promise<boolean>;
}

export interface MigrationState {
  currentVersion: number;
  targetVersion: number;
  lastMigration: string | null;
  migrations: number[];
  failedMigrations: number[];
}

export interface DataIntegrityReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stores: Record<
    string,
    {
      count: number;
      valid: number;
      invalid: number;
      errors: string[];
    }
  >;
}

// =============================================================================
// CURRENT VERSION
// =============================================================================

export const CURRENT_DATA_VERSION = 1;

// =============================================================================
// MIGRATION REGISTRY
// =============================================================================

const migrations: Map<number, Migration> = new Map();

/**
 * Register a migration
 */
export function registerMigration(migration: Migration): void {
  migrations.set(migration.version, migration);
}

/**
 * Get all registered migrations
 */
export function getMigrations(): Migration[] {
  return Array.from(migrations.values()).sort((a, b) => a.version - b.version);
}

// =============================================================================
// MIGRATION MANAGER
// =============================================================================

class MigrationManager {
  private state: MigrationState = {
    currentVersion: 0,
    targetVersion: CURRENT_DATA_VERSION,
    lastMigration: null,
    migrations: [],
    failedMigrations: [],
  };

  private readonly STATE_KEY = "migration_state";

  constructor() {
    this.loadState();
  }

  /**
   * Initialize migration manager
   */
  async init(): Promise<void> {
    await this.loadState();

    // Auto-migrate if needed
    if (this.state.currentVersion < CURRENT_DATA_VERSION) {
      console.log(
        `[Migration] Auto-migrating from v${this.state.currentVersion} to v${CURRENT_DATA_VERSION}`,
      );
      await this.migrate();
    }
  }

  /**
   * Get current state
   */
  getState(): MigrationState {
    return { ...this.state };
  }

  /**
   * Check if migration is needed
   */
  needsMigration(): boolean {
    return this.state.currentVersion < CURRENT_DATA_VERSION;
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<boolean> {
    const pendingMigrations = getMigrations().filter(
      (m) =>
        m.version > this.state.currentVersion &&
        m.version <= CURRENT_DATA_VERSION,
    );

    if (pendingMigrations.length === 0) {
      console.log("[Migration] No migrations needed");
      return true;
    }

    console.log(
      `[Migration] Running ${pendingMigrations.length} migrations...`,
    );

    // Create backup before migration
    const backup = await this.createBackup();
    if (!backup) {
      console.error("[Migration] Failed to create backup, aborting");
      return false;
    }

    for (const migration of pendingMigrations) {
      try {
        console.log(
          `[Migration] Running v${migration.version}: ${migration.name}`,
        );

        const success = await migration.migrate();

        if (success) {
          this.state.currentVersion = migration.version;
          this.state.lastMigration = new Date().toISOString();
          this.state.migrations.push(migration.version);
          await this.saveState();

          console.log(
            `[Migration] v${migration.version} completed successfully`,
          );
        } else {
          this.state.failedMigrations.push(migration.version);
          await this.saveState();

          console.error(`[Migration] v${migration.version} failed`);

          // Rollback on failure
          await this.rollback(migration.version);
          return false;
        }
      } catch (error) {
        console.error(`[Migration] v${migration.version} error:`, error);
        this.state.failedMigrations.push(migration.version);
        await this.saveState();

        await this.rollback(migration.version);
        return false;
      }
    }

    console.log("[Migration] All migrations completed");
    return true;
  }

  /**
   * Rollback a specific migration
   */
  async rollback(version: number): Promise<boolean> {
    const migration = migrations.get(version);

    if (!migration?.rollback) {
      console.warn(`[Migration] No rollback available for v${version}`);
      return false;
    }

    try {
      console.log(`[Migration] Rolling back v${version}...`);
      const success = await migration.rollback();

      if (success) {
        console.log(`[Migration] Rollback v${version} completed`);
      } else {
        console.error(`[Migration] Rollback v${version} failed`);
      }

      return success;
    } catch (error) {
      console.error(`[Migration] Rollback v${version} error:`, error);
      return false;
    }
  }

  /**
   * Validate data integrity
   */
  async validateIntegrity(): Promise<DataIntegrityReport> {
    const report: DataIntegrityReport = {
      valid: true,
      errors: [],
      warnings: [],
      stores: {},
    };

    const stores: StoreName[] = [
      "incidents",
      "documentation",
      "checklists",
      "users",
    ];

    for (const storeName of stores) {
      const storeReport = {
        count: 0,
        valid: 0,
        invalid: 0,
        errors: [] as string[],
      };

      try {
        const result = await db.getAll(storeName);

        if (result.success && result.data) {
          storeReport.count = result.data.length;

          for (const item of result.data) {
            const validation = this.validateItem(storeName, item);

            if (validation.valid) {
              storeReport.valid++;
            } else {
              storeReport.invalid++;
              storeReport.errors.push(...validation.errors);
              report.errors.push(
                `[${storeName}] ${validation.errors.join(", ")}`,
              );
            }
          }
        }
      } catch (error) {
        storeReport.errors.push(`Failed to validate: ${error}`);
        report.errors.push(`[${storeName}] Failed to validate: ${error}`);
      }

      report.stores[storeName] = storeReport;
    }

    report.valid = report.errors.length === 0;
    return report;
  }

  /**
   * Fix data integrity issues
   */
  async fixIntegrity(): Promise<{ fixed: number; errors: string[] }> {
    const report = await this.validateIntegrity();
    const errors: string[] = [];
    let fixed = 0;

    if (report.valid) {
      return { fixed, errors };
    }

    for (const [storeName, storeReport] of Object.entries(report.stores)) {
      if (storeReport.invalid > 0) {
        try {
          const result = await db.getAll(storeName as StoreName);

          if (result.success && result.data) {
            for (const item of result.data) {
              const validation = this.validateItem(
                storeName as StoreName,
                item,
              );

              if (!validation.valid) {
                const fixedItem = this.fixItem(storeName as StoreName, item);

                if (fixedItem) {
                  await db.put(storeName as StoreName, fixedItem);
                  fixed++;
                } else {
                  errors.push(`Could not fix item in ${storeName}`);
                }
              }
            }
          }
        } catch (error) {
          errors.push(`Failed to fix ${storeName}: ${error}`);
        }
      }
    }

    return { fixed, errors };
  }

  /**
   * Create backup before migration
   */
  private async createBackup(): Promise<boolean> {
    try {
      const result = await db.exportAll();

      if (result.success) {
        const backup = {
          version: this.state.currentVersion,
          timestamp: new Date().toISOString(),
          data: result.data,
        };

        storage.session.set(
          `migration_backup_v${this.state.currentVersion}`,
          backup,
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("[Migration] Backup creation failed:", error);
      return false;
    }
  }

  /**
   * Load migration state
   */
  private async loadState(): Promise<void> {
    const stored = storage.local.get<MigrationState>(this.STATE_KEY);

    if (stored) {
      this.state = { ...this.state, ...stored };
    }
  }

  /**
   * Save migration state
   */
  private async saveState(): Promise<void> {
    storage.local.set(this.STATE_KEY, this.state);
  }

  /**
   * Validate a single item
   */
  private validateItem(
    storeName: StoreName,
    item: unknown,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const record = item as Record<string, unknown>;

    // Check required fields based on store
    switch (storeName) {
      case "incidents":
        if (!record.id) errors.push("Missing id");
        if (!record.timestamp) errors.push("Missing timestamp");
        if (!record.status) errors.push("Missing status");
        break;

      case "documentation":
        if (!record.id) errors.push("Missing id");
        if (!record.incidentId) errors.push("Missing incidentId");
        if (!record.timestamp) errors.push("Missing timestamp");
        break;

      case "checklists":
        if (!record.id) errors.push("Missing id");
        if (!record.incidentId) errors.push("Missing incidentId");
        break;

      case "users":
        if (!record.pseudonym) errors.push("Missing pseudonym");
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Try to fix a corrupted item
   */
  private fixItem(storeName: StoreName, item: unknown): unknown | null {
    const record = item as Record<string, unknown>;
    const fixed = { ...record };

    switch (storeName) {
      case "incidents":
        if (!fixed.id) fixed.id = `fixed_${Date.now()}_${Math.random()}`;
        if (!fixed.timestamp) fixed.timestamp = new Date().toISOString();
        if (!fixed.status) fixed.status = "detected";
        break;

      case "documentation":
        if (!fixed.id) fixed.id = `fixed_${Date.now()}_${Math.random()}`;
        if (!fixed.timestamp) fixed.timestamp = new Date().toISOString();
        break;

      case "checklists":
        if (!fixed.id) fixed.id = `fixed_${Date.now()}_${Math.random()}`;
        break;

      default:
        return null;
    }

    return fixed;
  }
}

// =============================================================================
// PREDEFINED MIGRATIONS
// =============================================================================

// Migration v1: Initial schema setup
registerMigration({
  version: 1,
  name: "Initial Schema",
  description: "Set up initial database schema",
  migrate: async () => {
    // Database is already initialized by db.ts
    return true;
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const migrationManager = new MigrationManager();

export async function initMigrations(): Promise<void> {
  await migrationManager.init();
}

export async function validateData(): Promise<DataIntegrityReport> {
  return migrationManager.validateIntegrity();
}

export async function fixDataIntegrity(): Promise<{
  fixed: number;
  errors: string[];
}> {
  return migrationManager.fixIntegrity();
}

export default {
  manager: migrationManager,
  init: initMigrations,
  validate: validateData,
  fix: fixDataIntegrity,
  register: registerMigration,
  CURRENT_DATA_VERSION,
};
