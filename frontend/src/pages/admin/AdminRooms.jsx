import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/AdminNav.jsx';
import Modal from '../../components/Modal.jsx';
import { fetchRooms, deleteRoom } from '../../api/rooms.js';

const statusTag = {
  Disponible: 'tag tag-accent',
  Ocupada: 'tag tag-neutral',
  Mantenimiento: 'tag tag-outline',
};

const PAGE_SIZE = 5;

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const load = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const data = await fetchRooms(pageNumber);
      const habitaciones = Array.isArray(data) ? data : (data.content ?? []);
      setRooms(habitaciones);
      setPage(typeof data.number === 'number' ? data.number : pageNumber);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : habitaciones.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const confirmDelete = async () => {
    await deleteRoom(deleteTarget.id);
    setDeleteTarget(null);
    load(page);
  };

  return (
    <div style={{ position: 'relative' }}>
      <AdminNav />
      <div style={{ filter: deleteTarget ? 'blur(1px)' : undefined, opacity: deleteTarget ? 0.6 : 1, padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ margin: 0 }}>Habitaciones</h1>
            <p style={{ opacity: 0.65, margin: 0, fontSize: 14 }}>{totalElements} habitaciones registradas</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/habitaciones/nueva')}>+ Nueva habitación</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>N.º</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Precio/noche</th>
              <th>Estado actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Cargando...</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={6}>No hay habitaciones registradas</td></tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.numero}</td>
                  <td>{room.tipoHabitacion}</td>
                  <td>{room.capacidad}</td>
                  <td>${room.precioNoche}</td>
                  <td><span className={statusTag[room.estadoActual] || 'tag tag-neutral'}>{room.estadoActual}</span></td>
                  <td style={{ textAlign: 'left' }}>
                    <button className="btn btn-ghost" onClick={() => navigate(`/admin/habitaciones/${room.id}`)}>Editar</button>{' '}
                    <button className="btn btn-ghost" style={{ color: '#e07a7a' }} onClick={() => setDeleteTarget(room)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ opacity: 0.75, fontSize: 14 }}>
              Mostrando {rooms.length} de {totalElements} habitaciones · Página {page + 1} de {totalPages}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={index === page ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ minWidth: 40 }}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <Modal
          title="Eliminar habitación"
          onClose={() => setDeleteTarget(null)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ borderColor: '#e07a7a', color: '#e07a7a' }} onClick={confirmDelete}>Eliminar</button>
            </>
          }
        >
          ¿Seguro que deseas eliminar la habitación <b>{deleteTarget.number} · {deleteTarget.type}</b>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  );
}
