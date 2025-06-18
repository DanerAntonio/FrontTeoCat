"use client"
import { FiEdit2, FiCamera, FiCheck } from "react-icons/fi"
import { useState } from "react"

/**
 * Componente para la sección de imagen de perfil
 */
const ProfileImageSection = ({
  userData,
  editMode,
  fileInputRef,
  handleImageClick,
  handleImageChange,
  toggleEditMode,
  isUploading = false, // Añadir prop para indicar si la imagen está cargando
}) => {
  const [imageError, setImageError] = useState(false)

  // Imagen base64 por defecto (un simple icono de usuario)
  const defaultImageBase64 =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlOWVjZWYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iIzZjNzU3ZCIvPjxwYXRoIGQ9Ik0yNSw4NWMwLTIwLDExLjUtMjUsMjUtMjVzMjUsNSwyNSwyNXoiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4="

  /**
   * Maneja errores de carga de imagen
   */
  const handleImageError = (e) => {
    console.error("Error al cargar la imagen de perfil, usando imagen por defecto")
    setImageError(true)
    e.target.src = defaultImageBase64
  }

  /**
   * Determina la URL de la imagen a mostrar
   */
  const getImageUrl = () => {
    if (imageError || !userData.Foto) {
      return defaultImageBase64
    }
    return userData.Foto
  }

  return (
    <div className="col-md-3 text-center mb-4 mb-md-0">
      <div className="d-flex flex-column align-items-center">
        <div
          className="position-relative mx-auto mb-3"
          onClick={handleImageClick}
          style={{
            cursor: editMode.Foto ? "pointer" : "default",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src={getImageUrl() || "/placeholder.svg"}
            alt="Foto de perfil"
            className="img-fluid rounded-circle border"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={handleImageError}
          />
          {editMode.Foto && (
            <div
              className="position-absolute d-flex flex-column justify-content-center align-items-center text-white"
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                transition: "opacity 0.3s ease",
              }}
            >
              <FiCamera size={24} />
              <span className="mt-2 small">Cambiar foto</span>
            </div>
          )}

          {/* Indicador de carga mejorado */}
          {isUploading && (
            <div
              className="position-absolute d-flex flex-column justify-content-center align-items-center text-white"
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 2,
              }}
            >
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <span className="mt-2 small">Subiendo imagen...</span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="d-none"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploading}
        />
        <button
          type="button"
          className={`btn ${editMode.Foto ? "btn-success" : "btn-outline-primary"} btn-sm mt-2`}
          onClick={() => toggleEditMode("Foto")}
          disabled={isUploading}
        >
          {editMode.Foto ? (
            <>
              <FiCheck className="me-1" /> Listo
            </>
          ) : (
            <>
              <FiEdit2 className="me-1" /> Cambiar foto
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProfileImageSection
