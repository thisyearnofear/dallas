/**
 * Cross-runtime environment variable access.
 *
 * In Vite (browser), process.env is shimmed to {} via vite.config.ts
 * define, but Vite-injected build-time constants (__DBC_*) are available.
 * In Jest/Node, process.env is the native object.
 *
 * Avoids import.meta.env so files are parseable by Jest (CJS).
 */

export function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env[key];
  }
  return undefined;
}
