"use client"

import React from "react"

import { useState } from "react"
import { Plus, AlertTriangle, Search, Info } from "lucide-react"
import Select from "react-select"
import CatalogoModal from "../ProveedoresComponents/CatalogoModal"

/**
 * Componente para el formulario de información básica de la compra
 */
const CompraForm = ({
  formData,
  formErrors,
  proveedoresOptions,
  handleInputChange,
  handleSelectProveedor,
  handleSelectProduct,
  handleAddProduct,
}) => {
  const [precioVentaSugerido, setPrecioVentaSugerido] = useState("")
  const [margenGanancia, setMargenGanancia] = useState("")
  const [actualizarPrecioVenta, setActualizarPrecioVenta] = useState(false)
  const [showCatalogo, setShowCatalogo] = useState(false)

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0d6efd" : state.isFocused ? "#f8f9fa" : null,
      color: state.isSelected ? "white" : "black",
    }),
  }

  const openCatalogo = () => {
    setShowCatalogo(true)
  }

  const closeCatalogo = () => {
    setShowCatalogo(false)
  }

  const handleProductSelect = (producto) => {
    handleSelectProduct({
      value: producto,
    })
    closeCatalogo()

    // Establecer el margen predefinido del producto cuando se selecciona
    setMargenGanancia(producto?.MargenGanancia || 30)
    setPrecioVentaSugerido("")
    setActualizarPrecioVenta(false)
  }

  // Establecer margen cuando cambia el producto seleccionado
  React.useEffect(() => {
    if (formData.productoSeleccionado) {
      setMargenGanancia(formData.productoSeleccionado.MargenGanancia || 30)
    } else {
      setMargenGanancia("")
    }
    setPrecioVentaSugerido("")
    setActualizarPrecioVenta(false)
  }, [formData.productoSeleccionado])

  const formatNumber = (number) => {
    if (!number) return "0"
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handlePrecioSugeridoChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "") // Solo números y punto decimal
    setPrecioVentaSugerido(value)

    // Calcular margen basado en el precio sugerido
    if (value && formData.productoSeleccionado?.Precio) {
      const precioCompra = formData.productoSeleccionado.Precio
      const precioSugerido = Number(value)
      if (precioSugerido > precioCompra) {
        const margenCalculado = ((precioSugerido - precioCompra) / precioCompra) * 100
        setMargenGanancia(margenCalculado.toFixed(2))
      }
    }
  }

  const handleMargenChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "") // Solo números y punto decimal
    setMargenGanancia(value)

    // Calcular precio sugerido basado en el margen
    if (value && formData.productoSeleccionado?.Precio) {
      const precioCompra = formData.productoSeleccionado.Precio
      const margen = Number(value)
      const precioSugerido = precioCompra * (1 + margen / 100)
      setPrecioVentaSugerido(precioSugerido.toFixed(2))
    }
  }

  const handleAddProductWithSuggestion = () => {
    // Validar que se haya ingresado un precio sugerido si se va a actualizar
    if (actualizarPrecioVenta && (!precioVentaSugerido || Number(precioVentaSugerido) <= 0)) {
      alert("Por favor, ingrese un precio de venta sugerido válido si desea actualizar el precio del producto.")
      return
    }

    // Agregar los campos de precio sugerido y actualización al producto
    const productoConSugerencia = {
      ...formData,
      precioVentaSugerido: Number(precioVentaSugerido) || 0,
      actualizarPrecioVenta: actualizarPrecioVenta,
    }

    handleAddProduct(productoConSugerencia)

    // Resetear valores
    setPrecioVentaSugerido("")
    setActualizarPrecioVenta(false)
  }

  return (
    <>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="proveedor" className="form-label">
            Proveedor <span className="text-danger">*</span>
          </label>
          <Select
            id="proveedor"
            name="proveedor"
            options={proveedoresOptions}
            value={
              formData.proveedor
                ? proveedoresOptions.find((option) => option.value.IdProveedor === formData.proveedor.IdProveedor)
                : null
            }
            onChange={handleSelectProveedor}
            placeholder="Seleccione un proveedor..."
            styles={customSelectStyles}
            isClearable
            isSearchable
            noOptionsMessage={() => "No se encontraron proveedores"}
            className={formErrors.proveedor ? "is-invalid" : ""}
          />
          {formErrors.proveedor && <div className="invalid-feedback d-block">{formErrors.proveedor}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="FechaCompra" className="form-label">
            Fecha de Compra <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${formErrors.FechaCompra ? "is-invalid" : ""}`}
            id="FechaCompra"
            name="FechaCompra"
            value={formData.FechaCompra}
            onChange={handleInputChange}
            required
            max={new Date().toISOString().split("T")[0]}
          />
          {formErrors.FechaCompra && <div className="invalid-feedback">{formErrors.FechaCompra}</div>}
          <small className="form-text text-muted">No puede ser una fecha futura</small>
        </div>
      </div>

      <hr className="my-4" />

      <h5 className="mb-3">Agregar Productos</h5>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">
            Producto <span className="text-danger">*</span>
          </label>
          <div className="d-flex">
            {formData.productoSeleccionado ? (
              <div className="selected-product-info form-control d-flex align-items-center">
                <span className="text-truncate">
                  {formData.productoSeleccionado.NombreProducto} - {formData.productoSeleccionado.CodigoBarras}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={openCatalogo}
              >
                <Search size={18} className="me-2" />
                Buscar en Catálogo
              </button>
            )}
            {formData.productoSeleccionado && (
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => handleSelectProduct(null)}
                title="Cambiar producto"
              >
                Cambiar
              </button>
            )}
          </div>
          {formErrors.productoSeleccionado && (
            <div className="invalid-feedback d-block">{formErrors.productoSeleccionado}</div>
          )}
        </div>
        <div className="col-md-2">
          <label htmlFor="cantidad" className="form-label">
            Cantidad <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${formErrors.cantidad ? "is-invalid" : ""}`}
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            min="1"
            disabled={!formData.productoSeleccionado}
          />
          {formErrors.cantidad && <div className="invalid-feedback">{formErrors.cantidad}</div>}
          <small className="form-text text-muted">Ingrese la cantidad deseada</small>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            type="button"
            className="btn btn-success ms-auto"
            onClick={handleAddProductWithSuggestion}
            disabled={!formData.productoSeleccionado}
          >
            <Plus size={18} className="me-1" />
            Agregar
          </button>
        </div>
      </div>

      {/* Información de precios cuando hay un producto seleccionado */}
      {formData.productoSeleccionado && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 d-flex align-items-center">
                  <Info size={18} className="me-2" />
                  Información de Precios
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label">Precio de Compra</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        value={formatNumber(formData.productoSeleccionado.Precio)}
                        readOnly
                      />
                    </div>
                    <small className="text-muted">Precio unitario de compra</small>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Margen de Ganancia</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={margenGanancia}
                        onChange={handleMargenChange}
                        placeholder="Ingrese margen"
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <small className="text-muted">Margen de ganancia deseado</small>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio Venta Sugerido</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        value={precioVentaSugerido}
                        onChange={handlePrecioSugeridoChange}
                        placeholder="Ingrese precio sugerido"
                      />
                    </div>
                    <small className="text-muted">Ingrese manualmente el precio</small>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio Venta Actual</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        value={formatNumber(formData.productoSeleccionado.PrecioVenta || 0)}
                        readOnly
                      />
                    </div>
                    <small className="text-muted">Precio actual en catálogo</small>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="row">
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="actualizarPrecioVenta"
                        checked={actualizarPrecioVenta}
                        onChange={(e) => setActualizarPrecioVenta(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="actualizarPrecioVenta">
                        <strong>¿Desea actualizar el precio de venta del producto?</strong>
                      </label>
                    </div>
                    <small className="text-muted">
                      {actualizarPrecioVenta
                        ? "El precio de venta del producto se actualizará al precio sugerido"
                        : "El precio de venta del producto permanecerá sin cambios"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formErrors.productosAgregados && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <AlertTriangle size={18} className="me-2" />
          {formErrors.productosAgregados}
        </div>
      )}

      {/* Modal del Catálogo */}
      <CatalogoModal show={showCatalogo} onHide={closeCatalogo} onSelectProduct={handleProductSelect} />
    </>
  )
}

// Función de validación para CompraForm
export const validarFormularioCompra = (formData, productosAgregados) => {
  const errores = {}

  // Proveedor: requerido
  if (!formData.proveedor || !formData.proveedor.IdProveedor) {
    errores.proveedor = "Debe seleccionar un proveedor."
  }

  // Fecha de compra: requerida, no futura, formato válido
  if (!formData.FechaCompra) {
    errores.FechaCompra = "Debe ingresar la fecha de compra."
  } else {
    const fecha = new Date(formData.FechaCompra)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (isNaN(fecha.getTime())) {
      errores.FechaCompra = "La fecha no es válida."
    } else if (fecha > hoy) {
      errores.FechaCompra = "La fecha no puede ser futura."
    }
  }

  // Producto seleccionado: requerido para agregar
  if (!formData.productoSeleccionado) {
    errores.productoSeleccionado = "Debe seleccionar un producto del catálogo."
  }

  // Cantidad: requerida, mayor a 0
  if (!formData.cantidad || isNaN(formData.cantidad) || Number(formData.cantidad) <= 0) {
    errores.cantidad = "Ingrese una cantidad válida (mayor a 0)."
  }

  // Validar productos agregados a la compra
  if (!productosAgregados || productosAgregados.length === 0) {
    errores.productosAgregados = "Debe agregar al menos un producto a la compra."
  }

  return errores
}

export default CompraForm
