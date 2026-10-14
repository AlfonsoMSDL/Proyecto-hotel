import { authFetch } from '../utils/session.js';
import { BACKEND_URL_BASE } from './config.js';
// Se re-exporta porque BookRoom y AdminRoomForm la importan desde aquí.
export { BACKEND_URL_BASE };

async function parseErrorMessage(response, defaultMsg) {
  try {
    const errorJson = await response.json();
    if (errorJson && typeof errorJson === 'object') {
      if (errorJson.error) return errorJson.error;
      if (errorJson.mensaje) return errorJson.mensaje;
      const values = Object.values(errorJson);
      if (values.length > 0) return values.join(', ');
    }
  } catch {
    // If response is not JSON
    try {
      const errorText = await response.text();
      if (errorText) return errorText;
    } catch {
      // ignore
    }
  }
  return defaultMsg;
}

export async function fetchRooms(page = 0, size = 5) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await fetch(BACKEND_URL_BASE + '/habitaciones?' + params.toString());
  if (!response.ok) {
    const txt = await parseErrorMessage(response, 'Error al obtener habitaciones');
    throw new Error(txt);
  }
  return response.json();
}

export async function fetchRoomsByType(type){

  const response = await fetch(BACKEND_URL_BASE+"/habitaciones/tipo/"+type); 

  if(!response.ok){
    throw new Error("Hubo un error con la peticion");
  }

  return response.json();

}

export async function fetchRoomsByPriceRange(min, max){
  const params = new URLSearchParams({"precioMinimo":min,"precioMaximo":max});

  const response = await fetch(BACKEND_URL_BASE+"/habitaciones/precio?"+params.toString());

  if(!response.ok){
    throw new Error("Hubo un error con la peticion");
  }

  return response.json(); 
}

export async function fetchRoomsByAvailability(fechaLlegada, fechaSalida) {
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    let formatted = dateStr.replace('T', ' ');
    if (!formatted.includes(' ')) {
      formatted = `${formatted} 00:00:00`;
    }
    const parts = formatted.split(' ');
    if (parts[1] && parts[1].split(':').length === 2) {
      formatted = `${formatted}:00`;
    }
    return formatted;
  };

  const params = new URLSearchParams({
    fechaLlegada: formatTimestamp(fechaLlegada),
    fechaSalida: formatTimestamp(fechaSalida),
  });

  const response = await fetch(BACKEND_URL_BASE + '/habitaciones/disponibilidad_fecha?' + params.toString());

  if (!response.ok) {
    const txt = await parseErrorMessage(response, 'Error al filtrar habitaciones por disponibilidad de fechas');
    throw new Error(txt);
  }

  return response.json();
}


export async function fetchRoomById(id) {
  const response = await fetch(`${BACKEND_URL_BASE}/habitaciones/${id}`);
  if (!response.ok) {
    const txt = await parseErrorMessage(response, 'Error al obtener la habitación');
    throw new Error(txt);
  }
  return response.json();
}

export async function getRoomImages(id) {
  const response = await fetch(`${BACKEND_URL_BASE}/fotos/habitacion/${id}`);
  if (!response.ok) {
    const txt = await parseErrorMessage(response, 'Error al obtener las fotos de la habitación');
    throw new Error(txt);
  }
  return response.json();
}

export async function getRoomFirstImage(id) {
  const response = await fetch(`${BACKEND_URL_BASE}/fotos/first/habitacion/${id}`);
  if (!response.ok) {
    const txt = await parseErrorMessage(response, 'Error al obtener la foto de portada');
    throw new Error(txt);
  }
  return response.json();
}

export async function createRoom(payload, imageFiles = []) {
  const formData = new FormData();

  const fieldMap = {
    number: 'numero',
    capacity: 'capacidad',
    type: 'tipoHabitacion',
    price: 'precioNoche',
    description: 'descripcion',
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

  const response = await authFetch(BACKEND_URL_BASE + '/habitaciones', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al crear la habitación');
    throw new Error(errorText);
  }

  return response.json();
}

export async function updateRoom(id, payload) {
  const bodyData = {
    numero: Number(payload.number ?? payload.numero),
    tipoHabitacion: payload.type ?? payload.tipoHabitacion,
    precioNoche: Number(payload.price ?? payload.precioNoche),
    capacidad: Number(payload.capacity ?? payload.capacidad),
    descripcion: payload.description ?? payload.descripcion,
  };

  const response = await authFetch(`${BACKEND_URL_BASE}/habitaciones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al actualizar la habitación');
    throw new Error(errorText);
  }

  return response.json();
}

export async function addRoomImage(idHabitacion, file) {
  const formData = new FormData();
  formData.append('imagen', file);

  const response = await authFetch(`${BACKEND_URL_BASE}/habitaciones/${idHabitacion}/fotos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al subir la imagen');
    throw new Error(errorText);
  }

  return response.json();
}

export async function deleteRoomImage(idFoto) {
  const response = await authFetch(`${BACKEND_URL_BASE}/fotos/${idFoto}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al eliminar la imagen');
    throw new Error(errorText);
  }

  return true;
}

export async function deleteRoom(id) {
  const res = await authFetch(`${BACKEND_URL_BASE}/habitaciones/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await parseErrorMessage(res, 'Error al eliminar habitación');
    throw new Error(errorText);
  }

  return true;
}


