"use client"

import { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import AppRoutes from "./AppRoutes"
import ClienteRoutes from "./ClienteRoutes"

// Importar estilos
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "react-toastify/dist/ReactToastify.css"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"
import "../Styles/main.scss"
import "../App.css"

const RolRoutes = () => {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // En RolRoutes.jsx, modifica el useEffect:

useEffect(() => {
  // Importar los scripts de Bootstrap para componentes interactivos
  import("bootstrap/dist/js/bootstrap.bundle.min.js");

  // Verificar si hay un token y determinar el rol del usuario
  const checkUserRole = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      setUserRole(role);
    } else {
      setUserRole(null);
    }
    setLoading(false);
  };

  checkUserRole();

  // Escuchar cambios en localStorage para actualizar el estado cuando se cierre sesión
  const handleStorageChange = () => {
    checkUserRole();
  };

  // Crear un evento personalizado para manejar el cierre de sesión desde cualquier componente
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUserRole(null);
    setLoading(false);
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("logout", handleLogout); // Usar la función específica

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("logout", handleLogout);
  };
}, []);

  // Mostrar un indicador de carga mientras se verifica el rol
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {userRole === "admin" ? <AppRoutes /> : <ClienteRoutes />}
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  )
}

export default RolRoutes

