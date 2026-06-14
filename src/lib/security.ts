/**
 * Security Features
 * Protocolo CDMX
 *
 * Duress mode, auto-lock, panic wipe, and advanced security features
 */

import { sha256, generateSalt } from "./crypto";
import { storage } from "./storage";
import { db } from "./db";
import { syncQueue } from "./sync";
import {
  createVault,
  setDuressPassphrase,
  unlock as vaultUnlock,
  isVaultInitialized,
  hasDuressSlot,
  removeDuressSlot,
  destroyVault,
} from "./vault";

// =============================================================================
// TYPES
// =============================================================================

export interface SecurityConfig {
  autoLockTimeout: number; // minutes
  panicWipeDelay: number; // minutes
  duressEnabled: boolean;
  encryptionEnabled: boolean;
  metadataStrippingEnabled: boolean;
  locationFuzzingEnabled: boolean;
  locationFuzzingRadius: number; // meters
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
}

export interface DuressState {
  active: boolean;
  activatedAt: string | null;
  fakeDataVisible: boolean;
  hiddenAccessEnabled: boolean;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type:
    | "login"
    | "logout"
    | "duress"
    | "lock"
    | "unlock"
    | "wipe"
    | "failed_attempt";
  details: string;
  pseudonym?: string;
  ip?: string;
}

export interface PanicWipeState {
  scheduled: boolean;
  executeAt: string | null;
  delayMinutes: number;
}

export interface AutoLockState {
  locked: boolean;
  lastActivity: number;
  timeoutMs: number;
}

export interface FailedAttempt {
  timestamp: number;
  pseudonym: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: SecurityConfig = {
  autoLockTimeout: 5,
  panicWipeDelay: 10,
  duressEnabled: false,
  encryptionEnabled: true,
  metadataStrippingEnabled: true,
  locationFuzzingEnabled: true,
  locationFuzzingRadius: 500,
  maxFailedAttempts: 5,
  lockoutDuration: 30,
};

const SECURITY_LOG_KEY = "security_log";
const SECURITY_CONFIG_KEY = "security_config";
const DURESS_PASSWORD_KEY = "duress_password_hash";
const REAL_PASSWORD_HASH_KEY = "real_password_hash";
const PANIC_WIPE_KEY = "panic_wipe_state";
const AUTO_LOCK_KEY = "auto_lock_state";
const FAILED_ATTEMPTS_KEY = "failed_login_attempts";

// =============================================================================
// SECURITY MANAGER
// =============================================================================

class SecurityManager {
  private config: SecurityConfig = { ...DEFAULT_CONFIG };
  private duressState: DuressState = {
    active: false,
    activatedAt: null,
    fakeDataVisible: true,
    hiddenAccessEnabled: false,
  };
  private autoLockTimer: number | null = null;
  private panicWipeTimer: number | null = null;
  private activityListeners: Set<() => void> = new Set();
  private lockListeners: Set<(locked: boolean) => void> = new Set();
  private duressListeners: Set<(active: boolean) => void> = new Set();
  private failedAttempts: FailedAttempt[] = [];

