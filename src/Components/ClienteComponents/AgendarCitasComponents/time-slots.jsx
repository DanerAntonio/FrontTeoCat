"use client"
import { Button, Row, Col } from "react-bootstrap"

const TimeSlots = ({
  availableTimes,
  selectedTime,
  setSelectedTime,
  unavailableTimes = [],
  use24HourFormat = true,
}) => {
  // Convertir hora de formato 24h a 12h
  const formatTime = (time) => {
    if (use24HourFormat) return `${time} hrs`

    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour, 10)
    const period = hourNum >= 12 ? "PM" : "AM"
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12
    return `${hour12}:${minute} ${period}`
  }

  // Crear array de slots con información de disponibilidad
  const timeSlots = availableTimes.map((time) => ({
    time,
    available: !unavailableTimes.includes(time),
  }))

  // Filtrar slots para excluir la hora de almuerzo (13:00 - 14:00)
  const filteredTimeSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0], 10)
    return hour < 13 || hour >= 14
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Horarios Disponibles:</h6>
        {/* Eliminado el control de formato de hora de aquí */}
      </div>

      <div className="time-slots-container">
        <Row className="g-2">
          {filteredTimeSlots.map((slot) => (
            <Col xs={4} key={slot.time}>
              <Button
                variant={selectedTime === slot.time ? "success" : "outline-secondary"}
                className={`time-slot-btn w-100 ${!slot.available ? "disabled" : ""}`}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                style={{ height: "38px" }} // Asegurar altura uniforme
              >
                {formatTime(slot.time)}
                {!slot.available && <i className="bi bi-lock-fill ms-1 small"></i>}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {filteredTimeSlots.length === 0 && (
        <div className="text-center py-3">
          <p className="text-muted mb-0">No hay horarios disponibles para esta fecha.</p>
        </div>
      )}
    </div>
  )
}

const validarFechaHora = (formData) => {
  const errores = {}
  if (!formData.fecha) {
    errores.fecha = "Debe seleccionar una fecha."
  }
  if (!formData.hora) {
    errores.hora = "Debe seleccionar una hora."
  }
  // Validar que la fecha/hora no sea pasada
  const ahora = new Date()
  const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
  if (fechaHora < ahora) {
    errores.hora = "No puede agendar una cita en el pasado."
  }
  return errores
}

export default TimeSlots
