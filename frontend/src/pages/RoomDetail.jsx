import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClientNav from '../components/ClientNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { fetchRoomById, getRoomImages } from '../api/rooms.js'

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

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await createBooking({ roomId: room.id, nights, total });
    navigate('/mis-reservas');
  };

  const getImageUrl = (img) =>
    `${BACKEND_URL_BASE}/${img.ruta}/${img.nombre}`;

  if (loading) {
    return (
      <>
        <ClientNav />
        <div
          style={{
            padding: '56px 40px',
            textAlign: 'center'
          }}
        >
          Cargando habitación...
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <ClientNav />
        <div
          style={{
            padding: '56px 40px',
            textAlign: 'center'
          }}
        >
          No fue posible cargar la habitación.
        </div>
      </>
    );
  }

  return (
    <>
      <ClientNav />

      <main
        style={{
          maxWidth: 1250,
          margin: '0 auto',
          padding: '48px 40px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: 'var(--color-text)',
            opacity: .75,
            width: 'fit-content'
          }}
        >
          ← Volver al catálogo
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 32,
            alignItems: 'stretch',
            
          }}
        >

          {/* Imágenes */}

          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              gap: 20
            }}
          >

            {/* Miniaturas */}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 10,
                width: 90,
                maxHeight: 500,
                overflowY: 'auto',
                flexShrink: 0
              }}
            >
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: 'transparent',
                    border:
                      selectedImage === index
                        ? '2px solid var(--color-accent)'
                        : '1px solid var(--color-divider)',
                    borderRadius: 8
                  }}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    style={{
                      width: '100%',
                      height: 70,
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Imagen principal */}

            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 500
              }}
            >
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt=""
                  style={{
                    width: '100%',
                    maxHeight: 500,
                    objectFit: 'contain',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background:
                      'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 10px, var(--color-neutral-800) 10px, var(--color-neutral-800) 20px)',
                    color: 'var(--color-neutral-500)'
                  }}
                >
                  Sin imágenes disponibles
                </div>
              )}
            </div>

          </div>

          {/* Información */}

          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22
            }}
          >
            <div>
              <span
                className={
                  room.tipoHabitacion === 'Familiar'
                    ? 'tag tag-accent'
                    : 'tag tag-neutral'
                }
              >
                {room.tipoHabitacion}
              </span>

              <h1
                style={{
                  margin: '14px 0 6px'
                }}
              >
                Habitación {room.numero}
              </h1>

              <div
                style={{
                  fontSize: 15,
                  opacity: .75
                }}
              >
                Ideal para una estancia cómoda y agradable.
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-divider)',
                borderBottom: '1px solid var(--color-divider)',
                padding: '18px 0'
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 600
                }}
              >
                ${room.precioNoche.toLocaleString()}
              </div>

              <div
                style={{
                  opacity: .65
                }}
              >
                por noche
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                gap: 18
              }}
            >
              <div>
                <div
                  style={{
                    opacity: .65,
                    fontSize: 13
                  }}
                >
                  Capacidad
                </div>

                <strong>{room.capacidad} personas</strong>
              </div>

              <div>
                <div
                  style={{
                    opacity: .65,
                    fontSize: 13
                  }}
                >
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
              className="btn btn-primary"
              style={{
                marginTop: 'auto',
                width: '100%'
              }}
              onClick={handleReserve}
            >
              Reservar habitación
            </button>
          </div>
        </div>

        {/* Descripción */}

        <div
          className="card elev-sm"
          style={{
            border: '1px solid var(--color-divider)'
          }}
        >
          <h3
            style={{
              marginTop: 0
            }}
          >
            Descripción
          </h3>

          <p
            style={{
              margin: 0,
              lineHeight: 1.8,
              opacity: .82
            }}
          >
            {room.descripcion}
          </p>
        </div>

        {/* Características */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: 18
          }}
        >
          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)'
            }}
          >
            <div style={{ opacity: .65, fontSize: 13 }}>
              Número
            </div>

            <h3 style={{ marginBottom: 0 }}>
              {room.numero}
            </h3>
          </div>

          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)'
            }}
          >
            <div style={{ opacity: .65, fontSize: 13 }}>
              Tipo
            </div>

            <h3 style={{ marginBottom: 0 }}>
              {room.tipoHabitacion}
            </h3>
          </div>

          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)'
            }}
          >
            <div style={{ opacity: .65, fontSize: 13 }}>
              Capacidad
            </div>

            <h3 style={{ marginBottom: 0 }}>
              {room.capacidad} personas
            </h3>
          </div>

          <div
            className="card elev-sm"
            style={{
              border: '1px solid var(--color-divider)'
            }}
          >
            <div style={{ opacity: .65, fontSize: 13 }}>
              Precio
            </div>

            <h3 style={{ marginBottom: 0 }}>
              ${room.precioNoche.toLocaleString()}
            </h3>
          </div>
        </div>
      </main>
    </>
  );
}