  constructor() {
    this.loadConfig();
    this.loadFailedAttempts();
    this.setupActivityTracking();
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  /**
   * Load security configuration
   */
  private loadConfig(): void {
    const stored = storage.local.get<SecurityConfig>(SECURITY_CONFIG_KEY);
    if (stored) {
      this.config = { ...DEFAULT_CONFIG, ...stored };
    }
  }

  /**
   * Save security configuration
   */
  private saveConfig(): void {
    storage.local.set(SECURITY_CONFIG_KEY, this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();

    // Apply changes
    if (updates.autoLockTimeout !== undefined) {
      this.resetAutoLockTimer();
    }
  }

  // =============================================================================
  // PASSWORD MANAGEMENT
  // =============================================================================

  /**
   * Set the master password. Creates the encryption vault (the passphrase
   * derives the key that protects all data). Throws if a vault already exists —
   * use the vault's `changePassphrase` to rotate it.
   */
  async setRealPassword(password: string): Promise<void> {
    if (isVaultInitialized()) {
      throw new Error(
        'Ya existe una contraseña maestra. Usa "cambiar contraseña" para rotarla.',
      );
    }
    await createVault(password);
    this.config.encryptionEnabled = true;
    this.saveConfig();
    this.log("login", "Vault created / master password set");
  }

  /**
   * Set a duress password. Unlocking with it opens an isolated decoy vault and
   * silently schedules a wipe.
   */
  async setDuressPassword(password: string): Promise<void> {
    await setDuressPassphrase(password);
    this.config.duressEnabled = true;
    this.saveConfig();
  }

  /**
   * Remove the duress password (decoy vault slot).
   */
  clearDuressPassword(): void {
    removeDuressSlot();
    this.config.duressEnabled = false;
    this.saveConfig();
  }

  /**
   * Verify a password by attempting to unlock the vault. Detects duress.
   */
  async verifyPassword(
    input: string,
  ): Promise<{ valid: boolean; isDuress: boolean }> {
    if (this.isLockedOut()) {
      this.log(
        "failed_attempt",
        "Account locked due to too many failed attempts",
      );
      throw new Error(
        "Demasiados intentos fallidos. Espera antes de volver a intentar.",
      );
    }

    const result = await vaultUnlock(input);
    if (result.success) {
      this.recordSuccessfulLogin();
      this.log(
        result.duress ? "duress" : "login",
        result.duress ? "Duress unlock" : "Unlock",
      );
      if (result.duress) {
        this.activateDuressMode();
      }
      return { valid: true, isDuress: result.duress };
    }

    await this.recordFailedAttempt(input);
    return { valid: false, isDuress: false };
  }

  /**
   * Whether a master password / vault exists.
   */
  hasPassword(): boolean {
    return isVaultInitialized();
  }

  /**
   * Whether a duress password is configured.
   */
  hasDuressPassword(): boolean {
    return hasDuressSlot();
  }

  // =============================================================================
  // DURESS MODE
  // =============================================================================

  /**
   * Activate duress mode
   */
  activateDuressMode(): void {
    this.duressState = {
      active: true,
      activatedAt: new Date().toISOString(),
      fakeDataVisible: true,
      hiddenAccessEnabled: false,
    };

    // Hide real data
    this.hideRealData();

    // Log activation
    this.log("duress", "Duress mode activated");

    // Notify listeners
    this.duressListeners.forEach((cb) => cb(true));

    // Schedule automatic wipe after delay
    this.scheduleWipe(this.config.panicWipeDelay);
  }

  /**
   * Deactivate duress mode
   */
  deactivateDuressMode(): void {
    this.duressState = {
      active: false,
      activatedAt: null,
      fakeDataVisible: false,
      hiddenAccessEnabled: false,
    };

    // Cancel any pending wipe
    this.cancelWipe();

    // Log deactivation
    this.log("duress", "Duress mode deactivated");

    // Notify listeners
    this.duressListeners.forEach((cb) => cb(false));
  }

  /**
   * Get duress state
   */
  getDuressState(): DuressState {
    return { ...this.duressState };
  }

  /**
   * Check if in duress mode
   */
  isDuressActive(): boolean {
    return this.duressState.active;
  }

  /**
   * Enable hidden data access (special gesture)
   */
  enableHiddenAccess(): void {
    if (this.duressState.active) {
      this.duressState.hiddenAccessEnabled = true;
      this.duressState.fakeDataVisible = false;
      this.log("duress", "Hidden data access enabled");
    }
  }

  /**
   * Disable hidden data access
   */
  disableHiddenAccess(): void {
    if (this.duressState.active) {
      this.duressState.hiddenAccessEnabled = false;
      this.duressState.fakeDataVisible = true;
      this.log("duress", "Hidden data access disabled");
    }
  }

  /**
   * Hide real data (replace with fake data)
   */
  private hideRealData(): void {
    // Mark real data as hidden in session storage
    storage.session.set("duress_real_data_hidden", true);

    // Note: Actual data hiding is handled by the store and components
    // checking isDuressActive()
  }

  // =============================================================================
  // AUTO-LOCK
  // =============================================================================

  /**
   * Lock the application
   */
  lockApp(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000,
    };

    state.locked = true;
    storage.session.set(AUTO_LOCK_KEY, state);

    this.log("lock", "Application locked");
    this.lockListeners.forEach((cb) => cb(true));

    // Clear activity timer
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  /**
   * Unlock the application
   */
  unlockApp(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000,
    };

    state.locked = false;
    state.lastActivity = Date.now();
    storage.session.set(AUTO_LOCK_KEY, state);

    this.log("unlock", "Application unlocked");
    this.lockListeners.forEach((cb) => cb(false));

    // Reset timer
    this.resetAutoLockTimer();
  }

  /**
   * Check if app is locked
   */
  isLocked(): boolean {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY);
    return state?.locked ?? false;
  }

  /**
   * Set auto-lock timeout
   */
  setAutoLockTimeout(minutes: number): void {
    this.config.autoLockTimeout = minutes;
    this.saveConfig();
    this.resetAutoLockTimer();
  }

  /**
   * Record activity to prevent auto-lock
   */
  recordActivity(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000,
    };

