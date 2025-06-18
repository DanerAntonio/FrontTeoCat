"use client"

import { FiEdit2, FiX, FiLock } from "react-icons/fi"

/**
 * Componente para la sección de cambio de contraseña
 */
const PasswordSection = ({ userData, editMode, validation, handleChange, toggleEditMode }) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="password-section">
          <div className="d-flex align-items-center mb-3">
            <h5 className="mb-0">Cambiar Contraseña</h5>
            <button
              type="button"
              className={`btn btn-sm ms-3 ${editMode.Contraseña ? "btn-danger" : "btn-outline-primary"}`}
              onClick={() => toggleEditMode("Contraseña")}
            >
              {editMode.Contraseña ? (
                <>
                  <FiX className="me-1" /> Cancelar
                </>
              ) : (
                <>
                  <FiEdit2 className="me-1" /> Editar
                </>
              )}
            </button>
          </div>

          {editMode.Contraseña && (
            <div className="row g-3">
              {/* Contraseña Antigua */}
              <div className="col-md-4">
                <div className="profile-field">
                  <label className="form-label">Contraseña Actual</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="ContraseñaOld"
                      value={userData.ContraseñaOld}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {validation.ContraseñaOld && <div className="text-danger small mt-1">{validation.ContraseñaOld}</div>}
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="col-md-4">
                <div className="profile-field">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="ContraseñaNew"
                      value={userData.ContraseñaNew}
                      onChange={handleChange}
                      required
                      maxLength={255}
                    />
                  </div>
                  {validation.ContraseñaNew && <div className="text-danger small mt-1">{validation.ContraseñaNew}</div>}
                  <small className="text-muted">Máximo 255 caracteres.</small>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="col-md-4">
                <div className="profile-field">
                  <label className="form-label">Confirmar Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="ContraseñaConfirm"
                      value={userData.ContraseñaConfirm}
                      onChange={handleChange}
                      required
                      maxLength={255}
                    />
                  </div>
                  {validation.ContraseñaConfirm && (
                    <div className="text-danger small mt-1">{validation.ContraseñaConfirm}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const validarDatosPersonales = (userData) => {
  const errores = {}

  // Nombre: requerido, mínimo 2, máximo 100
  if (!userData.Nombre || userData.Nombre.trim().length < 2) {
    errores.Nombre = "El nombre es obligatorio y debe tener al menos 2 caracteres."
  } else if (userData.Nombre.length > 100) {
    errores.Nombre = "El nombre no puede superar los 100 caracteres."
  }

  // Apellido: requerido, mínimo 2, máximo 100
  if (!userData.Apellido || userData.Apellido.trim().length < 2) {
    errores.Apellido = "El apellido es obligatorio y debe tener al menos 2 caracteres."
  } else if (userData.Apellido.length > 100) {
    errores.Apellido = "El apellido no puede superar los 100 caracteres."
  }

  // Teléfono: requerido, 7-20 dígitos, solo números
  if (!userData.Telefono || !/^\d{7,20}$/.test(userData.Telefono)) {
    errores.Telefono = "El teléfono debe tener entre 7 y 20 dígitos numéricos."
  }

  // Dirección: opcional, máximo 100 caracteres
  if (userData.Direccion && userData.Direccion.length > 100) {
    errores.Direccion = "La dirección no puede superar los 100 caracteres."
  }

  return errores
}

const validarCambioContraseña = (userData) => {
  const errores = {}

  // Contraseña actual: requerida
  if (!userData.ContraseñaOld || userData.ContraseñaOld.length < 6) {
    errores.ContraseñaOld = "Ingrese su contraseña actual (mínimo 6 caracteres)."
  }

  // Nueva contraseña: requerida, mínimo 6, máximo 255
  if (!userData.ContraseñaNew || userData.ContraseñaNew.length < 6) {
    errores.ContraseñaNew = "La nueva contraseña debe tener al menos 6 caracteres."
  } else if (userData.ContraseñaNew.length > 255) {
    errores.ContraseñaNew = "La nueva contraseña no puede superar los 255 caracteres."
  }

  // Confirmar contraseña: debe coincidir
  if (userData.ContraseñaNew !== userData.ContraseñaConfirm) {
    errores.ContraseñaConfirm = "Las contraseñas no coinciden."
  }

  return errores
}

export default PasswordSection