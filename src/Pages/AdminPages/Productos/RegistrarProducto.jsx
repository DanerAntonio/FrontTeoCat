"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Save, ArrowLeft, X, Plus } from 'lucide-react'
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"

// Importar los nuevos componentes
import InfoBasica from "../../../Components/AdminComponents/ProductosComponents/InfoBasica"
import ImagenesProducto from "../../../Components/AdminComponents/ProductosComponents/ImagenesProducto"
import VarianteProducto from "../../../Components/AdminComponents/ProductosComponents/VarianteProducto"
import DeleteConfirmModal from "../../../Components/AdminComponents/ProductosComponents/DeleteConfirmModal"

// Importar servicios
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"
import CategoriasService from "../../../Services/ConsumoAdmin/CategoriasService.js"
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from "../../../Services/uploadImageToCloudinary.js"

/**
 * Componente para registrar un nuevo producto o editar uno existente
 * Versión actualizada con nueva estructura de componentes
 */
const RegistrarProducto = () => {
  // Obtener parámetros de la URL para edición
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const productId = params.get("id")
  const isEditing = !!productId

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("info-basica")

  // Estado para el formulario
  const [formData, setFormData] = useState({
    NombreProducto: "",
    Descripcion: "",
    IdCategoriaDeProducto: "",
    Stock: "",
    UnidadMedida: "Unidad",
    ValorUnidad: "",
    Precio: "",
    MargenGanancia: "",
    PorcentajeIVA: "0",
    AplicaIVA: false,
    CodigoBarras: "",
    Referencia: "",
    FechaVencimiento: "",
    NoVence: false,
    Caracteristicas: [],
    Origen: "Catálogo",
    Estado: true,
    FotosProducto: [],
    Variantes: [],
  })

  // Estado para manejar las imágenes (como en servicios)
  const [imagenes, setImagenes] = useState([null, null, null, null])
  const [imagenesPreview, setImagenesPreview] = useState([null, null, null, null])
  const [imagenesLoading, setImagenesLoading] = useState([false, false, false, false])

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({})

  // Estado para las categorías
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para productos existentes (para validación de duplicados)
  const [productosExistentes, setProductosExistentes] = useState([])

  // Estado para controlar si el producto es existente (para deshabilitar el stock)
  const [isExistingProduct, setIsExistingProduct] = useState(false)

  // Estado para controlar si estamos creando una variante
  const [creatingVariant, setCreatingVariant] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState(null)

  // AGREGAR ESTE ESTADO AQUÍ:
const [varianteFormData, setVarianteFormData] = useState({})

  // Estado para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Hook para navegación
  const navigate = useNavigate()

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        console.log("Iniciando carga de datos iniciales...")

        // Cargar categorías
        let categoriasData
        try {
          categoriasData = await CategoriasService.getAll()
          console.log("Categorías obtenidas:", categoriasData)
        } catch (error) {
          console.error("Error al cargar categorías:", error)
          toast.error(`No se pudieron cargar las categorías. ${error.response?.data?.message || error.message}`)
          categoriasData = []
        }
        setCategorias(categoriasData)

        // Cargar productos para validación
        let productosData
        try {
          productosData = await ProductosService.getAll()
          console.log("Productos obtenidos para validación:", productosData)
        } catch (error) {
          console.error("Error al cargar productos para validación:", error)
          toast.error(
            `No se pudieron cargar los productos para validación. ${error.response?.data?.message || error.message}`,
          )
          productosData = []
        }
        setProductosExistentes(productosData)

        // Si estamos en modo edición, cargar datos del producto
        if (isEditing) {
          try {
            const productoData = await ProductosService.getById(productId)
            console.log("Producto para edición obtenido:", productoData)

            // Formatear datos para el formulario
            setFormData({
              NombreProducto: productoData.NombreProducto || "",
              Descripcion: productoData.Descripcion !== undefined ? productoData.Descripcion : "",
              IdCategoriaDeProducto:
                productoData.IdCategoriaDeProducto !== undefined ? productoData.IdCategoriaDeProducto.toString() : "",
              Stock:
                productoData.Stock !== undefined && productoData.Stock !== null ? productoData.Stock.toString() : "0",
              UnidadMedida: productoData.UnidadMedida || "Unidad",
              ValorUnidad: productoData.ValorUnidad !== undefined ? productoData.ValorUnidad.toString() : "1",
              Precio:
                productoData.Precio !== undefined && productoData.Precio !== null
                  ? productoData.Precio.toString()
                  : "0",
              MargenGanancia: productoData.MargenGanancia !== undefined ? productoData.MargenGanancia.toString() : "30",
              PorcentajeIVA:
                productoData.PorcentajeIVA !== undefined && productoData.PorcentajeIVA !== null
                  ? productoData.PorcentajeIVA.toString()
                  : "0",
              AplicaIVA: productoData.AplicaIVA === true || productoData.AplicaIVA === 1,
              CodigoBarras: productoData.CodigoBarras !== undefined ? productoData.CodigoBarras : "",
              Referencia: productoData.Referencia !== undefined ? productoData.Referencia : "",
              FechaVencimiento: productoData.FechaVencimiento
                ? new Date(productoData.FechaVencimiento).toISOString().split("T")[0]
                : "",
              NoVence:
                productoData.NoVence === true || productoData.NoVence === 1 || productoData.FechaVencimiento === null,
              Caracteristicas: productoData.Caracteristicas
                ? typeof productoData.Caracteristicas === "string"
                  ? productoData.Caracteristicas.split(", ").filter((c) => c && c.trim() !== "")
                  : Array.isArray(productoData.Caracteristicas)
                    ? productoData.Caracteristicas
                    : []
                : [],
              Origen: productoData.Origen || "Catálogo",
              Estado: productoData.Estado !== undefined ? productoData.Estado : true,
              FotosProducto: [],
              Variantes: productoData.Variantes || [],
            })

            // Procesar imágenes para el array de imagenes
            const imagenesArray = [null, null, null, null]
            const imagenesPreviewArray = [null, null, null, null]

            if (productoData.FotosProducto || productoData.Foto) {
              const fotosString = productoData.FotosProducto || productoData.Foto
              if (fotosString) {
                const urls = fotosString
                  .split("|")
                  .map((url) => url.trim())
                  .filter((url) => url)

                urls.forEach((url, index) => {
                  if (index < 4) {
                    imagenesArray[index] = url
                    imagenesPreviewArray[index] = url
                  }
                })
              }
            }

            setImagenes(imagenesArray)
            setImagenesPreview(imagenesPreviewArray)

            // Cargar variantes
            try {
              const variantesProducto = await ProductosService.getVariantes(productId)
              console.log("Variantes del producto obtenidas:", variantesProducto)

              if (variantesProducto && Array.isArray(variantesProducto)) {
                const variantesProcesadas = variantesProducto.map((variante) => {
                  const fotosVariante = []
                  if (variante.FotosProducto || variante.Foto) {
                    const fotosString = variante.FotosProducto || variante.Foto
                    if (fotosString) {
                      const urls = fotosString
                        .split("|")
                        .map((url) => url.trim())
                        .filter((url) => url)

                      urls.forEach((url, index) => {
                        if (index < 4) {
                          fotosVariante.push({
                            url: url,
                            nombre: `Imagen ${index + 1}`,
                            principal: index === 0,
                          })
                        }
                      })
                    }
                  }

                  return {
                    ...variante,
                    FotosProducto: fotosVariante,
                    Caracteristicas: variante.Caracteristicas
                      ? typeof variante.Caracteristicas === "string"
                        ? variante.Caracteristicas.split(", ").filter((c) => c && c.trim() !== "")
                        : Array.isArray(variante.Caracteristicas)
                          ? variante.Caracteristicas
                          : []
                      : [],
                  }
                })

                setFormData((prev) => ({
                  ...prev,
                  Variantes: variantesProcesadas,
                }))
              }
            } catch (error) {
              console.error("Error al cargar variantes:", error)
              toast.error(`No se pudieron cargar las variantes. ${error.response?.data?.message || error.message}`)
            }
          } catch (error) {
            console.error(`Error al cargar producto con ID ${productId}:`, error)
            toast.error(`No se pudo cargar el producto para edición. ${error.response?.data?.message || error.message}`)
          }
        }
      } catch (error) {
        console.error("Error general al cargar datos iniciales:", error)
        toast.error("Error al cargar datos. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    // Limpiar notificaciones al montar
    toast.dismiss()

    return () => {
      // Limpiar URLs de vista previa al desmontar
      imagenesPreview.forEach((preview) => {
        if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview)
        }
      })
      // Limpiar notificaciones
      toast.dismiss()
    }
  }, [isEditing, productId])

  /**
   * Manejador para el cambio del checkbox de producto existente
   */
  const handleExistingProductChange = (e) => {
    const checked = e.target.checked
    setIsExistingProduct(checked)

    // Si es un producto existente, establecer el stock a vacío
    if (checked) {
      setFormData({
        ...formData,
        Stock: "",
      })
    }
  }

  /**
   * Manejador para subir imágenes (como en servicios)
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

      try {
        // Subir imagen a Cloudinary
        const imageUrl = await uploadImageToCloudinary(file, "productos")

        if (!imageUrl) {
          throw new Error("Error al subir la imagen a Cloudinary")
        }

        // Optimizar la URL para mejor rendimiento
        const optimizedUrl = optimizeCloudinaryUrl ? optimizeCloudinaryUrl(imageUrl) : imageUrl

        // Actualizar la vista previa con la URL de Cloudinary
        const updatedImagenesPreview = [...imagenesPreview]

        // Revocar la URL temporal para liberar memoria si es diferente
        if (
          newImagenesPreview[index] &&
          newImagenesPreview[index].startsWith("blob:") &&
          newImagenesPreview[index] !== optimizedUrl
        ) {
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
   * Manejador para eliminar una imagen (como en servicios)
   * @param {Number} index - Índice de la imagen a eliminar (0-3)
   */
  const handleRemoveImage = (index) => {
    // Crear una copia de los arrays
    const newImagenes = [...imagenes]
    const newImagenesPreview = [...imagenesPreview]

    // Limpiar la imagen y su vista previa
    if (
      newImagenesPreview[index] &&
      typeof newImagenesPreview[index] === "string" &&
      newImagenesPreview[index].startsWith("blob:")
    ) {
      URL.revokeObjectURL(newImagenesPreview[index])
    }

    newImagenes[index] = null
    newImagenesPreview[index] = null

    // Actualizar los estados
    setImagenes(newImagenes)
    setImagenesPreview(newImagenesPreview)

    toast.info("Imagen eliminada correctamente")
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = {}

    // Validar nombre (requerido y único)
    if (!formData.NombreProducto?.trim()) {
      errors.NombreProducto = "El nombre del producto es obligatorio"
      isValid = false
    } else if (formData.NombreProducto.trim().length > 100) {
      errors.NombreProducto = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para el producto actual en edición)
      const nombreExiste = productosExistentes.some(
        (prod) =>
          prod.NombreProducto?.toLowerCase() === formData.NombreProducto.trim().toLowerCase() &&
          (!isEditing || prod.IdProducto !== Number.parseInt(productId)),
      )
      if (nombreExiste) {
        errors.NombreProducto = "Ya existe un producto con este nombre"
        isValid = false
      }
    }

    // Validar descripción (opcional pero con longitud máxima)
    if (formData.Descripcion && formData.Descripcion.length > 500) {
      errors.Descripcion = "La descripción no puede exceder los 500 caracteres"
      isValid = false
    }

    // Validar categoría (requerida)
    if (!formData.IdCategoriaDeProducto) {
      errors.IdCategoriaDeProducto = "Debe seleccionar una categoría"
      isValid = false
    }

    // Validar stock solo si no es un producto existente
    if (!isExistingProduct) {
      if (formData.Stock === "") {
        errors.Stock = "El stock es obligatorio"
        isValid = false
      } else {
        const stockNum = Number(formData.Stock)
        if (isNaN(stockNum) || stockNum < 0) {
          errors.Stock = "El stock debe ser un número positivo"
          isValid = false
        }
      }
    }

    // Validar precio (requerido y numérico)
    if (formData.Precio === "") {
      errors.Precio = "El precio es obligatorio"
      isValid = false
    } else {
      const precioNum = Number(formData.Precio)
      if (isNaN(precioNum) || precioNum <= 0) {
        errors.Precio = "El precio debe ser un número positivo"
        isValid = false
      }
    }

    // Validar código de barras o referencia (al menos uno debe estar presente)
    if (!formData.CodigoBarras && !formData.Referencia) {
      errors.CodigoBarras = "Debe proporcionar un código de barras o una referencia"
      errors.Referencia = "Debe proporcionar un código de barras o una referencia"
      isValid = false
    }

    // Validar código de barras (formato)
    if (formData.CodigoBarras) {
      // Verificar si el código de barras ya existe (excepto para el producto actual en edición)
      const codigoExiste = productosExistentes.some(
        (prod) =>
          prod.CodigoBarras === formData.CodigoBarras && (!isEditing || prod.IdProducto !== Number.parseInt(productId)),
      )
      if (codigoExiste) {
        errors.CodigoBarras = "Ya existe un producto con este código de barras"
        isValid = false
      }
    }

    // Validar referencia
    if (formData.Referencia) {
      // Verificar si la referencia ya existe (excepto para el producto actual en edición)
      const referenciaExiste = productosExistentes.some(
        (prod) =>
          prod.Referencia === formData.Referencia && (!isEditing || prod.IdProducto !== Number.parseInt(productId)),
      )
      if (referenciaExiste) {
        errors.Referencia = "Ya existe un producto con esta referencia"
        isValid = false
      }
    }

    // Validar fecha de vencimiento si el producto vence
    if (!formData.NoVence && !formData.FechaVencimiento) {
      errors.FechaVencimiento = "Debe ingresar una fecha de vencimiento o marcar 'No vence'"
      isValid = false
    } else if (!formData.NoVence && formData.FechaVencimiento) {
      // Verificar que la fecha no sea pasada
      const fechaVencimiento = new Date(formData.FechaVencimiento)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0) // Establecer a medianoche para comparar solo fechas

      if (fechaVencimiento < hoy) {
        errors.FechaVencimiento = "La fecha de vencimiento no puede ser anterior a hoy"
        isValid = false
      }
    }

    // Validar que al menos haya una imagen
    if (!imagenes.some((img) => img !== null)) {
      errors.imagenes = "Por favor, suba al menos una imagen para el producto"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el producto
   */
  const handleSaveProduct = async () => {
    // Verificar si hay imágenes cargando
    if (imagenesLoading.some((loading) => loading)) {
      toast.warning("Espere a que se completen las cargas de imágenes")
      return
    }

    // Evitar múltiples envíos
    if (isSaving) {
      return
    }

    // Validar el formulario
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.")
      return
    }

    try {
      setIsSaving(true)

      // Filtrar las URLs de las imágenes
      const imageUrls = imagenes.filter((img) => img !== null && typeof img === "string")

      // Concatenar las URLs con un delimitador para guardarlas en un solo campo
      const fotosString = imageUrls.join("|")

      // Preparar las características para guardar
      let caracteristicasString = ""
      if (formData.Caracteristicas && formData.Caracteristicas.length > 0) {
        caracteristicasString = Array.isArray(formData.Caracteristicas)
          ? formData.Caracteristicas.join(", ")
          : formData.Caracteristicas
      }

      // Preparar los datos para enviar a la base de datos
      const productoData = {
        NombreProducto: formData.NombreProducto,
        Descripcion: formData.Descripcion || "",
        IdCategoriaDeProducto: Number.parseInt(formData.IdCategoriaDeProducto),
        Stock: Number.parseFloat(formData.Stock),
        UnidadMedida: formData.UnidadMedida,
        ValorUnidad: Number.parseFloat(formData.ValorUnidad),
        Precio: Number.parseFloat(formData.Precio),
        MargenGanancia: Number.parseFloat(formData.MargenGanancia),
        PorcentajeIVA: formData.AplicaIVA ? Number.parseFloat(formData.PorcentajeIVA) : 0,
        AplicaIVA: formData.AplicaIVA,
        CodigoBarras: formData.CodigoBarras || null,
        Referencia: formData.Referencia || null,
        FechaVencimiento: formData.NoVence ? null : formData.FechaVencimiento,
        Caracteristicas: caracteristicasString,
        Origen: formData.Origen,
        Estado: formData.Estado,
        FotosProducto: fotosString,
      }

      console.log("Datos del producto a guardar:", productoData)

      let productoId

      // Guardar o actualizar el producto
      if (isEditing) {
        await ProductosService.update(productId, productoData)
        productoId = productId

        toast.success("Producto actualizado correctamente")
      } else {
        const nuevoProducto = await ProductosService.create(productoData)
        productoId = nuevoProducto.IdProducto || nuevoProducto.id

        toast.success("Producto guardado correctamente")
      }

      // Guardar variantes si hay
if (formData.Variantes && formData.Variantes.length > 0) {
  try {
    // Procesar cada variante
    for (const variante of formData.Variantes) {
      // Preparar las fotos de la variante
      let fotosVarianteString = ""
      if (variante.FotosProducto && variante.FotosProducto.length > 0) {
        fotosVarianteString = variante.FotosProducto.map((foto) => foto.url)
          .filter((url) => url)
          .join("|")
      }

      // Preparar las características de la variante
      let caracteristicasVarianteString = ""
      if (variante.Caracteristicas && variante.Caracteristicas.length > 0) {
        caracteristicasVarianteString = Array.isArray(variante.Caracteristicas)
          ? variante.Caracteristicas.join(", ")
          : variante.Caracteristicas
      }

      // Datos de la variante
      const varianteData = {
        NombreProducto: variante.NombreProducto,
        Descripcion: variante.Descripcion || "",
        Stock: Number.parseFloat(variante.Stock || 0),
        Precio: Number.parseFloat(variante.Precio || productoData.Precio),
        MargenGanancia: Number.parseFloat(variante.MargenGanancia || productoData.MargenGanancia),
        PorcentajeIVA: variante.AplicaIVA ? Number.parseFloat(variante.PorcentajeIVA || 0) : 0,
        AplicaIVA: variante.AplicaIVA,
        CodigoBarras: variante.CodigoBarras || null,
        Referencia: variante.Referencia || null,
        Caracteristicas: caracteristicasVarianteString,
        FotosProducto: fotosVarianteString,
      }

      // LÓGICA CORREGIDA: Verificar si es una variante existente o nueva
      const esVarianteExistente = variante.IdProducto && 
                                  typeof variante.IdProducto === 'number' && 
                                  variante.IdProducto > 0 &&
                                  !variante.id // No tiene ID temporal

      if (esVarianteExistente) {
        // Actualizar variante existente (solo en modo edición)
        console.log(`Actualizando variante existente ${variante.IdProducto}`)
        await ProductosService.updateVariante(productoId, variante.IdProducto, varianteData)
      } else {
        // Crear nueva variante
        console.log(`Creando nueva variante para producto ${productoId}`)
        await ProductosService.createVariante(productoId, varianteData)
      }
    }
  } catch (error) {
    console.error("Error al guardar variantes:", error)
    toast.error("Error al guardar las variantes del producto.")
  }
}

      // Esperar a que se muestre la notificación y luego redirigir
      setTimeout(() => {
        navigate("/inventario/productos")
      }, 2000)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast.error(error.response?.data?.message || error.message || "Error al guardar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Manejador para cancelar y volver a la lista de productos
   */
  const handleCancel = () => {
    navigate("/inventario/productos")
  }

  /**
   * Manejador para crear una nueva variante
   */
  const handleCreateVariant = () => {
  setVarianteFormData({}) // Limpiar el formulario para nueva variante
  setCreatingVariant(true)
  setEditingVariantIndex(null)
}

  /**
 * Manejador para guardar una variante
 */
const handleSaveVariant = (variantData) => {
  if (editingVariantIndex !== null) {
    // Editar variante existente
    const updatedVariantes = [...formData.Variantes]
    updatedVariantes[editingVariantIndex] = {
      ...updatedVariantes[editingVariantIndex],
      ...variantData,
    }

    setFormData({
      ...formData,
      Variantes: updatedVariantes,
    })

    toast.success("Variante actualizada correctamente")
  } else {
    // Agregar nueva variante - SIN ID temporal problemático
    const newVariant = {
      ...variantData,
      EsVariante: true,
      ProductoBaseId: isEditing ? productId : null,
      // NO asignar ID temporal aquí
    }

    setFormData({
      ...formData,
      Variantes: [...formData.Variantes, newVariant],
    })

    toast.success("Variante creada correctamente")
  }

  // Salir del modo de creación/edición de variante
  setCreatingVariant(false)
  setEditingVariantIndex(null)

  // Cambiar a la pestaña de variantes
  setActiveTab("variantes")
}


  /**
   * Manejador para editar una variante
   */
  const handleEditVariant = (index) => {
  setVarianteFormData(formData.Variantes[index]) // Cargar datos de la variante a editar
  setEditingVariantIndex(index)
  setCreatingVariant(true)
}

  /**
   * Manejador para confirmar eliminación de variante
   */
  const handleConfirmDeleteVariant = (index) => {
    setItemToDelete({ index, type: "variante" })
    setShowDeleteModal(true)
  }

  /**
 * Manejador para eliminar una variante
 */
const handleDeleteVariant = async () => {
  if (!itemToDelete || itemToDelete.type !== "variante") return

  try {
    const variante = formData.Variantes[itemToDelete.index]
    
    // Solo intentar eliminar del servidor si es una variante que ya existe en BD
    const esVarianteExistente = variante.IdProducto && 
                                typeof variante.IdProducto === 'number' && 
                                variante.IdProducto > 0

    if (esVarianteExistente && isEditing) {
      console.log(`Eliminando variante ${variante.IdProducto} del servidor`)
      await ProductosService.deleteVariante(productId, variante.IdProducto)
    }

    // Eliminar del estado local
    const updatedVariantes = [...formData.Variantes]
    updatedVariantes.splice(itemToDelete.index, 1)

    setFormData({
      ...formData,
      Variantes: updatedVariantes,
    })

    toast.success("Variante eliminada correctamente")
  } catch (error) {
    console.error("Error al eliminar variante:", error)
    toast.error("Error al eliminar la variante")
  } finally {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }
}

  /**
   * Cancelar eliminación
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  // Si estamos creando o editando una variante, mostrar el formulario de variante
if (creatingVariant) {
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{editingVariantIndex !== null ? "Editar Variante" : "Crear Nueva Variante"}</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setCreatingVariant(false)
            setEditingVariantIndex(null)
            setVarianteFormData({}) // Limpiar el formulario
          }}
        >
          <ArrowLeft size={18} className="me-1" />
          Volver al Producto
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <VarianteProducto
            formData={varianteFormData}
            setFormData={setVarianteFormData}
            formErrors={formErrors}
            productoBase={formData}
            isEditing={editingVariantIndex !== null}
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setCreatingVariant(false)
                setEditingVariantIndex(null)
                setVarianteFormData({}) // Limpiar el formulario
              }}
            >
              <X size={18} className="me-1" />
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSaveVariant(varianteFormData)}
              disabled={imagenesLoading.some((loading) => loading)}
            >
              {imagenesLoading.some((loading) => loading) ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Subiendo imágenes...
                </>
              ) : (
                <>
                  <Save size={18} className="me-1" />
                  {editingVariantIndex !== null ? "Actualizar Variante" : "Guardar Variante"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Editar Producto" : "Registrar Nuevo Producto"}</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleCancel}>
          <ArrowLeft size={18} className="me-1" />
          Volver a Productos
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {/* Pestañas de navegación */}
            <ul className="nav nav-tabs mb-4" id="productTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "info-basica" ? "active" : ""}`}
                  onClick={() => setActiveTab("info-basica")}
                  type="button"
                >
                  Información Básica
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "imagenes" ? "active" : ""}`}
                  onClick={() => setActiveTab("imagenes")}
                  type="button"
                >
                  Imágenes
                </button>
              </li>
              {isEditing && (
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "variantes" ? "active" : ""}`}
                    onClick={() => setActiveTab("variantes")}
                    type="button"
                  >
                    Variantes
                    {formData.Variantes.length > 0 && (
                      <span className="badge bg-primary rounded-pill ms-2">{formData.Variantes.length}</span>
                    )}
                  </button>
                </li>
              )}
            </ul>

            <form className="product-form">
              {/* Contenido de las pestañas */}
              <div className="tab-content" id="productTabsContent">
                {/* Pestaña de Información Básica */}
                <div className={`tab-pane fade ${activeTab === "info-basica" ? "show active" : ""}`}>
                  <InfoBasica
                    formData={formData}
                    setFormData={setFormData}
                    formErrors={formErrors}
                    categorias={categorias}
                    isExistingProduct={isExistingProduct}
                    handleExistingProductChange={handleExistingProductChange}
                  />
                </div>

                {/* Pestaña de Imágenes */}
                <div className={`tab-pane fade ${activeTab === "imagenes" ? "show active" : ""}`}>
                  <ImagenesProducto
                    formData={formData}
                    setFormData={setFormData}
                    formErrors={formErrors}
                    imagenes={imagenes}
                    imagenesPreview={imagenesPreview}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                    imagenesLoading={imagenesLoading}
                  />
                </div>

                {/* Pestaña de Variantes */}
                {isEditing && (
                <div className={`tab-pane fade ${activeTab === "variantes" ? "show active" : ""}`}>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">Variantes del Producto</h5>
                      <button type="button" className="btn btn-primary" onClick={handleCreateVariant}>
                        <Plus size={18} className="me-1" />
                        Agregar Variante
                      </button>
                    </div>

                    {formData.Variantes.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Imagen</th>
                              <th>Nombre</th>
                              <th>Stock</th>
                              <th>Precio</th>
                              <th>Código/Referencia</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.Variantes.map((variante, index) => (
                              <tr key={variante.id || index}>
                                <td style={{ width: "80px" }}>
                                  {variante.FotosProducto && variante.FotosProducto.length > 0 ? (
                                    <img
                                      src={variante.FotosProducto[0].url || "//vite.svg
"}
                                      alt={variante.NombreProducto}
                                      className="img-thumbnail"
                                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div
                                      className="bg-light d-flex align-items-center justify-content-center"
                                      style={{ width: "60px", height: "60px" }}
                                    >
                                      <span className="text-muted small">Sin imagen</span>
                                    </div>
                                  )}
                                </td>
                                <td>{variante.NombreProducto}</td>
                                <td>{variante.Stock || 0}</td>
                                <td>${Number(variante.Precio || 0).toLocaleString()}</td>
                                <td>{variante.CodigoBarras || variante.Referencia || "N/A"}</td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary"
                                      onClick={() => handleEditVariant(index)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger"
                                      onClick={() => handleConfirmDeleteVariant(index)}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        Este producto no tiene variantes. Haga clic en "Agregar Variante" para crear una.
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  <X size={18} className="me-1" />
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveProduct}
                  disabled={isSaving || imagenesLoading.some((loading) => loading)}
                >
                  {isSaving || imagenesLoading.some((loading) => loading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {imagenesLoading.some((loading) => loading)
                        ? "Subiendo imágenes..."
                        : isEditing
                          ? "Actualizando..."
                          : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="me-1" />
                      {isEditing ? "Actualizar Producto" : "Guardar Producto"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        show={showDeleteModal}
        item={itemToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleDeleteVariant}
        itemType={itemToDelete?.type === "variante" ? "variante" : "elemento"}
      />

      {/* Contenedor para las notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        limit={1}
      />
    </div>
  )
}

export default RegistrarProducto