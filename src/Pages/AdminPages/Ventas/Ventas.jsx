"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle, ShieldAlert } from "lucide-react"
import "../../../Styles/AdminStyles/Ventas.css"
import { ToastContainer, toast } from "react-toastify" // Añadido ToastContainer
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import VentasService from "../../../Services/ConsumoAdmin/VentasService.js"
import UsuariosService from "../../../Services/ConsumoAdmin/usuariosService.js"
import axios from "../../../Services/ConsumoAdmin/axios.js"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay" // Nuevo componente
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog" // Nuevo componente

// Crear una instancia de axios con la URL base de tu API
// Usamos una función para determinar la URL basada en el entorno
const getApiUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api" // URL de desarrollo
  }
  return "/api" // URL de producción (relativa)
}

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
})

const Ventas = () => {
  const navigate = useNavigate()

  // Estado para las ventas
  const [ventas, setVentas] = useState([])

  // Estado para indicar carga
  const [loading, setLoading] = useState(false)

  // Estado para el modal de confirmación de anulación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [ventaToCancel, setVentaToCancel] = useState(null)

  // Estado para el modal de detalles
  const [showDetallesModal, setShowDetallesModal] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [loadingDetalles, setLoadingDetalles] = useState(false)

  // Estado para errores
  const [error, setError] = useState(null)

  // Estado para reintentos
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Estado para el motivo de cancelación

  // NUEVOS ESTADOS PARA LAS MEJORAS
  // Estado para el indicador de carga global
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Añadir estos nuevos estados para manejar las notificaciones pendientes
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

  // Cargar ventas al iniciar el componente
  useEffect(() => {
    cargarVentas()
  }, [retryCount])

  // Función para cargar ventas desde el backend
  const cargarVentas = async () => {
    setLoading(true)
    setError(null)

    try {
      // Eliminar la verificación del health-check que está causando el error 404
      // y proceder directamente a cargar las ventas
      console.log("Iniciando carga de ventas...")
      const data = await VentasService.getAll()
      console.log("Respuesta completa de ventas:", data)

      if (Array.isArray(data)) {
        console.log("Ventas cargadas como array:", data.length)
        setVentas(data)
      } else if (data && typeof data === "object" && data.data && Array.isArray(data.data)) {
        console.log("Ventas cargadas dentro de objeto data:", data.data.length)
        setVentas(data.data)
      } else if (data && typeof data === "object" && Object.keys(data).length > 0) {
        // Intentar extraer un array de ventas del objeto
        const possibleArrays = Object.values(data).filter((val) => Array.isArray(val))
        if (possibleArrays.length > 0) {
          const ventasArray = possibleArrays[0]
          console.log("Ventas extraídas de objeto:", ventasArray.length)
          setVentas(ventasArray)
        } else {
          console.error("No se pudo encontrar un array de ventas en:", data)
          setVentas([])
          setError("Formato de datos inesperado. No se encontraron ventas.")
        }
      } else {
        console.error("Formato de datos inesperado:", data)

        // Intentar cargar desde localStorage si está disponible
        try {
          const ventasGuardadas = JSON.parse(localStorage.getItem("ventas_lista") || "[]")
          if (ventasGuardadas.length > 0) {
            console.log("Usando ventas guardadas localmente:", ventasGuardadas.length)
            setVentas(ventasGuardadas)
            setError("No se pudieron cargar ventas del servidor. Mostrando datos guardados localmente.")
            return
          }
        } catch (localError) {
          console.warn("Error al cargar ventas desde localStorage:", localError)
        }

        setVentas([])
        setError("Formato de datos inesperado. Por favor, intente nuevamente.")
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error)

      // Intentar cargar desde localStorage si está disponible
      try {
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas_lista") || "[]")
        if (ventasGuardadas.length > 0) {
          console.log("Usando ventas guardadas localmente:", ventasGuardadas.length)
          setVentas(ventasGuardadas)
          setError("No se pudieron cargar ventas del servidor. Mostrando datos guardados localmente.")
          return
        }
      } catch (localError) {
        console.warn("Error al cargar ventas desde localStorage:", localError)
      }

      // Mensaje de error más específico basado en el tipo de error
      let errorMessage = "Error desconocido"

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (error.response.status === 500) {
          errorMessage = "Error interno del servidor. Contacte al administrador."
        } else if (error.response.status === 404) {
          errorMessage = "Ruta de API no encontrada. Verifique la configuración."
        } else if (error.response.status === 401) {
          errorMessage = "No autorizado. Inicie sesión nuevamente."
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.data?.message || "Error en la respuesta del servidor"}`
        }
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
      } else {
        // Algo ocurrió al configurar la solicitud
        errorMessage = error.message || "Error al procesar la solicitud"
      }

      setError(errorMessage)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: `Error al cargar ventas: ${errorMessage}`,
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente después de que se complete la carga
      showPendingToast()
    }
  }

  // Función para formatear números con separadores de miles
  const formatNumber = (number) => {
    const num = Number(number) || 0
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    return new Date(dateString).toLocaleString("es-ES", options)
  }

  // Definición de columnas para la tabla principal
  const columns = [
    {
      field: "cliente.nombre",
      header: "Cliente",
      render: (row) => {
        if (row.cliente && row.cliente.nombre) {
          return `${row.cliente.nombre} ${row.cliente.apellido || ""}`
        } else if (row.cliente && row.cliente.Nombre) {
          return `${row.cliente.Nombre} ${row.cliente.Apellido || ""}`
        } else if (row.Cliente) {
          return row.Cliente
        } else if (row.IdCliente === 0 || row.idCliente === 0) {
          return "Consumidor Final"
        } else if (row.IdCliente || row.idCliente) {
          return `Cliente ID: ${row.IdCliente || row.idCliente}`
        }
        return "Cliente no disponible"
      },
    },
    {
      field: "fechaVenta",
      header: "Fecha de Venta",
      render: (row) => formatDate(row.fechaVenta || row.FechaVenta),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      render: (row) => `$${formatNumber(row.subtotal || row.Subtotal)}`,
    },
    {
      field: "totalIVA",
      header: "IVA",
      render: (row) => `$${formatNumber(row.totalIVA || row.TotalIva)}`,
    },
    {
      field: "total",
      header: "Total",
      render: (row) => `$${formatNumber(row.total || row.TotalMonto)}`,
    },
    {
      field: "estado",
      header: "Estado",
      render: (row) => {
        const estado = row.estado || row.Estado || "Pendiente"
        return (
          <span className={`badge ${estado === "Completada" || estado === "Efectiva" ? "bg-success" : "bg-danger"}`}>
            {estado}
          </span>
        )
      },
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => {
        const estado = row.estado || row.Estado || "Pendiente"
        return (
          <TableActions
            actions={[
              "view",
              "print",
              estado === "Completada" || estado === "Efectiva" ? "return" : null,
              estado === "Completada" || estado === "Efectiva" ? "cancel" : null,
            ]}
            row={row}
            onView={handleView}
            onPrint={handlePrint}
            onReturn={handleReturn}
            onCancel={handleCancel}
            customLabels={{
              cancel: "Anular venta",
              return: "Hacer devolución",
            }}
          />
        )
      },
    },
  ]

  // Manejadores de eventos para las acciones
  const handleView = async (venta) => {
    try {
      console.log("Iniciando carga de detalles para venta:", venta)
      setLoadingDetalles(true)
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Cargando detalles de la venta...") // Mensaje para el LoadingOverlay

      // Verificar que tenemos un ID válido
      const ventaId = venta.id || venta.IdVenta
      if (!ventaId) {
        console.error("ID de venta no disponible:", venta)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "No se pudo identificar la venta. Datos incompletos.",
        }

        setLoadingDetalles(false)
        setIsProcessing(false)
        showPendingToast()
        return
      }

      // Obtener detalles completos de la venta
      console.log("Solicitando datos de venta con ID:", ventaId)
      let ventaCompleta
      try {
        ventaCompleta = await VentasService.getById(ventaId)
        console.log("Datos de venta recibidos:", ventaCompleta)
      } catch (error) {
        console.error(`Error al obtener venta con ID ${ventaId}:`, error)
        // Crear un objeto mínimo para poder continuar
        ventaCompleta = {
          id: ventaId,
          IdVenta: ventaId,
          ...venta, // Usar los datos que ya tenemos de la tabla
          _error: "Error al cargar detalles completos",
        }
      }

      // Obtener detalles de productos
      console.log("Solicitando detalles de productos para venta ID:", ventaId)
      let detallesProductosRaw = []
      try {
        detallesProductosRaw = await VentasService.getDetallesProductos(ventaId)
        // FORZAR ARRAY SIEMPRE
        if (!Array.isArray(detallesProductosRaw)) {
          detallesProductosRaw = detallesProductosRaw ? [detallesProductosRaw] : []
        }
        console.log("Detalles de productos recibidos:", detallesProductosRaw)
      } catch (error) {
        console.error(`Error al obtener detalles de productos para venta ID ${ventaId}:`, error)
      }

      // Obtener detalles de servicios
      console.log("Solicitando detalles de servicios para venta ID:", ventaId)
      let detallesServiciosRaw = []
      try {
        detallesServiciosRaw = await VentasService.getDetallesServicios(ventaId)
        if (!Array.isArray(detallesServiciosRaw)) {
          detallesServiciosRaw = detallesServiciosRaw ? [detallesServiciosRaw] : []
        }
        console.log("Detalles de servicios recibidos:", detallesServiciosRaw)
      } catch (error) {
        console.error(`Error al obtener detalles de servicios para venta ID ${ventaId}:`, error)
      }

      // Intentar obtener información del usuario/vendedor si no está disponible
      let datosVendedor = ventaCompleta.usuario
      if (!datosVendedor && (ventaCompleta.IdUsuario || ventaCompleta.idUsuario)) {
        try {
          const idUsuario = ventaCompleta.IdUsuario || ventaCompleta.idUsuario
          console.log("Solicitando datos de usuario ID:", idUsuario)
          const usuarioData = await UsuariosService.getById(idUsuario)
          if (usuarioData) {
            datosVendedor = usuarioData
            console.log("Datos de usuario recibidos:", datosVendedor)
          }
        } catch (userError) {
          console.warn("No se pudo obtener información del vendedor:", userError)
        }
      }

      // Combinar datos
      const detallesProductos = Array.isArray(detallesProductosRaw)
        ? detallesProductosRaw
        : detallesProductosRaw
        ? [detallesProductosRaw]
        : []

      const detallesServicios = Array.isArray(detallesServiciosRaw)
        ? detallesServiciosRaw
        : detallesServiciosRaw
        ? [detallesServiciosRaw]
        : []

      const ventaConDetalles = {
        ...ventaCompleta,
        productos: detallesProductos,
        detallesProductos: detallesProductos,
        detallesServicios: detallesServicios,
        usuario: datosVendedor || null,
      }

      console.log("Datos completos para mostrar en modal:", ventaConDetalles)

      // Guardar en localStorage para tener una copia local
      try {
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
        const index = ventasGuardadas.findIndex((v) => v.id == ventaId || v.IdVenta == ventaId)
        if (index >= 0) {
          ventasGuardadas[index] = ventaConDetalles
        } else {
          ventasGuardadas.push(ventaConDetalles)
        }
        localStorage.setItem("ventas", JSON.stringify(ventasGuardadas))
      } catch (storageError) {
        console.warn("Error al guardar venta en localStorage:", storageError)
      }

      setVentaSeleccionada(ventaConDetalles)
      setShowDetallesModal(true)
    } catch (error) {
      console.error("Error al cargar detalles de la venta:", error)

      // Mensaje de error más específico basado en el tipo de error
      let errorMessage = "No se pudieron cargar los detalles de la venta."

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (error.response.status === 404) {
          errorMessage = "No se encontró la venta solicitada. Puede que haya sido eliminada."
        } else if (error.response.status === 500) {
          errorMessage = "Error interno del servidor al cargar los detalles."
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.data?.message || "Error en la respuesta del servidor"}`
        }
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
      }

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: `${errorMessage} Por favor, intente nuevamente.`,
      }
    } finally {
      setLoadingDetalles(false)
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  const handleReturn = (venta) => {
    const estado = venta.estado || venta.Estado || "Pendiente"
    // Solo permitir devoluciones de ventas completadas
    if (estado !== "Completada" && estado !== "Efectiva") {
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "No se puede hacer devolución de una venta anulada.",
      }
      showPendingToast()
      return
    }

    // Redirigir a la vista de devolución
    navigate(`/ventas/devolucion?id=${venta.id || venta.IdVenta}`)
  }

  const handleCancel = (venta) => {
    const estado = venta.estado || venta.Estado || "Pendiente"
    // Solo permitir anular ventas completadas
    if (estado !== "Completada" && estado !== "Efectiva") {
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Esta venta ya está anulada.",
      }
      showPendingToast()
      return
    }

    setVentaToCancel(venta)
    setShowCancelConfirm(true)
  }

  // Función para confirmar la anulación de la venta
  const confirmCancel = async () => {
    if (ventaToCancel) {
      try {
        setShowCancelConfirm(false)
        setIsProcessing(true) // Mostrar LoadingOverlay
        setProcessingMessage("Anulando venta...") // Mensaje para el LoadingOverlay

        // Limpiar cualquier notificación pendiente anterior
        pendingToastRef.current = null
        toastShownRef.current = false

        // Llamar al servicio para anular la venta
        await VentasService.updateStatus(ventaToCancel.id || ventaToCancel.IdVenta, "Cancelada")

        // Actualizar el estado local
        const updatedVentas = ventas.map((v) => {
          if ((v.id && v.id === ventaToCancel.id) || (v.IdVenta && v.IdVenta === ventaToCancel.IdVenta)) {
            return {
              ...v,
              estado: "Cancelada",
              Estado: "Cancelada",
            }
          }
          return v
        })

        setVentas(updatedVentas)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La venta con código "${ventaToCancel?.codigoFactura || ventaToCancel?.IdVenta}" ha sido anulada correctamente.`,
        }
      } catch (error) {
        console.error("Error al anular la venta:", error)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "No se pudo anular la venta. Por favor, intente nuevamente.",
        }
      } finally {
        setIsProcessing(false) // Ocultar LoadingOverlay
        showPendingToast() // Mostrar cualquier notificación pendiente
      }
    }
    setVentaToCancel(null)
  }

  // Función para cancelar la anulación
  const cancelCancel = () => {
    setShowCancelConfirm(false)
    setVentaToCancel(null)
  }

  // Manejador para cerrar el modal de detalles
  const handleCloseDetallesModal = () => {
    setShowDetallesModal(false)
    setVentaSeleccionada(null)
  }

  // Manejador para redirigir a la vista de registrar venta
  const handleAddVenta = () => {
    navigate("/ventas/registrar-venta")
  }

  // Inicializar Bootstrap modal para detalles
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("detallesVentaModal")

    if (showDetallesModal && modalElement) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowDetallesModal(false)
      setVentaSeleccionada(null)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      if (modalInstance) {
        modalInstance.hide()
      }
    }
  }, [showDetallesModal])

  // Función para imprimir factura estilo tirilla
  const printReceiptStyle = (venta) => {
    // Crear una ventana nueva para la impresión
    const printWindow = window.open("", "_blank")

    // Verificar si se pudo abrir la ventana
    if (!printWindow) {
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.",
      }
      showPendingToast()
      return
    }

    // Obtener información del cliente
    let clienteNombre = "Consumidor Final"
    let clienteDocumento = "0000000000"
    let clienteDireccion = "N/A"
    let clienteTelefono = "N/A"

    if (venta.cliente) {
      clienteNombre =
        `${venta.cliente.nombre || venta.cliente.Nombre || ""} ${venta.cliente.apellido || venta.cliente.Apellido || ""}`.trim()
      clienteDocumento = venta.cliente.documento || venta.cliente.Documento || "0000000000"
      clienteDireccion = venta.cliente.direccion || venta.cliente.Direccion || "N/A"
      clienteTelefono = venta.cliente.telefono || venta.cliente.Telefono || "N/A"
    } else if (venta.Cliente) {
      clienteNombre = venta.Cliente
    } else if (venta.IdCliente === 0 || venta.idCliente === 0) {
      clienteNombre = "Consumidor Final"
    }

    // Formatear fecha
    const fechaVenta = new Date(venta.fechaVenta || venta.FechaVenta)
    const fechaFormateada = `${fechaVenta.getDate()}/${fechaVenta.getMonth() + 1}/${fechaVenta.getFullYear()}`

    // Determinar si hay información de pago en efectivo
    const metodoPago = venta.MetodoPago || venta.metodoPago || "efectivo"
    const montoRecibido = venta.MontoRecibido || venta.montoRecibido || 0
    const cambio = venta.Cambio || venta.cambio || 0
    const mostrarCambio = metodoPago === "efectivo" && montoRecibido > 0

    // Obtener productos y servicios
    const productos = Array.isArray(venta.detallesProductos)
      ? venta.detallesProductos
      : venta.detallesProductos
      ? [venta.detallesProductos]
      : []

    const servicios = Array.isArray(venta.detallesServicios)
      ? venta.detallesServicios
      : venta.detallesServicios
      ? [venta.detallesServicios]
      : []

    // Crear contenido HTML para la tirilla
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Factura de Venta #${venta.IdVenta || venta.id}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 300px;
      margin: 0 auto;
      padding: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 10px 0;
    }
    .info {
      margin: 5px 0;
    }
    .total {
      margin-top: 10px;
      text-align: right;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 16px; font-weight: bold;">TEO/CAT</div>
    <div>Calle 34 B # 66 A 18</div>
    <div>Barrio Conquistadores</div>
    <div>Tel: 310 620 4578</div>
    <div>Email: teoduque445@gmail.com</div>
    <div>Instagram: @Teocat8</div>
  </div>

  <div class="divider"></div>

  <div class="info">
    <div>FACTURA DE VENTA: #${venta.IdVenta || venta.id}</div>
    <div>FECHA: ${fechaFormateada}</div>
    <div>ESTADO: ${venta.Estado || venta.estado || "Efectiva"}</div>
  </div>

  <div class="divider"></div>

  <div class="info">
    <div>CLIENTE: ${clienteNombre}</div>
    <div>DOCUMENTO: ${clienteDocumento}</div>
    <div>DIRECCIÓN: ${clienteDireccion}</div>
    <div>TELÉFONO: ${clienteTelefono}</div>
  </div>

  <div class="divider"></div>

  ${
    productos && productos.length > 0
      ? `
  <table>
    <tr>
      <th>DESCRIPCIÓN</th>
      <th>CANT</th>
      <th>TOTAL</th>
    </tr>
    ${productos
      .map(
        (p) => `
    <tr>
      <td>${p.NombreProducto || p.nombreProducto || "Producto"}</td>
      <td>${p.Cantidad || p.cantidad || 1}</td>
      <td>$${formatNumber(p.Subtotal || (p.PrecioUnitario || p.precioUnitario) * (p.Cantidad || p.cantidad || 1))}</td>
    </tr>
    `,
      )
      .join("")}
  </table>
  `
      : ""
  }

  ${
    servicios && servicios.length > 0
      ? `
  <table>
    <tr>
      <th>SERVICIO</th>
      <th>CANT</th>
      <th>TOTAL</th>
    </tr>
    ${servicios
      .map(
        (s) => `
    <tr>
      <td>${s.NombreServicio || s.nombreServicio || "Servicio"}${
        s.NombreMascotaTemporal || s.nombreMascotaTemporal || s.mascota?.Nombre || s.mascota?.nombre
          ? ` (${s.NombreMascotaTemporal || s.nombreMascotaTemporal || s.mascota?.Nombre || s.mascota?.nombre})`
          : ""
      }</td>
      <td>${s.Cantidad || s.cantidad || 1}</td>
      <td>$${formatNumber(s.Subtotal || (s.PrecioUnitario || s.precioUnitario) * (s.Cantidad || s.cantidad || 1))}</td>
    </tr>
    `,
      )
      .join("")}
  </table>
  `
      : ""
  }

  ${
    (!productos || productos.length === 0) && (!servicios || servicios.length === 0)
      ? `
  <table>
    <tr>
      <th>DESCRIPCIÓN</th>
      <th>CANT</th>
      <th>TOTAL</th>
    </tr>
    <tr>
      <td colspan="3" style="text-align: center;">No hay productos disponibles</td>
    </tr>
  </table>
  `
      : ""
  }

  <div class="divider"></div>

  <div class="total">
    <div>SUBTOTAL: $${formatNumber(venta.Subtotal || venta.subtotal)}</div>
    <div>IVA: $${formatNumber(venta.TotalIva || venta.totalIVA || 0)}</div>
    <div style="font-weight: bold; margin-top: 5px;">TOTAL: $${formatNumber(venta.TotalMonto || venta.total)}</div>
    ${
      mostrarCambio
        ? `<div>RECIBIDO: $${formatNumber(montoRecibido)}</div>
         <div>CAMBIO: $${formatNumber(cambio)}</div>`
        : ""
    }
    ${
      venta.ReferenciaPago || venta.referenciaPago
        ? `<div><strong>Referencia de Pago:</strong> ${venta.ReferenciaPago || venta.referenciaPago}</div>`
        : ""
    }
  </div>

  ${
    venta.ComprobantePago && venta.ComprobantePago !== "Pago en efectivo"
      ? `
  <div class="divider"></div>
  <div>Comprobante de Pago: ${venta.ComprobantePago}</div>
  `
      : ""
  }

  <div class="divider"></div>

  <div class="footer">
    <div style="font-weight: bold; margin-bottom: 5px;">¡GRACIAS POR SU COMPRA!</div>
    <div>Vuelva pronto</div>
    <div>Instagram: @Teocat8</div>
    <div>WhatsApp: 310 620 4578</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
`)

    printWindow.document.close()
  }

  // Función para imprimir factura estilo formal
  const printInvoiceStyle = (venta) => {
    // Crear una ventana nueva para la impresión
    const printWindow = window.open("", "_blank")

    // Verificar si se pudo abrir la ventana
    if (!printWindow) {
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.",
      }
      showPendingToast()
      return
    }

    // Obtener información del cliente
    let clienteNombre = "Consumidor Final"
    let clienteDocumento = "0000000000"
    let clienteDireccion = "N/A"
    let clienteTelefono = "N/A"

    if (venta.cliente) {
      clienteNombre =
        `${venta.cliente.nombre || venta.cliente.Nombre || ""} ${venta.cliente.apellido || venta.cliente.Apellido || ""}`.trim()
      clienteDocumento = venta.cliente.documento || venta.cliente.Documento || "0000000000"
      clienteDireccion = venta.cliente.direccion || venta.cliente.Direccion || "N/A"
      clienteTelefono = venta.cliente.telefono || venta.cliente.Telefono || "N/A"
    } else if (venta.Cliente) {
      clienteNombre = venta.Cliente
    } else if (venta.IdCliente === 0 || venta.idCliente === 0) {
      clienteNombre = "Consumidor Final"
    }

    // Formatear fecha
    const fechaVenta = new Date(venta.fechaVenta || venta.FechaVenta).toLocaleDateString("es-CO")

    // Determinar si hay información de pago en efectivo
    const metodoPago = venta.MetodoPago || venta.metodoPago || "efectivo"
    const montoRecibido = venta.MontoRecibido || venta.montoRecibido || 0
    const cambio = venta.Cambio || venta.cambio || 0
    const mostrarCambio = metodoPago === "efectivo" && montoRecibido > 0

    // Obtener servicios para mostrar
    const servicios = venta.servicios || venta.detallesServicios || []

    // Crear contenido HTML para la factura
    printWindow.document.write(`
 <!DOCTYPE html>
 <html>
 <head>
   <title>Factura de Venta #${venta.IdVenta || venta.id}</title>
   <style>
     body {
       font-family: Arial, sans-serif;
       font-size: 12px;
       margin: 0;
       padding: 20px;
       color: #333;
     }
     .invoice {
       max-width: 800px;
       margin: 0 auto;
       padding: 20px;
       border: 1px solid #ddd;
       box-shadow: 0 0 10px rgba(0,0,0,0.1);
     }
     .header {
       display: flex;
       justify-content: space-between;
       margin-bottom: 20px;
       border-bottom: 2px solid #333;
       padding-bottom: 10px;
     }
     .company-info {
       flex: 1;
     }
     .company-name {
       font-size: 24px;
       font-weight: bold;
       margin-bottom: 5px;
       color: #000;
     }
     .invoice-info {
       text-align: right;
     }
     .invoice-title {
       font-size: 24px;
       font-weight: bold;
       margin-bottom: 10px;
       color: #000;
     }
     .client-info {
       margin-bottom: 20px;
       padding: 15px;
       background-color: #f9f9f9;
       border-radius: 5px;
       border-left: 4px solid #4a90e2;
     }
     .client-info h3 {
       margin-top: 0;
       border-bottom: 1px solid #ddd;
       padding-bottom: 5px;
       color: #4a90e2;
     }
     .client-details {
       display: grid;
       grid-template-columns: repeat(2, 1fr);
       gap: 10px;
     }
     .client-details p {
       margin: 5px 0;
     }
     table {
       width: 100%;
       border-collapse: collapse;
       margin-bottom: 20px;
     }
     th, td {
       border: 1px solid #ddd;
       padding: 10px;
       text-align: left;
     }
     th {
       background-color: #f2f2f2;
       font-weight: bold;
     }
     .product-table th {
       position: sticky;
       top: 0;
       background-color: #f2f2f2;
     }
     .totals {
       margin-left: auto;
       width: 300px;
     }
     .totals table {
       width: 100%;
     }
     .totals table td {
       border: none;
       padding: 5px;
     }
     .totals table td:last-child {
       text-align: right;
       font-weight: bold;
     }
     .total-row {
       font-weight: bold;
     }
     .grand-total {
       font-size: 16px;
       border-top: 2px solid #333;
       padding-top: 5px;
     }
     .footer {
       margin-top: 30px;
       text-align: center;
       font-size: 11px;
       color: #666;
       border-top: 1px solid #ddd;
       padding-top: 10px;
     }
     .legal-text {
       font-style: italic;
       font-size: 10px;
       color: #777;
       margin-top: 5px;
     }
     .thanks {
       text-align: center;
       margin: 20px 0;
       font-weight: bold;
       font-size: 14px;
       color: #4a90e2;
     }
     .notes {
       margin-top: 20px;
       padding: 10px;
       background-color: #f9f9f9;
       border-radius: 5px;
       border-left: 4px solid #f0ad4e;
     }
     .notes h3 {
       margin-top: 0;
       color: #f0ad4e;
       border-bottom: 1px solid #ddd;
       padding-bottom: 5px;
     }
     @media print {
       body {
         padding: 0;
       }
       .invoice {
         border: none;
         box-shadow: none;
       }
     }
   </style>
</head>
<body>
   <div class="invoice">
     <div class="header">
       <div class="company-info">
         <div class="company-name">TEO/CAT</div>
         <p>Calle 34 B # 66 A 18</p>
         <p>Barrio Conquistadores</p>
         <p>Tel: 310 620 4578</p>
         <p>Email: teoduque445@gmail.com</p>
       </div>
       <div class="invoice-info">
         <div class="invoice-title">FACTURA DE VENTA</div>
         <p><strong>No.:</strong> ${venta.IdVenta || venta.id}</p>
         <p><strong>Fecha:</strong> ${fechaVenta}</p>
         <p><strong>Estado:</strong> ${venta.Estado || venta.estado || "Efectiva"}</p>
       </div>
     </div>
     
     <div class="client-info">
       <h3>Información del Cliente</h3>
       <div class="client-details">
         <p><strong>Cliente:</strong> ${clienteNombre}</p>
         <p><strong>Documento:</strong> ${clienteDocumento}</p>
         <p><strong>Dirección:</strong> ${clienteDireccion}</p>
         <p><strong>Teléfono:</strong> ${clienteTelefono}</p>
       </div>
     </div>
     
     <h3>Detalle de Productos</h3>
     <table class="product-table">
       <thead>
         <tr>
           <th>Código</th>
           <th>Descripción</th>
           <th>Cantidad</th>
           <th>Precio Unitario</th>
           <th>IVA</th>
           <th>Subtotal</th>
         </tr>
       </thead>
       <tbody>
         ${(venta.detallesProductos || venta.productos || [])
           .map(
             (detalle) => `
           <tr>
             <td>${detalle.CodigoBarras || detalle.codigoBarras || "N/A"}</td>
             <td>${detalle.NombreProducto || detalle.nombreProducto || "Producto"}</td>
             <td>${detalle.Cantidad || detalle.cantidad || 1}</td>
             <td>$${formatNumber(detalle.PrecioUnitario || detalle.precioUnitario)}</td>
             <td>$${formatNumber((detalle.IvaUnitario || 0) * (detalle.Cantidad || detalle.cantidad || 1))}</td>
             <td>$${formatNumber(detalle.Subtotal || (detalle.Cantidad || detalle.cantidad || 1) * (detalle.PrecioUnitario || detalle.precioUnitario))}</td>
           </tr>
         `,
           )
           .join("")}
       </tbody>
     </table>
     ${
       servicios && servicios.length > 0
         ? `
<h3>Detalle de Servicios</h3>
<table class="product-table">
  <thead>
    <tr>
      <th>Servicio</th>
      <th>Mascota</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>IVA</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    ${servicios
      .map(
        (servicio) => `
      <tr>
        <td>${servicio.NombreServicio || servicio.nombreServicio || `Servicio #${servicio.IdServicio || servicio.idServicio}`}</td>
        <td>${
          servicio.NombreMascotaTemporal ||
          servicio.nombreMascotaTemporal ||
          (servicio.mascota ? servicio.mascota.Nombre || servicio.mascota.nombre : "N/A")
        }${
          servicio.TipoMascotaTemporal ||
          servicio.tipoMascotaTemporal ||
          (servicio.mascota ? ` (${servicio.mascota.Tipo || servicio.mascota.tipo})` : "")
        }</td>
        <td>${servicio.Cantidad || servicio.cantidad || 1}</td>
        <td>$${formatNumber(servicio.PrecioUnitario || servicio.precioUnitario)}</td>
        <td>$${formatNumber((servicio.IvaUnitario || 0) * (servicio.Cantidad || servicio.cantidad || 1))}</td>
        <td>$${formatNumber(
          servicio.Subtotal ||
            (servicio.Cantidad || servicio.cantidad || 1) * (servicio.PrecioUnitario || servicio.precioUnitario),
        )}</td>
      </tr>
    `,
      )
      .join("")}
  </tbody>
</table>
`
         : ""
     }
     
     <div class="totals">
       <table>
         <tr>
           <td><strong>Subtotal:</strong></td>
           <td>$${formatNumber(venta.Subtotal || venta.subtotal)}</td>
         </tr>
         <tr>
           <td><strong>IVA:</strong></td>
           <td>$${formatNumber(venta.TotalIva || venta.totalIVA || 0)}</td>
         </tr>
         <tr class="total-row grand-total">
           <td><strong>TOTAL:</strong></td>
           <td>$${formatNumber(venta.TotalMonto || venta.total)}</td>
         </tr>
         ${
           venta.ReferenciaPago || venta.referenciaPago
             ? `<tr><td><strong>Referencia de Pago:</strong></td><td>${venta.ReferenciaPago || venta.referenciaPago}</td></tr>`
             : ""
         }
       </table>
     </div>
     
     ${
       (venta.NotasAdicionales && venta.NotasAdicionales !== "Venta presencial") ||
       (venta.ComprobantePago && venta.ComprobantePago !== "Pago en efectivo")
         ? `
     <div class="notes">
       <h3>Información Adicional</h3>
       ${venta.NotasAdicionales && venta.NotasAdicionales !== "Venta presencial" ? `<p><strong>Notas:</strong> ${venta.NotasAdicionales}</p>` : ""}
       ${venta.ComprobantePago && venta.ComprobantePago !== "Pago en efectivo" ? `<p><strong>Comprobante de Pago:</strong> ${venta.ComprobantePago}</p>` : ""}
     </div>
     `
         : ""
     }
     
     <div class="thanks">¡GRACIAS POR SU COMPRA!</div>
     
     <div class="footer">
       <p>Esta factura es un documento legal y sirve como comprobante de compra.</p>
       <p class="legal-text">Conserve este documento para cualquier reclamación o garantía.</p>
       <p>Instagram: @Teocat8 | WhatsApp: 310 620 4578</p>
     </div>
   </div>
   
   <script>
     // Abrir diálogo de impresión automáticamente
     window.onload = function() {
       // Esperar un momento para que se cargue todo el contenido
       setTimeout(function() {
         window.print();
       }, 500);
     };
   </script>
 </body>
 </html>
`)

    printWindow.document.close()
  }

  // Función para imprimir factura
  const handlePrint = async (venta) => {
    try {
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Preparando impresión...") // Mensaje para el LoadingOverlay

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      const ventaId = venta.id || venta.IdVenta

      // Cargar venta completa
      const ventaCompleta = await VentasService.getById(ventaId)
      const detallesProductosRaw = await VentasService.getDetallesProductos(ventaId)
      const detallesServiciosRaw = await VentasService.getDetallesServicios(ventaId)

      const detallesProductos = Array.isArray(detallesProductosRaw)
        ? detallesProductosRaw
        : detallesProductosRaw
        ? [detallesProductosRaw]
        : []

      const detallesServicios = Array.isArray(detallesServiciosRaw)
        ? detallesServiciosRaw
        : detallesServiciosRaw
        ? [detallesServiciosRaw]
        : []

      const ventaFinal = {
        ...ventaCompleta,
        detallesProductos,
        detallesServicios,
      }

      // Imprimir en estilo tirilla
      printReceiptStyle(ventaFinal)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "success",
        message: "Impresión enviada correctamente.",
      }
    } catch (error) {
      console.error("Error cargando los detalles de la venta:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "No se pudieron cargar los detalles completos de la venta.",
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  return (
    <div className="ventas-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Ventas</h2>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 d-flex align-items-center" role="alert">
          <ShieldAlert size={20} className="me-2" />
          <div>
            <strong>Error:</strong> {error}
            <br />
            <small>Por favor, verifique la conexión con el backend o contacte al administrador del sistema.</small>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={ventas}
        onAdd={handleAddVenta}
        addButtonLabel="Registrar Venta"
        searchPlaceholder="Buscar ventas..."
        loading={loading}
      />

      {/* Reemplazar el modal de confirmación por ConfirmDialog */}
      <ConfirmDialog
        show={showCancelConfirm}
        title="Confirmar anulación"
        message={
          <div className="d-flex align-items-center mb-3">
            <AlertTriangle size={24} className="text-danger me-3" />
            <p className="mb-0">Una venta no se puede anular.</p>
          </div>
        }
        type="danger"
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />

      {/* Modal para Ver Detalles de la Venta */}
      <div
        className="modal fade"
        id="detallesVentaModal"
        tabIndex="-1"
        aria-labelledby="detallesVentaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="detallesVentaModalLabel">
                Ver Detalles de la Venta
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseDetallesModal}
              ></button>
            </div>
            <div className="modal-body">
              {loadingDetalles ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando detalles de la venta...</p>
                </div>
              ) : ventaSeleccionada ? (
                <form className="venta-form">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label htmlFor="codigoFactura" className="form-label">
                        Código de Factura
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="codigoFactura"
                        value={ventaSeleccionada.codigoFactura || ventaSeleccionada.IdVenta || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="cliente" className="form-label">
                        Cliente
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="cliente"
                        value={
                          ventaSeleccionada.cliente
                            ? `${ventaSeleccionada.cliente.nombre || ventaSeleccionada.cliente.Nombre || ""} ${ventaSeleccionada.cliente.apellido || ventaSeleccionada.cliente.Apellido || ""}`.trim()
                            : ventaSeleccionada.IdCliente === 0 || ventaSeleccionada.idCliente === 0
                              ? "Consumidor Final"
                              : ventaSeleccionada.Cliente || "Cliente no disponible"
                        }
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="fechaVenta" className="form-label">
                        Fecha de Venta
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fechaVenta"
                        value={formatDate(ventaSeleccionada.fechaVenta || ventaSeleccionada.FechaVenta || "")}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="vendedor" className="form-label">
                        Vendedor
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          id="vendedor"
                          value={
                            ventaSeleccionada.usuario
                              ? `${ventaSeleccionada.usuario.nombre || ventaSeleccionada.usuario.Nombre || ""} ${ventaSeleccionada.usuario.apellido || ventaSeleccionada.usuario.Apellido || ""}`.trim()
                              : ventaSeleccionada.NombreUsuario || ventaSeleccionada.nombreUsuario || "Vendedor"
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="notasAdicionales" className="form-label">
                        Notas Adicionales
                      </label>
                      <textarea
                        className="form-control"
                        id="notasAdicionales"
                        value={ventaSeleccionada.NotasAdicionales || ""}
                        readOnly
                        rows="2"
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="comprobantePago" className="form-label">
                        Comprobante de Pago
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="comprobantePago"
                        value={ventaSeleccionada.ComprobantePago || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
  <label htmlFor="referenciaPago" className="form-label">
    Referencia de Pago
  </label>
  <input
    type="text"
    className="form-control"
    id="referenciaPago"
    value={ventaSeleccionada.ReferenciaPago || ventaSeleccionada.referenciaPago || ""}
    readOnly
  />
</div>

                  {/* Detalles de productos */}
                  <div className="mt-4">
                    <h5>Productos</h5>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                            <th>IVA</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(ventaSeleccionada.productos) && ventaSeleccionada.productos.length > 0 ? (
                            ventaSeleccionada.productos.map((producto, index) => (
                              <tr key={index}>
                                <td>
                                  {producto.NombreProducto ||
                                    producto.nombreProducto ||
                                    `Producto ID: ${producto.IdProducto}`}
                                </td>
                                <td>{producto.Cantidad}</td>
                                <td>{formatNumber(producto.PrecioUnitario)}</td>
                                <td>{formatNumber(producto.Subtotal)}</td>
                                <td>{formatNumber(producto.IvaUnitario * producto.Cantidad)}</td>
                                <td>
                                  {formatNumber(
                                    Number(producto.Subtotal) + Number(producto.IvaUnitario) * Number(producto.Cantidad)
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                No hay productos en esta venta
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detalles de servicios */}
                  {ventaSeleccionada.detallesServicios && ventaSeleccionada.detallesServicios.length > 0 && (
                    <div className="mt-4">
                      <h5>Servicios</h5>
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Servicio</th>
                              <th>Mascota</th>
                              <th>Cantidad</th>
                              <th>Precio Unitario</th>
                              <th>IVA</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ventaSeleccionada.detallesServicios.map((servicio, index) => (
                              <tr key={index}>
                                <td>{servicio.NombreServicio || `Servicio ID: ${servicio.IdServicio}`}</td>
                                <td>
                                  {servicio.NombreMascotaTemporal ||
                                    servicio.NombreMascota ||
                                    (servicio.mascota ? servicio.mascota.Nombre || servicio.mascota.nombre : "N/A")}
                                  {(servicio.TipoMascotaTemporal ||
                                    servicio.TipoMascota ||
                                    (servicio.mascota ? ` (${servicio.mascota.Tipo || servicio.mascota.tipo})` : "")) &&
                                    ` (${
                                      servicio.TipoMascotaTemporal ||
                                      servicio.TipoMascota ||
                                      (servicio.mascota ? servicio.mascota.Tipo || servicio.mascota.tipo : "")
                                    })`}
                                </td>
                                <td>{servicio.Cantidad}</td>
                                <td>{formatNumber(servicio.PrecioUnitario)}</td>
                                <td>{formatNumber(servicio.IvaUnitario * servicio.Cantidad)}</td>
                                <td>
                                  {formatNumber(servicio.Subtotal || servicio.PrecioUnitario * servicio.Cantidad)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Totales */}
                  <div className="row mt-4">
                    <div className="col-md-6 offset-md-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>Subtotal:</strong>
                            <span>{formatNumber(ventaSeleccionada.Subtotal || ventaSeleccionada.subtotal || 0)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <strong>IVA:</strong>
                            <span>{formatNumber(ventaSeleccionada.TotalIva || ventaSeleccionada.totalIVA || 0)}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <strong>Total:</strong>
                            <span className="fw-bold">
                              {formatNumber(ventaSeleccionada.TotalMonto || ventaSeleccionada.total || 0)}
                            </span>
                          </div>
                          {ventaSeleccionada.MetodoPago === "efectivo" && ventaSeleccionada.MontoRecibido > 0 && (
                            <>
                              <hr />
                              <div className="d-flex justify-content-between mb-2">
                                <strong>Monto Recibido:</strong>
                                <span>{formatNumber(ventaSeleccionada.MontoRecibido || 0)}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <strong>Cambio:</strong>
                                <span>{formatNumber(ventaSeleccionada.Cambio || 0)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="alert alert-warning">No se encontraron datos de la venta</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleCloseDetallesModal}
              >
                Cerrar
              </button>
              {ventaSeleccionada && (
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center ms-2"
                  onClick={() => printInvoiceStyle(ventaSeleccionada)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-1"
                  >
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Imprimir Factura
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Añadir LoadingOverlay */}
      <LoadingOverlay
        isLoading={isProcessing}
        message={processingMessage}
        variant="primary"
        onHide={showPendingToast}
      />

      {/* Añadir ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable
        theme="light"
        limit={1}
      />
    </div>
  )
}

export default Ventas