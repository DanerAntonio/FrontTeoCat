"use client"

import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Componente para mostrar una tarjeta de comprobante de pago
 */
const PaymentReceiptCard = ({ notificacion, onChangeStatus }) => {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Usar los campos correctos según la tabla Notificaciones
  const {
    IdNotificacion,
    TipoNotificacion,
    Titulo,
    Mensaje,
    Prioridad,
    FechaCreacion,
    Estado,
    numeroPedido,
    cliente,
    monto,
    fechaVenta,
    comprobante,
    notasAdicionales,
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
   * Función para formatear números con separadores de miles
   */
  const formatNumber = (number) => {
    if (number === undefined || number === null) return "0"
    return number.toLocaleString("es-CO")
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
   * @param {string} estado - Estado del comprobante
   * @returns {string} Clase CSS para el color
   */
  const getStatusClass = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning"
      case "Aprobado":
        return "bg-success"
      case "Rechazado":
        return "bg-danger"
      case "Vista":
        return "bg-info"
      case "Resuelta":
        return "bg-success"
      default:
        return "bg-secondary"
    }
  }

  /**
   * Manejador para aprobar el comprobante
   */
  const handleApprove = () => {
    onChangeStatus(IdNotificacion, "Aprobada")
  }

  /**
   * Manejador para mostrar el formulario de rechazo
   */
  const handleShowRejectForm = () => {
    setShowRejectForm(true)
  }

  /**
   * Manejador para cancelar el rechazo
   */
  const handleCancelReject = () => {
    setShowRejectForm(false)
    setRejectReason("")
  }

  /**
   * Manejador para confirmar el rechazo
   */
  const handleConfirmReject = () => {
    if (rejectReason.trim() === "") {
      alert("Por favor, ingrese un motivo para el rechazo")
      return
    }
    onChangeStatus(IdNotificacion, "Rechazada", rejectReason)
    setShowRejectForm(false)
    setRejectReason("")
  }

  return (
    <div className={`card h-100 ${Estado === "Pendiente" ? "border-warning border-start border-4" : ""}`}>
      <div className="card-header d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-center">
          <i className="bi bi-file-earmark-text text-primary me-2"></i>
          <span className={`badge ${getPriorityClass(Prioridad)}`}>{TipoNotificacion}</span>
        </div>
        <span className={`badge ${getStatusClass(Estado)}`}>{Estado}</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h5 className="card-title">Pedido #{notificacion.numeroPedido ?? "N/A"}</h5>
            {cliente && (
              <div className="d-flex align-items-center text-muted small mt-1">
                <i className="bi bi-person me-1"></i>
                <span>{typeof cliente === "string" ? cliente : cliente.nombre}</span>
              </div>
            )}
            {monto !== undefined && (
              <div className="d-flex align-items-center small fw-bold mt-1">
                <i className="bi bi-currency-dollar me-1"></i>
                <span>${formatNumber(monto)}</span>
              </div>
            )}
            {fechaVenta && (
              <div className="d-flex align-items-center text-muted small mt-1">
                <i className="bi bi-calendar me-1"></i>
                <span>{formatDateTime(fechaVenta)}</span>
              </div>
            )}
          </div>
        </div>

        <p className="card-text">{Mensaje}</p>

        {notasAdicionales && (
          <div className="bg-light p-3 rounded mb-3 small">
            <p className="fw-bold mb-1">Notas:</p>
            <p className="mb-0">{notasAdicionales}</p>
          </div>
        )}

        {notificacion.Imagen && (
          <img
            src={notificacion.Imagen}
            alt="Comprobante"
            className="img-fluid rounded mt-2"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        )}

        {notificacion.comprobante && (
          <div className="mb-3">
            <strong>Comprobante de pago:</strong>
            <div>
              {notificacion.comprobante.tipo === "pdf" ? (
                <a href={notificacion.comprobante.url} target="_blank" rel="noopener noreferrer">
                  Ver comprobante PDF
                </a>
              ) : (
                <>
                  <a href={notificacion.comprobante.url} target="_blank" rel="noopener noreferrer" download>
                    <img
                      src={notificacion.comprobante.url}
                      alt="Comprobante de pago"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        marginTop: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </a>
                  <div>
                    <a href={notificacion.comprobante.url} target="_blank" rel="noopener noreferrer" download>
                      Descargar comprobante
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="card-footer">
        <small className="text-muted d-block mb-2">{formatRelativeTime(FechaCreacion)}</small>
        <hr className="my-2" />

        {showRejectForm ? (
          <div className="d-flex flex-column gap-2">
            <textarea
              className="form-control form-control-sm"
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            ></textarea>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelReject}>
                Cancelar
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleConfirmReject}>
                Confirmar rechazo
              </button>
            </div>
          </div>
        ) : Estado === "Pendiente" ? (
          <div className="d-flex flex-column gap-2">
            <button className="btn btn-success btn-sm" onClick={handleApprove}>
              <i className="bi bi-check-circle me-1"></i>
              Aprobar comprobante
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleShowRejectForm}>
              <i className="bi bi-x-circle me-1"></i>
              Rechazar comprobante
            </button>
          </div>
        ) : (Estado === "Aprobado" || Estado === "Rechazado") && comprobante && comprobante.url ? (
          <a
            href={comprobante.url}
            className="btn btn-outline-primary btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-file-earmark-text me-1"></i>
            Ver comprobante
          </a>
        ) : null}
      </div>
    </div>
  )
}

export default PaymentReceiptCard
