"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import authService from "../../Services/ConsumoAdmin/authService"

export const useAuthPageLogic = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Estados para formulario de login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Estados para formulario de registro
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [documento, setDocumento] = useState("")
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState("")

  // Determinar si mostrar login o registro basado en la URL
  useEffect(() => {
    setIsLogin(location.pathname === "/login")
  }, [location.pathname])

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/")
    }
  }, [navigate])

  // Manejar cambio de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Manejar envío de formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authService.login(loginEmail, loginPassword)
      // Redirigir según el rol
      if (authService.getUserRole() === "admin") {
        navigate("/")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Manejar envío de formulario de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    // Validar contraseñas
    if (registerPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const userData = {
        nombre,
        apellido,
        email: registerEmail,
        password: registerPassword,
        telefono,
        fechaNacimiento,
        documento,
        foto,
      }

      await authService.register(userData)

      setSuccessMessage("Registro exitoso. Ahora puedes iniciar sesión.")
      // Limpiar formulario
      setNombre("")
      setApellido("")
      setRegisterEmail("")
      setRegisterPassword("")
      setConfirmPassword("")
      setTelefono("")
      setFechaNacimiento("")
      setDocumento("")
      setFoto(null)
      setFotoPreview("")

      // Cambiar a login después de un registro exitoso
      setTimeout(() => {
        setIsLogin(true)
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.message || "Error al registrar usuario. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return {
    isLogin,
    loading,
    error,
    successMessage,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    nombre,
    setNombre,
    apellido,
    setApellido,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    confirmPassword,
    setConfirmPassword,
    telefono,
    setTelefono,
    fechaNacimiento,
    setFechaNacimiento,
    documento,
    setDocumento,
    foto,
    fotoPreview,
    setError,
    setSuccessMessage,
    handleFotoChange,
    handleLoginSubmit,
    handleRegisterSubmit,
  }
}