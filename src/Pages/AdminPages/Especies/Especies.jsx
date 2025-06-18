"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import EspecieForm from "../../../Components/AdminComponents/EspeciesConmponents/EspecieForm.jsx"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import especiesService from "../../../Services/ConsumoAdmin/EspeciesService.js"
import axiosInstance from "../../../Services/ConsumoAdmin/axios.js"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"

/**
 * Componente para la gestión de especies
 * Permite visualizar, crear, editar, activar/desactivar y eliminar especies
 */
const Especies = () => {
  // Estado para las especies
  const [especies, setEspecies] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Especie")
  const [currentEspecie, setCurrentEspecie] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombreEspecie: "",
    // Se ha eliminado la propiedad estado
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [especieToDelete, setEspecieToDelete] = useState(null)
  const [especieToEdit, setEspecieToEdit] = useState(null)
  const [especieToToggle, setEspecieToToggle] = useState(null)

  // Referencias para las notificaciones
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)

  // Estado para el LoadingOverlay
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Función para mostrar toast
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

  // Cargar datos iniciales
  useEffect(() => {
    clearAllToasts()
    fetchData()

    return () => {
      clearAllToasts()
    }
  }, [])

  const fetchData = async () => {
    try {
      // Cargar especies
      const especiesData = await especiesService.getAll()
      console.log("Datos de especies cargados:", especiesData)

      // Obtener estados guardados en localStorage
      const especiesEstados = JSON.parse(localStorage.getItem("especiesEstados") || "{}")

      // Aplicar estados guardados localmente y normalizar los datos
      const especiesNormalizadas = especiesData.map((especie) => {
        const estadoGuardado = especiesEstados[especie.IdEspecie]

        // Normalizar la estructura de datos para asegurar consistencia
        const especieNormalizada = {
          ...especie,
          // Normalizar el ID
          IdEspecie: especie.IdEspecie || especie.id,
          // Normalizar el nombre
          NombreEspecie: especie.NombreEspecie || especie.nombreEspecie,
          // Normalizar el estado
          Estado: estadoGuardado || especie.Estado || "Activo",
        }

        // Guardar la especie normalizada en localStorage para persistencia
        if (especieNormalizada.IdEspecie) {
          const especiesGuardadas = JSON.parse(localStorage.getItem("especiesData") || "{}")
          especiesGuardadas[especieNormalizada.IdEspecie] = especieNormalizada
          localStorage.setItem("especiesData", JSON.stringify(especiesGuardadas))
        }

        return especieNormalizada
      })

      console.log("Especies normalizadas:", especiesNormalizadas)
      setEspecies(especiesNormalizadas)
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos. Por favor, intente nuevamente.",
      }

      // Intentar cargar datos desde localStorage como respaldo
      try {
        const especiesGuardadas = JSON.parse(localStorage.getItem("especiesData") || "{}")
        if (Object.keys(especiesGuardadas).length > 0) {
          const especiesArray = Object.values(especiesGuardadas)
          console.log("Cargando especies desde localStorage:", especiesArray)
          setEspecies(especiesArray)

          pendingToastRef.current = {
            type: "info",
            message: "Se cargaron datos guardados localmente mientras se resuelven los problemas de conexión.",
          }
        }
      } catch (localError) {
        console.error("Error al cargar datos desde localStorage:", localError)
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente
      showPendingToast()
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "NombreEspecie", header: "Nombre de la Especie" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => {
        // Convertir valores numéricos a texto
        let estadoTexto = row.Estado

        // Si es un número, convertirlo a texto
        if (typeof row.Estado === "number") {
          estadoTexto = row.Estado === 1 ? "Activo" : "Inactivo"
        }

        // Si no hay valor, usar "Activo" por defecto
        if (row.Estado === undefined || row.Estado === null) {
          estadoTexto = "Activo"
        }

        return <span className={`badge ${estadoTexto === "Activo" ? "bg-success" : "bg-danger"}`}>{estadoTexto}</span>
      },
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
            toggleStatus: row.Estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una especie
   * @param {Object} especie - Objeto de especie a visualizar
   */
  const handleView = (especie) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles de la especie...")

      setCurrentEspecie(especie)
      setModalTitle("Ver Detalles de la Especie")

      // Cargar datos de la especie en el formulario
      setFormData({
        nombreEspecie: especie.NombreEspecie,
        // Se ha eliminado la propiedad estado
      })

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar detalles de la especie:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles de la especie",
      }
    } finally {
      setIsProcessing(false)
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de una especie
   */
  const handleConfirmEdit = (especie) => {
    setEspecieToEdit(especie)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Preparando edición de la especie...")

      const especie = especieToEdit
      setCurrentEspecie(especie)
      setModalTitle("Editar Especie")

      // Cargar datos de la especie en el formulario
      setFormData({
        nombreEspecie: especie.NombreEspecie,
        // Se ha eliminado la propiedad estado
      })

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar datos para editar especie:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar la especie",
      }
    } finally {
      setIsProcessing(false)
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de una especie
   */
  const handleConfirmToggleStatus = (especie) => {
    setEspecieToToggle(especie)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de una especie
   */
  const handleToggleStatus = async () => {
    if (!especieToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cambiando estado de la especie...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Verificar que la especie tenga un ID válido
      if (!especieToToggle.IdEspecie) {
        throw new Error("Error: Especie sin ID válido")
      }

      // Guardar el ID de la especie para referencia
      const especieId = especieToToggle.IdEspecie

      // Asegurar que el estado actual sea un string
      let estadoActual = especieToToggle.Estado

      // Convertir valores numéricos a texto
      if (typeof estadoActual === "number") {
        estadoActual = estadoActual === 1 ? "Activo" : "Inactivo"
      }

      // Si no hay valor, usar "Activo" por defecto
      if (estadoActual === undefined || estadoActual === null) {
        estadoActual = "Activo"
      }

      const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo"

      // Actualizar primero en el estado local para mejorar la experiencia de usuario
      setEspecies((prevEspecies) =>
        prevEspecies.map((e) => {
          if (e.IdEspecie === especieId) {
            return {
              ...e,
              Estado: nuevoEstado,
            }
          }
          return e
        }),
      )

      // Guardar el estado en localStorage para persistencia
      const especiesEstados = JSON.parse(localStorage.getItem("especiesEstados") || "{}")
      especiesEstados[especieId] = nuevoEstado
      localStorage.setItem("especiesEstados", JSON.stringify(especiesEstados))

      // Convertir a formato numérico para la API
      const estadoNumerico = nuevoEstado === "Activo" ? 1 : 0

      // Llamar directamente al endpoint con solo el campo Estado
      await axiosInstance.put(`/customers/especies/${especieId}`, { Estado: estadoNumerico })

      // Guardar el toast para después
      const newStatus = estadoActual === "Activo" ? "inactiva" : "activa"
      pendingToastRef.current = {
        type: "success",
        message: `La especie "${especieToToggle.NombreEspecie}" ahora está ${newStatus}.`,
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado de la especie",
      }

      // Revertir el cambio en el estado local si hubo error
      if (especieToToggle && especieToToggle.IdEspecie) {
        setEspecies((prevEspecies) =>
          prevEspecies.map((e) => {
            if (e.IdEspecie === especieToToggle.IdEspecie) {
              // Revertir al estado original
              return {
                ...e,
                Estado: especieToToggle.Estado,
              }
            }
            return e
          }),
        )

        // También revertir en localStorage
        try {
          const especiesEstados = JSON.parse(localStorage.getItem("especiesEstados") || "{}")
          especiesEstados[especieToToggle.IdEspecie] = especieToToggle.Estado
          localStorage.setItem("especiesEstados", JSON.stringify(especiesEstados))
        } catch (e) {
          console.error("Error al revertir estado en localStorage:", e)
        }
      }
    } finally {
      setIsProcessing(false)
      showPendingToast()
      // Cerrar el modal de confirmación
      setEspecieToToggle(null)
    }
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setEspecieToToggle(null)
  }

  /**
   * Manejador para confirmar la eliminación de una especie
   */
  const handleConfirmDelete = async (especie) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Verificando dependencias...")

      // Verificar si la especie tiene mascotas asociadas
      const tieneMascotas = await especiesService.checkDependencies(especie.IdEspecie)

      if (tieneMascotas) {
        pendingToastRef.current = {
          type: "error",
          message: "No se puede eliminar la especie porque tiene mascotas asociadas.",
        }
        setIsProcessing(false)
        showPendingToast()
        return
      }

      // Si no tiene dependencias, mostrar el modal de confirmación
      setEspecieToDelete(especie)
      setShowDeleteConfirm(true)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error al verificar dependencias de la especie:", error)

      pendingToastRef.current = {
        type: "error",
        message: "Error al verificar dependencias de la especie.",
      }
      setIsProcessing(false)
      showPendingToast()
    }
  }

  /**
   * Función para confirmar la eliminación de una especie
   */
  const confirmDelete = async () => {
    if (especieToDelete) {
      try {
        setShowDeleteConfirm(false)
        setIsProcessing(true)
        setProcessingMessage("Eliminando especie...")

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Verificar que la especie tenga un ID válido
        if (!especieToDelete.IdEspecie) {
          throw new Error("Error: Especie sin ID válido")
        }

        // Eliminar en el servidor
        try {
          // Verificar nuevamente si la especie tiene mascotas asociadas
          const tieneMascotas = await especiesService.checkDependencies(especieToDelete.IdEspecie)
          if (tieneMascotas) {
            throw new Error("No se puede eliminar la especie porque tiene mascotas asociadas.")
          }

          // Intentar eliminar directamente con axiosInstance
          await axiosInstance.delete(`/customers/especies/${especieToDelete.IdEspecie}`)

          // Si llegamos aquí, la eliminación fue exitosa
          // Actualizar estado local
          const updatedEspecies = especies.filter((e) => e.IdEspecie !== especieToDelete.IdEspecie)
          setEspecies(updatedEspecies)

          // Eliminar de localStorage
          try {
            const especiesGuardadas = JSON.parse(localStorage.getItem("especiesData") || "{}")
            delete especiesGuardadas[especieToDelete.IdEspecie]
            localStorage.setItem("especiesData", JSON.stringify(especiesGuardadas))

            const especiesEstados = JSON.parse(localStorage.getItem("especiesEstados") || "{}")
            delete especiesEstados[especieToDelete.IdEspecie]
            localStorage.setItem("especiesEstados", JSON.stringify(especiesEstados))
          } catch (e) {
            console.error("Error al eliminar de localStorage:", e)
          }

          // Guardar el toast para después
          pendingToastRef.current = {
            type: "info",
            message: `La especie "${especieToDelete.NombreEspecie}" ha sido eliminada correctamente.`,
          }
        } catch (error) {
          console.error("Error al eliminar especie:", error)

          // Verificar si el error es por dependencias con mascotas
          if (error.message && error.message.toLowerCase().includes("mascotas")) {
            pendingToastRef.current = {
              type: "error",
              message: "No se puede eliminar la especie porque tiene mascotas asociadas.",
            }
          } else {
            pendingToastRef.current = {
              type: "error",
              message: "Error al eliminar la especie. Por favor, intente nuevamente.",
            }
          }
        }
      } catch (error) {
        console.error("Error al eliminar especie:", error)

        // Verificar si el error es por dependencias con mascotas
        if (error.message && error.message.toLowerCase().includes("mascotas")) {
          pendingToastRef.current = {
            type: "error",
            message: "No se puede eliminar la especie porque tiene mascotas asociadas.",
          }
        } else {
          pendingToastRef.current = {
            type: "error",
            message: "Error al eliminar la especie. Por favor, intente nuevamente.",
          }
        }
      } finally {
        setIsProcessing(false)
        showPendingToast()
        setEspecieToDelete(null)
      }
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setEspecieToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar especie
   */
  const handleAddEspecie = () => {
    setCurrentEspecie(null)
    setModalTitle("Agregar Especie")

    // Resetear el formulario
    setFormData({
      nombreEspecie: "",
      // Se ha eliminado la propiedad estado
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
  }

  /**
   * Manejador para guardar la especie
   */
  const handleSaveEspecie = async () => {
    // Validaciones básicas
    if (!formData.nombreEspecie.trim()) {
      pendingToastRef.current = {
        type: "error",
        message: "Por favor, ingrese el nombre de la especie.",
      }
      showPendingToast()
      return
    }

    try {
      setIsProcessing(true)
      setProcessingMessage(currentEspecie ? "Actualizando especie..." : "Creando especie...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Preparar datos para enviar al servidor
      const especieData = {
        NombreEspecie: formData.nombreEspecie,
      }

      if (currentEspecie) {
        // Actualizar especie existente
        // Mantener el estado actual de la especie al actualizar
        especieData.Estado = currentEspecie.Estado === "Activo" || currentEspecie.Estado === 1 ? 1 : 0

        const updatedEspecie = await especiesService.update(currentEspecie.IdEspecie, especieData)

        // Actualizar estado local
        setEspecies((prevEspecies) =>
          prevEspecies.map((e) => {
            if (e.IdEspecie === currentEspecie.IdEspecie) {
              return {
                ...updatedEspecie,
                Estado: updatedEspecie.Estado === 1 || updatedEspecie.Estado === true ? "Activo" : "Inactivo",
              }
            }
            return e
          }),
        )

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La especie "${formData.nombreEspecie}" ha sido actualizada correctamente.`,
        }
      } else {
        // Crear nueva especie - siempre activa por defecto
        especieData.Estado = 1

        const newEspecie = await especiesService.create(especieData)

        // Actualizar estado local
        setEspecies([
          ...especies,
          {
            ...newEspecie,
            Estado: "Activo", // Siempre "Activo" para nuevas especies
          },
        ])

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La especie "${formData.nombreEspecie}" ha sido creada correctamente.`,
        }
      }

      // Cerrar el modal
      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar especie:", error)

      pendingToastRef.current = {
        type: "error",
        message: "Error al guardar la especie. Por favor, intente nuevamente.",
      }
    } finally {
      setIsProcessing(false)
      showPendingToast()
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("especieModal")

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
    <div className="especies-container">
      <h2 className="mb-4">Gestión de Especies</h2>

      <DataTable
        columns={columns}
        data={especies}
        onAdd={handleAddEspecie}
        addButtonLabel="Agregar Especie"
        searchPlaceholder="Buscar especies..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Especie */}
      <EspecieForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSaveEspecie}
        onClose={handleCloseModal}
        isViewMode={modalTitle === "Ver Detalles de la Especie"}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar la especie "${especieToEdit?.NombreEspecie}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${especieToToggle?.Estado === "Activo" ? "desactivar" : "activar"} la especie "${especieToToggle?.NombreEspecie}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar la especie <strong>{especieToDelete?.NombreEspecie}</strong>?
            <br />
            <span className="text-danger">Esta acción no se puede deshacer.</span>
          </>
        }
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* LoadingOverlay para mostrar estado de procesamiento */}
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

export default Especies
