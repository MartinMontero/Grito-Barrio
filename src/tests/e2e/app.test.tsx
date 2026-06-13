/**
 * App integration tests — render the REAL routed application and drive it.
 * Validates the AppShell, routing, vault gate, and that core screens mount
 * without crashing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import * as vault from "@/lib/vault";

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vault.lock();
  localStorage.clear();
});

describe("App: boot & shell", () => {
  it("renders the home screen inside the app shell (no vault => no lock screen)", async () => {
    renderApp("/");
    // AppShell header brand is present.
    await waitFor(() => {
      expect(
        screen.getAllByText(/Grito|Protocolo|Apoyo Comunitario/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("navigates to Protocolos and shows protocol content", async () => {
    renderApp("/protocols");
    await waitFor(() => {
      expect(
        screen.getAllByText(
          /Respuesta Inmediata|Prevención de Desalojos|Protocolos/i,
        ).length,
      ).toBeGreaterThan(0);
    });
  });

  it("shows the legal section", async () => {
    renderApp("/legal");
    await waitFor(() => {
      expect(
        screen.getAllByText(/Derechos|Legal|Ley de Vivienda/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("shows the resources/contacts section", async () => {
    renderApp("/resources");
    await waitFor(() => {
      expect(
        screen.getAllByText(/911|Recursos|Emergencia|Contactos/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders settings", async () => {
    renderApp("/settings");
    await waitFor(() => {
      expect(
        screen.getAllByText(/Configuración|Ajustes|Seguridad/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("unknown routes redirect home", async () => {
    renderApp("/does-not-exist");
    await waitFor(() => {
      expect(
        screen.getAllByText(/Grito|Protocolo|Apoyo Comunitario/i).length,
      ).toBeGreaterThan(0);
    });
  });
});

describe("App: vault lock gate", () => {
  it("shows the lock screen when a vault exists and is locked", async () => {
    await vault.createVault("master-pass-123");
    vault.lock();
    renderApp("/");
    await waitFor(() => {
      expect(screen.getByLabelText("Contraseña")).toBeTruthy();
    });
  });

  it("unlocks with the correct passphrase and reveals the app", async () => {
    const user = userEvent.setup();
    await vault.createVault("master-pass-123");
    vault.lock();
    renderApp("/");
    await waitFor(() =>
      expect(screen.getByLabelText("Contraseña")).toBeTruthy(),
    );
    await user.type(screen.getByLabelText("Contraseña"), "master-pass-123");
    await user.click(screen.getByRole("button", { name: /Desbloquear/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Introduce tu contraseña/i)).toBeNull();
    });
  });
});
