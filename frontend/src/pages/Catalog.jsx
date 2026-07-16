import React, { useEffect, useState } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { fetchRooms } from '../api/rooms.js';

export default function Catalog() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  return (
    <div>
      <ClientNav />

      <div style={{ padding: '56px 40px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 620 }}>
          <h6 style={{ color: 'var(--color-accent-300)', margin: 0 }}>Bienvenido a Verdant</h6>
          <h1 style={{ margin: 0 }}>Encuentra tu habitación ideal</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 15 }}>Reserva en minutos, con confirmación inmediata y sin sorpresas.</p>
        </div>

        <form
          className="card elev-sm"
          style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'end', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-divider)' }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label>Llegada</label><input className="input" type="date" /></div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label>Salida</label><input className="input" type="date" /></div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}>
            <label>Tipo de habitación</label>
            <select className="input"><option>Todas</option><option>Individual</option><option>Familiar</option></select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 190 }}>
            <label>Precio por noche</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input className="input" type="text" placeholder="Mín" />
              <span style={{ opacity: 0.5 }}>—</span>
              <input className="input" type="text" placeholder="Máx" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Buscar</button>
        </form>
      </div>

      <div style={{ padding: '40px 40px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{rooms.length} habitaciones disponibles</h3>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Ordenar por: <span style={{ color: 'var(--color-accent-300)' }}>Precio ↑</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} highlighted={room.id === '301'} />
          ))}
        </div>
      </div>
    </div>
  );
}
