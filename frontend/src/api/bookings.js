import { authFetch } from '../utils/session.js';
const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";

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
    try {
      const errorText = await response.text();
      if (errorText) return errorText;
    } catch {
      // ignore
    }
  }
  return defaultMsg;
}

export async function fetchRoomBookings(idHabitacion) {
  const response = await authFetch(`${BACKEND_URL_BASE}/reservas/habitaciones/${idHabitacion}`);

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al obtener las reservas de la habitación');
    throw new Error(errorText);
  }

  return response.json();
}

export async function createBooking(payload) {
  const response = await authFetch(`${BACKEND_URL_BASE}/reservas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al crear la reserva');
    throw new Error(errorText);
  }

  return response.json();
}

export async function fetchBookingsByStatus(estado) {
  const response = await authFetch(
    `${BACKEND_URL_BASE}/reservas/mis_reservas?estado=${encodeURIComponent(estado)}`
  );
  if (!response.ok) throw new Error('Error al obtener reservas');
  return response.json();
}

export async function cancelBooking(id) {
  const response = await authFetch(`${BACKEND_URL_BASE}/reservas/cancelar/${id}`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('No se pudo cancelar la reserva');
}


export async function searchBookingsByClientName(nombreCompleto) {
  const response = await authFetch(
    `${BACKEND_URL_BASE}/reservas/clientes/${encodeURIComponent(nombreCompleto)}`
  );
  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'Error al buscar las reservas del cliente');
    throw new Error(errorText);
  }
  return response.json();
}

export async function markCheckIn(idReserva) {
  const response = await authFetch(`${BACKEND_URL_BASE}/reservas/marcar-entrada/${idReserva}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'No se pudo marcar la entrada');
    throw new Error(errorText);
  }
}

export async function markCheckOut(idReserva) {
  const response = await authFetch(`${BACKEND_URL_BASE}/reservas/marcar-salida/${idReserva}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorText = await parseErrorMessage(response, 'No se pudo marcar la salida');
    throw new Error(errorText);
  }
}
