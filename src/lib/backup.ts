/**
 * Backup and Export
 * Protocolo CDMX
 *
 * Data backup, export, and import functionality
 */

import { db, type StoreName } from "./db";
import { storage } from "./storage";
import { encryptData, decryptData } from "./encryption";

// =============================================================================
// TYPES
// =============================================================================

export interface BackupMetadata {
  id: string;
  timestamp: string;
  version: string;
  dataVersion: number;
  type: "full" | "partial" | "scheduled" | "pre_migration";
  description?: string;
  size: number;
  encrypted: boolean;
  compression?: "gzip" | "lz-string" | "none";
  stores: StoreName[];
  recordCounts: Record<string, number>;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, unknown[]>;
}

export interface ExportOptions {
  stores?: StoreName[];
  dateRange?: { start: Date; end: Date };
  incidentIds?: string[];
  encrypt?: boolean;
  compress?: boolean;
  includeMedia?: boolean;
}

export interface ImportOptions {
  merge?: boolean; // Merge with existing data or replace
  validate?: boolean;
  backupBeforeImport?: boolean;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  metadata?: BackupMetadata;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BACKUP_STORE = "backups";
const MAX_BACKUPS = 10;
const APP_VERSION = "1.0.0";

// =============================================================================
// BACKUP MANAGER
// =============================================================================

class BackupManager {
  private encryptionKey: string | null = null;

  /**
   * Set encryption key
   */
  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  /**
   * Create a full backup
   */
  async createBackup(
    type: BackupMetadata["type"] = "full",
    description?: string,
  ): Promise<BackupData | null> {
    try {
      console.log("[Backup] Creating backup...");

      // Export all data
      const exportResult = await db.exportAll();

      if (!exportResult.success || !exportResult.data) {
        throw new Error("Failed to export data");
      }

      const data = exportResult.data;
      const recordCounts: Record<string, number> = {};

      for (const [store, items] of Object.entries(data)) {
        recordCounts[store] = items.length;
      }

      const metadata: BackupMetadata = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        dataVersion: 1,
        type,
        description,
        size: 0,
        encrypted: !!this.encryptionKey,
        stores: Object.keys(data) as StoreName[],
        recordCounts,
      };

      const backup: BackupData = { metadata, data };

      // Calculate size
      const serialized = JSON.stringify(backup);
      metadata.size = new Blob([serialized]).size;

      // Save to IndexedDB
      await db.put(BACKUP_STORE as StoreName, backup);

      // Clean up old backups
      await this.cleanupOldBackups();

      console.log(
        `[Backup] Created: ${metadata.id} (${this.formatSize(metadata.size)})`,
      );

      return backup;
    } catch (error) {
      console.error("[Backup] Failed:", error);
      return null;
    }
  }

