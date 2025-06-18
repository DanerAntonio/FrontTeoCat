"use client"

import { Save } from "lucide-react"
import "./EspecieForm.scss"

/**
 * Componente de formulario para crear/editar/ver especies
 * Se ha eliminado el interruptor de estado ya que esta funcionalidad
 * está disponible en las acciones de la tabla principal
 */
const EspecieForm = ({ showModal, modalTitle, formData, onInputChange, onSave, onClose, isViewMode }) => {
  return (
    <div className="modal fade" id="especieModal" tabIndex="-1" aria-labelledby="especieModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="especieModalLabel">
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
            <form className="especie-form">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="nombreEspecie"
                  name="nombreEspecie"
                  placeholder=" "
                  value={formData.nombreEspecie}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  required
                />
                <label htmlFor="nombreEspecie">
                  Nombre de la Especie <span className="text-danger">*</span>
                </label>
              </div>

              {/* Se ha eliminado el interruptor de estado */}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={onSave}>
                <Save size={18} className="me-1" />
                Guardar Especie
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Validación para EspecieForm
export const validarFormularioEspecie = (formData) => {
  const errores = {}

  // Nombre Especie: requerido, no solo espacios, máximo 100
  if (!formData.nombreEspecie || formData.nombreEspecie.trim() === "") {
    errores.nombreEspecie = "El nombre de la especie es obligatorio."
  } else if (formData.nombreEspecie.trim().length > 100) {
    errores.nombreEspecie = "El nombre no puede superar los 100 caracteres."
  }

  // Estado: si lo manejas aquí, debe ser "Activo", "Inactivo", 1 o 0
  if (formData.estado !== undefined && formData.estado !== null) {
    if (
      !["Activo", "Inactivo", 1, 0, "1", "0"].includes(formData.estado)
    ) {
      errores.estado = "El estado debe ser Activo o Inactivo."
    }
  }

  return errores
}

export default EspecieForm
