/**
 * ProtectionBanner
 * Grito & Barrio
 *
 * Honest, non-blocking nudge shown while NO encryption vault is configured. In
 * that state, data is stored unencrypted on the device — users must know, and be
 * one tap away from enabling protection. Dismissible for the session.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, X } from 'lucide-react'
import { getVaultState } from '@/lib/vault'

const DISMISS_KEY = 'gb_protection_banner_dismissed'

export const ProtectionBanner: React.FC = () => {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  )

  // Only show when there is no vault yet (data currently unencrypted).
  if (dismissed || getVaultState() !== 'uninitialized') return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
        <p className="flex-1 leading-tight">
          Tus datos <strong>no están cifrados</strong> todavía. Define una
          contraseña para protegerlos.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="font-semibold underline underline-offset-2 whitespace-nowrap"
        >
          Proteger
        </button>
        <button
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
          aria-label="Descartar aviso"
          className="text-amber-700/70 hover:text-amber-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ProtectionBanner
