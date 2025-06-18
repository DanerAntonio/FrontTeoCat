"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Componente para mostrar una tarjeta de notificación de citas
 */
const CitasNotificationCard = ({ notificacion, onChangeStatus }) => {
  // Usar los campos correctos según la tabla Notificaciones
  const {
    IdNotificacion,
    TipoNotificacion,
    Titulo,
    Mensaje,
    Prioridad,
    FechaCreacion,
    Estado,
    fechaCita,
    cliente,
    mascotas,
    servicios,
  } = notificacion

  /**
   * Función para formatear fechas
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  const formatDate = (date) => {
    if (!date) return ""
    return format(new Date(date), "d MMM yyyy", { locale: es })
  }

  /**
   * Función para formatear fechas con hora
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada con hora
   */
  const formatDateTime = (date) => {
    if (!date) return ""
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es })
  }

  /**
   * Función para formatear tiempo relativo
   * @param {Date} date - Fecha a formatear
   * @returns {string} Tiempo relativo
   */
  const formatRelativeTime = (date) => {
    if (!date) return ""
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  /**
   * Función para obtener la clase de prioridad
   * @param {string} prioridad - Nivel de prioridad
   * @returns {string} Clase CSS para el color
   */
  const getPriorityClass = (prioridad) => {
    switch (prioridad) {
      case "Alta":
        return "bg-danger"
      case "Media":
        return "bg-warning"
      case "Baja":
        return "bg-success"
      default:
        return "bg-secondary"
    }
  }

  /**
   * Función para obtener la clase del estado
   * @param {string} estado - Estado de la notificación
   * @returns {string} Clase CSS para el color
   */
  const getStatusClass = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning"
      case "Vista":
        return "bg-info"
      case "Resuelta":
        return "bg-success"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className={`card h-100 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
      <div className="card-header d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-center">
          <i className="bi bi-calendar-event text-success me-2"></i>
          <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
        </div>
        <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-calendar-event text-success me-2"></i>
            <h5 className="card-title mb-0">{fechaCita ? formatDateTime(fechaCita) : "Fecha no especificada"}</h5>
          </div>

          {cliente && (
            <div className="d-flex gap-2 mt-3 mb-2">
              <i className="bi bi-person text-muted mt-1"></i>
              <div>
                <p className="fw-bold small mb-1">Cliente:</p>
                <p className="small mb-0">
                  {typeof cliente === "string" ? cliente : cliente.nombre}
                  {typeof cliente !== "string" && cliente.documento && ` (${cliente.documento})`}
                </p>
              </div>
            </div>
          )}

          {mascotas && mascotas.length > 0 && (
            <div className="d-flex gap-2 mb-2">
              <i className="bi bi-github text-muted mt-1"></i>
              <div>
                <p className="fw-bold small mb-1">Mascotas:</p>
                <ul className="list-unstyled ps-0 small mb-0">
                  {mascotas.map((mascota, index) => (
                    <li key={index}>
                      {mascota.nombre} ({mascota.especie})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {servicios && servicios.length > 0 && (
            <div className="d-flex gap-2">
              <i className="bi bi-scissors text-muted mt-1"></i>
              <div>
                <p className="fw-bold small mb-1">Servicios:</p>
                <ul className="list-unstyled ps-0 small mb-0">
                  {servicios.map((servicio, index) => (
                    <li key={index}>{servicio.nombre}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <p className="card-text">{Mensaje}</p>
      </div>
      <div className="card-footer">
        <small className="text-muted d-block mb-2">{formatRelativeTime(FechaCreacion)}</small>
        <div className="d-flex flex-column gap-2">
          {Estado === "Pendiente" && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => onChangeStatus(IdNotificacion, "Vista")}>
              <i className="bi bi-eye me-1"></i>
              Marcar como vista
            </button>
          )}
          {(Estado === "Pendiente" || Estado === "Vista") && (
            <button className="btn btn-primary btn-sm" onClick={() => onChangeStatus(IdNotificacion, "Resuelta")}>
              <i className="bi bi-check-circle me-1"></i>
              Marcar como resuelta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CitasNotificationCard

