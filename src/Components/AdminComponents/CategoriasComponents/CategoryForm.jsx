"use client"

import { Save } from "lucide-react"
import "./CategoryForm.scss"

/**
 * Componente de formulario para crear/editar/ver categorías
 * Actualizado con etiquetas flotantes
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.showModal - Indica si se debe mostrar el modal
 * @param {string} props.modalTitle - Título del modal
 * @param {Object} props.formData - Datos del formulario
 * @param {Object} props.formErrors - Errores de validación del formulario
 * @param {Function} props.onInputChange - Función para manejar cambios en los inputs
 * @param {Function} props.onSave - Función para guardar los cambios
 * @param {Function} props.onClose - Función para cerrar el modal
 */
const CategoryForm = ({ showModal, modalTitle, formData, formErrors, onInputChange, onSave, onClose }) => {
  const isViewMode = modalTitle === "Ver Detalles de la Categoría"

  return (
    <div
      className="modal fade"
      id="categoriaModal"
      tabIndex="-1"
      aria-labelledby="categoriaModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="categoriaModalLabel">
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
            <form className="categoria-form">
              <div className="mb-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la Categoría"
                    value={formData.nombre}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    maxLength={50}
                    required
                  />
                  <label htmlFor="nombre">
                    Nombre de la Categoría <span className="text-danger">*</span>
                  </label>
                  {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                  <small className="form-text text-muted">Máximo 50 caracteres.</small>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={onSave}>
                <Save size={18} className="me-1" />
                Guardar Categoría
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Puedes colocar esto en el componente padre o en un archivo utils

const validarFormularioCategoria = (formData) => {
  const errores = {}

  // Nombre: requerido, mínimo 2, máximo 50, no solo espacios
  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errores.nombre = "El nombre es obligatorio y debe tener al menos 2 caracteres."
  } else if (formData.nombre.trim().length > 50) {
    errores.nombre = "El nombre no puede superar los 50 caracteres."
  }

  return errores
}

export default CategoryForm
