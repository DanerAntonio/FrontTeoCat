"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Clientes.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import ClienteForm from "../../../Components/AdminComponents/ClientesComponents/ClienteForm"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import clientesService from "../../../Services/ConsumoAdmin/ClientesService.js"

// Importar los estilos SCSS
import "../../../Components/AdminComponents/ClientesComponents/ClienteForm.scss"

/**
 * Componente para la gestión de clientes
 * Permite visualizar, crear, editar y cambiar el estado de clientes en el sistema
 */
const Clientes = () => {
  // Estado para los clientes
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Cliente")
  const [currentCliente, setCurrentCliente] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [clienteToEdit, setClienteToEdit] = useState(null)
  const [clienteToToggle, setClienteToToggle] = useState(null)

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
   * Implementa la llamada a la API para obtener clientes
   */
  useEffect(() => {
    clearAllToasts()
    fetchClientes()

    return () => {
      clearAllToasts()
    }
  }, [])

  /**
   * Función para obtener todos los clientes desde la API
   */
  const fetchClientes = async () => {
    setLoading(true)
    try {
      console.log("Iniciando carga de clientes...")
      const data = await clientesService.getAll()
      console.log("Clientes cargados exitosamente:", data)

      // Obtener estados guardados en localStorage
      const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")

      // Aplicar estados guardados localmente
      const clientesConEstadoActualizado = data.map((cliente) => {
        const estadoGuardado = clientesEstados[cliente.IdCliente]
        if (estadoGuardado) {
          console.log(`Aplicando estado guardado para cliente ID ${cliente.IdCliente}:`, estadoGuardado)
          return {
            ...cliente,
            Estado: estadoGuardado,
          }
        }
        return cliente
      })

      setClientes(clientesConEstadoActualizado)
    } catch (error) {
      console.error("Error al cargar los clientes:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los clientes. Por favor, intente nuevamente.",
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente después de que se complete la carga
      showPendingToast()
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    {
      field: "nombreCompleto",
      header: "Nombre",
      render: (row) => `${row.Nombre} ${row.Apellido}`,
    },
    { field: "Correo", header: "Correo" },
    { field: "Documento", header: "Documento" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => {
        // Asegurarse de que Estado sea siempre un string
        const estado =
          typeof row.Estado === "number" ? (row.Estado === 1 ? "Activo" : "Inactivo") : row.Estado || "Inactivo"

        return <span className={`badge ${estado === "Activo" ? "bg-success" : "bg-danger"}`}>{estado}</span>
      },
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", row.tieneVentas ? null : "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleConfirmEdit}
          onToggleStatus={handleConfirmToggleStatus}
          onDelete={handleConfirmDelete}
          customLabels={{
            toggleStatus: row.Estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un cliente
   * @param {Object} cliente - Objeto de cliente a visualizar
   */
  const handleView = (cliente) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles del cliente...")

      setCurrentCliente(cliente)
      setModalTitle("Ver Detalles del Cliente")

      // Cargar datos del cliente en el formulario
      setFormData({
        documento: cliente.Documento,
        correo: cliente.Correo,
        nombre: cliente.Nombre,
        apellido: cliente.Apellido,
        direccion: cliente.Direccion,
        telefono: cliente.Telefono,
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombre: "",
        apellido: "",
        direccion: "",
        telefono: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles del cliente:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles del cliente",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de un cliente
   */
  const handleConfirmEdit = (cliente) => {
    // Abrir directamente el formulario de edición sin mostrar el diálogo de confirmación
    confirmEdit(cliente)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async (cliente) => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos del cliente...")

      // Usar el cliente pasado como parámetro o el que está en clienteToEdit
      const clienteToProcess = cliente || clienteToEdit
      setCurrentCliente(clienteToProcess)
      setModalTitle("Editar Cliente")

      // Cargar datos del cliente en el formulario
      setFormData({
        documento: clienteToProcess.Documento,
        correo: clienteToProcess.Correo,
        nombre: clienteToProcess.Nombre,
        apellido: clienteToProcess.Apellido,
        direccion: clienteToProcess.Direccion,
        telefono: clienteToProcess.Telefono,
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombre: "",
        apellido: "",
        direccion: "",
        telefono: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar cliente:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar el cliente",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de un cliente
   */
  const handleConfirmToggleStatus = (cliente) => {
    setClienteToToggle(cliente)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de un cliente
   */
  const handleToggleStatus = async () => {
    if (!clienteToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage(`Cambiando estado del cliente...`)

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Verificar que el cliente tenga un ID válido
      if (!clienteToToggle.IdCliente) {
        throw new Error("Error: Cliente sin ID válido")
      }

      // Asegurarse de que el ID sea un número
      const idNumerico = Number.parseInt(clienteToToggle.IdCliente, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`Error: ID de cliente inválido: ${clienteToToggle.IdCliente}`)
      }

      const nuevoEstado = clienteToToggle.Estado === "Activo" ? "Inactivo" : "Activo"

      // Actualizar primero en el estado local para mejorar la experiencia de usuario
      setClientes((prevClientes) =>
        prevClientes.map((c) => {
          if (c.IdCliente === idNumerico) {
            return {
              ...c,
              Estado: nuevoEstado,
            }
          }
          return c
        }),
      )

      // Usar el método específico para actualizar el estado
      await clientesService.updateStatus(idNumerico, nuevoEstado)

      // Guardar el toast para después
      const newStatus = clienteToToggle.Estado === "Activo" ? "inactivo" : "activo"
      pendingToastRef.current = {
        type: "success",
        message: `El cliente "${clienteToToggle.Nombre} ${clienteToToggle.Apellido}" ahora está ${newStatus}.`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado del cliente",
      }
    }

    // Cerrar el modal de confirmación
    setClienteToToggle(null)
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setClienteToToggle(null)
  }

  /**
   * Manejador para confirmar la eliminación de un cliente
   */
  const handleConfirmDelete = async (cliente) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Verificando dependencias...")

      // Verificar si el cliente tiene ventas o mascotas asociadas
      if (cliente.tieneVentas) {
        setIsProcessing(false)
        pendingToastRef.current = {
          type: "error",
          message: "No se puede eliminar el cliente porque tiene ventas asociadas.",
        }
        showPendingToast()
        return
      }

      // Verificar si el cliente tiene mascotas asociadas
      const mascotas = await clientesService.getMascotas(cliente.IdCliente)
      if (mascotas && mascotas.length > 0) {
        setIsProcessing(false)
        pendingToastRef.current = {
          type: "error",
          message: `No se puede eliminar el cliente porque tiene ${mascotas.length} mascota(s) asociada(s).`,
        }
        showPendingToast()
        return
      }

      // Si no tiene dependencias, mostrar el modal de confirmación
      setIsProcessing(false)
      setClienteToDelete(cliente)
      setShowDeleteConfirm(true)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al verificar dependencias del cliente:", error)

      // Si hay un error al verificar, mostrar el modal de todas formas
      // El servidor validará nuevamente al intentar eliminar
      setClienteToDelete(cliente)
      setShowDeleteConfirm(true)
    }
  }

  /**
   * Función para confirmar la eliminación de un cliente
   */
  const confirmDelete = async () => {
    if (clienteToDelete) {
      try {
        setShowDeleteConfirm(false)
        setIsProcessing(true)
        setProcessingMessage("Eliminando cliente...")

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Eliminar en el servidor
        await clientesService.delete(clienteToDelete.IdCliente)

        // Actualizar estado local
        const updatedClientes = clientes.filter((c) => c.IdCliente !== clienteToDelete.IdCliente)
        setClientes(updatedClientes)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: `El cliente "${clienteToDelete.Nombre} ${clienteToDelete.Apellido}" ha sido eliminado correctamente.`,
        }

        setIsProcessing(false)
      } catch (error) {
        setIsProcessing(false)
        console.error("Error al eliminar cliente:", error)

        // Verificar si el error es por dependencias
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data &&
          (error.response.data.message?.toLowerCase().includes("mascota") ||
            error.response.data.message?.toLowerCase().includes("venta") ||
            error.response.data.message?.toLowerCase().includes("cita"))
        ) {
          pendingToastRef.current = {
            type: "error",
            message:
              error.response.data.message || "No se puede eliminar el cliente porque tiene dependencias asociadas.",
          }
        } else {
          pendingToastRef.current = {
            type: "error",
            message: "Error al eliminar el cliente. Por favor, intente nuevamente.",
          }
        }
        showPendingToast()
      }
      setClienteToDelete(null)
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setClienteToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar cliente
   */
  const handleAddCliente = () => {
    setCurrentCliente(null)
    setModalTitle("Agregar Cliente")

    // Resetear el formulario
    setFormData({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
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
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    }

    // Validar documento (requerido y formato)
    if (!formData.documento.trim()) {
      errors.documento = "El documento es obligatorio"
      isValid = false
    } else if (!/^\d{7,12}$/.test(formData.documento)) {
      errors.documento = "El documento debe tener entre 7 y 12 dígitos"
      isValid = false
    } else {
      // Verificar si el documento ya existe (excepto para el cliente actual en edición)
      const documentoExiste = clientes.some(
        (c) => c.Documento === formData.documento && (!currentCliente || c.IdCliente !== currentCliente.IdCliente),
      )
      if (documentoExiste) {
        errors.documento = "Este documento ya está registrado"
        isValid = false
      }
    }

    // Validar correo (requerido y formato)
    if (!formData.correo.trim()) {
      errors.correo = "El correo es obligatorio"
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo)) {
        errors.correo = "Formato de correo inválido"
        isValid = false
      } else {
        // Verificar si el correo ya existe (excepto para el cliente actual en edición)
        const correoExiste = clientes.some(
          (c) => c.Correo === formData.correo && (!currentCliente || c.IdCliente !== currentCliente.IdCliente),
        )
        if (correoExiste) {
          errors.correo = "Este correo ya está registrado"
          isValid = false
        }
      }
    }

    // Validar nombre (requerido)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 50) {
      errors.nombre = "El nombre no puede exceder los 50 caracteres"
      isValid = false
    }

    // Validar apellido (requerido)
    if (!formData.apellido.trim()) {
      errors.apellido = "El apellido es obligatorio"
      isValid = false
    } else if (formData.apellido.trim().length > 50) {
      errors.apellido = "El apellido no puede exceder los 50 caracteres"
      isValid = false
    }

    // Validar teléfono (requerido y formato)
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
      isValid = false
    } else if (!/^\d{7,10}$/.test(formData.telefono)) {
      errors.telefono = "El teléfono debe tener entre 7 y 10 dígitos"
      isValid = false
    }

    // Validar dirección (requerida)
    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es obligatoria"
      isValid = false
    } else if (formData.direccion.trim().length > 100) {
      errors.direccion = "La dirección no puede exceder los 100 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el cliente (crear nuevo o actualizar existente)
   * Valida los datos y envía la información
   */
  const handleSaveCliente = async () => {
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
      setProcessingMessage(currentCliente ? "Actualizando cliente..." : "Creando nuevo cliente...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Preparar datos para enviar al servidor
      const clienteData = {
        Documento: formData.documento,
        Correo: formData.correo,
        Nombre: formData.nombre,
        Apellido: formData.apellido,
        Direccion: formData.direccion,
        Telefono: formData.telefono,
        Estado: "Activo",
      }

      // Verificar que todos los campos requeridos tengan valores
      const camposRequeridos = ["Documento", "Correo", "Nombre", "Apellido"]
      const camposFaltantes = camposRequeridos.filter((campo) => !clienteData[campo])

      if (camposFaltantes.length > 0) {
        setIsProcessing(false)
        pendingToastRef.current = {
          type: "error",
          message: `Faltan campos requeridos: ${camposFaltantes.join(", ")}`,
        }
        showPendingToast()
        return
      }

      let resultado

      if (currentCliente) {
        // Actualizar cliente existente
        resultado = await clientesService.update(currentCliente.IdCliente, clienteData)

        // Asegurarnos que el cliente actualizado tenga el ID correcto
        const clienteConID = {
          ...resultado,
          IdCliente: currentCliente.IdCliente, // Asegurar que el ID se mantenga
        }

        // Actualizar estado local
        const updatedClientes = clientes.map((c) => {
          if (c.IdCliente === currentCliente.IdCliente) {
            return clienteConID
          }
          return c
        })

        setClientes(updatedClientes)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El cliente "${formData.nombre} ${formData.apellido}" ha sido actualizado correctamente.`,
        }
      } else {
        // Crear nuevo cliente
        resultado = await clientesService.create(clienteData)

        // Verificar que la respuesta tenga un ID válido
        if (!resultado || !resultado.IdCliente) {
          throw new Error("La respuesta del servidor no contiene un ID de cliente válido")
        }

        // Actualizar estado local con una copia profunda para evitar referencias
        const nuevoCliente = JSON.parse(JSON.stringify(resultado))
        setClientes((prevClientes) => [...prevClientes, nuevoCliente])

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El cliente "${formData.nombre} ${formData.apellido}" ha sido creado correctamente.`,
        }
      }

      // Cerrar el modal
      handleCloseModal()
      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al guardar cliente:", error)

      // Mostrar mensaje de error más detallado
      let errorMessage = "Error al guardar el cliente. Por favor, intente nuevamente."

      // Verificar si es un error de documento duplicado
      if (
        error.isDocumentDuplicate ||
        (error.response &&
          error.response.data &&
          (error.response.data.message?.includes("Duplicate entry") ||
            error.response.data.error?.includes("Duplicate entry")))
      ) {
        errorMessage = "Ya existe un cliente con este número de documento."

        // Actualizar el error específico en el formulario
        setFormErrors({
          ...formErrors,
          documento: "Este documento ya está registrado",
        })
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }

      pendingToastRef.current = {
        type: "error",
        message: errorMessage,
      }
      showPendingToast()
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("clienteModal")

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
    <div className="clientes-container">
      <h2 className="mb-4">Gestión de Clientes</h2>

      <DataTable
        columns={columns}
        data={clientes}
        onAdd={handleAddCliente}
        addButtonLabel="Agregar Cliente"
        searchPlaceholder="Buscar clientes..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Cliente */}
      <ClienteForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSaveCliente={handleSaveCliente}
        handleCloseModal={handleCloseModal}
        isViewMode={modalTitle === "Ver Detalles del Cliente"}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar el cliente "${clienteToEdit?.Nombre} ${clienteToEdit?.Apellido}"?`}
        type="info"
        onConfirm={() => confirmEdit()}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${clienteToToggle?.Estado === "Activo" ? "desactivar" : "activar"} el cliente "${clienteToToggle?.Nombre} ${clienteToToggle?.Apellido}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar al cliente{" "}
            <strong>
              {clienteToDelete?.Nombre} {clienteToDelete?.Apellido}
            </strong>
            ?
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

export default Clientes