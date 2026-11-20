import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Resolve this file's folder so we can load ../.env from e2eTests/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Central env-based config for E2E runs.
 * Secrets come from process env / local `.env` (never committed).
 *
 * Example .env:
 *   E2E_BASE_URL=http://localhost:3001
 *   E2E_ADMIN_USER=admin@example.com
 *   E2E_ADMIN_PASSWORD=secret
 *   E2E_CLAIMANT_USER=user@example.com
 *   E2E_CLAIMANT_PASSWORD=secret
 */
export const env = {
  baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
  admin: {
    email: process.env.E2E_ADMIN_USER || '',
    password: process.env.E2E_ADMIN_PASSWORD || '',
  },
  claimant: {
    email: process.env.E2E_CLAIMANT_USER || '',
    password: process.env.E2E_CLAIMANT_PASSWORD || '',
  },
};

/**
 * True when both admin email and password are set.
 * Example: if (!hasAdminCredentials()) test.skip();
 */
export function hasAdminCredentials() {
  return Boolean(env.admin.email && env.admin.password);
}

/**
 * True when both claimant email and password are set.
 * Example: if (!hasClaimantCredentials()) test.skip();
 */
export function hasClaimantCredentials() {
  return Boolean(env.claimant.email && env.claimant.password);
}
