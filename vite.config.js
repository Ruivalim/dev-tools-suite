import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte'],
					utils: ['./src/lib/stores/theme.ts', './src/lib/themes/index.ts']
				}
			}
		},
		chunkSizeWarningLimit: 1000
	}
});