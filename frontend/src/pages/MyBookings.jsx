import React, { useEffect, useState, useCallback } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext.jsx';
import {fetchBookingsByStatus, cancelBooking} from '../api/bookings.js'

const BACKEND_URL_BASE = 'http://localhost:8181/hotel/api';

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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 40px 64px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0 }}>Mis reservas</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Consulta y gestiona tus estadías en Verdant.</p>
        </div>

        {/* Tabs */}
        <div className="seg" style={{ width: 'fit-content' }}>
          {SECTIONS.map(({ key, label }) => (
            <label
              className="seg-opt"
              key={key}
              style={{ padding: '8px 20px', cursor: 'pointer' }}
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
          <div style={{ textAlign: 'center', opacity: 0.7, padding: '48px 0' }}>
            Cargando reservas...
          </div>
        ) : errorMsg ? (
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
        ) : bookings.length === 0 ? (
          <div
            className="card elev-sm"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid var(--color-divider)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500 }}>No hay reservas {SECTIONS.find(s => s.key === activeTab)?.label.toLowerCase()}</div>
            <p style={{ opacity: 0.65, margin: 0, maxWidth: 360, fontSize: 14 }}>
              {activeTab === 'Confirmada'
                ? 'Aún no tienes reservas activas. ¡Explora el catálogo y reserva tu habitación!'
                : activeTab === 'Completada'
                ? 'Todavía no tienes estadías completadas.'
                : 'No tienes reservas canceladas.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map((b) => {
              const nights = calcNights(b.fechaLlegada, b.fechaSalida);
              return (
                <div
                  key={b.idReserva}
                  className="card elev-sm"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-divider)',
                    opacity: b.estado === 'Cancelada' ? 0.65 : 1,
                    gap: 16,
                  }}
                >
                  {/* Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 }}>
                    {/* Icono de habitación */}
                    <div style={{
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-divider)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      🛏️
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        Habitación {b.numeroHabitacion}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>
                        {formatDate(b.fechaLlegada)} → {formatDate(b.fechaSalida)}
                        &nbsp;·&nbsp;{nights} noche{nights !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.55 }}>
                        Reserva #{b.idReserva}
                      </div>
                    </div>
                  </div>

                  {/* Estado + acciones */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span className={STATUS_TAG[b.estado] ?? 'tag tag-neutral'}>
                      {b.estado}
                    </span>
                    {b.estado === 'Confirmada' && (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 13 }}
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
