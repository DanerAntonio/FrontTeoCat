"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import Select from "react-select"
import "./MascotaForm.scss"

/**
 * Componente de formulario para crear/editar/ver mascotas
 * Actualizado con etiquetas flotantes y carga de imágenes mejorada
 */
const MascotaForm = ({
  showModal,
  modalTitle,
  formData,
  fotoPreview,
  especiesOptions = [],
  tamañosOptions = [],
  clientesOptions = [],
  onInputChange,
  onSelectCliente,
  onFotoChange,
  onSave,
  onClose,
  disableSave,
}) => {
  const isViewMode = modalTitle === "Ver Detalles de la Mascota"
  const [imageLoading, setImageLoading] = useState(false)

  // Opciones para react-select
  const clienteSelectValue = clientesOptions.find((opt) => opt.value === formData.cliente) || null

  return (
    <div className="modal fade" id="mascotaModal" tabIndex="-1" aria-labelledby="mascotaModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="mascotaModalLabel">
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
            <form className="mascota-form">
              {/* CAMBIO: Usar react-select para clientes */}
              <div className="mb-3">
                <label htmlFor="cliente" className="form-label">
                  Cliente <span className="text-danger">*</span>
                </label>
                <Select
                  id="cliente"
                  name="cliente"
                  options={clientesOptions}
                  value={clienteSelectValue}
                  onChange={(option) => onSelectCliente(option)}
                  isDisabled={isViewMode}
                  placeholder="Buscar o seleccionar cliente..."
                  isClearable
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: "#fff",
                      borderColor: state.isFocused ? "#0d6efd" : "#ced4da",
                      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(13,110,253,.25)" : "none",
                      minHeight: "48px",
                      fontSize: "1rem",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder=" "
                  value={formData.nombre}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  required
                />
                <label htmlFor="nombre">
                  Nombre de la Mascota <span className="text-danger">*</span>
                </label>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="especie"
                      name="especie"
                      value={formData.especie}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                      placeholder=" "
                    >
                      <option value="">Seleccione una especie</option>
                      {especiesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="especie">
                      Especie <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="raza"
                      name="raza"
                      placeholder=" "
                      value={formData.raza}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="raza">
                      Raza <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="tamaño"
                      name="tamaño"
                      value={formData.tamaño}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                      placeholder=" "
                    >
                      <option value="">Seleccione un tamaño</option>
                      {tamañosOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="tamaño">
                      Tamaño <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="date"
                      className="form-control"
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      placeholder=" "
                      value={formData.fechaNacimiento}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="fechaNacimiento">
                      Fecha de Nacimiento <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="foto" className="form-label">
                  Foto de la Mascota
                </label>
                <div className="file-upload-box">
                  {fotoPreview ? (
                    <div className="image-preview-container">
                      <img src={fotoPreview || "//vite.svg"}
 alt="Vista previa" className="image-preview" />
                      {!isViewMode && (
                        <div className="image-overlay">
                          <label htmlFor="foto" className="change-image-btn">
                            Cambiar
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label htmlFor="foto" className="upload-label">
                      <div className="upload-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                          <line x1="16" y1="5" x2="22" y2="5"></line>
                          <line x1="19" y1="2" x2="19" y2="8"></line>
                          <circle cx="9" cy="9" r="2"></circle>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                      </div>
                      <span className="upload-text">{disableSave ? "Subiendo..." : "Subir imagen"}</span>
                    </label>
                  )}
                  <input
                    type="file"
                    className="file-input"
                    id="foto"
                    name="foto"
                    onChange={onFotoChange}
                    disabled={isViewMode || disableSave}
                    accept="image/*"
                  />
                </div>
                <small className="form-text text-muted">Formatos aceptados: JPG, PNG, GIF. Máximo 5MB.</small>
                {disableSave && (
                  <div className="text-info mt-1">
                    <small>Subiendo imagen a Cloudinary...</small>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>

            {!isViewMode && (
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
                onClick={onSave}
                disabled={disableSave}
              >
                <Save size={18} className="me-1" />
                {disableSave ? "Subiendo imagen..." : "Guardar Mascota"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Ejemplo de función de validación para MascotaForm
const validarFormularioMascota = (formData, fotoFile) => {
  const errores = {}

  // Cliente: requerido
  if (!formData.cliente) {
    errores.cliente = "Debe seleccionar un cliente."
  }

  // Nombre Mascota: requerido, no solo espacios, máximo 100
  if (!formData.nombre || formData.nombre.trim() === "") {
    errores.nombre = "El nombre es obligatorio."
  } else if (formData.nombre.trim().length > 100) {
    errores.nombre = "El nombre no puede superar los 100 caracteres."
  }

  // Especie: requerido
  if (!formData.especie) {
    errores.especie = "Debe seleccionar una especie."
  }

  // Raza: requerido, no solo espacios, máximo 100
  if (!formData.raza || formData.raza.trim() === "") {
    errores.raza = "La raza es obligatoria."
  } else if (formData.raza.trim().length > 100) {
    errores.raza = "La raza no puede superar los 100 caracteres."
  }

  // Tamaño: requerido
  if (!formData.tamaño) {
    errores.tamaño = "Debe seleccionar un tamaño."
  }

  // Fecha de nacimiento: requerido, formato válido, no futura
  if (!formData.fechaNacimiento) {
    errores.fechaNacimiento = "Debe ingresar la fecha de nacimiento."
  } else {
    const fecha = new Date(formData.fechaNacimiento)
    const hoy = new Date()
    if (isNaN(fecha.getTime())) {
      errores.fechaNacimiento = "La fecha no es válida."
    } else if (fecha > hoy) {
      errores.fechaNacimiento = "La fecha no puede ser futura."
    }
  }

  // Foto: si existe, validar formato y tamaño
  if (fotoFile) {
    const formatosValidos = ["image/jpeg", "image/png", "image/gif"]
    if (!formatosValidos.includes(fotoFile.type)) {
      errores.foto = "Formato de imagen no soportado. Solo JPG, PNG o GIF."
    }
    if (fotoFile.size > 5 * 1024 * 1024) {
      errores.foto = "La imagen no puede superar los 5MB."
    }
  }

  // Estado: debe ser "Activo", "Inactivo", 1 o 0
  if (formData.estado !== undefined && formData.estado !== null) {
    if (
      !["Activo", "Inactivo", 1, 0, "1", "0"].includes(formData.estado)
    ) {
      errores.estado = "El estado debe ser Activo o Inactivo."
    }
  }

  return errores
}

export default MascotaForm