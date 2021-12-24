import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		minify: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('rxjs')) return 'rxjs'
					else if (id.includes('vue')) return 'vue'
					else return 'main'
				},
			},
		},
	},
})
