import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AdminNav from '../../components/AdminNav.jsx';
import Modal from '../../components/Modal.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { searchBookingsByClientName, markCheckIn, markCheckOut } from '../../api/bookings.js';
import { fetchUsersByRol } from '../../api/users.js';
import { fetchRooms } from '../../api/rooms.js';
import styles from './AdminBookings.module.css';

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

function DetailRow({ label, children }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{children}</span>
    </div>
  );
}

export default function AdminBookings() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [roomTerm, setRoomTerm] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [searchedRoom, setSearchedRoom] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [clientsById, setClientsById] = useState({});
  const [roomsByNumber, setRoomsByNumber] = useState({});
  const [selected, setSelected] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadRooms = () =>
    fetchRooms(0, 1000)
      .then((data) => {
        const rooms = Array.isArray(data.content) ? data.content : data;
        const map = {};
        rooms.forEach((r) => { map[r.numero] = r; });
        setRoomsByNumber(map);
      })
      .catch((err) => console.error(err));

  // GetReserva solo trae idUsuario y numHabitacion: se cargan clientes y habitaciones
  // para mostrar el nombre del cliente, el estado de la habitación y calcular el total.
  useEffect(() => {
    fetchUsersByRol('CLIENTE')
      .then((users) => {
        const map = {};
        users.forEach((u) => { map[u.id] = `${u.nombre} ${u.apellido}`; });
        setClientsById(map);
      })
      .catch((err) => console.error(err));

    loadRooms();
  }, []);

  const refreshSearch = async (nombreCompleto, numHabitacion) => {
    try {
      const data = await searchBookingsByClientName(nombreCompleto);
      const list = Array.isArray(data) ? data : [];
      setBookings(numHabitacion ? list.filter((b) => String(b.numHabitacion) === numHabitacion) : list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const nombreCompleto = searchTerm.trim();
    const numHabitacion = roomTerm.trim();
    if (!nombreCompleto) {
      setErrorMsg('Ingresa el nombre completo del cliente.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await searchBookingsByClientName(nombreCompleto);
      const list = Array.isArray(data) ? data : [];
      setBookings(numHabitacion ? list.filter((b) => String(b.numHabitacion) === numHabitacion) : list);
      setSearchedName(nombreCompleto);
      setSearchedRoom(numHabitacion);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al buscar las reservas.');
      setBookings([]);
      setSearchedName('');
      setSearchedRoom('');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setRoomTerm('');
    setSearchedName('');
    setSearchedRoom('');
    setBookings([]);
    setErrorMsg('');
  };

  const getTotal = (b) => {
    const price = roomsByNumber[b.numHabitacion]?.precioNoche;
    if (price == null) return '—';
    return `$${(calcNights(b.fechaLlegada, b.fechaSalida) * price).toLocaleString()}`;
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await markCheckIn(selected.id);
      await Swal.fire({
        theme,
        icon: 'success',
        title: 'Entrada registrada',
        text: `La habitación ${selected.numHabitacion} ahora está ocupada.`,
      });
      setSelected(null);
      await loadRooms();
      if (searchedName) {
        await refreshSearch(searchedName, searchedRoom);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ theme, icon: 'error', title: 'No se pudo marcar la entrada', text: err.message });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    const result = await Swal.fire({
      theme,
      title: '¿Marcar salida?',
      text: `Se registrará la salida del cliente de la habitación ${selected.numHabitacion}. La habitación volverá a estar disponible y la reserva pasará a Completada.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar salida',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    setCheckingOut(true);
    try {
      await markCheckOut(selected.id);
      await Swal.fire({
        theme,
        icon: 'success',
        title: 'Salida registrada',
        text: `La habitación ${selected.numHabitacion} ahora está disponible y la reserva #${selected.id} fue completada.`,
      });
      setSelected(null);
      await loadRooms();
      if (searchedName) {
        await refreshSearch(searchedName, searchedRoom);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ theme, icon: 'error', title: 'No se pudo marcar la salida', text: err.message });
    } finally {
      setCheckingOut(false);
    }
  };

  const selectedRoomState = selected ? roomsByNumber[selected.numHabitacion]?.estadoActual : null;
  const isOccupied = selectedRoomState === 'Ocupada';
  const isAvailable = selectedRoomState === 'Disponible';
  const isBusy = checkingIn || checkingOut;

  return (
    <div>
      <AdminNav />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Reservas</h1>
          <p className={styles.subtitle}>
            Busca las reservas de un cliente para registrar la entrada (check-in) o salida (check-out).
          </p>
        </div>

        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            className={`input ${styles.nameInput}`}
            type="text"
            placeholder="Ej: Juan Pérez"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Nombre completo del cliente"
          />
          <input
            className={`input ${styles.roomInput}`}
            type="number"
            min="1"
            placeholder="Nº habitación (opcional)"
            value={roomTerm}
            onChange={(e) => setRoomTerm(e.target.value)}
            aria-label="Número de habitación"
          />
          <button type="submit" className={`btn btn-primary ${styles.searchButton}`} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {(searchedName || errorMsg) && (
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Limpiar
            </button>
          )}
        </form>

        {errorMsg && (
          <div className={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        )}

        {searchedName && !loading && (
          <p className={styles.resultsInfo}>
            {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} para "{searchedName}"
            {searchedRoom && ` en la habitación ${searchedRoom}`}
          </p>
        )}

        <div className={styles.tableCard}>
          <table className={`table ${styles.table}`}>
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Cliente</th>
                <th>Habitación</th>
                <th>Estado Habitación</th>
                <th>Fechas</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.messageCell}>Buscando reservas...</td></tr>
              ) : !searchedName ? (
                <tr><td colSpan={7} className={styles.messageCell}>Ingresa el nombre de un cliente para ver sus reservas.</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className={styles.messageCell}>
                  {searchedRoom
                    ? `El cliente no tiene una reserva activa para la habitación ${searchedRoom}.`
                    : 'No se encontraron reservas confirmadas para este cliente.'}
                </td></tr>
              ) : (
                bookings.map((b) => {
                  const nights = calcNights(b.fechaLlegada, b.fechaSalida);
                  const roomState = roomsByNumber[b.numHabitacion]?.estadoActual;
                  const canCheckOut = roomState === 'Ocupada';
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      title={canCheckOut ? 'Hacer clic para marcar salida' : 'Hacer clic para marcar entrada'}
                      className={styles.clickableRow}
                    >
                      <td className={styles.muted}>#{b.id}</td>
                      <td>{clientsById[b.idUsuario] ?? `Cliente #${b.idUsuario}`}</td>
                      <td><strong>Habitación {b.numHabitacion}</strong></td>
                      <td>
                        <span className={roomState === 'Disponible' ? 'tag tag-accent' : roomState === 'Ocupada' ? 'tag tag-neutral' : 'tag tag-outline'}>
                          {roomState ?? '—'}
                        </span>
                      </td>
                      <td>
                        {formatDate(b.fechaLlegada)} → {formatDate(b.fechaSalida)}
                        <span className={styles.muted}> · {nights} noche{nights !== 1 ? 's' : ''}</span>
                      </td>
                      <td className={styles.numeric}>{getTotal(b)}</td>
                      <td>
                        {canCheckOut ? (
                          <button
                            type="button"
                            className={`btn btn-secondary ${styles.rowButton}`}
                            onClick={(e) => { e.stopPropagation(); setSelected(b); }}
                          >
                            Marcar salida
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`btn btn-primary ${styles.rowButton}`}
                            onClick={(e) => { e.stopPropagation(); setSelected(b); }}
                          >
                            Marcar entrada
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal
          title={
            isOccupied
              ? `Marcar salida (Check-out) · Reserva #${selected.id}`
              : `Marcar entrada (Check-in) · Reserva #${selected.id}`
          }
          onClose={() => !isBusy && setSelected(null)}
          actions={<>
            <button className="btn btn-secondary" onClick={() => setSelected(null)} disabled={isBusy}>
              Cancelar
            </button>
            {isOccupied ? (
              <button
                className="btn btn-primary"
                onClick={handleCheckOut}
                disabled={isBusy}
              >
                {checkingOut ? 'Marcando salida...' : 'Marcar salida'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleCheckIn}
                disabled={isBusy || !isAvailable}
              >
                {checkingIn ? 'Marcando entrada...' : 'Marcar entrada'}
              </button>
            )}
          </>}
        >
          <div className={styles.details}>
            <DetailRow label="Cliente">{clientsById[selected.idUsuario] ?? `Cliente #${selected.idUsuario}`}</DetailRow>
            <DetailRow label="Habitación">
              {selected.numHabitacion}
              {selectedRoomState && (
                <span
                  className={`${isAvailable ? 'tag tag-accent' : isOccupied ? 'tag tag-neutral' : 'tag tag-outline'} ${styles.inlineTag}`}
                >
                  {selectedRoomState}
                </span>
              )}
            </DetailRow>
            <DetailRow label="Llegada">{formatDate(selected.fechaLlegada)}</DetailRow>
            <DetailRow label="Salida">{formatDate(selected.fechaSalida)}</DetailRow>
            <DetailRow label="Total">{getTotal(selected)}</DetailRow>
            <p className={styles.detailNote}>
              {isOccupied
                ? 'El huésped ya ingresó. Al marcar la salida, la reserva pasará a Completada y la habitación volverá a estar Disponible.'
                : isAvailable
                ? 'Al confirmar, la habitación pasará a estado Ocupada. Recuerda que solo se puede marcar la entrada en la fecha de llegada de la reserva.'
                : `La habitación se encuentra en estado "${selectedRoomState}". No se puede registrar la entrada en este momento.`}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
