"use client"

import "../VentasComponents/VentaInfoSection.scss"
import { useState, useEffect } from "react"
import * as bootstrap from "bootstrap" // Import Bootstrap

/**
 * Componente para mostrar la información de la venta CON validación de stock
 */
const VentaInfoSection = ({ venta, formatNumber }) => {
  const [stockValidation, setStockValidation] = useState(null)

  // Función para validar stock de productos en la venta
  const validarStockVenta = async (ventaData) => {
    if (!ventaData || !ventaData.detallesProductos) return

    try {
      // Aquí puedes agregar la lógica de validación de stock
      console.log("Validando stock para venta:", ventaData)

      // Ejemplo de validación (ajusta según tu API)
      const productosConStockBajo = []

      for (const producto of ventaData.detallesProductos) {
        // Simular verificación de stock (reemplaza con tu lógica real)
        const stockActual = producto.stock || 0
        const cantidadSolicitada = producto.cantidad || 1

        if (stockActual < cantidadSolicitada) {
          productosConStockBajo.push({
            nombre: producto.nombre,
            stockActual,
            cantidadSolicitada,
            faltante: cantidadSolicitada - stockActual,
          })
        }
      }

      if (productosConStockBajo.length > 0) {
        mostrarAlertaStockInsuficiente(productosConStockBajo)
        return false
      }

      return true
    } catch (error) {
      console.error("Error validando stock:", error)
      return false
    }
  }

  // Función para mostrar alerta de stock insuficiente
  const mostrarAlertaStockInsuficiente = (productos) => {
    const modalHtml = `
      <div class="modal fade" id="stockInsuficienteModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-danger shadow-lg">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>
                🚫 Stock Insuficiente - No se puede procesar la venta
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-danger border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-box-open me-2"></i>
                  Los siguientes productos no tienen stock suficiente:
                </h6>
                <div class="row">
                  ${productos
                    .map(
                      (producto) => `
                    <div class="col-12 mb-3">
                      <div class="card border-danger">
                        <div class="card-body">
                          <h6 class="card-title text-danger">📦 ${producto.nombre}</h6>
                          <div class="row text-sm">
                            <div class="col-4">
                              <strong>Stock disponible:</strong><br>
                              <span class="badge bg-warning">${producto.stockActual} unidades</span>
                            </div>
                            <div class="col-4">
                              <strong>Cantidad solicitada:</strong><br>
                              <span class="badge bg-info">${producto.cantidadSolicitada} unidades</span>
                            </div>
                            <div class="col-4">
                              <strong>Faltan:</strong><br>
                              <span class="badge bg-danger">${producto.faltante} unidades</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Por favor, ajuste las cantidades o verifique el inventario antes de continuar con la venta.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("stockInsuficienteModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("stockInsuficienteModal"))
    modal.show()

    // Limpiar modal después de cerrarlo
    document.getElementById("stockInsuficienteModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  }

  // Exponer función de validación para uso externo
  useEffect(() => {
    if (window) {
      window.validarStockVenta = validarStockVenta
    }
  }, [])

  // Si no hay venta, no renderizar nada
  if (!venta) return null

  return (
    <div className="venta-info-section">
      <h5 className="section-title">Información de la Venta</h5>
      <div className="row">
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              id="cliente-nombre"
              placeholder="Nombre del Cliente"
              value={venta.cliente ? venta.cliente.nombre : venta.Cliente || `Cliente ID: ${venta.IdCliente || ""}`}
              readOnly
            />
            <label htmlFor="cliente-nombre">Nombre del Cliente</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="date"
              className="form-control fecha"
              id="fecha-venta"
              placeholder="Fecha de Venta"
              value={venta.fechaVenta || venta.FechaVenta || ""}
              readOnly
            />
            <label htmlFor="fecha-venta">Fecha de Venta</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className="form-control identificador"
              id="numero-factura"
              placeholder="Número de Factura"
              value={venta.codigoFactura || venta.IdVenta || ""}
              readOnly
            />
            <label htmlFor="numero-factura">Número de Factura</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className="form-control valor-monetario"
              id="total-venta"
              placeholder="Total de la Venta"
              value={`$${formatNumber(venta.total || venta.TotalMonto || 0)}`}
              readOnly
            />
            <label htmlFor="total-venta">Total de la Venta</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentaInfoSection
