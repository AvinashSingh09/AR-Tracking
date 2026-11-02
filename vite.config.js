import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig(({ mode }) => ({
  plugins: mode === 'https' ? [basicSsl()] : [],
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { rollupOptions: { input: { main: 'index.html', ar: 'ar.html' } } },
}));
