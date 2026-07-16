import React, { useEffect, useState } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import { fetchMyBookings } from '../api/bookings.js';
const statusTag = {
  Confirmada: 'tag tag-accent',
  Completada: 'tag tag-neutral',
  Cancelada: 'tag tag-outline',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchMyBookings().then(setBookings);
  }, []);

  return (
    <div>
      <ClientNav />
      <div style={{ padding: '44px 40px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0 }}>Mis reservas</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Consulta y gestiona tus estadías en Verdant.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              className="card elev-sm"
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-4)', border: '1px solid var(--color-divider)',
                opacity: b.status === 'Cancelada' ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, flex: 'none', borderRadius: 'var(--radius-md)', background: 'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 8px, var(--color-neutral-800) 8px, var(--color-neutral-800) 16px)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                  <div className="card-title" style={{ whiteSpace: 'nowrap' }}>{b.roomTitle}</div>
                  <div className="card-meta">{b.dates} · {b.nights} noches · ${b.total}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 'none' }}>
                <span className={statusTag[b.status]}>{b.status}</span>
                <button className="btn btn-secondary">Ver detalle</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
