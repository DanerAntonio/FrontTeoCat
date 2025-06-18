"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Componente para mostrar una fila de notificación de citas (vista de lista)
 */
const CitasNotificationRow = ({ notificacion, onChangeStatus }) => {
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
    <div className={`card mb-3 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-calendar-event text-success"></i>
          <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
          <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
          <small className="text-muted ms-auto">{formatRelativeTime(FechaCreacion)}</small>
        </div>

        <div className="mb-3">
          <div className="d-flex gap-3">
            <div
              style={{ width: "48px", height: "48px" }}
              className="d-flex align-items-center justify-content-center bg-light text-success rounded flex-shrink-0"
            >
              <i className="bi bi-calendar-event fs-4"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="card-title">{fechaCita ? formatDateTime(fechaCita) : "Fecha no especificada"}</h5>
              <div className="d-flex flex-wrap gap-3 mt-1">
                {cliente && (
                  <div className="d-flex align-items-center text-muted small">
                    <i className="bi bi-person me-1"></i>
                    <span>
                      {typeof cliente === "string" ? cliente : cliente.nombre}
                      {typeof cliente !== "string" && cliente.documento && ` (${cliente.documento})`}
                    </span>
                  </div>
                )}
                {mascotas && mascotas.length > 0 && (
                  <div className="d-flex align-items-center text-muted small">
                    <i className="bi bi-github me-1"></i>
                    <span>{mascotas.map((m) => m.nombre).join(", ")}</span>
                  </div>
                )}
                {servicios && servicios.length > 0 && (
                  <div className="d-flex align-items-center text-muted small">
                    <i className="bi bi-scissors me-1"></i>
                    <span>{servicios.map((s) => s.nombre).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {Estado === "Pendiente" && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => onChangeStatus(IdNotificacion, "Vista")}>
              <i className="bi bi-eye me-1"></i>
              Vista
            </button>
          )}
          {(Estado === "Pendiente" || Estado === "Vista") && (
            <button className="btn btn-primary btn-sm" onClick={() => onChangeStatus(IdNotificacion, "Resuelta")}>
              <i className="bi bi-check-circle me-1"></i>
              Resuelta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CitasNotificationRow
