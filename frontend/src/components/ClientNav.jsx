import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClientNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="nav" style={{ padding: 'var(--space-4) 40px', borderBottom: '1px solid var(--color-divider)' }}>
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>Verdant Hotel</Link>
      <div className="nav-links">
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>Catálogo</Link>
        <Link to="/mis-reservas" aria-current={pathname === '/mis-reservas' ? 'page' : undefined}>Mis reservas</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <>
            <span style={{ fontSize: 13, opacity: 0.75 }}>Hola, {user}</span>
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
