"use client"

import { useState, useEffect, useRef } from "react"
import { Save, ArrowLeft } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import IncludesSection from "../../../Components/AdminComponents/ServiciosComponents/IncludesSection"
import ImagesSection from "../../../Components/AdminComponents/ServiciosComponents/ImagesSection"
import serviciosService from "../../../Services/ConsumoAdmin/serviciosService.js"
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from "../../../Services/uploadImageToCloudinary.js"
import { useLocation } from "react-router-dom"

/**
 * Componente para la sección de información básica del servicio
 */
const BasicInfoSection = ({ formData, formErrors, tiposServicio, handleInputChange, loading, isEditing }) => {
  return (
    <div className="mb-3">
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <label htmlFor="idTipoServicio" className="form-label small mb-1">
            Tipo de Servicio <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select form-select-sm ${formErrors.idTipoServicio ? "is-invalid" : ""}`}
            id="idTipoServicio"
            name="idTipoServicio"
            value={formData.idTipoServicio}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione un tipo</option>
            {tiposServicio.map((tipo) => (
              <option key={tipo.IdTipoServicio} value={tipo.IdTipoServicio}>
                {tipo.Nombre}
              </option>
            ))}
          </select>
          {formErrors.idTipoServicio && <div className="invalid-feedback small">{formErrors.idTipoServicio}</div>}
          {loading && <small className="text-muted">Cargando tipos...</small>}
        </div>
        <div className="col-md-6">
          <label htmlFor="duracion" className="form-label small mb-1">
            Duración (min) <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control form-control-sm ${formErrors.duracion ? "is-invalid" : ""}`}
            id="duracion"
            name="duracion"
            value={formData.duracion}
            onChange={handleInputChange}
            min="1"
            required
            placeholder="Ej: 30"
          />
          {formErrors.duracion && <div className="invalid-feedback small">{formErrors.duracion}</div>}
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="nombre" className="form-label small mb-1">
          Nombre del Servicio <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control form-control-sm ${formErrors.nombre ? "is-invalid" : ""}`}
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          placeholder="Ingrese el nombre del servicio"
          maxLength={100}
        />
        {formErrors.nombre && <div className="invalid-feedback small">{formErrors.nombre}</div>}
        <small className="form-text text-muted small">Máximo 100 caracteres.</small>
      </div>

      <div className="mb-2">
        <label htmlFor="descripcion" className="form-label small mb-1">
          Descripción
        </label>
        <textarea
          className="form-control form-control-sm"
          id="descripcion"
          name="descripcion"
          rows="3"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Ingrese la descripción del servicio"
          maxLength={500}
        />
        <small className="text-muted small">Máximo 500 caracteres. {formData.descripcion.length}/500</small>
      </div>
    </div>
  )
}

/**
 * Componente para registrar un nuevo servicio o editar uno existente
 */
const RegistrarServicio = () => {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    idTipoServicio: "",
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "0",
    queIncluye: [],
  })

  // Estado para manejar las imágenes
  const [imagenes, setImagenes] = useState([null, null, null, null])
  const [imagenesPreview, setImagenesPreview] = useState([null, null, null, null])
  const [imagenesLoading, setImagenesLoading] = useState([false, false, false, false])

  // Estado para que incluye
  const [nuevoQueIncluye, setNuevoQueIncluye] = useState({
    nombre: "",
    valor: "",
  })

  // Estado para los tipos de servicio
  const [tiposServicio, setTiposServicio] = useState([])
  const [loadingTipos, setLoadingTipos] = useState(true)

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    idTipoServicio: "",
    nombre: "",
    duracion: "",
    precio: "",
    imagenes: "",
  })

  // Estado para controlar si estamos editando o creando
  const [isEditing, setIsEditing] = useState(false)
  const [servicioId, setServicioId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Obtener el ID del servicio de la URL si existe
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const idFromUrl = queryParams.get("id")

  /**
   * Efecto para inicializar que incluye si no existe
   * y cargar tipos de servicio
   */
  useEffect(() => {
    if (!formData.queIncluye) {
      setFormData({
        ...formData,
        queIncluye: [],
      })
    }

    // Cargar tipos de servicio desde la API
    fetchTiposServicio()

    // Si hay un ID en la URL, cargar el servicio para editar
    if (idFromUrl) {
      setIsEditing(true)
      setServicioId(idFromUrl)
      fetchServicio(idFromUrl)
    }
  }, [idFromUrl])

  /**
   * Función para cargar un servicio específico para editar
   */
  const fetchServicio = async (id) => {
    setLoading(true)
    try {
      const servicio = await serviciosService.obtenerPorId(id)

      // Procesar que_incluye
      const queIncluye = []
      if (servicio.Que_incluye) {
        try {
          servicio.Que_incluye.split(", ").forEach((item) => {
            const [nombre, valor] = item.split(": ")
            if (nombre && valor) {
              queIncluye.push({ nombre, valor })
            }
          })
        } catch (error) {
          console.error("Error al procesar Que_incluye:", error)
        }
      }

      // Procesar imágenes
      const imagenesArray = [null, null, null, null]
      const imagenesPreviewArray = [null, null, null, null]

      if (servicio.Foto) {
        const urls = servicio.Foto.split("|")
          .map((url) => url.trim())
          .filter((url) => url)
        urls.forEach((url, index) => {
          if (index < 4) {
            imagenesArray[index] = url
            imagenesPreviewArray[index] = url
          }
        })
      }

      // Actualizar el estado
      setFormData({
        idTipoServicio: servicio.IdTipoServicio.toString(),
        nombre: servicio.Nombre || "",
        descripcion: servicio.Descripcion || "",
        precio: servicio.Precio.toString(),
        duracion: servicio.Duracion.toString(),
        queIncluye,
      })

      setImagenes(imagenesArray)
      setImagenesPreview(imagenesPreviewArray)
    } catch (error) {
      console.error(`Error al cargar el servicio ${id}:`, error)
      toast.error("No se pudo cargar la información del servicio")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para cargar tipos de servicio desde la API
   */
  const fetchTiposServicio = async () => {
    setLoadingTipos(true)
    try {
      // Usar el método obtenerTipos del servicio actualizado
      const data = await serviciosService.obtenerTipos()
      setTiposServicio(data)
    } catch (error) {
      console.error("Error al cargar tipos de servicio:", error)
      toast.error("No se pudieron cargar los tipos de servicio")
    } finally {
      setLoadingTipos(false)
    }
  }

  /**
   * Manejador para cambios en los inputs del formulario
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else if (type === "file") {
      // Si es un input de tipo file, guardar el archivo
      if (files && files[0]) {
        setFormData({
          ...formData,
          [name]: files[0],
        })
      }
    } else if (name === "idTipoServicio") {
      // Si cambia el tipo de servicio, actualizar también la descripción
      const servicioSeleccionado = tiposServicio.find((tipo) => tipo.IdTipoServicio.toString() === value)

      if (servicioSeleccionado) {
        setFormData({
          ...formData,
          idTipoServicio: value,
          nombre: isEditing ? formData.nombre : servicioSeleccionado.Nombre, // Solo auto-completar si no estamos editando
          descripcion: servicioSeleccionado.Descripcion || "",
        })
      } else {
        setFormData({
          ...formData,
          idTipoServicio: value,
        })
      }
    } else {
      // Para otros tipos de input, guardar el valor
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Limpiar el error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  /**
   * Manejador para subir imágenes
   * @param {Event} e - Evento del input file
   * @param {Number} index - Índice de la imagen (0-3)
   */
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, seleccione un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.")
        return
      }

      // Crear una copia de los arrays
      const newImagenes = [...imagenes]
      const newImagenesPreview = [...imagenesPreview]
      const newImagenesLoading = [...imagenesLoading]

      // Actualizar la imagen y su vista previa local temporal
      newImagenes[index] = file
      newImagenesPreview[index] = URL.createObjectURL(file)

      // Indicar que esta imagen está cargando
      newImagenesLoading[index] = true
      setImagenesLoading(newImagenesLoading)

      // Actualizar los estados con la vista previa local
      setImagenes(newImagenes)
      setImagenesPreview(newImagenesPreview)

      // Limpiar el error de imágenes si existía
      if (formErrors.imagenes) {
        setFormErrors({
          ...formErrors,
          imagenes: "",
        })
      }

      try {
        // Subir la imagen a Cloudinary
        const imageUrl = await uploadImageToCloudinary(file, "servicios")

        if (!imageUrl) {
          throw new Error("Error al subir la imagen a Cloudinary")
        }

        // Optimizar la URL para mejor rendimiento
        const optimizedUrl = optimizeCloudinaryUrl(imageUrl)

        // Actualizar la vista previa con la URL del servidor
        const updatedImagenesPreview = [...imagenesPreview]

        // Revocar la URL temporal para liberar memoria
        if (newImagenesPreview[index] && newImagenesPreview[index].startsWith("blob:")) {
          URL.revokeObjectURL(newImagenesPreview[index])
        }

        updatedImagenesPreview[index] = optimizedUrl
        setImagenesPreview(updatedImagenesPreview)

        // Actualizar el formData con las imágenes
        const updatedImagenes = [...imagenes]
        updatedImagenes[index] = optimizedUrl // Guardamos la URL en lugar del archivo

        setImagenes(updatedImagenes)
      } catch (error) {
        console.error("Error al subir la imagen:", error)
        toast.error("Error al subir la imagen. Intente nuevamente.")
      } finally {
        // Indicar que esta imagen ya no está cargando
        const finalImagenesLoading = [...imagenesLoading]
        finalImagenesLoading[index] = false
        setImagenesLoading(finalImagenesLoading)
      }
    }
  }

  /**
   * Manejador para eliminar una imagen
   * @param {Number} index - Índice de la imagen a eliminar (0-3)
   */
  const handleRemoveImage = (index) => {
    // Crear una copia de los arrays
    const newImagenes = [...imagenes]
    const newImagenesPreview = [...imagenesPreview]

    // Limpiar la imagen y su vista previa
    newImagenes[index] = null

    // Revocar la URL para liberar memoria
    if (imagenesPreview[index] && imagenesPreview[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagenesPreview[index])
    }
    newImagenesPreview[index] = null

    // Actualizar los estados
    setImagenes(newImagenes)
    setImagenesPreview(newImagenesPreview)
  }

  /**
   * Función para formatear números con separadores de miles
   */
  const formatNumber = (number) => {
    return number.toLocaleString("es-CO")
  }

  /**
   * Manejador para agregar un nuevo elemento a "Que incluye"
   */
  const handleAddQueIncluye = (item) => {
    if (item.nombre.trim() === "" || item.valor.trim() === "") {
      return
    }

    // Verificar si ya existe un elemento con el mismo nombre
    const existeNombre = formData.queIncluye.some(
      (existingItem) => existingItem.nombre.toLowerCase() === item.nombre.trim().toLowerCase(),
    )

    if (existeNombre) {
      toast.error("Ya existe un elemento con este nombre")
      return
    }

    // Agregar el nuevo elemento
    const updatedQueIncluye = [
      ...formData.queIncluye,
      {
        nombre: item.nombre.trim(),
        valor: item.valor.trim(),
      },
    ]

    // Actualizar el formData
    setFormData({
      ...formData,
      queIncluye: updatedQueIncluye,
    })

    // Limpiar el input
    setNuevoQueIncluye({
      nombre: "",
      valor: "",
    })
  }

  /**
   * Manejador para eliminar un elemento de "Que incluye"
   * @param {Number} index - Índice del elemento a eliminar
   */
  const handleRemoveQueIncluye = (index) => {
    const updatedQueIncluye = [...formData.queIncluye]
    updatedQueIncluye.splice(index, 1)

    setFormData({
      ...formData,
      queIncluye: updatedQueIncluye,
    })
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = {
      idTipoServicio: "",
      nombre: "",
      duracion: "",
      precio: "",
      imagenes: "",
    }

    // Validar tipo de servicio
    if (!formData.idTipoServicio) {
      errors.idTipoServicio = "Por favor, seleccione un tipo de servicio"
      isValid = false
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del servicio es obligatorio"
      isValid = false
    }

    // Validar duración
    if (!formData.duracion || formData.duracion === "0") {
      errors.duracion = "La duración debe ser mayor a 0 minutos"
      isValid = false
    } else if (isNaN(Number.parseInt(formData.duracion))) {
      errors.duracion = "La duración debe ser un número válido"
      isValid = false
    }

    // Validar precios
    if (!formData.precio || isNaN(Number.parseFloat(formData.precio))) {
      errors.precio = "El precio es obligatorio y debe ser un número válido"
      isValid = false
    }

    // Validar que al menos haya una imagen
    if (!imagenes.some((img) => img !== null)) {
      errors.imagenes = "Por favor, suba al menos una imagen para el servicio"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el servicio
   * Valida los datos y envía la información
   */
  const handleSaveServicio = async () => {
    // Verificar si hay imágenes cargando
    if (imagenesLoading.some((loading) => loading)) {
      toast.warning("Espere a que se completen las cargas de imágenes")
      return
    }

    // Validar el formulario
    if (!validateForm()) {
      // Mostrar notificación de error general
      if (toastIds.current.error) {
        toast.dismiss(toastIds.current.error)
      }

      toastIds.current.error = toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, corrija los errores en el formulario.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Filtrar las URLs de las imágenes
    const imageUrls = imagenes.filter((img) => img !== null && typeof img === "string")

    // Concatenar las URLs con un delimitador para guardarlas en un solo campo
    const fotoString = imageUrls.join("|")

    const servicioData = {
      IdTipoServicio: Number.parseInt(formData.idTipoServicio),
      Nombre: formData.nombre,
      Foto: fotoString, // URLs de imágenes separadas por |
      Descripcion: formData.descripcion,
      Beneficios: "", // Campo vacío ya que eliminamos beneficios
      Que_incluye: formData.queIncluye.map((item) => `${item.nombre}: ${item.valor}`).join(", "), // Convertir a string
      Precio: Number.parseFloat(formData.precio), // Precio base
      PrecioGrande: Number.parseFloat(formData.precio), // Usar el mismo precio para PrecioGrande
      Duracion: Number.parseInt(formData.duracion),
      Estado: true, // Asegurar que el servicio se cree como activo
    }

    try {
      if (isEditing && servicioId) {
        // Actualizar servicio existente
        await serviciosService.actualizar(servicioId, servicioData)
        toast.success("Servicio actualizado correctamente")
      } else {
        // Crear nuevo servicio
        await serviciosService.crear(servicioData)
        toast.success("Servicio creado correctamente")
      }

      // Esperar a que se muestre la notificación y luego redirigir
      setTimeout(() => {
        // Forzar un refresco completo para asegurar que la tabla se actualice
        window.location.href = "/servicios/servicios"
      }, 2000)
    } catch (error) {
      console.error("Error al guardar el servicio:", error)
      toast.error("No se pudo guardar el servicio. Intente nuevamente.")
    }
  }

  /**
   * Manejador para cancelar y volver a la lista de servicios
   */
  const handleCancel = () => {
    window.location.href = "/servicios/servicios"
  }

  // Limpiar las URLs de vista previa al desmontar el componente
  useEffect(() => {
    return () => {
      imagenesPreview.forEach((preview) => {
        if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [imagenesPreview])

  if (loading) {
    return (
      <div className="container-fluid py-3">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando información del servicio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fs-4 mb-0">{isEditing ? "Editar Servicio" : "Registrar Nuevo Servicio"}</h2>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={handleCancel}>
          <ArrowLeft size={16} className="me-1" />
          Volver a Servicios
        </button>
      </div>

      <div className="card">
        <div className="card-body p-3">
          <form className="service-form">
            <div className="row">
              {/* Columna izquierda - Información básica */}
              <div className="col-md-6">
                <BasicInfoSection
                  formData={formData}
                  formErrors={formErrors}
                  tiposServicio={tiposServicio}
                  handleInputChange={handleInputChange}
                  loading={loadingTipos}
                  isEditing={isEditing}
                />
              </div>

              {/* Columna derecha - Precio y Qué incluye */}
              <div className="col-md-6">
                {/* Campo de precio */}
                <div className="mb-3">
                  <label htmlFor="precio" className="form-label small mb-1">
                    Precio <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control form-control-sm ${formErrors.precio ? "is-invalid" : ""}`}
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="Ingrese el precio del servicio"
                      min="0"
                      step="0.01"
                    />
                    {formErrors.precio && <div className="invalid-feedback">{formErrors.precio}</div>}
                  </div>
                  <small className="form-text text-muted small">Ingrese un precio válido para el servicio</small>
                </div>

                {/* Sección de que incluye */}
                <IncludesSection
                  queIncluye={formData.queIncluye}
                  nuevoQueIncluye={nuevoQueIncluye}
                  setNuevoQueIncluye={setNuevoQueIncluye}
                  onAddQueIncluye={handleAddQueIncluye}
                  onRemoveQueIncluye={handleRemoveQueIncluye}
                />
              </div>
            </div>

            {/* Sección de imágenes (ancho completo) */}
            <div className="row mt-4">
              <div className="col-12">
                <ImagesSection
                  imagenes={imagenes}
                  imagenesPreview={imagenesPreview}
                  formErrors={formErrors}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                />
              </div>
            </div>

            {/* Indicador de carga de imágenes */}
            {imagenesLoading.some((loading) => loading) && (
              <div className="alert alert-info mt-2 py-2">
                <small>Subiendo imágenes al servidor...</small>
              </div>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button type="button" className="btn btn-secondary btn-sm me-2" onClick={handleCancel}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center"
                onClick={handleSaveServicio}
                disabled={imagenesLoading.some((loading) => loading)}
              >
                <Save size={16} className="me-1" />
                {isEditing ? "Actualizar Servicio" : "Guardar Servicio"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </div>
  )
}

export default RegistrarServicio
