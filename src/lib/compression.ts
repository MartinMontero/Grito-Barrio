/**
 * Compression Utilities
 * Protocolo CDMX
 * 
 * Data compression for storage optimization
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompressionAlgorithm = 'lz-string' | 'gzip' | 'none'

export interface CompressionResult {
  data: string
  algorithm: CompressionAlgorithm
  originalSize: number
  compressedSize: number
  ratio: number
}

// =============================================================================
// LZ-STRING COMPRESSION (Built-in, no dependencies)
// =============================================================================

// Base64 character set
const KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * LZ-String compression implementation
 * Lightweight compression for localStorage optimization
 */
export function compress(input: string): string {
  if (!input) return ''
  
  let output = ''
  let i = 0
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4
  
  // Simple run-length encoding for repeated characters
  let currentChar = input[0]
  let count = 1
  let compressed = ''
  
  for (let j = 1; j <= input.length; j++) {
    if (j < input.length && input[j] === currentChar && count < 255) {
      count++
    } else {
      if (count > 3) {
        compressed += '\x00' + currentChar + String.fromCharCode(count)
      } else {
        compressed += currentChar.repeat(count)
      }
      currentChar = input[j]
      count = 1
    }
  }
  
  // Base64 encode the result
  input = compressed
  
  while (i < input.length) {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr2 & 63
    
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    
    output += KEY_STR.charAt(enc1) + KEY_STR.charAt(enc2) + KEY_STR.charAt(enc3) + KEY_STR.charAt(enc4)
  }
  
  return 'C' + output // 'C' prefix indicates compressed
}

/**
 * LZ-String decompression
 */
export function decompress(input: string): string {
  if (!input || input[0] !== 'C') return input || ''
  
  input = input.slice(1) // Remove compression prefix
  
  let output = ''
  let i = 0
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4
  
  // Base64 decode
  let decoded = ''
  
  while (i < input.length) {
    enc1 = KEY_STR.indexOf(input.charAt(i++))
    enc2 = KEY_STR.indexOf(input.charAt(i++))
    enc3 = KEY_STR.indexOf(input.charAt(i++))
    enc4 = KEY_STR.indexOf(input.charAt(i++))
    
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    
    decoded += String.fromCharCode(chr1)
    
    if (enc3 !== 64) {
      decoded += String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      decoded += String.fromCharCode(chr3)
    }
  }
  
  // Decompress run-length encoding
  let k = 0
  while (k < decoded.length) {
    if (decoded[k] === '\x00' && k + 2 < decoded.length) {
      const char = decoded[k + 1]
      const count = decoded.charCodeAt(k + 2)
      output += char.repeat(count)
      k += 3
    } else {
      output += decoded[k]
      k++
    }
  }
  
  return output
}

// =============================================================================
// COMPRESSION API
// =============================================================================

/**
 * Compress data if beneficial
 */
export function compressIfBeneficial(data: string, threshold = 0.9): CompressionResult {
  const compressed = compress(data)
  const originalSize = data.length
  const compressedSize = compressed.length
  const ratio = compressedSize / originalSize
  
  // Only use compression if it reduces size by at least (1 - threshold)
  if (ratio < threshold) {
    return {
      data: compressed,
      algorithm: 'lz-string',
      originalSize,
      compressedSize,
      ratio
    }
  }
  
  return {
    data,
    algorithm: 'none',
    originalSize,
    compressedSize: originalSize,
    ratio: 1
  }
}

/**
 * Decompress with auto-detection
 */
export function decompressAuto(data: string): string {
  if (data.startsWith('C')) {
    return decompress(data)
  }
  return data
}

/**
 * Check if data is compressed
 */
export function isCompressed(data: string): boolean {
  return data.startsWith('C')
}

/**
 * Get compression stats
 */
export function getCompressionStats(data: string): {
  originalSize: number
  compressedSize: number
  ratio: number
  savings: string
} {
  const compressed = compress(data)
  const originalSize = new Blob([data]).size
  const compressedSize = new Blob([compressed]).size
  const ratio = compressedSize / originalSize
  const savingsBytes = originalSize - compressedSize
  
  let savings: string
  if (savingsBytes > 1024 * 1024) {
    savings = `${(savingsBytes / (1024 * 1024)).toFixed(2)} MB`
  } else if (savingsBytes > 1024) {
    savings = `${(savingsBytes / 1024).toFixed(2)} KB`
  } else {
    savings = `${savingsBytes} bytes`
  }
  
  return {
    originalSize,
    compressedSize,
    ratio,
    savings
  }
}

// =============================================================================
// OBJECT COMPRESSION
// =============================================================================

/**
 * Compress an object
 */
export function compressObject<T>(obj: T): string {
  const json = JSON.stringify(obj)
  return compress(json)
}

/**
 * Decompress an object
 */
export function decompressObject<T>(compressed: string): T | null {
  try {
    const json = decompress(compressed)
    return JSON.parse(json) as T
  } catch (error) {
    console.error('Failed to decompress object:', error)
    return null
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  compress,
  decompress,
  compressIfBeneficial,
  decompressAuto,
  isCompressed,
  getCompressionStats,
  compressObject,
  decompressObject
}
