import config from './config';
let _warned = false;
export function getApiBase(): string {
  // Support both variable names; prefer NEXT_PUBLIC_API_URL if present
  let base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || config.apiBaseUrl;

  if (!base) {
    if (typeof window !== 'undefined') {
      base = window.location.origin;
      if (!_warned) {
        console.warn('[apiBase] No public API env var set. Falling back to window.origin:', base);
        _warned = true;
      }
    } else {
      throw new Error('No API base URL configured (NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL). Add one to .env.local');
    }
  }

  return base.replace(/\/$/, '');
}
