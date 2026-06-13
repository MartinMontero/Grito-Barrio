/**
 * Emergency journey — drive the REAL integrated app through the operational flow:
 * create an incident, then reach the dashboard, the checklist and evidence
 * screens. Validates routing + the store-backed emergency cluster end-to-end.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import * as vault from "@/lib/vault";
import { useProtocoloStore } from "@/store";
import type { AlertData } from "@/store";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function createIncident() {
  const alert: AlertData = {
    location: {
      address: "Calle Falsa 123",
      colonia: "Centro",
      alcaldia: "Cuauhtémoc",
      postalCode: "06000",
      coordinates: { latitude: 19.4326, longitude: -99.1332 },
    } as AlertData["location"],
    alertSource: "hotline",
    description: "Desalojo en curso",
    threatLevel: "critical",
  };
  return useProtocoloStore.getState().createIncident(alert);
}

beforeEach(() => {
  vault.lock();
  localStorage.clear();
  useProtocoloStore.setState({
    incidents: [],
    activeIncidentId: null,
    incidentHistory: [],
    checklists: {},
  });
});

describe("emergency journey (real app)", () => {
  it("an active incident drives the emergency dashboard", async () => {
    createIncident();
    renderAt("/emergency");
    await waitFor(() => {
      // Dashboard should reference the incident context (colonia / threat / actions).
      expect(
        screen.getAllByText(/Centro|Crítico|crítico|Incidente|Emergencia/i)
          .length,
      ).toBeGreaterThan(0);
    });
  });

  it("the checklist screen renders the store-backed items for the incident", async () => {
    createIncident();
    renderAt("/emergency/checklist");
    await waitFor(() => {
      expect(
        screen.getAllByText(
          /Confirmar la alerta|Verificar seguridad de la escena|protocolo de respuesta/i,
        ).length,
      ).toBeGreaterThan(0);
    });
    // The checklist must be initialized in the store under the active incident.
    const state = useProtocoloStore.getState();
    const id = state.activeIncidentId!;
    expect(Array.isArray(state.checklists[id])).toBe(true);
    expect(state.checklists[id].length).toBeGreaterThan(0);
  });

  it("the evidence screen renders capture options", async () => {
    createIncident();
    renderAt("/emergency/evidence");
    await waitFor(() => {
      expect(
        screen.getAllByText(/Foto|Video|Audio|Nota|Evidencia|Documentar/i)
          .length,
      ).toBeGreaterThan(0);
    });
  });

  it("legal triage renders for the active incident", async () => {
    createIncident();
    renderAt("/legal/triage");
    await waitFor(() => {
      expect(
        screen.getAllByText(
          /Triage|Legal|Ocupante|Desalojo|Continuar|Siguiente/i,
        ).length,
      ).toBeGreaterThan(0);
    });
  });
});
