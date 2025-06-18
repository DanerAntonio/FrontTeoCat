// LoadingOverlay.jsx (modificado)
import React, { useEffect, useState, useRef } from "react";
import "./LoadingOverlay.scss";

const LoadingOverlay = ({ 
  isLoading, 
  message = "Procesando...", 
  fullScreen = true,
  showSpinner = true,
  variant = "primary",
  minDisplayTime = 1000,
  onHide = () => {}
}) => {
  const [display, setDisplay] = useState(false);
  // Usar una referencia para rastrear si el callback ya fue llamado
  const callbackExecuted = useRef(false);
  // Referencia para el temporizador
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Cuando isLoading cambia a true, mostrar el overlay y resetear el estado del callback
    if (isLoading) {
      setDisplay(true);
      callbackExecuted.current = false;
      
      // Limpiar cualquier temporizador existente
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } 
    // Cuando isLoading cambia a false pero el overlay sigue visible
    else if (display) {
      // Configurar un temporizador para ocultar el overlay después del tiempo mínimo
      timerRef.current = setTimeout(() => {
        setDisplay(false);
        
        // Solo ejecutar el callback si no se ha ejecutado ya
        if (!callbackExecuted.current) {
          callbackExecuted.current = true;
          onHide();
        }
      }, minDisplayTime);
    }
    
    // Limpieza al desmontar o cuando cambian las dependencias
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, display, minDisplayTime, onHide]);
  
  if (!display) return null;

  const overlayClass = fullScreen ? "loading-overlay" : "loading-overlay-container";

  return (
    <div className={overlayClass}>
      <div className="loading-content">
        {showSpinner && (
          <div className={`spinner-border text-${variant}`} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        )}
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;