import { Calendar, Clock } from 'lucide-react'

export const AppointmentSummary = ({ formData, selectedDate }) => {
  // Calcular duración total
  const duracionTotal = formData.servicios.reduce((total, servicio) => total + servicio.duracion, 0)

  // Calcular precio total
  const precioTotal = formData.servicios.reduce((total, servicio) => {
    let precio = servicio.precio;
    if (typeof precio === 'string') {
      precio = parseFloat(precio.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
    }
    return total + (isNaN(precio) ? 0 : precio);
  }, 0)

  // Formatear precio sin ceros iniciales
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '$0';
    
    // Convertir a número si es string
    if (typeof price === 'string') {
      // Eliminar el símbolo $ y cualquier otro carácter no numérico
      const precioLimpio = price.replace(/[^\d.,]/g, '');
      price = parseFloat(precioLimpio.replace(/\./g, '').replace(',', '.'));
    }
    
    // Asegurarse de que sea un número válido
    if (isNaN(price)) return '$0';
    
    // Formatear el número con separadores de miles
    return price.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  return (
    <div className="resumen-cita">
      <h4>Resumen de la Cita</h4>

      <div className="resumen-section">
        <h5>Fecha y Hora</h5>
        <div className="resumen-item">
          <Calendar size={16} />
          {selectedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="resumen-item">
          <Clock size={16} />
          {formData.hora} hrs
        </div>
      </div>

      <div className="resumen-section">
        <h5>Servicios Seleccionados</h5>
        {formData.servicios.length === 0 ? (
          <p className="text-muted">No has seleccionado servicios aún.</p>
        ) : (
          formData.servicios.map((servicio) => {
            // Procesar el precio para asegurarse de que sea un número
            let precio = servicio.precio;
            if (typeof precio === 'string') {
              precio = parseFloat(precio.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
            }
            
            return (
              <div key={servicio.id} className="resumen-servicio">
                <div className="d-flex justify-content-between">
                  <span>{servicio.nombre}</span>
                  <span className="text-success">${formatPrice(precio)}</span>
                </div>
                <div className="text-muted small">{servicio.duracion} min</div>
              </div>
            );
          })
        )}
      </div>

      {formData.cliente && (
        <div className="resumen-section">
          <h5>Cliente</h5>
          <p>{formData.cliente.nombre}</p>
        </div>
      )}

      {(formData.mascota || formData.mascotas.length > 0) && (
        <div className="resumen-section">
          <h5>Mascota</h5>
          {formData.mascota ? (
            <p>
              {formData.mascota.nombre} ({formData.mascota.especie})
            </p>
          ) : (
            formData.mascotas.map((mascota) => (
              <p key={mascota.id}>
                {mascota.nombre} ({mascota.especie})
              </p>
            ))
          )}
        </div>
      )}

      {formData.servicios.length > 0 && (
        <div className="resumen-totales">
          <div className="d-flex justify-content-between">
            <span>Duración total:</span>
            <span>{duracionTotal} minutos</span>
          </div>
          <div className="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span className="text-success">${formatPrice(precioTotal)}</span>
          </div>
        </div>
      )}

      <div className="resumen-footer mt-3">
        <p className="small text-muted">
          Al confirmar, aceptas nuestras políticas de cancelación y términos de servicio.
        </p>
        <a href="#" className="small d-block">
          Ver políticas de cancelación
        </a>
      </div>
    </div>
  )
}