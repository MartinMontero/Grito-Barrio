/**
 * Route smoke test — mount the REAL App at every route and assert each screen
 * renders (resolves past the lazy Suspense fallback) without crashing. This is
 * the broad "play through the whole app" safety net across the full surface.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import * as vault from "@/lib/vault";
import { useProtocoloStore } from "@/store";
import type { AlertData } from "@/store";

const PATHS = [
  "/",
  "/protocols",
  "/protocols/respuesta-inmediata",
  "/legal",
  "/legal/legal-1",
  "/legal/triage",
  "/resources",
  "/resources/contacts",
  "/contacts/tree",
  "/settings",
  "/emergency",
  "/emergency/checklist",
  "/emergency/evidence",
  "/emergency/pas",
  "/roles",
  "/roles/leader",
  "/training",
  "/certifications",
  "/safe-points",
  "/supplies",
  "/forms",
  "/scenarios",
  "/messages",
  "/quick-dial",
  "/security",
  "/security/duress",
  "/this-route-does-not-exist",
];

beforeEach(() => {
  vault.lock();
  localStorage.clear();
  useProtocoloStore.setState({
    incidents: [],
    activeIncidentId: null,
    incidentHistory: [],
    checklists: {},
  });
  // Give emergency routes a realistic active incident.
  const alert: AlertData = {
    location: {
      address: "Calle Falsa 123",
      colonia: "Centro",
      alcaldia: "Cuauhtémoc",
      postalCode: "06000",
      coordinates: { latitude: 19.43, longitude: -99.13 },
    } as AlertData["location"],
    alertSource: "hotline",
    description: "Desalojo",
    threatLevel: "high",
  };
  useProtocoloStore.getState().createIncident(alert);
});

describe("route smoke (real App)", () => {
  it.each(PATHS)("renders %s without crashing", async (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    // The app shell renders a <main> landmark; lazy content resolves past the
    // "Cargando" fallback.
    await waitFor(() => {
      expect(document.querySelector("main")).toBeTruthy();
      expect(screen.queryByLabelText("Cargando")).toBeNull();
    });
    // Something meaningful rendered into the content area.
    expect(
      (document.querySelector("main")?.textContent || "").length,
    ).toBeGreaterThan(0);
  });
});
