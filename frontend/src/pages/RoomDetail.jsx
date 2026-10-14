import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClientNav from '../components/ClientNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { fetchRoomById, getRoomImages } from '../api/rooms.js'
import styles from './RoomDetail.module.css';

export default function RoomDetail() {
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";

  useEffect(() => {
    async function load() {
      try {

        const data = await fetchRoomById(id);
        setRoom(data);

        const images = await getRoomImages(id);
        setImages(images);

        setSelectedImage(0);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);


  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReserve = () => {
    if (!room) return;
    navigate(`/reservar/${room.id}`);
  };

  const getImageUrl = (img) =>
    `${BACKEND_URL_BASE}/${img.ruta}/${img.nombre}`;

  if (loading) {
    return (
      <>
        <ClientNav />
        <div className={styles.status}>
          Cargando habitación...
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <ClientNav />
        <div className={styles.status}>
          No fue posible cargar la habitación.
        </div>
      </>
    );
  }

  return (
    <>
      <ClientNav />

      <main className={styles.page}>
        <Link to="/" className={styles.backLink}>
          ← Volver al catálogo
        </Link>

        <div className={styles.topGrid}>

          {/* Imágenes */}

          <div className={`card ${styles.gallery}`}>

            {/* Miniaturas */}

            <div className={styles.thumbs}>
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`${styles.thumb} ${selectedImage === index ? styles.thumbActive : ''}`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    className={styles.thumbImage}
                  />
                </button>
              ))}
            </div>

            {/* Imagen principal */}

            <div className={styles.mainImageWrap}>
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt=""
                  className={styles.mainImage}
                />
              ) : (
                <div className={styles.noImage}>
                  Sin imágenes disponibles
                </div>
              )}
            </div>

          </div>

          {/* Información */}

          <div className={`card ${styles.info}`}>
            <div className={styles.infoHeader}>
              <span
                className={
                  room.tipoHabitacion === 'Familiar'
                    ? 'tag tag-accent-2'
                    : 'tag tag-accent'
                }
              >
                {room.tipoHabitacion}
              </span>

              <h1 className={styles.title}>
                Habitación {room.numero}
              </h1>

              <div className={styles.lead}>
                Ideal para una estancia cómoda y agradable.
              </div>
            </div>

            <div className={styles.priceBlock}>
              <div className={styles.price}>
                ${room.precioNoche.toLocaleString()}
              </div>

              <div className={styles.priceUnit}>
                por noche
              </div>
            </div>

            <div className={styles.facts}>
              <div>
                <div className={styles.factLabel}>
                  Capacidad
                </div>

                <strong>{room.capacidad} personas</strong>
              </div>

              <div>
                <div className={styles.factLabel}>
                  Estado
                </div>

                <span
                  className={
                    room.estadoActual === 'Disponible'
                      ? 'tag tag-accent'
                      : 'tag tag-neutral'
                  }
                >
                  {room.estadoActual}
                </span>
              </div>
            </div>

            <button
              className={`btn btn-primary ${styles.reserveButton}`}
              onClick={handleReserve}
            >
              Reservar habitación
            </button>
          </div>
        </div>

        {/* Descripción */}

        <div className={`card ${styles.panel}`}>
          <h3 className={styles.panelTitle}>
            Descripción
          </h3>

          <p className={styles.description}>
            {room.descripcion}
          </p>
        </div>

        {/* Características */}

        <div className={styles.features}>
          <div className={`card ${styles.panel}`}>
            <div className={styles.factLabel}>
              Número
            </div>

            <h3 className={styles.featureValue}>
              {room.numero}
            </h3>
          </div>

          <div className={`card ${styles.panel}`}>
            <div className={styles.factLabel}>
              Tipo
            </div>

            <h3 className={styles.featureValue}>
              {room.tipoHabitacion}
            </h3>
          </div>

          <div className={`card ${styles.panel}`}>
            <div className={styles.factLabel}>
              Capacidad
            </div>

            <h3 className={styles.featureValue}>
              {room.capacidad} personas
            </h3>
          </div>

          <div className={`card ${styles.panel}`}>
            <div className={styles.factLabel}>
              Precio
            </div>

            <h3 className={styles.featureValue}>
              ${room.precioNoche.toLocaleString()}
            </h3>
          </div>
        </div>
      </main>
    </>
  );
}
