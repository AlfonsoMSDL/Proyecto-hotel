import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="nav" style={{ padding: 'var(--space-4) 40px', borderBottom: '1px solid var(--color-divider)' }}>
      <div className="nav-brand">Verdant Hotel <span style={{ opacity: 0.5, fontWeight: 400 }}>· Admin</span></div>
      <div className="nav-links">
        <Link to="/admin/habitaciones" aria-current={pathname.startsWith('/admin/habitaciones') ? 'page' : undefined}>Habitaciones</Link>
        <Link to="/admin/usuarios" aria-current={pathname.startsWith('/admin/usuarios') ? 'page' : undefined}>Usuarios</Link>
        <Link to="/admin/reservas" aria-current={pathname === '/admin/reservas' ? 'page' : undefined}>Reservas</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <>
            <span style={{ fontSize: 13, opacity: 0.75 }}>Hola, {user}</span>
            <button className="btn btn-secondary" onClick={logout}>Salir</button>
          </>
        ) : (
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-accent-800)', color: 'var(--color-accent-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px Inter' }}>M</div>
        )}
      </div>
    </div>
  );
}
