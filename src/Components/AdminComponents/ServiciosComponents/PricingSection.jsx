"use client"

/**
 * Componente para la sección de precios del servicio
 */
const PricingSection = ({ formData, formErrors, formatNumber, handleInputChange }) => {
  // Función para manejar el cambio de precio con formato
  const handlePriceChange = (e) => {
    // Permitir solo números y punto decimal
    const value = e.target.value.replace(/[^\d.]/g, "")

    // Validar que sea un número válido
    if (value === "" || !isNaN(Number.parseFloat(value))) {
      // Crear un evento sintético para mantener la consistencia con handleInputChange
      const syntheticEvent = {
        target: {
          name: "precio",
          value: value,
        },
      }

      handleInputChange(syntheticEvent)
    }
  }

  return (
    <div className="mb-3">
      <label htmlFor="precio" className="form-label small mb-1">
        Precio <span className="text-danger">*</span>
      </label>
      <div className="input-group input-group-sm">
        <span className="input-group-text">$</span>
        <input
          type="text"
          className={`form-control form-control-sm ${formErrors.precio ? "is-invalid" : ""}`}
          id="precio"
          name="precio"
          value={formData.precio}
          onChange={handlePriceChange}
          placeholder="Ingrese el precio del servicio"
          required
          aria-describedby="precioHelp"
        />
        {formErrors.precio && <div className="invalid-feedback small">{formErrors.precio}</div>}
      </div>
      <div id="precioHelp" className="form-text small">
        {formData.precio && !isNaN(Number.parseFloat(formData.precio)) ? (
          <span>Precio formateado: ${formatNumber(Number.parseFloat(formData.precio))}</span>
        ) : (
          <span>Ingrese un precio válido para el servicio</span>
        )}
      </div>
    </div>
  )
}

export default PricingSection
