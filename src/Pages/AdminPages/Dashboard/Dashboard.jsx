"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import DashboardHeader from "../../../Components/AdminComponents/DashboardComponents/DashboardHeader"
import DashboardCharts from "../../../Components/AdminComponents/DashboardComponents/DashboardCharts"
import "./Dashboard.scss"

/**
 * Componente principal del Dashboard
 * Gestiona el estado global y coordina los componentes secundarios
 */
const Dashboard = () => {
  // Estados para filtros y datos
  const [selectedYear, setSelectedYear] = useState("2022")
  const [selectedMonth, setSelectedMonth] = useState("Todos los meses")
  const [isLoaded, setIsLoaded] = useState(false)

  // Datos de ventas mensuales
  const salesData = {
    2022: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      values: [120000, 150000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 360000, 380000],
    },
    2023: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      values: [140000, 170000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 380000, 400000],
    },
    2024: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      values: [160000, 190000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 400000, 420000],
    },
  }

  // Datos para los gráficos de productos más vendidos (solo top 3)
  const topProducts = [
    { name: "Comida Premium para Perros", value: 40.5, icon: "🐕" },
    { name: "Juguete Interactivo para Gatos", value: 32.4, icon: "🐈" },
    { name: "Cama Ortopédica para Perros", value: 27.1, icon: "🐕" },
  ]

  // Datos para los gráficos de productos menos vendidos (solo top 3)
  const leastSoldProducts = [
    { name: "Collar GPS para Gatos", value: 5.5, icon: "🐈" },
    { name: "Cepillo Eléctrico para Perros", value: 4.3, icon: "🐕" },
    { name: "Fuente de Agua para Mascotas", value: 3.2, icon: "💧" },
  ]

  // Obtener datos según selección
  const getCurrentData = () => {
    if (selectedMonth === "Todos los meses") {
      return salesData[selectedYear].labels.map((month, index) => ({
        name: month,
        value: salesData[selectedYear].values[index],
        icon: index % 2 === 0 ? "🐕" : "🐈",
      }))
    } else {
      const monthIndex = salesData[selectedYear].labels.indexOf(selectedMonth)
      return [
        {
          name: selectedMonth,
          value: salesData[selectedYear].values[monthIndex],
          icon: monthIndex % 2 === 0 ? "🐕" : "🐈",
        },
      ]
    }
  }

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Manejadores para cambios de filtros
  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
  }

  return (
    <div className="dashboard">
      {/* Fondo animado con efectos neón */}
      <div className="animated-background">
        <div className="light-beam light-beam-1"></div>
        <div className="light-beam light-beam-2"></div>
        <div className="light-beam light-beam-3"></div>
        <div className="floating-paws">
          <span className="paw paw-1">🐾</span>
          <span className="paw paw-2">🐾</span>
          <span className="paw paw-3">🐾</span>
          <span className="paw paw-4">🐾</span>
          <span className="paw paw-5">🐾</span>
          <span className="paw paw-6">🐾</span>
        </div>
      </div>

      {/* Encabezado del dashboard */}
      <motion.div
        className="dashboard-header-container"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="dashboard-title">
          <span className="title-icon">🏠</span>
          Dashboard
          <span className="title-glow"></span>
        </h1>
        <div className="date-display">
          <Calendar size={16} />
          <span>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </motion.div>

      {/* Componente de encabezado con filtros */}
      <DashboardHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        availableYears={Object.keys(salesData)}
        availableMonths={salesData[selectedYear].labels}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />

      {/* Componente de gráficos */}
      <DashboardCharts
        currentData={getCurrentData()}
        topProducts={topProducts}
        leastSoldProducts={leastSoldProducts}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        isLoaded={isLoaded}
      />
    </div>
  )
}

export default Dashboard

