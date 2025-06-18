"use client"

import { useState, useEffect } from "react"
import { Modal } from "react-bootstrap"
import { Search, Filter, ChevronDown, ChevronRight, Check } from "lucide-react"
import "../ProveedoresComponents/CatalogoModal.scss"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

const CatalogoModal = ({ show, onHide, onSelectProduct }) => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [mostrarVariantes, setMostrarVariantes] = useState({})
  const [filtroCategoriaAbierto, setFiltroCategoriaAbierto] = useState(false)
  const [filtroProveedorAbierto, setFiltroProveedorAbierto] = useState(false)

  // Cargar datos cuando se muestra el modal
  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        setLoading(true)
        try {
          // Cargar productos desde el servicio
          const productosData = await ProductosService.getActivosParaCompras()
          setProductos(productosData)

          // Extraer categorías únicas de los productos
          const categoriasUnicas = [...new Set(productosData.map((p) => p.Categoria?.NombreCategoria))]
            .filter(Boolean)
            .map((nombre, index) => ({ id: index + 1, nombre }))
          setCategorias(categoriasUnicas)

          // Extraer proveedores únicos de los productos
          const proveedoresUnicos = [...new Set(productosData.map((p) => p.Proveedor?.nombreEmpresa))]
            .filter(Boolean)
            .map((nombre, index) => ({ id: index + 1, nombre }))
          setProveedores(proveedoresUnicos)
        } catch (error) {
          console.error("Error al cargar productos:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [show])

  const toggleVariantes = (productoId) => {
    setMostrarVariantes((prev) => ({
      ...prev,
      [productoId]: !prev[productoId],
    }))
  }

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const filtrarProductos = () => {
    return productos.filter((producto) => {
      // Filtrar por búsqueda
      const coincideBusqueda =
        producto.NombreProducto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.CodigoBarras?.toLowerCase().includes(busqueda.toLowerCase())

      // Filtrar por categoría
      const coincideCategoria = categoriaSeleccionada
        ? producto.Categoria?.NombreCategoria === categorias.find((c) => c.id === categoriaSeleccionada)?.nombre
        : true

      // Filtrar por proveedor
      const coincideProveedor = proveedorSeleccionado
        ? producto.Proveedor?.nombreEmpresa === proveedores.find((p) => p.id === proveedorSeleccionado)?.nombre
        : true

      // Ocultar variantes a menos que se haya expandido el producto base
      const esVariante = producto.ProductoBase !== null && producto.ProductoBase !== undefined
      const mostrarSiEsVariante = esVariante ? mostrarVariantes[producto.ProductoBase] : true

      return coincideBusqueda && coincideCategoria && coincideProveedor && mostrarSiEsVariante
    })
  }

  const productosVisibles = filtrarProductos()
  const productosBase = productosVisibles.filter((p) => !p.ProductoBase)

  const handleSelectProducto = (producto) => {
    onSelectProduct(producto)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} className="catalogo-modal">
      <Modal.Header closeButton>
        <Modal.Title>Catálogo de Productos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="catalogo-header">
          <div className="filtros-container">
            <div className="buscador">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar productos por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="filtros">
              <div className="filtro-dropdown">
                <button className="filtro-btn" onClick={() => setFiltroCategoriaAbierto(!filtroCategoriaAbierto)}>
                  <Filter className="filtro-icon" />
                  <span>Categorías</span>
                  {filtroCategoriaAbierto ? <ChevronDown /> : <ChevronRight />}
                </button>

                {filtroCategoriaAbierto && (
                  <div className="dropdown-content">
                    <div
                      className={`dropdown-item ${categoriaSeleccionada === null ? "selected" : ""}`}
                      onClick={() => setCategoriaSeleccionada(null)}
                    >
                      <span>Todas las categorías</span>
                      {categoriaSeleccionada === null && <Check className="check-icon" />}
                    </div>
                    {categorias.map((categoria) => (
                      <div
                        key={categoria.id}
                        className={`dropdown-item ${categoriaSeleccionada === categoria.id ? "selected" : ""}`}
                        onClick={() => setCategoriaSeleccionada(categoria.id)}
                      >
                        <span>{categoria.nombre}</span>
                        {categoriaSeleccionada === categoria.id && <Check className="check-icon" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="filtro-dropdown">
                <button className="filtro-btn" onClick={() => setFiltroProveedorAbierto(!filtroProveedorAbierto)}>
                  <Filter className="filtro-icon" />
                  <span>Proveedores</span>
                  {filtroProveedorAbierto ? <ChevronDown /> : <ChevronRight />}
                </button>

                {filtroProveedorAbierto && (
                  <div className="dropdown-content">
                    <div
                      className={`dropdown-item ${proveedorSeleccionado === null ? "selected" : ""}`}
                      onClick={() => setProveedorSeleccionado(null)}
                    >
                      <span>Todos los proveedores</span>
                      {proveedorSeleccionado === null && <Check className="check-icon" />}
                    </div>
                    {proveedores.map((proveedor) => (
                      <div
                        key={proveedor.id}
                        className={`dropdown-item ${proveedorSeleccionado === proveedor.id ? "selected" : ""}`}
                        onClick={() => setProveedorSeleccionado(proveedor.id)}
                      >
                        <span>{proveedor.nombre}</span>
                        {proveedorSeleccionado === proveedor.id && <Check className="check-icon" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="catalogo-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : productosBase.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron productos que coincidan con los criterios de búsqueda.</p>
            </div>
          ) : (
            <div className="productos-lista">
              {productosBase.map((producto) => (
                <div key={producto.IdProducto} className="producto-container">
                  <div className="producto-item">
                    <div className="producto-info">
                      {productos.some((p) => p.ProductoBase === producto.IdProducto) && (
                        <button className="toggle-variantes" onClick={() => toggleVariantes(producto.IdProducto)}>
                          {mostrarVariantes[producto.IdProducto] ? <ChevronDown /> : <ChevronRight />}
                        </button>
                      )}
                      <div className="producto-detalles">
                        <span className="producto-nombre">{producto.NombreProducto}</span>
                        <div className="producto-meta">
                          <span className="producto-codigo">Código: {producto.CodigoBarras}</span>
                          <span className="producto-precio">Precio: ${formatNumber(producto.Precio)}</span>
                          <span className="producto-iva">IVA: {producto.PorcentajeIVA}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="producto-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleSelectProducto(producto)}>
                        Seleccionar
                      </button>
                    </div>
                  </div>

                  {/* Variantes del producto */}
                  {mostrarVariantes[producto.IdProducto] && (
                    <div className="variantes-container">
                      {productos
                        .filter((p) => p.ProductoBase === producto.IdProducto)
                        .map((variante) => (
                          <div key={variante.IdProducto} className="producto-item variante">
                            <div className="producto-info">
                              <div className="variante-indicator">
                                <span className="variante-label">Variante</span>
                              </div>
                              <div className="producto-detalles">
                                <span className="producto-nombre">{variante.NombreProducto}</span>
                                <div className="producto-meta">
                                  <span className="producto-codigo">Código: {variante.CodigoBarras}</span>
                                  <span className="producto-precio">Precio: ${formatNumber(variante.Precio)}</span>
                                  <span className="producto-iva">IVA: {variante.PorcentajeIVA}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="producto-actions">
                              <button className="btn btn-sm btn-primary" onClick={() => handleSelectProducto(variante)}>
                                Seleccionar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default CatalogoModal
