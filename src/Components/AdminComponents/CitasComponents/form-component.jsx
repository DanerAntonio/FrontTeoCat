"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, X } from 'lucide-react'

export const FormComponent = ({
  formData,
  formErrors,
  onFormChange,
  onSave,
  onCancel,
  isEditing,
  clientes,
  servicios,
  hideEstado = false,
  allowMultipleMascotas = false,
}) => {
  const [selectedCliente, setSelectedCliente] = useState(formData.cliente)
  const [selectedMascota, setSelectedMascota] = useState(formData.mascota)
  const [selectedMascotas, setSelectedMascotas] = useState(formData.mascotas || [])
  const [mascotas, setMascotas] = useState([])
  const [selectedServicio, setSelectedServicio] = useState(null)
  const [selectedServicios, setSelectedServicios] = useState(
    formData.servicios && formData.servicios.length > 0 ? formData.servicios : [],
  )

  // Calcular si se requieren múltiples mascotas basado en los servicios seleccionados
  const requiresMultipleMascotas = selectedServicios.some((servicio) => servicio.multiplesMascotas)

  // Actualizar mascotas cuando cambia el cliente
  useEffect(() => {
    if (selectedCliente) {
      setMascotas(selectedCliente.mascotas)

      // Si no hay mascota seleccionada y hay mascotas disponibles, seleccionar la primera
      if (!selectedMascota && !requiresMultipleMascotas && selectedCliente.mascotas.length > 0) {
        setSelectedMascota(selectedCliente.mascotas[0])
        onFormChange({
          ...formData,
          cliente: selectedCliente,
          mascota: selectedCliente.mascotas[0],
          mascotas: [selectedCliente.mascotas[0]],
        })
      }
    } else {
      setMascotas([])
      setSelectedMascota(null)
      setSelectedMascotas([])
    }
  }, [selectedCliente])

  // Actualizar el formulario cuando cambian los servicios seleccionados
  useEffect(() => {
    // Si ya no necesitamos múltiples mascotas pero teníamos mascotas seleccionadas
    if (!requiresMultipleMascotas && selectedMascotas.length > 0) {
      // Seleccionar solo la primera mascota
      const primeraMascota = selectedMascotas[0]
      setSelectedMascota(primeraMascota)

      onFormChange({
        ...formData,
        servicios: selectedServicios,
        mascota: primeraMascota,
        mascotas: [primeraMascota],
      })
    } else {
      onFormChange({
        ...formData,
        servicios: selectedServicios,
      })
    }
  }, [selectedServicios])

  // Actualizar el formulario cuando cambian las mascotas seleccionadas
  useEffect(() => {
    if (requiresMultipleMascotas) {
      onFormChange({
        ...formData,
        mascotas: selectedMascotas,
        mascota: null, // Limpiar mascota única si estamos en modo múltiple
      })
    } else if (selectedMascota) {
      onFormChange({
        ...formData,
        mascota: selectedMascota,
        mascotas: [selectedMascota], // Mantener la mascota única también en el array
      })
    }
  }, [selectedMascota, selectedMascotas, requiresMultipleMascotas])

  // Función para formatear números con separadores de miles sin ceros iniciales
  const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    
    // Convertir a número si es string
    let num = typeof number === 'string' ? parseFloat(number) : number;
    
    // Asegurarse de que sea un número válido
    if (isNaN(num)) return '0';
    
    // Formatear el número con separadores de miles
    return num.toLocaleString('es-CO');
  }

  // Función para formatear duración
  const formatDuracion = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      const min = minutos % 60
      return min > 0 ? `${horas} h ${min} min` : `${horas} h`
    }
  }

  // Determinar el tamaño de la mascota (pequeño o grande)
  const getTamanioMascota = (peso) => {
    return peso <= 10 ? "Pequeño" : "Grande"
  }

  // Calcular el total de los servicios
  const calcularTotal = () => {
    return selectedServicios.reduce((total, servicio) => total + servicio.precio, 0)
  }

  // Calcular la duración total de los servicios
  const calcularDuracionTotal = () => {
    return selectedServicios.reduce((total, servicio) => total + servicio.duracion, 0)
  }

  // Manejador para cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    onFormChange({
      ...formData,
      [name]: value,
    })
  }

  // Manejador para seleccionar un cliente
  const handleSelectCliente = (e) => {
    const clienteId = e.target.value
    const cliente = clienteId ? clientes.find((c) => c.id === clienteId) : null

    setSelectedCliente(cliente)
    onFormChange({
      ...formData,
      cliente,
      mascota: null,
      mascotas: [],
    })
  }

  // Manejador para seleccionar una mascota
  const handleSelectMascota = (e) => {
    const mascotaId = e.target.value
    const mascota = mascotaId ? mascotas.find((m) => m.id === mascotaId) : null

    setSelectedMascota(mascota)
    if (!requiresMultipleMascotas) {
      onFormChange({
        ...formData,
        mascota,
        mascotas: mascota ? [mascota] : [],
      })
    }
  }

  // Manejador para seleccionar múltiples mascotas
  const handleToggleMascota = (mascota) => {
    let newSelectedMascotas

    if (selectedMascotas.some((m) => m.id === mascota.id)) {
      // Si ya está seleccionada, quitarla
      newSelectedMascotas = selectedMascotas.filter((m) => m.id !== mascota.id)
    } else {
      // Si no está seleccionada, añadirla
      newSelectedMascotas = [...selectedMascotas, mascota]
    }

    setSelectedMascotas(newSelectedMascotas)
    onFormChange({
      ...formData,
      mascotas: newSelectedMascotas,
      mascota: null, // Limpiar mascota única en modo múltiple
    })
  }

  // Manejador para seleccionar un servicio
  const handleSelectServicio = (e) => {
    const servicioId = e.target.value
    if (servicioId) {
      const servicio = servicios.find((s) => s.id === servicioId)
      if (servicio && !selectedServicios.some((s) => s.id === servicio.id)) {
        const newSelectedServicios = [...selectedServicios, servicio]
        setSelectedServicios(newSelectedServicios)

        // Limpiar el selector
        e.target.value = ""
      }
    }
  }

  // Manejador para eliminar un servicio de la lista
  const handleRemoveServicio = (servicioId) => {
    const newSelectedServicios = selectedServicios.filter((servicio) => servicio.id !== servicioId)
    setSelectedServicios(newSelectedServicios)
  }

  // Validar que todos los campos requeridos de la cita estén completos
  const validarCitaCompleta = (formData) => {
    return {
      ...validarCliente(formData),
      ...validarMascota(formData),
      ...validarFechaHora(formData),
      ...validarServicios(formData),
    }
  }

  return (
    <div className="panel-section">
      <h3 className="form-title">Detalles de la Cita</h3>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">👤</span>
            Cliente <span className="required">*</span>
          </label>
          <div className="select-container">
            <select
              className={`form-select ${formErrors?.cliente ? "is-invalid" : ""}`}
              value={selectedCliente ? selectedCliente.id : ""}
              onChange={handleSelectCliente}
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.telefono}
                </option>
              ))}
            </select>
            {formErrors?.cliente && <div className="invalid-feedback">{formErrors.cliente}</div>}
          </div>
        </div>
      </div>

      {selectedCliente && (
        <div className="form-group mt-3">
          <label className="form-label">
            <span className="label-icon">🐾</span>
            {requiresMultipleMascotas ? "Mascotas" : "Mascota"} <span className="required">*</span>
          </label>

          {requiresMultipleMascotas ? (
            <div className={`mascotas-selector ${formErrors?.mascotas ? "is-invalid" : ""}`}>
              {mascotas.length > 0 ? (
                <div className="mascotas-grid">
                  {mascotas.map((mascota) => (
                    <div
                      key={mascota.id}
                      className={`mascota-item ${selectedMascotas.some((m) => m.id === mascota.id) ? "selected" : ""}`}
                      onClick={() => handleToggleMascota(mascota)}
                    >
                      <div className="mascota-avatar">{mascota.especie === "Perro" ? "🐶" : "🐱"}</div>
                      <div className="mascota-info">
                        <div className="mascota-name">{mascota.nombre}</div>
                        <div className="mascota-breed">{mascota.raza}</div>
                      </div>
                      <div className="mascota-check">
                        {selectedMascotas.some((m) => m.id === mascota.id) && <span>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No hay mascotas disponibles para este cliente.</p>
              )}
              <div className="mt-2 text-muted small">
                <strong>Nota:</strong> Este servicio permite seleccionar múltiples mascotas.
              </div>
              {formErrors?.mascotas && <div className="invalid-feedback d-block">{formErrors.mascotas}</div>}
            </div>
          ) : (
            <div className="select-container">
              <select
                className={`form-select ${formErrors?.mascota ? "is-invalid" : ""}`}
                value={selectedMascota ? selectedMascota.id : ""}
                onChange={handleSelectMascota}
              >
                <option value="">Seleccione una mascota</option>
                {mascotas.map((mascota) => (
                  <option key={mascota.id} value={mascota.id}>
                    {mascota.nombre} - {mascota.raza}
                  </option>
                ))}
              </select>
              {formErrors?.mascota && <div className="invalid-feedback">{formErrors.mascota}</div>}
            </div>
          )}
        </div>
      )}

      {!requiresMultipleMascotas && selectedMascota && (
        <div className="pet-card">
          <div className="pet-avatar">{selectedMascota.especie === "Perro" ? "🐶" : "🐱"}</div>
          <div className="pet-details">
            <h4>{selectedMascota.nombre}</h4>
            <p>{selectedMascota.raza}</p>
            <div className="pet-stats">
              <div className="pet-stat">
                <span>Edad:</span>
                <span>{selectedMascota.edad} años</span>
              </div>
              <div className="pet-stat">
                <span>Tamaño:</span>
                <span>{getTamanioMascota(selectedMascota.peso)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {requiresMultipleMascotas && selectedMascotas.length > 0 && (
        <div className="selected-mascotas">
          <div className="selected-mascotas-count">
            {selectedMascotas.length}{" "}
            {selectedMascotas.length === 1 ? "mascota seleccionada" : "mascotas seleccionadas"}
          </div>
          <div className="selected-mascotas-list">
            {selectedMascotas.map((mascota) => (
              <div key={mascota.id} className="selected-mascota-tag">
                <span>
                  {mascota.especie === "Perro" ? "🐶" : "🐱"} {mascota.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group mt-3">
        <label className="form-label">
          <span className="label-icon">✂️</span>
          Servicios <span className="required">*</span>
        </label>
        <div className={`services-container ${formErrors?.servicios ? "is-invalid" : ""}`}>
          <div className="services-selector">
            <select className="form-select" onChange={handleSelectServicio} defaultValue="">
              <option value="" disabled>
                Seleccione un servicio
              </option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} - {formatDuracion(servicio.duracion)} - ${formatNumber(servicio.precio)}
                  {servicio.multiplesMascotas ? " (Múltiples mascotas)" : ""}
                </option>
              ))}
            </select>
            {formErrors?.servicios && <div className="invalid-feedback d-block">{formErrors.servicios}</div>}
          </div>

          {selectedServicios.length > 0 && (
            <div className="selected-services">
              {selectedServicios.map((servicio) => (
                <div key={servicio.id} className="service-item">
                  <div className="service-info">
                    <div className="service-name">
                      {servicio.nombre}
                      {servicio.multiplesMascotas && (
                        <span className="multiple-mascotas-badge">Múltiples mascotas</span>
                      )}
                    </div>
                    <div className="service-details">
                      <span>{formatDuracion(servicio.duracion)}</span>
                      <span className="service-price">${formatNumber(servicio.precio)}</span>
                    </div>
                  </div>
                  <button className="btn-remove" onClick={() => handleRemoveServicio(servicio.id)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="service-total">
                <div className="d-flex justify-content-between">
                  <span>Duración total:</span>
                  <span>{formatDuracion(calcularDuracionTotal())}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total:</span>
                  <span>${formatNumber(calcularTotal())}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">
          <span className="label-icon">📅</span>
          Fecha y Hora <span className="required">*</span>
        </label>
        <div className="datetime-display">
          <div className="date-display">
            <Calendar size={16} />
            <span>
              {new Date(formData.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="time-display">
            <Clock size={16} />
            <span>{formData.hora}</span>
          </div>
        </div>
      </div>

      {!hideEstado && (
        <div className="form-group mt-3">
          <label className="form-label">Estado</label>
          <select className="form-select" name="estado" value={formData.estado} onChange={handleInputChange}>
            <option value="Programada">Programada</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      )}

      <div className="form-group mt-3">
        <label className="form-label">Notas adicionales</label>
        <textarea
          className="form-control"
          name="notas"
          value={formData.notas || ""}
          onChange={handleInputChange}
          rows="3"
          placeholder="Información adicional sobre la cita..."
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          {isEditing ? "Actualizar Cita" : "Agendar Cita"}
        </button>
      </div>
    </div>
  )
}