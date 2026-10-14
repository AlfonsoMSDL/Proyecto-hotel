import { jwtDecode } from 'jwt-decode';

// Utilidades de sesión basadas en el JWT guardado en localStorage.
// El backend firma el token con `exp` y responde 401 cuando está vencido o es inválido.

const TOKEN_KEY = 'token';
const SESSION_EXPIRED_EVENT = 'verdant:session-expired';

// Margen para no usar un token a punto de vencer (desfase de reloj, latencia).
const EXPIRY_MARGIN_MS = 5000;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Devuelve los claims del token o null si no se puede decodificar.
export function getTokenClaims(token = getToken()) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

// Milisegundos que le quedan al token (0 si ya venció o no es válido).
export function getTokenRemainingMs(token = getToken()) {
  const claims = getTokenClaims(token);
  if (!claims || typeof claims.exp !== 'number') return 0;
  return Math.max(0, claims.exp * 1000 - Date.now() - EXPIRY_MARGIN_MS);
}

export function isTokenValid(token = getToken()) {
  return getTokenRemainingMs(token) > 0;
}

// — Aviso global de sesión expirada —
// AuthProvider se suscribe y se encarga de cerrar la sesión y llevar al login.

export function notifySessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function onSessionExpired(handler) {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
}

// fetch para endpoints protegidos: añade el header Authorization y, si el
// backend responde 401 (token vencido o inválido), avisa que la sesión expiró.
// En ese caso la promesa queda pendiente a propósito: la app navega al login y
// la página que hizo la petición se desmonta, así no se muestra además un
// error genérico ("Error al obtener reservas") encima del aviso de sesión.
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && token) {
    notifySessionExpired();
    return new Promise(() => {});
  }

  return response;
}
