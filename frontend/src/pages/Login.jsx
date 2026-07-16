import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(email, password);
      const claims = jwtDecode(token);
      localStorage.setItem('token', token);

      await Swal.fire({
        theme: 'auto',
        position: "center",
        icon: "success",
        title: "Bienvenido",
        showConfirmButton: false,
        timer: 1500
      });

      if (claims.authority.includes('ADMINISTRADOR')) {
        navigate('/admin/habitaciones');
      } else {
        navigate('/mis-reservas');
      }
      
    } catch (err) {
      setError(err.message || 'Las credenciales son incorrectas.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{
        background: 'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 14px, var(--color-surface) 14px, var(--color-surface) 28px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 44, borderRight: '1px solid var(--color-divider)',
      }}>
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>Verdant Hotel</Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ font: '500 12px Inter', letterSpacing: '.06em', color: 'var(--color-accent-300)', textTransform: 'uppercase' }}>foto ambiente — lobby / jardín</div>
          <h2 style={{ maxWidth: 380, margin: 0 }}>"Cada estadía comienza con una bienvenida cálida."</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%', maxWidth: 380 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ margin: 0 }}>Iniciar sesión</h2>
            <p style={{ opacity: 0.7, margin: 0 }}>Accede para reservar y ver tu historial.</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-3)', background: 'var(--color-accent-900)', border: '1px solid var(--color-accent-700)', borderRadius: 'var(--radius-md)', color: 'var(--color-accent-200)', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>!</span>{error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="field">
              <label>Correo electrónico</label>
              <input className="input" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ justifyContent: 'center' }}>Iniciar sesión</button>
          <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.7 }}>
            ¿No tienes cuenta? <Link to="/registro" style={{ fontWeight: 500 }}>Regístrate aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
