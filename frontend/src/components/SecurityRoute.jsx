import { Navigate } from "react-router-dom";
import isAuthenticated from "../utils/isAuthenticated.js";

export default function SecurityRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
