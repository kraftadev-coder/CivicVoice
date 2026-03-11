/**
 * API Configuration
 *
 * Centralizes the API base URL for all frontend API calls.
 * - In development: empty string (Vite proxy forwards /api/* to localhost:8787)
 * - In production: points to the Cloudflare Worker URL
 */

const isDev = import.meta.env.DEV;

export const API_BASE = isDev
    ? ''  // Vite proxy handles /api/* → localhost:8787
    : (import.meta.env.VITE_API_BASE || 'https://govoicing-api.kraftadev.workers.dev');
