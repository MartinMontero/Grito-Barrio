/**
 * Feature routes (secondary clusters)
 * Grito & Barrio
 *
 * Routes for the broader feature set (training, certifications, contacts,
 * safe-points, supplies, forms, scenarios, messaging, security settings,
 * duress). These render inside the AppShell layout (see App.tsx). Kept in a
 * separate module so the core routes and the wider feature surface can evolve
 * independently.
 */

import type { RouteObject } from 'react-router-dom'

export const featureRoutes: RouteObject[] = []

export default featureRoutes
