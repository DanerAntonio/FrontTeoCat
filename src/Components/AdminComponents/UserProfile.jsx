"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiUser, FiLogOut, FiChevronDown, FiBell, FiCheck } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import "./UserProfile.scss"
import authService from "../../Services/ConsumoAdmin/authService.js"
import notificacionesService from "../../Services/ConsumoAdmin/NotificacionesService.js"

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [userData, setUserData] = useState({ name: "Usuario", email: "usuario@ejemplo.com", role: "Invitado" })
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const backdropRef = useRef(null)
  const navigate = useNavigate()

  // Imagen por defecto (un simple icono de usuario)
  const defaultImageBase64 =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlOWVjZWYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iIzZjNzU3ZCIvPjxwYXRoIGQ9Ik0yNSw4NWMwLTIwLDExLjUtMjUsMjUtMjVzMjUsNSwyNSwyNXoiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4="

  // Cargar datos del usuario y notificaciones al montar el componente
  useEffect(() => {
    fetchUserData()
    fetchNotificaciones()
    loadProfilePhoto()

    // Escuchar eventos de cambio de foto de perfil
    const handleProfilePhotoChange = (event) => {
      console.log("Evento de cambio de foto recibido en UserProfile:", event)
      const photoUrl = event.detail?.photoUrl
      if (photoUrl) {
        setProfilePhoto(photoUrl)
        setImageError(false)
      }
    }

    // Escuchar múltiples tipos de eventos para mayor compatibilidad
    window.addEventListener("profilePhotoChange", handleProfilePhotoChange)
    document.addEventListener("userAvatarUpdate", handleProfilePhotoChange)

    // Escuchar cambios en localStorage
    window.addEventListener("storage", (e) => {
      if (e.key === "userProfilePhoto" || e.key === "userData") {
        loadProfilePhoto()
      }
    })

    return () => {
      window.removeEventListener("profilePhotoChange", handleProfilePhotoChange)
      document.removeEventListener("userAvatarUpdate", handleProfilePhotoChange)
      window.removeEventListener("storage", loadProfilePhoto)
    }
  }, [])

  // Efecto para escuchar eventos de actualización del contador de notificaciones
  useEffect(() => {
    // Función para actualizar el contador de notificaciones
    const handleNotificationCountUpdate = (event) => {
      if (event.detail && typeof event.detail.pendientes === 'number') {
        // Actualizar el contador directamente con el valor del evento
        const pendientes = event.detail.pendientes
        setUnreadCount(pendientes)
        
        // Si el contador cambió, refrescar las notificaciones
        if (pendientes !== unreadCount) {
          fetchNotificaciones()
        }
      }
    }
    
    // Escuchar el evento personalizado
    window.addEventListener("actualizarContadorNotificaciones", handleNotificationCountUpdate)
    
    // También escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === "contadorNotificacionesPendientes") {
        const newCount = Number.parseInt(e.newValue || "0", 10)
        if (!isNaN(newCount) && newCount !== unreadCount) {
          setUnreadCount(newCount)
          fetchNotificaciones()
        }
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    // Verificar si hay un valor en localStorage al montar
    const contadorGuardado = localStorage.getItem("contadorNotificacionesPendientes")
    if (contadorGuardado) {
      const savedCount = Number.parseInt(contadorGuardado, 10)
      if (!isNaN(savedCount)) {
        setUnreadCount(savedCount)
      }
    }
    
    return () => {
      window.removeEventListener("actualizarContadorNotificaciones", handleNotificationCountUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [unreadCount])

  // Cargar la foto de perfil desde localStorage
  const loadProfilePhoto = () => {
    try {
      // Intentar obtener la foto del localStorage
      const storedPhoto = localStorage.getItem("userProfilePhoto")

      if (storedPhoto) {
        console.log("Foto de perfil cargada desde localStorage:", storedPhoto)
        setProfilePhoto(storedPhoto)
        setImageError(false)
        return
      }

      // Si no hay foto en localStorage, intentar obtenerla de userData
      const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
      if (storedUserData && storedUserData.Foto) {
        console.log("Foto de perfil cargada desde userData:", storedUserData.Foto)
        setProfilePhoto(storedUserData.Foto)
        setImageError(false)

        // Guardar en localStorage para futuras referencias
        localStorage.setItem("userProfilePhoto", storedUserData.Foto)
      }
    } catch (error) {
      console.error("Error al cargar la foto de perfil:", error)
      setImageError(true)
    }
  }

  // Manejar errores de carga de imagen
  const handleImageError = () => {
    console.error("Error al cargar la imagen de perfil en el avatar")
    setImageError(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".dropdown")) {
        setIsOpen(false)
      }
      if (isNotificationsOpen && !event.target.closest(".notification-dropdown")) {
        setIsNotificationsOpen(false)
      }
    }

    // Close dropdown when navigating
    const handleRouteChange = () => {
      setIsOpen(false)
      setIsNotificationsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("popstate", handleRouteChange)

      // Reset body styles if needed
      document.body.style.overflow = ""
    }
  }, [isOpen, isNotificationsOpen])

  // Obtener datos del usuario
  const fetchUserData = () => {
    const storedUserData = authService.getUserData()
    if (storedUserData) {
      setUserData({
        name: `${storedUserData.nombre || ""} ${storedUserData.apellido || ""}`.trim() || "Usuario",
        email: storedUserData.correo || "usuario@ejemplo.com",
        role: storedUserData.rol?.nombre || "Invitado",
        id: storedUserData.id,
      })

      // Si el usuario tiene una foto, actualizarla
      if (storedUserData.Foto) {
        setProfilePhoto(storedUserData.Foto)
        setImageError(false)
        // Guardar en localStorage para persistencia
        localStorage.setItem("userProfilePhoto", storedUserData.Foto)
      }
    }
  }

  // Obtener notificaciones
  const fetchNotificaciones = async () => {
    setLoading(true)
    try {
      const data = await notificacionesService.getNotificaciones()
      setNotificaciones(data || [])
      
      // Actualizar el contador de notificaciones no leídas
      const pendientes = data.filter(n => n.Estado === "Pendiente").length
      setUnreadCount(pendientes)
      
      // Actualizar el contador global
      localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      setNotificaciones([])
    } finally {
      setLoading(false)
    }
  }

  // Marcar notificación como leída
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await notificacionesService.markAsRead(id)
      
      // Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.IdNotificacion === id) {
          return { ...notif, Estado: "Vista", FechaVista: new Date() }
        }
        return notif
      })
      
      setNotificaciones(updatedNotificaciones)
      
      // Actualizar el contador de notificaciones no leídas
      const pendientes = updatedNotificaciones.filter(n => n.Estado === "Pendiente").length
      setUnreadCount(pendientes)
      
      // Actualizar el contador global
      localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
      
      // Disparar evento para actualizar otros componentes
      const evento = new CustomEvent("actualizarContadorNotificaciones", {
        detail: { pendientes }
      })
      window.dispatchEvent(evento)
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificacionesService.markAllAsRead()
      
      // Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.Estado === "Pendiente") {
          return { ...notif, Estado: "Vista", FechaVista: new Date() }
        }
        return notif
      })
      
      setNotificaciones(updatedNotificaciones)
      
      // Actualizar el contador de notificaciones no leídas
      setUnreadCount(0)
      
      // Actualizar el contador global
      localStorage.setItem("contadorNotificacionesPendientes", "0")
      
      // Disparar evento para actualizar otros componentes
      const evento = new CustomEvent("actualizarContadorNotificaciones", {
        detail: { pendientes: 0 }
      })
      window.dispatchEvent(evento)
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  // Navegar a la notificación específica
  const navigateToNotification = (notification) => {
    // Guardar el ID de la notificación en localStorage para que la página de notificaciones pueda acceder a él
    localStorage.setItem("selectedNotificationId", notification.IdNotificacion.toString())

    // Cerrar el menú de notificaciones
    setIsNotificationsOpen(false)

    // Navegar a la página de notificaciones
    navigate("/inventario/notificaciones")
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (isNotificationsOpen) setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    if (isOpen) setIsOpen(false)
  }

  const handleLogout = () => {
    // Primero navegamos a la página principal
    navigate("/")

    // Luego, con un pequeño retraso, eliminamos las credenciales
    setTimeout(() => {
      // Usar el servicio de autenticación para cerrar sesión
      authService.logout()
    }, 100)
  }

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date

    // Convertir a minutos, horas, días
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
    } else {
      return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
    }
  }

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "StockBajo":
      case "Vencimiento":
        return <i className="bi bi-exclamation-triangle text-warning"></i>
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return <i className="bi bi-chat-left-text text-info"></i>
      case "Comprobante":
        return <i className="bi bi-receipt text-primary"></i>
      case "Cita":
        return <i className="bi bi-calendar-check text-success"></i>
      default:
        return <i className="bi bi-bell text-secondary"></i>
    }
  }

  return (
    <div className="user-profile ms-auto">
      {/* Componente de notificaciones */}
      <div className="notification-dropdown" ref={notificationsRef}>
        <div className="notification-bell" onClick={toggleNotifications}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FiBell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </motion.div>
        </div>

        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div
              className="notification-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-header">
                <h6 className="mb-0">Notificaciones</h6>
                {unreadCount > 0 && (
                  <button className="btn btn-link btn-sm p-0" onClick={handleMarkAllAsRead}>
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="notification-body">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mb-0 mt-2">Cargando notificaciones...</p>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="mb-0">No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notificaciones.slice(0, 5).map((notification) => (
                      <div
                        key={notification.IdNotificacion}
                        className={`notification-item ${notification.Estado === "Pendiente" ? "unread" : ""}`}
                        onClick={() => navigateToNotification(notification)}
                        style={{ cursor: "pointer" }}
                        title="Haz clic para ver detalles"
                      >
                        <div className="notification-icon">{getNotificationIcon(notification.TipoNotificacion)}</div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.Titulo}</div>
                          <div className="notification-message">{notification.Mensaje}</div>
                          <div className="notification-time">{formatRelativeTime(notification.FechaCreacion)}</div>
                        </div>
                        {notification.Estado === "Pendiente" && (
                          <button
                            className="btn btn-sm mark-read-btn"
                            onClick={(e) => handleMarkAsRead(notification.IdNotificacion, e)}
                            title="Marcar como leída"
                          >
                            <FiCheck />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <Link to="/inventario/notificaciones" onClick={() => setIsNotificationsOpen(false)}>
                  Ver todas las notificaciones
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="dropdown">
        <motion.button
          className="profile-button"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="avatar">
            {profilePhoto && !imageError ? (
              <img
                src={profilePhoto || "/placeholder.svg"}
                alt="Avatar"
                className="user-avatar-img"
                onError={handleImageError}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <FiUser size={20} />
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{userData.name || "Usuario"}</div>
            <div className="user-role">{userData.role || "Invitado"}</div>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <FiChevronDown className="dropdown-icon" size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="dropdown-backdrop"
                onClick={() => setIsOpen(false)}
                ref={backdropRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="dropdown-menu show"
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  minWidth: "250px", 
                  maxHeight: "none", 
                  height: "auto", 
                  overflow: "visible"
                }}
              >
                <div className="dropdown-header">
                  <div className="header-avatar">
                    {profilePhoto && !imageError ? (
                      <img
                        src={profilePhoto || "/placeholder.svg"}
                        alt="Avatar"
                        className="header-avatar-img"
                        onError={handleImageError}
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      <FiUser size={24} />
                    )}
                  </div>
                  <div>
                    <div className="header-name">{userData.name || "Usuario"}</div>
                    <div className="header-email">{userData.email || "usuario@ejemplo.com"}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-content" style={{ padding: "8px 0", minHeight: "80px" }}>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link 
                      to="/perfil" 
                      className="dropdown-item" 
                      onClick={() => setIsOpen(false)}
                      style={{ display: "flex", alignItems: "center", padding: "10px 15px" }}
                    >
                      <FiUser className="item-icon" size={16} style={{ marginRight: "10px" }} />
                      <span>Mi Perfil</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout-item"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        padding: "10px 15px", 
                        marginTop: "8px",
                        color: "#dc3545",
                        borderTop: "1px solid rgba(0,0,0,0.1)",
                        paddingTop: "12px"
                      }}
                    >
                      <FiLogOut className="item-icon" size={16} style={{ marginRight: "10px" }} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserProfile