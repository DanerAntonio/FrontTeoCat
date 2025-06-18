"use client"

import { AlertTriangle } from "lucide-react"

/**
 * Modal de confirmación para cambio de estado de usuario
 */
const StatusConfirmModal = ({ show, user, onConfirm, onCancel }) => {
  if (!user) return null

  return (
    <>
      {show && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title">Confirmar cambio de estado</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-warning me-3" />
                <p className="mb-0">
                  ¿Está seguro de {user?.estado === "Activo" ? "desactivar" : "activar"} al usuario "{user?.nombre}"?
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${user?.estado === "Activo" ? "btn-danger" : "btn-success"}`}
                onClick={onConfirm}
              >
                {user?.estado === "Activo" ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StatusConfirmModal

