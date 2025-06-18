"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import authService from "../services/authService"

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    checkAuth()

    // Escuchar eventos de cambio en localStorage
    const handleStorageChange = () => {
      checkAuth()
    }

    // Escuchar evento personalizado de logout
    const handleLogout = () => {
      setIsAuthenticated(false)
      setUserRole(null)
      setUserData(null)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("logout", handleLogout)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("logout", handleLogout)
    }
  }, [])

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated()
    setIsAuthenticated(authenticated)

    if (authenticated) {
      setUserRole(authService.getUserRole())
      setUserData(authService.getUserData())
    } else {
      setUserRole(null)
      setUserData(null)
    }

    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      setIsAuthenticated(true)
      setUserRole(authService.getUserRole())
      setUserData(authService.getUserData())

      // Redirigir según el rol
      if (authService.getUserRole() === "admin") {
        navigate("/")
      } else {
        navigate("/")
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  const register = async (userData) => {
    try {
      const data = await authService.register(userData)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = async () => {
    await authService.logout()
    setIsAuthenticated(false)
    setUserRole(null)
    setUserData(null)
    navigate("/login")
  }

  const requestPasswordReset = async (email) => {
    try {
      const data = await authService.requestPasswordReset(email)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  const resendPasswordReset = async (email) => {
    try {
      const data = await authService.resendPasswordReset(email)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const data = await authService.resetPassword(token, newPassword)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  return {
    isAuthenticated,
    userRole,
    userData,
    loading,
    login,
    register,
    logout,
    requestPasswordReset,
    resendPasswordReset,
    resetPassword,
  }
}

export default useAuth
