/**
 * Offline tests — exercise the REAL useOffline hook (src/hooks/useOffline.ts).
 * (The previous version asserted on inline mock helpers.)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useOffline } from '@/hooks/useOffline'

function setOnline(value: boolean) {
  // navigator.onLine is made writable in the test setup, so assign it directly.
  const nav = navigator as unknown as { onLine: boolean }
  nav.onLine = value
}

beforeEach(() => {
  setOnline(true)
})

describe('useOffline', () => {
  it('reflects the initial navigator.onLine state', () => {
    setOnline(true)
    const { result } = renderHook(() => useOffline())
    expect(result.current.isOnline).toBe(true)
  })

  it('transitions to offline and back on window events', async () => {
    const { result } = renderHook(() => useOffline())
    expect(result.current.isOnline).toBe(true)

    act(() => {
      setOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    await waitFor(() => expect(result.current.isOnline).toBe(false))

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    await waitFor(() => expect(result.current.isOnline).toBe(true))
    expect(result.current.wasOffline).toBe(true)
  })

  it('syncWhenOnline runs immediately while online', async () => {
    const { result } = renderHook(() => useOffline())
    const op = vi.fn().mockResolvedValue('done')
    const out = await result.current.syncWhenOnline(op)
    expect(op).toHaveBeenCalledTimes(1)
    expect(out).toBe('done')
  })

  it('syncWhenOnline queues while offline and flushes on reconnect', async () => {
    setOnline(false)
    const { result } = renderHook(() => useOffline())
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    await waitFor(() => expect(result.current.isOnline).toBe(false))

    const op = vi.fn().mockResolvedValue('synced')
    const pending = result.current.syncWhenOnline(op)
    expect(op).not.toHaveBeenCalled() // queued, not run yet

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(await pending).toBe('synced')
    expect(op).toHaveBeenCalledTimes(1)
  })
})
