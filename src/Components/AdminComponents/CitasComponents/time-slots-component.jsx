"use client"

import { AlertCircle } from "lucide-react"
import { Alert } from "react-bootstrap"

export const TimeSlotsComponent = ({
  timeSlots,
  selectedTimeSlot,
  onTimeSelect,
  selectedDate,
  citasAgendadas,
  onNextDayRequest,
  onCitaClick,
  use24HourFormat = true,
}) => {
  // Función para formatear la hora según el formato seleccionado
  const formatHour = (hora, use24HourFormat) => {
    if (use24HourFormat) {
      return `${hora} hrs`
    } else {
      const [h, m] = hora.split(":").map(Number)
      const period = h >= 12 ? "PM" : "AM"
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${hour12}:${m.toString().padStart(2, "0")} ${period}`
    }
  }

  // Verificar si hay horarios ocupados
  const getOcupados = (hora) => {
    return citasAgendadas.filter((cita) => {
      const citaDate = new Date(cita.fecha)
      const selectedDateStr = selectedDate.toISOString().split("T")[0]
      return citaDate.toISOString().split("T")[0] === selectedDateStr && cita.hora === hora
    })
  }

  // Verificar si es hora de almuerzo (13:00 - 14:00)
  const isLunchTime = (hora) => {
    const [h] = hora.split(":").map(Number)
    return h === 13
  }

  return (
    <div className="time-slots-container">
      {timeSlots.length > 0 ? (
        <div className="time-slots-grid">
          {timeSlots.map((hora) => {
            const ocupados = getOcupados(hora)
            const isOcupado = ocupados.length > 0
            const lunchTime = isLunchTime(hora)

            return (
              <div
                key={hora}
                className={`time-slot ${selectedTimeSlot === hora ? "selected" : ""} 
                           ${isOcupado ? "ocupado" : ""} ${lunchTime ? "lunch-time" : ""}`}
                onClick={() => {
                  if (!isOcupado && !lunchTime) {
                    onTimeSelect(hora)
                  } else if (isOcupado) {
                    // Mostrar detalles de la cita ocupada si se hace clic
                    onCitaClick(ocupados[0])
                  }
                }}
              >
                {formatHour(hora, use24HourFormat)}
                {isOcupado && <div className="ocupado-badge">Ocupado</div>}
                {lunchTime && <div className="lunch-badge">Almuerzo</div>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="no-slots-available">
          <Alert variant="warning" className="d-flex align-items-center py-2">
            <AlertCircle size={16} className="me-2" />
            <div className="small">No hay horarios disponibles para esta fecha.</div>
          </Alert>
          <button className="btn btn-sm btn-outline-primary mt-2" onClick={onNextDayRequest}>
            Ver día siguiente
          </button>
        </div>
      )}
    </div>
  )
}
