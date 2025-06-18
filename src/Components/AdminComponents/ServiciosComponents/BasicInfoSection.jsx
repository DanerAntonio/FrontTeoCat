"use client"

/**
 * Componente para la sección de información básica del servicio
 */
const BasicInfoSection = ({ formData, formErrors, tiposServicio, handleInputChange, loading, isEditing }) => {
  return (
    <div className="mb-3">
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <label htmlFor="idTipoServicio" className="form-label small mb-1">
            Tipo de Servicio <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select form-select-sm ${formErrors.idTipoServicio ? "is-invalid" : ""}`}
            id="idTipoServicio"
            name="idTipoServicio"
            value={formData.idTipoServicio}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione un tipo</option>
            {tiposServicio.map((tipo) => (
              <option key={tipo.IdTipoServicio} value={tipo.IdTipoServicio}>
                {tipo.Nombre}
              </option>
            ))}
          </select>
          {formErrors.idTipoServicio && <div className="invalid-feedback small">{formErrors.idTipoServicio}</div>}
          {loading && <small className="text-muted">Cargando tipos...</small>}
        </div>
        <div className="col-md-6">
          <label htmlFor="duracion" className="form-label small mb-1">
            Duración (min) <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control form-control-sm ${formErrors.duracion ? "is-invalid" : ""}`}
            id="duracion"
            name="duracion"
            value={formData.duracion}
            onChange={handleInputChange}
            min="1"
            required
            placeholder="Ej: 30"
          />
          {formErrors.duracion && <div className="invalid-feedback small">{formErrors.duracion}</div>}
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="nombre" className="form-label small mb-1">
          Nombre del Servicio <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control form-control-sm ${formErrors.nombre ? "is-invalid" : ""}`}
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          placeholder="Ingrese el nombre del servicio"
          maxLength={100}
        />
        {formErrors.nombre && <div className="invalid-feedback small">{formErrors.nombre}</div>}
        <small className="form-text text-muted small">Máximo 100 caracteres.</small>
      </div>

      <div className="mb-2">
        <label htmlFor="descripcion" className="form-label small mb-1">
          Descripción
        </label>
        <textarea
          className="form-control form-control-sm"
          id="descripcion"
          name="descripcion"
          rows="3"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Ingrese una descripción detallada del servicio"
          maxLength={500}
        />
        <small className="text-muted small">
          Máximo 500 caracteres. Describe los detalles del servicio que ofreces.
        </small>
      </div>
    </div>
  )
}

export default BasicInfoSection