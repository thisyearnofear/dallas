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
	plugins: [preact(), copyCircuitsPlugin()],
	define: {
		global: 'globalThis',
		'process.env': {},
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
});
