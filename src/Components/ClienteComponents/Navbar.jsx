// Navbar.jsx
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Navbar as BSNavbar, Container, Nav, Button, Badge, Dropdown } from "react-bootstrap"
import "./Navbar.scss"

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(2) // Ejemplo de notificaciones
  const [userData, setUserData] = useState({ nombre: "", apellido: "", correo: "" })
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    // Obtener datos del usuario si está autenticado
    if (token) {
      // En producción, aquí harías una petición a tu API
      // Simulación de datos de usuario
      const userDataStr = localStorage.getItem("userData")
      if (userDataStr) {
        try {
          const parsedUserData = JSON.parse(userDataStr)
          setUserData(parsedUserData)
        } catch (error) {
          console.error("Error parsing user data:", error)
          // Datos de usuario de ejemplo en caso de error
          setUserData({
            nombre: "Usuario",
            apellido: "Ejemplo",
            correo: "usuario@ejemplo.com",
          })
        }
      } else {
        // Datos de usuario de ejemplo si no hay datos en localStorage
        setUserData({
          nombre: "Usuario",
          apellido: "Ejemplo",
          correo: "usuario@ejemplo.com",
        })
      }
    }

    // Obtener cantidad de productos en el carrito desde localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartCount(cart.length)

    // Efecto de scroll para el navbar
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Actualizar el contador del carrito cuando cambia
  useEffect(() => {
    const handleStorageChange = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.length)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Manejar clic en notificaciones
  const handleNotificationClick = (type, id) => {
    if (type === "order") {
      navigate("/perfil?tab=orders")
    } else if (type === "appointment") {
      navigate("/perfil?tab=appointments")
    } else {
      navigate("/perfil")
    }
  }

  return (
    <BSNavbar expand="lg" fixed="top" className={`custom-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Container>
        {/* Corregido: Usar Link directamente dentro de BSNavbar.Brand */}
        <BSNavbar.Brand className="navbar-logo">
          <Link to="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo2.jpg-KEo5YRO1SwydScSYxiiPG92bVBqOnm.jpeg"
              alt="Teo/Cat Logo"
              className="logo-image"
            />
          </Link>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Corregido: Usar Nav.Item con Link dentro */}
            <Nav.Item>
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                Inicio
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/catalogo" className={`nav-link ${location.pathname === "/catalogo" ? "active" : ""}`}>
                Catálogo
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/servicios" className={`nav-link ${location.pathname === "/servicios" ? "active" : ""}`}>
                Servicios
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                to="/sobre-nosotros"
                className={`nav-link sobre-nosotros-link ${location.pathname === "/sobre-nosotros" ? "active" : ""}`}
              >
                Sobre Nosotros
              </Link>
            </Nav.Item>
          </Nav>

          <div className="d-flex align-items-center">
            {/* Icono de notificaciones */}
            <div className="notification-icon-container">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" id="dropdown-notifications" className="notification-toggle">
                  <i className="bi bi-bell fs-4"></i>
                  {notificationCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                      {notificationCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown-menu">
                  <div className="notification-header px-3 py-2 border-bottom">
                    <h6 className="mb-0">Notificaciones</h6>
                  </div>
                  {/* Corregido: Usar div en lugar de Dropdown.Item para eventos de clic */}
                  <div 
                    className="notification-item dropdown-item"
                    onClick={() => handleNotificationClick("order", "ORD-2023-001")}
                  >
                    <div className="notification-icon bg-success-light">
                      <i className="bi bi-box-seam text-success"></i>
                    </div>
                    <div className="notification-content">
                      <p className="mb-0">Tu pedido #ORD-2023-001 ha sido enviado</p>
                      <small className="text-muted">Hace 2 horas</small>
                    </div>
                  </div>
                  <div 
                    className="notification-item dropdown-item"
                    onClick={() => handleNotificationClick("appointment")}
                  >
                    <div className="notification-icon bg-primary-light">
                      <i className="bi bi-calendar-check text-primary"></i>
                    </div>
                    <div className="notification-content">
                      <p className="mb-0">Recordatorio: Tienes una cita mañana</p>
                      <small className="text-muted">Hace 1 día</small>
                    </div>
                  </div>
                  <Dropdown.Divider />
                  {/* Corregido: Usar Link directamente */}
                  <div className="text-center dropdown-item">
                    <Link to="/perfil" className="text-decoration-none">
                      <small>Ver todas las notificaciones</small>
                    </Link>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Icono del carrito - Corregido: Ya usa Link correctamente */}
            <div className="cart-icon-container">
              <Link to="/carrito" className="cart-icon">
                <i className="bi bi-cart3 fs-4"></i>
                {cartCount > 0 && (
                  <Badge pill bg="success" className="position-absolute top-0 start-100 translate-middle">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>

            <div className="auth-button-container">
              {isLoggedIn ? (
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-user" className="user-dropdown">
                    <i className="bi bi-person-circle me-1"></i>
                    <span className="user-name d-none d-md-inline">{userData.nombre}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="user-dropdown-menu">
                    <div className="user-info px-3 py-2 text-center border-bottom">
                      <div className="user-avatar mb-2">
                        <i className="bi bi-person-circle fs-1"></i>
                      </div>
                      <h6 className="mb-0">
                        {userData.nombre} {userData.apellido}
                      </h6>
                      <small className="text-muted">{userData.correo}</small>
                    </div>
                    {/* Corregido: Usar div con Link dentro */}
                    <div className="dropdown-item p-0">
                      <Link to="/perfil" className="dropdown-item">
                        <i className="bi bi-person me-2"></i> Mi Perfil
                      </Link>
                    </div>
                    <div className="dropdown-item p-0">
                      <Link to="/perfil?tab=orders" className="dropdown-item">
                        <i className="bi bi-box-seam me-2"></i> Mis Pedidos
                      </Link>
                    </div>
                    <div className="dropdown-item p-0">
                      <Link to="/agendar-cita" className="dropdown-item">
                        <i className="bi bi-calendar-check me-2"></i> Agendar Cita
                      </Link>
                    </div>
                    <Dropdown.Divider />
                    <div className="dropdown-item p-0">
                    <Link
                      to="/"
                      className="dropdown-item text-danger"
                      onClick={(e) => {
                        e.preventDefault(); // Prevenir la navegación por defecto
                        
                        // Eliminar datos del localStorage
                        localStorage.removeItem("token");
                        localStorage.removeItem("userRole");
                        localStorage.removeItem("userData");
                        
                        // Disparar evento personalizado para notificar a RolRoutes
                        window.dispatchEvent(new Event("logout"));
                        
                        // También podemos forzar una actualización del estado local
                        setIsLoggedIn(false);
                        
                        // Opcional: redirigir manualmente (aunque RolRoutes debería manejarlo)
                        navigate("/");
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                    </Link>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                // Corregido: Usar Link directamente con clases de Bootstrap
                <Link to="/login" className="btn btn-success login-btn">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar