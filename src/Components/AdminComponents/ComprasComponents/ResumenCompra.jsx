"use client"

import { FileText } from "lucide-react"

/**
 * Componente para mostrar el resumen de la compra
 */
const ResumenCompra = ({ totales, formatNumber }) => {
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0 d-flex align-items-center">
          <FileText size={18} className="me-2" />
          Resumen de la Compra
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <strong>Monto Total:</strong>
          <span>${formatNumber(totales.TotalMonto)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <strong>Total IVA:</strong>
          <span>${formatNumber(totales.TotalIva)}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <strong>Monto Total con IVA:</strong>
          <span className="text-primary fw-bold">${formatNumber(totales.TotalMontoConIva)}</span>
        </div>
      </div>
    </div>
  )
}

export default ResumenCompra
