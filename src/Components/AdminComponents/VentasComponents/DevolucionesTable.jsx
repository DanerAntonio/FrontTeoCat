"use client"

import { useState, useEffect } from "react"
import "../VentasComponents/DevolucionesTable.scss"
import * as bootstrap from "bootstrap"

/**
 * Componente para la tabla de detalles de productos CON validación integrada
 */
const DetallesProductosTable = ({
  detalles = [],
  seleccionados = {},
  cantidades = {},
  onSeleccionChange,
  onCantidadChange,
}) => {
  const [validacionRealizada, setValidacionRealizada] = useState(false)

  // Función para validar stock antes de seleccionar productos
  const validarStockAntesDevolución = async (detalleId) => {
    try {
      const detalle = detalles.find((d) => (d.IdDetalleVentas || d.id) === detalleId)
      if (!detalle) return false

      // Simular validación de stock (ajusta según tu lógica)
      const stockActual = detalle.Stock || detalle.stock || 0
      const nombreProducto = detalle.NombreProducto || detalle.producto?.nombre || `Producto ID: ${detalle.IdProducto}`

      // Verificar si hay problemas con el stock
      if (stockActual < 0) {
        mostrarAlertaStockProblema([
          {
            nombre: nombreProducto,
            problema: `Stock negativo detectado: ${stockActual} unidades`,
            tipo: "stock_negativo",
          },
        ])
        return false
      }

      // Verificar si el producto está activo (si tienes esta información)
      if (detalle.Estado === false || detalle.activo === false) {
        mostrarAlertaStockProblema([
          {
            nombre: nombreProducto,
            problema: "Producto inactivo, no se puede procesar devolución",
            tipo: "producto_inactivo",
          },
        ])
        return false
      }

      return true
    } catch (error) {
      console.error("Error validando stock para devolución:", error)
      mostrarAlertaStockProblema([
        {
          nombre: "Producto",
          problema: "Error al validar producto para devolución",
          tipo: "error_validacion",
        },
      ])
      return false
    }
  }

  // Función para mostrar alerta de problemas de stock
  const mostrarAlertaStockProblema = (problemas) => {
    const modalHtml = `
      <div class="modal fade" id="stockProblemaModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-warning shadow-lg">
            <div class="modal-header bg-warning text-dark">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ⚠️ Problema con el producto
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-box me-2"></i>
                  No se puede procesar la devolución:
                </h6>
                <div class="row">
                  ${problemas
                    .map(
                      (problema) => `
                    <div class="col-12 mb-3">
                      <div class="card border-warning">
                        <div class="card-body">
                          <h6 class="card-title text-warning">
                            ${problema.tipo === "stock_negativo" ? "📦" : problema.tipo === "producto_inactivo" ? "❌" : "⚠️"} 
                            ${problema.nombre}
                          </h6>
                          <p class="card-text">${problema.problema}</p>
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
                  Por favor, verifique el estado del producto y el inventario antes de continuar.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-warning btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("stockProblemaModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("stockProblemaModal"))
    modal.show()

    // Limpiar modal después de cerrarlo
    document.getElementById("stockProblemaModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  }

  // Función mejorada para manejar selección con validación
  const handleSeleccionConValidacion = async (detalleId) => {
    // Si se está deseleccionando, permitir sin validación
    if (seleccionados[detalleId]) {
      if (onSeleccionChange) {
        onSeleccionChange(detalleId)
      }
      return
    }

    // Si se está seleccionando, validar primero
    const esValido = await validarStockAntesDevolución(detalleId)
    if (esValido && onSeleccionChange) {
      onSeleccionChange(detalleId)
    }
  }

  // Exponer funciones para uso externo
  useEffect(() => {
    if (window) {
      window.validarStockAntesDevolución = validarStockAntesDevolución
      window.mostrarAlertaStockProblema = mostrarAlertaStockProblema
    }
  }, [detalles])

  // Verificar si detalles es undefined o no es un array
  if (!detalles || !Array.isArray(detalles)) {
    console.error("DetallesProductosTable: detalles is not an array", detalles)
    return <div className="alert alert-warning">No hay datos de productos disponibles</div>
  }

  return (
    <div className="detalles-productos-container">
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad Original</th>
              <th>Cantidad a Devolver</th>
              <th>Subtotal</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle) => {
              const detalleId = detalle.IdDetalleVentas || detalle.id
              const cantidadMax = detalle.Cantidad
              const cantidadActual = cantidades[detalleId] || 1
              const isSelected = seleccionados[detalleId] || false
              const precioUnitario = detalle.PrecioUnitario || 0
              const stockActual = detalle.Stock || detalle.stock || 0
              const estaActivo = detalle.Estado !== false && detalle.activo !== false

              // Determinar el estado del producto
              let estadoProducto = "✅ OK"
              let estadoClass = "text-success"

              if (!estaActivo) {
                estadoProducto = "❌ Inactivo"
                estadoClass = "text-danger"
              } else if (stockActual < 0) {
                estadoProducto = "⚠️ Stock negativo"
                estadoClass = "text-warning"
              }

              return (
                <tr key={detalleId} className={isSelected ? "table-primary" : ""}>
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSeleccionConValidacion(detalleId)}
                        id={`check-${detalleId}`}
                      />
                    </div>
                  </td>
                  <td>
                    {detalle.NombreProducto ||
                      (detalle.producto ? detalle.producto.nombre : `Producto ID: ${detalle.IdProducto}`)}
                  </td>
                  <td className="precio-unitario">${precioUnitario.toLocaleString("es-CO")}</td>
                  <td>{cantidadMax}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="1"
                      max={cantidadMax}
                      value={cantidadActual}
                      onChange={(e) =>
                        onCantidadChange && onCantidadChange(detalleId, Number.parseInt(e.target.value), cantidadMax)
                      }
                      disabled={!isSelected}
                    />
                  </td>
                  <td className="subtotal">
                    {isSelected ? `$${(precioUnitario * cantidadActual).toLocaleString("es-CO")}` : "-"}
                  </td>
                  <td className={estadoClass}>
                    <small>{estadoProducto}</small>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Información adicional sobre validación */}
      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Los productos se validan automáticamente antes de ser seleccionados para devolución.
        </small>
      </div>
    </div>
  )
}

export default DetallesProductosTable

// Supón que tienes algo así en tu componente padre:
import { useState } from "react"
import DetallesProductosTable from "./DevolucionesTable"

// ...dentro de tu componente padre...
const [detalles, setDetalles] = useState([])

// Función que llamas después de la devolución exitosa:
const handleDevolucionExitosa = (respuesta) => {
  if (respuesta.stocksActualizados) {
    setDetalles((prevDetalles) =>
      prevDetalles.map((detalle) => {
        const actualizado = respuesta.stocksActualizados.find((s) => s.IdProducto === detalle.IdProducto)
        return actualizado ? { ...detalle, Stock: actualizado.Stock } : detalle
      }),
    )
  }
  // ...resto de lógica de éxito...
}
