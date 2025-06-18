"use client"

import { ImageIcon, X } from "lucide-react"

/**
 * Componente para la sección de imágenes del servicio
 */
const ImagesSection = ({ imagenes, imagenesPreview, formErrors, onImageUpload, onRemoveImage }) => {
  return (
    <div className="mt-3">
      <label className="form-label small mb-1">
        Fotos del Servicio (Máximo 4) <span className="text-danger">*</span>
      </label>
      {formErrors.imagenes && <div className="invalid-feedback d-block small mb-2">{formErrors.imagenes}</div>}

      <div className="row g-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="col-md-3 col-6">
            <div
              className="border rounded p-2 text-center position-relative"
              style={{
                height: "120px",
                background: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imagenesPreview[index] ? (
                <>
                  <img
                    src={imagenesPreview[index] || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    className="img-fluid"
                    style={{ maxHeight: "100px", maxWidth: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 m-1"
                    style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                    onClick={() => onRemoveImage(index)}
                    title="Eliminar imagen"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <label htmlFor={`imagen${index}`} className="btn btn-sm btn-outline-secondary mb-1">
                    <ImageIcon size={16} className="me-1" />
                    <span className="small">Imagen {index + 1}</span>
                  </label>
                  <input
                    type="file"
                    className="d-none"
                    id={`imagen${index}`}
                    onChange={(e) => onImageUpload(e, index)}
                    accept="image/*"
                  />
                  {index === 0 && <small className="d-block text-muted">Principal</small>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <small className="text-muted d-block mt-1">
        Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen. La primera imagen será la principal del
        servicio.
      </small>
    </div>
  )
}

export default ImagesSection
