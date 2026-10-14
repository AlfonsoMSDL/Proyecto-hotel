import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRoomFirstImage } from '../api/rooms.js';
import styles from './RoomCard.module.css';

export default function RoomCard({ room, highlighted }) {

  const [foto, setFoto] = useState(null);

  const BACKEND_URL_BASE = "http://localhost:8181/hotel/api";

  useEffect(() => {
    async function loadFoto() {
      try {
        const primeraFoto = await getRoomFirstImage(room.id);
        setFoto(primeraFoto);
      } catch (e) {
        console.error(e);
      }
    }

    loadFoto();
  }, [room.id]);

  const getPrimeraFotoUrl = () => {
    if (!foto) return null;
    return `${BACKEND_URL_BASE}/${foto.ruta}/${foto.nombre}`;
  };


  return (
    <div
      className={`${highlighted ? 'card elev-md' : 'card elev-sm'} ${styles.card} ${highlighted ? styles.highlighted : ''}`}
    >
      <div className={styles.media}>
        {foto ? (
          <img
            src={getPrimeraFotoUrl()}
            alt={`Habitación ${room.numero}`}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            Cargando imagen...
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <div className="card-title">Habitación {room.numero}</div>
          <span className={room.tipoHabitacion === 'Familiar' ? 'tag tag-accent-2' : 'tag tag-accent'}>{room.tipoHabitacion}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            ${room.precioNoche}<span className={styles.perNight}> /noche</span>
          </div>
          <Link className={highlighted ? 'btn btn-primary' : 'btn btn-secondary'} to={`/habitacion/${room.id}`}>
            Ver detalle{highlighted ? ' →' : ''}
          </Link>
        </div>
      </div>
    </div>
  );
}
