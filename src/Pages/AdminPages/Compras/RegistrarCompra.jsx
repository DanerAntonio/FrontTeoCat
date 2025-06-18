"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Save, ArrowLeft } from "lucide-react"
import "../../../Styles/AdminStyles/RegistrarCompra.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import CompraForm from "../../../Components/AdminComponents/ComprasComponents/CompraForm"
import ProductosTable from "../../../Components/AdminComponents/ComprasComponents/ProductosTable"
import ResumenCompra from "../../../Components/AdminComponents/ComprasComponents/ResumenCompra"
import ComprasService from "../../../Services/ConsumoAdmin/ComprasService.js"
import ProveedoresService from "../../../Services/ConsumoAdmin/ProveedoresService.js"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Componente para registrar compras de productos
 * Permite seleccionar proveedor, agregar productos y registrar la compra
 */
const RegistrarCompra = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Obtener el ID de la compra de los parámetros de la URL (para edición)
  const params = new URLSearchParams(location.search)
  const compraId = params.get("id")
  const isEditing = !!compraId

  // Estado para los productos disponibles
  const [productos, setProductos] = useState([])

  // Estado para los proveedores disponibles
  const [proveedores, setProveedores] = useState([])

  // Estado para indicar carga de datos
  const [isLoading, setIsLoading] = useState(false)

  // Estado para manejar errores
  const [error, setError] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    proveedor: null,
    FechaCompra: new Date().toISOString().split("T")[0],
    productosAgregados: [],
    productoSeleccionado: null,
    cantidad: 1,
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    proveedor: "",
    FechaCompra: "",
    productoSeleccionado: "",
    cantidad: "",
    productosAgregados: "",
  })

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Cargar proveedores
        const proveedoresData = await ProveedoresService.getAll()
        setProveedores(proveedoresData)

        // Cargar productos
        const productosData = await ProductosService.getActivosParaCompras()
        setProductos(productosData)

        // Si estamos editando, cargar los datos de la compra
        if (isEditing) {
          console.log(`Cargando datos de la compra ID: ${compraId}`)
          const compraData = await ComprasService.getById(compraId)
          console.log("Datos de compra obtenidos:", compraData)

          // Buscar el proveedor en la lista de proveedores
          const proveedor = proveedoresData.find((p) => p.IdProveedor === compraData.IdProveedor)

          // Asegurarse de que los detalles tengan toda la información necesaria
          let detallesCompletos = []

          if (compraData.detalles && compraData.detalles.length > 0) {
            detallesCompletos = compraData.detalles.map((detalle) => {
              // Buscar información adicional del producto si es necesario
              const productoInfo = productosData.find((p) => p.IdProducto === detalle.IdProducto)

              // Asegurarse de que todos los campos necesarios estén presentes
              return {
                IdProducto: detalle.IdProducto,
                codigoBarras: detalle.codigoBarras || productoInfo?.CodigoBarras || "Sin código",
                nombre: detalle.nombre || productoInfo?.NombreProducto || "Producto sin nombre",
                Cantidad: Number(detalle.Cantidad),
                PrecioUnitario: Number(detalle.PrecioUnitario),
                iva: detalle.iva !== undefined ? Number(detalle.iva) : productoInfo?.PorcentajeIVA || 0,
                IvaUnitario: Number(detalle.IvaUnitario || detalle.PrecioUnitario * ((detalle.iva || 0) / 100)),
                Subtotal: Number(detalle.Subtotal || detalle.Cantidad * detalle.PrecioUnitario),
                SubtotalConIva: Number(detalle.SubtotalConIva || detalle.Subtotal * (1 + (detalle.iva || 0) / 100)),
                PrecioVentaSugerido: Number(detalle.PrecioVentaSugerido || 0),
                actualizarPrecioVenta: detalle.actualizarPrecioVenta || false,
              }
            })
          }

          console.log("Detalles completos:", detallesCompletos)

          // Actualizar el formulario con los datos de la compra
          setFormData({
            proveedor: proveedor || null,
            FechaCompra: compraData.FechaCompra.split("T")[0],
            productosAgregados: detallesCompletos,
            productoSeleccionado: null,
            cantidad: 1,
          })
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [compraId, isEditing])

  /**
   * Función para formatear números con separadores de miles
   * @param {number} number - Número a formatear
   * @returns {string} Número formateado con separadores de miles
   */
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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

    // Limpiar el error específico
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  /**
   * Manejador para seleccionar un producto
   * @param {Object} selectedOption - Opción seleccionada del select
   */
  const handleSelectProduct = (selectedOption) => {
    setFormData({
      ...formData,
      productoSeleccionado: selectedOption ? selectedOption.value : null,
    })

    // Limpiar el error específico
    if (formErrors.productoSeleccionado) {
      setFormErrors({
        ...formErrors,
        productoSeleccionado: "",
      })
    }
  }

  /**
   * Manejador para seleccionar un proveedor
   * @param {Object} selectedOption - Opción seleccionada del select
   */
  const handleSelectProveedor = (selectedOption) => {
    setFormData({
      ...formData,
      proveedor: selectedOption ? selectedOption.value : null,
    })

    // Limpiar el error específico
    if (formErrors.proveedor) {
      setFormErrors({
        ...formErrors,
        proveedor: "",
      })
    }
  }

  /**
   * Validar el formulario de producto antes de agregarlo
   * @returns {boolean} True si el formulario es válido, false en caso contrario
   */
  const validateProductForm = () => {
    let isValid = true
    const errors = { ...formErrors }

    // Validar selección de producto
    if (!formData.productoSeleccionado) {
      errors.productoSeleccionado = "Por favor, seleccione un producto"
      isValid = false
    }

    // Validar cantidad
    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = "Por favor, ingrese una cantidad válida"
      isValid = false
    } else if (!Number.isInteger(Number(formData.cantidad))) {
      errors.cantidad = "La cantidad debe ser un número entero"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para agregar un producto a la lista
   * Valida los datos y agrega el producto a la lista de productos de la compra
   */
  const handleAddProduct = (formDataWithSuggestion = formData) => {
    // Validar el formulario
    if (!validateProductForm()) {
      return
    }

    const { productoSeleccionado, cantidad, precioVentaSugerido, actualizarPrecioVenta } = formDataWithSuggestion

    // Verificar si el producto ya está en la lista
    const productoExistente = formData.productosAgregados.findIndex(
      (p) => p.IdProducto === productoSeleccionado.IdProducto,
    )

    const nuevosProductos = [...formData.productosAgregados]

    if (productoExistente !== -1) {
      // Actualizar cantidad si el producto ya existe
      const nuevaCantidad = Number.parseInt(nuevosProductos[productoExistente].Cantidad) + Number.parseInt(cantidad)

      nuevosProductos[productoExistente] = {
        ...nuevosProductos[productoExistente],
        Cantidad: nuevaCantidad,
      }

      // Recalcular subtotal y total con IVA
      const subtotal = nuevosProductos[productoExistente].Cantidad * nuevosProductos[productoExistente].PrecioUnitario
      const ivaUnitario =
        nuevosProductos[productoExistente].PrecioUnitario * (nuevosProductos[productoExistente].iva / 100)
      const subtotalConIva = subtotal * (1 + nuevosProductos[productoExistente].iva / 100)

      nuevosProductos[productoExistente].Subtotal = subtotal
      nuevosProductos[productoExistente].IvaUnitario = ivaUnitario
      nuevosProductos[productoExistente].SubtotalConIva = subtotalConIva

      // Actualizar precio sugerido y flag de actualización
      if (precioVentaSugerido) {
        nuevosProductos[productoExistente].PrecioVentaSugerido = precioVentaSugerido
      }
      if (actualizarPrecioVenta !== undefined) {
        nuevosProductos[productoExistente].actualizarPrecioVenta = actualizarPrecioVenta
      }
    } else {
      // Agregar nuevo producto
      const subtotal = Number.parseInt(cantidad) * productoSeleccionado.Precio
      const ivaUnitario = productoSeleccionado.Precio * (productoSeleccionado.PorcentajeIVA / 100)
      const subtotalConIva = subtotal * (1 + productoSeleccionado.PorcentajeIVA / 100)

      nuevosProductos.push({
        IdProducto: productoSeleccionado.IdProducto,
        codigoBarras: productoSeleccionado.CodigoBarras,
        nombre: productoSeleccionado.NombreProducto,
        Cantidad: Number.parseInt(cantidad),
        PrecioUnitario: productoSeleccionado.Precio,
        iva: productoSeleccionado.PorcentajeIVA,
        IvaUnitario: ivaUnitario,
        Subtotal: subtotal,
        SubtotalConIva: subtotalConIva,
        PrecioVentaSugerido: Number(precioVentaSugerido) || 0,
        actualizarPrecioVenta: actualizarPrecioVenta || false,
      })
    }

    // Actualizar el estado
    setFormData({
      ...formData,
      productosAgregados: nuevosProductos,
      productoSeleccionado: null,
      cantidad: 1,
    })

    // Limpiar el error de productos agregados si existía
    if (formErrors.productosAgregados) {
      setFormErrors({
        ...formErrors,
        productosAgregados: "",
      })
    }

    // Notificación de éxito
    toast.success(
      <div>
        <strong>Producto agregado</strong>
        <p>El producto ha sido agregado a la lista.</p>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      },
    )
  }

  /**
   * Manejador para eliminar un producto de la lista
   * @param {number} index - Índice del producto a eliminar
   */
  const handleRemoveProduct = (index) => {
    const nuevosProductos = [...formData.productosAgregados]
    nuevosProductos.splice(index, 1)

    setFormData({
      ...formData,
      productosAgregados: nuevosProductos,
    })

    // Notificación
    toast.info(
      <div>
        <strong>Producto eliminado</strong>
        <p>El producto ha sido eliminado de la lista.</p>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      },
    )
  }

  /**
   * Función para calcular los totales de la compra
   * @returns {Object} Objeto con TotalMonto, TotalIva y TotalMontoConIva
   */
  const calcularTotales = () => {
    const productos = formData.productosAgregados

    // Usar parseFloat para asegurar que los valores sean números
    const TotalMonto = productos.reduce((total, producto) => {
      const subtotal = Number.parseFloat(producto.Subtotal) || 0
      return total + subtotal
    }, 0)

    const TotalIva = productos.reduce((total, producto) => {
      const subtotal = Number.parseFloat(producto.Subtotal) || 0
      const iva = Number.parseFloat(producto.iva) || 0
      return total + subtotal * (iva / 100)
    }, 0)

    const TotalMontoConIva = TotalMonto + TotalIva

    // Redondear a 2 decimales para evitar problemas de precisión
    return {
      TotalMonto: Number.parseFloat(TotalMonto.toFixed(2)),
      TotalIva: Number.parseFloat(TotalIva.toFixed(2)),
      TotalMontoConIva: Number.parseFloat(TotalMontoConIva.toFixed(2)),
    }
  }

  /**
   * Validar el formulario completo antes de guardar
   * @returns {boolean} True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = { ...formErrors }

    // Validar proveedor
    if (!formData.proveedor) {
      errors.proveedor = "Por favor, seleccione un proveedor"
      isValid = false
    }

    // Validar fecha de compra
    if (!formData.FechaCompra) {
      errors.FechaCompra = "Por favor, seleccione una fecha de compra"
      isValid = false
    } else {
      const fechaCompra = new Date(formData.FechaCompra)
      const hoy = new Date()
      hoy.setHours(23, 59, 59, 999) // Fin del día actual

      if (fechaCompra > hoy) {
        errors.FechaCompra = "La fecha de compra no puede ser futura"
        isValid = false
      }

      // Validar que la fecha no sea muy antigua (más de 1 año)
      const unAnioAtras = new Date()
      unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1)

      if (fechaCompra < unAnioAtras) {
        errors.FechaCompra = "La fecha de compra no puede ser mayor a un año"
        isValid = false
      }
    }

    // Validar que haya productos agregados
    if (formData.productosAgregados.length === 0) {
      errors.productosAgregados = "Por favor, agregue al menos un producto a la compra"
      isValid = false
    }

    // Validar monto total (para evitar errores de entrada)
    const { TotalMontoConIva } = calcularTotales()
    if (TotalMontoConIva > 100000000) {
      // 100 millones
      toast.error(
        <div>
          <strong>Error</strong>
          <p>El monto total de la compra es demasiado alto. Por favor, verifique las cantidades y precios.</p>
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
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar la compra
   * Valida los datos y envía la información para registrar la compra
   */
  const handleSaveCompra = async () => {
    // Validar el formulario
    if (!validateForm()) {
      // Mostrar notificación de error general
      toast.error(
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

    // Calcular totales
    const { TotalMonto, TotalIva, TotalMontoConIva } = calcularTotales()

    // Preparar datos para guardar - incluyendo los nuevos campos
    const compraData = {
      compra: {
        IdCompra: isEditing ? Number(compraId) : undefined,
        IdProveedor: formData.proveedor.IdProveedor,
        FechaCompra: formData.FechaCompra,
        TotalMonto: TotalMonto,
        TotalIva: TotalIva,
        TotalMontoConIva: TotalMontoConIva,
        Estado: "Efectiva",
      },
      detalles: formData.productosAgregados.map((producto) => ({
        IdProducto: Number(producto.IdProducto),
        Cantidad: Number(producto.Cantidad),
        PrecioUnitario: Number(producto.PrecioUnitario),
        Subtotal: Number(producto.Subtotal),
        iva: Number(producto.iva || 0),
        PrecioVentaSugerido: Number(producto.PrecioVentaSugerido || 0),
        actualizarPrecioVenta: producto.actualizarPrecioVenta || false,
      })),
    }

    try {
      console.log("Datos a enviar:", JSON.stringify(compraData, null, 2))

      // Enviar datos a la API
      if (isEditing) {
        // Mostrar notificación de carga
        const loadingToastId = toast.loading(
          <div>
            <strong>Actualizando compra</strong>
            <p>Por favor, espere...</p>
          </div>,
          {
            position: "top-right",
          },
        )

        try {
          const response = await ComprasService.update(compraId, compraData)
          console.log("Respuesta del servidor:", response)

          // Descartar notificación de carga
          toast.dismiss(loadingToastId)

          // Mostrar notificación de éxito
          toast.success(
            <div>
              <strong>Compra actualizada</strong>
              <p>La compra ha sido actualizada correctamente.</p>
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
                // Redirigir a la lista de compras después de que se cierre la notificación
                navigate("/compras/compras")
              },
            },
          )
        } catch (error) {
          // Descartar notificación de carga
          toast.dismiss(loadingToastId)
          throw error
        }
      } else {
        // Mostrar notificación de carga
        const loadingToastId = toast.loading(
          <div>
            <strong>Registrando compra</strong>
            <p>Por favor, espere...</p>
          </div>,
          {
            position: "top-right",
          },
        )

        try {
          const response = await ComprasService.create(compraData)
          console.log("Respuesta del servidor:", response)

          // Descartar notificación de carga
          toast.dismiss(loadingToastId)

          // Mostrar notificación de éxito
          toast.success(
            <div>
              <strong>Compra registrada</strong>
              <p>La compra ha sido registrada correctamente.</p>
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
                // Redirigir a la lista de compras después de que se cierre la notificación
                navigate("/compras/compras")
              },
            },
          )
        } catch (error) {
          // Descartar notificación de carga
          toast.dismiss(loadingToastId)
          throw error
        }
      }
    } catch (error) {
      console.error("Error al guardar la compra:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })

      // Mensaje de error personalizado basado en el tipo de error
      let errorMessage = "No se pudo guardar la compra. Por favor, intente nuevamente."

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (error.response.status === 400) {
          errorMessage = "Datos de compra inválidos. Verifique la información e intente nuevamente."
        } else if (error.response.status === 404) {
          errorMessage = "No se encontró la compra para actualizar. Puede que haya sido eliminada."
        } else if (error.response.status === 500) {
          errorMessage =
            "Error en el servidor. Por favor, contacte al administrador o intente con un formato más simple."
        }

        // Si el servidor devuelve un mensaje específico, usarlo
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        errorMessage = "No se recibió respuesta del servidor. Verifique su conexión a internet."
      }

      toast.error(
        <div>
          <strong>Error</strong>
          <p>{errorMessage}</p>
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
    }
  }

  /**
   * Manejador para cancelar y volver a la lista de compras
   */
  const handleCancel = () => {
    navigate("/compras/compras")
  }

  // Opciones para el select de productos
  const productosOptions = productos.map((producto) => ({
    value: producto,
    label: `${producto.NombreProducto} - ${producto.CodigoBarras} - $${formatNumber(producto.Precio)}`,
  }))

  // Opciones para el select de proveedores
  const proveedoresOptions = proveedores.map((proveedor) => ({
    value: proveedor,
    label: `${proveedor.nombreEmpresa} - ${proveedor.documento}`,
  }))

  return (
    <div className="registrar-compra-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Editar Compra" : "Registrar Compra"}</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleCancel}>
          <ArrowLeft size={18} className="me-1" />
          Volver a Compras
        </button>
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <form className="compra-form">
              {/* Sección de información básica de la compra */}
              <CompraForm
                formData={formData}
                formErrors={formErrors}
                proveedoresOptions={proveedoresOptions}
                productosOptions={productosOptions}
                handleInputChange={handleInputChange}
                handleSelectProveedor={handleSelectProveedor}
                handleSelectProduct={handleSelectProduct}
                handleAddProduct={handleAddProduct}
              />

              {/* Tabla de productos agregados */}
              <ProductosTable
                productosAgregados={formData.productosAgregados}
                formErrors={formErrors}
                formatNumber={formatNumber}
                handleRemoveProduct={handleRemoveProduct}
              />

              {/* Resumen de la compra */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <ResumenCompra totales={calcularTotales()} formatNumber={formatNumber} />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleSaveCompra}>
                  <Save size={18} className="me-1" />
                  {isEditing ? "Actualizar Compra" : "Registrar Compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  )
}

export default RegistrarCompra
