/**
 * LockScreen
 * Grito & Barrio
 *
 * Shown when an encryption vault exists but is locked. Unlocking derives the
 * in-memory data key from the passphrase. A duress passphrase unlocks a decoy
 * vault and silently arms the panic wipe. Repeated failures trigger the
 * configured lockout / data-wipe policy via the security manager.
 */

import React, { useState } from "react";
import { Shield, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { securityManager } from "@/lib/security";

interface LockScreenProps {
  onUnlocked: () => void | Promise<void>;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlocked }) => {
  const [passphrase, setPassphrase] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { valid } = await securityManager.verifyPassword(passphrase);
      if (valid) {
        // Whether real or duress, the vault is now unlocked with the
        // appropriate key; hydrate and continue.
        setPassphrase("");
        await onUnlocked();
      } else {
        setError("Contraseña incorrecta.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desbloquear.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Grito &amp; Barrio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Introduce tu contraseña para desbloquear tus datos cifrados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoFocus
              autoComplete="current-password"
              aria-label="Contraseña"
              placeholder="Contraseña"
              className="w-full h-12 rounded-lg border border-input bg-background px-4 pr-12 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!passphrase || busy}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Desbloquear
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Tus datos se cifran localmente. Nadie, ni siquiera nosotros, puede
          descifrarlos sin tu contraseña.
        </p>
      </div>
    </div>
  );
};

export default LockScreen;
