"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Categorias.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import CategoryForm from "../../../Components/AdminComponents/CategoriasComponents/CategoryForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/CategoriasComponents/DeleteConfirmModal"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import CategoriasService from "../../../Services/ConsumoAdmin/CategoriasService.js"

// Importar los estilos SCSS
import "../../../Components/AdminComponents/CategoriasComponents/CategoryForm.scss"

/**
 * Componente para la gestión de categorías de productos
 * Permite crear, ver, editar, activar/desactivar y eliminar categorías
 */
const CategoriasProducto = () => {
  // Estado para las categorías
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Categoría")
  const [currentCategoria, setCurrentCategoria] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: "",
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState(null)

  // Estado para los diálogos de confirmación
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [categoriaToToggle, setCategoriaToToggle] = useState(null)
  const [categoriaToEdit, setCategoriaToEdit] = useState(null)

  // Estado para el indicador de carga
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Referencias para las notificaciones
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)

  // Función para mostrar toast después de que el loading se oculte
  const showPendingToast = () => {
    if (pendingToastRef.current && !toastShownRef.current) {
      const { type, message } = pendingToastRef.current

      // Marcar como mostrado
      toastShownRef.current = true

      // Limpiar todas las notificaciones existentes primero
      toast.dismiss()

      // Mostrar la notificación después de un pequeño retraso
      setTimeout(() => {
        toast[type](message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          onClose: () => {
            // Resetear cuando se cierra la notificación
            pendingToastRef.current = null
            // Esperar un momento antes de permitir nuevas notificaciones
            setTimeout(() => {
              toastShownRef.current = false
            }, 300)
          },
        })
      }, 300)
    }
  }

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias()

    // Limpiar todas las notificaciones al montar el componente
    toast.dismiss()
    pendingToastRef.current = null
    toastShownRef.current = false

    return () => {
      // Limpiar todas las notificaciones al desmontar el componente
      toast.dismiss()
      // Limpiar referencias
      pendingToastRef.current = null
      toastShownRef.current = false
    }
  }, [])

  /**
   * Función para obtener todas las categorías desde la API
   */
  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await CategoriasService.getAll()

      // Transformar los datos de la API al formato esperado por el componente
      const formattedCategorias = data.map((cat) => ({
        id: cat.IdCategoriaDeProductos,
        nombre: cat.NombreCategoria,
        descripcion: cat.Descripcion || "",
        estado: cat.Estado ? "Activo" : "Inactivo",
      }))

      setCategorias(formattedCategorias)
    } catch (error) {
      console.error("Error al cargar categorías:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: `No se pudieron cargar las categorías. ${error.response?.data?.message || error.message}`,
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente después de que se complete la carga
      showPendingToast()
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "nombre", header: "Nombre" },
    {
      field: "estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.estado === "Activo" ? "bg-success" : "bg-danger"}`}>{row.estado}</span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleConfirmEdit}
          onToggleStatus={handleConfirmToggleStatus}
          onDelete={handleDelete}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una categoría
   */
  const handleView = (categoria) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles de la categoría...")

      setCurrentCategoria(categoria)
      setModalTitle("Ver Detalles de la Categoría")

      // Cargar datos de la categoría en el formulario
      setFormData({
        nombre: categoria.nombre,
      })

      // Resetear errores
      setFormErrors({
        nombre: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles de la categoría:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles de la categoría",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de una categoría
   */
  const handleConfirmEdit = (categoria) => {
    setCategoriaToEdit(categoria)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos de la categoría...")

      const categoria = categoriaToEdit
      setCurrentCategoria(categoria)
      setModalTitle("Editar Categoría")

      // Cargar datos de la categoría en el formulario
      setFormData({
        nombre: categoria.nombre,
      })

      // Resetear errores
      setFormErrors({
        nombre: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar categoría:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar la categoría",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de una categoría
   */
  const handleConfirmToggleStatus = (categoria) => {
    setCategoriaToToggle(categoria)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de una categoría
   */
  const handleToggleStatus = async () => {
    if (!categoriaToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage(`Cambiando estado de la categoría...`)

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Llamar a la API para cambiar el estado
      const newStatus = categoriaToToggle.estado === "Activo" ? false : true
      await CategoriasService.changeStatus(categoriaToToggle.id, newStatus)

      // Actualizar el estado local
      const updatedCategorias = categorias.map((c) => {
        if (c.id === categoriaToToggle.id) {
          return {
            ...c,
            estado: c.estado === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return c
      })

      setCategorias(updatedCategorias)

      // Guardar el toast para después
      const statusText = categoriaToToggle.estado === "Activo" ? "inactiva" : "activa"
      pendingToastRef.current = {
        type: "success",
        message: `La categoría "${categoriaToToggle.nombre}" ahora está ${statusText}.`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado de la categoría",
      }
    }

    // Cerrar el modal de confirmación
    setCategoriaToToggle(null)
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setCategoriaToToggle(null)
  }

  /**
   * Función para verificar si una categoría tiene productos asociados
   */
  const hasAssociatedProducts = async (categoriaId) => {
    try {
      const products = await CategoriasService.getProducts(categoriaId)
      return products.length > 0
    } catch (error) {
      console.error("Error al verificar productos asociados:", error)
      return false
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación
   */
  const handleDelete = (categoria) => {
    setCategoriaToDelete(categoria)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (categoriaToDelete) {
      try {
        setIsProcessing(true)
        setProcessingMessage("Verificando productos asociados...")

        // Verificar si hay productos asociados a esta categoría
        const hasProducts = await hasAssociatedProducts(categoriaToDelete.id)

        if (hasProducts) {
          setIsProcessing(false)
          pendingToastRef.current = {
            type: "error",
            message: `No se puede eliminar la categoría "${categoriaToDelete.nombre}" porque tiene productos asociados.`,
          }
          showPendingToast()
          setShowDeleteConfirm(false)
          setCategoriaToDelete(null)
          return
        }

        // Cambiar el mensaje ahora que estamos eliminando
        setProcessingMessage("Eliminando categoría...")

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Llamar a la API para eliminar la categoría
        await CategoriasService.delete(categoriaToDelete.id)

        // Actualizar el estado local
        const updatedCategorias = categorias.filter((c) => c.id !== categoriaToDelete.id)
        setCategorias(updatedCategorias)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: `La categoría "${categoriaToDelete.nombre}" ha sido eliminada correctamente.`,
        }

        setIsProcessing(false)
      } catch (error) {
        setIsProcessing(false)
        console.error("Error al eliminar categoría:", error)

        pendingToastRef.current = {
          type: "error",
          message: error.response?.data?.message || "No se pudo eliminar la categoría. Intente nuevamente.",
        }
      }
      setShowDeleteConfirm(false)
      setCategoriaToDelete(null)
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setCategoriaToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar categoría
   */
  const handleAddCategoria = () => {
    setCurrentCategoria(null)
    setModalTitle("Agregar Categoría")

    // Resetear el formulario
    setFormData({
      nombre: "",
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Manejador para cambios en los inputs del formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar el error específico cuando el usuario comienza a escribir
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = {
      nombre: "",
    }

    // Validar nombre (requerido y longitud)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre de la categoría es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 50) {
      errors.nombre = "El nombre no puede exceder los 50 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para la categoría actual en edición)
      const nombreExiste = categorias.some(
        (cat) =>
          cat.nombre.toLowerCase() === formData.nombre.trim().toLowerCase() &&
          (!currentCategoria || cat.id !== currentCategoria.id),
      )
      if (nombreExiste) {
        errors.nombre = "Ya existe una categoría con este nombre"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar la categoría
   */
  const handleSaveCategoria = async () => {
    // Validar el formulario
    if (!validateForm()) {
      pendingToastRef.current = {
        type: "error",
        message: "Por favor, corrija los errores en el formulario.",
      }
      showPendingToast()
      return
    }

    try {
      setIsProcessing(true)
      setProcessingMessage(currentCategoria ? "Actualizando categoría..." : "Creando nueva categoría...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      if (currentCategoria) {
        // Actualizar categoría existente
        await CategoriasService.update(currentCategoria.id, {
          NombreCategoria: formData.nombre.trim(),
        })

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La categoría "${formData.nombre.trim()}" ha sido actualizada correctamente.`,
        }
      } else {
        // Crear nueva categoría
        await CategoriasService.create({
          NombreCategoria: formData.nombre.trim(),
          Estado: true,
        })

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La categoría "${formData.nombre.trim()}" ha sido creada correctamente.`,
        }
      }

      // Cerrar el modal
      handleCloseModal()
      setIsProcessing(false)

      // Recargar las categorías para asegurar sincronización con el servidor
      await fetchCategorias()
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al guardar categoría:", error)

      pendingToastRef.current = {
        type: "error",
        message: error.response?.data?.message || "No se pudo guardar la categoría. Intente nuevamente.",
      }
      showPendingToast()
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("categoriaModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      // Si showModal es false y el modal está abierto, cerrarlo programáticamente
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      // Asegurarse de que se elimine cualquier backdrop residual al desmontar
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) {
        backdrop.remove()
      }
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [showModal])

  return (
    <div className="categorias-container">
      <h2 className="mb-4">Gestión de Categorías de Producto</h2>

      <DataTable
        columns={columns}
        data={categorias}
        onAdd={handleAddCategoria}
        addButtonLabel="Agregar Categoría"
        searchPlaceholder="Buscar categorías..."
        loading={loading}
        showExportButton={false}
      />

      {/* Modal para Agregar/Editar/Ver Categoría */}
      <CategoryForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveCategoria}
        onClose={handleCloseModal}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        categoria={categoriaToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar la categoría "${categoriaToEdit?.nombre}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${categoriaToToggle?.estado === "Activo" ? "desactivar" : "activar"} la categoría "${categoriaToToggle?.nombre}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      {/* Overlay de carga con el nuevo callback */}
      <LoadingOverlay
        isLoading={isProcessing}
        message={processingMessage}
        variant="primary"
        onHide={showPendingToast}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default CategoriasProducto
