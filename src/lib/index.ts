/**
 * Lib Export
 * Protocolo CDMX
 * 
 * All utility libraries exported from a single entry point
 */

// Database and Storage
export {
  db,
  isIndexedDBSupported,
  getStorageEstimate,
  requestPersistentStorage,
  type StoreName,
  type DBConfig,
  type StoreConfig,
  type IndexConfig,
  type QueryOptions,
  type DBOperationResult
} from './db'

// Storage utilities
export {
  storage,
  LocalStorageWrapper,
  SessionStorageWrapper,
  FileSystemWrapper,
  MemoryStorage,
  type StorageOptions,
  type StorageItem,
  type StorageQuota,
  type StorageStats,
  type StorageType,
  getStorageType,
  estimateSize
} from './storage'

// Sync logic
export {
  syncQueue,
  syncEngine,
  initSync,
  queueAction,
  ConflictResolver,
  type SyncActionType,
  type SyncStatus,
  type SyncAction,
  type SyncResult,
  type SyncConfig,
  type SyncState
} from './sync'

// Compression
export {
  compress,
  decompress,
  compressIfBeneficial,
  decompressAuto,
  isCompressed,
  getCompressionStats,
  compressObject,
  decompressObject,
  type CompressionAlgorithm,
  type CompressionResult
} from './compression'

// Migration
export {
  migrationManager,
  initMigrations,
  validateData,
  fixDataIntegrity,
  registerMigration,
  getMigrations,
  CURRENT_DATA_VERSION,
  type Migration,
  type MigrationState,
  type DataIntegrityReport
} from './migration'

// Backup and Export
export {
  backupManager,
  createBackup,
  exportData,
  importData,
  listBackups,
  shareIncident,
  type BackupMetadata,
  type BackupData,
  type ExportOptions,
  type ImportOptions,
  type ExportResult,
  type ImportResult
} from './backup'

// Encryption facade (Web Crypto API, vault-backed)
export {
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  hashData,
  verifyHash,
  hashPasswordForStorage,
  verifyPasswordAgainstHash,
  generateSecureRandomId,
  type HashResult
} from './encryption'

// Vault (key management & session unlock)
export {
  getVaultState,
  isVaultInitialized,
  isUnlocked,
  isDuressActive as isVaultDuressActive,
  getDataKey,
  createVault,
  setDuressPassphrase,
  hasDuressSlot,
  removeDuressSlot,
  unlock as unlockVault,
  lock as lockVault,
  changePassphrase,
  destroyVault,
  onUnlockChange,
  type VaultState,
  type UnlockResult
} from './vault'

// Crypto (Web Crypto API - preferred)
export {
  generateSalt as generateCryptoSalt,
  generateIV,
  deriveKeyFromPassword,
  deriveKeyWithSalt,
  generateSecureKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  encryptToString,
  decryptFromString,
  sha256,
  hmac,
  hashPassword,
  verifyPassword,
  encryptFile,
  decryptFile,
  storeKeySecurely,
  retrieveKey,
  clearStoredKey,
  hasValidKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateSecureId,
  constantTimeCompare,
  isCryptoSupported,
  generateKey,
  CRYPTO_CONSTANTS,
  type EncryptedData as CryptoEncryptedData,
  type EncryptedBlob,
  type KeyPair,
  type HashResult as CryptoHashResult
} from './crypto'

// Security
export {
  securityManager,
  getConfig,
  updateConfig,
  setRealPassword,
  setDuressPassword as setSecurityDuressPassword,
  clearDuressPassword as clearSecurityDuressPassword,
  verifyPassword as verifySecurityPassword,
  hasPassword,
  hasDuressPassword,
  activateDuressMode,
  deactivateDuressMode,
  getDuressState,
  isDuressActive,
  enableHiddenAccess,
  disableHiddenAccess,
  lockApp,
  unlockApp,
  isLocked,
  setAutoLockTimeout,
  recordActivity,
  scheduleWipe,
  armScheduledWipeOnStartup,
  cancelWipe,
  isWipeScheduled,
  getWipeState,
  executeWipe,
  stripExif,
  fuzzLocation,
  log as securityLog,
  getLogs,
  clearLogs,
  exportLogs,
  onLock,
  onDuress,
  onActivity,
  type SecurityConfig,
  type DuressState,
  type SecurityLog,
  type PanicWipeState,
  type AutoLockState
} from './security'

// Roles (already exists)
export {
  ROLE_DEFINITIONS,
  AVAILABLE_ROLES,
  ROLE_CERTIFICATION_LABELS,
  getRoleDefinition,
  checkCertificationLevel,
  filterActionsByCertification,
  type CertificationLevel,
  type RoleDefinition,
  type PrimaryAction as RoleAction,
  type QuickAccessItem
} from './roles'

// Store helpers (already exists)
export {
  generateIncidentId,
  getCurrentTimestamp,
  calculateProgress,
  updateInArray,
  removeFromArray,
  findById,
  persistToLocalStorage,
  persistToIndexedDB,
  encryptIfEnabled,
  decryptIfNeeded
} from './store-helpers'

// Utils (already exists)
export { cn, formatDate, formatTime, generateId } from './utils'

// Default exports
export { default as dbDefault } from './db'
export { default as storageDefault } from './storage'
export { default as syncDefault } from './sync'
export { default as compressionDefault } from './compression'
export { default as migrationDefault } from './migration'
export { default as backupDefault } from './backup'
export { default as cryptoDefault } from './crypto'
export { default as securityDefault } from './security'

// PDF Export
export * from './pdfExport'
export { default as PDFExport } from './pdfExport'

// Form Templates
export * from './formTemplatesIndex'
export { default as FormTemplates } from './formTemplatesIndex'
