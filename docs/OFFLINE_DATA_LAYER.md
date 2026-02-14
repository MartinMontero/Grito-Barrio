# Offline-First Data Layer

Protocolo CDMX uses a comprehensive offline-first data layer that ensures all critical functionality works without internet connectivity.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
├─────────────────────────────────────────────────────────────┤
│  useOffline  │  useStorage  │  useIndexedDB  │  useIDBList  │
├─────────────────────────────────────────────────────────────┤
│                      Storage Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ localStorage │  │sessionStorage│  │  IndexedDB   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Persistence Layer                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Sync    │  │Migration │  │  Backup  │  │Compression│  │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
src/
├── lib/
│   ├── db.ts           # IndexedDB wrapper with encryption
│   ├── storage.ts      # Storage utilities (local/session/FileSystem)
│   ├── sync.ts         # Offline sync with queue management
│   ├── compression.ts  # Data compression (LZ-String)
│   ├── migration.ts    # Data migration utilities
│   └── backup.ts       # Backup/export/import functionality
├── hooks/
│   ├── useOffline.ts   # Network detection hook
│   └── useStorage.ts   # Storage interaction hooks
└── lib/index.ts        # Unified exports
```

## 1. IndexedDB Wrapper (src/lib/db.ts)

### Features
- **9 Object Stores**: incidents, documentation, safePoints, contacts, checklists, users, settings, syncQueue, backups
- **Encryption Support**: Transparent encryption/decryption for sensitive stores
- **Indexes**: Optimized queries for each store
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Comprehensive error handling with retryable error detection

### API

```typescript
import { db, type StoreName } from '@/lib/db'

// Initialize
await db.init()

// CRUD Operations
const result = await db.get('incidents', 'CDMX-2024-01-15-1430-001')
const all = await db.getAll('incidents')
const filtered = await db.getByIndex('incidents', 'status', 'active')
await db.put('incidents', incidentData)
await db.delete('incidents', 'CDMX-2024-01-15-1430-001')

// Batch Operations
await db.putBatch('incidents', [incident1, incident2, incident3])
await db.deleteBatch('incidents', ['id1', 'id2', 'id3'])

// Export/Import
const allData = await db.exportAll()
const stats = await db.getStats()

// Encryption
db.setEncryptionKey('user-provided-key')
```

### Store Configuration

```typescript
const stores = [
  {
    name: 'incidents',
    keyPath: 'id',
    encrypted: true,
    indexes: ['timestamp', 'status', 'threatLevel', 'location']
  },
  {
    name: 'documentation',
    keyPath: 'id',
    encrypted: true,
    indexes: ['incidentId', 'timestamp', 'type']
  },
  // ... more stores
]
```

## 2. Storage Utilities (src/lib/storage.ts)

### Features
- **localStorage Wrapper**: JSON serialization, compression, TTL support
- **sessionStorage**: Temporary data storage
- **File System API**: Large file storage (Chrome/Edge)
- **Memory Storage**: Fallback when browser storage unavailable
- **Quota Management**: Storage usage tracking

### API

```typescript
import { storage, LocalStorageWrapper, SessionStorageWrapper } from '@/lib/storage'

// Local Storage
storage.local.set('userPrefs', { theme: 'dark' }, { compress: true, ttl: 86400000 })
const prefs = storage.local.get('userPrefs')
storage.local.remove('userPrefs')
const keys = storage.local.getKeys()

// Session Storage
storage.session.set('tempData', data)

// File System (if supported)
if (storage.fileSystem.isSupported()) {
  await storage.fileSystem.requestAccess()
  await storage.fileSystem.saveFile('evidence.jpg', blob)
  const content = await storage.fileSystem.readFile('evidence.jpg')
}

// Storage Stats
const stats = storage.getStats()
console.log(`LocalStorage: ${stats.localStorage.percentage * 100}% used`)

// Persistence (for store-helpers)
await storeData('myKey', data, true)  // encrypt
const data = await getData('myKey', true)  // decrypt
```

## 3. Sync Logic (src/lib/sync.ts)

### Features
- **Action Queue**: FIFO queue for offline actions
- **Conflict Resolution**: Server wins / Client wins / Manual
- **Retry Logic**: Exponential backoff with max retry limit
- **Auto-Sync**: Configurable automatic sync when online
- **Priority System**: High priority actions sync first

### API

```typescript
import { syncEngine, syncQueue, queueAction, ConflictResolver } from '@/lib/sync'

