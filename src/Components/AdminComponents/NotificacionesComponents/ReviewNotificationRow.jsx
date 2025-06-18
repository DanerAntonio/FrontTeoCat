"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Componente para mostrar una fila de notificación de reseña (vista de lista)
 */
const ReviewNotificationRow = ({ notificacion, onChangeStatus }) => {
  // Usar los campos correctos según la tabla Notificaciones
  const {
    IdNotificacion,
    TipoNotificacion,
    Titulo,
    Mensaje,
    Prioridad,
    FechaCreacion,
    Estado,
    producto,
    calificacion,
    comentario,
    cliente,
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

  /**
   * Función para renderizar estrellas según la calificación
   * @param {number} rating - Calificación (1-5)
   * @returns {JSX.Element} Estrellas renderizadas
   */
  const renderStars = (rating) => {
    if (!rating) return null

    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={i < rating ? "bi bi-star-fill text-warning" : "bi bi-star text-muted"}
            style={{ fontSize: "0.8rem" }}
          ></i>
        ))}
      </div>
    )
  }

  // Verificar si el producto existe antes de intentar acceder a sus propiedades
  if (!producto) {
    return (
      <div className={`card mb-3 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-star-fill text-purple"></i>
            <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
            <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
            <small className="text-muted ms-auto">{formatRelativeTime(FechaCreacion)}</small>
          </div>

          <div className="mb-3">
            <h5 className="card-title">{Titulo}</h5>
            <p className="card-text text-muted">{Mensaje}</p>
          </div>

          <div className="d-flex justify-content-end gap-2">
            {Estado === "Pendiente" && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onChangeStatus(IdNotificacion, "Vista")}
              >
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

  return (
    <div className={`card mb-3 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-star-fill text-purple"></i>
          <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
          <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
          <small className="text-muted ms-auto">{formatRelativeTime(FechaCreacion)}</small>
        </div>

        <div className="mb-3">
          <div className="d-flex gap-3">
            <div style={{ width: "48px", height: "48px" }} className="flex-shrink-0">
              <img
                src={producto.imagen || "/placeholder.svg?height=200&width=200"}
                alt={producto.nombre}
                className="img-fluid rounded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <h5 className="card-title mb-0">{producto.nombre}</h5>
                <div className="d-flex align-items-center gap-1">
                  {renderStars(calificacion)}
                  <span className="badge bg-warning text-dark">{calificacion}/5</span>
                </div>
              </div>
              <div className="mt-1 fst-italic">"{comentario || Mensaje}"</div>
              {cliente && (
                <div className="d-flex align-items-center text-muted small mt-1">
                  <i className="bi bi-person me-1"></i>
                  <span>Por: {typeof cliente === "string" ? cliente : cliente.nombre}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {producto.url && (
            <a
              href={producto.url}
              className="btn btn-outline-secondary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              Ver
            </a>
          )}

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

export default ReviewNotificationRow
