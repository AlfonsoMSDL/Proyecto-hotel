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

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const load = () => fetchRooms().then(setRooms);
  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    await deleteRoom(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div style={{ position: 'relative' }}>
      <AdminNav />
      <div style={{ filter: deleteTarget ? 'blur(1px)' : undefined, opacity: deleteTarget ? 0.6 : 1, padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ margin: 0 }}>Habitaciones</h1>
            <p style={{ opacity: 0.65, margin: 0, fontSize: 14 }}>{rooms.length} habitaciones registradas</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/habitaciones/nueva')}>+ Nueva habitación</button>
        </div>

        <table className="table">
          <thead>
            <tr><th>N.º</th><th>Tipo</th><th>Capacidad</th><th>Precio/noche</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.number}</td>
                <td>{room.type}</td>
                <td>{room.capacity}</td>
                <td>${room.price}</td>
                <td><span className={statusTag[room.status] || 'tag tag-neutral'}>{room.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost" onClick={() => navigate(`/admin/habitaciones/${room.id}`)}>Editar</button>{' '}
                  <button className="btn btn-ghost" style={{ color: '#e07a7a' }} onClick={() => setDeleteTarget(room)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
