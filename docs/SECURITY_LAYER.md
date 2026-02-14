# Security Layer Documentation

Protocolo CDMX implements military-grade security features to protect sensitive data in high-risk situations.

## Overview

The security layer provides:
- **AES-256-GCM Encryption** for all sensitive data
- **Duress Mode** with fake data display
- **Auto-Lock** after inactivity
- **Panic Wipe** for emergency data destruction
- **Metadata Stripping** to remove EXIF data from media
- **Location Fuzzing** to protect exact coordinates
- **Brute Force Protection** with lockout mechanisms
- **Comprehensive Audit Logging**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layer                          │
├─────────────────────────────────────────────────────────────┤
│  crypto.ts     │   security.ts    │   UI Components        │
│  ├─ AES-256    │   ├─ Duress      │   ├─ DuressMode       │
│  ├─ PBKDF2     │   ├─ Auto-lock   │   └─ SecuritySettings │
│  ├─ SHA-256    │   ├─ Panic Wipe  │                        │
│  └─ HMAC       │   └─ Audit Log   │                        │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
src/
├── lib/
│   ├── crypto.ts         # Web Crypto API implementation
│   ├── security.ts       # Security manager & features
│   └── encryption.ts     # Legacy compatibility layer
└── components/features/
    ├── DuressMode.tsx    # Duress mode UI
    └── SecuritySettings.tsx  # Security configuration
```

## 1. Cryptographic Utilities (src/lib/crypto.ts)

### Features
- **AES-256-GCM**: Authenticated encryption
- **PBKDF2**: Key derivation with 100,000 iterations
- **SHA-256**: Secure hashing
- **HMAC**: Message authentication
- **Secure Key Storage**: In-memory with automatic expiration

### API

```typescript
import { 
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
  generateSecureId
} from '@/lib/crypto'

// Encrypt data
const encrypted = await encrypt('sensitive data', 'password')
const encryptedString = await encryptToString({ foo: 'bar' }, 'password')

// Decrypt data
const decrypted = await decrypt(encrypted, 'password')
const decryptedString = await decryptFromString(encryptedString, 'password')

// Hashing
const hash = await sha256('data')
const signature = await hmac('data', 'secret-key')

// Password hashing
const passwordHash = await hashPassword('user-password')
const isValid = await verifyPassword('user-password', passwordHash)

// File encryption
const encryptedFile = await encryptFile(file, 'password', (progress) => {
  console.log(`Encryption: ${progress * 100}%`)
})

const decryptedFile = await decryptFile(encryptedFile, 'password', 'original.jpg')

// Secure key storage (session only)
await storeKeySecurely(cryptoKey)
const key = retrieveKey() // null if expired
```

### Constants

```typescript
{
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  ITERATIONS: 100000,
  SALT_LENGTH: 32,
  IV_LENGTH: 12,
  TAG_LENGTH: 128,
  HASH_ALGORITHM: 'SHA-256'
}
```

## 2. Security Manager (src/lib/security.ts)

### Features
- **Duress Password**: Secondary password that activates duress mode
- **Auto-Lock**: Automatic app locking after inactivity
- **Panic Wipe**: Scheduled or immediate data destruction
- **Metadata Stripping**: Remove EXIF from JPEG files
- **Location Fuzzing**: Add random noise to coordinates
- **Brute Force Protection**: Lockout after failed attempts
- **Security Audit Log**: Track all security events

### API

```typescript
import { 
  securityManager,
  setRealPassword,
  setDuressPassword,
  verifyPassword,
  activateDuressMode,
  deactivateDuressMode,
  lockApp,
  unlockApp,
  scheduleWipe,
  cancelWipe,
  executeWipe,
  stripExif,
  fuzzLocation,
  getLogs
} from '@/lib/security'

// Password Management
await setRealPassword('secure-password')
await setDuressPassword('duress-password')

const result = await verifyPassword('input-password')
// result: { valid: boolean, isDuress: boolean }

// Duress Mode
securityManager.activateDuressMode()
securityManager.deactivateDuressMode()

if (securityManager.isDuressActive()) {
  // Show fake data
}

// Hidden Access (5 rapid taps on gesture area)
securityManager.enableHiddenAccess()

// Auto-Lock
securityManager.setAutoLockTimeout(5) // 5 minutes
securityManager.lockApp()
securityManager.unlockApp()

