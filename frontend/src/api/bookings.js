// TODO: reemplazar estos stubs por llamadas reales a tu backend.
import { myBookings, adminBookings } from '../data/mockData.js';

export async function fetchMyBookings() {
  return Promise.resolve(myBookings);
}

export async function fetchAllBookings() {
  return Promise.resolve(adminBookings);
}

export async function createBooking(payload) {
  console.log('createBooking (mock)', payload);
  return Promise.resolve({ ok: true });
}
