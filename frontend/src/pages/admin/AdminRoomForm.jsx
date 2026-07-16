import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNav from '../../components/AdminNav.jsx';
import { createRoom, fetchRoomById } from '../../api/rooms.js';

export default function AdminRoomForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ number: '', capacity: '', type: 'Individual', price: '', description: '' });

  useEffect(() => {
    if (isEdit) {
      fetchRoomById(id).then((room) => {
        if (room) setForm({ number: room.number, capacity: room.capacity, type: room.type, price: room.price, description: room.description });
      });
    }
  }, [id, isEdit]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRoom(form);
    navigate('/admin/habitaciones');
  };

  return (
    <div>
      <AdminNav />
      <div style={{ padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/habitaciones')}>Habitaciones</span>{' '}
          <span style={{ opacity: 0.5 }}>/</span> <span style={{ opacity: 1, fontWeight: 500 }}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</span>
        </div>
        <h1 style={{ margin: 0 }}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</h1>

        <form className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', border: '1px solid var(--color-divider)' }} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="field"><label>Número de habitación</label><input className="input" type="text" placeholder="Ej. 305" value={form.number} onChange={update('number')} /></div>
            <div className="field"><label>Capacidad</label><input className="input" type="number" placeholder="Ej. 2" value={form.capacity} onChange={update('capacity')} /></div>
          </div>

          <div className="field">
            <label>Tipo de habitación</label>
            <div className="seg">
              {['Individual', 'Familiar', 'Suite'].map((t) => (
                <label className="seg-opt" key={t}>
                  <input type="radio" name="tipo" checked={form.type === t} onChange={() => setForm((f) => ({ ...f, type: t }))} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="field"><label>Precio por noche</label><input className="input" type="text" placeholder="$0.00" value={form.price} onChange={update('price')} /></div>
          <div className="field"><label>Descripción</label><textarea className="input" placeholder="Describe la habitación, vistas, comodidades…" value={form.description} onChange={update('description')} /></div>

          <div className="field">
            <label>Fotos</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{ height: 70, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, opacity: 0.5 }}>subir foto</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/habitaciones')}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar habitación</button>
          </div>
        </form>
      </div>
    </div>
  );
}
