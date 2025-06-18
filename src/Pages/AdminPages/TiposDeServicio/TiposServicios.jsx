"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/TiposServicios.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import TipoServicioForm from "../../../Components/AdminComponents/TiposDeServicioComponents/TipoServicioForm"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import tiposServicioService from "../../../services/ConsumoAdmin/tiposServicioService.js"

// Importar los estilos SCSS
import "../../../Components/AdminComponents/TiposDeServicioComponents/TipoServicioForm.scss"

/**
 * Componente para la gestión de tipos de servicios
 * Permite crear, ver, editar, activar/desactivar y eliminar tipos de servicios
 */
const TiposServicios = () => {
  // Estado para los tipos de servicios
  const [tiposServicios, setTiposServicios] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Tipo de Servicio")
  const [currentTipoServicio, setCurrentTipoServicio] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
  })

  // Estado para los errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: "",
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [tipoServicioToDelete, setTipoServicioToDelete] = useState(null)
  const [tipoServicioToEdit, setTipoServicioToEdit] = useState(null)
  const [tipoServicioToToggle, setTipoServicioToToggle] = useState(null)

  // Estado para el indicador de carga
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Referencias para las notificaciones
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)
  const toastIds = useRef({})

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

  // Limpiar notificaciones
  const clearAllToasts = () => {
    toast.dismiss()
    pendingToastRef.current = null
    toastShownRef.current = false
  }

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    clearAllToasts()
    fetchTiposServicios()

    return () => {
      clearAllToasts()
    }
  }, [])

  /**
   * Función para cargar tipos de servicio desde la API
   */
  const fetchTiposServicios = async () => {
    setLoading(true)
    try {
      const data = await tiposServicioService.obtenerTodos()
      console.log("Datos recibidos de la API:", data) // Para depuración
      setTiposServicios(data)
    } catch (error) {
      console.error("Error al cargar tipos de servicio:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "No se pudieron cargar los tipos de servicio",
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente después de que se complete la carga
      showPendingToast()
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "Nombre", header: "Nombre" }, // Cambiado de "nombre" a "Nombre"
    {
      field: "Estado", // Cambiado de "estado" a "Estado"
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado ? "bg-success" : "bg-danger"}`}>{row.Estado ? "Activo" : "Inactivo"}</span>
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
          onDelete={handleConfirmDelete}
          customLabels={{
            toggleStatus: row.Estado ? "Desactivar" : "Activar", // Cambiado de "estado" a "Estado"
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un tipo de servicio
   * @param {Object} tipoServicio - Objeto de tipo de servicio a visualizar
   */
  const handleView = (tipoServicio) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles del tipo de servicio...")

      setCurrentTipoServicio(tipoServicio)
      setModalTitle("Ver Detalles del Tipo de Servicio")

      // Cargar datos del tipo de servicio en el formulario
      setFormData({
        nombre: tipoServicio.Nombre || "", // Cambiado de "nombre" a "Nombre"
      })

      // Resetear errores
      setFormErrors({
        nombre: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles del tipo de servicio:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles del tipo de servicio",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de un tipo de servicio
   */
  const handleConfirmEdit = (tipoServicio) => {
    setTipoServicioToEdit(tipoServicio)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos del tipo de servicio...")

      const tipoServicio = tipoServicioToEdit
      setCurrentTipoServicio(tipoServicio)
      setModalTitle("Editar Tipo de Servicio")

      // Cargar datos del tipo de servicio en el formulario
      setFormData({
        nombre: tipoServicio.Nombre || "", // Cambiado de "nombre" a "Nombre"
      })

      // Resetear errores
      setFormErrors({
        nombre: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar tipo de servicio:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar el tipo de servicio",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de un tipo de servicio
   */
  const handleConfirmToggleStatus = (tipoServicio) => {
    setTipoServicioToToggle(tipoServicio)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de un tipo de servicio (Activo/Inactivo)
   */
  const handleToggleStatus = async () => {
    if (!tipoServicioToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage(`Cambiando estado del tipo de servicio...`)

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Verificar que tipoServicioToToggle.IdTipoServicio existe
      if (!tipoServicioToToggle.IdTipoServicio) {
        throw new Error("Error: IdTipoServicio es undefined")
      }

      await tiposServicioService.cambiarEstado(tipoServicioToToggle.IdTipoServicio, !tipoServicioToToggle.Estado)

      // Actualizar la lista de tipos de servicio
      await fetchTiposServicios()

      // Guardar el toast para después
      const newStatus = tipoServicioToToggle.Estado ? "inactivo" : "activo"
      pendingToastRef.current = {
        type: "success",
        message: `El tipo de servicio "${tipoServicioToToggle.Nombre}" ahora está ${newStatus}.`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado del tipo de servicio",
      }
    }

    // Cerrar el modal de confirmación
    setTipoServicioToToggle(null)
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setTipoServicioToToggle(null)
  }

  /**
   * Manejador para confirmar la eliminación de un tipo de servicio
   */
  const handleConfirmDelete = (tipoServicio) => {
    setTipoServicioToDelete(tipoServicio)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación de un tipo de servicio
   */
  const confirmDelete = async () => {
    if (tipoServicioToDelete) {
      try {
        setShowDeleteConfirm(false)
        setIsProcessing(true)
        setProcessingMessage("Eliminando tipo de servicio...")

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Verificar que tipoServicioToDelete.IdTipoServicio existe
        if (!tipoServicioToDelete.IdTipoServicio) {
          throw new Error("Error: IdTipoServicio es undefined")
        }

        await tiposServicioService.eliminar(tipoServicioToDelete.IdTipoServicio)

        // Actualizar la lista de tipos de servicio
        await fetchTiposServicios()

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: `El tipo de servicio "${tipoServicioToDelete.Nombre}" ha sido eliminado correctamente.`,
        }

        setIsProcessing(false)
      } catch (error) {
        setIsProcessing(false)
        console.error("Error al eliminar:", error)

        pendingToastRef.current = {
          type: "error",
          message: "No se pudo eliminar el tipo de servicio",
        }
        showPendingToast()
      }
      setTipoServicioToDelete(null)
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setTipoServicioToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar tipo de servicio
   */
  const handleAddTipoServicio = () => {
    setCurrentTipoServicio(null)
    setModalTitle("Agregar Tipo de Servicio")

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
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar el error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
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

    // Validar nombre (requerido y único)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del tipo de servicio es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 100) {
      errors.nombre = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para el tipo de servicio actual en edición)
      const nombreExiste = tiposServicios.some(
        (t) =>
          t.Nombre && // Verificar que t.Nombre existe
          t.Nombre.toLowerCase() === formData.nombre.trim().toLowerCase() &&
          (!currentTipoServicio || t.IdTipoServicio !== currentTipoServicio.IdTipoServicio), // Cambiado de "id" a "IdTipoServicio"
      )
      if (nombreExiste) {
        errors.nombre = "Ya existe un tipo de servicio con este nombre"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el tipo de servicio (crear nuevo o actualizar existente)
   * Valida los datos y envía la información
   */
  const handleSaveTipoServicio = async () => {
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
      setProcessingMessage(
        currentTipoServicio ? "Actualizando tipo de servicio..." : "Creando nuevo tipo de servicio...",
      )

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Asegurarse de que los datos estén en el formato correcto que espera la API
      const tipoServicioData = {
        Nombre: formData.nombre.trim(),
      }

      console.log("Enviando datos:", tipoServicioData) // Para depuración

      if (currentTipoServicio) {
        // Verificar que currentTipoServicio.IdTipoServicio existe
        if (!currentTipoServicio.IdTipoServicio) {
          throw new Error("Error: IdTipoServicio es undefined")
        }

        // Actualizar tipo de servicio existente
        await tiposServicioService.actualizar(currentTipoServicio.IdTipoServicio, tipoServicioData)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El tipo de servicio "${formData.nombre.trim()}" ha sido actualizado correctamente.`,
        }
      } else {
        // Crear nuevo tipo de servicio
        await tiposServicioService.crear(tipoServicioData)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El tipo de servicio "${formData.nombre.trim()}" ha sido creado correctamente.`,
        }
      }

      // Actualizar la lista de tipos de servicio
      await fetchTiposServicios()

      // Cerrar el modal
      setShowModal(false)
      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al guardar:", error)

      pendingToastRef.current = {
        type: "error",
        message: currentTipoServicio
          ? "No se pudo actualizar el tipo de servicio"
          : "No se pudo crear el tipo de servicio",
      }
      showPendingToast()
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("tipoServicioModal")

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
    <div className="tipos-servicios-container">
      <h2 className="mb-4">Gestión de Tipos de Servicios</h2>

      <DataTable
        columns={columns}
        data={tiposServicios}
        onAdd={handleAddTipoServicio}
        addButtonLabel="Agregar Tipo de Servicio"
        searchPlaceholder="Buscar tipos de servicios..."
        loading={loading}
        showExportButton={false}
      />

      {/* Modal para Agregar/Editar/Ver Tipo de Servicio */}
      <TipoServicioForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveTipoServicio}
        onClose={handleCloseModal}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar el tipo de servicio "${tipoServicioToEdit?.Nombre}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${tipoServicioToToggle?.Estado ? "desactivar" : "activar"} el tipo de servicio "${tipoServicioToToggle?.Nombre}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar el tipo de servicio <strong>{tipoServicioToDelete?.Nombre}</strong>?
            <br />
            <span className="text-danger">Esta acción no se puede deshacer.</span>
          </>
        }
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
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

export default TiposServicios
