const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";

export async function fetchUsers(page = 0) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page: String(page), size: '5' });
  const res = await fetch(`${BACKEND_URL_BASE}/usuarios?${params.toString()}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined
    }
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Error al obtener usuarios');
  }
  return res.json();
}

export async function deleteUser(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL_BASE}/usuarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
    }
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Error al eliminar usuario');
  }
  return true;
}
