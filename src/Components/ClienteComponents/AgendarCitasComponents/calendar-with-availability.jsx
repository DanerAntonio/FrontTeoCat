"use client"
import { Calendar } from "react-calendar"
import { Badge } from "react-bootstrap"
import "react-calendar/dist/Calendar.css"

const CalendarWithAvailability = ({ selectedDate, setSelectedDate, unavailableDates = [], busyDates = [] }) => {
  // Función para deshabilitar fechas pasadas y domingos en el calendario
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      // Deshabilitar fechas pasadas
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // También deshabilitar domingos (0 = domingo)
      return date < today || date.getDay() === 0
    }
    return false
  }

  // Función para mostrar indicadores de disponibilidad en el calendario
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null

    // No mostrar indicadores en domingos
    if (date.getDay() === 0) return null

    // Verificar si la fecha está en la lista de fechas no disponibles
    const isUnavailable = unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getDate() === date.getDate() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getFullYear() === date.getFullYear(),
    )

    // Verificar si la fecha está en la lista de fechas con pocas citas disponibles
    const isBusy = busyDates.some(
      (busyDate) =>
        busyDate.getDate() === date.getDate() &&
        busyDate.getMonth() === date.getMonth() &&
        busyDate.getFullYear() === date.getFullYear(),
    )

    if (isUnavailable) {
      return (
        <Badge bg="danger" className="availability-badge">
          Lleno
        </Badge>
      )
    }

    if (isBusy) {
      return (
        <Badge bg="warning" text="dark" className="availability-badge">
          Pocas
        </Badge>
      )
    }

    return null
  }

  return (
    <div className="calendar-container mb-4 mb-md-0">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
        className="appointment-calendar"
      />
      <div className="calendar-legend mt-2">
        <div className="d-flex align-items-center justify-content-center gap-3">
          <div className="d-flex align-items-center">
            <div className="legend-color bg-success"></div>
            <span className="legend-text">Disponible</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-warning"></div>
            <span className="legend-text">Pocas citas</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-danger"></div>
            <span className="legend-text">Lleno</span>
          </div>
        </div>
      </div>
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

export default CalendarWithAvailability
