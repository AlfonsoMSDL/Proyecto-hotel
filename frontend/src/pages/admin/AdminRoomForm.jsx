import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNav from '../../components/AdminNav.jsx';
import {
  createRoom,
  updateRoom,
  fetchRoomById,
  getRoomImages,
  addRoomImage,
  deleteRoomImage,
  BACKEND_URL_BASE
} from '../../api/rooms.js';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function AdminRoomForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [form, setForm] = useState({
    number: '',
    capacity: '',
    type: 'INDIVIDUAL',
    price: '',
    description: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRoomAndImages() {
      setLoading(true);
      try {
        const [room, images] = await Promise.all([
          fetchRoomById(id),
          getRoomImages(id)
        ]);

        if (room) {
          setForm({
            number: room.numero ?? '',
            capacity: room.capacidad ?? '',
            type: room.tipoHabitacion ?? 'INDIVIDUAL',
            price: room.precioNoche ?? '',
            description: room.descripcion ?? ''
          });
        }

        if (Array.isArray(images)) {
          setExistingImages(images);
        }
      } catch (err) {
        console.error('Error al cargar datos de la habitación:', err);
        Swal.fire({
          theme,
          icon: 'error',
          title: 'Error',
          text: err.message || 'No fue posible cargar la información de la habitación.'
        });
      } finally {
        setLoading(false);
      }
    }

    if (isEdit) {
      loadRoomAndImages();
    }
  }, [id, isEdit]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleRemoveExistingImage = (photoId) => {
    setDeletedImageIds((prev) => [...prev, photoId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== photoId));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...selectedFiles]);
    }
    e.target.value = '';
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && imageFiles.length === 0) {
      await Swal.fire({
        theme,
        icon: 'warning',
        title: 'Fotos requeridas',
        text: 'Debes seleccionar al menos una foto para crear la habitación.'
      });
      return;
    }

    setSaving(true);
    try {
      if (!isEdit) {
        await createRoom(form, imageFiles);
        await Swal.fire({
          theme,
          position: 'center',
          icon: 'success',
          title: 'Habitación guardada correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        // 1. Actualizar datos de la habitación
        await updateRoom(id, form);

        // 2. Eliminar fotos marcadas
        if (deletedImageIds.length > 0) {
          await Promise.all(deletedImageIds.map((photoId) => deleteRoomImage(photoId)));
        }

        // 3. Subir fotos nuevas
        if (imageFiles.length > 0) {
          await Promise.all(imageFiles.map((file) => addRoomImage(id, file)));
        }

        await Swal.fire({
          theme,
          position: 'center',
          icon: 'success',
          title: 'Habitación actualizada correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }

      navigate('/admin/habitaciones');
    } catch (err) {
      console.error('Error al procesar la habitación:', err);
      await Swal.fire({
        theme,
        icon: 'error',
        title: 'Error',
        text: err.message || 'No fue posible guardar la habitación.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div style={{ padding: '36px 40px 60px', maxWidth: 640, width: '100%', margin: '0 auto', textAlign: 'center', opacity: 0.7 }}>
          Cargando datos de la habitación...
        </div>
      </div>
    );
  }

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
            <div className="field">
              <label>Número de habitación</label>
              <input
                className="input"
                type="number"
                placeholder="Ej. 305"
                value={form.number}
                onChange={update('number')}
                required
              />
            </div>
            <div className="field">
              <label>Capacidad</label>
              <input
                className="input"
                type="number"
                placeholder="Ej. 2"
                value={form.capacity}
                onChange={update('capacity')}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Tipo de habitación</label>
            <div className="seg">
              {['INDIVIDUAL', 'FAMILIAR'].map((t) => (
                <label className="seg-opt" key={t}>
                  <input
                    type="radio"
                    name="tipo"
                    checked={form.type === t}
                    onChange={() => setForm((f) => ({ ...f, type: t }))}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Precio por noche</label>
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="$0.00"
              value={form.price}
              onChange={update('price')}
              required
            />
          </div>

          <div className="field">
            <label>Descripción</label>
            <textarea
              className="input"
              placeholder="Describe la habitación, vistas, comodidades…"
              value={form.description}
              onChange={update('description')}
              required
            />
          </div>

          <div className="field">
            <label>Fotos</label>

            {/* Fotos existentes en modo edición */}
            {isEdit && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 'var(--space-2)' }}>
                  {existingImages.length > 0
                    ? `Fotos actuales (${existingImages.length}):`
                    : 'No hay fotos actuales registradas.'}
                </div>
                {existingImages.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: 'var(--space-3)',
                    }}
                  >
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--color-divider)',
                          background: 'var(--color-surface)',
                        }}
                      >
                        <img
                          src={`${BACKEND_URL_BASE}/${img.ruta}/${img.nombre}`}
                          alt={`Foto ${img.id}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <button
                          type="button"
                          title="Eliminar foto"
                          onClick={() => handleRemoveExistingImage(img.id)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            lineHeight: 1,
                            padding: 0,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#e53e3e')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)')}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input de archivo */}
            <input
              className="input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required={!isEdit && imageFiles.length === 0}
              style={{ padding: 10, borderRadius: 'var(--radius-sm)' }}
            />

            {/* Nuevas fotos seleccionadas */}
            {imageFiles.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 'var(--space-2)' }}>
                  {isEdit ? 'Nuevas fotos por subir' : 'Fotos seleccionadas'} ({imageFiles.length}):
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: 'var(--space-3)',
                  }}
                >
                  {imageFiles.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        style={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--color-accent)',
                          background: 'var(--color-surface)',
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt={file.name}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <button
                          type="button"
                          title="Quitar de la selección"
                          onClick={() => handleRemoveNewImage(idx)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            lineHeight: 1,
                            padding: 0,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#e53e3e')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)')}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/habitaciones')}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar habitación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
