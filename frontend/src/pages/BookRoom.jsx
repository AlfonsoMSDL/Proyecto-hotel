import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ClientNav from '../components/ClientNav.jsx';
import { fetchRoomById, getRoomFirstImage, BACKEND_URL_BASE } from '../api/rooms.js';
import { fetchRoomBookings, createBooking } from '../api/bookings.js';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext.jsx';
import styles from './BookRoom.module.css';

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
        fechaLlegada: `${checkInDate} 00:00:00`,
        fechaSalida: `${checkOutDate} 00:00:00`,
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
        <div className={styles.status}>
          Cargando disponibilidad de la habitación...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div>
        <ClientNav />
        <div className={styles.status}>
          <h2>Habitación no encontrada</h2>
          <Link to="/" className={`btn btn-secondary ${styles.statusAction}`}>
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

      <main className={styles.page}>
        {/* Enlace para volver */}
        <Link
          to={`/habitacion/${roomId}`}
          className={styles.backLink}
        >
          ← Volver al detalle de la habitación
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Reservar Habitación {room.numero}</h1>
          <p className={styles.subtitle}>
            Selecciona las fechas de tu estadía en el calendario. Las fechas ocupadas se encuentran bloqueadas.
          </p>
        </div>

        {selectionError && (
          <div className={styles.errorBox}>
            ⚠️ {selectionError}
          </div>
        )}

        {/* Layout Principal: Calendario + Resumen de Reserva */}
        <div className={styles.layout}>
          
          {/* Columna Izquierda: Calendario Interactivo */}
          <div className={`card ${styles.panel}`}>
            {/* Cabecera del mes y controles */}
            <div className={styles.monthBar}>
              <button
                type="button"
                className={`btn btn-secondary ${styles.monthButton}`}
                onClick={handlePrevMonth}
              >
                ←
              </button>
              <div className={styles.monthLabel}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </div>
              <button
                type="button"
                className={`btn btn-secondary ${styles.monthButton}`}
                onClick={handleNextMonth}
              >
                →
              </button>
            </div>

            {/* Días de la semana */}
            <div className={styles.weekDays}>
              {DAY_NAMES.map((name) => (
                <div key={name} className={styles.weekDay}>{name}</div>
              ))}
            </div>

            {/* Matriz de Días del Mes */}
            <div className={styles.daysGrid}>
              {calendarCells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className={styles.emptyDay} />;
                }

                const dayNumber = parseInt(dateStr.substring(8, 10), 10);
                const isPast = dateStr < todayStr;
                const isBooked = isDateBooked(dateStr);
                const isCheckIn = dateStr === checkInDate;
                const isCheckOut = dateStr === checkOutDate;
                const isInRange = checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;

                // Clase visual según estado del día (misma prioridad que antes:
                // pasada > ocupada > llegada/salida > dentro del rango)
                let dayStateClass = '';

                if (isPast) {
                  dayStateClass = styles.dayPast;
                } else if (isBooked) {
                  dayStateClass = styles.dayBooked;
                } else if (isCheckIn || isCheckOut) {
                  dayStateClass = styles.daySelected;
                } else if (isInRange) {
                  dayStateClass = styles.dayInRange;
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
                    className={`${styles.day} ${dayStateClass}`}
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>

            {/* Leyenda del Calendario */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles.swatchAvailable}`} />
                <span>Disponible</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles.swatchBooked}`} />
                <span>Ocupada</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles.swatchSelected}`} />
                <span>Tu selección</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Confirmación y Resumen */}
          <div className={`card ${styles.panel} ${styles.summary}`}>
            {/* Vista previa de la habitación */}
            <div className={styles.roomPreview}>
              {firstPhoto ? (
                <img
                  src={`${BACKEND_URL_BASE}/${firstPhoto.ruta}/${firstPhoto.nombre}`}
                  alt={`Habitación ${room.numero}`}
                  className={styles.roomThumb}
                />
              ) : (
                <div className={`${styles.roomThumb} ${styles.roomThumbEmpty}`}>
                  Sin imagen
                </div>
              )}
              <div className={styles.roomMeta}>
                <h3 className={styles.roomName}>Habitación {room.numero}</h3>
                <span className={`tag tag-accent ${styles.roomTag}`}>
                  {room.tipoHabitacion}
                </span>
                <span className={styles.roomCapacity}>
                  Capacidad: {room.capacidad} personas
                </span>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Inputs de fecha manual / sincronizados con el calendario */}
            <div className={styles.dateFields}>
              <div className="field">
                <label className={styles.fieldLabel}>Fecha de llegada</label>
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
                />
              </div>
              <div className="field">
                <label className={styles.fieldLabel}>Fecha de salida</label>
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
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* Desglose de precios */}
            <div className={styles.breakdown}>
              <div className={styles.breakdownRow}>
                <span>Precio por noche:</span>
                <span>${room.precioNoche.toLocaleString()}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Noches seleccionadas:</span>
                <span>{nights} noche{nights === 1 ? '' : 's'}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total:</span>
                <span className={styles.totalValue}>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              type="button"
              className={`btn btn-primary ${styles.confirmButton}`}
              disabled={!checkInDate || !checkOutDate || nights === 0 || submitting}
              onClick={handleConfirmBooking}
            >
              {submitting ? 'Procesando reserva...' : 'Confirmar Reserva'}
            </button>

            <div className={styles.note}>
              Confirmación inmediata. Al reservar, tu estadía quedará registrada y podrás gestionarla desde tu perfil.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
