import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "../Components/AdminComponents/Layout"
import Dashboard from "../Pages/AdminPages/Dashboard/Dashboard"
import UserProfile2 from "../Pages/AdminPages/PerfilDelUsuario/UserProfile2.jsx"
import Roles from "../Pages/AdminPages/Roles/Roles"
import Usuarios from "../Pages/AdminPages/Usuarios/Usuarios"
import Categorias from "../Pages/AdminPages/Categorias/Categorias"
import Productos from "../Pages/AdminPages/Productos/Productos"
import RegistrarProducto from "../Pages/AdminPages/Productos/RegistrarProducto"
import Notificaciones from "../Pages/AdminPages/Notificaciones/Notificaciones"
import Proveedores from "../Pages/AdminPages/Proveedores/Proveedores"
import CatalogoProveedores from "../Pages/AdminPages/Proveedores/catalogo-proveedores.jsx" // Importación del nuevo componente
import Compras from "../Pages/AdminPages/Compras/Compras"
import RegistrarCompra from "../Pages/AdminPages/Compras/RegistrarCompra"
import Clientes from "../Pages/AdminPages//Clientes/Clientes"
import Ventas from "../Pages/AdminPages/Ventas/Ventas"
import RegistrarVenta from "../Pages/AdminPages/Ventas/RegistrarVenta"
import DevolucionVenta from "../Pages/AdminPages/Ventas/DevolucionVenta"
import TiposServicios from "../Pages/AdminPages/TiposDeServicio/TiposServicios"
import Servicios from "../Pages/AdminPages/Servicios/Servicios"
import RegistrarServicio from "../Pages/AdminPages/Servicios/RegistrarServicio"
import AgendarCitas from "../Pages/AdminPages/Citas/AgendarCitas"
import NuevaCita from "../Pages/AdminPages/Citas/NuevaCita"
import Mascotas from "../Pages/AdminPages/Mascotas/Mascotas"
import Especies from "../Pages/AdminPages/Especies/Especies" // Importación del componente Especies
import AuthPage from "../Pages/AuthPage"
import RecoverPassword from "../Pages/RecoverPassword"
import NuevaContra from "../Pages/NuevaContra"
import NotFound from "../Pages/NotFound"
import FooterA from "../Components/AdminComponents/FooterA.jsx"

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  // Aquí iría la lógica para verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem("token") !== null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Componente de Layout personalizado que usa FooterA
const LayoutWithFooterA = () => {
  return <Layout footerComponent={<FooterA />} />
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      <Route path="/nueva-contrasena" element={<NuevaContra />} />
      {/* Nueva ruta para capturar el token de restablecimiento de contraseña */}
      <Route path="/reset-password/:token" element={<NuevaContra />} />

      {/* Rutas protegidas dentro del Layout con FooterA */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LayoutWithFooterA />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Ruta del perfil */}
        <Route path="perfil" element={<UserProfile2 />} />

        {/* Configuración */}
        <Route path="configuracion/roles" element={<Roles />} />
        <Route path="configuracion/usuarios" element={<Usuarios />} />

        {/* Inventario */}
        <Route path="inventario/categorias" element={<Categorias />} />
        <Route path="inventario/productos" element={<Productos />} />
        <Route path="inventario/registrar-producto" element={<RegistrarProducto />} />
        <Route path="inventario/notificaciones" element={<Notificaciones />} />

        {/* Compras */}
        <Route path="compras/proveedores" element={<Proveedores />} />
        <Route path="compras/catalogo-proveedores" element={<CatalogoProveedores />} /> {/* Nueva ruta para el catálogo de proveedores */}
        <Route path="compras/compras" element={<Compras />} />
        <Route path="compras/registrar-compra" element={<RegistrarCompra />} />

        {/* Ventas */}
        <Route path="ventas/clientes" element={<Clientes />} />
        <Route path="ventas/ventas" element={<Ventas />} />
        <Route path="ventas/registrar-venta" element={<RegistrarVenta />} />
        <Route path="ventas/devolucion" element={<DevolucionVenta />} />

        {/* Servicios */}
        <Route path="servicios/tipos-servicios" element={<TiposServicios />} />
        <Route path="servicios/servicios" element={<Servicios />} />
        <Route path="servicios/registrar-servicio" element={<RegistrarServicio />} />
        <Route path="servicios/AgendarCitas" element={<AgendarCitas />} />
        <Route path="servicios/NuevaCita" element={<NuevaCita />} />

        {/* Mascotas */}
        <Route path="mascotas/lista" element={<Mascotas />} />
        {/* <Route path="mascotas/registrar" element={<RegistrarMascota />} /> */}
        
        {/* Especies - Nueva ruta agregada */}
        <Route path="admin/especies" element={<Especies />} />
      </Route>

      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes