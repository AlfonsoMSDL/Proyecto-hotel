import React, { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav.jsx';
import { searchBookingsByClientName } from '../../api/bookings.js';
import { fetchUsersByRol } from '../../api/users.js';
import { fetchRooms } from '../../api/rooms.js';

const statusTag = {
  Confirmada: 'tag tag-accent',
  Completada: 'tag tag-neutral',
  Cancelada: 'tag tag-outline',
};

function formatDate(ts) {
  if (!ts) return '—';
  const str = typeof ts === 'string' ? ts : new Date(ts).toISOString();
  const [year, month, day] = str.substring(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function calcNights(llegada, salida) {
  const a = new Date(typeof llegada === 'string' ? llegada.substring(0, 10) : llegada);
  const b = new Date(typeof salida === 'string' ? salida.substring(0, 10) : salida);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [clientsById, setClientsById] = useState({});
  const [priceByRoomNumber, setPriceByRoomNumber] = useState({});

  // GetReserva solo trae idUsuario y numHabitacion: se cargan clientes y habitaciones
  // una vez para mostrar el nombre del cliente y calcular el total.
  useEffect(() => {
    fetchUsersByRol('CLIENTE')
      .then((users) => {
        const map = {};
        users.forEach((u) => { map[u.id] = `${u.nombre} ${u.apellido}`; });
        setClientsById(map);
      })
      .catch((err) => console.error(err));

    fetchRooms(0, 1000)
      .then((data) => {
        const rooms = Array.isArray(data.content) ? data.content : data;
        const map = {};
        rooms.forEach((r) => { map[r.numero] = r.precioNoche; });
        setPriceByRoomNumber(map);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const nombreCompleto = searchTerm.trim();
    if (!nombreCompleto) {
      setErrorMsg('Ingresa el nombre completo del cliente.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await searchBookingsByClientName(nombreCompleto);
      setBookings(Array.isArray(data) ? data : []);
      setSearchedName(nombreCompleto);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al buscar las reservas.');
      setBookings([]);
      setSearchedName('');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchedName('');
    setBookings([]);
    setErrorMsg('');
  };

  const getTotal = (b) => {
    const price = priceByRoomNumber[b.numHabitacion];
    if (price == null) return '—';
    return `$${(calcNights(b.fechaLlegada, b.fechaSalida) * price).toLocaleString()}`;
  };

  return (
    <div>
      <AdminNav />
      <div style={{ padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ margin: 0 }}>Reservas</h1>
          <p style={{ opacity: 0.65, margin: 0, fontSize: 14 }}>
            Busca las reservas confirmadas de un cliente por su nombre completo.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input"
            type="text"
            placeholder="Ej: Juan Pérez"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Nombre completo del cliente"
            style={{ flex: '1 1 280px', maxWidth: 420 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {(searchedName || errorMsg) && (
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Limpiar
            </button>
          )}
        </form>

        {errorMsg && (
          <div style={{
            padding: '14px 18px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-accent-700)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-accent-200)',
            fontSize: 14,
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {searchedName && !loading && (
          <p style={{ opacity: 0.65, margin: 0, fontSize: 14 }}>
            {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} para "{searchedName}"
          </p>
        )}

        <table className="table">
          <thead>
            <tr><th>Reserva</th><th>Cliente</th><th>Habitación</th><th>Fechas</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Buscando reservas...</td></tr>
            ) : !searchedName ? (
              <tr><td colSpan={6} style={{ opacity: 0.7 }}>Ingresa el nombre de un cliente para ver sus reservas.</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} style={{ opacity: 0.7 }}>No se encontraron reservas confirmadas para este cliente.</td></tr>
            ) : (
              bookings.map((b) => {
                const nights = calcNights(b.fechaLlegada, b.fechaSalida);
                return (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{clientsById[b.idUsuario] ?? `Cliente #${b.idUsuario}`}</td>
                    <td>{b.numHabitacion}</td>
                    <td>
                      {formatDate(b.fechaLlegada)} → {formatDate(b.fechaSalida)}
                      <span style={{ opacity: 0.6 }}> · {nights} noche{nights !== 1 ? 's' : ''}</span>
                    </td>
                    <td>{getTotal(b)}</td>
                    <td><span className={statusTag.Confirmada}>Confirmada</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
