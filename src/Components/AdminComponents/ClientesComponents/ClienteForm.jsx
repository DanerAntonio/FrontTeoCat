"use client"

import { Save } from "lucide-react"
import "../ClientesComponents/ClienteForm.scss"

/**
 * Componente de formulario para crear/editar/ver clientes
 * Actualizado con etiquetas flotantes
 */
const ClienteForm = ({
  showModal,
  modalTitle,
  formData,
  formErrors,
  handleInputChange,
  handleSaveCliente,
  handleCloseModal,
  isViewMode,
}) => {
  return (
    <div className="modal fade" id="clienteModal" tabIndex="-1" aria-labelledby="clienteModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="clienteModalLabel">
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleCloseModal}
            ></button>
          </div>
          <div className="modal-body compact-form">
            <form className="cliente-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.documento ? "is-invalid" : ""}`}
                      id="documento"
                      name="documento"
                      placeholder=" "
                      value={formData.documento}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="documento">
                      Documento <span className="text-danger">*</span>
                    </label>
                    {formErrors.documento && <div className="invalid-feedback">{formErrors.documento}</div>}
                    <small className="form-text text-muted">Ingrese entre 7 y 12 dígitos sin puntos ni espacios.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className={`form-control ${formErrors.correo ? "is-invalid" : ""}`}
                      id="correo"
                      name="correo"
                      placeholder=" "
                      value={formData.correo}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="correo">
                      Correo Electrónico <span className="text-danger">*</span>
                    </label>
                    {formErrors.correo && <div className="invalid-feedback">{formErrors.correo}</div>}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                      id="nombre"
                      name="nombre"
                      placeholder=" "
                      value={formData.nombre}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                      maxLength={50}
                    />
                    <label htmlFor="nombre">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                    <small className="form-text text-muted">Máximo 50 caracteres.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.apellido ? "is-invalid" : ""}`}
                      id="apellido"
                      name="apellido"
                      placeholder=" "
                      value={formData.apellido}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                      maxLength={50}
                    />
                    <label htmlFor="apellido">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    {formErrors.apellido && <div className="invalid-feedback">{formErrors.apellido}</div>}
                    <small className="form-text text-muted">Máximo 50 caracteres.</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="tel"
                      className={`form-control ${formErrors.telefono ? "is-invalid" : ""}`}
                      id="telefono"
                      name="telefono"
                      placeholder=" "
                      value={formData.telefono}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="telefono">
                      Teléfono <span className="text-danger">*</span>
                    </label>
                    {formErrors.telefono && <div className="invalid-feedback">{formErrors.telefono}</div>}
                    <small className="form-text text-muted">Ingrese entre 7 y 10 dígitos sin espacios.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                      id="direccion"
                      name="direccion"
                      placeholder=" "
                      value={formData.direccion}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      required
                      maxLength={100}
                    />
                    <label htmlFor="direccion">
                      Dirección <span className="text-danger">*</span>
                    </label>
                    {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                    <small className="form-text text-muted">Máximo 100 caracteres.</small>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseModal}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleSaveCliente}>
                <Save size={18} className="me-1" />
                Guardar Cliente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Puedes colocar esto en el componente padre o en un archivo utils

const validarFormularioCliente = (formData) => {
  const errores = {}

  // Documento: requerido, 7-12 dígitos, solo números
  if (!formData.documento || !/^\d{7,12}$/.test(formData.documento)) {
    errores.documento = "El documento debe tener entre 7 y 12 dígitos numéricos."
  }

  // Correo: requerido, formato válido
  if (!formData.correo || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.correo)) {
    errores.correo = "Ingrese un correo electrónico válido."
  }

  // Nombre: requerido, mínimo 2, máximo 50
  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errores.nombre = "El nombre es obligatorio y debe tener al menos 2 caracteres."
  } else if (formData.nombre.length > 50) {
    errores.nombre = "El nombre no puede superar los 50 caracteres."
  }

  // Apellido: requerido, mínimo 2, máximo 50
  if (!formData.apellido || formData.apellido.trim().length < 2) {
    errores.apellido = "El apellido es obligatorio y debe tener al menos 2 caracteres."
  } else if (formData.apellido.length > 50) {
    errores.apellido = "El apellido no puede superar los 50 caracteres."
  }

  // Teléfono: requerido, 7-10 dígitos, solo números
  if (!formData.telefono || !/^\d{7,10}$/.test(formData.telefono)) {
    errores.telefono = "El teléfono debe tener entre 7 y 10 dígitos numéricos."
  }

  // Dirección: requerido, mínimo 5, máximo 100
  if (!formData.direccion || formData.direccion.trim().length < 5) {
    errores.direccion = "La dirección es obligatoria y debe tener al menos 5 caracteres."
  } else if (formData.direccion.length > 100) {
    errores.direccion = "La dirección no puede superar los 100 caracteres."
  }

  return errores
}

export default ClienteForm
