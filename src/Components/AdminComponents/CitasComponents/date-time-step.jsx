"use client"

import { useState } from "react"
import { AlertCircle, Calendar, Clock } from "lucide-react"
import { Button, Alert, Form } from "react-bootstrap"
import { CalendarComponent } from "./calendar-component"
import { TimeSlotsComponent } from "./time-slots-component"

export const DateTimeStep = ({
  selectedDate,
  setSelectedDate,
  timeSlots,
  selectedTimeSlot,
  setSelectedTimeSlot,
  formData,
  formErrors,
  citasAgendadas,
  onNext,
  onCancel,
  use24HourFormat,
  onToggleTimeFormat,
}) => {
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Verificar si es domingo (no disponible)
  const isSunday = selectedDate.getDay() === 0

  // Actualizar alerta si es domingo
  if (isSunday && !showAlert) {
    setShowAlert(true)
    setAlertMessage("Los domingos no hay atención. Por favor, seleccione otro día.")
  } else if (
    !isSunday &&
    showAlert &&
    alertMessage === "Los domingos no hay atención. Por favor, seleccione otro día."
  ) {
    setShowAlert(false)
    setAlertMessage("")
  }

  // Verificar si no hay horarios disponibles
  if (timeSlots.length === 0 && !isSunday && !showAlert) {
    setShowAlert(true)
    setAlertMessage("No hay horarios disponibles para esta fecha. Por favor, seleccione otro día.")
  } else if (
    timeSlots.length > 0 &&
    showAlert &&
    alertMessage === "No hay horarios disponibles para esta fecha. Por favor, seleccione otro día."
  ) {
    setShowAlert(false)
    setAlertMessage("")
  }

  // Manejador para ir al día siguiente
  const handleNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Si el siguiente día es domingo, avanzar un día más
    if (nextDay.getDay() === 0) {
      nextDay.setDate(nextDay.getDate() + 1)
    }

    setSelectedDate(nextDay)
  }

  // Formatear fecha para mostrar
  const formatSelectedDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
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

  return (
    <div className="step-container">
      <div className="step-number">
        <span>1</span>
      </div>
      <h3 className="step-title">Selecciona Fecha y Hora</h3>

      <div className="fecha-hora-container">
        {showAlert && (
          <Alert variant="warning" className="d-flex align-items-center mb-3 py-2">
            <AlertCircle size={16} className="me-2" />
            <div className="small">{alertMessage}</div>
          </Alert>
        )}

        <div className="appointment-layout">
          <div className="calendar-section">
            <h5 className="section-title">
              <Calendar size={18} className="me-2" />
              Calendario
            </h5>
            <div className="calendar-container">
              <CalendarComponent
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                citasAgendadas={citasAgendadas}
              />
            </div>
          </div>

          <div className="time-section">
            <div className="time-header">
              <h5 className="section-title">
                <Clock size={18} className="me-2" />
                Horarios Disponibles:
              </h5>
              <Form.Check
                type="switch"
                id="time-format-switch"
                label={use24HourFormat ? "Formato 24h" : "Formato 12h"}
                checked={use24HourFormat}
                onChange={onToggleTimeFormat}
                className="time-format-toggle"
              />
            </div>

            <TimeSlotsComponent
              timeSlots={timeSlots}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSelect={setSelectedTimeSlot}
              selectedDate={selectedDate}
              citasAgendadas={citasAgendadas}
              onNextDayRequest={handleNextDay}
              onCitaClick={() => {}}
              use24HourFormat={use24HourFormat}
            />

            <div className="selected-date-time mt-4">
              <h5 className="section-title">Fecha y Hora Seleccionada:</h5>
              <div className="selected-date-badge">
                <Calendar size={16} className="me-2" />
                {formatSelectedDate(selectedDate)}
                {selectedTimeSlot && (
                  <>
                    <Clock size={16} className="ms-3 me-1" />
                    {selectedTimeSlot} {use24HourFormat ? "hrs" : ""}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {formErrors.fecha && <div className="text-danger mt-2 small">{formErrors.fecha}</div>}
      {formErrors.hora && <div className="text-danger mt-2 small">{formErrors.hora}</div>}

      <div className="step-actions mt-4">
        <Button variant="outline-secondary" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={onNext} disabled={!selectedTimeSlot}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
