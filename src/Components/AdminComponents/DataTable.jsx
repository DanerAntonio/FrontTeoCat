"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Download, FileText, Plus } from "lucide-react"
import "./DataTable.scss"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const DataTable = ({
  columns,
  data,
  itemsPerPage = 5,
  addButtonLabel = "Agregar",
  showAddButton = true,
  showExportButton = true,
  onAdd,
  onExportExcel,
  onExportPdf,
  searchPlaceholder = "Buscar...",
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState({ excel: false, pdf: false })
  const tableRef = useRef(null)
  const excelBtnRef = useRef(null)
  const pdfBtnRef = useRef(null)

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)

    if (!term) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter((item) => {
      return Object.values(item).join(" ").toLowerCase().includes(term.toLowerCase())
    })

    setFilteredData(filtered)
  }

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Función para crear partículas de datos
  const createDataParticles = (targetRef, type) => {
    if (!tableRef.current || !targetRef.current) return

    const tableRect = tableRef.current.getBoundingClientRect()
    const buttonRect = targetRef.current.getBoundingClientRect()

    // Punto central del botón
    const targetX = buttonRect.left + buttonRect.width / 2 - tableRect.left
    const targetY = buttonRect.top + buttonRect.height / 2 - tableRect.top

    // Crear 20 partículas
    for (let i = 0; i < 20; i++) {
      // Posición aleatoria en la tabla
      const startX = Math.random() * tableRect.width
      const startY = Math.random() * tableRect.height

      // Crear elemento de partícula
      const particle = document.createElement("div")
      particle.className = `data-particle ${type}`
      particle.style.left = `${startX}px`
      particle.style.top = `${startY}px`

      // Calcular la dirección hacia el botón
      const tx = targetX - startX
      const ty = targetY - startY

      // Establecer variables CSS personalizadas para la animación
      particle.style.setProperty("--tx", `${tx}px`)
      particle.style.setProperty("--ty", `${ty}px`)

      // Añadir la partícula al contenedor de la tabla
      tableRef.current.appendChild(particle)

      // Animar la partícula
      particle.style.animation = `float-to-button ${0.5 + Math.random() * 0.5}s forwards`

      // Eliminar la partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode === tableRef.current) {
          tableRef.current.removeChild(particle)
        }
      }, 1000)
    }
  }

  // Función interna para exportar a Excel
  const exportToExcel = () => {
    try {
      // Preparar los datos para Excel (excluyendo columnas de acciones)
      const exportData = filteredData.map((item) => {
        const rowData = {}
        columns.forEach((column) => {
          // Excluir columnas de acciones o columnas sin field
          if (column.field && column.field !== "acciones") {
            rowData[column.header || column.field] = item[column.field]
          }
        })
        return rowData
      })

      // Crear una hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Crear un libro de trabajo
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

      // Generar el archivo y descargarlo
      XLSX.writeFile(workbook, "datos_exportados.xlsx")

      console.log("Excel exportado correctamente")
      return true
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      return false
    }
  }

  // Función interna para exportar a PDF
  const exportToPdf = () => {
    try {
      // Crear un nuevo documento PDF
      const doc = new jsPDF()

      // Preparar los encabezados de la tabla (excluyendo columnas de acciones)
      const tableColumn = columns
        .filter((column) => column.field && column.field !== "acciones")
        .map((column) => column.header || column.field)

      // Preparar los datos para la tabla
      const tableRows = filteredData.map((item) => {
        return columns
          .filter((column) => column.field && column.field !== "acciones")
          .map((column) => item[column.field])
      })

      // Añadir la tabla al documento
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 66, 66],
        },
      })

      // Añadir título
      doc.text("Datos Exportados", 14, 15)

      // Guardar el documento
      doc.save("datos_exportados.pdf")

      console.log("PDF exportado correctamente")
      return true
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
      return false
    }
  }

  // Manejador para exportar a Excel (por defecto)
  const handleExportExcel = () => {
    if (excelBtnRef.current) {
      setIsExporting({ excel: true, pdf: false })

      // Animar filas
      const rows = document.querySelectorAll(".data-table tbody tr:not(.loading-row):not(.empty-row)")
      rows.forEach((row, index) => {
        setTimeout(() => {
          row.classList.add("extracting")
        }, index * 50)
      })

      // Crear partículas
      setTimeout(() => {
        createDataParticles(excelBtnRef, "excel")
      }, 300)

      // Ejecutar la función real después de la animación
      setTimeout(() => {
        let success = false

        if (onExportExcel) {
          success = onExportExcel()
        } else {
          success = exportToExcel()
        }

        // Restaurar el estado
        setIsExporting({ excel: false, pdf: false })
        rows.forEach((row) => row.classList.remove("extracting"))

        if (!success) {
          alert("Hubo un problema al exportar a Excel. Verifica la consola para más detalles.")
        }
      }, 1000)
    }
  }

  // Manejador para exportar a PDF
  const handleExportPdf = () => {
    if (pdfBtnRef.current) {
      setIsExporting({ excel: false, pdf: true })

      // Animar filas
      const rows = document.querySelectorAll(".data-table tbody tr:not(.loading-row):not(.empty-row)")
      rows.forEach((row, index) => {
        setTimeout(() => {
          row.classList.add("extracting")
        }, index * 50)
      })

      // Crear partículas
      setTimeout(() => {
        createDataParticles(pdfBtnRef, "pdf")
      }, 300)

      // Ejecutar la función real después de la animación
      setTimeout(() => {
        let success = false

        if (onExportPdf) {
          success = onExportPdf()
        } else {
          success = exportToPdf()
        }

        // Restaurar el estado
        setIsExporting({ excel: false, pdf: false })
        rows.forEach((row) => row.classList.remove("extracting"))

        if (!success) {
          alert("Hubo un problema al exportar a PDF. Verifica la consola para más detalles.")
        }
      }, 1000)
    }
  }

  // Generar elementos de paginación
  const renderPaginationItems = () => {
    const items = []

    // Primera página
    if (currentPage > 2) {
      items.push(
        <li key="first" className={`page-item ${currentPage === 1 ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>,
      )
    }

    // Ellipsis después de la primera página
    if (currentPage > 3) {
      items.push(
        <li key="ellipsis-start" className="page-item disabled">
          <span className="page-link">...</span>
        </li>,
      )
    }

    // Páginas alrededor de la página actual
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      items.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>,
      )
    }

    // Ellipsis antes de la última página
    if (currentPage < totalPages - 2) {
      items.push(
        <li key="ellipsis-end" className="page-item disabled">
          <span className="page-link">...</span>
        </li>,
      )
    }

    // Última página (si hay más de una página y no es la actual)
    if (totalPages > 1 && currentPage < totalPages - 1) {
      items.push(
        <li key="last" className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </button>
        </li>,
      )
    }

    return items
  }

  return (
    <div className="data-table-container">
      <div className="data-table-body">
        {/* Barra de herramientas integrada */}
        <div className="data-table-toolbar">
          <div className="data-table-row">
            <div className={`data-table-search ${showAddButton || showExportButton ? "with-actions" : ""}`}>
              <div className="search-input-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <span className="search-icon">
                  <Search size={18} />
                </span>
              </div>
            </div>

            {(showAddButton || showExportButton) && (
              <div className="data-table-actions">
                <div className="actions-container">
                  {showAddButton && (
                    <button className="btn-add" onClick={onAdd}>
                      <Plus size={18} />
                      <span>{addButtonLabel}</span>
                    </button>
                  )}

                  {showExportButton && (
                    <div className="export-buttons">
                      <button
                        ref={excelBtnRef}
                        className={`btn-export btn-excel ${isExporting.excel ? "downloading" : ""}`}
                        onClick={handleExportExcel}
                        title="Exportar a Excel"
                        disabled={isExporting.excel || isExporting.pdf}
                      >
                        <Download size={18} />
                        <span className="export-text">Excel</span>
                      </button>
                      <button
                        ref={pdfBtnRef}
                        className={`btn-export btn-pdf ${isExporting.pdf ? "downloading" : ""}`}
                        onClick={handleExportPdf}
                        title="Exportar a PDF"
                        disabled={isExporting.excel || isExporting.pdf}
                      >
                        <FileText size={18} />
                        <span className="export-text">PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="data-table-wrapper" ref={tableRef}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`${column.className || ""} ${column.field === "acciones" ? "actions-column" : ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={columns.length}>
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <p>Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={columns.length}>
                    <p>No se encontraron registros</p>
                  </td>
                </tr>
              ) : (
                currentData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`${column.className || ""} ${column.field === "acciones" ? "actions-column" : ""}`}
                      >
                        {column.render ? column.render(row) : row[column.field]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="data-table-pagination">
            <div className="pagination-container">
              <div className="pagination-info">
                Mostrando {filteredData.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredData.length)} de{" "}
                {filteredData.length} registros
              </div>

              <nav className="pagination-nav">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-label="Anterior"
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>

                  {renderPaginationItems()}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-label="Siguiente"
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable
