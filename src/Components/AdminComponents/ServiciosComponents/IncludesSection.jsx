"use client"

import { Plus, X } from "lucide-react"

/**
 * Componente para la sección de "Qué incluye" del servicio
 */
const IncludesSection = ({ queIncluye, nuevoQueIncluye, setNuevoQueIncluye, onAddQueIncluye, onRemoveQueIncluye }) => {
  // Manejar el cambio en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoQueIncluye({
      ...nuevoQueIncluye,
      [name]: value,
    })
  }

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault() // Prevenir el comportamiento por defecto del formulario
    if (nuevoQueIncluye.nombre.trim() && nuevoQueIncluye.valor.trim()) {
      onAddQueIncluye(nuevoQueIncluye)
    }
  }

  return (
    <div className="mb-3">
      <label className="form-label small mb-1">Qué Incluye</label>
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="row g-1">
          <div className="col-5">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nombre (ej: Sesión)"
              name="nombre"
              value={nuevoQueIncluye.nombre}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-5">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Valor (ej: 60 minutos)"
              name="valor"
              value={nuevoQueIncluye.valor}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-2">
            <button
              type="button" // Cambiado de submit a button
              className="btn btn-outline-primary btn-sm w-100"
              disabled={!nuevoQueIncluye.nombre.trim() || !nuevoQueIncluye.valor.trim()}
              title="Agregar elemento"
              onClick={handleSubmit} // Usar el mismo manejador
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </form>

      {queIncluye.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-sm table-bordered small">
            <thead className="table-light">
              <tr>
                <th style={{ width: "45%" }}>Elemento</th>
                <th style={{ width: "45%" }}>Detalle</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {queIncluye.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{item.valor}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm text-danger p-0"
                      onClick={() => onRemoveQueIncluye(index)}
                      title="Eliminar elemento"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <small className="text-muted">No hay elementos agregados</small>
      )}
      <small className="text-muted d-block mt-1">
        Máximo 300 caracteres en total para todos los elementos combinados.
      </small>
    </div>
  )
}

export default IncludesSection
