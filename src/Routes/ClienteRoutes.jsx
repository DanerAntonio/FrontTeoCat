import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "../Components/ClienteComponents/Navbar"
import Footer from "../Components/ClienteComponents/FooterC"
import HomePage from "../Pages/ClientePages/home-page"
import CatalogoPage from "../Pages/ClientePages/CatalogoPage"
import ProductoDetallePage from "../Pages/ClientePages/ProductoDetallePage"
import ServicioDetallePage from "../Pages/ClientePages/ServicioDetallePage"
import ServiciosPage from "../Pages/ClientePages/ServiciosPage"
import AgendarCitaPage from "../Pages/ClientePages/agendar-cita-page"
import SobreNosotrosPage from "../Pages/ClientePages/sobre-nosotros-page"
import CarritoPage from "../Pages/ClientePages/carrito-page"
import PerfilPage from "../Pages/ClientePages/perfil-page"
import TerminosCondicionesPage from "../Pages/ClientePages/terminos-condiciones-page"
import PoliticaPrivacidadPage from "../Pages/ClientePages/politica-privacidad-page"
import AuthPage from "../Pages/AuthPage"
import RecoverPassword from "../Pages/RecoverPassword"
import NuevaContra from "../Pages/NuevaContra"
import NotFound from "../Pages/NotFound"

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  // Aquí iría la lógica para verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem("token") !== null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Layout para las páginas de cliente
const ClienteLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  )
}

const ClienteRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      <Route path="/nueva-contrasena" element={<NuevaContra />} />
      {/* Nueva ruta para capturar el token de restablecimiento de contraseña */}
      <Route path="/reset-password/:token" element={<NuevaContra />} />

      {/* Rutas públicas */}
      <Route
        path="/"
        element={
          <ClienteLayout>
            <HomePage />
          </ClienteLayout>
        }
      />

      <Route
        path="/catalogo"
        element={
          <ClienteLayout>
            <CatalogoPage />
          </ClienteLayout>
        }
      />

      <Route
        path="/producto/:id"
        element={
          <ClienteLayout>
            <ProductoDetallePage />
          </ClienteLayout>
        }
      />

      <Route
        path="/servicios"
        element={
          <ClienteLayout>
            <ServiciosPage />
          </ClienteLayout>
        }
      />

      <Route
        path="/servicio/:id"
        element={
          <ClienteLayout>
            <ServicioDetallePage />
          </ClienteLayout>
        }
      />

      <Route
        path="/agendar-cita"
        element={
          <ClienteLayout>
            <AgendarCitaPage />
          </ClienteLayout>
        }
      />

      <Route
        path="/sobre-nosotros"
        element={
          <ClienteLayout>
            <SobreNosotrosPage />
          </ClienteLayout>
        }
      />

      <Route
        path="/carrito"
        element={
          <ClienteLayout>
            <CarritoPage />
          </ClienteLayout>
        }
      />

      {/* Nuevas rutas para términos y privacidad */}
      <Route
        path="/terminos"
        element={
          <ClienteLayout>
            <TerminosCondicionesPage />
          </ClienteLayout>
        }
      />

      <Route
        path="/privacidad"
        element={
          <ClienteLayout>
            <PoliticaPrivacidadPage />
          </ClienteLayout>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ClienteLayout>
              <PerfilPage />
            </ClienteLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default ClienteRoutes

