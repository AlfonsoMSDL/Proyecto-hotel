// Ruta base del backend. Es relativa: en Docker la atiende Nginx (proxy a
// backend:8181) y en `npm run dev` el proxy de Vite (vite.config.js), así el
// front funciona en cualquier dominio sin cambiar código ni CORS.
export const BACKEND_URL_BASE = "/hotel/api";
