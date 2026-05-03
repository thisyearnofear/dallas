import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

// Custom plugin to copy circuit artifacts to dist
function copyCircuitsPlugin() {
  return {
    name: 'copy-circuits',
    writeBundle() {
      const circuitsDir = './circuits';
      const distCircuitsDir = './dist/circuits';

      try {
        // Create dist/circuits directory
        mkdirSync(distCircuitsDir, { recursive: true });

        // Copy each circuit's target folder
        const circuits = readdirSync(circuitsDir);
        for (const circuit of circuits) {
          const targetDir = join(circuitsDir, circuit, 'target');
          const destDir = join(distCircuitsDir, circuit, 'target');

          try {
            const stats = statSync(targetDir);
            if (stats.isDirectory()) {
              mkdirSync(destDir, { recursive: true });

              // Copy JSON files
              const files = readdirSync(targetDir);
              for (const file of files) {
                if (file.endsWith('.json')) {
                  copyFileSync(
                    join(targetDir, file),
                    join(destDir, file)
                  );
                }
              }
              console.log(`✅ Copied circuit: ${circuit}`);
            }
          } catch (e) {
            // Target directory might not exist
          }
        }
        console.log('✅ Circuit artifacts copied to dist/circuits');
      } catch (error) {
        console.warn('Failed to copy circuits:', error);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    copyCircuitsPlugin(),
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
    __DBC_SOLANA_NETWORK__: JSON.stringify(process.env.VITE_SOLANA_NETWORK || ''),
    __DBC_SOLANA_RPC_ENDPOINT__: JSON.stringify(process.env.VITE_SOLANA_RPC_ENDPOINT || ''),
    __DBC_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID__: JSON.stringify(process.env.VITE_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID || ''),
    __DBC_DBC_MINT_ADDRESS__: JSON.stringify(process.env.VITE_DBC_MINT_ADDRESS || ''),
    __DBC_TREASURY_PROGRAM_ID__: JSON.stringify(process.env.VITE_TREASURY_PROGRAM_ID || ''),
    __DBC_MEMBERSHIP_PROGRAM_ID__: JSON.stringify(process.env.VITE_MEMBERSHIP_PROGRAM_ID || ''),
    __DBC_DBC_TOKEN_PROGRAM_ID_DEVNET__: JSON.stringify(process.env.VITE_DBC_TOKEN_PROGRAM_ID_DEVNET || ''),
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep Barretenberg / bb.js out of the entry chunk (massive).
          if (
            id.includes('@aztec/bb.js') ||
            id.includes('@noir-lang/backend_barretenberg') ||
            id.includes('bb.js:wasm')
          ) {
            return 'noir-bb';
          }
          if (
            id.includes('@noir-lang/noir_js') ||
            id.includes('@noir-lang/noirc_abi') ||
            id.includes('@noir-lang/acvm_js') ||
            id.includes('noirc_abi_wasm') ||
            id.includes('acvm_js')
          ) {
            return 'noir-runtime';
          }
          if (id.includes('node_modules/preact') || id.includes('node_modules/@preact')) {
            return 'preact-runtime';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  
  worker: {
    format: 'es',
  },
});
