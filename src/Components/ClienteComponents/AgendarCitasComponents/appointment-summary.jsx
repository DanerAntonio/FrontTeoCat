"use client"

import { Button, Card, ListGroup } from "react-bootstrap"

const AppointmentSummary = ({
  selectedDate,
  selectedTime,
  selectedServices,
  removeService,
  calculateTotal,
  calculateDuration,
  formatDuration,
  currentStep,
  goToNextStep,
  goToPreviousStep,
  handleSubmit,
  use24HourFormat = true,
}) => {
  // Formatear hora según el formato seleccionado
  const formatTime = (time) => {
    if (!time) return ""
    if (use24HourFormat) return `${time} hrs`

    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour, 10)
    const period = hourNum >= 12 ? "PM" : "AM"
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12
    return `${hour12}:${minute} ${period}`
  }

  const validarCitaCompleta = (formData) => {
    return {
      ...validarMascotaSeleccionada(formData),
      ...validarServicioSeleccionado(formData),
      ...validarFechaHora(formData),
    }
  }

  return (
    <Card className="appointment-summary border-0 shadow-sm sticky-top" style={{ top: "20px" }}>
      <Card.Header className="bg-white border-0">
        <h5 className="mb-0">Resumen de la Cita</h5>
      </Card.Header>
      <Card.Body>
        <h6 className="mb-2">Fecha y Hora</h6>
        {selectedDate && (
          <p className="mb-1">
            <i className="bi bi-calendar-event me-2" style={{ color: "#7ab51d" }}></i>
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        {selectedTime && (
          <p className="mb-3">
            <i className="bi bi-clock me-2" style={{ color: "#7ab51d" }}></i>
            {formatTime(selectedTime)}
          </p>
        )}

        <h6 className="mb-2">Servicios Seleccionados</h6>
        {selectedServices.length === 0 ? (
          <p className="text-muted">No has seleccionado servicios aún.</p>
        ) : (
          <ListGroup variant="flush" className="selected-services-list mb-3">
            {selectedServices.map((service) => (
              <ListGroup.Item key={service.id} className="px-0 py-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 fw-medium">{service.name}</p>
                    <small className="text-muted">{service.duration} min</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="service-price me-2">${service.price.toLocaleString()}</span>
                    <Button variant="link" className="p-0 text-danger" onClick={() => removeService(service.id)}>
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {selectedServices.length > 0 && (
          <>
            <div className="d-flex justify-content-between mb-1">
              <span>Duración total:</span>
              <span>{formatDuration(calculateDuration())}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-success fs-5">${calculateTotal().toLocaleString()}</span>
            </div>
          </>
        )}

        {/* Botones de navegación */}
        <div className="d-grid gap-2 mt-4">
          {currentStep > 1 && goToPreviousStep && (
            <Button
              variant="outline-secondary"
              onClick={goToPreviousStep}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-arrow-left me-2"></i> Atrás
            </Button>
          )}

          {currentStep < 4 && goToNextStep && (
            <Button
              variant="success"
              onClick={goToNextStep}
              className="d-flex align-items-center justify-content-center"
            >
              Continuar <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          )}

          {currentStep === 4 && handleSubmit && (
            <Button
              variant="success"
              onClick={handleSubmit}
              className="d-flex align-items-center justify-content-center"
            >
              Confirmar Cita <i className="bi bi-check-circle ms-2"></i>
            </Button>
          )}
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-0 pt-0">
        <div className="appointment-policies small text-muted">
          <p className="mb-1">Al confirmar, aceptas nuestras políticas de cancelación y términos de servicio.</p>
          <p className="mb-0">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Ver políticas de cancelación
            </a>
          </p>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default AppointmentSummary
