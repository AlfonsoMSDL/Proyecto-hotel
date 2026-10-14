import React, { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav.jsx';
import Modal from '../../components/Modal.jsx';
import { fetchUsers, deleteUser } from '../../api/users.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import Swal from 'sweetalert2';
import styles from './AdminUsers.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [reservasTarget, setReservasTarget] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const { theme } = useTheme();

  const load = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const data = await fetchUsers(pageNumber);
      setUsers(Array.isArray(data.content) ? data.content : data);
      setPage(typeof data.number === 'number' ? data.number : pageNumber);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error(err);
      Swal.fire({ theme, icon: 'error', title: 'Error', text: err.message || 'No se pudo cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      theme,
      title: `Eliminar ${user.nombre} ${user.apellido}`,
      text: '¿Deseas eliminar este usuario? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        await Swal.fire({ theme, icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false });
        load(page);
      } catch (err) {
        console.error(err);
        Swal.fire({ theme, icon: 'error', title: 'Error', text: err.message || 'No se pudo eliminar' });
      }
    }
  };

  const fetchUserReservas = async (nombreCompleto) => {
    // El backend ahora expone: /reservas/clientes/{nombreCompleto} (lista todas las reservas del cliente)
    try {
      setLoadingReservas(true);
      const token = localStorage.getItem('token');
      const encodedName = encodeURIComponent(nombreCompleto);
      const res = await fetch(`http://localhost:8181/hotel/api/reservas/clientes/${encodedName}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) {
        // Si el backend responde 404 o 204, consideramos que no hay reservas
        if (res.status === 404 || res.status === 204) {
          setReservas([]);
          return;
        }
        const txt = await res.text();
        throw new Error(txt || 'Error al obtener reservas');
      }
      const data = await res.json();
      // Si la respuesta es un arreglo vacío, no mostrar alertas, solo actualizar estado
      if (Array.isArray(data) && data.length === 0) {
        setReservas([]);
        return;
      }
      setReservas(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ theme, icon: 'error', title: 'Error', text: err.message || 'No se pudo obtener reservas' });
    }
    finally {
      setLoadingReservas(false);
    }
  };

  useEffect(() => {
    if (reservasTarget) {
      fetchUserReservas(`${reservasTarget.nombre} ${reservasTarget.apellido}`);
    } else {
      setReservas([]);
    }
  }, [reservasTarget]);

  return (
    <div className={styles.root}>
      <AdminNav />
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Usuarios</h1>
            <p className={styles.subtitle}>{users.length} usuarios registrados</p>
          </div>
        </div>

        <div className={styles.tableCard}>
          <table className={`table ${styles.table}`}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Rol</th>
                <th className={styles.actionsCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.messageCell}>Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className={styles.messageCell}>No hay usuarios registrados</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.strong}>{u.nombre}</td>
                    <td>{u.apellido}</td>
                    <td className={styles.muted}>{u.celular || '-'}</td>
                    <td>{u.correo}</td>
                    <td><span className={styles.role}>{u.rol}</span></td>
                    <td className={styles.actionsCell}>
                      <button className="btn btn-ghost" onClick={() => { setReservasTarget(u); setReservas([]); }}>Ver reservas</button>{' '}
                      <button className={`btn btn-ghost ${styles.deleteButton}`} onClick={() => handleDelete(u)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Mostrando {users.length} de {totalElements} usuarios · Página {page + 1} de {totalPages}
            </div>
            <div className={styles.pageButtons}>
              <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`${index === page ? 'btn btn-primary' : 'btn btn-secondary'} ${styles.pageButton}`}
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

      {reservasTarget && (
        <Modal
          title={`Reservas de ${reservasTarget.nombre} ${reservasTarget.apellido}`}
          onClose={() => setReservasTarget(null)}
          actions={<><button className="btn btn-secondary" onClick={() => setReservasTarget(null)}>Cerrar</button></>}
        >
          {loadingReservas ? (
            <div className={styles.modalMessage}>Cargando reservas...</div>
          ) : reservas.length === 0 ? (
            <div className={styles.modalMessage}>No hay reservas para este usuario.</div>
          ) : (
            <div className={styles.modalTableWrap}>
              <table className="table">
                <thead><tr><th>Habitación</th><th>Entrada</th><th>Salida</th></tr></thead>
                <tbody>
                  {reservas.map(r => (
                    <tr key={r.id}>
                      
                      <td>{r.numHabitacion}</td>
                      <td>{new Date(r.fechaLlegada).toLocaleString()}</td>
                      <td>{new Date(r.fechaSalida).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
