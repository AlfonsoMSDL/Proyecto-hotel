import { authFetch } from '../utils/session.js';
//const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";
//trayendo el hostname desde variables de entorno
export const BACKEND_URL_BASE = "/hotel/api";

export async function fetchUsers(page = 0) {
  const params = new URLSearchParams({ page: String(page), size: '5' });
  const res = await authFetch(`${BACKEND_URL_BASE}/usuarios?${params.toString()}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Error al obtener usuarios');
  }
  return res.json();
}

export async function deleteUser(id) {
  const res = await authFetch(`${BACKEND_URL_BASE}/usuarios/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Error al eliminar usuario');
  }
  return true;
}

export async function fetchUsersByRol(rol) {
  const res = await authFetch(`${BACKEND_URL_BASE}/usuarios/byRol/${rol}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Error al obtener usuarios');
  }
  return res.json();
}
