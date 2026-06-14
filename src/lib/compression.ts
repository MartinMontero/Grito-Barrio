/**
 * Compression Utilities
 * Protocolo CDMX
 *
 * Data compression for storage optimization
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompressionAlgorithm = "lz-string" | "gzip" | "none";

export interface CompressionResult {
  data: string;
  algorithm: CompressionAlgorithm;
  originalSize: number;
  compressedSize: number;
  ratio: number;
}

// =============================================================================
// RUN-LENGTH COMPRESSION (Built-in, lossless, UTF-8 safe, no dependencies)
// =============================================================================
//
// The previous implementation was lossy: it had an off-by-one base64 bug
// (`enc4 = chr2 & 63` instead of `chr3 & 63`) and used a `\x00` run marker that
// collided with literal NUL bytes and with the UTF-16 code units produced by
// `charCodeAt` on multi-byte characters (emoji, accented Spanish). This rewrite
// operates on UTF-8 BYTES with an unambiguous escape, so any input — including
// NUL bytes and multi-byte text — round-trips exactly.
//
// Encoding: a run of identical bytes is emitted as `0x00 <byte> <count>` when
// the run length is >= 4, OR whenever the byte is itself 0x00 (so the marker is
// always unambiguous). Otherwise the bytes are emitted literally. The byte
// stream is then base64-encoded and prefixed with 'C'.

import { arrayBufferToBase64, base64ToArrayBuffer } from "./crypto";

const COMPRESSED_PREFIX = "C";
const RUN_MARKER = 0x00;

export function compress(input: string): string {
  if (!input) return "";

  const bytes = new TextEncoder().encode(input);
  const out: number[] = [];
  let i = 0;

  while (i < bytes.length) {
    const b = bytes[i];
    let run = 1;
    while (i + run < bytes.length && bytes[i + run] === b && run < 255) {
      run++;
    }

    if (run >= 4 || b === RUN_MARKER) {
      out.push(RUN_MARKER, b, run);
    } else {
      for (let k = 0; k < run; k++) out.push(b);
    }
    i += run;
  }

  return COMPRESSED_PREFIX + arrayBufferToBase64(new Uint8Array(out).buffer);
}

export function decompress(input: string): string {
  if (!input) return "";
  if (input[0] !== COMPRESSED_PREFIX) return input;

  const data = new Uint8Array(base64ToArrayBuffer(input.slice(1)));
  const out: number[] = [];
  let i = 0;

  while (i < data.length) {
    const b = data[i];
    if (b === RUN_MARKER && i + 2 < data.length) {
      const ch = data[i + 1];
      const count = data[i + 2];
      for (let k = 0; k < count; k++) out.push(ch);
      i += 3;
    } else {
      out.push(b);
      i++;
    }
  }

  return new TextDecoder().decode(new Uint8Array(out));
}

// =============================================================================
// COMPRESSION API
// =============================================================================

/**
 * Compress data if beneficial
 */
export function compressIfBeneficial(
  data: string,
  threshold = 0.9,
): CompressionResult {
  const compressed = compress(data);
  const originalSize = data.length;
  const compressedSize = compressed.length;
  const ratio = compressedSize / originalSize;

  // Only use compression if it reduces size by at least (1 - threshold)
  if (ratio < threshold) {
    return {
      data: compressed,
      algorithm: "lz-string",
      originalSize,
      compressedSize,
      ratio,
    };
  }

  return {
    data,
    algorithm: "none",
    originalSize,
    compressedSize: originalSize,
    ratio: 1,
  };
}

/**
 * Decompress with auto-detection
 */
export function decompressAuto(data: string): string {
  if (data.startsWith("C")) {
    return decompress(data);
  }
  return data;
}

/**
 * Check if data is compressed
 */
export function isCompressed(data: string): boolean {
  return data.startsWith("C");
}

/**
 * Get compression stats
 */
export function getCompressionStats(data: string): {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  savings: string;
} {
  const compressed = compress(data);
  const originalSize = new Blob([data]).size;
  const compressedSize = new Blob([compressed]).size;
  const ratio = compressedSize / originalSize;
  const savingsBytes = originalSize - compressedSize;

  let savings: string;
  if (savingsBytes > 1024 * 1024) {
    savings = `${(savingsBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if (savingsBytes > 1024) {
    savings = `${(savingsBytes / 1024).toFixed(2)} KB`;
  } else {
    savings = `${savingsBytes} bytes`;
  }

  return {
    originalSize,
    compressedSize,
    ratio,
    savings,
  };
}

// =============================================================================
// OBJECT COMPRESSION
// =============================================================================

/**
 * Compress an object
 */
export function compressObject<T>(obj: T): string {
  const json = JSON.stringify(obj);
  return compress(json);
}

/**
 * Decompress an object
 */
export function decompressObject<T>(compressed: string): T | null {
  try {
    const json = decompress(compressed);
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Failed to decompress object:", error);
    return null;
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
  decompressObject,
};
