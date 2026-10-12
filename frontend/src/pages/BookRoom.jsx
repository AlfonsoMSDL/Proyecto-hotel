import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ClientNav from '../components/ClientNav.jsx';
import { fetchRoomById, getRoomFirstImage, BACKEND_URL_BASE } from '../api/rooms.js';
import { fetchRoomBookings, createBooking } from '../api/bookings.js';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext.jsx';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function BookRoom() {
  const { idHabitacion, id } = useParams();
  const roomId = idHabitacion || id;
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [room, setRoom] = useState(null);
  const [firstPhoto, setFirstPhoto] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fechas seleccionadas para la reserva
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectionError, setSelectionError] = useState('');

  // Control del mes visible en el calendario
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [roomData, bookingsData, photoData] = await Promise.all([
          fetchRoomById(roomId),
          fetchRoomBookings(roomId).catch(() => []),
          getRoomFirstImage(roomId).catch(() => null),
        ]);

        setRoom(roomData);
        setExistingBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setFirstPhoto(photoData);
      } catch (err) {
        console.error('Error cargando datos de reserva:', err);
        Swal.fire({
          theme,
          icon: 'error',
          title: 'Error',
          text: err.message || 'No fue posible cargar la información de la habitación.'
        });
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      loadData();
    }
  }, [roomId]);

  // Formato YYYY-MM-DD
  const formatToYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatToYMD(today);

  // Normaliza fechas del backend a objetos Date
  const parseBookingDates = (booking) => {
    const startStr = typeof booking.fechaLlegada === 'string'
      ? booking.fechaLlegada.substring(0, 10)
      : formatToYMD(new Date(booking.fechaLlegada));
    const endStr = typeof booking.fechaSalida === 'string'
      ? booking.fechaSalida.substring(0, 10)
      : formatToYMD(new Date(booking.fechaSalida));

    return {
      startStr,
      endStr,
      start: new Date(startStr + 'T00:00:00'),
      end: new Date(endStr + 'T00:00:00'),
    };
  };

  // Verifica si una fecha específica (YYYY-MM-DD) está reservada
  const isDateBooked = (dateStr) => {
    const target = new Date(dateStr + 'T00:00:00');
    return existingBookings.some((b) => {
      const { start, end } = parseBookingDates(b);
      // Una fecha está bloqueada si está dentro del rango [llegada, salida] inclusive
      return target >= start && target <= end;
    });
  };

  // Verifica si un rango [startStr, endStr] colisiona con alguna reserva existente
  const hasRangeConflict = (startStr, endStr) => {
    if (!startStr || !endStr) return false;
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    if (s >= e) return true;

    return existingBookings.some((b) => {
      const { start, end } = parseBookingDates(b);
      return s < end && e > start;
    });
  };

  // Manejo de clic en el calendario
  const handleDateClick = (dateStr) => {
    if (dateStr < todayStr || isDateBooked(dateStr)) {
      return; // No se puede seleccionar fecha pasada ni reservada
    }

    setSelectionError('');

    // Si no hay fecha de llegada, o ya había ambas seleccionadas -> empezar nueva selección
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dateStr);
      setCheckOutDate('');
      return;
    }

    // Si ya hay fecha de llegada y se selecciona una fecha
    if (checkInDate && !checkOutDate) {
      if (dateStr <= checkInDate) {
        // Si hace clic en una fecha anterior o igual, cambia la fecha de llegada
        setCheckInDate(dateStr);
        setCheckOutDate('');
      } else {
        // Verificar si entre checkInDate y dateStr hay fechas intermedias ocupadas
        if (hasRangeConflict(checkInDate, dateStr)) {
          setSelectionError('El rango seleccionado incluye fechas que ya están reservadas.');
          return;
        }
        setCheckOutDate(dateStr);
      }
    }
  };

  // Navegación de meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Cálculo de noches y costo total
  let nights = 0;
  let totalPrice = 0;
  if (checkInDate && checkOutDate && checkOutDate > checkInDate && !hasRangeConflict(checkInDate, checkOutDate)) {
    const diffTime = Math.abs(new Date(checkOutDate + 'T00:00:00') - new Date(checkInDate + 'T00:00:00'));
    nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
    totalPrice = room ? nights * room.precioNoche : 0;
  }

  // Confirmar y realizar la reserva
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      setSelectionError('Por favor selecciona las fechas de llegada y salida.');
      return;
    }

    if (hasRangeConflict(checkInDate, checkOutDate)) {
      setSelectionError('Las fechas seleccionadas ya no están disponibles.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        idHabitacion: Number(roomId),
        fechaLlegada: `${checkInDate}T00:00:00`,
        fechaSalida: `${checkOutDate}T00:00:00`,
      };

      await createBooking(payload);

      await Swal.fire({
        theme,
        icon: 'success',
        title: '¡Reserva confirmada!',
        text: `Tu estadía en la Habitación ${room?.numero} del ${checkInDate} al ${checkOutDate} ha sido registrada con éxito.`,
        confirmButtonText: 'Ver mis reservas'
      });

      navigate('/mis-reservas');
    } catch (err) {
      console.error('Error al realizar la reserva:', err);
      Swal.fire({
        theme,
        icon: 'error',
        title: 'Error al reservar',
        text: err.message || 'No fue posible completar la reserva.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <ClientNav />
        <div style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.7 }}>
          Cargando disponibilidad de la habitación...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div>
        <ClientNav />
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <h2>Habitación no encontrada</h2>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: 16 }}>
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Construcción de la matriz de días para el mes visible
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  // Celdas vacías antes del día 1
  for (let i = 0; i < startingDayIndex; i++) {
    calendarCells.push(null);
  }
  // Días del mes
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push(
      `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }

  return (
    <div>
      <ClientNav />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 40px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Enlace para volver */}
        <Link
          to={`/habitacion/${roomId}`}
          style={{ textDecoration: 'none', color: 'var(--color-text)', opacity: 0.75, width: 'fit-content' }}
        >
          ← Volver al detalle de la habitación
        </Link>

        <div>
          <h1 style={{ margin: '0 0 8px' }}>Reservar Habitación {room.numero}</h1>
          <p style={{ margin: 0, opacity: 0.75, fontSize: 15 }}>
            Selecciona las fechas de tu estadía en el calendario. Las fechas ocupadas se encuentran bloqueadas.
          </p>
        </div>

        {selectionError && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent-700)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-accent-200)',
              fontSize: 14,
            }}
          >
            ⚠️ {selectionError}
          </div>
        )}

        {/* Layout Principal: Calendario + Resumen de Reserva */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
          
          {/* Columna Izquierda: Calendario Interactivo */}
          <div className="card elev-sm" style={{ padding: '28px 24px', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cabecera del mes y controles */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrevMonth}
                style={{ padding: '6px 12px', fontSize: 14 }}
              >
                ←
              </button>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleNextMonth}
                style={{ padding: '6px 12px', fontSize: 14 }}
              >
                →
              </button>
            </div>

            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', fontWeight: 600, fontSize: 12, opacity: 0.7 }}>
              {DAY_NAMES.map((name) => (
                <div key={name} style={{ padding: '4px 0' }}>{name}</div>
              ))}
            </div>

            {/* Matriz de Días del Mes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {calendarCells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} style={{ height: 40 }} />;
                }

                const dayNumber = parseInt(dateStr.substring(8, 10), 10);
                const isPast = dateStr < todayStr;
                const isBooked = isDateBooked(dateStr);
                const isCheckIn = dateStr === checkInDate;
                const isCheckOut = dateStr === checkOutDate;
                const isInRange = checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;

                // Definir estilos según estado del día
                let background = 'var(--color-surface)';
                let color = 'var(--color-text)';
                let border = '1px solid var(--color-divider)';
                let cursor = 'pointer';
                let opacity = 1;

                if (isPast) {
                  opacity = 0.3;
                  cursor = 'not-allowed';
                  background = 'transparent';
                } else if (isBooked) {
                  opacity = 0.45;
                  cursor = 'not-allowed';
                  background = 'rgba(239, 68, 68, 0.15)';
                  border = '1px solid rgba(239, 68, 68, 0.35)';
                  color = '#fca5a5';
                } else if (isCheckIn || isCheckOut) {
                  background = 'var(--color-accent)';
                  color = '#fff';
                  border = '1px solid var(--color-accent)';
                } else if (isInRange) {
                  background = 'color-mix(in srgb, var(--color-accent) 22%, transparent)';
                  border = '1px solid var(--color-accent-600)';
                }

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isPast || isBooked}
                    onClick={() => handleDateClick(dateStr)}
                    title={
                      isBooked
                        ? 'Fecha ya reservada (Ocupada)'
                        : isPast
                        ? 'Fecha pasada'
                        : `Seleccionar ${dateStr}`
                    }
                    style={{
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      border,
                      background,
                      color,
                      opacity,
                      cursor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: (isCheckIn || isCheckOut) ? 700 : 500,
                      position: 'relative',
                      transition: 'all 0.15s ease',
                      padding: 0,
                    }}
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>

            {/* Leyenda del Calendario */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--color-divider)', paddingTop: 16, fontSize: 12, opacity: 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }} />
                <span>Disponible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)' }} />
                <span>Ocupada</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-accent)' }} />
                <span>Tu selección</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Confirmación y Resumen */}
          <div className="card elev-sm" style={{ padding: '28px 24px', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Vista previa de la habitación */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {firstPhoto ? (
                <img
                  src={`${BACKEND_URL_BASE}/${firstPhoto.ruta}/${firstPhoto.nombre}`}
                  alt={`Habitación ${room.numero}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, opacity: 0.6 }}>
                  Sin imagen
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Habitación {room.numero}</h3>
                <span className="tag tag-accent" style={{ width: 'fit-content', fontSize: 11 }}>
                  {room.tipoHabitacion}
                </span>
                <span style={{ fontSize: 13, opacity: 0.7 }}>
                  Capacidad: {room.capacidad} personas
                </span>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--color-divider)' }} />

            {/* Inputs de fecha manual / sincronizados con el calendario */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Fecha de llegada</label>
                <input
                  className="input"
                  type="date"
                  min={todayStr}
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    if (checkOutDate && e.target.value >= checkOutDate) {
                      setCheckOutDate('');
                    }
                  }}
                  style={{ padding: '8px 10px', fontSize: 13 }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Fecha de salida</label>
                <input
                  className="input"
                  type="date"
                  min={checkInDate || todayStr}
                  value={checkOutDate}
                  onChange={(e) => {
                    if (hasRangeConflict(checkInDate, e.target.value)) {
                      setSelectionError('El rango seleccionado contiene fechas ya reservadas.');
                      return;
                    }
                    setSelectionError('');
                    setCheckOutDate(e.target.value);
                  }}
                  style={{ padding: '8px 10px', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--color-divider)' }} />

            {/* Desglose de precios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
                <span>Precio por noche:</span>
                <span>${room.precioNoche.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
                <span>Noches seleccionadas:</span>
                <span>{nights} noche{nights === 1 ? '' : 's'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 18, borderTop: '1px solid var(--color-divider)', paddingTop: 12, marginTop: 4 }}>
                <span>Total:</span>
                <span style={{ color: 'var(--color-accent)' }}>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!checkInDate || !checkOutDate || nights === 0 || submitting}
              onClick={handleConfirmBooking}
              style={{ width: '100%', padding: '12px 20px', fontSize: 15, fontWeight: 600 }}
            >
              {submitting ? 'Procesando reserva...' : 'Confirmar Reserva'}
            </button>

            <div style={{ fontSize: 12, opacity: 0.65, textAlign: 'center', lineHeight: 1.4 }}>
              Confirmación inmediata. Al reservar, tu estadía quedará registrada y podrás gestionarla desde tu perfil.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
