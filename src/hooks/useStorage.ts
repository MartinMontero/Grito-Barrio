/**
 * useStorage Hooks
 * Protocolo CDMX
 * 
 * React hooks for interacting with localStorage, sessionStorage, and IndexedDB
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { storage } from '@/lib/storage'
import { db, type StoreName, type QueryOptions } from '@/lib/db'

// =============================================================================
// LOCALSTORAGE HOOK
// =============================================================================

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serializer = options?.serialize || JSON.stringify
  const deserializer = options?.deserialize || JSON.parse
  
  // Get initial value
  const getStoredValue = useCallback((): T => {
    try {
      const stored = storage.local.get<string>(key)
      if (stored !== undefined) {
        return deserializer(stored as unknown as string)
      }
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}":`, error)
    }
    return defaultValue
  }, [key, defaultValue, deserializer])
  
  const [value, setValue] = useState<T>(getStoredValue)
  
  // Update storage when value changes
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue
      
      try {
        storage.local.set(key, serializer(valueToStore))
      } catch (error) {
        console.error(`[useLocalStorage] Error writing key "${key}":`, error)
      }
      
      return valueToStore
    })
  }, [key, serializer])
  
  // Remove from storage
  const removeValue = useCallback(() => {
    storage.local.remove(key)
    setValue(defaultValue)
  }, [key, defaultValue])
  
  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(deserializer(event.newValue))
        } catch (error) {
          console.error(`[useLocalStorage] Error parsing key "${key}":`, error)
        }
      } else if (event.key === key && event.newValue === null) {
        setValue(defaultValue)
      }
    }
    
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, defaultValue, deserializer])
  
  return [value, setStoredValue, removeValue]
}

// =============================================================================
// SESSIONSTORAGE HOOK
// =============================================================================

export function useSessionStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const getStoredValue = useCallback((): T => {
    return storage.session.get<T>(key) ?? defaultValue
  }, [key, defaultValue])
  
  const [value, setValue] = useState<T>(getStoredValue)
  
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue
      storage.session.set(key, valueToStore)
      return valueToStore
    })
  }, [key])
  
  const removeValue = useCallback(() => {
    storage.session.remove(key)
    setValue(defaultValue)
  }, [key, defaultValue])
  
  return [value, setStoredValue, removeValue]
}

// =============================================================================
// INDEXEDDB SINGLE ITEM HOOK
// =============================================================================

interface UseIndexedDBOptions {
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: unknown) => void
}

export function useIndexedDB<T>(
  storeName: StoreName,
  id: string | number | null,
  options: UseIndexedDBOptions = {}
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  update: (data: T) => Promise<boolean>
  remove: () => Promise<boolean>
} {
  const { enabled = true, onError, onSuccess } = options
  
  const [state, setState] = useState<{
    data: T | null
    isLoading: boolean
    error: Error | null
  }>({
    data: null,
    isLoading: enabled && id !== null,
    error: null
  })
  
  const isMounted = useRef(true)
  
  const fetchData = useCallback(async () => {
    if (!enabled || id === null) {
      setState({ data: null, isLoading: false, error: null })
      return
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await db.get<T>(storeName, id)
      
      if (!isMounted.current) return
      
      if (result.success) {
        setState({
          data: result.data || null,
          isLoading: false,
          error: null
        })
        onSuccess?.(result.data)
      } else {
        throw result.error || new Error('Failed to fetch data')
      }
    } catch (error) {
      if (!isMounted.current) return
      
      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, isLoading: false, error: err }))
      onError?.(err)
    }
  }, [storeName, id, enabled, onError, onSuccess])
  
  const update = useCallback(async (data: T): Promise<boolean> => {
    if (id === null) return false
    
    try {
      const result = await db.put(storeName, data)
      
      if (result.success) {
        setState(prev => ({ ...prev, data }))
        return true
      }
      throw result.error || new Error('Failed to update')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      return false
    }
  }, [storeName, id, onError])
  
  const remove = useCallback(async (): Promise<boolean> => {
    if (id === null) return false
    
    try {
      const result = await db.delete(storeName, id)
      
      if (result.success) {
        setState({ data: null, isLoading: false, error: null })
        return true
      }
      throw result.error || new Error('Failed to delete')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      return false
    }
  }, [storeName, id, onError])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])
  
  return {
    ...state,
    refetch: fetchData,
    update,
    remove
  }
}

// =============================================================================
// INDEXEDDB LIST HOOK
// =============================================================================

interface UseIDBListOptions extends QueryOptions {
  enabled?: boolean
  refreshInterval?: number
  onError?: (error: Error) => void
}

export function useIDBList<T>(
  storeName: StoreName,
  options: UseIDBListOptions = {}
): {
  data: T[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  add: (item: T) => Promise<boolean>
  update: (id: string | number, item: T) => Promise<boolean>
  remove: (id: string | number) => Promise<boolean>
  refresh: () => void
} {
  const {
    enabled = true,
    refreshInterval,
    onError,
    ...queryOptions
  } = options
  
  const [state, setState] = useState<{
    data: T[]
    isLoading: boolean
    error: Error | null
  }>({
    data: [],
    isLoading: enabled,
    error: null
  })
  
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const isMounted = useRef(true)
  const intervalRef = useRef<NodeJS.Timeout>()
  
  const fetchData = useCallback(async () => {
    if (!enabled) {
      setState({ data: [], isLoading: false, error: null })
      return
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      let result
      
      if (queryOptions.index) {
        result = await db.getByIndex<T>(
          storeName,
          queryOptions.index,
          queryOptions.range || null,
          queryOptions
        )
      } else {
        result = await db.getAll<T>(storeName, queryOptions)
      }
      
      if (!isMounted.current) return
      
      if (result.success) {
        setState({
          data: result.data || [],
          isLoading: false,
          error: null
        })
      } else {
        throw result.error || new Error('Failed to fetch list')
      }
    } catch (error) {
      if (!isMounted.current) return
      
      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, isLoading: false, error: err }))
      onError?.(err)
    }
  }, [storeName, enabled, onError, ...Object.values(queryOptions), refreshTrigger])
  
  const add = useCallback(async (item: T): Promise<boolean> => {
    try {
      const result = await db.put(storeName, item)
      
      if (result.success) {
        setRefreshTrigger(n => n + 1)
        return true
      }
      throw result.error || new Error('Failed to add item')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      return false
    }
  }, [storeName, onError])
  
  const update = useCallback(async (id: string | number, item: T): Promise<boolean> => {
    try {
      const result = await db.put(storeName, item)
      
      if (result.success) {
        setRefreshTrigger(n => n + 1)
        return true
      }
      throw result.error || new Error('Failed to update item')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      return false
    }
  }, [storeName, onError])
  
  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const result = await db.delete(storeName, id)
      
      if (result.success) {
        setRefreshTrigger(n => n + 1)
        return true
      }
      throw result.error || new Error('Failed to delete item')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      return false
    }
  }, [storeName, onError])
  
  const refresh = useCallback(() => {
    setRefreshTrigger(n => n + 1)
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refreshInterval)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refreshInterval, enabled, fetchData])
  
  useEffect(() => {
    return () => {
      isMounted.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  return {
    ...state,
    refetch: fetchData,
    add,
    update,
    remove,
    refresh
  }
}

// =============================================================================
// STORAGE QUOTA HOOK
// =============================================================================

export function useStorageQuota() {
  const [quota, setQuota] = useState(storage.getStats())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setQuota(storage.getStats())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  return quota
}

// =============================================================================
// PERSISTENT STATE HOOK (Zustand-like)
// =============================================================================

export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setStoredValue, removeValue] = useLocalStorage<T>(key, defaultValue)
  
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (newValue === null) {
      removeValue()
    } else {
      setStoredValue(newValue)
    }
  }, [setStoredValue, removeValue])
  
  return [value, setValue]
}

// =============================================================================
// SYNC EXTERNAL STORE VERSION (React 18+)
// =============================================================================

export function useStorageSync<T>(key: string, defaultValue: T): T {
  const getSnapshot = useCallback(() => {
    return storage.local.get<T>(key) ?? defaultValue
  }, [key, defaultValue])
  
  const getServerSnapshot = useCallback(() => {
    return defaultValue
  }, [defaultValue])
  
  const subscribe = useCallback((callback: () => void) => {
    return storage.local.watch<T>(key, callback)
  }, [key])
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  useLocalStorage,
  useSessionStorage,
  useIndexedDB,
  useIDBList,
  useStorageQuota,
  usePersistentState,
  useStorageSync
}
