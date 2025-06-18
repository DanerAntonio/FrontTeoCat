"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Proveedores.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import ProveedorForm from "../../../Components/AdminComponents/ProveedoresComponents/ProveedorForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/ProveedoresComponents/DeleteConfirmModal"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import proveedoresService from "../../../Services/ConsumoAdmin/ProveedoresService.js"
import "../../../Components/AdminComponents/ProveedoresComponents/ProveedoresForm.scss"

const Proveedores = () => {
  // Estado para los proveedores
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Proveedor")
  const [currentProveedor, setCurrentProveedor] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(false)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    documento: "",
    correo: "",
    nombreEmpresa: "",
    personaDeContacto: "",
    telefono: "",
    direccion: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    documento: "",
    correo: "",
    nombreEmpresa: "",
    personaDeContacto: "",
    telefono: "",
    direccion: "",
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState(null)
  const [proveedorToEdit, setProveedorToEdit] = useState(null)
  const [proveedorToToggle, setProveedorToToggle] = useState(null)

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

  // Cargar proveedores al montar el componente
  useEffect(() => {
    clearAllToasts()
    fetchProveedores()

    return () => {
      clearAllToasts()
    }
  }, [reloadTrigger])

  /**
   * Función para obtener todos los proveedores desde la API
   */
  const fetchProveedores = async () => {
    setLoading(true)
    try {
      const data = await proveedoresService.getAll()
      console.log("Proveedores recibidos:", data)

      const proveedoresEstados = JSON.parse(localStorage.getItem("proveedoresEstados") || "{}")

      const proveedoresConEstadoActualizado = data.map((proveedor) => {
        const proveedorId = proveedor.id || proveedor.IdProveedor
        const estadoGuardado = proveedoresEstados[proveedorId]
        if (estadoGuardado) {
          return {
            ...proveedor,
            estado: estadoGuardado,
          }
        }
        return proveedor
      })

      setProveedores(proveedoresConEstadoActualizado)
    } catch (error) {
      console.error("Error al cargar los proveedores:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los proveedores. Por favor, intente nuevamente.",
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente después de que se complete la carga
      showPendingToast()
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "nombreEmpresa", header: "Nombre Empresa" },
    { field: "personaDeContacto", header: "Persona de Contacto" },
    { field: "documento", header: "Documento" },
    { field: "telefono", header: "Teléfono" },
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
          onDelete={handleConfirmDelete}
          customLabels={{
            toggleStatus: row.estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un proveedor
   */
  const handleView = (proveedor) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles del proveedor...")

      setCurrentProveedor(proveedor)
      setModalTitle("Ver Detalles del Proveedor")

      // Cargar datos del proveedor en el formulario
      setFormData({
        documento: proveedor.documento,
        correo: proveedor.correo,
        nombreEmpresa: proveedor.nombreEmpresa,
        personaDeContacto: proveedor.personaDeContacto,
        telefono: proveedor.telefono,
        direccion: proveedor.direccion,
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombreEmpresa: "",
        personaDeContacto: "",
        telefono: "",
        direccion: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles del proveedor:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles del proveedor",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de un proveedor
   */
  const handleConfirmEdit = (proveedor) => {
    setProveedorToEdit(proveedor)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos del proveedor...")

      const proveedor = proveedorToEdit
      setCurrentProveedor(proveedor)
      setModalTitle("Editar Proveedor")

      // Cargar datos del proveedor en el formulario
      setFormData({
        documento: proveedor.documento,
        correo: proveedor.correo,
        nombreEmpresa: proveedor.nombreEmpresa,
        personaDeContacto: proveedor.personaDeContacto,
        telefono: proveedor.telefono,
        direccion: proveedor.direccion,
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombreEmpresa: "",
        personaDeContacto: "",
        telefono: "",
        direccion: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar proveedor:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar el proveedor",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de un proveedor
   */
  const handleConfirmToggleStatus = (proveedor) => {
    setProveedorToToggle(proveedor)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de un proveedor
   */
  const handleToggleStatus = async () => {
    if (!proveedorToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage(`Cambiando estado del proveedor...`)

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      const proveedorId = proveedorToToggle.id || proveedorToToggle.IdProveedor

      if (!proveedorId) {
        throw new Error("Error: Proveedor sin ID válido")
      }

      const nuevoEstado = proveedorToToggle.estado === "Activo" ? "Inactivo" : "Activo"

      // Actualizar estado local primero
      setProveedores((prevProveedores) =>
        prevProveedores.map((p) => {
          if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
            return { ...p, estado: nuevoEstado }
          }
          return p
        }),
      )

      // Llamar a la API para cambiar el estado
      const resultado = await proveedoresService.updateStatus(proveedorId, nuevoEstado)

      if (resultado.IdProveedor && resultado.IdProveedor !== proveedorId) {
        setProveedores((prevProveedores) =>
          prevProveedores.map((p) => {
            if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
              return {
                ...p,
                id: resultado.IdProveedor,
                IdProveedor: resultado.IdProveedor,
                estado: resultado.estado || nuevoEstado,
              }
            }
            return p
          }),
        )
      }

      // Guardar el toast para después
      const newStatus = proveedorToToggle.estado === "Activo" ? "inactivo" : "activo"
      pendingToastRef.current = {
        type: "success",
        message: `El proveedor "${proveedorToToggle.nombreEmpresa}" ahora está ${newStatus}.`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado del proveedor",
      }
    }

    // Cerrar el modal de confirmación
    setProveedorToToggle(null)
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setProveedorToToggle(null)
  }

  /**
   * Manejador para confirmar la eliminación de un proveedor
   */
  const handleConfirmDelete = (proveedor) => {
    setProveedorToDelete(proveedor)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (proveedorToDelete) {
      try {
        setShowDeleteConfirm(false)
        setIsProcessing(true)
        setProcessingMessage("Eliminando proveedor...")

        const proveedorId = proveedorToDelete.id || proveedorToDelete.IdProveedor

        if (!proveedorId) {
          throw new Error("Error: Proveedor sin ID válido")
        }

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Llamar a la API para eliminar el proveedor
        await proveedoresService.delete(proveedorId)

        // Actualizar el estado local
        setProveedores((prevProveedores) =>
          prevProveedores.filter((p) => p.id !== proveedorId && p.IdProveedor !== proveedorId),
        )

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: `El proveedor "${proveedorToDelete.nombreEmpresa}" ha sido eliminado correctamente.`,
        }

        setIsProcessing(false)
      } catch (error) {
        setIsProcessing(false)
        console.error("Error al eliminar proveedor:", error)

        let errorMessage = "Error al eliminar el proveedor. Por favor, intente nuevamente."
        if (error.response && error.response.status === 400) {
          errorMessage = error.response.data.message || errorMessage
        }

        pendingToastRef.current = {
          type: "error",
          message: errorMessage,
        }
      }
      setProveedorToDelete(null)
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setProveedorToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar proveedor
   */
  const handleAddProveedor = () => {
    setCurrentProveedor(null)
    setModalTitle("Agregar Proveedor")

    // Resetear el formulario
    setFormData({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
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
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    }

    if (!formData.nombreEmpresa.trim()) {
      errors.nombreEmpresa = "El nombre de la empresa es obligatorio"
      isValid = false
    } else if (formData.nombreEmpresa.trim().length > 100) {
      errors.nombreEmpresa = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    }

    if (!formData.personaDeContacto.trim()) {
      errors.personaDeContacto = "La persona de contacto es obligatoria"
      isValid = false
    } else if (formData.personaDeContacto.trim().length > 100) {
      errors.personaDeContacto = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    }

    if (!formData.documento.trim()) {
      errors.documento = "El documento es obligatorio"
      isValid = false
    } else {
      const documentoRegex = /^[0-9]{6,12}(-[0-9kK])?$/
      if (!documentoRegex.test(formData.documento.trim())) {
        errors.documento = "El documento debe tener un formato válido (ej: 900123456-7)"
        isValid = false
      } else {
        const documentoExiste = proveedores.some(
          (p) =>
            p.documento.toLowerCase() === formData.documento.trim().toLowerCase() &&
            (!currentProveedor || p.id !== currentProveedor.id),
        )

        if (documentoExiste) {
          errors.documento = "Ya existe un proveedor con este documento"
          isValid = false
        }
      }
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
      isValid = false
    } else {
      const telefonoRegex = /^[0-9]{7,10}$/
      if (!telefonoRegex.test(formData.telefono.replace(/\s+/g, ""))) {
        errors.telefono = "El teléfono debe tener entre 7 y 10 dígitos"
        isValid = false
      }
    }

    if (formData.correo.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo.trim())) {
        errors.correo = "El correo electrónico no tiene un formato válido"
        isValid = false
      }
    }

    if (formData.direccion.trim() && formData.direccion.trim().length > 200) {
      errors.direccion = "La dirección no puede exceder los 200 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el proveedor
   */
  const handleSaveProveedor = async () => {
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
      setProcessingMessage(currentProveedor ? "Actualizando proveedor..." : "Creando nuevo proveedor...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      const proveedorData = {
        Documento: formData.documento.trim(),
        Correo: formData.correo.trim(),
        NombreEmpresa: formData.nombreEmpresa.trim(),
        PersonaDeContacto: formData.personaDeContacto.trim(),
        Telefono: formData.telefono.trim(),
        Direccion: formData.direccion.trim(),
        Estado: "Activo",
      }

      if (currentProveedor) {
        // Actualizar proveedor existente
        const proveedorId = currentProveedor.id || currentProveedor.IdProveedor

        if (!proveedorId) {
          throw new Error("Error: Proveedor sin ID válido")
        }

        const idNumerico = Number.parseInt(proveedorId, 10)
        if (isNaN(idNumerico)) {
          throw new Error(`Error: ID de proveedor inválido: ${proveedorId}`)
        }

        // Actualización optimista del estado local
        setProveedores((prevProveedores) =>
          prevProveedores.map((p) => {
            if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
              return {
                ...p,
                documento: formData.documento.trim(),
                correo: formData.correo.trim(),
                nombreEmpresa: formData.nombreEmpresa.trim(),
                personaDeContacto: formData.personaDeContacto.trim(),
                telefono: formData.telefono.trim(),
                direccion: formData.direccion.trim(),
              }
            }
            return p
          }),
        )

        // Llamada al servidor para actualizar
        const updatedProveedor = await proveedoresService.update(idNumerico, proveedorData)

        // Actualización con respuesta del servidor
        if (updatedProveedor) {
          setProveedores((prevProveedores) =>
            prevProveedores.map((p) => {
              if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
                return {
                  ...p,
                  ...updatedProveedor,
                  id: updatedProveedor.id || updatedProveedor.IdProveedor || proveedorId,
                  IdProveedor: updatedProveedor.id || updatedProveedor.IdProveedor || proveedorId,
                }
              }
              return p
            }),
          )
        }

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El proveedor "${formData.nombreEmpresa.trim()}" ha sido actualizado correctamente.`,
        }
      } else {
        // Crear nuevo proveedor
        const newProveedor = await proveedoresService.create(proveedorData)

        if (!newProveedor.id && !newProveedor.IdProveedor) {
          throw new Error("El servidor no devolvió un ID válido")
        }

        setProveedores((prevProveedores) => [...prevProveedores, newProveedor])
        setReloadTrigger((prev) => !prev)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El proveedor "${formData.nombreEmpresa.trim()}" ha sido creado correctamente.`,
        }
      }

      // Cerrar el modal
      handleCloseModal()
      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al guardar proveedor:", error)

      let errorMessage = "Error al guardar el proveedor. Por favor, intente nuevamente."

      if (error.isEmailDuplicate) {
        errorMessage = "Ya existe un proveedor con este correo electrónico."
        setFormErrors({
          ...formErrors,
          correo: "Este correo electrónico ya está registrado",
        })
      } else if (error.isDocumentDuplicate) {
        errorMessage = "Ya existe un proveedor con este documento."
        setFormErrors({
          ...formErrors,
          documento: "Este documento ya está registrado",
        })
      } else if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message

          if (errorMessage.includes("Duplicate entry") && errorMessage.includes("CorreoProveedor")) {
            errorMessage = "Ya existe un proveedor con este correo electrónico."
            setFormErrors({
              ...formErrors,
              correo: "Este correo electrónico ya está registrado",
            })
          } else if (errorMessage.includes("Duplicate entry") && errorMessage.includes("Documento")) {
            errorMessage = "Ya existe un proveedor con este documento."
            setFormErrors({
              ...formErrors,
              documento: "Este documento ya está registrado",
            })
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      pendingToastRef.current = {
        type: "error",
        message: errorMessage,
      }
      showPendingToast()
    }
  }

  return (
    <div className="proveedores-container">
      <h2 className="mb-4">Gestión de Proveedores</h2>

      <DataTable
        columns={columns}
        data={proveedores}
        onAdd={handleAddProveedor}
        addButtonLabel="Agregar Proveedor"
        searchPlaceholder="Buscar proveedores..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Proveedor */}
      <ProveedorForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveProveedor}
        onClose={handleCloseModal}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar el proveedor "${proveedorToEdit?.nombreEmpresa}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${proveedorToToggle?.estado === "Activo" ? "desactivar" : "activar"} el proveedor "${proveedorToToggle?.nombreEmpresa}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        proveedor={proveedorToDelete}
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

export default Proveedores
