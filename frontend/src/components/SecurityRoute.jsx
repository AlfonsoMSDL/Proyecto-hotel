import { Navigate, useLocation } from "react-router-dom";
import isAuthenticated from "../utils/isAuthenticated.js";

export default function SecurityRoute({ children }) {
  const location = useLocation();

  // Sin sesión válida (sin token o vencido) se va al login, recordando la ruta
  // pedida para volver a ella después de iniciar sesión.
  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}