// Panic Wipe
securityManager.scheduleWipe(10) // Wipe in 10 minutes
securityManager.cancelWipe()
securityManager.executeWipe() // Immediate wipe

// Metadata Stripping
const cleanFile = await securityManager.stripExif(file)

// Location Fuzzing
const fuzzed = securityManager.fuzzLocation(19.4326, -99.1332)
// Returns: { lat: ~19.43xx, lng: ~-99.13xx }

// Security Logging
securityManager.log('login', 'User logged in', 'comandante')
const logs = securityManager.getLogs()
```

### Configuration

```typescript
interface SecurityConfig {
  autoLockTimeout: number       // minutes
  panicWipeDelay: number        // minutes
  duressEnabled: boolean
  encryptionEnabled: boolean
  metadataStrippingEnabled: boolean
  locationFuzzingEnabled: boolean
  locationFuzzingRadius: number // meters
  maxFailedAttempts: number
  lockoutDuration: number       // minutes
}

// Update configuration
securityManager.updateConfig({
  autoLockTimeout: 10,
  encryptionEnabled: true,
  locationFuzzingRadius: 500
})
```

## 3. Duress Mode UI (src/components/features/DuressMode.tsx)

When duress password is entered:
1. App switches to duress mode
2. Displays fake incidents and contacts
3. Hides real data
4. Enables panic wipe countdown
5. Allows hidden access via secret gesture

### Secret Gesture
- **5 rapid taps** on the "Acceso Restringido" card
- Enables hidden data view
- Shows real incidents and data

### Usage

```tsx
import { DuressMode } from '@/components/features'

function App() {
  const [duressActive, setDuressActive] = useState(false)

  if (duressActive) {
    return <DuressMode onExit={() => setDuressActive(false)} />
  }

  return <NormalApp />
}
```

### Fake Data Displayed
- 3 fake resolved incidents
- Generic emergency contacts
- Basic protocol information

## 4. Security Settings (src/components/features/SecuritySettings.tsx)

Comprehensive security configuration UI with tabs:

### General Tab
- Auto-lock timeout slider
- Encryption toggle
- Metadata stripping toggle
- Location fuzzing with radius slider

### Password Tab
- Real password setup/change
- Duress password setup
- Password requirements enforcement

### Advanced Tab
- Panic wipe scheduling
- Immediate data wipe
- Encrypted backup export/import
- Brute force protection settings

### Logs Tab
- Security event history
- Export logs
- Clear logs

### Usage

```tsx
import { SecuritySettings } from '@/components/features'

function SettingsPage() {
  return <SecuritySettings />
}
```

## 5. Legacy Encryption (src/lib/encryption.ts)

Backward-compatible API using crypto-js as fallback.

```typescript
import { 
  encryptData, 
  decryptData, 
  hashData, 
  verifyHash 
} from '@/lib/encryption'

// These functions automatically use Web Crypto API if available,
// falling back to crypto-js for older browsers

const encrypted = await encryptData('data', 'password')
const decrypted = await decryptData(encrypted, 'password')
```

## Security Best Practices

### 1. Password Setup
```typescript
// 1. Set strong main password (min 6 chars, recommend 12+)
await securityManager.setRealPassword('StrongP@ssw0rd!')

// 2. Set different duress password
await securityManager.setDuressPassword('Different123!')

// 3. Never store passwords in plain text
// Security manager stores only PBKDF2 hashes
```

### 2. Duress Mode Workflow
```typescript
// In login flow
const result = await securityManager.verifyPassword(input)

if (result.valid && result.isDuress) {
  // User entered duress password
  // Show DuressMode component
  showDuressScreen()
} else if (result.valid) {
  // Normal login
  showMainApp()
} else {
  // Invalid password
  showError()
}
```

### 3. Auto-Lock Integration
```typescript
// Auto-lock is automatic, but you can:

// Manually lock
securityManager.lockApp()

// Manually unlock (after password verification)
securityManager.unlockApp()

// Check lock status
if (securityManager.isLocked()) {
  showLockScreen()
}

// Record activity to prevent auto-lock
securityManager.recordActivity()
```

### 4. Emergency Wipe
```typescript
// Schedule wipe (gives time to cancel)
securityManager.scheduleWipe(10) // 10 minutes

// Cancel if threat passes
securityManager.cancelWipe()

