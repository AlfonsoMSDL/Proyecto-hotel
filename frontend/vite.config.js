import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo (`npm run dev`) reenvía la API al backend local, igual que
    // hace Nginx en Docker; así el front siempre usa la ruta relativa /hotel/api.
    proxy: {
      '/hotel/api': {
        target: process.env.VITE_BACKEND_TARGET || 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },
});
