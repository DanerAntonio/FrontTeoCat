"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import VentasService from "../../../Services/ConsumoAdmin/VentasService.js"
import DetallesVentasService from "../../../Services/ConsumoAdmin/DetallesVentasService.js"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"
import authService from "../../../Services/ConsumoAdmin/authService.js"
import moment from "moment-timezone"
import axios from "../../../Services/ConsumoAdmin/axios.js"

// Función para formatear moneda
const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return "$0"
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

// Función para formatear fecha
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr

  try {
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return ""
    return fecha.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return ""
  }
}

const DevolucionVentaMejorada = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ventaId = searchParams.get("id")

  // Estados principales
  const [venta, setVenta] = useState(null)
  const [detallesProductos, setDetallesProductos] = useState([])
  const [productosDevolver, setProductosDevolver] = useState([])
  const [productosCambio, setProductosCambio] = useState([])
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)

  // Estados del formulario mejorados
  const [motivo, setMotivo] = useState("")
  const [motivoPersonalizado, setMotivoPersonalizado] = useState("")
  const [estado, setEstado] = useState("Devuelta")
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split("T")[0])
  const [tipoDevolucion, setTipoDevolucion] = useState("completa")
  const [montoRecibido, setMontoRecibido] = useState(0)

  // Estados para validación de stock
  const [validandoStock, setValidandoStock] = useState(false)
  const [erroresStock, setErroresStock] = useState([])

  // Estado
  const [montoParcial, setMontoParcial] = useState("")

  // Estado para actualización de stock
  const [stockActualizandose, setStockActualizandose] = useState(false)
  const [ultimaActualizacionStock, setUltimaActualizacionStock] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (!ventaId) {
      setError("ID de venta no proporcionado")
      setLoading(false)
      return
    }

    cargarDatos()
  }, [ventaId])

  // Cargar usuario logueado
  useEffect(() => {
    const userData = authService.getUserData()
    setUsuarioLogueado(userData)
    console.log("Usuario logueado:", userData)
  }, [])

  // Efecto para manejar actualización de stock
  useEffect(() => {
    const handleStockActualizado = (event) => {
      console.log("📦 Evento de stock actualizado recibido:", event.detail)
      setUltimaActualizacionStock(new Date())

      // Recargar productos disponibles
      setTimeout(() => {
        cargarProductosDisponibles()
      }, 1000)

      toast.success("📦 Stock actualizado automáticamente", {
        position: "top-right",
        autoClose: 3000,
      })
    }

    window.addEventListener("stockActualizado", handleStockActualizado)

    return () => {
      window.removeEventListener("stockActualizado", handleStockActualizado)
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Obtener venta
      let ventaData = null
      try {
        ventaData = await VentasService.getById(Number(ventaId))
      } catch (ventaError) {
        console.warn("Error al obtener venta directamente:", ventaError)
        const todasLasVentas = await VentasService.getAll()
        ventaData = todasLasVentas.find((v) => v.IdVenta == ventaId)
        if (!ventaData) {
          throw new Error("No se pudo encontrar la venta")
        }
      }

      // Validar que la venta se puede devolver
      if (!validarVentaParaDevolucion(ventaData)) {
        return
      }

      // Procesar datos del cliente
      if (ventaData && !ventaData.cliente && ventaData.IdCliente) {
        if (ventaData.IdCliente === 3) {
          ventaData.cliente = {
            nombre: "Consumidor",
            apellido: "Final",
            documento: "0000000000",
          }
        }
      }

      // Formatear fecha
      if (ventaData.FechaVenta) {
        try {
          const fecha = new Date(ventaData.FechaVenta)
          if (!isNaN(fecha.getTime())) {
            ventaData.FechaVenta = fecha.toISOString().split("T")[0]
          } else {
            ventaData.FechaVenta = new Date().toISOString().split("T")[0]
          }
        } catch (fechaError) {
          ventaData.FechaVenta = new Date().toISOString().split("T")[0]
        }
      }

      // Obtener detalles de productos de la venta si existen
      let detallesData = []
      try {
        detallesData = await DetallesVentasService.getByVenta(Number(ventaId))
        console.log("Detalles obtenidos:", detallesData) // <-- Diagnóstico
      } catch (detallesError) {
        console.warn("Error al obtener detalles de productos:", detallesError)
        detallesData = []
      }

      // Obtener productos disponibles para cambio
      let productosData = []
      try {
        productosData = await ProductosService.getActivosParaCompras()
      } catch (productosError) {
        console.warn("Error al obtener productos activos:", productosError)
        productosData = []
      }

      setVenta(ventaData)
      setDetallesProductos(Array.isArray(detallesData) ? detallesData : [])
      setProductosDisponibles(productosData || [])
      setError(null)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ NUEVA FUNCIÓN: Validar que la venta se puede devolver
  const validarVentaParaDevolucion = (ventaData) => {
    if (!ventaData) {
      setError("Venta no encontrada")
      return false
    }

    const estado = ventaData.Estado || ventaData.estado
    if (estado !== "Efectiva" && estado !== "Efectiva") {
      setError("Solo se pueden devolver ventas en estado 'Efectiva' o 'Efectiva'")
      return false
    }

    // Verificar si ya fue devuelta
    if (estado === "Devuelta") {
      setError("Esta venta ya fue devuelta anteriormente")
      return false
    }

    // Verificar fecha límite para devoluciones (ejemplo: 30 días)
    const fechaVenta = new Date(ventaData.FechaVenta)
    const fechaActual = new Date()
    const diasTranscurridos = Math.floor((fechaActual - fechaVenta) / (1000 * 60 * 60 * 24))

    if (diasTranscurridos > 30) {
      setError("No se pueden procesar devoluciones después de 30 días de la venta original")
      return false
    }

    return true
  }

  // ✅ NUEVA FUNCIÓN: Validar stock antes de procesar devolución
  const validarStockProductos = async (productos) => {
    setValidandoStock(true)
    setErroresStock([])

    try {
      const errores = []

      for (const producto of productos) {
        try {
          // Obtener stock actual del producto
          const productoActual = await ProductosService.getById(producto.IdProducto)

          if (!productoActual) {
            errores.push(`Producto ${producto.NombreProducto}: No encontrado en el sistema`)
            continue
          }

          if (!productoActual.Estado) {
            errores.push(`Producto ${producto.NombreProducto}: Producto inactivo`)
            continue
          }

          // Verificar si es un producto de stock
          if (productoActual.Origen === "Stock") {
            // Para productos de stock, verificar que no haya problemas de inventario
            if (productoActual.Stock < 0) {
              errores.push(`Producto ${producto.NombreProducto}: Stock negativo detectado (${productoActual.Stock})`)
            }
          }
        } catch (error) {
          console.error(`Error validando producto ${producto.IdProducto}:`, error)
          errores.push(`Producto ${producto.NombreProducto}: Error al validar`)
        }
      }

      setErroresStock(errores)
      return errores.length === 0
    } catch (error) {
      console.error("Error general en validación de stock:", error)
      setErroresStock(["Error general al validar productos"])
      return false
    } finally {
      setValidandoStock(false)
    }
  }

  // Agregar producto a devolver con validación
  const handleAgregarProductoDevolver = async (producto, cantidad) => {
    if (!producto) return

    // Validar stock antes de agregar
    const esValido = await validarStockProductos([producto])
    if (!esValido) {
      toast.error("No se puede agregar el producto. Revise los errores de validación.")
      return
    }

    const productoExistente = productosDevolver.find((p) => p.IdProducto === producto.IdProducto)

    if (productoExistente) {
      setProductosDevolver(
        productosDevolver.map((p) =>
          p.IdProducto === producto.IdProducto
            ? { ...p, Cantidad: cantidad, Subtotal: producto.PrecioUnitario * cantidad }
            : p,
        ),
      )
    } else {
      setProductosDevolver([
        ...productosDevolver,
        {
          IdProducto: producto.IdProducto,
          NombreProducto: producto.NombreProducto || producto.producto?.nombre || `Producto ID: ${producto.IdProducto}`,
          PrecioUnitario: producto.PrecioUnitario,
          Cantidad: cantidad,
          Subtotal: producto.PrecioUnitario * cantidad,
        },
      ])
    }

    toast.success(`Producto agregado para devolución: ${producto.NombreProducto}`)
  }

  // Agregar producto de cambio con validación de stock
  const handleAgregarProductoCambio = async (producto, cantidad) => {
    if (!producto) return

    // Verificar stock disponible para productos de cambio
    if (producto.Origen === "Stock" && producto.Stock < cantidad) {
      toast.error(`Stock insuficiente para ${producto.NombreProducto}. Disponible: ${producto.Stock}`)
      return
    }

    const productoExistente = productosCambio.find((p) => p.IdProducto === producto.IdProducto)

    if (productoExistente) {
      setProductosCambio(
        productosCambio.map((p) =>
          p.IdProducto === producto.IdProducto ? { ...p, Cantidad: cantidad, Subtotal: producto.Precio * cantidad } : p,
        ),
      )
    } else {
      setProductosCambio([
        ...productosCambio,
        {
          IdProducto: producto.IdProducto,
          NombreProducto: producto.NombreProducto,
          PrecioUnitario: producto.Precio,
          Cantidad: cantidad,
          Subtotal: producto.Precio * cantidad,
        },
      ])
    }

    toast.success(`Producto agregado para cambio: ${producto.NombreProducto}`)
  }

  // Eliminar productos
  const handleEliminarProductoDevolver = (idProducto) => {
    setProductosDevolver(productosDevolver.filter((p) => p.IdProducto !== idProducto))
    toast.info("Producto removido de la devolución")
  }

  const handleEliminarProductoCambio = (idProducto) => {
    setProductosCambio(productosCambio.filter((p) => p.IdProducto !== idProducto))
    toast.info("Producto removido del cambio")
  }

  // Calcular totales
  const calcularTotales = () => {
    const subtotalDevolucion = productosDevolver.reduce((total, p) => total + p.Subtotal, 0)
    const subtotalCambio = productosCambio.reduce((total, p) => total + p.Subtotal, 0)
    const saldoCliente = subtotalDevolucion - subtotalCambio

    return {
      devolucion: { subtotal: subtotalDevolucion, total: subtotalDevolucion },
      cambio: { subtotal: subtotalCambio, total: subtotalCambio },
      saldoCliente,
    }
  }

  const handleCancel = () => {
    navigate("/ventas/ventas")
  }

  // ✅ FUNCIÓN PRINCIPAL MEJORADA: Enviar formulario con validaciones completas
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones básicas
    if (productosDevolver.length === 0) {
      toast.error("Debe seleccionar al menos un producto para devolver")
      return
    }

    if (!motivo) {
      toast.error("Debe seleccionar un motivo para la devolución")
      return
    }

    if (motivo === "otro" && !motivoPersonalizado.trim()) {
      toast.error("Debe ingresar el motivo de la devolución")
      return
    }

    // Verificar datos según tipo de devolución
    if (!validarDevolucion()) {
      toast.error("Verifica los datos según el tipo de devolución seleccionado")
      return
    }

    // Validar que en devolución por cambio no haya saldo a favor
    const totales = calcularTotales()
    if (tipoDevolucion === "cambio" && totales.saldoCliente < 0) {
      if (montoRecibido < Math.abs(totales.saldoCliente)) {
        toast.error("El monto recibido no cubre la diferencia a pagar.")
        return
      }
    }

    try {
      setSubmitting(true)

      // Determinar tipo de devolución final
      let tipoDevolucionFinal = tipoDevolucion
      if (productosDevolver.length > 0 && productosCambio.length > 0) {
        tipoDevolucionFinal = "cambio"
      } else if (productosDevolver.length > 0 && productosCambio.length === 0) {
        tipoDevolucionFinal = "completa"
      } else if (productosDevolver.length > 0 && productosCambio.length === 0 && productosDevolver.length < detallesProductos.length) {
        tipoDevolucionFinal = "parcial"
      }

      // Calcular IVA y totales
      const productosDevolverConIVA = productosDevolver.map((p) => ({
        ...p,
        IvaUnitario: calcularIVAProducto(p),
      }))
      const totalIva = productosDevolverConIVA.reduce((acc, p) => acc + p.IvaUnitario * p.Cantidad, 0)
      const totalSubtotal = productosDevolverConIVA.reduce((acc, p) => acc + p.PrecioUnitario * p.Cantidad, 0)
      const totalDevolucion = totalSubtotal + totalIva

      const ventaPayload = {
        ...venta,
        Subtotal: totalSubtotal,
        TotalIva: totalIva,
        TotalMonto: totalDevolucion,
        IdVentaOriginal: venta.IdVentaOriginal || venta.IdVenta || null,
        MontoRecibido: montoRecibido || 0, // Nuevo campo
      }

      const metadatos = {
        tipoDevolucion: tipoDevolucionFinal,
        motivoOriginal: motivo === "otro" ? motivoPersonalizado : motivo,
        usuarioProcesa: usuarioLogueado?.Nombre,
        productosDevueltosTotales: productosDevolver.length,
        productosOriginalesTotales: detallesProductos.length,
        saldoCliente: totalDevolucion,
      }

      console.log("Enviando devolución:", {
        venta: ventaPayload,
        detallesProductos: productosDevolverConIVA,
        productosCambio,
        metadatos,
      })

      const resultado = await axios.post("/sales/devoluciones", {
        venta: ventaPayload,
        detallesProductos: productosDevolverConIVA,
        productosCambio,
        metadatos,
      })

      console.log("Respuesta del backend:", resultado.data)

      // Alerta simple
      toast.success(`✅ Devolución completada. Nueva factura #${resultado.data.nuevaFacturaDevolucion.IdVenta}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      })

      // Redirigir después de éxito
      setTimeout(() => {
        navigate("/ventas/ventas")
      }, 2000)
    } catch (error) {
      console.error("❌ Error al procesar la devolución:", error)
      toast.error(
        <div>
          <strong>❌ Error en la devolución</strong>
          <br />
          <small>{error.message || "Error desconocido al procesar la devolución"}</small>
        </div>,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Obtener información del cliente
  const nombreCliente = (() => {
    if (venta?.cliente) {
      const nombre = venta.cliente.nombre || venta.cliente.Nombre || ""
      const apellido = venta.cliente.apellido || venta.cliente.Apellido || ""
      if (nombre || apellido) {
        return `${nombre} ${apellido}`.trim()
      }
    }

    if (venta?.IdCliente === 3) {
      return "Consumidor Final"
    }

    return `Cliente ID: ${venta?.IdCliente || "No disponible"}`
  })()

  // Validar devolución según tipo
  const validarDevolucion = () => {
    if (tipoDevolucion === "completa") {
      // Solo motivo, no productos seleccionados
      if (!motivo || (motivo === "otro" && !motivoPersonalizado.trim())) return false
      return true
    }
    if (tipoDevolucion === "parcial") {
      // Debe haber productos seleccionados o monto válido
      if (productosDevolver.length === 0) return false
      // Si implementas monto específico, valida aquí
      return true
    }
    if (tipoDevolucion === "cambio") {
      // Debe haber productos a devolver y productos de cambio
      if (productosDevolver.length === 0 || productosCambio.length === 0) return false
      return true
    }
    return false
  }

  const cargarProductosDisponibles = async () => {
    try {
      console.log("🔄 Cargando productos disponibles...")

      // Forzar recarga para obtener stock actualizado
      const productosData = await ProductosService.getActivosParaCompras()
      setProductosDisponibles(productosData || [])

      console.log("✅ Productos disponibles cargados:", productosData?.length || 0)

      // Limpiar cache para próxima carga
      VentasService.limpiarCacheProductos()
    } catch (productosError) {
      console.warn("Error al obtener productos activos:", productosError)
      setProductosDisponibles([])
    }
  }

  // Calcular IVA de un producto
  const calcularIVAProducto = (producto) => {
    if (producto.AplicaIVA && producto.PorcentajeIVA) {
      const porcentaje = Number(producto.PorcentajeIVA) / 100
      return Number((producto.PrecioUnitario * porcentaje).toFixed(2))
    }
    return 0
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos de la venta...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>❌ Error</h5>
          <p>{error}</p>
        </div>
        <Link to="/ventas/ventas" className="btn btn-primary">
          ← Volver a Ventas
        </Link>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>⚠️ Venta no encontrada</h5>
          <p>No se encontró la venta especificada</p>
        </div>
        <Link to="/ventas/ventas" className="btn btn-primary">
          ← Volver a Ventas
        </Link>
      </div>
    )
  }

  const totales = calcularTotales()

  // Calcular IVA de los productos a devolver
  const productosDevolverConIVA = productosDevolver.map((p) => ({
    ...p,
    IvaUnitario: calcularIVAProducto(p),
  }))

  const totalIva = productosDevolverConIVA.reduce(
    (acc, p) => acc + p.IvaUnitario * p.Cantidad,
    0,
  )
  const totalSubtotal = productosDevolverConIVA.reduce(
    (acc, p) => acc + p.PrecioUnitario * p.Cantidad,
    0,
  )
  const totalDevolucion = totalSubtotal + totalIva


return (
  <div className="devolucion-venta-container container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔄 Devolución de Venta #{ventaId}</h2>
        <Link to="/ventas/ventas" className="btn btn-outline-secondary">
          ← Volver a Ventas
        </Link>
      </div>

      {/* ✅ MOSTRAR ERRORES DE VALIDACIÓN DE STOCK */}
      {erroresStock.length > 0 && (
        <div className="alert alert-warning mb-4">
          <h6>⚠️ Problemas detectados in productos:</h6>
          <ul className="mb-0">
            {erroresStock.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ INDICADOR DE VALIDACIÓN DE STOCK */}
      {validandoStock && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>Validando productos para devolución...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Información de la venta original mejorada */}
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">📋 Información de la Venta Original</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="cliente-nombre"
                    placeholder="Cliente"
                    value={nombreCliente}
                    readOnly
                  />
                  <label htmlFor="cliente-nombre">👤 Cliente</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="date"
                    className="form-control"
                    id="fecha-venta"
                    placeholder="Fecha de Venta"
                    value={venta.FechaVenta || ""}
                    readOnly
                  />
                  <label htmlFor="fecha-venta">📅 Fecha de Venta</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="factura"
                    placeholder="Factura"
                    value={venta.IdVenta || ""}
                    readOnly
                  />
                  <label htmlFor="factura">🧾 Factura</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="total-venta"
                    placeholder="Total"
                    value={formatearMoneda(venta.TotalMonto || 0)}
                    readOnly
                  />
                  <label htmlFor="total-venta">💰 Total Original</label>
                </div>
              </div>
            </div>

            {/* ✅ INFORMACIÓN ADICIONAL DE LA VENTA */}
            <div className="row mt-3">
              <div className="col-md-4">
                <div className="form-floating">
                  <input type="text" className="form-control" value={venta.Estado || venta.estado || ""} readOnly />
                  <label>📊 Estado Actual</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input type="text" className="form-control" value={venta.MetodoPago || "Efectivo"} readOnly />
                  <label>💳 Método de Pago</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <select
                    className="form-select"
                    value={tipoDevolucion}
                    onChange={(e) => setTipoDevolucion(e.target.value)}
                  >
                    <option value="completa">Devolución Completa</option>
                    <option value="parcial">Devolución Parcial</option>
                    <option value="cambio">Cambio de Productos</option>
                  </select>
                  <label>🔄 Tipo de Devolución</label>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              {/* ...otras columnas... */}
              <div className="col-md-12">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    value={venta?.NotasAdicionales || "Sin notas adicionales"}
                    readOnly
                    style={{ minHeight: 60 }}
                  />
                  <label>📝 Notas Adicionales (Venta Original)</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resto del componente con las pestañas mejoradas... */}
        <ul className="nav nav-tabs mb-3" id="devolucionTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="productos-tab"
              data-bs-toggle="tab"
              data-bs-target="#productos"
              type="button"
              role="tab"
            >
              📦 Productos a Devolver
              {productosDevolver.length > 0 && <span className="badge bg-danger ms-2">{productosDevolver.length}</span>}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="cambio-tab"
              data-bs-toggle="tab"
              data-bs-target="#cambio"
              type="button"
              role="tab"
            >
              🔄 Productos para Cambio
              {productosCambio.length > 0 && <span className="badge bg-success ms-2">{productosCambio.length}</span>}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="motivo-tab"
              data-bs-toggle="tab"
              data-bs-target="#motivo"
              type="button"
              role="tab"
            >
              📝 Motivo y Estado
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="resumen-tab"
              data-bs-toggle="tab"
              data-bs-target="#resumen"
              type="button"
              role="tab"
            >
              📊 Resumen
            </button>
          </li>
        </ul>

        <div className="tab-content" id="devolucionTabContent">
          {/* Pestaña de Productos a Devolver */}
          <div className="tab-pane fade show active" id="productos" role="tabpanel">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">📦 Productos de la Venta Original</h5>
              </div>
              <div className="card-body">
                {detallesProductos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallesProductos.map((detalle) => {
                          const yaDevuelto = productosDevolver.some((p) => p.IdProducto === detalle.IdProducto)

                          return (
                            <tr
                              key={detalle.IdDetalleVentas || detalle.id}
                              className={yaDevuelto ? "table-warning" : ""}
                            >
                              <td>
                                {detalle.NombreProducto ||
                                  (detalle.producto ? detalle.producto.nombre : `Producto ID: ${detalle.IdProducto}`)}
                                {yaDevuelto && <span className="badge bg-warning ms-2">En devolución</span>}
                              </td>
                              <td>{detalle.Cantidad}</td>
                              <td>{formatearMoneda(detalle.PrecioUnitario)}</td>
                              <td>{formatearMoneda(detalle.PrecioUnitario * detalle.Cantidad)}</td>
                              <td>
                                <span className="badge bg-success">✅ Disponible</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm me-2"
                                    style={{ width: "60px" }}
                                    min="1"
                                    max={detalle.Cantidad}
                                    defaultValue="1"
                                    disabled={yaDevuelto}
                                    onChange={(e) =>
                                      (e.target.value = Math.min(
                                        Math.max(1, Number.parseInt(e.target.value) || 1),
                                        detalle.Cantidad,
                                      ))
                                    }
                                  />
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${yaDevuelto ? "btn-secondary" : "btn-primary"}`}
                                    disabled={yaDevuelto}
                                    onClick={(e) =>
                                      handleAgregarProductoDevolver(
                                        detalle,
                                        Number.parseInt(e.target.previousSibling.value),
                                      )
                                    }
                                  >
                                    {yaDevuelto ? "Agregado" : "Devolver"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No hay productos en esta venta</div>
                )}
              </div>
            </div>

            {/* Lista de productos a devolver */}
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">🔄 Productos Seleccionados para Devolución</h5>
              </div>
              <div className="card-body">
                {productosDevolver.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosDevolver.map((prod, idx) => (
                          <tr key={prod.IdProducto || prod.id || idx}>
                            <td>{prod.NombreProducto}</td>
                            <td>{prod.Cantidad}</td>
                            <td>{formatearMoneda(prod.PrecioUnitario)}</td>
                            <td>{formatearMoneda(prod.Subtotal)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleEliminarProductoDevolver(prod.IdProducto)}
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="3" className="text-end fw-bold">
                            Total a Devolver:
                          </td>
                          <td className="fw-bold text-success">{formatearMoneda(totales.devolucion.total)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <h6>ℹ️ No hay productos agregados a la devolución</h6>
                    <p className="mb-0">Seleccione productos de la tabla superior para agregarlos a la devolución.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pestaña de Productos para Cambio */}
          <div className="tab-pane fade" id="cambio" role="tabpanel">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">🔄 Productos para Cambio</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h6>💡 Información sobre cambios</h6>
                  <p className="mb-0">
                    Los productos de cambio se descontarán del monto de devolución. Si el valor del cambio es mayor, el
                    cliente deberá pagar la diferencia.
                  </p>
                </div>

                <div className="row mb-3">
                  <div className="col-md-5">
                    <div className="form-floating">
                      <select className="form-select" id="productoCambio">
                        <option value="">Seleccione un producto...</option>
                        {productosDisponibles.map((producto) => (
                          <option key={producto.IdProducto} value={producto.IdProducto}>
                            {producto.NombreProducto} - {formatearMoneda(producto.Precio)}
                            {producto.Origen === "Stock" && ` (Stock: ${producto.Stock})`}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="productoCambio">🛍️ Producto</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        id="cantidadCambio"
                        placeholder="Cantidad"
                        min="1"
                        defaultValue="1"
                      />
                      <label htmlFor="cantidadCambio">📊 Cantidad</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-success h-100"
                      onClick={() => {
                        const select = document.getElementById("productoCambio")
                        const cantidad = Number.parseInt(document.getElementById("cantidadCambio").value) || 1
                        const productoId = Number.parseInt(select.value)
                        if (productoId) {
                          const producto = productosDisponibles.find((p) => p.IdProducto === productoId)
                          handleAgregarProductoCambio(producto, cantidad)
                          select.value = ""
                          document.getElementById("cantidadCambio").value = "1"
                        } else {
                          toast.error("Debe seleccionar un producto")
                        }
                      }}
                    >
                      ➕ Agregar
                    </button>
                  </div>
                </div>

                {productosCambio.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosCambio.map((producto) => (
                          <tr key={producto.IdProducto}>
                            <td>{producto.NombreProducto}</td>
                            <td>{producto.Cantidad}</td>
                            <td>{formatearMoneda(producto.PrecioUnitario)}</td>
                            <td>{formatearMoneda(producto.Subtotal)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleEliminarProductoCambio(producto.IdProducto)}
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="3" className="text-end fw-bold">
                            Total Cambio:
                          </td>
                          <td className="fw-bold text-primary">{formatearMoneda(totales.cambio.total)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-secondary">
                    <h6>📦 No hay productos de cambio</h6>
                    <p className="mb-0">
                      Use el formulario superior para agregar productos que el cliente recibirá a cambio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pestaña de Motivo y Estado */}
          <div className="tab-pane fade" id="motivo" role="tabpanel">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">📝 Motivo y Estado de la Devolución</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-floating">
                      <select
                        className="form-select"
                        id="motivo-select"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        required
                      >
                        <option value="">Seleccione un motivo...</option>
                        <option value="defectuoso">🔧 Producto defectuoso</option>
                        <option value="equivocado">❌ Producto equivocado</option>
                        <option value="insatisfaccion">😞 Insatisfacción del cliente</option>
                        <option value="garantia">🛡️ Garantía</option>
                        <option value="cambio_talla">📏 Cambio de talla/tamaño</option>
                        <option value="otro">✏️ Otro motivo</option>
                      </select>
                      <label htmlFor="motivo-select">🤔 Motivo de la Devolución *</label>
                    </div>

                    {motivo === "otro" && (
                      <div className="form-floating mt-3">
                        <textarea
                          className="form-control"
                          id="motivo-personalizado"
                          placeholder="Especifique el motivo"
                          value={motivoPersonalizado}
                          onChange={(e) => setMotivoPersonalizado(e.target.value)}
                          style={{ height: "100px" }}
                          required
                        ></textarea>
                        <label htmlFor="motivo-personalizado">✏️ Especifique el motivo *</label>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating">
                      <select
                        className="form-select"
                        id="estado-select"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                      >
                        <option value="Devuelta">✅ Devuelta (Procesada)</option>
                        <option value="Pendiente">⏳ Pendiente</option>
                      </select>
                      <label htmlFor="estado-select">📊 Estado de la Devolución</label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating">
                      <input
                        type="date"
                        className="form-control"
                        id="fecha-devolucion"
                        value={fechaDevolucion}
                        onChange={(e) => setFechaDevolucion(e.target.value)}
                      />
                      <label htmlFor="fecha-devolucion">📅 Fecha de Devolución</label>
                    </div>
                  </div>
                </div>

                {/* ✅ INFORMACIÓN ADICIONAL PARA TRAZABILIDAD */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="alert alert-light">
                      <h6>📋 Información de Trazabilidad</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <small>
                            <strong>👤 Usuario que procesa:</strong>{" "}
                            {usuarioLogueado?.Nombre ||
                              usuarioLogueado?.nombre ||
                              usuarioLogueado?.NombreUsuario ||
                              "No identificado"}
                            <br />
                            <strong>🕐 Fecha de proceso:</strong> {new Date().toLocaleString("es-CO")}
                            <br />
                            <strong>🔄 Tipo de devolución:</strong> {tipoDevolucion}
                          </small>
                        </div>
                        <div className="col-md-6">
                          <small>
                            <strong>📦 Productos originales:</strong> {detallesProductos.length}
                            <br />
                            <strong>↩️ Productos a devolver:</strong> {productosDevolver.length}
                            <br />
                            <strong>🔄 Productos de cambio:</strong> {productosCambio.length}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestaña de Resumen */}
          <div className="tab-pane fade" id="resumen" role="tabpanel">
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📊 Resumen de la Devolución</h5>
              </div>
              {/* Campo de monto recibido SOLO en resumen y solo si corresponde */}
{tipoDevolucion === "cambio" && totales.saldoCliente < 0 && (
  <div className="mt-4">
    <label className="form-label fw-bold text-warning">
      💳 Monto recibido del cliente (diferencia a pagar)
    </label>
    <input
      type="number"
      className="form-control"
      min={Math.abs(totales.saldoCliente)}
      value={montoRecibido}
      onChange={e => setMontoRecibido(Number(e.target.value))}
      required
    />
    <div className="form-text">
      El cliente debe pagar al menos {formatearMoneda(Math.abs(totales.saldoCliente))}
    </div>
  </div>
)}
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h6 className="card-title text-success">💰 Total Devolución</h6>
                        <h4 className="text-success">{formatearMoneda(totales.devolucion.total)}</h4>
                        <small className="text-muted">{productosDevolver.length} productos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h6 className="card-title text-primary">🔄 Total Cambio</h6>
                        <h4 className="text-primary">{formatearMoneda(totales.cambio.total)}</h4>
                        <small className="text-muted">{productosCambio.length} productos</small>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-12">
                    <div className={`card ${totales.saldoCliente >= 0 ? "border-success" : "border-warning"}`}>
                      <div className="card-body text-center">
                        <h5 className="card-title">
                          {totales.saldoCliente >= 0 ? "💰 Saldo a Favor del Cliente" : "💳 Cliente Debe Pagar"}
                        </h5>
                        <h3 className={totales.saldoCliente >= 0 ? "text-success" : "text-warning"}>
                          {formatearMoneda(Math.abs(totales.saldoCliente))}
                        </h3>
                        <p className={`mb-0 ${totales.saldoCliente >= 0 ? "text-success" : "text-warning"}`}>
                          {totales.saldoCliente >= 0
                            ? "✅ El cliente tiene un saldo a favor que puede ser utilizado en futuras compras o reembolsado."
                            : "⚠️ El cliente debe pagar la diferencia ya que el valor de los productos de cambio excede el valor de la devolución."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ NUEVA SECCIÓN: Validación de Exceso */}
                <div className="row mt-4">
                  <div className="col-12">
                    {(() => {
                      const montoDevolucion = totales.devolucion.total
                      const montoVentaOriginal = venta?.TotalMonto || 0
                      const diferenciaMonto = montoDevolucion - montoVentaOriginal
                      const hayExceso = diferenciaMonto > 0

                      if (hayExceso) {
                        return (
                          <div className="alert alert-warning border-warning">
                            <h6 className="alert-heading text-warning mb-3">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              ⚠️ VALIDACIÓN DE EXCESO DETECTADA
                            </h6>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="bg-light p-3 rounded">
                                  <h6 className="text-warning mb-2">💰 Análisis Financiero:</h6>
                                  <ul className="list-unstyled mb-0 small">
                                    <li>
                                      <strong>Venta original:</strong> {formatearMoneda(montoVentaOriginal)}
                                    </li>
                                    <li>
                                      <strong>Monto devolución:</strong> {formatearMoneda(montoDevolucion)}
                                    </li>
                                    <li className="text-danger">
                                      <strong>EXCESO:</strong> {formatearMoneda(diferenciaMonto)}
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="bg-warning bg-opacity-10 p-3 rounded">
                                  <h6 className="text-warning mb-2">⚠️ Acciones Requeridas:</h6>
                                  <ul className="list-unstyled mb-0 small">
                                    <li>✓ Confirmar pago adicional con cliente</li>
                                    <li>✓ Procesar pago de {formatearMoneda(diferenciaMonto)}</li>
                                    <li>✓ Generar comprobante del exceso</li>
                                    <li>✓ Actualizar estado de la devolución</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-warning bg-opacity-25 rounded border border-warning">
                              <p className="mb-0 text-warning">
                                <i className="fas fa-info-circle me-1"></i>
                                <strong>Importante:</strong> Esta devolución genera un exceso de{" "}
                                {formatearMoneda(diferenciaMonto)} que debe ser pagado por el cliente antes de completar
                                la operación.
                              </p>
                            </div>
                          </div>
                        )
                      } else if (diferenciaMonto < 0) {
                        return (
                          <div className="alert alert-success border-success">
                            <h6 className="alert-heading text-success mb-2">
                              <i className="fas fa-check-circle me-2"></i>✅ Saldo a Favor del Cliente
                            </h6>
                            <p className="mb-0 text-success">
                              El cliente tiene un saldo a favor de{" "}
                              <strong>{formatearMoneda(Math.abs(diferenciaMonto))}</strong> que puede ser reembolsado o
                              utilizado en futuras compras.
                            </p>
                          </div>
                        )
                      } else {
                        return (
                          <div className="alert alert-info border-info">
                            <h6 className="alert-heading text-info mb-2">
                              <i className="fas fa-balance-scale me-2"></i>
                              ⚖️ Montos Equilibrados
                            </h6>
                            <p className="mb-0 text-info">
                              El monto de devolución coincide exactamente con el total de la venta original. No hay
                              diferencias a procesar.
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>

                {/* ✅ NUEVA SECCIÓN: Información de Nueva Factura */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <h6 className="text-info mb-2">
                        <i className="fas fa-file-invoice me-2"></i>📄 Nueva Factura de Devolución
                      </h6>
                      <div className="row">
                        <div className="col-md-8">
                          <p className="mb-2 small">
                            Se generará automáticamente una nueva factura con los productos devueltos:
                          </p>
                          <ul className="list-unstyled mb-0 small">
                            {productosDevolver.map((producto, index) => (
                              <li key={index} className="mb-1">
                                <i className="fas fa-box me-1 text-primary"></i>
                                {producto.Cantidad}x {producto.NombreProducto} - {formatearMoneda(producto.Subtotal)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center">
                            <i className="fas fa-file-invoice fa-3x text-info mb-2"></i>
                            <p className="small text-muted mb-0">Factura automática</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESUMEN DETALLADO */}
                <div className="mt-4">
                  <h6>📋 Resumen Detallado</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td>
                            <strong>🧾 Venta Original:</strong>
                          </td>
                          <td>#{ventaId}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>👤 Cliente:</strong>
                          </td>
                          <td>{nombreCliente}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>📅 Fecha Original:</strong>
                          </td>
                          <td>{venta.FechaVenta}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>📅 Fecha Devolución:</strong>
                          </td>
                          <td>{fechaDevolucion}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>🤔 Motivo:</strong>
                          </td>
                          <td>{motivo === "otro" ? motivoPersonalizado : motivo}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>🔄 Tipo:</strong>
                          </td>
                          <td>{tipoDevolucion}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>📊 Estado:</strong>
                          </td>
                          <td>
                            <span className={`badge ${estado === "Devuelta" ? "bg-success" : "bg-warning"}`}>
                              {estado}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción mejorados */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleCancel}>
            ❌ Cancelar
          </button>

          <div className="d-flex gap-2">
            {productosDevolver.length > 0 && (
              <div className="text-muted me-3">
                <small>
                  📦 {productosDevolver.length} productos seleccionados
                  <br />💰 Total: {formatearMoneda(totales.devolucion.total)}
                </small>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || productosDevolver.length === 0 || !motivo}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Procesando Devolución...
                </>
              ) : (
                <>✅ Confirmar Devolución</>
              )}
            </button>
          </div>
        </div>
      </form>

      {console.log("Tipo de devolución seleccionado:", tipoDevolucion)}
      {console.log("Cliente:", nombreCliente ?? "Sin nombre")}
      {console.log("Productos a devolver:", productosDevolver)}
      {console.log("Productos de cambio:", productosCambio)}
      {console.log("Monto parcial:", montoParcial)}

      {/* Botón para actualizar stock manualmente */}
      <div className="d-flex justify-content-end mb-4">
        <button
          type="button"
          className="btn btn-outline-info btn-sm"
          onClick={cargarProductosDisponibles}
          disabled={submitting || stockActualizandose}
        >
          {stockActualizandose ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              Actualizando...
            </>
          ) : (
            <>🔄 Actualizar Stock</>
          )}
        </button>
      </div>

      {stockActualizandose && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>📦 Actualizando stock de productos...</span>
          </div>
        </div>
      )}

      {ultimaActualizacionStock && (
        <div className="alert alert-success mb-4">
          <small>
            <i className="fas fa-check-circle me-1"></i>
            Stock actualizado: {ultimaActualizacionStock.toLocaleTimeString()}
          </small>
        </div>
      )}
    </div>
  )
}

export default DevolucionVentaMejorada
