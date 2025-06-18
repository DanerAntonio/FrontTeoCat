"use client"

import React, { useEffect } from "react"
import {
  Eye,
  Edit,
  ToggleLeft,
  Trash2,
  XCircle,
  RotateCcw,
  Check,
  AlertTriangle,
  Copy,
  Archive,
  Printer,
} from "lucide-react"
import "../AdminComponents/TableActions.scss"

// Componente para un botón de acción individual
const ActionButton = ({ icon, label, color, onClick, actionKey }) => (
  <button
    type="button"
    className={`btn btn-${color} btn-sm action-button`}
    onClick={(e) => {
      // Eliminar cualquier tooltip antes de ejecutar la acción
      const tooltips = document.querySelectorAll(".tooltip")
      tooltips.forEach((tooltip) => tooltip.remove())

      onClick(e)
    }}
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    data-action={actionKey}
    title={label}
  >
    {React.createElement(icon, { size: 16 })}
  </button>
)

// Componente principal que permite seleccionar acciones específicas
const TableActions = ({
  actions = [], // Array de strings con las acciones que se quieren mostrar
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onCancel,
  onReturn,
  onApprove,
  onReject,
  onDuplicate,
  onArchive,
  onPrint,
  row,
  customLabels = {},
}) => {
  // Definición de todas las acciones disponibles
  const actionButtons = {
    view: {
      icon: Eye,
      label: customLabels.view || "Ver detalles",
      color: "info",
      onClick: () => onView?.(row),
    },
    edit: {
      icon: Edit,
      label: customLabels.edit || "Editar",
      color: "primary",
      onClick: () => onEdit?.(row),
    },
    toggleStatus: {
      icon: ToggleLeft,
      label: customLabels.toggleStatus || "Cambiar estado",
      color: "warning",
      onClick: () => onToggleStatus?.(row),
    },
    delete: {
      icon: Trash2,
      label: customLabels.delete || "Eliminar",
      color: "danger",
      onClick: () => onDelete?.(row),
    },
    cancel: {
      icon: XCircle,
      label: customLabels.cancel || "Anular",
      color: "secondary",
      onClick: () => onCancel?.(row),
    },
    return: {
      icon: RotateCcw,
      label: customLabels.return || "Hacer devolución",
      color: "success",
      onClick: () => onReturn?.(row),
    },
    approve: {
      icon: Check,
      label: customLabels.approve || "Aprobar",
      color: "success",
      onClick: () => onApprove?.(row),
    },
    reject: {
      icon: AlertTriangle,
      label: customLabels.reject || "Rechazar",
      color: "danger",
      onClick: () => onReject?.(row),
    },
    duplicate: {
      icon: Copy,
      label: customLabels.duplicate || "Duplicar",
      color: "info",
      onClick: () => onDuplicate?.(row),
    },
    archive: {
      icon: Archive,
      label: customLabels.archive || "Archivar",
      color: "secondary",
      onClick: () => onArchive?.(row),
    },
    print: {
      icon: Printer,
      label: customLabels.print || "Imprimir factura",
      color: "purple",
      onClick: () => onPrint?.(row),
    },
  }

  // Inicializar tooltips cuando el componente se monta
  useEffect(() => {
    let tooltipInstances = []

    // Import bootstrap here to avoid conditional hook call
    import("bootstrap").then((bootstrap) => {
      // Inicializar todos los tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      tooltipInstances = tooltipTriggerList.map((tooltipTriggerEl) => {
        const tooltip = new bootstrap.Tooltip(tooltipTriggerEl)

        // Añadir el atributo data-action al tooltip
        tooltipTriggerEl.addEventListener("inserted.bs.tooltip", () => {
          const action = tooltipTriggerEl.getAttribute("data-action")
          if (action) {
            const tooltipElement = document.querySelector(".tooltip .tooltip-inner")
            if (tooltipElement) {
              tooltipElement.setAttribute("data-action", action)
            }
          }
        })

        return tooltip
      })
    })

    // Limpiar tooltips cuando el componente se desmonta
    return () => {
      // Eliminar manualmente todos los tooltips del DOM
      const tooltips = document.querySelectorAll(".tooltip")
      tooltips.forEach((tooltip) => tooltip.remove())

      // Destruir las instancias de tooltip
      if (tooltipInstances.length > 0) {
        tooltipInstances.forEach((tooltip) => {
          if (tooltip) {
            tooltip.dispose()
          }
        })
      }
    }
  }, [])

  // Solo renderizar las acciones especificadas
  return (
    <div className="table-actions-container">
      {actions.map((actionKey, index) => {
        if (!actionKey) return null
        const action = actionButtons[actionKey]
        if (!action) return null

        return (
          <ActionButton
            key={index}
            icon={action.icon}
            label={action.label}
            color={action.color}
            onClick={action.onClick}
            actionKey={actionKey}
          />
        )
      })}
    </div>
  )
}

export default TableActions

