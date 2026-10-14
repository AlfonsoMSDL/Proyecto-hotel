import { Navigate, useLocation } from "react-router-dom";
import isAuthenticated from "../utils/isAuthenticated.js";
import { getTokenRoles } from "../utils/session.js";

// Protege rutas por sesión y, opcionalmente, por rol.
// `roles`: lista de roles permitidos (p. ej. ['ADMINISTRADOR']); sin ella basta con estar autenticado.
export default function SecurityRoute({ children, roles }) {
  const location = useLocation();

  // Sin sesión válida (sin token o vencido) se va al login, recordando la ruta
  // pedida para volver a ella después de iniciar sesión.
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Con sesión pero sin el rol requerido se vuelve al catálogo. El backend
  // también lo valida (@PreAuthorize); esto solo evita mostrar un panel que no
  // puede cargar datos.
  if (roles && !getTokenRoles().some((rol) => roles.includes(rol))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
