"use client"

import { useState, useEffect } from "react"
import "../VentasComponents/ResumenDevolucion.scss"
import * as bootstrap from "bootstrap" // Import Bootstrap

/**
 * Componente para mostrar el resumen de la devolución CON alerta de éxito
 */
const ResumenDevolucion = ({ montoTotal, formatNumber, onDevolucionProcesada }) => {
  const [devolucionProcesada, setDevolucionProcesada] = useState(false)

  // Función para mostrar alerta de éxito cuando se procesa la devolución
  const mostrarAlertaExitoDevolucion = (datosDevolucion = {}) => {
    const modalHtml = `
      <div class="modal fade" id="exitoDevolucionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-success shadow-lg">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">
                <i class="fas fa-check-circle me-2"></i>
                ✅ ¡Devolución Procesada Exitosamente!
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-success border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-thumbs-up me-2"></i>
                  La devolución ha sido registrada correctamente en el sistema
                </h6>
                <div class="row">
                  <div class="col-md-8">
                    <strong>📋 Detalles de la operación:</strong>
                    <ul class="list-unstyled mt-2 mb-0">
                      <li class="mb-1">
                        <i class="fas fa-receipt me-2 text-primary"></i>
                        <strong>Venta original:</strong> #${datosDevolucion.ventaId || "N/A"}
                      </li>
                      <li class="mb-1">
                        <i class="fas fa-user me-2 text-primary"></i>
                        <strong>Cliente:</strong> ${datosDevolucion.cliente || "Cliente"}
                      </li>
                      <li class="mb-1">
                        <i class="fas fa-dollar-sign me-2 text-primary"></i>
                        <strong>Monto devuelto:</strong> $${formatNumber(datosDevolucion.monto || montoTotal)}
                      </li>
                      <li class="mb-1">
                        <i class="fas fa-calendar me-2 text-primary"></i>
                        <strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-4">
                    <div class="text-center">
                      <i class="fas fa-undo-alt fa-4x text-success mb-2"></i>
                      <p class="text-muted mb-0 small">Operación completada</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  El inventario ha sido actualizado automáticamente y la devolución queda registrada en el historial.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-arrow-right me-1"></i>
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("exitoDevolucionModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modalElement = document.getElementById("exitoDevolucionModal")
    const modal = new bootstrap.Modal(modalElement)
    modal.show()

    // Limpiar modal después de cerrarlo
    modalElement.addEventListener("hidden.bs.modal", function () {
      this.remove()
    })

    // Auto-focus en el botón principal
    modalElement.addEventListener("shown.bs.modal", function () {
      const mainButton = this.querySelector(".btn-success")
      if (mainButton) mainButton.focus()
    })

    console.log("✅ Alerta de éxito de devolución mostrada")
  }

  // Función para simular el procesamiento de devolución
  const procesarDevolucion = (datosDevolucion) => {
    setDevolucionProcesada(true)

    // Mostrar alerta de éxito después de un breve delay
    setTimeout(() => {
      mostrarAlertaExitoDevolucion(datosDevolucion)
    }, 500)

    // Llamar callback si existe
    if (onDevolucionProcesada) {
      onDevolucionProcesada(datosDevolucion)
    }
  }

  // Exponer función para uso externo
  useEffect(() => {
    if (window) {
      window.mostrarAlertaExitoDevolucion = mostrarAlertaExitoDevolucion
      window.procesarDevolucion = procesarDevolucion
    }
  }, [montoTotal])

  return (
    <div className="resumen-devolucion">
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Resumen</h5>
          {devolucionProcesada && (
            <span className="badge bg-success">
              <i className="fas fa-check me-1"></i>
              Procesada
            </span>
          )}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Monto Total de Devolución:</h4>
            <h4 className="monto-total">${formatNumber(montoTotal)}</h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumenDevolucion
