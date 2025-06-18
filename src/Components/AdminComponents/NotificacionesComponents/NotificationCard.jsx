"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Componente para mostrar una tarjeta de notificación de producto
 */
const NotificationCard = ({ notificacion, onChangeStatus }) => {
  // Usar los campos correctos según la tabla Notificaciones
  const { IdNotificacion, TipoNotificacion, Titulo, Mensaje, Prioridad, FechaCreacion, Estado, producto } = notificacion

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
   * Función para obtener el icono del tipo de notificación
   * @param {string} tipo - Tipo de notificación
   * @returns {string} Clase de icono
   */
  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "StockBajo":
        return "bi bi-box text-danger"
      case "Vencimiento":
        return "bi bi-clock text-warning"
      default:
        return "bi bi-bell"
    }
  }

  // Verificar si el producto existe antes de intentar acceder a sus propiedades
  if (!producto) {
    return (
      <div className={`card h-100 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
        <div className="card-header d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center">
            <i className={`${getNotificationIcon(TipoNotificacion)} me-2`}></i>
            <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
          </div>
          <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
        </div>
        <div className="card-body">
          <h5 className="card-title">{Titulo}</h5>
          <p className="card-text">{Mensaje}</p>
        </div>
        <div className="card-footer">
          <small className="text-muted d-block mb-2">{formatRelativeTime(FechaCreacion)}</small>
          <div className="d-flex flex-column gap-2">
            {Estado === "Pendiente" && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onChangeStatus(IdNotificacion, "Vista")}
              >
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

  // Renderizado específico según el tipo de notificación
  const renderContent = () => {
    if (TipoNotificacion === "StockBajo") {
      return (
        <>
          <div className="d-flex gap-3 mb-3">
            <div style={{ width: "64px", height: "64px" }} className="flex-shrink-0">
              <img
                src={producto.imagen || "/placeholder.svg?height=200&width=200"}
                alt={producto.nombre}
                className="img-fluid rounded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h5 className="card-title">{producto.nombre}</h5>
              <div className="text-muted small">
                Stock: <span className="fw-bold">{producto.stock}</span> / {producto.stockMinimo}
              </div>
            </div>
          </div>

          <div className="progress mb-3" style={{ height: "8px" }}>
            <div
              className={`progress-bar ${producto.stock === 0 ? "bg-danger" : "bg-warning"}`}
              role="progressbar"
              style={{ width: `${(producto.stock / producto.stockMinimo) * 100}%` }}
              aria-valuenow={(producto.stock / producto.stockMinimo) * 100}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          <p className="card-text">{Mensaje}</p>
        </>
      )
    } else if (TipoNotificacion === "Vencimiento") {
      const diasRestantes = producto.fechaVencimiento
        ? Math.ceil((new Date(producto.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const vencido = diasRestantes <= 0

      return (
        <>
          <div className="d-flex gap-3 mb-3">
            <div style={{ width: "64px", height: "64px" }} className="flex-shrink-0">
              <img
                src={producto.imagen || "/placeholder.svg?height=200&width=200"}
                alt={producto.nombre}
                className="img-fluid rounded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h5 className="card-title">{producto.nombre}</h5>
              <div className="text-muted small">
                Vence: <span className="fw-bold">{formatDate(producto.fechaVencimiento)}</span>
              </div>
              <div className={`small ${vencido ? "text-danger fw-bold" : "text-warning"}`}>
                {vencido ? "Producto vencido" : `Quedan ${diasRestantes} días`}
              </div>
            </div>
          </div>

          <p className="card-text">{Mensaje}</p>
        </>
      )
    } else {
      return (
        <>
          <div className="d-flex gap-3 mb-3">
            <div style={{ width: "64px", height: "64px" }} className="flex-shrink-0">
              <img
                src={producto.imagen || "/placeholder.svg?height=200&width=200"}
                alt={producto.nombre}
                className="img-fluid rounded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h5 className="card-title">{producto.nombre}</h5>
            </div>
          </div>

          <p className="card-text">{Mensaje}</p>
        </>
      )
    }
  }

  return (
    <div className={`card h-100 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
      <div className="card-header d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-center">
          <i className={`${getNotificationIcon(TipoNotificacion)} me-2`}></i>
          <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
        </div>
        <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
      </div>
      <div className="card-body">{renderContent()}</div>
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

export default NotificationCard
