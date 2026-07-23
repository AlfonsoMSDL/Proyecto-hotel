import React from 'react';
import { Link } from 'react-router-dom';

export default function RoomCard({ room, highlighted }) {
  return (
    <div
      className={highlighted ? 'card elev-md' : 'card elev-sm'}
      style={{
        padding: 0,
        overflow: 'hidden',
        border: highlighted ? 'none' : '1px solid var(--color-divider)',
        boxShadow: highlighted ? '0 0 0 1px var(--color-accent), 0 6px 18px rgba(0,0,0,0.3)' : undefined,
      }}
    >
      <div
        style={{
          height: 180,
          background:
            'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 10px, var(--color-neutral-800) 10px, var(--color-neutral-800) 20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 11px Inter', letterSpacing: '.06em', color: 'var(--color-neutral-500)', textTransform: 'uppercase',
        }}
      >
        foto habitación {room.tipoHabitacion.toLowerCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title">Habitación {room.numero}</div>
          <span className={room.tipoHabitacion === 'Familiar' ? 'tag tag-accent' : 'tag tag-neutral'}>{room.tipoHabitacion}</span>
        </div>
        <p className="card-body">{room.descripcion || 'Sin descripción'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-divider)' }}>
          <div style={{ font: '500 18px Inter' }}>
            ${room.precioNoche}<span style={{ fontSize: 13, opacity: 0.6 }}> /noche</span>
          </div>
          <Link className={highlighted ? 'btn btn-primary' : 'btn btn-secondary'} to={`/habitacion/${room.id}`}>
            Ver detalle{highlighted ? ' →' : ''}
          </Link>
        </div>
      </div>
    </div>
  );
}
