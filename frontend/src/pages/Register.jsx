import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Swal from 'sweetalert2'
import { useTheme } from '../context/ThemeContext.jsx';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioGuardado = await register(form);

      await Swal.fire({
        theme: theme,
        position: "center",
        icon: "success",
        title: "Bienvenido",
        showConfirmButton: false,
        timer: 1500
      });

      navigate('/login');
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.visual}>
        <Link to="/" className={`nav-brand ${styles.brand}`}>Verdant Hotel</Link>
        <div className={styles.quoteBlock}>
          <div className={styles.caption}>foto ambiente — habitación / terraza</div>
          <h2 className={styles.quote}>"Únete y reserva tu próxima estadía en segundos."</h2>
        </div>
      </div>

      <div className={styles.formWrap}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Crear cuenta</h2>
            <p className={styles.formSubtitle}>Regístrate para reservar y gestionar tu historial.</p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>!</span>{error}
            </div>
          )}

          <div className={styles.fields}>
            <div className={styles.row2}>
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

          <label className={`radio ${styles.terms}`}>
            <input type="checkbox" required /><span className={`dot ${styles.checkbox}`} />
            Acepto los <a href="#" onClick={(e) => e.preventDefault()}>términos y condiciones</a>
          </label>

          <button type="submit" className={`btn btn-primary btn-block ${styles.submit}`}>Crear cuenta</button>
          <div className={styles.switch}>
            ¿Ya tienes cuenta? <Link to="/login" className={styles.switchLink}>Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
