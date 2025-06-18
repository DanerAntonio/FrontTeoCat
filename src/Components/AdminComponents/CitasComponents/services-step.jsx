"use client"

import { ArrowLeft } from 'lucide-react'
import { Button, Card } from "react-bootstrap"

export const ServicesStep = ({ servicios, selectedServicios, onServiciosChange, formErrors, onNext, onPrev }) => {
  // Manejador para seleccionar un servicio
  const handleSelectServicio = (servicio) => {
    // Verificar si el servicio ya está seleccionado
    const isSelected = selectedServicios.some((s) => s.id === servicio.id)

    let nuevosServicios
    if (isSelected) {
      // Si ya está seleccionado, quitarlo
      nuevosServicios = selectedServicios.filter((s) => s.id !== servicio.id)
    } else {
      // Si no está seleccionado, agregarlo
      nuevosServicios = [...selectedServicios, servicio]
    }

    onServiciosChange(nuevosServicios)
  }

  // Formatear precio sin ceros iniciales
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0';
    
    // Convertir a número si es string
    if (typeof price === 'string') {
      // Eliminar el símbolo $ y cualquier otro carácter no numérico
      const precioLimpio = price.replace(/[^\d.,]/g, '');
      price = parseFloat(precioLimpio.replace(/\./g, '').replace(',', '.'));
    }
    
    // Asegurarse de que sea un número válido
    if (isNaN(price)) return '0';
    
    // Formatear el número con separadores de miles
    return price.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  const validarServicios = (formData) => {
    const errores = {}
    if (!formData.servicios || formData.servicios.length === 0) {
      errores.servicios = "Debe seleccionar al menos un servicio."
    }
    return errores
  }

  return (
    <div className="step-container">
      <div className="step-number">
        <span>2</span>
      </div>
      <h3 className="step-title">Selecciona los Servicios</h3>

      <div className="servicios-container">
        <div className="servicios-grid">
          {servicios.map((servicio) => {
            const isSelected = selectedServicios.some((s) => s.id === servicio.id)
            
            // Procesar el precio para asegurarse de que sea un número
            let precio = servicio.precio;
            if (typeof precio === 'string') {
              precio = parseFloat(precio.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
            }

            return (
              <Card
                key={servicio.id}
                className={`servicio-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectServicio(servicio)}
              >
                <div className="servicio-image">
                  <img src={servicio.imagen || "/placeholder.svg?height=200&width=200"} alt={servicio.nombre} />
                </div>
                <div className="servicio-info">
                  <h5>{servicio.nombre}</h5>
                  <p className="servicio-descripcion">{servicio.descripcion}</p>
                  <div className="servicio-details">
                    <span className="servicio-duracion">{servicio.duracion} min</span>
                    <span className="servicio-precio">${formatPrice(precio)}</span>
                  </div>
                </div>
                <Button variant={isSelected ? "success" : "outline-primary"} size="sm">
                  {isSelected ? "Seleccionado" : "Seleccionar"}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {formErrors.servicios && <div className="text-danger mt-2 small">{formErrors.servicios}</div>}

      <div className="step-actions mt-4">
        <Button variant="outline-secondary" size="sm" onClick={onPrev}>
          <ArrowLeft size={14} className="me-1" />
          Atrás
        </Button>
        <Button variant="primary" size="sm" onClick={onNext} disabled={selectedServicios.length === 0}>
          Continuar
        </Button>
      </div>
    </div>
  )
}