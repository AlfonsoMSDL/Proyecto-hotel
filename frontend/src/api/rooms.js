// TODO: reemplazar estos stubs por llamadas reales a tu backend.
import { rooms } from '../data/mockData.js';

export async function fetchRooms() {
  // return fetch('/api/rooms').then(r => r.json());
  return Promise.resolve(rooms);
}

export async function fetchRoomById(id) {
  // return fetch(`/api/rooms/${id}`).then(r => r.json());
  return Promise.resolve(rooms.find((r) => r.id === id));
}

export async function createRoom(payload) {
  // return fetch('/api/rooms', { method: 'POST', body: JSON.stringify(payload) });
  console.log('createRoom (mock)', payload);
  return Promise.resolve({ ok: true });
}

export async function deleteRoom(id) {
  // return fetch(`/api/rooms/${id}`, { method: 'DELETE' });
  console.log('deleteRoom (mock)', id);
  return Promise.resolve({ ok: true });
}
