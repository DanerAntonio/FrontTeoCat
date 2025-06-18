"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
// Cambiamos la extensión de .css a .scss para que coincida con el archivo real
import "../../../Styles/AdminStyles/NuevaCita.scss"

// Importar componentes
import { StepIndicator } from "../../../Components/AdminComponents/CitasComponents/step-indicator"
import { DateTimeStep } from "../../../Components/AdminComponents/CitasComponents/date-time-step"
import { ServicesStep } from "../../../Components/AdminComponents/CitasComponents/services-step"
import { ClientStep } from "../../../Components/AdminComponents/CitasComponents/client-step"
import { PetStep } from "../../../Components/AdminComponents/CitasComponents/pet-step"
import { AppointmentSummary } from "../../../Components/AdminComponents/CitasComponents/appointment-summary"
import ClienteForm from "../../../Components/AdminComponents/ClientesComponents/ClienteForm"
import MascotaForm from "../../../Components/AdminComponents/MascotasComponents/MascotaForm"
import { Container, Row, Col, Button, Card } from "react-bootstrap"

// Importar servicio de citas
import CitasService from "../../../Services/ConsumoAdmin/CitasService.js"
import ClientesService from "../../../Services/ConsumoAdmin/ClientesService.js"
import MascotasService from "../../../Services/ConsumoAdmin/MascotasService.js"
import EspeciesService from "../../../Services/ConsumoAdmin/EspeciesService.js" // Importar el servicio de especies

/**
 * Componente para agendar una nueva cita o editar una existente
 */
