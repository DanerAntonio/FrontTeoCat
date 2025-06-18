"use client"

import { AlertTriangle } from 'lucide-react'

/**
 * Componente para modal de confirmación de eliminación
 * @param {boolean} show - Controla la visibilidad del modal
 * @param {Object} item - El elemento que se va a eliminar
 * @param {Function} onCancel - Función a ejecutar al cancelar
 * @param {Function} onConfirm - Función a ejecutar al confirmar
 * @param {string} itemType - Tipo de elemento a eliminar (por defecto: "elemento")
 */
const DeleteConfirmModal = ({ show, item, onCancel, onConfirm, itemType = "elemento" }) => {
  if (!show) return null

  // Determinar el nombre a mostrar en el mensaje de confirmación
  const itemName = item?.nombre || item?.NombreProducto || item?.name || "este elemento"

  // Manejar el evento de tecla Escape para cerrar el modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div 
        className={`modal fade ${show ? "show d-block" : ""}`} 
        tabIndex="-1" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        onKeyDown={handleKeyDown}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title" id="delete-confirm-title">Confirmar eliminación</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onCancel}
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">
                  ¿Está seguro de eliminar {itemType === "elemento" ? "el" : "la"} {itemType} "{itemName}"?
                </p>
              </div>
              <div className="mt-3 text-muted small">
                Esta acción no se puede deshacer.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={onConfirm}
              >
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