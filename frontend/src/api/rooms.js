// TODO: reemplazar estos stubs por llamadas reales a tu backend.
import { rooms } from '../data/mockData.js';
const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";

export async function fetchRooms(page = 0, size = 5) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await fetch(BACKEND_URL_BASE + '/habitaciones?' + params.toString());
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || 'Error al obtener habitaciones');
  }
  return response.json();
}

export async function fetchRoomById(id) {
  // return fetch(`/api/rooms/${id}`).then(r => r.json());
  return Promise.resolve(rooms.find((r) => r.id === id));
}

export async function createRoom(payload, imageFiles = []) {
  const formData = new FormData();

  // Si los nombres de los campos en el payload no coinciden con los nombres esperados por el backend,
  // ajusta aquí el mapeo manualmente.
  const fieldMap = {
    number: 'numero',
    capacity: 'capacidad',
    type: 'tipoHabitacion',
    price: 'precioNoche',
    description: 'descripcion',
    // Agrega aquí otros campos según tu backend, por ejemplo:
    // number: 'numero',
    // capacity: 'capacidad',
    // type: 'tipoHabitacion',
    // price: 'precioNoche',
    // description: 'descripcion',
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const fieldName = fieldMap[key] ?? key;
      formData.append(fieldName, value);
    }
  });
  imageFiles.forEach((file) => {
    formData.append('imagenes', file);
  });

  const token = localStorage.getItem('token');
  const response = await fetch(BACKEND_URL_BASE+'/habitaciones', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al crear habitación');
  }

  return response.json();
}

export async function deleteRoom(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL_BASE}/habitaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al eliminar habitación');
  }

  return true;
}
