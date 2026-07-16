import React, { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav.jsx';
import { fetchAllBookings } from '../../api/bookings.js';

const statusTag = {
  Confirmada: 'tag tag-accent',
  Completada: 'tag tag-neutral',
  Cancelada: 'tag tag-outline',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { fetchAllBookings().then(setBookings); }, []);

  return (
    <div>
      <AdminNav />
      <div style={{ padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <h1 style={{ margin: 0 }}>Reservas</h1>
        <table className="table">
          <thead>
            <tr><th>Cliente</th><th>Habitación</th><th>Fechas</th><th>Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.client}</td><td>{b.room}</td><td>{b.dates}</td><td>${b.total}</td>
                <td><span className={statusTag[b.status]}>{b.status}</span></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-ghost">Ver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
