// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).global = window;
(window as any).Buffer = Buffer;

// Process polyfill
(window as any).process = {
  env: {},
  version: '',
  platform: 'browser',
};