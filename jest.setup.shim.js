// Polyfill import.meta.env for Jest (which runs CommonJS, not ESM)
// Maps Vite's import.meta.env.* to process.env.VITE_* equivalents
globalThis.importMetaEnvShim = {
  VITE_ENABLE_REAL_ZK: process.env.VITE_ENABLE_REAL_ZK || 'false',
  VITE_SOLANA_NETWORK: process.env.VITE_SOLANA_NETWORK || 'devnet',
  VITE_HELIUS_API_KEY: process.env.VITE_HELIUS_API_KEY || '',
};
