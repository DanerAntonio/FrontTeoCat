"use client"

import { Plus, X } from "lucide-react"

/**
 * Componente para la sección de beneficios del servicio
 */
const BenefitsSection = ({ beneficios, nuevoBeneficio, setNuevoBeneficio, onAddBeneficio, onRemoveBeneficio }) => {
  // Manejar el envío del formulario de beneficios
  const handleSubmit = (e) => {
    e.preventDefault() // Prevenir el comportamiento por defecto del formulario
    if (nuevoBeneficio.trim()) {
      onAddBeneficio(nuevoBeneficio)
    }
  }

  return (
    <div className="mb-3">
      <label className="form-label small mb-1">Beneficios</label>
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="input-group input-group-sm">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Añadir beneficio (ej: Mejora la salud capilar)"
            value={nuevoBeneficio}
            onChange={(e) => setNuevoBeneficio(e.target.value)}
          />
          <button
            type="button" // Cambiado de submit a button
            className="btn btn-outline-primary btn-sm"
            disabled={!nuevoBeneficio.trim()}
            title="Agregar beneficio"
            onClick={handleSubmit} // Usar el mismo manejador
          >
            <Plus size={16} />
          </button>
        </div>
      </form>

      {beneficios.length > 0 ? (
        <div className="list-group list-group-flush small">
          {beneficios.map((beneficio, index) => (
            <div
              key={index}
              className="list-group-item list-group-item-action py-1 px-2 d-flex justify-content-between align-items-center"
            >
              <span>{beneficio}</span>
              <button
                type="button"
                className="btn btn-sm text-danger p-0"
                onClick={() => onRemoveBeneficio(index)}
                title="Eliminar beneficio"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <small className="text-muted">No hay beneficios agregados</small>
      )}
      <small className="text-muted d-block mt-1">
        Máximo 300 caracteres en total para todos los beneficios combinados.
      </small>
    </div>
  )
}

export default BenefitsSection
