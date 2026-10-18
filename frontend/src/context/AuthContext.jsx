import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { login as loginApi, register as registerApi} from '../api/auth.js';
import { useNavigate } from 'react-router-dom';
import {
  getToken,
  clearToken,
  getTokenClaims,
  getTokenRemainingMs,
  isTokenValid,
  onSessionExpired,
} from '../utils/session.js';

const AuthContext = createContext(null);

// setTimeout acepta como máximo ~24,8 días; más allá dispararía de inmediato.
const MAX_TIMEOUT_MS = 2147483647;

// Token guardado al cargar la app, descartándolo si ya venció.
function getInitialToken() {
  const stored = getToken();
  if (stored && !isTokenValid(stored)) {
    clearToken();
    return null;
  }
  return stored;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getInitialToken);
  // El nombre sale del claim `fullName` del token, así sobrevive a recargar la página.
  const [user, setUser] = useState(() => getTokenClaims(token)?.fullName ?? "");
  const navigate = useNavigate();
  const expiringRef = useRef(false);

  const login = async (email, password) => {
    if (!email || !password) throw new Error('Ingresa correo y contraseña.');
    const datosToken = await loginApi(email,password);
    localStorage.setItem('token', datosToken.token);
    expiringRef.current = false;
    setToken(datosToken.token);
    setUser(datosToken.fullName);
    return datosToken.token;

  };

  const register = async (data) => {
    const usuarioGuardado = await registerApi(data);
    return usuarioGuardado;
  };

  const logout = () => {

    localStorage.removeItem('token');
    setToken(null);
    setUser(null)
    navigate('/');

  };

  // Cierra la sesión vencida y lleva al login, recordando la página actual
  // para volver a ella después de iniciar sesión de nuevo.
  const expireSession = useCallback(() => {
    if (expiringRef.current) return; // varias peticiones pueden fallar a la vez
    expiringRef.current = true;

    clearToken();
    setToken(null);
    setUser(null);

    const { pathname, search } = window.location;
    if (pathname === '/login' || pathname === '/registro') return;

    navigate('/login', {
      replace: true,
      state: { expired: true, from: pathname + search },
    });
  }, [navigate]);

  // 1) Detección anticipada: dispara justo cuando vence el token.
  useEffect(() => {
    if (!token) return undefined;
    const remaining = getTokenRemainingMs(token);
    if (remaining <= 0) {
      expireSession();
      return undefined;
    }
    const timer = setTimeout(expireSession, Math.min(remaining, MAX_TIMEOUT_MS));
    return () => clearTimeout(timer);
  }, [token, expireSession]);

  // 2) Red de seguridad: authFetch avisa cuando el backend responde 401.
  useEffect(() => onSessionExpired(expireSession), [expireSession]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