// Initialize
await syncEngine.init()

// Queue Actions
const actionId = queueAction('CREATE', 'incidents', incidentData, 1)  // priority 1
syncQueue.add({
  type: 'UPDATE',
  store: 'incidents',
  data: updatedIncident,
  priority: 1
})

// Manual Sync
const results = await syncEngine.sync()

// Subscribe to State
const unsubscribe = syncEngine.subscribe(state => {
  console.log(`Pending: ${state.pendingCount}, Failed: ${state.failedCount}`)
  console.log(`Syncing: ${state.isSyncing}, Online: ${state.isOnline}`)
})

// Retry Failed
await syncEngine.retryFailed()

// Conflict Resolution
const resolution = ConflictResolver.resolve(
  clientData,
  serverData,
  'manual'  // or 'server_wins' / 'client_wins'
)
```

### Sync State

```typescript
interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingCount: number
  failedCount: number
  syncProgress: number  // 0-100
  currentAction?: string
}
```

## 4. Compression (src/lib/compression.ts)

### Features
- **LZ-String Algorithm**: Built-in compression, no dependencies
- **Automatic Detection**: Auto-detect compressed data
- **Size Optimization**: Only compress if beneficial
- **Stats**: Track compression ratios

### API

```typescript
import { compress, decompress, compressIfBeneficial, getCompressionStats } from '@/lib/compression'

// Compress
const compressed = compress(largeString)
const original = decompress(compressed)

// Smart Compression
const result = compressIfBeneficial(data, 0.9)  // only if < 90% original size
if (result.algorithm !== 'none') {
  console.log(`Saved ${result.savings}`)
}

// Stats
const stats = getCompressionStats(data)
console.log(`Ratio: ${(stats.ratio * 100).toFixed(1)}%`)
```

## 5. Data Migration (src/lib/migration.ts)

### Features
- **Version Tracking**: Automatic schema versioning
- **Rollback Support**: Rollback failed migrations
- **Integrity Validation**: Check data integrity
- **Auto-Repair**: Fix corrupted data

### API

```typescript
import { migrationManager, initMigrations, validateData, fixDataIntegrity } from '@/lib/migration'

// Initialize (auto-migrates if needed)
await initMigrations()

// Check Status
const state = migrationManager.getState()
console.log(`Version: ${state.currentVersion}`)

// Validate Integrity
const report = await validateData()
if (!report.valid) {
  console.error('Errors:', report.errors)
}

// Fix Issues
const { fixed, errors } = await fixDataIntegrity()
console.log(`Fixed ${fixed} items`)

// Register Custom Migration
registerMigration({
  version: 2,
  name: 'Add new field',
  description: 'Add priority field to incidents',
  migrate: async () => {
    // Migration logic
    return true
  },
  rollback: async () => {
    // Rollback logic
    return true
  }
})
```

## 6. Backup & Export (src/lib/backup.ts)

### Features
- **Full Backup**: Complete database export
- **Selective Export**: Export specific incidents/date ranges
- **Encryption**: Optional backup encryption
- **Import**: Restore from backup with merge/replace options
- **Sharing**: Export specific incidents for collaboration

### API

```typescript
import { 
  createBackup, 
  exportData, 
  importData, 
  listBackups, 
  shareIncident,
  backupManager 
} from '@/lib/backup'

// Create Backup
const backup = await createBackup('full', 'Manual backup before update')

// Export with Options
const result = await exportData({
  stores: ['incidents', 'documentation'],
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  },
  encrypt: true
})

// Import
const input = document.createElement('input')
input.type = 'file'
input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files![0]
  const result = await importData(file, {
    merge: true,
    validate: true,
    backupBeforeImport: true
  })
  console.log(`Imported ${result.imported} items`)
}

// Share Specific Incident
await shareIncident(['CDMX-2024-01-15-1430-001'], true)

// List Backups
const backups = await listBackups()
backups.forEach(b => {
  console.log(`${b.timestamp}: ${b.type} (${b.size} bytes)`)
})

// Schedule Automatic Backups
backupManager.scheduleBackups(24)  // every 24 hours
```

## 7. React Hooks

### useOffline Hook

```typescript
import { useOffline } from '@/hooks/useOffline'

