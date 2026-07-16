import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClientNav from '../components/ClientNav.jsx';
import { fetchRoomById } from '../api/rooms.js';
import { useAuth } from '../context/AuthContext.jsx';
import { createBooking } from '../api/bookings.js';


export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomById(id).then(setRoom);
  }, [id]);

  if (!room) return null;

  const nights = 3;
  const total = room.price * nights;

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await createBooking({ roomId: room.id, nights, total });
    navigate('/mis-reservas');
  };

  return (
    <div>
      <ClientNav />

      <div style={{ padding: 'var(--space-4) 40px 0', fontSize: 13, opacity: 0.6 }}>
        <Link to="/" style={{ color: 'inherit' }}>Catálogo</Link> <span style={{ opacity: 0.5 }}>/</span> {room.type}{' '}
        <span style={{ opacity: 0.5 }}>/</span> <span style={{ opacity: 1, fontWeight: 500 }}>Habitación {room.number}</span>
      </div>

      <div style={{ padding: '24px 40px 60px', display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 36, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              height: 360, borderRadius: 'var(--radius-lg)',
              background: 'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 12px, var(--color-neutral-800) 12px, var(--color-neutral-800) 24px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '500 12px Inter', letterSpacing: '.06em', color: 'var(--color-neutral-500)', textTransform: 'uppercase',
            }}>
              foto principal — {room.title.toLowerCase()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ height: 78, borderRadius: 'var(--radius-sm)', background: 'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 8px, var(--color-neutral-800) 8px, var(--color-neutral-800) 16px)' }} />
              ))}
              <button className="btn btn-secondary" style={{ height: 78, borderRadius: 'var(--radius-sm)' }}>+5 fotos</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ margin: 0 }}>{room.title}</h1>
              <span className="tag tag-accent">{room.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14, opacity: 0.75 }}>
              <div>Capacidad: {room.capacity} personas</div>
              <div>N.º de habitación: {room.number}</div>
            </div>
            <p style={{ opacity: 0.8, maxWidth: 620, margin: 0 }}>{room.description}</p>
            <div className="hr" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h4 style={{ margin: 0 }}>Disponibilidad</h4>
              <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>Selecciona fechas para confirmar disponibilidad — los días ocupados aparecen bloqueados en el calendario de reserva.</p>
            </div>
          </div>
        </div>

        <div className="card elev-md" style={{ position: 'sticky', top: 24, gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ font: '500 26px Inter' }}>${room.price}</div>
            <div style={{ fontSize: 14, opacity: 0.6 }}>/ noche</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="field"><label>Llegada</label><input className="input" type="date" /></div>
              <div className="field"><label>Salida</label><input className="input" type="date" /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, opacity: 0.75 }}>
              <div>{nights} noches × ${room.price}</div>
              <div>${total}</div>
            </div>
            <div className="hr" style={{ margin: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: '500 15px Inter' }}>
              <div>Total</div>
              <div>${total}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-block" style={{ justifyContent: 'center' }} onClick={handleReserve}>Reservar ahora</button>
          {!user && <div style={{ fontSize: 12, opacity: 0.5, textAlign: 'center' }}>Necesitas iniciar sesión para completar la reserva.</div>}
        </div>
      </div>
    </div>
  );
}
