"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FiLock, FiArrowLeft, FiCheck, FiEye, FiEyeOff } from "react-icons/fi"
import { useNuevaContraLogic } from "../../src/Services/ConsumoAdmin/NuevaContraLogic.js"
import "../Styles/NuevaContra.css"

const NuevaContra = () => {
  const {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    success,
    loading,
    handleSubmit,
  } = useNuevaContraLogic()

  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      <div className="auth-container">
        <div className="card auth-card">
          <div className="card-body p-0">
            <div className="row g-0 h-100">
              <div className="col-md-5 brand-side">
                <div className="brand-content">
                  <div className="logo-container">
                  <img src="/src/assets/Logo2.jpg" alt="TeoCat Logo" className="logo-image" />
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
                <div className="form-container">
                  <h2 className="form-title">Crear nueva contraseña</h2>
                  <p className="form-subtitle">Ingresa tu nueva contraseña para acceder a tu cuenta</p>

                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                      <button type="button" className="btn-close" onClick={() => setError("")}></button>
                    </div>
                  )}

                  {success ? (
                    <div className="success-container">
                      <div className="success-icon">
                        <FiCheck className="check-icon" />
                      </div>
                      <h4>¡Contraseña actualizada!</h4>
                      <p>Tu contraseña ha sido restablecida exitosamente.</p>
                      <p>Serás redirigido a la página de inicio de sesión en unos segundos...</p>
                      <Link to="/login" className="btn btn-primary mt-3">
                        Ir a Iniciar Sesión
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                      <div className="form-group mb-4">
                        <label htmlFor="password" className="form-label">
                          Nueva Contraseña
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">
                            <FiLock className="icon" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="form-control"
                            placeholder="Ingresa tu nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <small className="form-text text-muted">
                          La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
                        </small>
                      </div>

                      <div className="form-group mb-4">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirmar Contraseña
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">
                            <FiLock className="icon" />
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="form-control"
                            placeholder="Confirma tu nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                      <button type="submit" className="btn btn-primary btn-lg w-100 mb-4" disabled={loading || !token}>
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
                          "Guardar Nueva Contraseña"
                        )}
                      </button>
                    </form>
                  )}

                  <div className="form-switch text-center mt-4">
                    <Link to="/login" className="forgot-password">
                      <FiArrowLeft className="icon me-2" /> Volver a Iniciar Sesión
                    </Link>
                  </div>
                </div>
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

export default NuevaContra