const NuevaCita = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const citaId = queryParams.get("id")
  const isEditing = !!citaId

  // Estado para clientes y servicios
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [citasAgendadas, setCitasAgendadas] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(0)

  // Estados para controlar la visualización de los modales
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showMascotaModal, setShowMascotaModal] = useState(false)

  // Estados para los formularios de cliente y mascota
  const [clienteFormData, setClienteFormData] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
  })

  const [clienteFormErrors, setClienteFormErrors] = useState({})

  const [mascotaFormData, setMascotaFormData] = useState({
    cliente: "",
    nombre: "",
    especie: "",
    raza: "",
    tamaño: "",
    pelaje: "",
    fechaNacimiento: "",
  })

  const [fotoPreview, setFotoPreview] = useState(null)

  // Estado para las especies obtenidas del servicio
  const [especies, setEspecies] = useState([])

  // Opciones para los selectores del formulario de mascota
  const [especiesOptions, setEspeciesOptions] = useState([
    { value: "Perro", label: "Perro" },
    { value: "Gato", label: "Gato" },
  ])

  const tamañosOptions = [
    { value: "Pequeño", label: "Pequeño" },
    { value: "Mediano", label: "Mediano" },
    { value: "Grande", label: "Grande" },
  ]

  const pelajesOptions = [
    { value: "Corto", label: "Corto" },
    { value: "Medio", label: "Medio" },
    { value: "Largo", label: "Largo" },
  ]

  // Opciones de clientes para el formulario de mascota
  const clientesOptions = clientes.map((cliente) => ({
    value: cliente.IdCliente || cliente.id,
    label: `${cliente.Nombre || cliente.nombre} ${cliente.Apellido || cliente.apellido || ""}`,
  }))

  // Estado para el formulario (inicialmente vacío)
  const [formData, setFormData] = useState({
    cliente: null,
    mascota: null,
    mascotas: [],
    servicios: [],
    fecha: new Date().toISOString().split("T")[0],
    hora: "10:00",
    estado: "Programada",
    notas: "",
  })

  // Estado para el calendario
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00")
  const [use24HourFormat, setUse24HourFormat] = useState(true)

  // Estado para validación
  const [formErrors, setFormErrors] = useState({
    fecha: "",
    hora: "",
    cliente: "",
    mascota: "",
    mascotas: "",
    servicios: "",
  })

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true)
      try {
        // Cargar servicios
        const serviciosData = await CitasService.obtenerServicios()
        console.log("Servicios cargados:", serviciosData)

        setServicios(
          serviciosData.map((servicio) => ({
            id: servicio.IdServicio,
            nombre: servicio.Nombre,
            descripcion: servicio.Descripcion,
            duracion: servicio.Duracion,
            precio: servicio.Precio,
            multiplesMascotas: servicio.Que_incluye?.toLowerCase().includes("múltiples") || false,
            tipoServicioId: servicio.IdTipoServicio,
            imagen: servicio.Foto || "/placeholder.svg?height=200&width=200",
          })),
        )

        // Cargar clientes
        const clientesData = await CitasService.obtenerClientes()
        console.log("Clientes cargados:", clientesData)

        const clientesConMascotas = await Promise.all(
          clientesData.map(async (cliente) => {
            try {
              const mascotas = await CitasService.obtenerMascotasPorCliente(cliente.IdCliente)
              console.log(`Mascotas para cliente ${cliente.IdCliente}:`, mascotas)

              return {
                id: cliente.IdCliente,
                nombre: cliente.Nombre,
                apellido: cliente.Apellido,
                telefono: cliente.Telefono,
                correo: cliente.Correo,
                foto: cliente.Foto || "/placeholder.svg?height=100&width=100",
                mascotas: mascotas.map((mascota) => ({
                  id: mascota.IdMascota,
                  nombre: mascota.Nombre,
                  especie: mascota.Especie || mascota.Tipo,
                  raza: mascota.Raza,
                  tamaño: mascota.Tamaño,
                  pelaje: mascota.Pelaje,
                  fechaNacimiento: mascota.FechaNacimiento,
                  foto: mascota.Foto || "/placeholder.svg?height=200&width=200",
                })),
              }
            } catch (error) {
              console.error(`Error al cargar mascotas del cliente ${cliente.IdCliente}:`, error)
              return {
                ...cliente,
                id: cliente.IdCliente,
                nombre: cliente.Nombre,
                apellido: cliente.Apellido,
                mascotas: [],
              }
            }
          }),
        )
        setClientes(clientesConMascotas)

        // Cargar citas
        const citasData = await CitasService.obtenerCitas()
        console.log("Citas cargadas:", citasData)

        const citasFormateadas = await Promise.all(
          citasData.map(async (cita) => {
            // Encontrar cliente y mascota correspondientes
            const cliente = clientesConMascotas.find((c) => c.id === cita.IdCliente)
            const mascota = cliente?.mascotas.find((m) => m.id === cita.IdMascota)

            // Extraer fecha y hora
            const fechaHora = new Date(cita.Fecha)
            const fecha = fechaHora.toISOString().split("T")[0]
            const hora = `${String(fechaHora.getHours()).padStart(2, "0")}:${String(fechaHora.getMinutes()).padStart(2, "0")}`

            // Obtener servicios de la cita
            let citaServicios = []
            try {
              // Aquí deberíamos tener un endpoint para obtener los servicios de una cita específica
              // Como no lo tenemos, asumimos que los servicios vienen en la respuesta de la cita
              if (cita.servicios && Array.isArray(cita.servicios)) {
                citaServicios = cita.servicios
                  .map((servId) => {
                    const servicio = serviciosData.find((s) => s.IdServicio === servId.IdServicio)
                    if (servicio) {
                      return {
                        id: servicio.IdServicio,
                        nombre: servicio.Nombre,
                        descripcion: servicio.Descripcion,
                        duracion: servicio.Duracion,
                        precio: servicio.Precio,
                        multiplesMascotas: servicio.Que_incluye?.toLowerCase().includes("múltiples") || false,
                        tipoServicioId: servicio.IdTipoServicio,
                        imagen: servicio.Foto || "/placeholder.svg?height=200&width=200",
                      }
                    }
                    return null
                  })
                  .filter(Boolean)
              }
            } catch (error) {
              console.error(`Error al obtener servicios de la cita ${cita.IdCita}:`, error)
            }

            return {
              id: cita.IdCita,
              clienteId: cita.IdCliente,
              mascotaId: cita.IdMascota,
              mascotasIds: [cita.IdMascota],
              serviciosIds: citaServicios.map((s) => s.id),
              fecha,
              hora,
              estado: cita.Estado,
              notas: cita.NotasAdicionales || "",
              duracionTotal: citaServicios.reduce((total, servicio) => total + servicio.duracion, 0),
              precioTotal: citaServicios.reduce((total, servicio) => total + servicio.precio, 0),
              fechaCreacion: cita.FechaCreacion,
              // Datos para la UI
              cliente,
              mascota,
              mascotas: mascota ? [mascota] : [],
              servicios: citaServicios,
            }
          }),
        )
        setCitasAgendadas(citasFormateadas)

        // Cargar especies desde el servicio
        const especiesData = await EspeciesService.getAll()
        console.log("Especies cargadas:", especiesData)
        setEspecies(especiesData)

        // Convertir las especies a opciones para el select
        if (especiesData && especiesData.length > 0) {
          const options = especiesData.map((especie) => ({
            value: especie.NombreEspecie,
            label: especie.NombreEspecie,
          }))
          setEspeciesOptions(options)
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error)
        toast.error(
          <div>
            <strong>Error</strong>
            <p>No se pudieron cargar los datos. Por favor, intente nuevamente.</p>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Cargar cita para edición si existe el ID
  useEffect(() => {
    if (isEditing && citaId && !isLoading && citasAgendadas.length > 0) {
      const citaExistente = citasAgendadas.find((cita) => cita.id === Number.parseInt(citaId) || cita.id === citaId)
      if (citaExistente) {
        setFormData({
          ...citaExistente,
          fecha: citaExistente.fecha,
          hora: citaExistente.hora,
          notas: citaExistente.notas || "",
        })

        // Actualizar fecha seleccionada
        setSelectedDate(new Date(citaExistente.fecha))
        setSelectedTimeSlot(citaExistente.hora)
      } else {
        // Si no se encuentra la cita, mostrar error y redirigir
        toast.error(
          <div>
            <strong>Error</strong>
            <p>No se encontró la cita solicitada.</p>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => navigate("/servicios/AgendarCitas"),
          },
        )
      }
    }
  }, [isEditing, citaId, citasAgendadas, navigate, isLoading])

  // Generar horarios disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    // Horarios de la tienda: 9:00 am a 6:30 pm, con descanso de 1:00 pm a 2:00 pm
    // Los domingos no trabajan (verificado en el componente de calendario)
    const horariosDisponibles = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      // Descanso de 13:00 a 14:00 (hora de almuerzo)
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
    ]

    // Si la fecha seleccionada es hoy, eliminar los horarios pasados
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

    // Verificar si es domingo (no disponible)
    const isSunday = selectedDay.getDay() === 0

    if (isSunday) {
      // No hay horarios disponibles los domingos
      setTimeSlots([])
    } else if (selectedDay.getTime() === today.getTime()) {
      // Si es hoy, filtrar horarios pasados
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()

      const horariosDisponiblesFiltrados = horariosDisponibles.filter((horario) => {
        const [hour, minutes] = horario.split(":").map(Number)
        return hour > currentHour || (hour === currentHour && minutes > currentMinutes)
      })

      setTimeSlots(horariosDisponiblesFiltrados)
    } else {
      // Para otros días, mostrar todos los horarios disponibles
      setTimeSlots(horariosDisponibles)
    }

    // Actualizar la fecha en el formulario
    setFormData((prev) => ({
      ...prev,
      fecha: selectedDate.toISOString().split("T")[0],
    }))
  }, [selectedDate])

  // Manejadores para los formularios
  const handleClienteInputChange = (e) => {
    const { name, value } = e.target
    setClienteFormData({
      ...clienteFormData,
      [name]: value,
    })
  }

  const handleSaveCliente = async () => {
    try {
      // Validar datos mínimos
      if (!clienteFormData.nombre || !clienteFormData.apellido) {
        toast.error("Nombre y Apellido son campos obligatorios")
        return
      }

      // Crear el cliente usando el servicio
      const clienteData = {
        Nombre: clienteFormData.nombre,
        Apellido: clienteFormData.apellido,
        Documento: clienteFormData.documento,
        Correo: clienteFormData.correo,
        Telefono: clienteFormData.telefono,
        Direccion: clienteFormData.direccion,
      }

      const clienteCreado = await ClientesService.create(clienteData)

      // Crear objeto cliente para el formulario
      const nuevoClienteObj = {
        id: clienteCreado.IdCliente || clienteCreado.id,
        nombre: `${clienteCreado.Nombre} ${clienteCreado.Apellido}`,
        apellido: clienteCreado.Apellido,
        telefono: clienteCreado.Telefono,
        correo: clienteCreado.Correo,
        mascotas: [],
      }

      // Actualizar la lista de clientes
      setClientes((prev) => [...prev, nuevoClienteObj])

      // Seleccionar el cliente recién creado
      handleUpdateFormData({
        ...formData,
        cliente: nuevoClienteObj,
        mascota: null,
        mascotas: [],
      })

      // Cerrar el modal
      handleCloseClienteModal()

      // Mostrar mensaje de éxito
      toast.success("Cliente creado correctamente")

      // Abrir modal para crear mascota para este cliente
      setTimeout(() => {
        handleOpenMascotaModal(nuevoClienteObj)
      }, 500)
    } catch (error) {
      console.error("Error al crear cliente:", error)
      toast.error("Error al guardar el cliente. Por favor, intente nuevamente.")
    }
  }

  const handleMascotaInputChange = (e) => {
    const { name, value } = e.target
    setMascotaFormData({
      ...mascotaFormData,
      [name]: value,
    })
  }

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setFotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveMascota = async () => {
    try {
      // Validar datos mínimos
      if (!mascotaFormData.nombre || !mascotaFormData.especie) {
        toast.error("Nombre y Especie son campos obligatorios")
        return
      }

      if (!formData.cliente) {
        toast.error("Debe seleccionar un cliente primero")
        return
      }

      // Preparar datos para crear mascota
      const mascotaData = {
        Nombre: mascotaFormData.nombre,
        Especie: mascotaFormData.especie,
        Raza: mascotaFormData.raza,
        Tamaño: mascotaFormData.tamaño,
        FechaNacimiento: mascotaFormData.fechaNacimiento,
        IdCliente: formData.cliente.id,
        FotoURL: fotoPreview,
      }

      // Crear la mascota
      const mascotaCreada = await MascotasService.create(mascotaData)

      // Crear objeto mascota para el formulario
      const nuevaMascotaObj = {
        id: mascotaCreada.IdMascota || mascotaCreada.id,
        nombre: mascotaCreada.Nombre,
        especie: mascotaCreada.Especie,
        raza: mascotaCreada.Raza,
        tamaño: mascotaCreada.Tamaño,
        fechaNacimiento: mascotaCreada.FechaNacimiento,
        foto: mascotaCreada.FotoURL || mascotaCreada.Foto,
      }

      // Actualizar el cliente con la nueva mascota
      const clienteActualizado = {
        ...formData.cliente,
        mascotas: [...(formData.cliente.mascotas || []), nuevaMascotaObj],
      }

      // Actualizar la lista de clientes
      setClientes((prev) => prev.map((cliente) => (cliente.id === formData.cliente.id ? clienteActualizado : cliente)))

      // Actualizar el formulario con la mascota seleccionada
      handleUpdateFormData({
        ...formData,
        cliente: clienteActualizado,
        mascota: nuevaMascotaObj,
        mascotas: [nuevaMascotaObj],
      })

      // Cerrar el modal
      handleCloseMascotaModal()

      // Mostrar mensaje de éxito
      toast.success("Mascota creada correctamente")
    } catch (error) {
      console.error("Error al crear mascota:", error)
      toast.error("Error al guardar la mascota. Por favor, intente nuevamente.")
    }
  }

  // Manejadores para los modales
  const handleOpenClienteModal = () => {
    setClienteFormData({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: "",
    })
    setShowClienteModal(true)
  }

  const handleCloseClienteModal = () => {
    setShowClienteModal(false)
  }

  const handleOpenMascotaModal = (cliente) => {
    setMascotaFormData({
      cliente: cliente ? cliente.id : "",
      nombre: "",
      especie: especiesOptions.length > 0 ? especiesOptions[0].value : "",
      raza: "",
      tamaño: "Mediano",
      pelaje: "Medio",
      fechaNacimiento: "",
    })
    setFotoPreview(null)
    setShowMascotaModal(true)
  }

  const handleCloseMascotaModal = () => {
    setShowMascotaModal(false)
  }

  // Efecto para inicializar los modales de Bootstrap
  useEffect(() => {
    // Inicializar modal de cliente
    let clienteModalInstance = null
    const clienteModalElement = document.getElementById("clienteModal")

    if (showClienteModal && clienteModalElement) {
      import("bootstrap").then((bootstrap) => {
        clienteModalInstance = new bootstrap.Modal(clienteModalElement)
        clienteModalInstance.show()
      })
    }

    // Inicializar modal de mascota
    let mascotaModalInstance = null
    const mascotaModalElement = document.getElementById("mascotaModal")

    if (showMascotaModal && mascotaModalElement) {
      import("bootstrap").then((bootstrap) => {
        mascotaModalInstance = new bootstrap.Modal(mascotaModalElement)
        mascotaModalInstance.show()
      })
    }

    // Cleanup
    return () => {
      if (clienteModalInstance) {
        clienteModalInstance.hide()
      }
      if (mascotaModalInstance) {
        mascotaModalInstance.hide()
      }
    }
  }, [showClienteModal, showMascotaModal])

  // Manejador para cambiar el formato de hora
  const handleToggleTimeFormat = () => {
    setUse24HourFormat(!use24HourFormat)
  }

  /**
   * Validar el formulario según el paso actual
   * @returns {boolean} - True si el paso actual es válido, false en caso contrario
   */
  const validateCurrentStep = () => {
    const errors = { ...formErrors }
    let isValid = true

    switch (currentStep) {
      case 0: // Fecha y Hora
        if (!formData.fecha) {
          errors.fecha = "Debe seleccionar una fecha"
          isValid = false
        }
        if (!formData.hora) {
          errors.hora = "Debe seleccionar una hora"
          isValid = false
        }
        break
      case 1: // Servicios
        if (!formData.servicios || formData.servicios.length === 0) {
          errors.servicios = "Debe seleccionar al menos un servicio"
          isValid = false
        }
        break
      case 2: // Cliente
        if (!formData.cliente) {
          errors.cliente = "Debe seleccionar un cliente"
          isValid = false
        }
        break
      case 3: // Mascota
        const tieneMultiplesMascotas = formData.servicios.some((servicio) => servicio.multiplesMascotas)
        if (tieneMultiplesMascotas) {
          if (formData.mascotas.length === 0) {
            errors.mascotas = "Debe seleccionar al menos una mascota para los servicios elegidos"
            isValid = false
          }
        } else {
          if (!formData.mascota) {
            errors.mascota = "Debe seleccionar una mascota para la cita"
            isValid = false
          }
        }
        break
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Verificar si hay conflictos de horario con la duración del servicio
   * @param {string} fecha - Fecha de la cita
   * @param {string} hora - Hora de la cita
   * @param {Array} servicios - Servicios seleccionados
   * @param {string} citaId - ID de la cita actual (para edición)
   * @returns {boolean} - True si hay conflicto, false en caso contrario
   */
  const checkTimeConflicts = (fecha, hora, servicios, citaId = null) => {
    if (!servicios || servicios.length === 0) return false

    // Convertir hora a minutos desde el inicio del día
    const [horaNum, minutosNum] = hora.split(":").map(Number)
    const minutosTotales = horaNum * 60 + minutosNum

    // Calcular duración total de los servicios seleccionados
    const duracionTotal = servicios.reduce((total, servicio) => total + servicio.duracion, 0)

    // Hora de finalización en minutos
    const finalizacionMinutos = minutosTotales + duracionTotal

    // Verificar conflictos con otras citas
    return citasAgendadas.some((cita) => {
      // Ignorar la cita actual si estamos editando
      if (citaId && (cita.id === Number.parseInt(citaId) || cita.id === citaId)) return false

      // Solo verificar citas en la misma fecha
      if (cita.fecha !== fecha) return false

      // Convertir hora de la cita existente a minutos
      const [horaExistente, minutosExistente] = cita.hora.split(":").map(Number)
      const inicioExistenteMinutos = horaExistente * 60 + minutosExistente

      // Calcular duración de la cita existente
      const duracionExistente = cita.servicios.reduce((total, servicio) => total + servicio.duracion, 0)
      const finExistenteMinutos = inicioExistenteMinutos + duracionExistente

      // Verificar si hay solapamiento
      return (
        (minutosTotales >= inicioExistenteMinutos && minutosTotales < finExistenteMinutos) ||
        (finalizacionMinutos > inicioExistenteMinutos && finalizacionMinutos <= finExistenteMinutos) ||
        (minutosTotales <= inicioExistenteMinutos && finalizacionMinutos >= finExistenteMinutos)
      )
    })
  }

  /**
   * Manejador para actualizar el formulario
   */
  const handleUpdateFormData = (newFormData) => {
    setFormData(newFormData)

    // Limpiar errores cuando se actualizan los campos
    const newErrors = { ...formErrors }
    if (newFormData.fecha) newErrors.fecha = ""
    if (newFormData.hora) newErrors.hora = ""
    if (newFormData.cliente) newErrors.cliente = ""
    if (newFormData.mascota) newErrors.mascota = ""
    if (newFormData.mascotas && newFormData.mascotas.length > 0) newErrors.mascotas = ""
    if (newFormData.servicios && newFormData.servicios.length > 0) newErrors.servicios = ""

    setFormErrors(newErrors)
  }

  /**
   * Manejador para ir al siguiente paso
   */
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mostrar notificación de error
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, complete todos los campos obligatorios.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    }
  }

  /**
   * Manejador para ir al paso anterior
   */
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  /**
   * Manejador para guardar la cita
   */
  const handleSaveCita = async () => {
    // Validar el formulario completo
    const errors = {
      fecha: "",
      hora: "",
      cliente: "",
      mascota: "",
      mascotas: "",
      servicios: "",
    }

    let isValid = true

    if (!formData.fecha) {
      errors.fecha = "Debe seleccionar una fecha"
      isValid = false
    }

    if (!formData.hora) {
      errors.hora = "Debe seleccionar una hora"
      isValid = false
    }

    if (!formData.cliente) {
      errors.cliente = "Debe seleccionar un cliente"
      isValid = false
    }

    if (!formData.servicios || formData.servicios.length === 0) {
      errors.servicios = "Debe seleccionar al menos un servicio"
      isValid = false
    }

    // Validar que se haya seleccionado al menos una mascota
    const tieneMultiplesMascotas = formData.servicios.some((servicio) => servicio.multiplesMascotas)

    if (tieneMultiplesMascotas) {
      if (formData.mascotas.length === 0) {
        errors.mascotas = "Debe seleccionar al menos una mascota para los servicios elegidos"
        isValid = false
      }
    } else {
      if (!formData.mascota) {
        errors.mascota = "Debe seleccionar una mascota para la cita"
        isValid = false
      }
    }

    setFormErrors(errors)

    if (!isValid) {
      // Mostrar notificación de error general
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, complete todos los campos obligatorios.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Verificar si el horario ya está ocupado considerando la duración del servicio
    const fechaSeleccionada = formData.fecha
    const horaSeleccionada = formData.hora
    const serviciosSeleccionados = formData.servicios

    const hayConflicto = checkTimeConflicts(
      fechaSeleccionada,
      horaSeleccionada,
      serviciosSeleccionados,
      isEditing ? citaId : null,
    )

    if (hayConflicto) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Este horario se solapa con otra cita existente. Por favor, seleccione otro horario.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    try {
      // Preparar datos para la API en el formato correcto
      const citaData = {
        IdCliente: formData.cliente.id,
        IdMascota: formData.mascota ? formData.mascota.id : null,
        Fecha: formData.fecha,
        hora: formData.hora,
        NotasAdicionales: formData.notas || "",
        Estado: "Programada",
        servicios: formData.servicios.map((servicio) => ({
          IdServicio: servicio.id,
        })),
      }

      console.log("Datos enviados al crear cita:", citaData)

      if (isEditing) {
        // Actualizar cita existente
        await CitasService.actualizarCita(citaId, citaData)

        toast.success(
          <div>
            <strong>Cita actualizada</strong>
            <p>La cita ha sido actualizada correctamente.</p>
          </div>,
          {
            icon: "✅",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
              navigate("/servicios/AgendarCitas")
            },
          },
        )
      } else {
        // Crear nueva cita
        const nuevaCita = await CitasService.crearCita(citaData)

        toast.success(
          <div>
            <strong>Cita agendada</strong>
            <p>La cita ha sido agendada correctamente.</p>
          </div>,
          {
            icon: "✅",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
              // Redirigir a la tabla de citas
              navigate("/servicios/AgendarCitas")
            },
          },
        )
      }
    } catch (error) {
      console.error("Error al guardar la cita:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Ocurrió un error al guardar la cita. Por favor, intente nuevamente.</p>
          <p>{error.response?.data?.message || error.message}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    }
  }

  /**
   * Manejador para cancelar y volver a la lista de citas
   */
  const handleCancel = () => {
    navigate("/servicios/AgendarCitas")
  }

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DateTimeStep
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            timeSlots={timeSlots}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={(timeSlot) => {
              setSelectedTimeSlot(timeSlot)
              handleUpdateFormData({
                ...formData,
                hora: timeSlot,
              })
            }}
            formData={formData}
            formErrors={formErrors}
            citasAgendadas={citasAgendadas}
            onNext={handleNextStep}
            onCancel={handleCancel}
            use24HourFormat={use24HourFormat}
            onToggleTimeFormat={handleToggleTimeFormat}
          />
        )
      case 1:
        return (
          <ServicesStep
            servicios={servicios}
            selectedServicios={formData.servicios}
            onServiciosChange={(servicios) => {
              handleUpdateFormData({
                ...formData,
                servicios,
              })
            }}
            formErrors={formErrors}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )
      case 2:
        return (
          <ClientStep
            clientes={clientes}
            selectedCliente={formData.cliente}
            onClienteChange={(cliente) => {
              handleUpdateFormData({
                ...formData,
                cliente,
                mascota: null,
                mascotas: [],
              })
            }}
            formErrors={formErrors}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onNewCliente={handleOpenClienteModal}
          />
        )
      case 3:
        return (
          <PetStep
            cliente={formData.cliente}
            selectedMascota={formData.mascota}
            selectedMascotas={formData.mascotas}
            onMascotaChange={(mascota) => {
              handleUpdateFormData({
                ...formData,
                mascota,
                mascotas: mascota ? [mascota] : [],
              })
            }}
            onMascotasChange={(mascotas) => {
              handleUpdateFormData({
                ...formData,
                mascotas,
                mascota: mascotas.length > 0 ? mascotas[0] : null,
              })
            }}
            requiresMultipleMascotas={formData.servicios.some((s) => s.multiplesMascotas)}
            formErrors={formErrors}
            onNotasChange={(notas) => {
              handleUpdateFormData({
                ...formData,
                notas,
              })
            }}
            notas={formData.notas}
            onSave={handleSaveCita}
            onPrev={handlePrevStep}
            onNewMascota={() => handleOpenMascotaModal(formData.cliente)}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container fluid className="nueva-cita-container py-3">
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : (
        <>
          <Row className="mb-3 align-items-center">
            <Col>
              <h2 className="page-title">{isEditing ? "Editar Cita" : "Agendar Cita"}</h2>
              <p className="text-muted small">Programa una cita para los servicios que tu mascota necesita</p>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center"
                onClick={handleCancel}
              >
                <ArrowLeft size={16} className="me-1" />
                Volver a Citas
              </Button>
            </Col>
          </Row>

          {/* Indicador de pasos */}
          <StepIndicator
            steps={[
              { number: 1, label: "Fecha y Hora" },
              { number: 2, label: "Servicios" },
              { number: 3, label: "Cliente" },
              { number: 4, label: "Mascota" },
            ]}
            currentStep={currentStep}
          />

          <Row className="mt-3 cita-layout">
            {/* Panel izquierdo: Contenido del paso actual */}
            <Col md={8}>
              <Card className="step-card">
                <Card.Body className="p-3">{renderCurrentStep()}</Card.Body>
              </Card>
            </Col>

            {/* Panel derecho: Resumen de la cita */}
            <Col md={4}>
              <Card className="summary-card">
                <Card.Body className="p-3">
                  <AppointmentSummary formData={formData} selectedDate={selectedDate} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Modal de Cliente */}
          <ClienteForm
            showModal={showClienteModal}
            modalTitle="Nuevo Cliente"
            formData={clienteFormData}
            formErrors={clienteFormErrors}
            handleInputChange={handleClienteInputChange}
            handleSaveCliente={handleSaveCliente}
            handleCloseModal={handleCloseClienteModal}
            isViewMode={false}
          />

          {/* Modal de Mascota */}
          <MascotaForm
            showModal={showMascotaModal}
            modalTitle="Nueva Mascota"
            formData={mascotaFormData}
            fotoPreview={fotoPreview}
            especiesOptions={especiesOptions}
            tamañosOptions={tamañosOptions}
            pelajesOptions={pelajesOptions}
            clientesOptions={clientesOptions}
            onInputChange={handleMascotaInputChange}
            onFotoChange={handleFotoChange}
            onSave={handleSaveMascota}
            onClose={handleCloseMascotaModal}
            disableSave={false}
          />
        </>
      )}

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
    </Container>
  )
}

export default NuevaCita
