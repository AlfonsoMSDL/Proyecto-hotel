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
import styles from './AdminRoomForm.module.css';
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
        <div className={styles.status}>
          Cargando datos de la habitación...
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <button type="button" className={styles.breadcrumbLink} onClick={() => navigate('/admin/habitaciones')}>Habitaciones</button>{' '}
          <span className={styles.breadcrumbSep}>/</span> <span className={styles.breadcrumbCurrent}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</span>
        </div>
        <h1 className={styles.title}>{isEdit ? 'Editar habitación' : 'Nueva habitación'}</h1>

        <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
          <div className={styles.row2}>
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
            <div className={`seg ${styles.segmented}`}>
              {['INDIVIDUAL', 'FAMILIAR'].map((t) => (
                <label className={`seg-opt ${styles.segOption}`} key={t}>
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
              className={`input ${styles.textarea}`}
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
              <div className={styles.photoGroup}>
                <div className={styles.photoCaption}>
                  {existingImages.length > 0
                    ? `Fotos actuales (${existingImages.length}):`
                    : 'No hay fotos actuales registradas.'}
                </div>
                {existingImages.length > 0 && (
                  <div className={styles.photoGrid}>
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className={styles.photo}
                      >
                        <img
                          src={`${BACKEND_URL_BASE}/${img.ruta}/${img.nombre}`}
                          alt={`Foto ${img.id}`}
                          className={styles.photoImage}
                        />
                        <button
                          type="button"
                          title="Eliminar foto"
                          onClick={() => handleRemoveExistingImage(img.id)}
                          className={styles.removeButton}
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
              className={`input ${styles.fileInput}`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required={!isEdit && imageFiles.length === 0}
            />

            {/* Nuevas fotos seleccionadas */}
            {imageFiles.length > 0 && (
              <div className={styles.newPhotos}>
                <div className={styles.photoCaption}>
                  {isEdit ? 'Nuevas fotos por subir' : 'Fotos seleccionadas'} ({imageFiles.length}):
                </div>
                <div className={styles.photoGrid}>
                  {imageFiles.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className={`${styles.photo} ${styles.photoNew}`}
                      >
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className={styles.photoImage}
                        />
                        <button
                          type="button"
                          title="Quitar de la selección"
                          onClick={() => handleRemoveNewImage(idx)}
                          className={styles.removeButton}
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

          <div className={styles.actions}>
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
