"use client"

import { useState, useRef } from "react"
import { Barcode, Upload, ImageIcon, Check, X, AlertCircle } from "lucide-react"

/**
 * Componente para gestionar variantes de productos
 */
const VarianteProducto = ({ formData, setFormData, formErrors, productoBase, isEditing = false }) => {
  // Referencia al input de archivo
  const fileInputRef = useRef(null)

  // Estado para manejar errores de carga
  const [uploadError, setUploadError] = useState("")

  // Estado para manejar la imagen que se está arrastrando
  const [isDragging, setIsDragging] = useState(false)

  // Máximo de imágenes permitidas
  const MAX_IMAGES = 4

  // Opciones para el select de porcentaje de IVA
  const opcionesIVA = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "19", label: "19%" },
  ]

  // Función para convertir una imagen a base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Función para generar código de barras aleatorio
  const generarCodigoBarras = () => {
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
    setFormData({
      ...formData,
      CodigoBarras: randomBarcode.toString(),
    })
  }

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError("")

    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages =
        typeof formData.FotosProducto === "string" ? JSON.parse(formData.FotosProducto) : [...formData.FotosProducto]
    }

    // Verificar si se excede el límite de imágenes
    if (currentImages.length >= MAX_IMAGES) {
      setUploadError(`Solo se permiten ${MAX_IMAGES} imágenes. Elimina alguna para agregar más.`)
      return
    }

    // Calcular cuántas imágenes más se pueden agregar
    const remainingSlots = MAX_IMAGES - currentImages.length

    // Validar tipos de archivo y tamaño
    const validFiles = []
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
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
      setUploadError(
        `Solo se cargarán ${remainingSlots} de las ${files.length} imágenes seleccionadas debido al límite de ${MAX_IMAGES} imágenes.`,
      )
    }

    // Convertir imágenes a base64
    try {
      // Procesar nuevas imágenes
      for (const file of validFiles) {
        const base64 = await convertToBase64(file)

        // Agregar nueva imagen
        currentImages.push({
          url: base64,
          nombre: file.name,
          principal: currentImages.length === 0, // Primera imagen es la principal
        })
      }

      // Actualizar formData
      setFormData({
        ...formData,
        FotosProducto: currentImages,
      })

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error al procesar imágenes:", error)
      setUploadError("Error al procesar las imágenes")
    }
  }

  // Función para eliminar una imagen
  const handleRemoveImage = (index) => {
    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages =
        typeof formData.FotosProducto === "string" ? JSON.parse(formData.FotosProducto) : [...formData.FotosProducto]
    }

    // Verificar si la imagen a eliminar es la principal
    const isRemovingPrincipal = currentImages[index]?.principal

    // Eliminar imagen
    currentImages.splice(index, 1)

    // Si eliminamos la principal y hay más imágenes, establecer la primera como principal
    if (isRemovingPrincipal && currentImages.length > 0) {
      currentImages[0].principal = true
    }

    // Actualizar formData
    setFormData({
      ...formData,
      FotosProducto: currentImages,
    })

    // Limpiar error si existe
    setUploadError("")
  }

  // Función para establecer una imagen como principal
  const handleSetPrincipal = (index) => {
    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages =
        typeof formData.FotosProducto === "string" ? JSON.parse(formData.FotosProducto) : [...formData.FotosProducto]
    }

    // Actualizar estado principal
    currentImages = currentImages.map((img, i) => ({
      ...img,
      principal: i === index,
    }))

    // Actualizar formData
    setFormData({
      ...formData,
      FotosProducto: currentImages,
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
        files,
      },
    }

    handleImageUpload(fileList)
  }

  // Obtener imágenes como array
  const getImagesArray = () => {
    if (!formData.FotosProducto) return []

    return typeof formData.FotosProducto === "string" ? JSON.parse(formData.FotosProducto) : formData.FotosProducto
  }

  const imagesArray = getImagesArray()

  // Verificar si se alcanzó el límite de imágenes
  const isMaxImagesReached = imagesArray.length >= MAX_IMAGES

  // Función para agregar una característica
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState("")

  const handleAddCaracteristica = () => {
    if (!nuevaCaracteristica.trim()) return

    // Convertir el string de características a array si es necesario
    let caracteristicasActuales = []
    if (formData.Caracteristicas) {
      caracteristicasActuales =
        typeof formData.Caracteristicas === "string"
          ? formData.Caracteristicas.split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [...formData.Caracteristicas]
    }

    // Verificar si la característica ya existe
    if (caracteristicasActuales.includes(nuevaCaracteristica.trim())) {
      return // Podría mostrar un mensaje de error
    }

    // Agregar la nueva característica
    caracteristicasActuales.push(nuevaCaracteristica.trim())

    setFormData({
      ...formData,
      Caracteristicas: caracteristicasActuales,
    })
    setNuevaCaracteristica("")
  }

  // Función para eliminar una característica
  const handleRemoveCaracteristica = (index) => {
    // Convertir el string de características a array si es necesario
    let caracteristicasActuales = []
    if (formData.Caracteristicas) {
      caracteristicasActuales =
        typeof formData.Caracteristicas === "string"
          ? formData.Caracteristicas.split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [...formData.Caracteristicas]
    }

    caracteristicasActuales.splice(index, 1)

    setFormData({
      ...formData,
      Caracteristicas: caracteristicasActuales,
    })
  }

  // Obtener las características como array
  const getCaracteristicasArray = () => {
    if (!formData.Caracteristicas) return []

    return typeof formData.Caracteristicas === "string"
      ? formData.Caracteristicas.split(",")
          .map((item) => item.trim())
          .filter((item) => item)
      : formData.Caracteristicas
  }

  const caracteristicasArray = getCaracteristicasArray()

  // Calcular el valor del IVA y el precio final
  const calcularPrecios = () => {
    if (!formData.Precio) return { precioVenta: 0, valorIVA: 0, precioConIVA: 0 }

    const precio = Number.parseFloat(formData.Precio) || 0
    const margen = formData.MargenGanancia ? Number.parseFloat(formData.MargenGanancia) : 0

    // Calcular precio de venta (con margen)
    const precioVenta = precio * (1 + margen / 100)

    // Calcular IVA si aplica
    const valorIVA = formData.AplicaIVA ? precioVenta * (Number.parseFloat(formData.PorcentajeIVA || 0) / 100) : 0

    // Calcular precio final
    const precioConIVA = precioVenta + valorIVA

    return {
      precioVenta: precioVenta.toFixed(2),
      valorIVA: valorIVA.toFixed(2),
      precioConIVA: precioConIVA.toFixed(2),
    }
  }

  const { precioVenta, valorIVA, precioConIVA } = calcularPrecios()

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">{isEditing ? "Editar Variante" : "Nueva Variante de Producto"}</h5>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Información General</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Nombre de la variante */}
            <div className="col-md-12">
              <label htmlFor="NombreProducto" className="form-label">
                Nombre de la Variante <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.NombreProducto ? "is-invalid" : ""}`}
                id="NombreProducto"
                name="NombreProducto"
                value={formData.NombreProducto || ""}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              {formErrors.NombreProducto && <div className="invalid-feedback">{formErrors.NombreProducto}</div>}
            </div>
          </div>

          {/* Descripción */}
          <div className="row mb-3">
            <div className="col-12">
              <label htmlFor="Descripcion" className="form-label mb-0">
                Descripción
              </label>
              <textarea
                className={`form-control ${formErrors.Descripcion ? "is-invalid" : ""}`}
                id="Descripcion"
                name="Descripcion"
                value={formData.Descripcion || ""}
                onChange={handleInputChange}
                rows={3}
                placeholder=""
              ></textarea>
              {formErrors.Descripcion && <div className="invalid-feedback">{formErrors.Descripcion}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Inventario</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Stock */}
            <div className="col-md-6">
              <label htmlFor="Stock" className="form-label">
                Stock Inicial <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.Stock ? "is-invalid" : ""}`}
                id="Stock"
                name="Stock"
                value={formData.Stock || ""}
                onChange={handleInputChange}
                placeholder=""
                min="0"
                step="0.01"
                required
              />
              {formErrors.Stock && <div className="invalid-feedback">{formErrors.Stock}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Precios</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Precio */}
            <div className="col-md-4">
              <label htmlFor="Precio" className="form-label mb-0">
                Precio
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className={`form-control ${formErrors.Precio ? "is-invalid" : ""}`}
                  id="Precio"
                  name="Precio"
                  value={formData.Precio || ""}
                  onChange={handleInputChange}
                  placeholder=""
                  min="0"
                  step="0.01"
                />
              </div>
              {formErrors.Precio && <div className="invalid-feedback">{formErrors.Precio}</div>}
            </div>

            {/* Margen de Ganancia */}
            <div className="col-md-4">
              <label htmlFor="MargenGanancia" className="form-label mb-0">
                Margen de Ganancia (%)
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className={`form-control ${formErrors.MargenGanancia ? "is-invalid" : ""}`}
                  id="MargenGanancia"
                  name="MargenGanancia"
                  value={formData.MargenGanancia || ""}
                  onChange={handleInputChange}
                  placeholder=""
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="input-group-text">%</span>
              </div>
              {formErrors.MargenGanancia && <div className="invalid-feedback">{formErrors.MargenGanancia}</div>}
            </div>

            {/* Precio de Venta (calculado) */}
            <div className="col-md-4">
              <label htmlFor="PrecioVenta" className="form-label">
                Precio de Venta
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input type="text" className="form-control" id="PrecioVenta" value={precioVenta} readOnly />
              </div>
              <small className="text-muted">Calculado automáticamente</small>
            </div>
          </div>

          <div className="row mb-3">
            {/* Aplica IVA */}
            <div className="col-md-4">
              <label className="form-label mb-0">IVA</label>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="AplicaIVA"
                  name="AplicaIVA"
                  checked={formData.AplicaIVA || false}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="AplicaIVA">
                  Aplica IVA
                </label>
              </div>
            </div>

            {/* Porcentaje de IVA (solo si aplica IVA) */}
            {formData.AplicaIVA && (
              <div className="col-md-4">
                <label htmlFor="PorcentajeIVA" className="form-label">
                  Porcentaje de IVA
                </label>
                <select
                  className={`form-select ${formErrors.PorcentajeIVA ? "is-invalid" : ""}`}
                  id="PorcentajeIVA"
                  name="PorcentajeIVA"
                  value={formData.PorcentajeIVA || "0"}
                  onChange={handleInputChange}
                >
                  {opcionesIVA.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                {formErrors.PorcentajeIVA && <div className="invalid-feedback">{formErrors.PorcentajeIVA}</div>}
              </div>
            )}

            {/* Precio con IVA (calculado) */}
            {formData.AplicaIVA && (
              <div className="col-md-4">
                <label htmlFor="PrecioConIVA" className="form-label">
                  Precio con IVA
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input type="text" className="form-control" id="PrecioConIVA" value={precioConIVA} readOnly />
                </div>
                <small className="text-muted">Incluye margen e IVA</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Identificación</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Código de Barras */}
            <div className="col-md-6">
              <label htmlFor="CodigoBarras" className="form-label">
                Código de Barras
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${formErrors.CodigoBarras ? "is-invalid" : ""}`}
                  id="CodigoBarras"
                  name="CodigoBarras"
                  value={formData.CodigoBarras || ""}
                  onChange={handleInputChange}
                  placeholder=""
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={generarCodigoBarras}
                  title="Generar código de barras"
                >
                  <Barcode size={16} />
                </button>
              </div>
              {formErrors.CodigoBarras && <div className="invalid-feedback">{formErrors.CodigoBarras}</div>}
              <small className="text-muted">Se requiere código de barras o referencia</small>
            </div>

            {/* Referencia */}
            <div className="col-md-6">
              <label htmlFor="Referencia" className="form-label">
                Referencia
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.Referencia ? "is-invalid" : ""}`}
                id="Referencia"
                name="Referencia"
                value={formData.Referencia || ""}
                onChange={handleInputChange}
                placeholder=""
              />
              {formErrors.Referencia && <div className="invalid-feedback">{formErrors.Referencia}</div>}
              <small className="text-muted">Código único para identificar la variante</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Características</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-10">
              <label htmlFor="nuevaCaracteristica" className="form-label">
                Nueva Característica
              </label>
              <input
                type="text"
                className="form-control"
                id="nuevaCaracteristica"
                value={nuevaCaracteristica}
                onChange={(e) => setNuevaCaracteristica(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddCaracteristica}
                disabled={!nuevaCaracteristica.trim()}
              >
                <X size={18} className="me-1" />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de características */}
          {caracteristicasArray.length > 0 ? (
            <div className="list-group">
              {caracteristicasArray.map((caracteristica, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {caracteristica}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveCaracteristica(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-light">No hay características agregadas</div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Imágenes de la Variante</h6>
        </div>
        <div className="card-body">
          {/* Contador de imágenes */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              Imágenes: {imagesArray.length} de {MAX_IMAGES}
            </h6>
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
              className={`upload-area border rounded p-4 text-center mb-3 ${isDragging ? "bg-light border-primary" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ cursor: "pointer", minHeight: "150px" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <div className="py-3">
                <Upload size={48} className="text-muted mb-2" />
                <h5>Arrastra y suelta imágenes aquí</h5>
                <p className="text-muted">o haz clic para seleccionar archivos</p>
                <p className="small text-muted">
                  Formatos permitidos: JPG, PNG, GIF, WEBP
                  <br />
                  Tamaño máximo: 5MB por imagen
                  <br />
                  Máximo {MAX_IMAGES} imágenes en total
                </p>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning mb-3">
              <div className="d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                  <strong>Límite de imágenes alcanzado</strong>
                  <p className="mb-0">
                    Has alcanzado el límite de {MAX_IMAGES} imágenes. Elimina alguna para agregar más.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {uploadError && <div className="alert alert-danger">{uploadError}</div>}

          {/* Mensaje de error de validación */}
          {formErrors.FotosProducto && <div className="alert alert-danger">{formErrors.FotosProducto}</div>}

          {/* Previsualización de imágenes */}
          <div className="row g-3">
            {/* Imágenes cargadas */}
            {imagesArray.map((image, index) => (
              <div key={index} className="col-md-3 col-sm-6 col-6">
                <div className={`card h-100 ${image.principal ? "border-primary" : ""}`}>
                  <div className="position-relative">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.nombre || `Imagen ${index + 1}`}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                    {image.principal && (
                      <div className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded-pill">
                        <small>Principal</small>
                      </div>
                    )}
                  </div>
                  <div className="card-body p-2">
                    <p className="card-text small text-truncate">{image.nombre || `Imagen ${index + 1}`}</p>
                    <div className="d-flex justify-content-between">
                      {!image.principal && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleSetPrincipal(index)}
                          title="Establecer como imagen principal"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-auto"
                        onClick={() => handleRemoveImage(index)}
                        title="Eliminar imagen"
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
                    minHeight: "220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isMaxImagesReached ? "default" : "pointer",
                    borderStyle: "dashed",
                  }}
                  onClick={() => !isMaxImagesReached && fileInputRef.current?.click()}
                >
                  <div className="text-center text-muted p-3">
                    <ImageIcon size={32} className="mb-2" />
                    <p className="mb-0">Espacio disponible</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VarianteProducto
