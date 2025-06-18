"use client"

import { AlertTriangle } from "lucide-react"

/**
 * Modal de confirmación para eliminar categoría
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.show - Indica si se debe mostrar el modal
 * @param {Object} props.categoria - Categoría a eliminar
 * @param {Function} props.onConfirm - Función para confirmar la eliminación
 * @param {Function} props.onCancel - Función para cancelar la eliminación
 */
const DeleteConfirmModal = ({ show, categoria, onConfirm, onCancel }) => {
  if (!categoria) return null

  return (
    <>
      {show && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">¿Está seguro de eliminar la categoría "{categoria?.nombre}"?</p>
              </div>
              <p className="mt-2 text-danger">
                <strong>Advertencia:</strong> Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmModal
