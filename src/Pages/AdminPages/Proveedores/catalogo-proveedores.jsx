"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ChevronDown, ChevronRight, Check } from "lucide-react"
import "../../AdminPages/Proveedores/catalogo-proveedores.scss"

export default function CatalogoProveedores() {
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

  // Simular carga de datos
  useEffect(() => {
    // Datos de ejemplo
    const categoriasEjemplo = [
      { id: 1, nombre: "Alimentos para Mascotas" },
      { id: 2, nombre: "Accesorios para Mascotas" },
      { id: 3, nombre: "Medicamentos Veterinarios" },
      { id: 4, nombre: "Higiene y Cuidado" },
    ]

    const proveedoresEjemplo = [
      { id: 1, nombre: "PetNutrition Co." },
      { id: 2, nombre: "VetSupplies Inc." },
      { id: 3, nombre: "Animal Care Products" },
      { id: 4, nombre: "Mascota Premium" },
    ]

    const productosEjemplo = [
      {
        id: 1,
        nombre: "Comida premium para perros",
        esVariante: false,
        seleccionado: false,
        proveedor: "PetNutrition Co.",
        categoria: "Alimentos para Mascotas",
      },
      {
        id: 2,
        nombre: "Comida premium para perros - sabor pollo",
        esVariante: true,
        productoBaseId: 1,
        seleccionado: false,
        proveedor: "PetNutrition Co.",
        categoria: "Alimentos para Mascotas",
      },
      {
        id: 3,
        nombre: "Comida premium para perros - sabor carne",
        esVariante: true,
        productoBaseId: 1,
        seleccionado: false,
        proveedor: "PetNutrition Co.",
        categoria: "Alimentos para Mascotas",
      },
      {
        id: 4,
        nombre: "Comida premium para gatos",
        esVariante: false,
        seleccionado: false,
        proveedor: "Mascota Premium",
        categoria: "Alimentos para Mascotas",
      },
      {
        id: 5,
        nombre: "Collar para perros talla S",
        esVariante: false,
        seleccionado: false,
        proveedor: "Animal Care Products",
        categoria: "Accesorios para Mascotas",
      },
      {
        id: 6,
        nombre: "Collar para perros talla M",
        esVariante: true,
        productoBaseId: 5,
        seleccionado: false,
        proveedor: "Animal Care Products",
        categoria: "Accesorios para Mascotas",
      },
      {
        id: 7,
        nombre: "Antiparasitario canino",
        esVariante: false,
        seleccionado: false,
        proveedor: "VetSupplies Inc.",
        categoria: "Medicamentos Veterinarios",
      },
      {
        id: 8,
        nombre: "Champú hipoalergénico",
        esVariante: false,
        seleccionado: false,
        proveedor: "VetSupplies Inc.",
        categoria: "Higiene y Cuidado",
      },
    ]

    setCategorias(categoriasEjemplo)
    setProveedores(proveedoresEjemplo)
    setProductos(productosEjemplo)
    setLoading(false)
  }, [])

  const toggleVariantes = (productoId) => {
    setMostrarVariantes((prev) => ({
      ...prev,
      [productoId]: !prev[productoId],
    }))
  }

  const toggleSeleccion = (productoId) => {
    setProductos(
      productos.map((producto) =>
        producto.id === productoId ? { ...producto, seleccionado: !producto.seleccionado } : producto,
      ),
    )
  }

  const filtrarProductos = () => {
    return productos.filter((producto) => {
      // Filtrar por búsqueda
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())

      // Filtrar por categoría
      const coincideCategoria = categoriaSeleccionada
        ? producto.categoria === categorias.find((c) => c.id === categoriaSeleccionada)?.nombre
        : true

      // Filtrar por proveedor
      const coincideProveedor = proveedorSeleccionado
        ? producto.proveedor === proveedores.find((p) => p.id === proveedorSeleccionado)?.nombre
        : true

      // Ocultar variantes a menos que se haya expandido el producto base
      const mostrarSiEsVariante = producto.esVariante ? mostrarVariantes[producto.productoBaseId || 0] : true

      return coincideBusqueda && coincideCategoria && coincideProveedor && mostrarSiEsVariante
    })
  }

  const productosVisibles = filtrarProductos()
  const productosBase = productosVisibles.filter((p) => !p.esVariante)

  return (
    <div className="catalogo-proveedores">
      <div className="catalogo-header">
        <h1>Catálogo de Proveedores</h1>
        <div className="filtros-container">
          <div className="buscador">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar productos..."
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
              <div key={producto.id} className="producto-container">
                <div className="producto-item">
                  <div className="producto-info">
                    {!producto.esVariante &&
                      productos.some((p) => p.esVariante && p.productoBaseId === producto.id) && (
                        <button className="toggle-variantes" onClick={() => toggleVariantes(producto.id)}>
                          {mostrarVariantes[producto.id] ? <ChevronDown /> : <ChevronRight />}
                        </button>
                      )}
                    <span className="producto-nombre">{producto.nombre}</span>
                    <div className="producto-meta">
                      <span className="producto-proveedor">{producto.proveedor}</span>
                      <span className="producto-categoria">{producto.categoria}</span>
                    </div>
                  </div>
                  <div className="producto-actions">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={producto.seleccionado}
                        onChange={() => toggleSeleccion(producto.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                </div>

                {/* Variantes del producto */}
                {mostrarVariantes[producto.id] && (
                  <div className="variantes-container">
                    {productos
                      .filter((p) => p.esVariante && p.productoBaseId === producto.id)
                      .map((variante) => (
                        <div key={variante.id} className="producto-item variante">
                          <div className="producto-info">
                            <div className="variante-indicator">
                              <span className="variante-label">Variante</span>
                            </div>
                            <span className="producto-nombre">{variante.nombre}</span>
                          </div>
                          <div className="producto-actions">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={variante.seleccionado}
                                onChange={() => toggleSeleccion(variante.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
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
    </div>
  )
}
