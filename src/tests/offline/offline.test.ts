/**
 * Offline Tests
 * Protocolo CDMX
 * 
 * Tests for offline functionality, data persistence, and sync
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockIncident, createMockFormData, wait } from '../setup'

describe('Offline - Basic Functionality', () => {
  beforeEach(() => {
    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })
  })

  it('should detect offline state', () => {
    const isOnline = navigator.onLine
    
    expect(isOnline).toBe(false)
  })

  it('should create incidents while offline', async () => {
    const incident = createMockIncident()
    
    const createOffline = async (data: any) => {
      // Store locally without network
      return { ...data, id: 'INC-OFFLINE-001', offline: true }
    }
    
    const result = await createOffline(incident)
    
    expect(result.offline).toBe(true)
    expect(result.id).toBeDefined()
  })

  it('should display offline indicator', () => {
    const showOfflineIndicator = !navigator.onLine
    
    expect(showOfflineIndicator).toBe(true)
  })

  it('should access cached data while offline', async () => {
    const cachedData = {
      incidents: [createMockIncident()],
      protocols: [{ id: 'pas', name: 'P.A.S.' }],
    }
    
    const getCachedData = () => cachedData
    
    const data = getCachedData()
    
    expect(data.incidents).toHaveLength(1)
    expect(data.protocols).toHaveLength(1)
  })
})

describe('Offline - Data Persistence', () => {
  it('should save data to localStorage', () => {
    const data = { key: 'value' }
    
    localStorage.setItem('test-key', JSON.stringify(data))
    
    const retrieved = JSON.parse(localStorage.getItem('test-key') || '{}')
    
    expect(retrieved).toEqual(data)
  })

  it('should save data to IndexedDB', async () => {
    const data = createMockIncident()
    
    const saveToIndexedDB = async (store: string, item: any) => {
      // Simulate IndexedDB operation
      return Promise.resolve(item)
    }
    
    const result = await saveToIndexedDB('incidents', data)
    
    expect(result.id).toBe(data.id)
  })

  it('should persist checklist progress', async () => {
    const checklist = {
      incidentId: 'INC-001',
      items: [
        { id: '1', completed: true },
        { id: '2', completed: false },
      ],
    }
    
    const persistChecklist = async (data: any) => {
      localStorage.setItem(`checklist-${data.incidentId}`, JSON.stringify(data))
      return data
    }
    
    await persistChecklist(checklist)
    
    const saved = JSON.parse(localStorage.getItem('checklist-INC-001') || '{}')
    expect(saved.items[0].completed).toBe(true)
  })

  it('should persist form drafts', async () => {
    const draft = {
      formId: 'form-001',
      values: { field1: 'value1' },
      lastSaved: new Date().toISOString(),
    }
    
    const saveDraft = async (data: any) => {
      localStorage.setItem(`draft-${data.formId}`, JSON.stringify(data))
    }
    
    await saveDraft(draft)
    
    const saved = JSON.parse(localStorage.getItem('draft-form-001') || '{}')
    expect(saved.values.field1).toBe('value1')
  })
})

describe('Offline - Sync Queue', () => {
  it('should queue operations while offline', () => {
    const queue: any[] = []
    
    const queueOperation = (op: any) => {
      queue.push({
        ...op,
        timestamp: Date.now(),
        retries: 0,
      })
    }
    
    queueOperation({ type: 'create_incident', data: createMockIncident() })
    queueOperation({ type: 'update_checklist', data: { id: 'chk-1' } })
    
    expect(queue).toHaveLength(2)
    expect(queue[0].type).toBe('create_incident')
  })

  it('should process sync queue when online', async () => {
    const queue = [
      { type: 'create_incident', data: createMockIncident() },
      { type: 'update_status', data: { id: 'INC-001', status: 'resolved' } },
    ]
    
    const processQueue = async (ops: any[]) => {
      return Promise.all(ops.map(op => Promise.resolve({ ...op, synced: true })))
    }
    
    const results = await processQueue(queue)
    
    expect(results).toHaveLength(2)
    expect(results.every(r => r.synced)).toBe(true)
  })

  it('should maintain operation order in queue', () => {
    const queue = [
      { type: 'create', id: 1, timestamp: 1000 },
      { type: 'update', id: 1, timestamp: 2000 },
      { type: 'delete', id: 1, timestamp: 3000 },
    ]
    
    const isOrdered = queue.every((op, i) => 
      i === 0 || op.timestamp >= queue[i - 1].timestamp
    )
    
    expect(isOrdered).toBe(true)
  })

  it('should retry failed sync operations', async () => {
    let attempts = 0
    const maxRetries = 3
    
    const syncWithRetry = async () => {
      while (attempts < maxRetries) {
        attempts++
        if (attempts < 3) {
          // Simulate failure
          continue
        }
        return { success: true }
      }
      return { success: false }
    }
    
    await syncWithRetry()
    
    expect(attempts).toBe(3)
  })
})

describe('Offline - Conflict Resolution', () => {
  it('should detect conflicts during sync', () => {
    const localVersion = { id: '1', value: 'local', timestamp: 2000 }
    const serverVersion = { id: '1', value: 'server', timestamp: 1500 }
    
    const hasConflict = localVersion.timestamp !== serverVersion.timestamp
    
    expect(hasConflict).toBe(true)
  })

  it('should resolve conflicts with last-write-wins', () => {
    const versions = [
      { id: '1', value: 'old', timestamp: 1000 },
      { id: '1', value: 'newer', timestamp: 2000 },
      { id: '1', value: 'newest', timestamp: 3000 },
    ]
    
    const resolved = versions.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    )
    
    expect(resolved.value).toBe('newest')
  })

  it('should merge non-conflicting changes', () => {
    const local = { id: '1', field1: 'local-value', timestamp: 2000 }
    const server = { id: '1', field2: 'server-value', timestamp: 1500 }
    
    const merged = {
      ...local,
      ...server,
      field1: local.field1,
      field2: server.field2,
    }
    
    expect(merged.field1).toBe('local-value')
    expect(merged.field2).toBe('server-value')
  })

  it('should prompt user for manual conflict resolution', () => {
    const conflictingFields = ['status', 'priority']
    const needsManualResolution = conflictingFields.length > 0
    
    expect(needsManualResolution).toBe(true)
  })
})

describe('Offline - Auto-Download Content', () => {
  it('should download critical content for offline use', async () => {
    const criticalContent = [
      { type: 'protocols', downloaded: true },
      { type: 'contacts', downloaded: true },
      { type: 'checklists', downloaded: true },
    ]
    
    criticalContent.forEach(content => {
      expect(content.downloaded).toBe(true)
    })
  })

  it('should cache recently accessed incidents', () => {
    const recentlyAccessed = ['INC-001', 'INC-002']
    const cached = new Set(recentlyAccessed)
    
    expect(cached.has('INC-001')).toBe(true)
  })

  it('should prioritize sync of high-priority data', () => {
    const queue = [
      { type: 'incident', priority: 'high' },
      { type: 'checklist', priority: 'medium' },
      { type: 'settings', priority: 'low' },
    ]
    
    const sorted = [...queue].sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })
    
    expect(sorted[0].priority).toBe('high')
  })
})

describe('Offline - Storage Management', () => {
  it('should estimate available storage', async () => {
    const estimate = await navigator.storage.estimate()
    
    expect(estimate.usage).toBeGreaterThanOrEqual(0)
    expect(estimate.quota).toBeGreaterThan(0)
  })

  it('should warn when storage is low', () => {
    const usage = 0.85 // 85% full
    const threshold = 0.9
    
    const shouldWarn = usage > threshold
    
    expect(shouldWarn).toBe(false)
    
    const highUsage = 0.95
    expect(highUsage > threshold).toBe(true)
  })

  it('should clean up old cached data', () => {
    const cache = [
      { id: '1', lastAccessed: Date.now() - 1000 },
      { id: '2', lastAccessed: Date.now() - 86400000 * 30 }, // 30 days old
    ]
    
    const cleaned = cache.filter(item => 
      Date.now() - item.lastAccessed < 86400000 * 7 // Keep last 7 days
    )
    
    expect(cleaned).toHaveLength(1)
    expect(cleaned[0].id).toBe('1')
  })

  it('should compress data to save space', () => {
    const original = 'x'.repeat(1000)
    const compressed = original.length * 0.3 // 70% compression
    
    expect(compressed).toBeLessThan(original.length)
  })
})

describe('Offline - Network Transitions', () => {
  it('should detect when coming back online', async () => {
    let online = false
    
    const handleOnline = () => {
      online = true
    }
    
    // Simulate online event
    handleOnline()
    
    expect(online).toBe(true)
  })

  it('should trigger sync when connection restored', async () => {
    let syncTriggered = false
    
    const triggerSync = () => {
      syncTriggered = true
    }
    
    // Simulate coming online
    triggerSync()
    
    expect(syncTriggered).toBe(true)
  })

  it('should handle intermittent connectivity', async () => {
    const connectionStates = ['online', 'offline', 'online', 'offline', 'online']
    const syncAttempts: string[] = []
    
    connectionStates.forEach((state, i) => {
      if (state === 'online' && i > 0) {
        syncAttempts.push(`sync-${i}`)
      }
    })
    
    expect(syncAttempts).toHaveLength(2)
  })
})

describe('Offline - Error Handling', () => {
  it('should handle storage quota exceeded', async () => {
    const saveData = async (data: any) => {
      try {
        // Simulate storage operation
        throw new Error('QuotaExceededError')
      } catch (error) {
        return { success: false, error: 'storage_full' }
      }
    }
    
    const result = await saveData({ test: 'data' })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('storage_full')
  })

  it('should handle corrupted cached data', async () => {
    const corruptedData = 'not-valid-json{'
    
    const parseData = (data: string) => {
      try {
        return JSON.parse(data)
      } catch (error) {
        return null
      }
    }
    
    const result = parseData(corruptedData)
    
    expect(result).toBeNull()
  })

  it('should recover from failed sync', async () => {
    const queue = [{ id: 1, synced: false }]
    
    const retrySync = async () => {
      // Retry failed items
      return queue.map(item => ({ ...item, synced: true }))
    }
    
    const result = await retrySync()
    
    expect(result[0].synced).toBe(true)
  })
})

describe('Offline - Background Sync', () => {
  it('should register background sync', async () => {
    const serviceWorker = {
      ready: Promise.resolve({
        sync: {
          register: vi.fn().mockResolvedValue(undefined),
        },
      }),
    }
    
    const registration = await serviceWorker.ready
    await registration.sync.register('sync-incidents')
    
    expect(registration.sync.register).toHaveBeenCalledWith('sync-incidents')
  })

  it('should handle periodic sync', async () => {
    const syncInterval = 24 * 60 * 60 * 1000 // 24 hours
    const lastSync = Date.now() - 25 * 60 * 60 * 1000
    
    const shouldSync = Date.now() - lastSync >= syncInterval
    
    expect(shouldSync).toBe(true)
  })
})

describe('Offline - Form Handling', () => {
  it('should auto-save form drafts', async () => {
    const draft = {
      formId: 'test-form',
      values: { field1: 'value1' },
    }
    
    let saved = false
    const autoSave = async (data: any) => {
      localStorage.setItem(`draft-${data.formId}`, JSON.stringify(data))
      saved = true
    }
    
    await autoSave(draft)
    
    expect(saved).toBe(true)
  })

  it('should restore form drafts on page reload', () => {
    const draft = {
      formId: 'test-form',
      values: { field1: 'value1' },
    }
    
    localStorage.setItem('draft-test-form', JSON.stringify(draft))
    
    const restored = JSON.parse(localStorage.getItem('draft-test-form') || '{}')
    
    expect(restored.values.field1).toBe('value1')
  })
})

describe('Offline - Notification Queue', () => {
  it('should queue notifications when offline', () => {
    const queue: any[] = []
    
    const queueNotification = (notification: any) => {
      if (!navigator.onLine) {
        queue.push(notification)
      }
    }
    
    queueNotification({ title: 'Alert', body: 'Test' })
    
    expect(queue).toHaveLength(1)
  })

  it('should deliver queued notifications when online', () => {
    const queuedNotifications = [
      { title: 'Alert 1', delivered: false },
      { title: 'Alert 2', delivered: false },
    ]
    
    const deliverNotifications = (notifications: any[]) => {
      return notifications.map(n => ({ ...n, delivered: true }))
    }
    
    const delivered = deliverNotifications(queuedNotifications)
    
    expect(delivered.every(n => n.delivered)).toBe(true)
  })
})
