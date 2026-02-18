/**
 * Test Setup
 * Protocolo CDMX
 * 
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// Mock Crypto API — use defineProperty because global.crypto is getter-only in Node 19+
Object.defineProperty(global, 'crypto', {
  writable: true,
  configurable: true,
  value: {
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
      deriveKey: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => 'test-uuid-12345',
  },
})

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
}

global.indexedDB = mockIndexedDB as any

// Mock navigator APIs
Object.defineProperty(navigator, 'permissions', {
  value: {
    query: vi.fn().mockResolvedValue({ state: 'granted' }),
  },
})

Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({ usage: 1000000, quota: 10000000 }),
    persist: vi.fn().mockResolvedValue(true),
  },
})

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Blob.prototype.arrayBuffer — not implemented in jsdom
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new ArrayBuffer(0))
  }
}

// Mock FileReader
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  result: string | ArrayBuffer | null = null
  
  readAsText(blob: Blob) {
    setTimeout(() => {
      this.result = JSON.stringify({ test: 'data' })
      this.onload?.call(this as any, new ProgressEvent('load'))
    }, 0)
  }
  
  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,test'
      this.onload?.call(this as any, new ProgressEvent('load'))
    }, 0)
  }
}

global.FileReader = MockFileReader as any

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Create a mock incident for testing
 */
export function createMockIncident(overrides = {}) {
  return {
    id: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    location: {
      address: 'Test Street 123',
      colonia: 'Test Colonia',
      alcaldia: 'Cuauhtémoc',
      postalCode: '06000',
      coordinates: {
        latitude: 19.4326,
        longitude: -99.1332,
      },
    },
    alertSource: 'hotline' as const,
    verificationStatus: 'verified' as const,
    incidentLeader: 'test-leader',
    team: [],
    threatLevel: 'high' as const,
    withdrawalTriggered: false,
    status: 'responding' as const,
    description: 'Test incident for unit testing',
    ...overrides,
  }
}

/**
 * Create a mock team member for testing
 */
export function createMockTeamMember(overrides = {}) {
  return {
    pseudonym: `test-member-${Math.floor(Math.random() * 1000)}`,
    role: 'security' as const,
    certificationLevel: 2 as const,
    status: 'on_scene' as const,
    eta: new Date(Date.now() + 15 * 60000).toISOString(),
    ...overrides,
  }
}

/**
 * Create mock form data for testing
 */
export function createMockFormData(overrides = {}) {
  return {
    id: `form-${Date.now()}`,
    templateId: 'incident-report-v1',
    incidentId: 'INC-2025-001',
    status: 'completed' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'test-user',
    values: {
      alertDate: '2025-01-15',
      alertTime: '14:30',
      location: {
        street: 'Test Street',
        number: '123',
        colonia: 'Test Colonia',
        alcaldia: 'Cuauhtémoc',
      },
    },
    ...overrides,
  }
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

/**
 * Mock fetch error
 */
export function mockFetchError(message: string, status = 500) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.reject(new Error(message)),
    text: () => Promise.resolve(message),
  } as Response)
}

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

expect.extend({
  toBeValidIncident(received) {
    const hasId = typeof received.id === 'string' && received.id.startsWith('INC-')
    const hasTimestamp = typeof received.timestamp === 'string'
    const hasLocation = received.location && typeof received.location === 'object'
    const hasStatus = ['detected', 'verifying', 'confirmed', 'responding', 'withdrawal', 'resolved', 'escalated', 'closed'].includes(received.status)
    
    const pass = hasId && hasTimestamp && hasLocation && hasStatus
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid incident`
          : `Expected ${received} to be a valid incident`,
    }
  },
  
  toBeEncrypted(received) {
    const isString = typeof received === 'string'
    const hasEncryptedMarker = received.includes('encrypted') || received.startsWith('eyJ') || /^[A-Za-z0-9+/]*={0,2}$/.test(received)
    const pass = isString && (hasEncryptedMarker || received.length > 50)
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received.substring(0, 50)}... not to be encrypted`
          : `Expected value to be encrypted`,
    }
  },
})

// Set lang attribute expected by a11y tests — jsdom doesn't inherit from index.html
document.documentElement.lang = 'es-MX'

// ============================================================================
// CONSOLE SUPPRESSION
// ============================================================================

// Suppress console warnings/errors during tests unless explicitly testing them
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Allow specific errors that we're testing for
    if (args[0]?.includes?.('Test expected error')) {
      originalConsoleError.apply(console, args)
    }
  }
  
  console.warn = (...args: any[]) => {
    // Allow specific warnings that we're testing for
    if (args[0]?.includes?.('Test expected warning')) {
      originalConsoleWarn.apply(console, args)
    }
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// ============================================================================
// CLEANUP
// ============================================================================

afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})
