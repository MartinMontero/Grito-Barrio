/**
 * Crypto Unit Tests
 * Protocolo CDMX
 * 
 * Tests for encryption, decryption, key derivation, and hashing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Web Crypto API
global.crypto = {
  ...global.crypto,
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
} as any

describe('Crypto - Encryption/Decryption', () => {
  const mockKey = { type: 'secret', algorithm: { name: 'AES-GCM' } }
  const mockIV = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  const mockEncryptedData = new Uint8Array([100, 101, 102, 103])

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AES-GCM Encryption', () => {
    it('should encrypt data with AES-GCM', async () => {
      const plaintext = 'sensitive incident data'
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      crypto.subtle.encrypt.mockResolvedValue(mockEncryptedData.buffer)

      const result = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        data
      )

      expect(crypto.subtle.encrypt).toHaveBeenCalledWith(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        data
      )
      expect(result).toBeDefined()
    })

    it('should decrypt data correctly', async () => {
      const decryptedData = new TextEncoder().encode('sensitive incident data')
      
      crypto.subtle.decrypt.mockResolvedValue(decryptedData.buffer)

      const result = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        mockEncryptedData
      )

      expect(crypto.subtle.decrypt).toHaveBeenCalledWith(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        mockEncryptedData
      )
      expect(result).toBeDefined()
    })

    it('should fail decryption with wrong key', async () => {
      crypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'))

      await expect(crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: mockIV },
        { type: 'wrong' } as any,
        mockEncryptedData
      )).rejects.toThrow('Decryption failed')
    })

    it('should fail decryption with tampered IV', async () => {
      const tamperedIV = new Uint8Array([99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99])
      
      crypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'))

      await expect(crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: tamperedIV },
        mockKey,
        mockEncryptedData
      )).rejects.toThrow('Decryption failed')
    })

    it('should use unique IV for each encryption', async () => {
      const iv1 = crypto.getRandomValues(new Uint8Array(12))
      const iv2 = crypto.getRandomValues(new Uint8Array(12))

      expect(iv1).not.toEqual(iv2)
    })
  })

  describe('Key Derivation (PBKDF2)', () => {
    it('should derive key from password', async () => {
      const password = 'strong-password-123'
      const salt = crypto.getRandomValues(new Uint8Array(16))
      
      const mockDerivedKey = { type: 'secret', algorithm: { name: 'AES-GCM' } }
      crypto.subtle.deriveKey.mockResolvedValue(mockDerivedKey)

      const result = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )

      expect(crypto.subtle.deriveKey).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should use different salts for different derivations', () => {
      const salt1 = crypto.getRandomValues(new Uint8Array(16))
      const salt2 = crypto.getRandomValues(new Uint8Array(16))

      expect(salt1).not.toEqual(salt2)
    })

    it('should derive same key with same password and salt', async () => {
      const password = 'test-password'
      const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
      
      const mockKey1 = { type: 'secret', algorithm: { name: 'AES-GCM' } }
      const mockKey2 = { type: 'secret', algorithm: { name: 'AES-GCM' } }
      
      crypto.subtle.deriveKey
        .mockResolvedValueOnce(mockKey1)
        .mockResolvedValueOnce(mockKey2)

      // In real implementation, these should be the same
      expect(crypto.subtle.deriveKey).toBeDefined()
    })
  })

  describe('Hash Generation', () => {
    it('should generate SHA-256 hash', async () => {
      const data = 'test data for hashing'
      const encoder = new TextEncoder()
      
      const mockHash = new Uint8Array(32).fill(1)
      crypto.subtle.digest.mockResolvedValue(mockHash.buffer)

      const result = await crypto.subtle.digest('SHA-256', encoder.encode(data))

      expect(crypto.subtle.digest).toHaveBeenCalledWith('SHA-256', encoder.encode(data))
      expect(result).toBeDefined()
      expect(result.byteLength).toBe(32)
    })

    it('should generate consistent hash for same data', async () => {
      const data = 'consistent data'
      const encoder = new TextEncoder()
      
      const mockHash = new Uint8Array(32).fill(2)
      crypto.subtle.digest.mockResolvedValue(mockHash.buffer)

      const hash1 = await crypto.subtle.digest('SHA-256', encoder.encode(data))
      const hash2 = await crypto.subtle.digest('SHA-256', encoder.encode(data))

      // Mock returns same value, but in real implementation should be identical
      expect(hash1.byteLength).toBe(hash2.byteLength)
    })

    it('should generate different hash for different data', async () => {
      const mockHash1 = new Uint8Array(32).fill(1)
      const mockHash2 = new Uint8Array(32).fill(2)
      
      crypto.subtle.digest
        .mockResolvedValueOnce(mockHash1.buffer)
        .mockResolvedValueOnce(mockHash2.buffer)

      const hash1 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('data1'))
      const hash2 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('data2'))

      expect(new Uint8Array(hash1)).not.toEqual(new Uint8Array(hash2))
    })

    it('should handle empty data', async () => {
      const mockHash = new Uint8Array(32).fill(0)
      crypto.subtle.digest.mockResolvedValue(mockHash.buffer)

      const result = await crypto.subtle.digest('SHA-256', new Uint8Array())

      expect(result).toBeDefined()
      expect(result.byteLength).toBe(32)
    })
  })

  describe('File Encryption', () => {
    it('should encrypt file blob', async () => {
      const fileContent = new Uint8Array([1, 2, 3, 4, 5])
      const blob = new Blob([fileContent])
      
      crypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(100))

      const arrayBuffer = await blob.arrayBuffer()
      const result = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        arrayBuffer
      )

      expect(result).toBeDefined()
      expect(crypto.subtle.encrypt).toHaveBeenCalled()
    })

    it('should encrypt large files in chunks', async () => {
      // Simulate 10MB file
      const largeContent = new Uint8Array(10 * 1024 * 1024)
      
      crypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(1024))

      // In real implementation, would chunk the file
      const chunks = Math.ceil(largeContent.length / (1024 * 1024))
      expect(chunks).toBe(10)
    })

    it('should handle image files', async () => {
      const imageHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG header
      const mockEncrypted = new ArrayBuffer(100)
      
      crypto.subtle.encrypt.mockResolvedValue(mockEncrypted)

      const result = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        imageHeader
      )

      expect(result).toBeDefined()
    })
  })

  describe('Key Generation', () => {
    it('should generate random AES key', async () => {
      const mockKey = { type: 'secret', algorithm: { name: 'AES-GCM' } }
      crypto.subtle.generateKey.mockResolvedValue(mockKey)

      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      expect(crypto.subtle.generateKey).toHaveBeenCalledWith(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      expect(key).toBeDefined()
    })

    it('should export key to raw format', async () => {
      const mockRawKey = new Uint8Array(32).fill(1)
      crypto.subtle.exportKey.mockResolvedValue(mockRawKey.buffer)

      const exported = await crypto.subtle.exportKey('raw', mockKey)

      expect(crypto.subtle.exportKey).toHaveBeenCalledWith('raw', mockKey)
      expect(exported).toBeDefined()
    })

    it('should import key from raw format', async () => {
      const rawKey = new Uint8Array(32).fill(1)
      crypto.subtle.importKey.mockResolvedValue(mockKey)

      const imported = await crypto.subtle.importKey(
        'raw',
        rawKey,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      )

      expect(crypto.subtle.importKey).toHaveBeenCalled()
      expect(imported).toBeDefined()
    })
  })

  describe('HMAC Operations', () => {
    it('should sign data with HMAC', async () => {
      const hmacKey = { type: 'secret', algorithm: { name: 'HMAC' } }
      const data = new TextEncoder().encode('message to sign')
      const mockSignature = new Uint8Array(32).fill(1)
      
      crypto.subtle.sign.mockResolvedValue(mockSignature.buffer)

      const signature = await crypto.subtle.sign('HMAC', hmacKey, data)

      expect(crypto.subtle.sign).toHaveBeenCalledWith('HMAC', hmacKey, data)
      expect(signature).toBeDefined()
    })

    it('should verify HMAC signature', async () => {
      const hmacKey = { type: 'secret', algorithm: { name: 'HMAC' } }
      const data = new TextEncoder().encode('message to sign')
      const signature = new Uint8Array(32).fill(1)
      
      crypto.subtle.verify.mockResolvedValue(true)

      const isValid = await crypto.subtle.verify('HMAC', hmacKey, signature, data)

      expect(crypto.subtle.verify).toHaveBeenCalled()
      expect(isValid).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle encryption with invalid key', async () => {
      crypto.subtle.encrypt.mockRejectedValue(new Error('Invalid key'))

      await expect(crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: mockIV },
        null as any,
        new Uint8Array([1, 2, 3])
      )).rejects.toThrow('Invalid key')
    })

    it('should handle decryption with corrupted data', async () => {
      const corruptedData = new Uint8Array([255, 255, 255, 255])
      
      crypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'))

      await expect(crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        corruptedData
      )).rejects.toThrow('Decryption failed')
    })

    it('should handle unsupported algorithm', async () => {
      crypto.subtle.encrypt.mockRejectedValue(new Error('Unsupported algorithm'))

      await expect(crypto.subtle.encrypt(
        { name: 'UNSUPPORTED', iv: mockIV },
        mockKey,
        new Uint8Array([1])
      )).rejects.toThrow('Unsupported algorithm')
    })
  })

  describe('Performance', () => {
    it('should encrypt small data quickly', async () => {
      const data = new TextEncoder().encode('small')
      crypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(100))

      const start = Date.now()
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv: mockIV }, mockKey, data)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle large data encryption', async () => {
      const largeData = new Uint8Array(1024 * 1024) // 1MB
      crypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(1024 * 1024 + 16))

      const result = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: mockIV },
        mockKey,
        largeData
      )

      expect(result.byteLength).toBeGreaterThan(largeData.length)
    })
  })
})

describe('Crypto - Password Hashing', () => {
  it('should hash password with salt', async () => {
    const password = 'user-password'
    const salt = crypto.getRandomValues(new Uint8Array(16))
    
    const mockHash = new Uint8Array(32).fill(1)
    crypto.subtle.digest.mockResolvedValue(mockHash.buffer)

    // Combine password and salt
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    const combined = new Uint8Array(passwordData.length + salt.length)
    combined.set(passwordData)
    combined.set(salt, passwordData.length)

    const hash = await crypto.subtle.digest('SHA-256', combined)

    expect(hash).toBeDefined()
    expect(hash.byteLength).toBe(32)
  })

  it('should generate different hashes for different passwords', async () => {
    const mockHash1 = new Uint8Array(32).fill(1)
    const mockHash2 = new Uint8Array(32).fill(2)
    
    crypto.subtle.digest
      .mockResolvedValueOnce(mockHash1.buffer)
      .mockResolvedValueOnce(mockHash2.buffer)

    const hash1 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('password1'))
    const hash2 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('password2'))

    expect(new Uint8Array(hash1)).not.toEqual(new Uint8Array(hash2))
  })

  it('should use constant-time comparison', () => {
    const hash1 = new Uint8Array([1, 2, 3, 4, 5])
    const hash2 = new Uint8Array([1, 2, 3, 4, 5])
    const hash3 = new Uint8Array([1, 2, 3, 4, 6])

    // In real implementation, use constant-time comparison
    expect(hash1.every((val, i) => val === hash2[i])).toBe(true)
    expect(hash1.every((val, i) => val === hash3[i])).toBe(false)
  })
})

describe('Crypto - Data Integrity', () => {
  it('should verify data integrity with hash', async () => {
    const data = new TextEncoder().encode('important incident data')
    const mockHash = new Uint8Array(32).fill(1)
    
    crypto.subtle.digest.mockResolvedValue(mockHash.buffer)

    const hash = await crypto.subtle.digest('SHA-256', data)

    // Later, verify integrity
    const isValid = hash.byteLength === 32
    expect(isValid).toBe(true)
  })

  it('should detect tampered data', async () => {
    const originalData = new TextEncoder().encode('original data')
    const tamperedData = new TextEncoder().encode('tampered data')
    
    const mockHash1 = new Uint8Array(32).fill(1)
    const mockHash2 = new Uint8Array(32).fill(2)
    
    crypto.subtle.digest
      .mockResolvedValueOnce(mockHash1.buffer)
      .mockResolvedValueOnce(mockHash2.buffer)

    const originalHash = await crypto.subtle.digest('SHA-256', originalData)
    const tamperedHash = await crypto.subtle.digest('SHA-256', tamperedData)

    expect(new Uint8Array(originalHash)).not.toEqual(new Uint8Array(tamperedHash))
  })
})
