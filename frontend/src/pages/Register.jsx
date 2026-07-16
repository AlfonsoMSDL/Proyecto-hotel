import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioGuardado = await register(form);
      console.log(usuarioGuardado);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-visual" style={{
        background: 'repeating-linear-gradient(45deg, var(--color-neutral-900), var(--color-neutral-900) 14px, var(--color-surface) 14px, var(--color-surface) 28px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 44, borderRight: '1px solid var(--color-divider)',
      }}>
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>Verdant Hotel</Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ font: '500 12px Inter', letterSpacing: '.06em', color: 'var(--color-accent-300)', textTransform: 'uppercase' }}>foto ambiente — habitación / terraza</div>
          <h2 style={{ maxWidth: 380, margin: 0 }}>"Únete y reserva tu próxima estadía en segundos."</h2>
        </div>
      </div>

      <div className="auth-form-wrap" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%', maxWidth: 380 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ margin: 0 }}>Crear cuenta</h2>
            <p style={{ opacity: 0.7, margin: 0 }}>Regístrate para reservar y gestionar tu historial.</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-3)', background: 'var(--color-accent-900)', border: '1px solid var(--color-accent-700)', borderRadius: 'var(--radius-md)', color: 'var(--color-accent-200)', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>!</span>{error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="auth-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="field"><label>Nombre</label><input className="input" type="text" placeholder="Ana" value={form.name} onChange={update('name')} required /></div>
              <div className="field"><label>Apellido</label><input className="input" type="text" placeholder="Torres" value={form.lastName} onChange={update('lastName')} required /></div>
            </div>
            <div className="field"><label>Correo electrónico</label><input className="input" type="email" placeholder="tu@correo.com" value={form.email} onChange={update('email')} required /></div>
            <div className="field"><label>Celular</label><input className="input" type="tel" placeholder="+56 9 1234 5678" value={form.phone} onChange={update('phone')} required /></div>
            <div className="field">
              <label>Contraseña</label>
              <div className="input-wrap">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
                      <path d="M6.6 6.6C4.2 8.2 2.5 10.4 1.5 12c1.6 2.6 5 7 10.5 7 1.8 0 3.4-.4 4.8-1.1M9.9 4.24A10.6 10.6 0 0 1 12 4c5.5 0 8.9 4.4 10.5 7-.6 1-1.4 2.1-2.3 3.1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 12c1.6-2.6 5-7 10.5-7s8.9 4.4 10.5 7c-1.6 2.6-5 7-10.5 7s-8.9-4.4-10.5-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <label className="radio" style={{ fontSize: 13, opacity: 0.8 }}>
            <input type="checkbox" required /><span className="dot" style={{ borderRadius: 'var(--radius-sm)' }} />
            Acepto los <a href="#" onClick={(e) => e.preventDefault()}>términos y condiciones</a>
          </label>

          <button type="submit" className="btn btn-primary btn-block" style={{ justifyContent: 'center' }}>Crear cuenta</button>
          <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.7 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 500 }}>Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
