import React, { useEffect, useState } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { fetchRooms } from '../api/rooms.js';

const PAGE_SIZE = 6; //cantidad de habitaciones por pagina

export default function Catalog() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const data = await fetchRooms(pageNumber, PAGE_SIZE);
      const content = Array.isArray(data) ? data : (data.content ?? []);
      setRooms(content);
      setPage(typeof data.number === 'number' ? data.number : pageNumber);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : content.length);
    } catch (err) {
      console.error('Error cargando habitaciones para catálogo', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

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
          <h3 style={{ margin: 0 }}>{totalElements} habitaciones disponibles</h3>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Ordenar por: <span style={{ color: 'var(--color-accent-300)' }}>Precio ↑</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          {loading ? (
            <div>Cargando...</div>
          ) : rooms.length === 0 ? (
            <div>No hay habitaciones disponibles</div>
          ) : (
            rooms.map((room) => (
              <RoomCard key={room.id} room={room} highlighted={false} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={i === page ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setPage(i)}
              >{i + 1}</button>
            ))}
            <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}
