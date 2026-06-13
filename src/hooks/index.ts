/**
 * Hooks Export
 * Protocolo CDMX
 *
 * All custom React hooks exported from a single entry point
 */

// Offline detection
export {
  useOffline,
  useOfflineQueue,
  useNetworkDebounce,
  type ConnectionType,
  type EffectiveConnectionType,
  type NetworkInformation,
  type OfflineState,
  type UseOfflineReturn,
} from "./useOffline";

// Storage hooks
export {
  useLocalStorage,
  useSessionStorage,
  useIndexedDB,
  useIDBList,
  useStorageQuota,
  usePersistentState,
  useStorageSync,
  type UseIndexedDBOptions,
} from "./useStorage";

// Re-export for convenience
export { default as useOfflineDefault } from "./useOffline";
export { default as useStorageDefault } from "./useStorage";
