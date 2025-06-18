"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import PropTypes from "prop-types"
import { Home, Settings, Package, ShoppingCart, DollarSign, Scissors, PawPrint, ChevronRight, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../../assets/Logo2.jpg"
import "./Sidebar.scss"

// Import authService at the top of the file
import authService from "../../Services/ConsumoAdmin/authService"

// Replace the existing menuItems constant with this function that checks permissions
const getMenuItems = () => {
  return [
    {
      title: "Dashboard",
      icon: Home,
      path: "/",
      // Dashboard is visible to everyone
      visible: true,
    },
    {
      title: "Notificaciones",
      icon: Bell,
      path: "/inventario/notificaciones",
      visible: authService.hasPermiso("Visualizar Notificaciones Stock"),
    },
    {
      title: "Configuración",
      icon: Settings,
      visible: authService.hasPermiso("Visualizar Roles") || authService.hasPermiso("Visualizar Usuarios"),
      submenu: [
        {
          title: "Roles",
          path: "/configuracion/roles",
          visible: authService.hasPermiso("Visualizar Roles"),
        },
        {
          title: "Usuarios",
          path: "/configuracion/usuarios",
          visible: authService.hasPermiso("Visualizar Usuarios"),
        },
      ],
    },
    {
      title: "Stock",
      icon: Package,
      visible: authService.hasPermiso("Visualizar Categorias") || authService.hasPermiso("Visualizar Productos"),
      submenu: [
        {
          title: "Categorías",
          path: "/inventario/categorias",
          visible: authService.hasPermiso("Visualizar Categorias"),
        },
        {
          title: "Productos",
          path: "/inventario/productos",
          visible: authService.hasPermiso("Visualizar Productos"),
        },
        // Se eliminó "Registrar Nuevo Producto"
        // Se eliminó "Notificaciones" de aquí
      ],
    },
    {
      title: "Compras",
      icon: ShoppingCart,
      visible: authService.hasPermiso("Visualizar Proveedores") || authService.hasPermiso("Visualizar Compras"),
      submenu: [
        {
          title: "Proveedores",
          path: "/compras/proveedores",
          visible: authService.hasPermiso("Visualizar Proveedores"),
        },
        {
          title: "Compras",
          path: "/compras/compras",
          visible: authService.hasPermiso("Visualizar Compras"),
        },
        // Se eliminó "Registrar Compra"
      ],
    },
    {
      title: "Ventas",
      icon: DollarSign,
      visible: authService.hasPermiso("Visualizar Clientes") || authService.hasPermiso("Visualizar Ventas"),
      submenu: [
        {
          title: "Clientes",
          path: "/ventas/clientes",
          visible: authService.hasPermiso("Visualizar Clientes"),
        },
        {
          title: "Ventas",
          path: "/ventas/ventas",
          visible: authService.hasPermiso("Visualizar Ventas"),
        },
        // Se eliminó "Registrar Venta"
      ],
    },
    {
      title: "Servicios",
      icon: Scissors,
      visible:
        authService.hasPermiso("Visualizar Tipos de Servicio") ||
        authService.hasPermiso("Visualizar Servicios") ||
        authService.hasPermiso("Visualizar Citas"),
      submenu: [
        {
          title: "Tipos de Servicios",
          path: "/servicios/tipos-servicios",
          visible: authService.hasPermiso("Visualizar Tipos de Servicio"),
        },
        {
          title: "Servicios",
          path: "/servicios/servicios",
          visible: authService.hasPermiso("Visualizar Servicios"),
        },
        // Se eliminó "Registrar Nuevo Servicio"
        {
          title: "Agendar Citas",
          path: "/servicios/AgendarCitas",
          visible: authService.hasPermiso("Visualizar Citas"),
        },
      ],
    },
    {
      title: "Mascotas",
      icon: PawPrint,
      visible: authService.hasPermiso("Visualizar Mascotas") || authService.hasPermiso("Visualizar Especies"),
      submenu: [
        {
          title: "Mascotas",
          path: "/mascotas/lista",
          visible: authService.hasPermiso("Visualizar Mascotas"),
        },
        {
          title: "Especies",
          path: "/admin/especies",
          visible: authService.hasPermiso("Visualizar Especies"),
        },
      ],
    },
  ]
}

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState(new Set())
  const [logoHovered, setLogoHovered] = useState(false)
  const [menuItems, setMenuItems] = useState([])

  // Initialize menu items and listen for auth changes
  useEffect(() => {
    const updateMenuItems = () => {
      setMenuItems(getMenuItems().filter((item) => item.visible))
    }

    // Initial setup
    updateMenuItems()

    // Listen for auth changes (login/logout)
    window.addEventListener("storage", updateMenuItems)
    window.addEventListener("logout", updateMenuItems)

    return () => {
      window.removeEventListener("storage", updateMenuItems)
      window.removeEventListener("logout", updateMenuItems)
    }
  }, [])

  // Check active routes on mount and set corresponding menus open
  useEffect(() => {
    const activeMenus = new Set()
    menuItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subItem) => location.pathname === subItem.path)) {
        activeMenus.add(item.title)
      }
    })
    setOpenMenus(activeMenus)
  }, [location.pathname, menuItems])

  const toggleMenu = (title) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const isActive = (path) => location.pathname === path
  const isMenuActive = (submenu) => submenu?.some((item) => location.pathname === item.path)

  return (
    <>
      <motion.aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        animate={{
          width: isOpen ? "280px" : "0px",
          opacity: isOpen ? 1 : 0,
          x: isOpen ? 0 : -20,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Sidebar Header con Logo Mejorado */}
        <div className="sidebar-header">
          <Link
            to="/"
            className="logo"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <motion.div
              className="logo-container"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.img
                src={logo || "/placeholder.svg"}
                alt="Teo/Cat Logo"
                className="logo-img"
                initial={{ scale: 0.9 }}
                animate={{
                  scale: logoHovered ? 1.05 : 1,
                  rotate: logoHovered ? 5 : 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.div
                className="logo-shine"
                initial={{ opacity: 0, x: -100 }}
                animate={{
                  opacity: logoHovered ? [0, 0.7, 0] : 0,
                  x: logoHovered ? [-100, 100, 300] : -100,
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: logoHovered ? Number.POSITIVE_INFINITY : 0,
                  repeatDelay: 2,
                }}
              />
            </motion.div>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              className={`nav-item ${item.submenu && isMenuActive(item.submenu) ? "active-parent" : ""}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {item.submenu ? (
                <>
                  <button
                    className={`nav-link ${isMenuActive(item.submenu) ? "active" : ""}`}
                    onClick={() => toggleMenu(item.title)}
                    aria-expanded={openMenus.has(item.title)}
                  >
                    <item.icon className="nav-icon" />
                    <span className="nav-text">{item.title}</span>
                    <motion.div animate={{ rotate: openMenus.has(item.title) ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="nav-arrow" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openMenus.has(item.title) && (
                      <motion.div
                        className="submenu open"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {item.submenu
                          .filter((subItem) => subItem.visible)
                          .map((subItem, subIndex) => (
                            <motion.div
                              key={subIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                            >
                              <Link
                                to={subItem.path}
                                className={`submenu-link ${isActive(subItem.path) ? "active" : ""}`}
                              >
                                <span className="submenu-dot" />
                                <span className="submenu-text">{subItem.title}</span>
                              </Link>
                            </motion.div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
                  <item.icon className="nav-icon" />
                  <span className="nav-text">{item.title}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* Backdrop para móviles */}
      {isOpen && (
        <motion.div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  )
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
}

export default Sidebar
