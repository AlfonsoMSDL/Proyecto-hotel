import React, { useEffect, useState, useCallback } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext.jsx';
import {fetchBookingsByStatus, cancelBooking} from '../api/bookings.js'
import styles from './MyBookings.module.css';

const SECTIONS = [
  { key: 'Confirmada', label: 'Confirmadas' },
  { key: 'Completada', label: 'Completadas' },
  { key: 'Cancelada',  label: 'Canceladas'  },
];

const STATUS_TAG = {
  Confirmada: 'tag tag-accent',
  Completada: 'tag tag-neutral',
  Cancelada:  'tag tag-outline',
};



function formatDate(ts) {
  if (!ts) return '—';
  const str = typeof ts === 'string' ? ts : new Date(ts).toISOString();
  const [year, month, day] = str.substring(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function calcNights(llegada, salida) {
  const a = new Date(typeof llegada === 'string' ? llegada.substring(0, 10) : llegada);
  const b = new Date(typeof salida  === 'string' ? salida.substring(0, 10)  : salida);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export default function MyBookings() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Confirmada');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadBookings = useCallback(async (estado) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchBookingsByStatus(estado);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar las reservas.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings(activeTab);
  }, [activeTab, loadBookings]);

  const handleCancel = async (booking) => {
    const result = await Swal.fire({
      theme,
      icon: 'warning',
      title: '¿Cancelar reserva?',
      text: `Habitación ${booking.numeroHabitacion} · ${formatDate(booking.fechaLlegada)} al ${formatDate(booking.fechaSalida)}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
    });

    if (!result.isConfirmed) return;

    try {
      await cancelBooking(booking.idReserva);
      await Swal.fire({
        theme,
        icon: 'success',
        title: 'Reserva cancelada',
        text: 'Tu reserva ha sido cancelada correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      loadBookings(activeTab);
    } catch (err) {
      Swal.fire({ theme, icon: 'error', title: 'Error', text: err.message });
    }
  };

  return (
    <div>
      <ClientNav />
      <div className={styles.page}>
        {/* Encabezado */}
        <div className={styles.header}>
          <h1 className={styles.title}>Mis reservas</h1>
          <p className={styles.subtitle}>Consulta y gestiona tus estadías en Verdant.</p>
        </div>

        {/* Tabs */}
        <div className={`seg ${styles.tabs}`}>
          {SECTIONS.map(({ key, label }) => (
            <label
              className={`seg-opt ${styles.tab}`}
              key={key}
            >
              <input
                type="radio"
                name="bookingTab"
                checked={activeTab === key}
                onChange={() => setActiveTab(key)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className={styles.loading}>
            Cargando reservas...
          </div>
        ) : errorMsg ? (
          <div className={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        ) : bookings.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <div className={styles.emptyTitle}>No hay reservas {SECTIONS.find(s => s.key === activeTab)?.label.toLowerCase()}</div>
            <p className={styles.emptyText}>
              {activeTab === 'Confirmada'
                ? 'Aún no tienes reservas activas. ¡Explora el catálogo y reserva tu habitación!'
                : activeTab === 'Completada'
                ? 'Todavía no tienes estadías completadas.'
                : 'No tienes reservas canceladas.'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {bookings.map((b) => {
              const nights = calcNights(b.fechaLlegada, b.fechaSalida);
              return (
                <div
                  key={b.idReserva}
                  className={`card ${styles.booking} ${b.estado === 'Cancelada' ? styles.bookingCancelled : ''}`}
                >
                  {/* Info */}
                  <div className={styles.info}>
                    {/* Icono de habitación */}
                    <div className={styles.icon} aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
                        <circle cx="7" cy="11" r="1.8" />
                      </svg>
                    </div>

                    <div className={styles.details}>
                      <div className={styles.roomName}>
                        Habitación {b.numeroHabitacion}
                      </div>
                      <div className={styles.dates}>
                        {formatDate(b.fechaLlegada)} → {formatDate(b.fechaSalida)}
                        &nbsp;·&nbsp;{nights} noche{nights !== 1 ? 's' : ''}
                      </div>
                      <div className={styles.reference}>
                        Reserva #{b.idReserva}
                      </div>
                    </div>
                  </div>

                  {/* Estado + acciones */}
                  <div className={styles.actions}>
                    <span className={STATUS_TAG[b.estado] ?? 'tag tag-neutral'}>
                      {b.estado}
                    </span>
                    {b.estado === 'Confirmada' && (
                      <button
                        className={`btn btn-secondary ${styles.cancelButton}`}
                        onClick={() => handleCancel(b)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
