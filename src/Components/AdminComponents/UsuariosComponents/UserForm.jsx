"use client"

import { useState, useEffect } from "react"
import { Save, Eye, EyeOff } from "lucide-react"
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary"
import "../UsuariosComponents/FormStyles.scss"

/**
 * Componente de formulario para crear/editar/ver usuarios
 * Actualizado con etiquetas flotantes y diseño optimizado
 */
const UserForm = ({
  showModal,
  modalTitle,
  formData,
  formErrors,
  roles,
  currentUser,
  onInputChange,
  onSave,
  onClose,
  onDocumentoBlur,
}) => {
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  // Determinar si estamos en modo edición (no vista ni creación)
  const isEditMode = modalTitle === "Editar Usuario"
  const isViewMode = modalTitle === "Ver Detalles del Usuario"
  const isCreateMode = modalTitle === "Agregar Usuario"

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Creamos un objeto de evento simulado para mantener la compatibilidad con onInputChange
    const event = {
      target: {
        name: e.target.name,
        value: file, // Mantenemos el archivo en el estado temporal para mostrar el nombre
      },
    }

    // Actualizamos el estado del formulario con el archivo seleccionado
    onInputChange(event)

    // Mostramos indicador de carga
    setImageLoading(true)

    try {
      // Subimos la imagen a Cloudinary en la carpeta 'usuarios'
      const imageUrl = await uploadImageToCloudinary(file, "usuarios")

      if (imageUrl) {
        // Actualizamos el estado del formulario con la URL de la imagen
        const urlEvent = {
          target: {
            name: e.target.name,
            value: imageUrl,
          },
        }
        onInputChange(urlEvent)
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
    } finally {
      setImageLoading(false)
    }
  }

  // Asegurar que los selects se desplieguen hacia abajo
  useEffect(() => {
    // Aplicar estilos para forzar que los selects se desplieguen hacia abajo
    const style = document.createElement("style")
    style.innerHTML = `
      .select-container .dropdown-menu {
        max-height: 200px;
        overflow-y: auto;
        top: 100% !important;
        bottom: auto !important;
        transform: translate(0, 0) !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Agrega esta función dentro del componente UserForm
  const validarFormularioUsuario = (formData, isEditMode) => {
    const errores = {}

    // Documento: requerido, 7-12 dígitos, solo números
    if (!formData.documento || !/^\d{7,12}$/.test(formData.documento)) {
      errores.documento = "El documento debe tener entre 7 y 12 dígitos numéricos."
    }

    // Correo: requerido, formato válido
    if (!formData.correo || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.correo)) {
      errores.correo = "Ingrese un correo electrónico válido."
    }

    // Nombre: requerido, mínimo 2 caracteres
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errores.nombre = "El nombre es obligatorio (mínimo 2 caracteres)."
    }

    // Apellido: requerido, mínimo 2 caracteres
    if (!formData.apellido || formData.apellido.trim().length < 2) {
      errores.apellido = "El apellido es obligatorio (mínimo 2 caracteres)."
    }

    // Teléfono: requerido, 7-10 dígitos, solo números
    if (!formData.telefono || !/^\d{7,10}$/.test(formData.telefono)) {
      errores.telefono = "El teléfono debe tener entre 7 y 10 dígitos numéricos."
    }

    // Dirección: requerido, mínimo 5 caracteres
    if (!formData.direccion || formData.direccion.trim().length < 5) {
      errores.direccion = "La dirección es obligatoria (mínimo 5 caracteres)."
    }

    // Rol: requerido
    if (!formData.rol) {
      errores.rol = "Seleccione un rol."
    }

    // Contraseña y confirmación (solo en modo edición o creación)
    if (isEditMode && formData.contrasena) {
      if (formData.contrasena.length < 6) {
        errores.contrasena = "La contraseña debe tener al menos 6 caracteres."
      }
      if (formData.contrasena !== formData.confirmarContrasena) {
        errores.confirmarContrasena = "Las contraseñas no coinciden."
      }
    }

    return errores
  }

  // Modifica la función onSave para usar la validación antes de guardar
  const handleSave = (e) => {
    e.preventDefault()
    const errores = validarFormularioUsuario(formData, isEditMode)

    if (Object.keys(errores).length > 0) {
      // Llama a tu método para setear errores en el formulario
      if (typeof onInputChange === "function") {
        // Si tienes un setFormErrors, úsalo aquí. Si no, adapta según tu lógica.
        // Por ejemplo, podrías tener setFormErrors(errores);
      }
      // Si tienes un método para mostrar errores globales, puedes llamarlo aquí.
      return
    }

    // Si no hay errores, llama a la función original de guardado
    onSave()
  }

  return (
    <div className="modal fade" id="userModal" tabIndex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="userModalLabel">
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
            <form className="form-styled">
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className={`form-control ${formErrors.documento ? "is-invalid" : ""}`}
                      id="documento"
                      name="documento"
                      placeholder="Documento"
                      value={formData.documento}
                      onChange={onInputChange}
                      onBlur={onDocumentoBlur}
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
                  <div className="form-floating mb-2">
                    <input
                      type="email"
                      className={`form-control ${formErrors.correo ? "is-invalid" : ""}`}
                      id="correo"
                      name="correo"
                      placeholder="Correo Electrónico"
                      value={formData.correo}
                      onChange={onInputChange}
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

              <div className="row g-2">
                <div className="col-md-6">
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                      id="nombre"
                      name="nombre"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="nombre">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className={`form-control ${formErrors.apellido ? "is-invalid" : ""}`}
                      id="apellido"
                      name="apellido"
                      placeholder="Apellido"
                      value={formData.apellido}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="apellido">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    {formErrors.apellido && <div className="invalid-feedback">{formErrors.apellido}</div>}
                  </div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <div className="form-floating mb-2">
                    <input
                      type="tel"
                      className={`form-control ${formErrors.telefono ? "is-invalid" : ""}`}
                      id="telefono"
                      name="telefono"
                      placeholder="Teléfono"
                      value={formData.telefono}
                      onChange={onInputChange}
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
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                      id="direccion"
                      name="direccion"
                      placeholder="Dirección"
                      value={formData.direccion}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="direccion">
                      Dirección <span className="text-danger">*</span>
                    </label>
                    {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                  </div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="foto" className="form-label">
                      Foto
                    </label>
                    <div className="file-upload-box">
                      {formData.foto && typeof formData.foto === "string" && formData.foto.trim() !== "" ? (
                        <div className="image-preview-container">
                          <img src={formData.foto || "//vite.svg
"} alt="Vista previa" className="image-preview" />
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
                          <span className="upload-text">{imageLoading ? "Subiendo..." : "Subir imagen"}</span>
                        </label>
                      )}
                      <input
                        type="file"
                        className="file-input"
                        id="foto"
                        name="foto"
                        onChange={handleImageUpload}
                        disabled={isViewMode || imageLoading}
                        accept="image/*"
                      />
                      {formData.foto && typeof formData.foto === "object" && (
                        <small className="form-text text-success">Archivo seleccionado: {formData.foto.name}</small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-2 select-container">
                    <select
                      className={`form-select ${formErrors.rol ? "is-invalid" : ""}`}
                      id="rol"
                      name="rol"
                      value={formData.rol}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="rol">
                      Rol <span className="text-danger">*</span>
                    </label>
                    {formErrors.rol && <div className="invalid-feedback">{formErrors.rol}</div>}
                  </div>
                </div>
              </div>

              {/* Campos de contraseña - SOLO mostrar en modo edición */}
              {isEditMode && (
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="form-group mb-2">
                      <label htmlFor="contrasena" className="form-label">
                        Nueva Contraseña (opcional)
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${formErrors.contrasena ? "is-invalid" : ""}`}
                          id="contrasena"
                          name="contrasena"
                          value={formData.contrasena}
                          onChange={onInputChange}
                          disabled={isViewMode}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isViewMode}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formErrors.contrasena && <div className="invalid-feedback">{formErrors.contrasena}</div>}
                      <small className="form-text text-muted">
                        Dejar en blanco para mantener la contraseña actual.
                      </small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-2">
                      <label htmlFor="confirmarContrasena" className="form-label">
                        Confirmar Contraseña
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${formErrors.confirmarContrasena ? "is-invalid" : ""}`}
                          id="confirmarContrasena"
                          name="confirmarContrasena"
                          value={formData.confirmarContrasena}
                          onChange={onInputChange}
                          disabled={isViewMode}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isViewMode}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formErrors.confirmarContrasena && (
                        <div className="invalid-feedback">{formErrors.confirmarContrasena}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                onClick={handleSave}
                disabled={imageLoading}
              >
                <Save size={18} className="me-1" />
                Guardar Usuario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserForm
