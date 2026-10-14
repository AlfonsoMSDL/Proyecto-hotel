import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // Si llegó aquí por sesión expirada o desde una ruta protegida, SecurityRoute/AuthProvider
  // dejan en el state la ruta de origen para volver a ella tras iniciar sesión.
  const sessionExpired = location.state?.expired === true;
  const redirectTo = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(email, password);
      const claims = jwtDecode(token);
      localStorage.setItem('token', token);

      await Swal.fire({
        theme: theme,
        position: "center",
        icon: "success",
        title: "Bienvenido",
        showConfirmButton: false,
        timer: 1500
      });

      if (redirectTo && redirectTo !== '/login') {
        navigate(redirectTo, { replace: true });
      } else if (claims.authority.includes('ADMINISTRADOR')) {
        navigate('/admin/habitaciones');
      } else {
        navigate('/mis-reservas');
      }
      
    } catch (err) {
      setError(err.message || 'Las credenciales son incorrectas.');
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.visual}>
        <Link to="/" className={`nav-brand ${styles.brand}`}>Verdant Hotel</Link>
        <div className={styles.quoteBlock}>
          <div className={styles.caption}>foto ambiente — lobby / jardín</div>
          <h2 className={styles.quote}>"Cada estadía comienza con una bienvenida cálida."</h2>
        </div>
      </div>

      <div className={styles.formWrap}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Iniciar sesión</h2>
            <p className={styles.formSubtitle}>Accede para reservar y ver tu historial.</p>
          </div>

          {sessionExpired && !error && (
            <div className={styles.infoBox} role="status">
              Tu sesión expiró. Inicia sesión de nuevo para continuar.
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>!</span>{error}
            </div>
          )}

          <div className={styles.fields}>
            <div className="field">
              <label>Correo electrónico</label>
              <input className="input" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary btn-block ${styles.submit}`}>Iniciar sesión</button>
          <div className={styles.switch}>
            ¿No tienes cuenta? <Link to="/registro" className={styles.switchLink}>Regístrate aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
