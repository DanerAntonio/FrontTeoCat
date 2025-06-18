"use client"

import { Link } from "react-router-dom"
import { FiMail, FiArrowLeft, FiRefreshCw } from "react-icons/fi"
import { useRecoverPasswordLogic } from "../../src/Services/ConsumoAdmin/RecoverPasswordLogic.js"
import "../Styles/RecoverPassword.css"

const RecoverPassword = () => {
  const { email, setEmail, submitted, error, setError, loading, resending, handleSubmit, handleResend } =
    useRecoverPasswordLogic()

  return (
    <div className="recover-page">
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      <div className="recover-container">
        <div className="card recover-card">
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
                <div className="form-container">
                  <h2 className="form-title">Recuperar contraseña</h2>
                  <p className="form-subtitle">Te enviaremos instrucciones para restablecer tu contraseña</p>

                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                      <button type="button" className="btn-close" onClick={() => setError("")}></button>
                    </div>
                  )}

                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="recover-form">
                      <div className="form-group mb-4">
                        <label htmlFor="email" className="form-label">
                          Correo Electrónico
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">
                            <FiMail className="icon" />
                          </span>
                          <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
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
                            Enviando...
                          </>
                        ) : (
                          "Enviar Instrucciones"
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="recover-success">
                      <div className="success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                      </div>
                      <h4>¡Correo enviado!</h4>
                      <p>
                        Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>.
                      </p>
                      <p>Por favor revisa tu bandeja de entrada y sigue las instrucciones del correo.</p>

                      <div id="resend-success" className="alert alert-success mt-3 mb-3 d-none">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Correo reenviado exitosamente
                      </div>

                      <button className="btn btn-outline-primary mt-2 mb-3" onClick={handleResend} disabled={resending}>
                        {resending ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="icon me-2" /> Reenviar correo
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="form-switch text-center mt-4">
                    <Link to="/login" className="back-link">
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

export default RecoverPassword
