import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
 export default defineConfig({
   plugins: [vue()],
   build: {
     rollupOptions: {
       output: {
         manualChunks: undefined,
       },
       // https://rollupjs.org/guide/en/#big-list-of-options
     },
   },
 });

