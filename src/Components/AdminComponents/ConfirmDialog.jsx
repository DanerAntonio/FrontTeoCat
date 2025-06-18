// ConfirmDialog.jsx (ubicar en Components/Common)
import React from "react";
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import "../AdminComponents/ConfirmDialog.scss";

const ConfirmDialog = ({ 
  show, 
  title, 
  message, 
  confirmText = "Aceptar", 
  cancelText = "Cancelar", 
  type = "warning", // warning, danger, info, success
  onConfirm, 
  onCancel 
}) => {
  if (!show) return null;

  let icon;
  let headerClass = "modal-header ";
  let buttonClass = "btn btn-";
  
  switch (type) {
    case "danger":
      icon = <AlertCircle size={24} className="text-danger me-3" />;
      headerClass += "bg-danger text-white";
      buttonClass += "danger";
      break;
    case "info":
      icon = <Info size={24} className="text-info me-3" />;
      headerClass += "bg-info text-white";
      buttonClass += "info";
      break;
    case "success":
      icon = <Info size={24} className="text-success me-3" />;
      headerClass += "bg-success text-white";
      buttonClass += "success";
      break;
    case "warning":
    default:
      icon = <AlertTriangle size={24} className="text-warning me-3" />;
      headerClass += "bg-warning text-white";
      buttonClass += "warning";
  }

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal fade show d-block confirm-dialog" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className={headerClass}>
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                {icon}
                <p className="mb-0">{message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                {cancelText}
              </button>
              <button 
                type="button" 
                className={buttonClass}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;