// Immediate wipe (no confirmation in production!)
if (confirm('Permanently delete ALL data?')) {
  await securityManager.executeWipe()
  // App will reload after wipe
}
```

### 5. Data Protection
```typescript
// Before storing sensitive data
const encrypted = await encryptToString(sensitiveData, password)
await db.put('incidents', { ...incident, data: encrypted })

// When retrieving
const encrypted = await db.get('incidents', id)
const decrypted = await decryptFromString(encrypted.data, password)

// Strip metadata from photos
const cleanPhoto = await securityManager.stripExif(photoFile)

// Fuzz location before storing
const exactLocation = { lat: 19.4326, lng: -99.1332 }
const fuzzed = securityManager.fuzzLocation(exactLocation.lat, exactLocation.lng)
```

## Integration Examples

### Complete Security Setup

```typescript
// 1. Initialize on app start
async function initSecurity() {
  // Check crypto support
  if (!isCryptoSupported()) {
    alert('Navegador no compatible con cifrado')
    return
  }

  // Set up passwords if not configured
  if (!securityManager.hasPassword()) {
    showPasswordSetup()
  }

  // Load configuration
  const config = securityManager.getConfig()
  
  // Enable features
  securityManager.updateConfig({
    encryptionEnabled: true,
    metadataStrippingEnabled: true,
    locationFuzzingEnabled: true,
    autoLockTimeout: 5
  })
}

// 2. Protect all data operations
async function createIncident(data) {
  // Fuzz location
  if (data.location?.coordinates) {
    const fuzzed = securityManager.fuzzLocation(
      data.location.coordinates.lat,
      data.location.coordinates.lng
    )
    data.location.coordinates = fuzzed
  }

  // Encrypt sensitive fields
  const encrypted = await encryptToString(
    { description: data.description, notes: data.notes },
    await getUserPassword()
  )
  
  data.encryptedData = encrypted
  delete data.description
  delete data.notes

  // Store
  await db.put('incidents', data)
}

// 3. Handle login with duress
async function handleLogin(password) {
  try {
    const result = await securityManager.verifyPassword(password)
    
    if (result.isDuress) {
      // Activate duress mode
      return { success: true, mode: 'duress' }
    }
    
    if (result.valid) {
      // Normal login
      securityManager.unlockApp()
      return { success: true, mode: 'normal' }
    }
    
    return { success: false, error: 'Invalid password' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### React Hook for Security

```typescript
function useSecurity() {
  const [isLocked, setIsLocked] = useState(securityManager.isLocked())
  const [isDuress, setIsDuress] = useState(securityManager.isDuressActive())

  useEffect(() => {
    const unsubLock = securityManager.onLock(setIsLocked)
    const unsubDuress = securityManager.onDuress(setIsDuress)
    
    return () => {
      unsubLock()
      unsubDuress()
    }
  }, [])

  const verify = useCallback(async (password: string) => {
    return securityManager.verifyPassword(password)
  }, [])

  return {
    isLocked,
    isDuress,
    verify,
    lock: securityManager.lockApp.bind(securityManager),
    unlock: securityManager.unlockApp.bind(securityManager)
  }
}
```

## Security Checklist

- [ ] Strong main password configured
- [ ] Different duress password configured
- [ ] Auto-lock enabled (5-10 minutes)
- [ ] Encryption enabled for all sensitive stores
- [ ] Metadata stripping enabled for photos
- [ ] Location fuzzing enabled
- [ ] Panic wipe tested in development
- [ ] Security audit logging active
- [ ] Failed attempt lockout configured
- [ ] Regular backups encrypted and exported
- [ ] Duress mode UI tested
- [ ] Hidden access gesture documented for users

## Browser Requirements

- **Web Crypto API**: Chrome 37+, Firefox 34+, Safari 7+, Edge 12+
- **Crypto.getRandomValues**: All modern browsers
- **Fallback**: crypto-js for unsupported browsers

## Performance Considerations

1. **Key Derivation**: PBKDF2 with 100k iterations takes ~100ms on mobile
2. **File Encryption**: Process large files in chunks
3. **Auto-lock**: Use requestAnimationFrame for activity tracking
4. **Encryption Keys**: Cached in memory for 30 minutes
5. **Hash Comparison**: Constant-time to prevent timing attacks

## Audit & Compliance

All security events are logged:
- Login/logout attempts
- Password changes
- Duress mode activation
- Lock/unlock events
- Data wipe execution
- Failed authentication attempts

Export logs for compliance:
```typescript
const logs = securityManager.exportLogs()
// JSON format with timestamps and event details
```
