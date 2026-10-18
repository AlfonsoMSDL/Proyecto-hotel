import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './AdminNav.module.css';

export default function AdminNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={`nav ${styles.bar}`}>
      <div className={`nav-brand ${styles.brand}`}>
        <span className={styles.brandMark} aria-hidden="true">V</span>
        Verdant Hotel <span className={styles.badge}>· Admin</span>
      </div>
      <div className="nav-links">
        <Link to="/admin/habitaciones" aria-current={pathname.startsWith('/admin/habitaciones') ? 'page' : undefined}>Habitaciones</Link>
        <Link to="/admin/usuarios" aria-current={pathname.startsWith('/admin/usuarios') ? 'page' : undefined}>Usuarios</Link>
        <Link to="/admin/reservas" aria-current={pathname === '/admin/reservas' ? 'page' : undefined}>Reservas</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <>
            <span className={styles.greeting}>Hola, {user}</span>
            <button className="btn btn-secondary" onClick={logout}>Salir</button>
          </>
        ) : (
          <div className={styles.avatar}>M</div>
        )}
      </div>
    </div>
  );
}
