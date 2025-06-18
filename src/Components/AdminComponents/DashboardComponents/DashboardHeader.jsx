"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Calendar, Filter } from "lucide-react"

/**
 * Componente para el encabezado del dashboard con filtros
 */
const DashboardHeader = ({
  selectedYear,
  selectedMonth,
  availableYears,
  availableMonths,
  onYearChange,
  onMonthChange,
}) => {
  // Estados para controlar la visibilidad de los dropdowns
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".year-selector") && !event.target.closest(".year-dropdown")) {
        setShowYearDropdown(false)
      }
      if (!event.target.closest(".month-selector") && !event.target.closest(".month-dropdown")) {
        setShowMonthDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <motion.div
      className="dashboard-filters"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="filters-container">
        <div className="filter-group">
          <div className="filter-label">
            <Filter size={18} className="filter-icon" />
            <span>Filtros</span>
          </div>

          <div className="filter-controls">
            {/* Selector de año */}
            <div className="filter-item">
              <div className="filter-selector year-selector" onClick={() => setShowYearDropdown(!showYearDropdown)}>
                <Calendar size={14} className="selector-icon" />
                <span>{selectedYear}</span>
                <ChevronDown size={14} />
              </div>

              {showYearDropdown && (
                <motion.div
                  className="filter-dropdown year-dropdown"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {availableYears.map((year) => (
                    <div
                      key={year}
                      className={`dropdown-item ${year === selectedYear ? "active" : ""}`}
                      onClick={() => {
                        onYearChange(year)
                        setShowYearDropdown(false)
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Selector de mes */}
            <div className="filter-item">
              <div className="filter-selector month-selector" onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
                <span>{selectedMonth}</span>
                <ChevronDown size={14} />
              </div>

              {showMonthDropdown && (
                <motion.div
                  className="filter-dropdown month-dropdown"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`dropdown-item ${selectedMonth === "Todos los meses" ? "active" : ""}`}
                    onClick={() => {
                      onMonthChange("Todos los meses")
                      setShowMonthDropdown(false)
                    }}
                  >
                    Todos los meses
                  </div>
                  {availableMonths.map((month, index) => (
                    <div
                      key={index}
                      className={`dropdown-item ${month === selectedMonth ? "active" : ""}`}
                      onClick={() => {
                        onMonthChange(month)
                        setShowMonthDropdown(false)
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardHeader

