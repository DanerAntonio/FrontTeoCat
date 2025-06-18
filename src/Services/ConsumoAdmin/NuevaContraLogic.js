"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom" // Añadido useParams
import authService from "../../Services/ConsumoAdmin/authService"

export const useNuevaContraLogic = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams() // Obtener parámetros de la ruta

  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Extraer token de la URL (ahora desde params o query params para mantener compatibilidad)
  useEffect(() => {
    // Primero intentar obtener el token de los parámetros de ruta
    const tokenFromParams = params.token
    
    // Si no está en los parámetros de ruta, intentar obtenerlo de los parámetros de consulta
    const searchParams = new URLSearchParams(location.search)
    const tokenFromQuery = searchParams.get("token")
    
    const tokenValue = tokenFromParams || tokenFromQuery
    
    if (tokenValue) {
      setToken(tokenValue)
    } else {
      setError("Token de restablecimiento no encontrado. Por favor solicita un nuevo enlace de recuperación.")
    }
  }, [location.search, params])

  // Validar contraseña
  const validatePassword = (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    // Validar requisitos de contraseña
    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número")
      setLoading(false)
      return
    }

    try {
      await authService.resetPassword(token, password)
      setSuccess(true)

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    success,
    loading,
    validatePassword,
    handleSubmit,
  }
}