  /**
   * Create a selective backup
   */
  async createSelectiveBackup(
    options: ExportOptions,
  ): Promise<BackupData | null> {
    try {
      const data: Record<string, unknown[]> = {};
      const stores = options.stores || [
        "incidents",
        "documentation",
        "checklists",
        "users",
      ];

      for (const store of stores) {
        let items = (await db.getAll(store)).data || [];

        // Filter by date range
        if (options.dateRange) {
          items = (items as any[]).filter((item: Record<string, unknown>) => {
            const timestamp = item.timestamp as string;
            if (!timestamp) return true;
            const date = new Date(timestamp);
            return (
              date >= options.dateRange!.start && date <= options.dateRange!.end
            );
          });
        }

        // Filter by incident IDs
        if (options.incidentIds && store !== "users" && store !== "settings") {
          items = (items as any[]).filter((item: Record<string, unknown>) => {
            const id = item.id as string;
            const incidentId = item.incidentId as string;
            return (
              options.incidentIds!.includes(id) ||
              options.incidentIds!.includes(incidentId)
            );
          });
        }

        data[store] = items;
      }

      const metadata: BackupMetadata = {
        id: `backup_selective_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        dataVersion: 1,
        type: "partial",
        size: 0,
        encrypted: !!(options.encrypt && this.encryptionKey),
        stores,
        recordCounts: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v.length]),
        ),
      };

      const backup: BackupData = { metadata, data };
      metadata.size = new Blob([JSON.stringify(backup)]).size;

      return backup;
    } catch (error) {
      console.error("[Backup] Selective backup failed:", error);
      return null;
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const result = await db.getAll(BACKUP_STORE as StoreName);
    const backups = (result.data || []) as BackupData[];

    return backups
      .map((b) => b.metadata)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get a specific backup
   */
  async getBackup(id: string): Promise<BackupData | null> {
    const result = await db.get<BackupData>(BACKUP_STORE as StoreName, id);
    return result.data || null;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(id: string): Promise<boolean> {
    const result = await db.delete(BACKUP_STORE as StoreName, id);
    return result.success;
  }

  /**
   * Export backup to file
   */
  async exportToFile(
    backup: BackupData,
    filename?: string,
  ): Promise<ExportResult> {
    try {
      let data = JSON.stringify(backup);

      // Encrypt if key available
      if (backup.metadata.encrypted && this.encryptionKey) {
        data = await encryptData(data, this.encryptionKey);
      }

      const blob = new Blob([data], {
        type: backup.metadata.encrypted
          ? "application/encrypted"
          : "application/json",
      });

      const url = URL.createObjectURL(blob);
      const finalFilename =
        filename ||
        `protocolo_cdmx_backup_${backup.metadata.timestamp.split("T")[0]}.json`;

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return {
        success: true,
        blob,
        url,
        metadata: backup.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      };
    }
  }

  /**
   * Import from file
   */
  async importFromFile(
    file: File,
    options: ImportOptions = {},
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Create backup before import if requested
      if (options.backupBeforeImport) {
        await this.createBackup("pre_migration", "Auto-backup before import");
      }

      // Read file
      const text = await file.text();
      let data: BackupData;

      // Try to decrypt if needed
      try {
        data = JSON.parse(text);
      } catch {
        // Try decrypting
        if (this.encryptionKey) {
          const decrypted = await decryptData(text, this.encryptionKey);
          data = JSON.parse(decrypted);
        } else {
          throw new Error("Failed to parse backup file");
        }
      }

      // Validate
      if (options.validate) {
        const validation = this.validateBackup(data);
        if (!validation.valid) {
          result.errors.push(...validation.errors);
          return result;
        }
      }

      // Import data
      for (const [storeName, items] of Object.entries(data.data)) {
        try {
          if (options.merge) {
            // Merge: only add items that don't exist
            const existing =
              (await db.getAll(storeName as StoreName)).data || [];
            const existingIds = new Set(
              (existing as any[]).map(
                (i: Record<string, unknown>) => i.id || i.pseudonym,
              ),
            );

            const newItems = (items as any[]).filter(
              (i: Record<string, unknown>) =>
                !existingIds.has(i.id || i.pseudonym),
            );

            for (const item of newItems) {
              await db.put(storeName as StoreName, item);
              result.imported++;
            }
          } else {
            // Replace: clear and add all
            await db.clear(storeName as StoreName);

            for (const item of items) {
              await db.put(storeName as StoreName, item);
              result.imported++;
            }
          }
        } catch (error) {
          result.failed += items.length;
          result.errors.push(`Failed to import ${storeName}: ${error}`);
        }
      }

      result.success = result.failed === 0;
      return result;
    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
      return result;
    }
  }

  /**
   * Export data for sharing (selective)
   */
  async exportForSharing(
    incidentIds: string[],
    includeDocumentation = true,
  ): Promise<ExportResult> {
    try {
      const options: ExportOptions = {
        stores: ["incidents", "checklists"],
        incidentIds,
        encrypt: true,
      };

      if (includeDocumentation) {
        options.stores!.push("documentation");
      }

      const backup = await this.createSelectiveBackup(options);

      if (!backup) {
        return { success: false, error: "Failed to create export" };
      }

      return this.exportToFile(
        backup,
        `protocolo_cdmx_incident_${incidentIds[0]}.json`,
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      };
    }
  }

  /**
   * Schedule automatic backups
   */
  scheduleBackups(intervalHours: number = 24): void {
    // Check for scheduled backup
    const lastBackup = storage.local.get<string>("last_scheduled_backup");
    const now = Date.now();
    const interval = intervalHours * 60 * 60 * 1000;

    if (!lastBackup || now - new Date(lastBackup).getTime() > interval) {
      this.createBackup(
        "scheduled",
        `Scheduled backup every ${intervalHours}h`,
      );
      storage.local.set("last_scheduled_backup", new Date().toISOString());
    }

    // Schedule next
    setTimeout(() => this.scheduleBackups(intervalHours), interval);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();

    if (backups.length > MAX_BACKUPS) {
      // Keep most recent MAX_BACKUPS
      const toDelete = backups.slice(MAX_BACKUPS);

      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }

      console.log(`[Backup] Cleaned up ${toDelete.length} old backups`);
    }
  }

  private validateBackup(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const backup = data as BackupData;

    if (!backup.metadata) {
      errors.push("Missing metadata");
      return { valid: false, errors };
    }

    if (!backup.metadata.version) {
      errors.push("Missing version in metadata");
    }

    if (!backup.metadata.timestamp) {
      errors.push("Missing timestamp in metadata");
    }

    if (!backup.data) {
      errors.push("Missing data");
    }

    return { valid: errors.length === 0, errors };
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const backupManager = new BackupManager();

export async function createBackup(
  type: BackupMetadata["type"] = "full",
  description?: string,
): Promise<BackupData | null> {
  return backupManager.createBackup(type, description);
}

export async function exportData(
  options: ExportOptions = {},
): Promise<ExportResult> {
  const backup = await backupManager.createSelectiveBackup(options);

  if (!backup) {
    return { success: false, error: "Failed to create export" };
  }

  return backupManager.exportToFile(backup);
}

export async function importData(
  file: File,
  options?: ImportOptions,
): Promise<ImportResult> {
  return backupManager.importFromFile(file, options);
}

export async function listBackups(): Promise<BackupMetadata[]> {
  return backupManager.listBackups();
}

export async function shareIncident(
  incidentIds: string[],
  includeDocumentation = true,
): Promise<ExportResult> {
  return backupManager.exportForSharing(incidentIds, includeDocumentation);
}

export default {
  manager: backupManager,
  create: createBackup,
  export: exportData,
  import: importData,
  list: listBackups,
  share: shareIncident,
};
