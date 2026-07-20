import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNav from '../../components/AdminNav.jsx';
import { createRoom, fetchRoomById } from '../../api/rooms.js';
import Swal from 'sweetalert2'
import { useTheme } from '../../context/ThemeContext.jsx';

export default function AdminRoomForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ number: '', capacity: '', type: 'INDIVIDUAL', price: '', description: '' });
  const {theme} = useTheme();

  useEffect(() => {
    if (isEdit) {
      fetchRoomById(id).then((room) => {
        if (room) setForm({ number: room.number, capacity: room.capacity, type: room.type, price: room.price, description: room.description });
      });
    }
  }, [id, isEdit]);

  const [imageFiles, setImageFiles] = useState([]);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const habitacion =await createRoom(form, imageFiles);
    
    await Swal.fire({
      theme,
      position: "center",
      icon: "success",
      title: "Guardada correctamente",
      showConfirmButton: false,
      timer: 1500
    });

    navigate('/admin/habitaciones');
  };

  return (
    <div>
      <AdminNav />
      <div style={{ padding: '36px 40px 60px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/habitaciones')}>Habitaciones</span>{' '}
          <span style={{ opacity: 0.5 }}>/</span> <span style={{ opacity: 1, fontWeight: 500 }}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</span>
        </div>
        <h1 style={{ margin: 0 }}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</h1>

        <form className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', border: '1px solid var(--color-divider)' }} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="field"><label>Número de habitación</label><input className="input" type="text" placeholder="Ej. 305" value={form.number} onChange={update('number')} required /></div>
            <div className="field"><label>Capacidad</label><input className="input" type="number" placeholder="Ej. 2" value={form.capacity} onChange={update('capacity')} required /></div>
          </div>

          <div className="field">
            <label>Tipo de habitación</label>
            <div className="seg">
              {['INDIVIDUAL', 'FAMILIAR'].map((t) => (
                <label className="seg-opt" key={t}>
                  <input type="radio" name="tipo" checked={form.type === t} onChange={() => setForm((f) => ({ ...f, type: t }))} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="field"><label>Precio por noche</label><input className="input" type="text" placeholder="$0.00" value={form.price} onChange={update('price')} required /></div>
          <div className="field"><label>Descripción</label><textarea className="input" placeholder="Describe la habitación, vistas, comodidades…" value={form.description} onChange={update('description')} required /></div>

          <div className="field">
            <label>Fotos</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
              style={{ padding: 10, borderRadius: 'var(--radius-sm)' }}
            />
            {imageFiles.length > 0 && (
              <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
                {imageFiles.length} archivo{imageFiles.length === 1 ? '' : 's'} seleccionado{imageFiles.length === 1 ? '' : 's'}
              </div>
            )}
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
