"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "react-bootstrap"

export const CalendarComponent = ({ selectedDate, onDateSelect, citasAgendadas }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  // Generar días del calendario cuando cambia el mes
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1)
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // Calcular días del mes anterior para completar la primera semana
    // En España y muchos países de Latinoamérica la semana comienza el lunes (1) no el domingo (0)
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // Fecha de inicio del calendario (puede ser del mes anterior)
    const startDate = new Date(year, month, 1 - daysFromPrevMonth)

    // Generar array de 42 días (6 semanas)
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      // Verificar si es del mes actual
      const isCurrentMonth = date.getMonth() === month

      // Verificar si es hoy
      const today = new Date()
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      // Verificar si es pasado
      const isPast = date < new Date(today.setHours(0, 0, 0, 0))

      // Verificar si es domingo
      const isSunday = date.getDay() === 0

      // Contar citas para este día
      const citasCount = citasAgendadas.filter((cita) => {
        const citaDate = new Date(cita.fecha)
        return (
          citaDate.getDate() === date.getDate() &&
          citaDate.getMonth() === date.getMonth() &&
          citaDate.getFullYear() === date.getFullYear()
        )
      }).length

      // Determinar el estado de disponibilidad
      let disponibilidad = "disponible"
      if (citasCount > 0 && citasCount < 3) {
        disponibilidad = "pocas"
      } else if (citasCount >= 3) {
        disponibilidad = "lleno"
      }

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSunday,
        citasCount,
        disponibilidad,
      })
    }

    setCalendarDays(days)
  }, [currentMonth, citasAgendadas])

  // Ir al mes anterior
  const prevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  // Ir al mes siguiente
  const nextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  // Ir al año anterior
  const prevYear = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setFullYear(newMonth.getFullYear() - 1)
    setCurrentMonth(newMonth)
  }

  // Ir al año siguiente
  const nextYear = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setFullYear(newMonth.getFullYear() + 1)
    setCurrentMonth(newMonth)
  }

  // Formatear nombre del mes
  const formatMonth = (date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  // Verificar si una fecha es igual a la seleccionada
  const isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Nombres de los días de la semana en español
  const weekDays = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"]

  // Agrupar los días en semanas para renderizar
  const weeks = []
  for (let i = 0; i < 6; i++) {
    weeks.push(calendarDays.slice(i * 7, (i + 1) * 7))
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <div className="calendar-nav">
          <Button variant="light" size="sm" onClick={prevYear} className="calendar-nav-btn">
            <ChevronsLeft size={16} />
          </Button>
          <Button variant="light" size="sm" onClick={prevMonth} className="calendar-nav-btn">
            <ChevronLeft size={16} />
          </Button>
        </div>
        <h4 className="text-capitalize">{formatMonth(currentMonth)}</h4>
        <div className="calendar-nav">
          <Button variant="light" size="sm" onClick={nextMonth} className="calendar-nav-btn">
            <ChevronRight size={16} />
          </Button>
          <Button variant="light" size="sm" onClick={nextYear} className="calendar-nav-btn">
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>

      <table className="calendar-table">
        <thead>
          <tr>
            {weekDays.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((dayObj, dayIndex) => (
                <td
                  key={dayIndex}
                  className={`
                    ${!dayObj.isCurrentMonth ? "other-month" : ""} 
                    ${dayObj.isToday ? "today" : ""} 
                    ${dayObj.isPast ? "past" : ""} 
                    ${dayObj.isSunday ? "sunday" : ""} 
                    ${isSameDate(dayObj.date, selectedDate) ? "selected" : ""}
                    ${dayObj.disponibilidad}
                  `}
                  onClick={() => {
                    if (!dayObj.isPast && !dayObj.isSunday && dayObj.isCurrentMonth) {
                      onDateSelect(dayObj.date)
                    }
                  }}
                >
                  <div className="day-content">
                    <span className="day-number">{dayObj.day}</span>
                    {dayObj.citasCount > 0 && dayObj.isCurrentMonth && (
                      <span className={`day-status ${dayObj.disponibilidad}`}></span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot disponible"></span>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot pocas"></span>
          <span>Pocas citas</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot lleno"></span>
          <span>Lleno</span>
        </div>
      </div>
    </div>
  )
}
