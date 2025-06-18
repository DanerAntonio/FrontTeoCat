"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FiMail, FiLock, FiUser, FiFileText, FiMapPin, FiPhone, FiEye, FiEyeOff } from "react-icons/fi"
import authService from "../../src/Services/ConsumoAdmin/authService"
import "../Styles/AuthPage.css"

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeForm, setActiveForm] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    document: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  // Determinar el formulario activo basado en la URL
  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveForm("register")
    } else {
      setActiveForm("login")
    }

    // Verificar si el usuario ya está autenticado
    if (authService.isAuthenticated()) {
      navigate("/")
    }
  }, [location, navigate])

  // Limpiar mensajes de error y éxito después de un tiempo
  useEffect(() => {
    let errorTimer, successTimer

    if (error) {
      errorTimer = setTimeout(() => {
        setError("")
      }, 5000)
    }

    if (success) {
      successTimer = setTimeout(() => {
        setSuccess("")
      }, 5000)
    }

    return () => {
      clearTimeout(errorTimer)
      clearTimeout(successTimer)
    }
  }, [error, success])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await authService.login(loginForm.email, loginForm.password)
      setSuccess("Inicio de sesión exitoso. Redirigiendo...")

      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate("/")
      }, 1500)
    } catch (err) {
      setError(err.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validación básica
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      await authService.register(registerForm)
      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.")

      // Cambiar al formulario de login después de un breve retraso
      setTimeout(() => {
        switchForm("login")
      }, 2000)
    } catch (err) {
      setError(err.message || "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  const updateLoginForm = (field, value) => {
    setLoginForm({
      ...loginForm,
      [field]: value,
    })
  }

  const updateRegisterForm = (field, value) => {
    setRegisterForm({
      ...registerForm,
      [field]: value,
    })
  }

  const switchForm = (form) => {
    if (isAnimating || form === activeForm) return

    setIsAnimating(true)

    // Añadir clase para animación de salida
    const formContainer = document.querySelector(".form-side")
    if (formContainer) {
      formContainer.classList.add("form-exit")

      setTimeout(() => {
        setActiveForm(form)
        setError("")
        setSuccess("")

        // Actualizar la URL sin recargar la página
        navigate(form === "login" ? "/login" : "/register", { replace: true })

        // Remover clase de salida y añadir clase de entrada
        formContainer.classList.remove("form-exit")
        formContainer.classList.add("form-enter")

        setTimeout(() => {
          formContainer.classList.remove("form-enter")
          setIsAnimating(false)
        }, 500)
      }, 300)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      <div className={`auth-container ${activeForm === "login" ? "login-view" : "register-view"}`}>
        <div className="card auth-card">
          <div className="card-body p-0">
            <div className="row g-0 h-100">
              <div className="col-md-5 brand-side">
                <div className="brand-content">
                  <div className="logo-container">
                    <img src="./src/assets/Logo2.jpg" alt="TeoCat Logo" className="logo-image" />
                  </div>
                  <h1 className="brand-name">TeoCat</h1>
                  <p className="tagline">Productos y servicios premium para tus mascotas</p>
                  <div className="brand-decoration">
                    <div className="decoration-circle"></div>
                    <div className="decoration-circle"></div>
                    <div className="decoration-circle"></div>
                  </div>
                </div>
              </div>

              <div className="col-md-7 form-side">
                {/* Contenedor de Login */}
                {activeForm === "login" && (
                  <div className="form-container">
                    <h2 className="form-title">Bienvenido</h2>
                    <p className="form-subtitle">Inicia sesión para continuar</p>

                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError("")}></button>
                      </div>
                    )}

                    {success && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="auth-form login-form">
                      <div className="form-group mb-4">
                        <label htmlFor="login-email" className="form-label">
                          Correo Electrónico
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">
                            <FiMail className="icon" />
                          </span>
                          <input
                            type="email"
                            id="login-email"
                            className="form-control"
                            placeholder="correo@ejemplo.com"
                            value={loginForm.email}
                            onChange={(e) => updateLoginForm("email", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label htmlFor="login-password" className="form-label">
                            Contraseña
                          </label>
                          <a href="/recover-password" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">
                            <FiLock className="icon" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="login-password"
                            className="form-control"
                            placeholder="Contraseña"
                            value={loginForm.password}
                            onChange={(e) => updateLoginForm("password", e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FiEyeOff className="icon" /> : <FiEye className="icon" />}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary btn-lg w-100 mb-4" disabled={loading}>
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Procesando...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </button>

                      <div className="form-switch text-center">
                        <p>
                          ¿No tienes una cuenta?{" "}
                          <button type="button" className="switch-btn" onClick={() => switchForm("register")}>
                            Regístrate
                          </button>
                        </p>
                      </div>
                    </form>
                  </div>
                )}

                {/* Contenedor de Registro */}
                {activeForm === "register" && (
                  <div className="form-container">
                    <h2 className="form-title">Crear una cuenta</h2>
                    <p className="form-subtitle">Únete a la familia Teo/Cat</p>

                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError("")}></button>
                      </div>
                    )}

                    {success && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="auth-form register-form">
                      <div className="row">
                        {/* Documento y Correo */}
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-document" className="form-label">
                              Documento
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiFileText className="icon" />
                              </span>
                              <input
                                type="text"
                                id="register-document"
                                className="form-control"
                                placeholder="Número de documento"
                                value={registerForm.document}
                                onChange={(e) => updateRegisterForm("document", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-email" className="form-label">
                              Correo
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiMail className="icon" />
                              </span>
                              <input
                                type="email"
                                id="register-email"
                                className="form-control"
                                placeholder="correo@ejemplo.com"
                                value={registerForm.email}
                                onChange={(e) => updateRegisterForm("email", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-firstName" className="form-label">
                              Nombre
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiUser className="icon" />
                              </span>
                              <input
                                type="text"
                                id="register-firstName"
                                className="form-control"
                                placeholder="Nombre"
                                value={registerForm.firstName}
                                onChange={(e) => updateRegisterForm("firstName", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-lastName" className="form-label">
                              Apellido
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiUser className="icon" />
                              </span>
                              <input
                                type="text"
                                id="register-lastName"
                                className="form-control"
                                placeholder="Apellido"
                                value={registerForm.lastName}
                                onChange={(e) => updateRegisterForm("lastName", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dirección y Teléfono */}
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-address" className="form-label">
                              Dirección
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiMapPin className="icon" />
                              </span>
                              <input
                                type="text"
                                id="register-address"
                                className="form-control"
                                placeholder="Dirección"
                                value={registerForm.address}
                                onChange={(e) => updateRegisterForm("address", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-phone" className="form-label">
                              Teléfono
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiPhone className="icon" />
                              </span>
                              <input
                                type="tel"
                                id="register-phone"
                                className="form-control"
                                placeholder="Teléfono"
                                value={registerForm.phone}
                                onChange={(e) => updateRegisterForm("phone", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contraseña y Confirmar Contraseña */}
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-password" className="form-label">
                              Contraseña
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiLock className="icon" />
                              </span>
                              <input
                                type={showPassword ? "text" : "password"}
                                id="register-password"
                                className="form-control"
                                placeholder="Contraseña"
                                value={registerForm.password}
                                onChange={(e) => updateRegisterForm("password", e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FiEyeOff className="icon" /> : <FiEye className="icon" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="register-confirmPassword" className="form-label">
                              Confirmar
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FiLock className="icon" />
                              </span>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="register-confirmPassword"
                                className="form-control"
                                placeholder="Confirmar contraseña"
                                value={registerForm.confirmPassword}
                                onChange={(e) => updateRegisterForm("confirmPassword", e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <FiEyeOff className="icon" /> : <FiEye className="icon" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary btn-lg w-100 mb-4" disabled={loading}>
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Procesando...
                          </>
                        ) : (
                          "Registrarse"
                        )}
                      </button>

                      <div className="form-switch text-center">
                        <p>
                          ¿Ya tienes una cuenta?{" "}
                          <button type="button" className="switch-btn" onClick={() => switchForm("login")}>
                            Inicia Sesión
                          </button>
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-footer">
        <p>&copy; {new Date().getFullYear()} TeoCat. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}

export default AuthPage