    state.lastActivity = Date.now();
    storage.session.set(AUTO_LOCK_KEY, state);

    this.activityListeners.forEach((cb) => cb());

    if (!state.locked) {
      this.resetAutoLockTimer();
    }
  }

  /**
   * Reset auto-lock timer
   */
  private resetAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
    }

    const timeoutMs = this.config.autoLockTimeout * 60 * 1000;

    if (timeoutMs > 0) {
      this.autoLockTimer = window.setTimeout(() => {
        if (!this.isLocked()) {
          this.lockApp();
        }
      }, timeoutMs);
    }
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    // Track user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    events.forEach((event) => {
      document.addEventListener(event, () => this.recordActivity(), true);
    });

    // Initial timer
    this.resetAutoLockTimer();
  }

  // =============================================================================
  // PANIC WIPE
  // =============================================================================

  /**
   * Schedule panic wipe
   */
  scheduleWipe(delayMinutes: number): void {
    // Clear existing timer
    this.cancelWipe();

    const state: PanicWipeState = {
      scheduled: true,
      executeAt: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
      delayMinutes,
    };

    // Persisted DURABLY (localStorage) so the deadline survives a reload or the
    // tab being closed and reopened — closing the app no longer cancels a wipe.
    storage.local.set(PANIC_WIPE_KEY, state);

    this.panicWipeTimer = window.setTimeout(
      () => {
        this.executeWipe();
      },
      delayMinutes * 60 * 1000,
    );
  }

  /**
   * On app startup, re-arm (or immediately execute) a wipe that was scheduled
   * before the last reload/close. Call once during boot.
   */
  armScheduledWipeOnStartup(): void {
    const state = storage.local.get<PanicWipeState>(PANIC_WIPE_KEY);
    if (!state?.scheduled || !state.executeAt) return;

    const remaining = new Date(state.executeAt).getTime() - Date.now();
    if (remaining <= 0) {
      void this.executeWipe();
      return;
    }
    this.panicWipeTimer = window.setTimeout(
      () => this.executeWipe(),
      remaining,
    );
  }

  /**
   * Cancel scheduled wipe
   */
  cancelWipe(): boolean {
    if (this.panicWipeTimer) {
      clearTimeout(this.panicWipeTimer);
      this.panicWipeTimer = null;
    }

    const wasScheduled = this.isWipeScheduled();
    storage.local.set(PANIC_WIPE_KEY, {
      scheduled: false,
      executeAt: null,
      delayMinutes: 0,
    });
    return wasScheduled;
  }

  /**
   * Check if wipe is scheduled
   */
  isWipeScheduled(): boolean {
    const state = storage.local.get<PanicWipeState>(PANIC_WIPE_KEY);
    return state?.scheduled ?? false;
  }

  /**
   * Get wipe state
   */
  getWipeState(): PanicWipeState {
    return (
      storage.local.get<PanicWipeState>(PANIC_WIPE_KEY) || {
        scheduled: false,
        executeAt: null,
        delayMinutes: 0,
      }
    );
  }

  /**
   * Execute panic wipe — irreversibly destroy ALL local data.
   *
   * Order matters: stop timers, then destroy the entire IndexedDB database
   * (incidents, documentation, users, checklists, contacts, safePoints,
   * backups, settings, syncQueue), the key vault, and every Web Storage entry
   * for this origin. We deliberately do NOT write any log entry during or after
   * the wipe (deniability — no forensic "a wipe happened" breadcrumb), and we
   * only reload once destruction has settled.
   */
  async executeWipe(): Promise<void> {
    // eslint-disable-next-line no-console
    console.warn("[Security] Executing panic wipe");

    // Stop any pending timers so nothing re-arms mid-wipe.
    if (this.panicWipeTimer) {
      clearTimeout(this.panicWipeTimer);
      this.panicWipeTimer = null;
    }
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }

    try {
      try {
        syncQueue.clear();
      } catch {
        /* best effort */
      }

      // Destroy the whole database (covers every store, including backups).
      try {
        await db.deleteDatabase();
      } catch (error) {
        console.error(
          "[Security] Database deletion failed during wipe:",
          error,
        );
      }

      // Destroy the key vault (wrapped keys) and drop the in-memory key.
      try {
        destroyVault();
      } catch {
        /* best effort */
      }

      // Clear every legacy/key/log entry, then ALL Web Storage for this origin.
      try {
        storage.local.remove(REAL_PASSWORD_HASH_KEY);
        storage.local.remove(DURESS_PASSWORD_KEY);
        storage.local.remove(SECURITY_LOG_KEY);
      } catch {
        /* best effort */
      }
      try {
        localStorage.clear();
      } catch {
        /* best effort */
      }
      try {
        sessionStorage.clear();
      } catch {
        /* best effort */
      }

      // Reset in-memory state.
      this.duressState = {
        active: false,
        activatedAt: null,
        fakeDataVisible: false,
        hiddenAccessEnabled: false,
      };
      this.failedAttempts = [];
    } finally {
      // Reload to a clean, locked, empty app.
      try {
        window.location.reload();
      } catch {
        /* non-browser env */
      }
    }
  }

  // =============================================================================
  // METADATA STRIPPING
  // =============================================================================

  /**
   * Strip EXIF metadata from file
   */
  async stripExif(file: File): Promise<File> {
    if (!this.config.metadataStrippingEnabled) {
      return file;
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Check if it's a JPEG
    const isJpeg = uint8Array[0] === 0xff && uint8Array[1] === 0xd8;

    if (!isJpeg) {
      // For non-JPEG files, just return as-is (metadata stripping
      // for other formats is more complex)
      return file;
    }

    // Find EXIF segment (APP1 marker 0xFFE1)
    let offset = 2;
    while (offset < uint8Array.length) {
      if (uint8Array[offset] !== 0xff) break;

      const marker = uint8Array[offset + 1];

      // Skip padding
      if (marker === 0xff) {
        offset++;
        continue;
      }

      // Check for APP1 (EXIF)
      if (marker === 0xe1) {
        const length = (uint8Array[offset + 2] << 8) | uint8Array[offset + 3];
        // Remove EXIF segment by creating new array without it
        const before = uint8Array.slice(0, offset);
        const after = uint8Array.slice(offset + 2 + length);
        const cleaned = new Uint8Array(before.length + after.length);
        cleaned.set(before);
        cleaned.set(after, before.length);

        return new File([cleaned], file.name, { type: file.type });
      }

      // Skip other segments
      if (marker >= 0xe0 && marker <= 0xfe) {
        const length = (uint8Array[offset + 2] << 8) | uint8Array[offset + 3];
        offset += 2 + length;
      } else if (marker === 0xd9) {
        // End of image
        break;
      } else {
        offset += 2;
      }
    }

    return file;
  }

  /**
   * Fuzz location coordinates
   */
  fuzzLocation(lat: number, lng: number): { lat: number; lng: number } {
    if (!this.config.locationFuzzingEnabled) {
      return { lat, lng };
    }

    const radius = this.config.locationFuzzingRadius;

    // Deterministic offset seeded by the true coordinate. Reporting the same
    // place repeatedly therefore yields the SAME fuzzed point, so an adversary
    // cannot average many noisy reports to recover the real location (a real
    // weakness of per-call Math.random() fuzzing).
    const seed = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const r1 = (h & 0xffff) / 0xffff;
    const r2 = ((h >>> 16) & 0xffff) / 0xffff;

    // 111,320 m per degree latitude; longitude scaled by cos(lat).
    const latOffset = (r1 - 0.5) * 2 * (radius / 111320);
    const lngOffset =
      (r2 - 0.5) * 2 * (radius / (111320 * Math.cos((lat * Math.PI) / 180)));

    return {
      lat: lat + latOffset,
      lng: lng + lngOffset,
    };
  }

  // =============================================================================
  // FAILED ATTEMPTS & LOCKOUT
  // =============================================================================

  /**
   * Record failed login attempt
   */
  private async recordFailedAttempt(pseudonym: string): Promise<void> {
    this.failedAttempts.push({
      timestamp: Date.now(),
      pseudonym: await sha256(pseudonym), // Hash pseudonym for privacy
    });

    // Keep only last hour of attempts
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.failedAttempts = this.failedAttempts.filter(
      (a) => a.timestamp > oneHourAgo,
    );

    this.saveFailedAttempts();

    // Log
    this.log("failed_attempt", `Failed login attempt for ${pseudonym}`);
  }

  /**
   * Record successful login
   */
  private recordSuccessfulLogin(): void {
    // Clear failed attempts
    this.failedAttempts = [];
    this.saveFailedAttempts();
  }

  /**
   * Check if account is locked out
   */
  private isLockedOut(): boolean {
    const recentAttempts = this.failedAttempts.filter(
      (a) => a.timestamp > Date.now() - this.config.lockoutDuration * 60 * 1000,
    );

    return recentAttempts.length >= this.config.maxFailedAttempts;
  }

  /**
   * Load failed attempts
   */
  private loadFailedAttempts(): void {
    const stored = storage.session.get<FailedAttempt[]>(FAILED_ATTEMPTS_KEY);
    if (stored) {
      // Filter out old attempts
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      this.failedAttempts = stored.filter((a) => a.timestamp > oneHourAgo);
    }
  }

  /**
   * Save failed attempts
   */
  private saveFailedAttempts(): void {
    storage.session.set(FAILED_ATTEMPTS_KEY, this.failedAttempts);
  }

  // =============================================================================
  // SECURITY LOG
  // =============================================================================

  /**
   * Log security event
   */
  log(type: SecurityLog["type"], details: string, pseudonym?: string): void {
    const logs = this.getLogs();

    const log: SecurityLog = {
      id: Array.from(generateSalt(8), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join(""),
      timestamp: new Date().toISOString(),
      type,
      details,
      pseudonym,
      ip: undefined, // IP logging would require server
    };

    logs.push(log);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.shift();
    }

    storage.local.set(SECURITY_LOG_KEY, logs);
  }

  /**
   * Get security logs
   */
  getLogs(): SecurityLog[] {
    return storage.local.get<SecurityLog[]>(SECURITY_LOG_KEY) || [];
  }

  /**
   * Clear security logs
   */
  clearLogs(): void {
    storage.local.remove(SECURITY_LOG_KEY);
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  // =============================================================================
  // SUBSCRIPTIONS
  // =============================================================================

  /**
   * Subscribe to lock events
   */
  onLock(callback: (locked: boolean) => void): () => void {
    this.lockListeners.add(callback);
    return () => this.lockListeners.delete(callback);
  }

  /**
   * Subscribe to duress events
   */
  onDuress(callback: (active: boolean) => void): () => void {
    this.duressListeners.add(callback);
    return () => this.duressListeners.delete(callback);
  }

  /**
   * Subscribe to activity events
   */
  onActivity(callback: () => void): () => void {
    this.activityListeners.add(callback);
    return () => this.activityListeners.delete(callback);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const securityManager = new SecurityManager();

// Convenience exports. These MUST be bound to the instance — destructuring the
// methods would detach `this` and make every call throw at runtime.
export const getConfig = securityManager.getConfig.bind(securityManager);
export const updateConfig = securityManager.updateConfig.bind(securityManager);
export const setRealPassword =
  securityManager.setRealPassword.bind(securityManager);
export const setDuressPassword =
  securityManager.setDuressPassword.bind(securityManager);
export const clearDuressPassword =
  securityManager.clearDuressPassword.bind(securityManager);
export const verifyPassword =
  securityManager.verifyPassword.bind(securityManager);
export const hasPassword = securityManager.hasPassword.bind(securityManager);
export const hasDuressPassword =
  securityManager.hasDuressPassword.bind(securityManager);
export const activateDuressMode =
  securityManager.activateDuressMode.bind(securityManager);
export const deactivateDuressMode =
  securityManager.deactivateDuressMode.bind(securityManager);
export const getDuressState =
  securityManager.getDuressState.bind(securityManager);
export const isDuressActive =
  securityManager.isDuressActive.bind(securityManager);
export const enableHiddenAccess =
  securityManager.enableHiddenAccess.bind(securityManager);
export const disableHiddenAccess =
  securityManager.disableHiddenAccess.bind(securityManager);
export const lockApp = securityManager.lockApp.bind(securityManager);
export const unlockApp = securityManager.unlockApp.bind(securityManager);
export const isLocked = securityManager.isLocked.bind(securityManager);
export const setAutoLockTimeout =
  securityManager.setAutoLockTimeout.bind(securityManager);
export const recordActivity =
  securityManager.recordActivity.bind(securityManager);
export const scheduleWipe = securityManager.scheduleWipe.bind(securityManager);
export const armScheduledWipeOnStartup =
  securityManager.armScheduledWipeOnStartup.bind(securityManager);
export const cancelWipe = securityManager.cancelWipe.bind(securityManager);
export const isWipeScheduled =
  securityManager.isWipeScheduled.bind(securityManager);
export const getWipeState = securityManager.getWipeState.bind(securityManager);
export const executeWipe = securityManager.executeWipe.bind(securityManager);
export const stripExif = securityManager.stripExif.bind(securityManager);
export const fuzzLocation = securityManager.fuzzLocation.bind(securityManager);
export const log = securityManager.log.bind(securityManager);
export const getLogs = securityManager.getLogs.bind(securityManager);
export const clearLogs = securityManager.clearLogs.bind(securityManager);
export const exportLogs = securityManager.exportLogs.bind(securityManager);
export const onLock = securityManager.onLock.bind(securityManager);
export const onDuress = securityManager.onDuress.bind(securityManager);
export const onActivity = securityManager.onActivity.bind(securityManager);

export default securityManager;
