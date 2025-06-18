"use client"

import { Save } from "lucide-react"
import "./TipoServicioForm.scss"

/**
 * Componente de formulario para crear/editar/ver tipos de servicios
 * Actualizado con etiquetas flotantes
 */
const TipoServicioForm = ({
  showModal,
  modalTitle,
  formData,
  formErrors,
  onInputChange,
  onSave,
  onClose,
  setFormErrors // <-- asegúrate de pasar esto desde el padre
}) => {
  const isViewMode = modalTitle === "Ver Detalles del Tipo de Servicio"

  // Función de validación
  const validarFormularioTipoServicio = (formData) => {
    const errores = {}
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      errores.nombre = "El nombre es obligatorio y debe tener al menos 3 caracteres."
    } else if (formData.nombre.length > 100) {
      errores.nombre = "El nombre no puede superar los 100 caracteres."
    }
    return errores
  }

  // Nuevo handleSave con validación
  const handleSave = (e) => {
    e.preventDefault()
    const errores = validarFormularioTipoServicio(formData)
    if (Object.keys(errores).length > 0) {
      if (typeof setFormErrors === "function") setFormErrors(errores)
      return
    }
    onSave()
  }

  return (
    <div
      className="modal fade"
      id="tipoServicioModal"
      tabIndex="-1"
      aria-labelledby="tipoServicioModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="tipoServicioModalLabel">
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body compact-form">
            <form className="tipo-servicio-form">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                  id="nombre"
                  name="nombre"
                  placeholder=" "
                  value={formData.nombre}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  required
                  maxLength={100}
                />
                <label htmlFor="nombre">
                  Nombre del Tipo de Servicio <span className="text-danger">*</span>
                </label>
                {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                <small className="form-text text-muted">Máximo 100 caracteres.</small>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleSave}>
                <Save size={18} className="me-1" />
                Guardar Tipo de Servicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TipoServicioForm
