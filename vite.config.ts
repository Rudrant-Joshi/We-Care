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
    },
  },
})
