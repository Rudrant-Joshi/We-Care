import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const doctorImageRedirectPlugin = (): Plugin => ({
  name: 'doctor-images-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/doctors\/([^?#]+\.(?:jpg|jpeg|png|webp|svg))/.test(req.url)) {
        req.url = req.url.replace(/^\/doctors\//, '/doctor-images/');
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), doctorImageRedirectPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@models': fileURLToPath(new URL('./src/models', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/views/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/views/pages', import.meta.url)),
      '@controllers': fileURLToPath(new URL('./src/controllers', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
})
