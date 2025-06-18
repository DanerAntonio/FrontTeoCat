"use client"

import { memo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

/**
 * Componente para los gráficos del dashboard
 * Utiliza memo para evitar renderizados innecesarios
 */
const DashboardCharts = memo(
  ({ currentData, topProducts, leastSoldProducts, selectedYear, selectedMonth, isLoaded }) => {
    const isSingleMonth = currentData.length === 1
    const [animationActive, setAnimationActive] = useState(false)

    // Activar animaciones después de que los componentes estén montados
    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimationActive(true)
      }, 500)
      return () => clearTimeout(timer)
    }, [])

    // Renderizado para los puntos de datos con iconos de mascotas animados
    const CustomizedDot = (props) => {
      const { cx, cy, payload, index } = props
      const delay = index * 0.1

      return (
        <g className="animated-dot">
          <motion.text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="#333"
            fontSize="16px"
            initial={{ opacity: 0, y: 10 }}
            animate={
              animationActive
                ? {
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: delay,
              scale: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 2,
                delay: index * 0.2,
              },
            }}
            className="pet-icon"
          >
            {payload.icon}
          </motion.text>
          <circle cx={cx} cy={cy} r={4} fill="#00BFFF" stroke="#fff" strokeWidth={2} className="dot-pulse" />
        </g>
      )
    }

    const CustomizedDotTop = (props) => {
      const { cx, cy, payload, index } = props
      const delay = index * 0.1

      return (
        <g className="animated-dot">
          <motion.text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fill="#333"
            fontSize="14px"
            initial={{ opacity: 0, x: -10 }}
            animate={
              animationActive
                ? {
                    opacity: 1,
                    x: 0,
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: delay,
              scale: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 2,
                delay: index * 0.2,
              },
            }}
            className="pet-icon-top"
          >
            {payload.icon}
          </motion.text>
          <circle cx={cx} cy={cy} r={3} fill="#FF00FF" stroke="#fff" strokeWidth={1} className="dot-pulse-pink" />
        </g>
      )
    }

    const CustomizedDotLeast = (props) => {
      const { cx, cy, payload, index } = props
      const delay = index * 0.1

      return (
        <g className="animated-dot">
          <motion.text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fill="#333"
            fontSize="14px"
            initial={{ opacity: 0, x: -10 }}
            animate={
              animationActive
                ? {
                    opacity: 1,
                    x: 0,
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: delay,
              scale: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 2,
                delay: index * 0.2,
              },
            }}
            className="pet-icon-least"
          >
            {payload.icon}
          </motion.text>
          <circle cx={cx} cy={cy} r={3} fill="#00FF00" stroke="#fff" strokeWidth={1} className="dot-pulse-green" />
        </g>
      )
    }

    // Renderizado personalizado para barras con iconos
    const CustomizedBar = (props) => {
      const { x, y, width, height, payload, index } = props
      const delay = index * 0.2

      return (
        <g>
          <motion.rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="#00BFFF"
            rx={4}
            ry={4}
            initial={{ width: 0 }}
            animate={{ width: width }}
            transition={{ duration: 0.8, delay: delay }}
            className="neon-bar"
          />
          <motion.text
            x={x + width + 10}
            y={y + height / 2 + 5}
            textAnchor="start"
            fill="#333"
            fontSize="16px"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
            className="bar-icon"
          >
            {payload.icon}
          </motion.text>
        </g>
      )
    }

    // Animaciones para los elementos
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
        },
      },
    }

    const itemVariants = {
      hidden: { y: 10, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 50,
          damping: 10,
        },
      },
    }

    // Tooltip personalizado con estilo neón
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip">
            <p className="tooltip-label">{label}</p>
            <p className="tooltip-value">
              ${payload[0].value.toLocaleString()}
              <span className="tooltip-icon">{payload[0].payload.icon}</span>
            </p>
          </div>
        )
      }

      return null
    }

    return (
      <motion.div
        className="dashboard-charts"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Gráfico de Ventas (Principal) */}
        <motion.div className="chart-card main-chart" variants={itemVariants}>
          <div className="chart-header">
            <div className="chart-title">
              <div className="title-with-icon">
                <div className="icon-container">
                  <DollarSign className="chart-icon" />
                  <span className="icon-badge">🐾</span>
                </div>
                <h2>Ventas de Productos para Mascotas</h2>
              </div>
              <p className="chart-subtitle">
                {`Ventas ${selectedYear}${selectedMonth !== "Todos los meses" ? ` - ${selectedMonth}` : ""}`}
              </p>
            </div>
            <div className="chart-value">
              <span className="value">${currentData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
              <span className="label">Total</span>
            </div>
          </div>

          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              {isSingleMonth ? (
                // Gráfico de barras para un solo mes
                <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#00BFFF" shape={<CustomizedBar />} />
                </BarChart>
              ) : (
                // Gráfico de líneas para múltiples meses
                <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00BFFF"
                    strokeWidth={3}
                    dot={<CustomizedDot />}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#00BFFF" }}
                    className="neon-line"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="secondary-charts">
          {/* Gráfico de Productos Más Vendidos */}
          <motion.div className="chart-card top-products-chart" variants={itemVariants}>
            <div className="chart-header">
              <div className="chart-title">
                <div className="title-with-icon">
                  <div className="icon-container">
                    <TrendingUp className="chart-icon" />
                    <span className="icon-badge">🐕</span>
                  </div>
                  <h2>Top 3 Productos Más Vendidos</h2>
                </div>
                <p className="chart-subtitle">Top productos para mascotas</p>
              </div>
            </div>

            <div className="chart-content">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    domain={[0, "dataMax + 10"]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    width={150}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Porcentaje"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 0, 255, 0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)",
                      border: "1px solid rgba(255, 0, 255, 0.3)",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF00FF"
                    strokeWidth={2}
                    dot={<CustomizedDotTop />}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#FF00FF" }}
                    layout="vertical"
                    className="neon-line-pink"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Gráfico de Productos Menos Vendidos */}
          <motion.div className="chart-card least-products-chart" variants={itemVariants}>
            <div className="chart-header">
              <div className="chart-title">
                <div className="title-with-icon">
                  <div className="icon-container">
                    <TrendingDown className="chart-icon" />
                    <span className="icon-badge">🐈</span>
                  </div>
                  <h2>Top 3 Productos Menos Vendidos</h2>
                </div>
                <p className="chart-subtitle">Productos con menor demanda</p>
              </div>
            </div>

            <div className="chart-content">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={leastSoldProducts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    domain={[0, "dataMax + 2"]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    width={150}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Porcentaje"]}
                    contentStyle={{
                      backgroundColor: "rgba(0, 255, 0, 0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 0 15px rgba(0, 255, 0, 0.3)",
                      border: "1px solid rgba(0, 255, 0, 0.3)",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00FF00"
                    strokeWidth={2}
                    dot={<CustomizedDotLeast />}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#00FF00" }}
                    layout="vertical"
                    className="neon-line-green"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  },
)

DashboardCharts.displayName = "DashboardCharts"

export default DashboardCharts

