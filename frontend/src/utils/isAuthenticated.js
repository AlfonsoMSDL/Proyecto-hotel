import { isTokenValid } from './session.js';

// Hay sesión solo si existe un token y todavía no ha expirado.
export default function isAuthenticated(){
    return isTokenValid();
}
