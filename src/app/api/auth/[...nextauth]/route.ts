import { handlers } from "@/lib/auth"

/**
 * Auth.js Route Handlers
 *
 * This is one of the few API routes in the app (per spec §2 Priority Rule #6).
 * Required for Auth.js callbacks and OAuth flows.
 *
 * Handles:
 * - GET /api/auth/signin
 * - GET /api/auth/callback/:provider
 * - POST /api/auth/signin/:provider
 * - GET /api/auth/signout
 * - POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/providers
 */

export const { GET, POST } = handlers
