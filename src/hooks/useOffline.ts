/**
 * useOffline Hook
 * Protocolo CDMX
 *
 * React hook for detecting and responding to online/offline status
 */

import { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "none"
  | "wifi"
  | "wimax"
  | "other"
  | "unknown";

export type EffectiveConnectionType = "2g" | "3g" | "4g" | "slow-2g";

export interface NetworkInformation {
  type: ConnectionType;
  effectiveType?: EffectiveConnectionType;
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  connectionType: ConnectionType;
  effectiveType?: EffectiveConnectionType;
  downlinkSpeed?: number;
  isSlowConnection: boolean;
  isMetered: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

export interface UseOfflineReturn extends OfflineState {
  checkConnection: () => Promise<boolean>;
  syncWhenOnline: <T>(operation: () => Promise<T>) => Promise<T | null>;
  wasRecentlyOffline: (withinMs?: number) => boolean;
}

// =============================================================================
// NETWORK INFORMATION API
// =============================================================================

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation & {
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
  };
}

function getNetworkInfo(): Partial<NetworkInformation> {
  const nav = navigator as NavigatorWithConnection;

  if (nav.connection) {
    return {
      type: nav.connection.type || "unknown",
      effectiveType: nav.connection.effectiveType,
      downlink: nav.connection.downlink,
      downlinkMax: nav.connection.downlinkMax,
      rtt: nav.connection.rtt,
      saveData: nav.connection.saveData,
    };
  }

  return { type: "unknown" };
}

// =============================================================================
// HOOK
// =============================================================================

export function useOffline(): UseOfflineReturn {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    connectionType: "unknown",
    isSlowConnection: false,
    isMetered: false,
    lastOnlineTime: navigator.onLine ? new Date() : null,
    lastOfflineTime: navigator.onLine ? null : new Date(),
  });

  const pendingOperations = useRef<(() => void)[]>([]);
  const lastOfflineTimestamp = useRef<number>(0);

  // Update network info
  const updateNetworkInfo = useCallback(() => {
    const info = getNetworkInfo();

    setState((prev) => ({
      ...prev,
      connectionType: info.type || "unknown",
      effectiveType: info.effectiveType,
      downlinkSpeed: info.downlink,
      isSlowConnection:
        info.effectiveType === "slow-2g" ||
        info.effectiveType === "2g" ||
        (info.downlink !== undefined && info.downlink < 0.5),
      isMetered: info.saveData || false,
    }));
  }, []);

  // Handle online event
  const handleOnline = useCallback(() => {
    const now = new Date();
    lastOfflineTimestamp.current = Date.now();

    setState((prev) => ({
      ...prev,
      isOnline: true,
      wasOffline: true,
      lastOnlineTime: now,
    }));

    // Execute pending operations
    while (pendingOperations.current.length > 0) {
      const operation = pendingOperations.current.shift();
      operation?.();
    }

    updateNetworkInfo();
  }, [updateNetworkInfo]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOnline: false,
      wasOffline: prev.wasOffline,
      lastOfflineTime: new Date(),
    }));
  }, []);

  // Handle connection change
  const handleConnectionChange = useCallback(() => {
    updateNetworkInfo();
  }, [updateNetworkInfo]);

  // Check connection quality
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/ping", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Queue operation to run when online
  const syncWhenOnline = useCallback(
    <T>(operation: () => Promise<T>): Promise<T | null> => {
      return new Promise((resolve) => {
        if (state.isOnline) {
          // Execute immediately if online
          operation()
            .then(resolve)
            .catch(() => resolve(null));
        } else {
          // Queue for later
          pendingOperations.current.push(async () => {
            try {
              const result = await operation();
              resolve(result);
            } catch {
              resolve(null);
            }
          });
        }
      });
    },
    [state.isOnline],
  );

  // Check if was recently offline
  const wasRecentlyOffline = useCallback(
    (withinMs: number = 60000): boolean => {
      if (!state.wasOffline || !state.lastOnlineTime) return false;
      return Date.now() - state.lastOnlineTime.getTime() < withinMs;
    },
    [state.wasOffline, state.lastOnlineTime],
  );

  // Set up event listeners
  useEffect(() => {
    // Initial network info
    updateNetworkInfo();

    // Online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network information API
    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      nav.connection.addEventListener("change", handleConnectionChange);
    }

    // Visibility change (app returning from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateNetworkInfo();
        checkConnection().then((isOnline) => {
          if (isOnline && !state.isOnline) {
            handleOnline();
          } else if (!isOnline && state.isOnline) {
            handleOffline();
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (nav.connection) {
        nav.connection.removeEventListener("change", handleConnectionChange);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    handleOnline,
    handleOffline,
    handleConnectionChange,
    updateNetworkInfo,
    checkConnection,
    state.isOnline,
  ]);

  return {
    ...state,
    checkConnection,
    syncWhenOnline,
    wasRecentlyOffline,
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook to queue actions for when app comes back online
 */
export function useOfflineQueue() {
  const queue = useRef<(() => void)[]>([]);
  const { isOnline } = useOffline();

  useEffect(() => {
    if (isOnline && queue.current.length > 0) {
      console.log(
        `[useOfflineQueue] Executing ${queue.current.length} queued operations`,
      );

      while (queue.current.length > 0) {
        const operation = queue.current.shift();
        try {
          operation?.();
        } catch (error) {
          console.error("[useOfflineQueue] Queued operation failed:", error);
        }
      }
    }
  }, [isOnline]);

  const enqueue = useCallback(
    (operation: () => void, immediateIfOnline = true) => {
      if (isOnline && immediateIfOnline) {
        operation();
      } else {
        queue.current.push(operation);
      }
    },
    [isOnline],
  );

  const clearQueue = useCallback(() => {
    queue.current = [];
  }, []);

  const getQueueSize = useCallback(() => queue.current.length, []);

  return { enqueue, clearQueue, getQueueSize, isOnline };
}

/**
 * Hook to debounce network-dependent operations
 */
export function useNetworkDebounce<T>(
  value: T,
  delay: number = 1000,
  requireOnline: boolean = true,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const { isOnline } = useOffline();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (requireOnline && !isOnline) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, isOnline, requireOnline]);

  return debouncedValue;
}

export default useOffline;
