"use client"

import { useState, useEffect, useCallback } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../../Components/AdminComponents/Sidebar"
import UserProfile from "../../Components/AdminComponents/UserProfile"
import { motion } from "framer-motion"
import "./Layout.scss"

const Layout = ({ footerComponent }) => {
  // Modificar el estado inicial para que esté abierto por defecto en escritorio
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recuperar el estado guardado en localStorage, si existe
    const savedState = localStorage.getItem("sidebarOpen")
    if (savedState !== null) {
      return savedState === "true"
    }
    // Por defecto, abierto en escritorio y cerrado en móvil
    return window.innerWidth >= 768
  })

  // Añadir un estado para rastrear si el usuario ha cerrado manualmente el sidebar
  const [userClosedSidebar, setUserClosedSidebar] = useState(false)
  
  // Estado para forzar la actualización del componente UserProfile
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0)

  const location = useLocation()

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    // Guardar el estado en localStorage
    localStorage.setItem("sidebarOpen", newState.toString())

    // Si estamos en escritorio y el usuario está cerrando el sidebar, marcarlo como cerrado manualmente
    if (window.innerWidth >= 768 && !newState) {
      setUserClosedSidebar(true)
    } else {
      setUserClosedSidebar(false)
    }
  }

  // Función para manejar el evento de cambio de foto de perfil
  const handleProfilePhotoChange = useCallback(() => {
    console.log("Layout: Evento de cambio de foto de perfil detectado")
    // Incrementar el contador para forzar la actualización del componente UserProfile
    setProfileUpdateTrigger(prev => prev + 1)
  }, [])

  // Escuchar eventos de cambio de foto de perfil
  useEffect(() => {
    // Escuchar el evento personalizado en window
    window.addEventListener("profilePhotoChange", handleProfilePhotoChange)
    
    // Escuchar el evento personalizado en document
    document.addEventListener("userAvatarUpdate", handleProfilePhotoChange)
    
    // Limpiar los event listeners al desmontar
    return () => {
      window.removeEventListener("profilePhotoChange", handleProfilePhotoChange)
      document.removeEventListener("userAvatarUpdate", handleProfilePhotoChange)
    }
  }, [handleProfilePhotoChange])

  // Cerrar sidebar en dispositivos móviles al cambiar de ruta
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
      localStorage.setItem("sidebarOpen", "false")
    }
  }, [location.pathname])

  // Modificar el efecto para respetar la elección del usuario
  useEffect(() => {
    const handleResize = () => {
      // Si pasamos de móvil a escritorio y el usuario no ha cerrado manualmente el sidebar
      if (window.innerWidth >= 768 && !sidebarOpen && !userClosedSidebar) {
        setSidebarOpen(true)
        localStorage.setItem("sidebarOpen", "true")
      }

      // Si pasamos de escritorio a móvil, cerrar el sidebar
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false)
        localStorage.setItem("sidebarOpen", "false")
      }
    }

    // Escuchar cambios de tamaño de ventana
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [sidebarOpen, userClosedSidebar])

  // Efecto inicial para configurar el sidebar al cargar la página
  useEffect(() => {
    // Si estamos en escritorio y no hay estado guardado, abrir el sidebar
    if (window.innerWidth >= 768 && localStorage.getItem("sidebarOpen") === null) {
      setSidebarOpen(true)
      localStorage.setItem("sidebarOpen", "true")
    }
  }, [])

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay para dispositivos móviles */}
      {sidebarOpen && (
        <motion.div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <motion.div
        className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}
        animate={{
          marginLeft: sidebarOpen ? (window.innerWidth < 768 ? "0" : "280px") : "0",
          width: sidebarOpen && window.innerWidth >= 768 ? "calc(100% - 280px)" : "100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <header className="header">
          <div className="header-content">
            <motion.button
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Abrir/Cerrar menú"
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>

            {/* Pasar el trigger de actualización como prop para forzar la actualización */}
            <UserProfile key={`user-profile-${profileUpdateTrigger}`} forceUpdate={profileUpdateTrigger} />
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        {/* Usar el componente de footer pasado como prop o el Footer por defecto */}
        {footerComponent}
      </motion.div>
    </div>
  )
}

export default Layout