"use client"

import { useState, useEffect } from "react"
import Select from "react-select"
import "../VentasComponents/ProductoDevolucionForm.scss"
import * as bootstrap from "bootstrap"

/**
 * Componente para el formulario de agregar productos a devolver CON validación
 */
const ProductoDevolucionForm = ({
  devolucionActual,
  formErrors,
  productosOptions,
  motivosOptions,
  estadosOptions,
  handleSelectProducto,
  handleInputChange,
  handleIncrementarCantidad,
  handleDecrementarCantidad,
  handleSelectMotivo,
  handleSelectEstado,
  handleAgregarDevolucion,
}) => {
  // Estados para controlar el foco en los selects
  const [productoFocused, setProductoFocused] = useState(false)
  const [motivoFocused, setMotivoFocused] = useState(false)
  const [estadoFocused, setEstadoFocused] = useState(false)

  // Función para validar productos antes de devolución
  const validarProductosDevolucion = async (productos) => {
    try {
      console.log("Validando productos para devolución:", productos)

      const errores = []

      for (const producto of productos) {
        // Verificar si el producto está activo
        if (!producto.activo && producto.activo !== undefined) {
          errores.push(`❌ "${producto.nombre}": Producto inactivo, no se puede procesar devolución`)
        }

        // Verificar stock negativo (problema en inventario)
        if (producto.stock < 0) {
          errores.push(`⚠️ "${producto.nombre}": Stock negativo detectado (${producto.stock}), revisar inventario`)
        }
      }

      if (errores.length > 0) {
        mostrarAlertaErrorDevolucion(errores)
        return false
      }

      return true
    } catch (error) {
      console.error("Error validando productos para devolución:", error)
      mostrarAlertaErrorDevolucion(["❌ Error al validar productos para devolución"])
      return false
    }
  }

  // Función para mostrar alerta de error en devolución
  const mostrarAlertaErrorDevolucion = (errores) => {
    const modalHtml = `
      <div class="modal fade" id="errorDevolucionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-warning shadow-lg">
            <div class="modal-header bg-warning text-dark">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-circle me-2"></i>
                ⚠️ No se puede procesar la devolución
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-undo-alt me-2"></i>
                  Problemas detectados en la devolución:
                </h6>
                <div class="error-list">
                  ${errores
                    .map(
                      (error) => `
                    <div class="mb-2 p-3 bg-light rounded border-left-warning">
                      <pre class="mb-0 text-dark" style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem;">${error}</pre>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Por favor, verifique los productos y el estado del inventario antes de continuar.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-warning btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("errorDevolucionModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("errorDevolucionModal"))
    modal.show()

    // Limpiar modal después de cerrarlo
    document.getElementById("errorDevolucionModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  }

  // Función mejorada para agregar devolución con validación
  const handleAgregarDevolucionConValidacion = async () => {
    // Construye los catálogos a partir de las props (ajusta según tu estructura)
    const motivosCatalogo = motivosOptions.map((opt) => opt.value)
    const estadosCatalogo = estadosOptions.map((opt) => opt.value)
    const productosCatalogo = productosOptions.map((opt) => opt.value)

    // Ejecuta la validación completa
    const errores = validarFormularioDevolucion({
      producto: devolucionActual.producto,
      cantidad: devolucionActual.cantidad,
      motivo: devolucionActual.motivo,
      estado: devolucionActual.estado,
      cliente: devolucionActual.cliente, // si aplica
      fechaVenta: devolucionActual.fechaVenta, // si aplica
      metodoPago: devolucionActual.metodoPago, // si aplica
      precioUnitario: devolucionActual.producto ? devolucionActual.producto.precioUnitario : undefined,
      subtotal:
        devolucionActual.producto && devolucionActual.cantidad
          ? devolucionActual.producto.precioUnitario * devolucionActual.cantidad
          : undefined,
      totalDevolucion: devolucionActual.totalDevolucion, // si aplica
      factura: devolucionActual.factura, // si aplica
      cantidadOriginal: devolucionActual.producto ? devolucionActual.producto.cantidad : undefined,
      motivosCatalogo,
      estadosCatalogo,
      metodosPagoCatalogo: [], // agrega si tienes
      clientesCatalogo: [], // agrega si tienes
      productosCatalogo,
      facturasCatalogo: [], // agrega si tienes
    })

    if (errores.length > 0) {
      // Muestra los errores en el formulario
      if (typeof setFormErrors === "function") {
        setFormErrors({
          producto: errores.find((e) => e.toLowerCase().includes("producto")) || "",
          cantidad: errores.find((e) => e.toLowerCase().includes("cantidad")) || "",
          motivo: errores.find((e) => e.toLowerCase().includes("motivo")) || "",
          estado: errores.find((e) => e.toLowerCase().includes("estado")) || "",
          // ...otros campos si los tienes
        })
      }
      mostrarAlertaErrorDevolucion(errores)
      return
    }

    // Si pasa la validación, agrega la devolución
    handleAgregarDevolucion()
  }

  // Exponer función de validación para uso externo
  useEffect(() => {
    if (window) {
      window.validarProductosDevolucion = validarProductosDevolucion
    }
  }, [])

  // Estilos personalizados para react-select (código original)
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#00b8e0" : formErrors.producto ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#00b8e0" : formErrors.producto ? "#dc3545" : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#00b8e0" : state.isFocused ? "#f8fcff" : null,
      color: state.isSelected ? "white" : "#3a3a3a",
      "&:active": {
        backgroundColor: state.isSelected ? "#00b8e0" : "#e9ecef",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  }

  const motivoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#00b8e0" : formErrors.motivo ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#00b8e0" : formErrors.motivo ? "#dc3545" : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
  }

  const estadoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#00b8e0" : formErrors.estado ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#00b8e0" : formErrors.estado ? "#dc3545" : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
  }

  // Nueva función de validación del formulario de devolución
  const validarFormularioDevolucion = ({
    producto,
    cantidad,
    motivo,
    estado,
    cliente,
    fechaVenta,
    metodoPago,
    precioUnitario,
    subtotal,
    totalDevolucion,
    factura,
    cantidadOriginal,
    motivosCatalogo,
    estadosCatalogo,
    metodosPagoCatalogo,
    clientesCatalogo,
    productosCatalogo,
    facturasCatalogo,
  }) => {
    const errores = []

    // Producto
    if (!producto) {
      errores.push("❌ Selecciona un producto.")
    } else {
      const prodCat = productosCatalogo.find((p) => p.id === producto.id)
      if (!prodCat) {
        errores.push("❌ Producto no válido del catálogo.")
      } else {
        if (!prodCat.activo) errores.push("❌ Producto descontinuado/no disponible.")
        if (prodCat.stock === 0) errores.push("⚠️ Producto sin stock.")
      }
    }

    // Cantidad
    if (cantidad === "" || cantidad === undefined) {
      errores.push("❌ Ingresa la cantidad.")
    } else if (isNaN(Number(cantidad))) {
      errores.push("❌ La cantidad debe ser un número.")
    } else if (!Number.isInteger(Number(cantidad))) {
      errores.push("❌ La cantidad debe ser un número entero.")
    } else if (Number(cantidad) < 1) {
      errores.push("❌ La cantidad debe ser mayor o igual a 1.")
    } else if (Number(cantidad) > cantidadOriginal) {
      errores.push("❌ La cantidad no puede ser mayor a la cantidad original.")
    }

    // Motivo
    if (!motivo) {
      errores.push("❌ Selecciona un motivo.")
    } else {
      const motivoCat = motivosCatalogo.find((m) => m.id === motivo.id)
      if (!motivoCat) errores.push("❌ Motivo no válido.")
      else if (!motivoCat.activo) errores.push("❌ Motivo inactivo.")
    }

    // Estado
    if (!estado) {
      errores.push("❌ Selecciona un estado.")
    } else {
      const estadoCat = estadosCatalogo.find((e) => e.id === estado.id)
      if (!estadoCat) errores.push("❌ Estado no válido.")
      else if (!estadoCat.activo) errores.push("❌ Estado inactivo.")
    }

    // Cliente
    if (!cliente) {
      errores.push("❌ Selecciona un cliente.")
    } else {
      const clienteCat = clientesCatalogo.find((c) => c.id === cliente.id)
      if (!clienteCat) errores.push("❌ Cliente no registrado.")
      else if (!clienteCat.activo) errores.push("❌ Cliente inactivo.")
    }

    // Fecha Venta
    if (!fechaVenta) {
      errores.push("❌ Ingresa la fecha de venta.")
    } else {
      const fecha = new Date(fechaVenta)
      const hoy = new Date()
      if (isNaN(fecha.getTime())) errores.push("❌ Fecha de venta inválida.")
      else if (fecha > hoy) errores.push("❌ La fecha de venta no puede ser futura.")
    }

    // Método de Pago
    if (!metodoPago) {
      errores.push("❌ Selecciona un método de pago.")
    } else {
      const metodoCat = metodosPagoCatalogo.find((m) => m.id === metodoPago.id)
      if (!metodoCat) errores.push("❌ Método de pago no válido.")
      else if (!metodoCat.activo) errores.push("❌ Método de pago inactivo.")
    }

    // Precio Unitario
    if (precioUnitario === "" || precioUnitario === undefined) {
      errores.push("❌ Ingresa el precio unitario.")
    } else if (isNaN(Number(precioUnitario))) {
      errores.push("❌ El precio unitario debe ser numérico.")
    } else if (Number(precioUnitario) <= 0) {
      errores.push("❌ El precio unitario debe ser mayor a cero.")
    }

    // Subtotal
    if (subtotal !== Number(precioUnitario) * Number(cantidad)) {
      errores.push("❌ El subtotal no corresponde al cálculo (precio × cantidad).")
    }

    // Total Devolución
    // Suponiendo que recibes un array de subtotales
    // if (totalDevolucion !== subtotales.reduce((a, b) => a + b, 0)) {
    //   errores.push("❌ El total de devolución no corresponde a la suma de subtotales.");
    // }

    // Factura
    if (!factura) {
      errores.push("❌ Selecciona una factura.")
    } else {
      const facturaCat = facturasCatalogo.find((f) => f.id === factura.id)
      if (!facturaCat) errores.push("❌ Factura no registrada.")
      else if (facturaCat.devuelta) errores.push("❌ Factura ya devuelta.")
      else if (facturaCat.anulada) errores.push("❌ Factura anulada.")
    }

    return errores
  }

  return (
    <div className="producto-devolucion-form">
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Agregar Producto a Devolver</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <div
                className={`select-container ${productoFocused ? "is-focused" : ""} ${formErrors.producto ? "has-error" : ""}`}
              >
                <div className="select-label">
                  Seleccionar Producto <span className="select-required">*</span>
                </div>
                <Select
                  options={productosOptions}
                  value={
                    devolucionActual.producto
                      ? productosOptions.find((option) => option.value.id === devolucionActual.producto.id)
                      : null
                  }
                  onChange={handleSelectProducto}
                  placeholder="Seleccione un producto..."
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay productos disponibles"}
                  className={formErrors.producto ? "is-invalid" : ""}
                  onFocus={() => setProductoFocused(true)}
                  onBlur={() => setProductoFocused(false)}
                />
                {formErrors.producto && <div className="invalid-feedback">{formErrors.producto}</div>}
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-floating">
                <div className="input-group">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleDecrementarCantidad}
                    disabled={!devolucionActual.producto || devolucionActual.cantidad <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className={`form-control text-center ${formErrors.cantidad ? "is-invalid" : ""}`}
                    name="cantidad"
                    value={devolucionActual.cantidad}
                    onChange={handleInputChange}
                    min="1"
                    max={devolucionActual.producto ? devolucionActual.producto.cantidad : 1}
                    disabled={!devolucionActual.producto}
                    placeholder="Cantidad"
                    id="cantidad-input"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleIncrementarCantidad}
                    disabled={
                      !devolucionActual.producto || devolucionActual.cantidad >= devolucionActual.producto.cantidad
                    }
                  >
                    +
                  </button>
                </div>
                <label htmlFor="cantidad-input">
                  Cantidad <span className="text-danger">*</span>
                </label>
                {formErrors.cantidad && <div className="invalid-feedback">{formErrors.cantidad}</div>}
                {devolucionActual.producto && (
                  <small className="text-muted">Original: {devolucionActual.producto.cantidad}</small>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <div
                className={`select-container ${motivoFocused ? "is-focused" : ""} ${formErrors.motivo ? "has-error" : ""}`}
              >
                <div className="select-label">
                  Motivo <span className="select-required">*</span>
                </div>
                <Select
                  options={motivosOptions}
                  value={
                    devolucionActual.motivo
                      ? motivosOptions.find((option) => option.value.id === devolucionActual.motivo.id)
                      : null
                  }
                  onChange={handleSelectMotivo}
                  placeholder="Seleccione un motivo..."
                  styles={motivoSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay motivos disponibles"}
                  className={formErrors.motivo ? "is-invalid" : ""}
                  onFocus={() => setMotivoFocused(true)}
                  onBlur={() => setMotivoFocused(false)}
                />
                {formErrors.motivo && <div className="invalid-feedback">{formErrors.motivo}</div>}
              </div>
            </div>
            <div className="col-md-3">
              <div
                className={`select-container ${estadoFocused ? "is-focused" : ""} ${formErrors.estado ? "has-error" : ""}`}
              >
                <div className="select-label">
                  Estado <span className="select-required">*</span>
                </div>
                <Select
                  options={estadosOptions}
                  value={
                    devolucionActual.estado
                      ? estadosOptions.find((option) => option.value.id === devolucionActual.estado.id)
                      : null
                  }
                  onChange={handleSelectEstado}
                  placeholder="Seleccione un estado..."
                  styles={estadoSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay estados disponibles"}
                  className={formErrors.estado ? "is-invalid" : ""}
                  onFocus={() => setEstadoFocused(true)}
                  onBlur={() => setEstadoFocused(false)}
                />
                {formErrors.estado && <div className="invalid-feedback">{formErrors.estado}</div>}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAgregarDevolucionConValidacion}
              disabled={
                !devolucionActual.producto ||
                !devolucionActual.motivo ||
                !devolucionActual.estado ||
                devolucionActual.cantidad <= 0
              }
            >
              Agregar Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoDevolucionForm
