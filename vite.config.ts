import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
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
