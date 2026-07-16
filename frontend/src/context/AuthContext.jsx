import React, { createContext, useContext, useState } from 'react';
import { login as loginApi, register as registerApi} from '../api/auth.js';
import { useNavigate } from 'react-router-dom';

// Mock auth. Replace login/register with real API calls (see src/api/auth.js).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  const login = async (email, password) => {
    if (!email || !password) throw new Error('Ingresa correo y contraseña.');
    const datosToken = await loginApi(email,password);
    setUser(datosToken.fullName);
    return datosToken.token;
    
  };

  const register = async (data) => {
    const usuarioGuardado = await registerApi(data);
    return usuarioGuardado;
  };

  const logout = () => {

    localStorage.removeItem('token');
    setUser(null)
    navigate('/');

  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
