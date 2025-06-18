"use client"

import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Check, AlertCircle, Loader } from 'lucide-react'

/**
 * Componente para gestionar las imágenes del producto
 * Limitado a 4 imágenes máximo
 * La lógica de Cloudinary se maneja en el componente padre
 */
const ImagenesProducto = ({
  formData,
  setFormData,
  formErrors,
  imagenes,
  imagenesPreview,
  onImageUpload,
  onRemoveImage,
  imagenesLoading
}) => {
  // Referencia al input de archivo
  const fileInputRef = useRef(null)
  
  // Estado para manejar errores de carga
  const [uploadError, setUploadError] = useState("")
  
  // Estado para manejar la imagen que se está arrastrando
  const [isDragging, setIsDragging] = useState(false)

  // Máximo de imágenes permitidas
  const MAX_IMAGES = 4

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadError("")
    
    // Obtener imágenes actuales del array de imagenes del componente padre
    const currentImagesCount = imagenes.filter(img => img !== null).length
    
    // Verificar si se excede el límite de imágenes
    if (currentImagesCount >= MAX_IMAGES) {
      setUploadError(`Solo se permiten ${MAX_IMAGES} imágenes. Elimina alguna para agregar más.`)
      return
    }
    
    // Calcular cuántas imágenes más se pueden agregar
    const remainingSlots = MAX_IMAGES - currentImagesCount
    
    // Validar tipos de archivo y tamaño
    const validFiles = []
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setUploadError("Solo se permiten archivos de imagen")
        return
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("El tamaño máximo por imagen es de 5MB")
        return
      }
      
      validFiles.push(file)
    }
    
    // Mostrar advertencia si se intentaron cargar más imágenes de las permitidas
    if (files.length > remainingSlots) {
      setUploadError(`Solo se cargarán ${remainingSlots} de las ${files.length} imágenes seleccionadas debido al límite de ${MAX_IMAGES} imágenes.`)
    }
    
    try {
      // Procesar nuevas imágenes - delegar al componente padre
      for (const file of validFiles) {
        // Encontrar el primer índice disponible
        const availableIndex = imagenes.findIndex(img => img === null)
        if (availableIndex !== -1) {
          // Delegar la carga al componente padre
          onImageUpload({ target: { files: [file] } }, availableIndex)
        }
      }
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error general al procesar imágenes:", error)
      setUploadError("Error al subir las imágenes: " + error.message)
    }
  }

  // Función para eliminar una imagen
  const handleRemoveImage = (index) => {
    // Delegar al componente padre
    onRemoveImage(index)
    
    // Limpiar error si existe
    setUploadError("")
  }

  // Función para establecer una imagen como principal
  const handleSetPrincipal = (index) => {
    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages = typeof formData.FotosProducto === 'string'
        ? JSON.parse(formData.FotosProducto)
        : [...formData.FotosProducto]
    }
    
    // Actualizar estado principal
    currentImages = currentImages.map((img, i) => ({
      ...img,
      principal: i === index
    }))
    
    // Actualizar formData
    setFormData({
      ...formData,
      FotosProducto: currentImages
    })
  }

  // Función para manejar el arrastre de archivos
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    
    // Crear un objeto similar a e.target.files para reutilizar handleImageUpload
    const fileList = {
      target: {
        files
      }
    }
    
    handleImageUpload(fileList)
  }

  // Obtener imágenes como array - usar tanto formData como imagenes del padre
  const getImagesArray = () => {
    // Si hay imágenes en formData.FotosProducto (para compatibilidad con variantes)
    if (formData.FotosProducto && Array.isArray(formData.FotosProducto) && formData.FotosProducto.length > 0) {
      return formData.FotosProducto
    }
    
    // Si hay imágenes en formData.FotosProducto como string
    if (formData.FotosProducto && typeof formData.FotosProducto === 'string') {
      try {
        return JSON.parse(formData.FotosProducto)
      } catch {
        return []
      }
    }
    
    // Usar las imágenes del componente padre como fallback
    return imagenes.map((img, index) => {
      if (img === null) return null
      return {
        url: imagenesPreview[index] || img,
        nombre: typeof img === 'string' ? `Imagen ${index + 1}` : img.name,
        principal: index === 0,
        isUploading: imagenesLoading[index] || false
      }
    }).filter(img => img !== null)
  }

  const imagesArray = getImagesArray()
  
  // Verificar si se alcanzó el límite de imágenes
  const isMaxImagesReached = imagesArray.length >= MAX_IMAGES
  
  // Verificar si hay imágenes cargando
  const isUploading = imagenesLoading.some(loading => loading) || imagesArray.some(img => img.isUploading)

  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Imágenes del Producto</h6>
            {isUploading && (
              <div className="d-flex align-items-center text-primary">
                <Loader size={16} className="me-1 animate-spin" />
                <small>Subiendo imágenes...</small>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {/* Contador de imágenes */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Imágenes: {imagesArray.length} de {MAX_IMAGES}</h6>
            {isMaxImagesReached && (
              <span className="badge bg-warning text-dark">
                <AlertCircle size={14} className="me-1" />
                Límite alcanzado
              </span>
            )}
          </div>

          {/* Área de carga de imágenes */}
          {!isMaxImagesReached ? (
            <div 
              className={`upload-area border rounded p-4 text-center mb-3 ${isDragging ? 'bg-light border-primary' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ cursor: isUploading ? 'wait' : 'pointer', minHeight: '150px' }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <div className="py-3">
                {isUploading ? (
                  <>
                    <Loader size={48} className="text-primary mb-2 animate-spin" />
                    <h5>Subiendo imágenes</h5>
                    <p className="text-muted">Por favor, espera mientras se completa la carga</p>
                  </>
                ) : (
                  <>
                    <Upload size={48} className="text-muted mb-2" />
                    <h5>Arrastra y suelta imágenes aquí</h5>
                    <p className="text-muted">o haz clic para seleccionar archivos</p>
                    <p className="small text-muted">
                      Formatos permitidos: JPG, PNG, GIF, WEBP<br />
                      Tamaño máximo: 5MB por imagen<br />
                      Máximo {MAX_IMAGES} imágenes en total
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-warning mb-3">
              <div className="d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                  <strong>Límite de imágenes alcanzado</strong>
                  <p className="mb-0">Has alcanzado el límite de {MAX_IMAGES} imágenes. Elimina alguna para agregar más.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {uploadError && (
            <div className="alert alert-danger">{uploadError}</div>
          )}
          
          {/* Mensaje de error de validación */}
          {formErrors.FotosProducto && (
            <div className="alert alert-danger">{formErrors.FotosProducto}</div>
          )}

          {/* Previsualización de imágenes */}
          {imagesArray.length > 0 ? (
            <div className="row g-3">
              {imagesArray.map((image, index) => (
                <div key={index} className="col-md-3 col-sm-6 col-6">
                  <div className={`card h-100 ${image.principal ? 'border-primary' : ''}`}>
                    <div className="position-relative">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.nombre || `Imagen ${index + 1}`}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      {image.principal && (
                        <div className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded-pill">
                          <small>Principal</small>
                        </div>
                      )}
                      {image.isUploading && (
                        <div className="position-absolute top-0 end-0 bg-dark bg-opacity-50 text-white px-2 py-1 m-2 rounded-pill">
                          <div className="d-flex align-items-center">
                            <Loader size={12} className="me-1 animate-spin" />
                            <small>Subiendo...</small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-body p-2">
                      <p className="card-text small text-truncate">
                        {image.nombre || `Imagen ${index + 1}`}
                      </p>
                      <div className="d-flex justify-content-between">
                        {!image.principal && !image.isUploading && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSetPrincipal(index)}
                            title="Establecer como imagen principal"
                            disabled={image.isUploading}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-auto"
                          onClick={() => handleRemoveImage(index)}
                          title="Eliminar imagen"
                          disabled={image.isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Espacios vacíos para completar la cuadrícula */}
              {Array.from({ length: MAX_IMAGES - imagesArray.length }).map((_, index) => (
                <div key={`empty-${index}`} className="col-md-3 col-sm-6 col-6">
                  <div 
                    className="card h-100 bg-light border-dashed"
                    style={{ 
                      minHeight: '220px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: isMaxImagesReached || isUploading ? 'default' : 'pointer',
                      borderStyle: 'dashed'
                    }}
                    onClick={() => !isMaxImagesReached && !isUploading && fileInputRef.current?.click()}
                  >
                    <div className="text-center text-muted p-3">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="mb-0">Espacio disponible</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-3">
              {/* Mostrar 4 espacios vacíos cuando no hay imágenes */}
              {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                <div key={`empty-${index}`} className="col-md-3 col-sm-6 col-6">
                  <div 
                    className="card h-100 bg-light border-dashed"
                    style={{ 
                      minHeight: '220px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: isUploading ? 'wait' : 'pointer',
                      borderStyle: 'dashed'
                    }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <div className="text-center text-muted p-3">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="mb-0">Espacio disponible</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Nota informativa sobre imágenes */}
          <div className="alert alert-info mt-3">
            <small>
              <strong>Nota:</strong> Las imágenes se suben automáticamente para su almacenamiento seguro.
              Para obtener mejores resultados, use imágenes de al menos 800x800 píxeles con fondo blanco.
              Tamaño máximo: 5MB por imagen.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

// Ejemplo para el formulario principal de productos o variantes

const validarFormularioProducto = (formData, imagenes) => {
  const errores = {}

  // Nombre: requerido, mínimo 3, máximo 100
  if (!formData.NombreProducto || formData.NombreProducto.trim().length < 3) {
    errores.NombreProducto = "El nombre es obligatorio y debe tener al menos 3 caracteres."
  } else if (formData.NombreProducto.length > 100) {
    errores.NombreProducto = "El nombre no puede superar los 100 caracteres."
  }

  // Categoría: requerida
  if (!formData.IdCategoriaDeProducto) {
    errores.IdCategoriaDeProducto = "Seleccione una categoría."
  }

  // Descripción: opcional, máximo 500
  if (formData.Descripcion && formData.Descripcion.length > 500) {
    errores.Descripcion = "La descripción no puede superar los 500 caracteres."
  }

  // Stock: requerido, numérico, >= 0
  if (formData.Stock === undefined || formData.Stock === "" || isNaN(formData.Stock) || Number(formData.Stock) < 0) {
    errores.Stock = "El stock es obligatorio y debe ser un número mayor o igual a 0."
  }

  // Precio: requerido, numérico, > 0
  if (formData.Precio === undefined || formData.Precio === "" || isNaN(formData.Precio) || Number(formData.Precio) <= 0) {
    errores.Precio = "El precio es obligatorio y debe ser mayor a 0."
  }

  // Margen de ganancia: opcional, 0-100
  if (formData.MargenGanancia && (isNaN(formData.MargenGanancia) || formData.MargenGanancia < 0 || formData.MargenGanancia > 100)) {
    errores.MargenGanancia = "El margen de ganancia debe estar entre 0 y 100."
  }

  // Aplica IVA: si aplica, porcentaje requerido
  if (formData.AplicaIVA && (!formData.PorcentajeIVA || isNaN(formData.PorcentajeIVA))) {
    errores.PorcentajeIVA = "Seleccione un porcentaje de IVA válido."
  }

  // Código de barras o referencia: al menos uno requerido
  if (!formData.CodigoBarras && !formData.Referencia) {
    errores.CodigoBarras = "Debe ingresar código de barras o referencia."
    errores.Referencia = "Debe ingresar código de barras o referencia."
  }

  // Características: opcional, máximo 10
  if (formData.Caracteristicas && Array.isArray(formData.Caracteristicas) && formData.Caracteristicas.length > 10) {
    errores.Caracteristicas = "Máximo 10 características por producto."
  }

  // Imágenes: al menos 1, máximo 4
  if (!imagenes || imagenes.length === 0 || imagenes.every(img => !img)) {
    errores.FotosProducto = "Debe agregar al menos una imagen."
  } else if (imagenes.length > 4) {
    errores.FotosProducto = "Solo se permiten hasta 4 imágenes."
  }

  // Validar cada imagen (si tienes el array de archivos)
  // for (const img of imagenes) {
  //   if (img && img.size > 5 * 1024 * 1024) {
  //     errores.FotosProducto = "Cada imagen debe pesar máximo 5MB."
  //     break
  //   }
  // }

  return errores
}

export default ImagenesProducto