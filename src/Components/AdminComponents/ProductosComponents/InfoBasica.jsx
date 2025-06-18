"use client"

import { useState } from "react"
import { Barcode, Info, Plus, Trash2 } from "lucide-react"
import Select from "react-select"

/**
 * Componente para la información básica del producto
 * Incluye campos seleccionados de la tabla Productos
 */
const InfoBasica = ({
  formData,
  setFormData,
  formErrors,
  categorias,
  isExistingProduct,
  handleExistingProductChange,
}) => {
  // Estado local para nueva característica
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState("")

  // Opciones para el select de unidad de medida
  const unidadesMedida = [
    { value: "Unidad", label: "Unidad" },
    { value: "Kilogramo", label: "Kilogramo" },
    { value: "Libra", label: "Libra" },
    { value: "Bulto", label: "Bulto" },
    { value: "Gramo", label: "Gramo" },
    { value: "Litro", label: "Litro" },
    { value: "Mililitro", label: "Mililitro" },
    { value: "Metro", label: "Metro" },
    { value: "Centimetro", label: "Centímetro" },
  ]

  // Opciones para el select de porcentaje de IVA
  const opcionesIVA = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "19", label: "19%" },
  ]

  // Opciones para el origen del producto
  const opcionesOrigen = [
    { value: "Catálogo", label: "Catálogo" },
    { value: "Stock", label: "Stock" },
  ]

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Función para generar código de barras aleatorio
  const generarCodigoBarras = () => {
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
    setFormData({
      ...formData,
      CodigoBarras: randomBarcode.toString(),
    })
  }

  // Función para agregar una característica
  const handleAddCaracteristica = () => {
    if (!nuevaCaracteristica.trim()) return

    // Convertir el string de características a array si es necesario
    let caracteristicasActuales = []
    if (formData.Caracteristicas) {
      caracteristicasActuales =
        typeof formData.Caracteristicas === "string"
          ? formData.Caracteristicas.split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [...formData.Caracteristicas]
    }

    // Verificar si la característica ya existe
    if (caracteristicasActuales.includes(nuevaCaracteristica.trim())) {
      return // Podría mostrar un mensaje de error
    }

    // Agregar la nueva característica
    caracteristicasActuales.push(nuevaCaracteristica.trim())

    setFormData({
      ...formData,
      Caracteristicas: caracteristicasActuales,
    })
    setNuevaCaracteristica("")
  }

  // Función para eliminar una característica
  const handleRemoveCaracteristica = (index) => {
    // Convertir el string de características a array si es necesario
    let caracteristicasActuales = []
    if (formData.Caracteristicas) {
      caracteristicasActuales =
        typeof formData.Caracteristicas === "string"
          ? formData.Caracteristicas.split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [...formData.Caracteristicas]
    }

    caracteristicasActuales.splice(index, 1)

    setFormData({
      ...formData,
      Caracteristicas: caracteristicasActuales,
    })
  }

  // Calcular el valor del IVA y el precio final
  const calcularPrecios = () => {
    if (!formData.Precio) return { precioVenta: 0, valorIVA: 0, precioConIVA: 0 }

    const precio = Number.parseFloat(formData.Precio) || 0
    const margen = formData.MargenGanancia ? Number.parseFloat(formData.MargenGanancia) : 0

    // Calcular precio de venta (con margen)
    const precioVenta = precio * (1 + margen / 100)

    // Calcular IVA si aplica
    const valorIVA = formData.AplicaIVA ? precioVenta * (Number.parseFloat(formData.PorcentajeIVA || 0) / 100) : 0

    // Calcular precio final
    const precioConIVA = precioVenta + valorIVA

    return {
      precioVenta: precioVenta.toFixed(2),
      valorIVA: valorIVA.toFixed(2),
      precioConIVA: precioConIVA.toFixed(2),
    }
  }

  const { precioVenta, valorIVA, precioConIVA } = calcularPrecios()

  // Obtener las características como array
  const getCaracteristicasArray = () => {
    if (!formData.Caracteristicas) return []

    return typeof formData.Caracteristicas === "string"
      ? formData.Caracteristicas.split(",")
          .map((item) => item.trim())
          .filter((item) => item)
      : formData.Caracteristicas
  }

  const caracteristicasArray = getCaracteristicasArray()

  // Convierte las categorías a opciones para react-select
  const categoriasOptions = categorias.map((categoria) => ({
    value: categoria.IdCategoriaDeProductos,
    label: categoria.NombreCategoria,
  }))

  // Encuentra la opción seleccionada
  const categoriaSelectValue = categoriasOptions.find(
    (opt) => opt.value === formData.IdCategoriaDeProducto
  ) || null

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Información del Producto</h5>

      {/* Checkbox para producto existente */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="isExistingProduct"
          checked={isExistingProduct || false}
          onChange={handleExistingProductChange}
        />
        <label className="form-check-label d-flex align-items-center" htmlFor="isExistingProduct">
          Producto existente
          <span
            className="ms-2 text-muted"
            style={{ cursor: "help" }}
            title="Marque esta opción si el producto ya existe en su inventario y no desea ingresar stock inicial."
          >
            <Info size={16} />
          </span>
        </label>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Información General</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Nombre del producto */}
            <div className="col-md-6">
              <label htmlFor="NombreProducto" className="form-label">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.NombreProducto ? "is-invalid" : ""}`}
                id="NombreProducto"
                name="NombreProducto"
                value={formData.NombreProducto || ""}
                onChange={handleInputChange}
                placeholder=""
                required
              />
              {formErrors.NombreProducto && <div className="invalid-feedback">{formErrors.NombreProducto}</div>}
            </div>

            {/* Categoría */}
            <div className="col-md-6">
              <label htmlFor="IdCategoriaDeProducto" className="form-label">
                Categoría <span className="text-danger">*</span>
              </label>
              <Select
                id="IdCategoriaDeProducto"
                name="IdCategoriaDeProducto"
                options={categoriasOptions}
                value={categoriaSelectValue}
                onChange={(option) =>
                  handleInputChange({
                    target: {
                      name: "IdCategoriaDeProducto",
                      value: option ? option.value : "",
                    },
                  })
                }
                placeholder="Buscar o seleccionar categoría..."
                isClearable
                classNamePrefix="react-select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: "#fff",
                    borderColor: state.isFocused ? "#0d6efd" : "#ced4da",
                    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(13,110,253,.25)" : "none",
                    minHeight: "48px",
                    fontSize: "1rem",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                }}
              />
              {formErrors.IdCategoriaDeProducto && (
                <div className="invalid-feedback d-block">{formErrors.IdCategoriaDeProducto}</div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="row mb-3">
            <div className="col-12">
              <label htmlFor="Descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                className={`form-control ${formErrors.Descripcion ? "is-invalid" : ""}`}
                id="Descripcion"
                name="Descripcion"
                value={formData.Descripcion || ""}
                onChange={handleInputChange}
                rows={3}
                placeholder=""
              ></textarea>
              {formErrors.Descripcion && <div className="invalid-feedback">{formErrors.Descripcion}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Inventario</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Stock */}
            <div className="col-md-3">
              <label htmlFor="Stock" className="form-label">
                Stock <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.Stock ? "is-invalid" : ""}`}
                id="Stock"
                name="Stock"
                value={formData.Stock || ""}
                onChange={handleInputChange}
                placeholder=""
                min="0"
                step="0.01"
                required
                disabled={isExistingProduct}
              />
              {formErrors.Stock && <div className="invalid-feedback">{formErrors.Stock}</div>}
            </div>

            {/* Unidad de Medida */}
            <div className="col-md-3">
              <label htmlFor="UnidadMedida" className="form-label">
                Unidad de Medida
              </label>
              <select
                className={`form-select ${formErrors.UnidadMedida ? "is-invalid" : ""}`}
                id="UnidadMedida"
                name="UnidadMedida"
                value={formData.UnidadMedida || "Unidad"}
                onChange={handleInputChange}
              >
                {unidadesMedida.map((unidad) => (
                  <option key={unidad.value} value={unidad.value}>
                    {unidad.label}
                  </option>
                ))}
              </select>
              {formErrors.UnidadMedida && <div className="invalid-feedback">{formErrors.UnidadMedida}</div>}
            </div>

            {/* Valor Unidad */}
            <div className="col-md-3">
              <label htmlFor="ValorUnidad" className="form-label">
                Valor Unidad
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.ValorUnidad ? "is-invalid" : ""}`}
                id="ValorUnidad"
                name="ValorUnidad"
                value={formData.ValorUnidad || ""}
                onChange={handleInputChange}
                placeholder=""
                min="0.0001"
                step="0.0001"
              />
              {formErrors.ValorUnidad && <div className="invalid-feedback">{formErrors.ValorUnidad}</div>}
              <small className="text-muted">Valor por defecto: 1</small>
            </div>

            {/* Origen */}
            <div className="col-md-3">
              <label htmlFor="Origen" className="form-label">
                Origen
              </label>
              <select
                className={`form-select ${formErrors.Origen ? "is-invalid" : ""}`}
                id="Origen"
                name="Origen"
                value={formData.Origen || "Catálogo"}
                onChange={handleInputChange}
              >
                {opcionesOrigen.map((origen) => (
                  <option key={origen.value} value={origen.value}>
                    {origen.label}
                  </option>
                ))}
              </select>
              {formErrors.Origen && <div className="invalid-feedback">{formErrors.Origen}</div>}
            </div>
          </div>

          <div className="row mb-3">
            {/* Fecha de Vencimiento */}
            <div className="col-md-6">
              <label htmlFor="FechaVencimiento" className="form-label">
                Fecha de Vencimiento
              </label>
              <div className="d-flex align-items-center">
                <input
                  type="date"
                  className={`form-control ${formErrors.FechaVencimiento ? "is-invalid" : ""}`}
                  id="FechaVencimiento"
                  name="FechaVencimiento"
                  value={formData.FechaVencimiento || ""}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]} // Esto establece la fecha mínima como hoy
                  disabled={formData.NoVence}
                />
                <div className="form-check ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="NoVence"
                    name="NoVence"
                    checked={formData.NoVence || false}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="NoVence">
                    No vence
                  </label>
                </div>
              </div>
              {formErrors.FechaVencimiento && <div className="invalid-feedback">{formErrors.FechaVencimiento}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Precios</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Precio */}
            <div className="col-md-4">
              <label htmlFor="Precio" className="form-label">
                Precio <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className={`form-control ${formErrors.Precio ? "is-invalid" : ""}`}
                  id="Precio"
                  name="Precio"
                  value={formData.Precio || ""}
                  onChange={handleInputChange}
                  placeholder=""
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {formErrors.Precio && <div className="invalid-feedback">{formErrors.Precio}</div>}
            </div>

            {/* Margen de Ganancia */}
            <div className="col-md-4">
              <label htmlFor="MargenGanancia" className="form-label">
                Margen de Ganancia (%)
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className={`form-control ${formErrors.MargenGanancia ? "is-invalid" : ""}`}
                  id="MargenGanancia"
                  name="MargenGanancia"
                  value={formData.MargenGanancia || ""}
                  onChange={handleInputChange}
                  placeholder=""
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="input-group-text">%</span>
              </div>
              {formErrors.MargenGanancia && <div className="invalid-feedback">{formErrors.MargenGanancia}</div>}
            </div>

            {/* Precio de Venta (calculado) */}
            <div className="col-md-4">
              <label htmlFor="PrecioVenta" className="form-label">
                Precio de Venta
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input type="text" className="form-control" id="PrecioVenta" value={precioVenta} readOnly />
              </div>
              <small className="text-muted">Calculado automáticamente</small>
            </div>
          </div>

          <div className="row mb-3">
            {/* Aplica IVA */}
            <div className="col-md-4">
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="AplicaIVA"
                  name="AplicaIVA"
                  checked={formData.AplicaIVA || false}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="AplicaIVA">
                  Aplica IVA
                </label>
              </div>
            </div>

            {/* Porcentaje de IVA (solo si aplica IVA) */}
            {formData.AplicaIVA && (
              <div className="col-md-4">
                <label htmlFor="PorcentajeIVA" className="form-label">
                  Porcentaje de IVA
                </label>
                <select
                  className={`form-select ${formErrors.PorcentajeIVA ? "is-invalid" : ""}`}
                  id="PorcentajeIVA"
                  name="PorcentajeIVA"
                  value={formData.PorcentajeIVA || "0"}
                  onChange={handleInputChange}
                >
                  {opcionesIVA.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                {formErrors.PorcentajeIVA && <div className="invalid-feedback">{formErrors.PorcentajeIVA}</div>}
              </div>
            )}

            {/* Precio con IVA (calculado) */}
            {formData.AplicaIVA && (
              <div className="col-md-4">
                <label htmlFor="PrecioConIVA" className="form-label">
                  Precio con IVA
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input type="text" className="form-control" id="PrecioConIVA" value={precioConIVA} readOnly />
                </div>
                <small className="text-muted">Incluye margen e IVA</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Identificación</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            {/* Código de Barras */}
            <div className="col-md-6">
              <label htmlFor="CodigoBarras" className="form-label">
                Código de Barras
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${formErrors.CodigoBarras ? "is-invalid" : ""}`}
                  id="CodigoBarras"
                  name="CodigoBarras"
                  value={formData.CodigoBarras || ""}
                  onChange={handleInputChange}
                  placeholder=""
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={generarCodigoBarras}
                  title="Generar código de barras"
                >
                  <Barcode size={16} />
                </button>
              </div>
              {formErrors.CodigoBarras && <div className="invalid-feedback">{formErrors.CodigoBarras}</div>}
              <small className="text-muted">Se requiere código de barras o referencia</small>
            </div>

            {/* Referencia */}
            <div className="col-md-6">
              <label htmlFor="Referencia" className="form-label">
                Referencia
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.Referencia ? "is-invalid" : ""}`}
                id="Referencia"
                name="Referencia"
                value={formData.Referencia || ""}
                onChange={handleInputChange}
                placeholder=""
              />
              {formErrors.Referencia && <div className="invalid-feedback">{formErrors.Referencia}</div>}
              <small className="text-muted">Código único para identificar el producto</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Características</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-10">
              <label htmlFor="nuevaCaracteristica" className="form-label">
                Nueva Característica
              </label>
              <input
                type="text"
                className="form-control"
                id="nuevaCaracteristica"
                value={nuevaCaracteristica}
                onChange={(e) => setNuevaCaracteristica(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddCaracteristica}
                disabled={!nuevaCaracteristica.trim()}
              >
                <Plus size={18} className="me-1" />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de características */}
          {caracteristicasArray.length > 0 ? (
            <div className="list-group">
              {caracteristicasArray.map((caracteristica, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {caracteristica}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveCaracteristica(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-light">No hay características agregadas</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoBasica
