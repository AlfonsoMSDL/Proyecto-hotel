import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './ClientNav.module.css';

export default function ClientNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={`nav ${styles.bar}`}>
      <Link to="/" className={`nav-brand ${styles.brand}`}>
        <span className={styles.brandMark} aria-hidden="true">V</span>
        Verdant Hotel
      </Link>
      <div className="nav-links">
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>Catálogo</Link>
        <Link to="/mis-reservas" aria-current={pathname === '/mis-reservas' ? 'page' : undefined}>Mis reservas</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <>
            <span className={styles.greeting}>Hola, {user}</span>
            <button className="btn btn-secondary" onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link className="btn btn-secondary" to="/login">Iniciar sesión</Link>
            <Link className="btn btn-primary" to="/registro">Registrarse</Link>
          </>
        )}
      </div>
    </div>
  );
}