function MyComponent() {
  const { 
    isOnline, 
    wasOffline, 
    connectionType,
    effectiveType,
    isSlowConnection,
    checkConnection,
    syncWhenOnline,
    wasRecentlyOffline 
  } = useOffline()

  // Queue action for when online
  useEffect(() => {
    syncWhenOnline(async () => {
      await syncEngine.sync()
    })
  }, [])

  return (
    <div>
      {!isOnline && <Banner>Offline Mode</Banner>}
      {isSlowConnection && <Warning>Slow connection detected</Warning>}
    </div>
  )
}
```

### useStorage Hooks

```typescript
import { 
  useLocalStorage, 
  useSessionStorage, 
  useIndexedDB, 
  useIDBList,
  useStorageQuota 
} from '@/hooks/useStorage'

// Local Storage
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')

// Session Storage
const [tempData, setTempData, clearTemp] = useSessionStorage('temp', {})

// IndexedDB Single Item
const { 
  data: incident, 
  isLoading, 
  error, 
  refetch,
  update,
  remove 
} = useIndexedDB('incidents', 'CDMX-2024-01-15-1430-001')

// IndexedDB List with pagination
const { 
  data: incidents, 
  isLoading, 
  error,
  refetch,
  add,
  update: updateItem,
  remove: removeItem,
  refresh 
} = useIDBList('incidents', {
  index: 'status',
  limit: 50,
  offset: 0,
  refreshInterval: 30000  // auto-refresh every 30s
})

// Storage Quota Monitor
const quota = useStorageQuota()
useEffect(() => {
  if (quota.localStorage.percentage > 0.9) {
    alert('Storage almost full!')
  }
}, [quota])
```

## Usage Examples

### Complete Offline-First Workflow

```typescript
// 1. Initialize everything on app start
async function initApp() {
  await db.init()
  await migrationManager.init()
  await syncEngine.init()
  backupManager.scheduleBackups(24)
}

// 2. Use in components
function IncidentManager() {
  const { isOnline } = useOffline()
  const { data: incidents, add } = useIDBList('incidents')

  const createIncident = async (data) => {
    // Save locally first
    await add(data)
    
    // Queue for sync
    if (isOnline) {
      queueAction('CREATE', 'incidents', data)
    }
  }
}

// 3. Periodic maintenance
setInterval(async () => {
  // Clean up old completed sync actions
  syncQueue.clearCompleted()
  
  // Check data integrity
  const report = await validateData()
  if (!report.valid) {
    await fixDataIntegrity()
  }
}, 60000 * 60)  // hourly
```

## Configuration

### Default Configs

```typescript
// Sync Config
const defaultSyncConfig = {
  autoSync: true,
  syncInterval: 30000,  // 30 seconds
  retryDelay: 5000,     // 5 seconds
  maxRetries: 5,
  batchSize: 10,
  conflictResolution: 'manual'
}

// Storage Config
const defaultStorageOptions = {
  compress: true,
  ttl: 7 * 24 * 60 * 60 * 1000,  // 7 days
  priority: 'normal'
}

// IndexedDB Config
const DB_CONFIG = {
  name: 'ProtocoloCDMX',
  version: 1,
  maxRetries: 3,
  retryDelay: 1000
}
```

## Error Handling

All functions return structured results:

```typescript
interface DBOperationResult<T> {
  success: boolean
  data?: T
  error?: Error
  retryable?: boolean
}

// Usage
const result = await db.get('incidents', id)
if (result.success) {
  console.log(result.data)
} else if (result.retryable) {
  // Retry logic
} else {
  console.error(result.error)
}
```

## Performance Tips

1. **Batch Operations**: Use `putBatch` and `deleteBatch` for multiple items
2. **Indexing**: Query by indexed fields for faster lookups
3. **Compression**: Enable compression for large items
4. **Pagination**: Use `limit` and `offset` for large lists
5. **Lazy Loading**: Load data only when needed
6. **Debouncing**: Debounce frequent updates to storage

## Security

1. **Encryption**: Enable for sensitive stores (incidents, documentation, users)
2. **Key Management**: Store encryption key securely (not in localStorage)
3. **Validation**: Always validate data integrity after import
4. **Sanitization**: Sanitize data before storage

## Browser Support

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **File System API**: Chrome 86+, Edge 86+
- **Storage API**: Chrome 52+, Firefox 51+, Safari 15+
- **Fallbacks**: Graceful degradation to localStorage/memory
