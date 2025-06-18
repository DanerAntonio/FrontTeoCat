"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Container, Row, Col, Form, Button, InputGroup, Card, Pagination } from "react-bootstrap"
import CatalogoService from "../../Services/ConsumoCliente/CatalogoService"
import ProductCard from "../../Components/ClienteComponents/CatalogoComponents/ProductCard"
import "../../Pages/ClientePages/CatalogoPage.scss"

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaParam = searchParams.get("categoria")

  const [productos, setProductos] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedProducts, setPaginatedProducts] = useState([])

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState(categoriaParam || "todos")
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [sortBy, setSortBy] = useState("featured")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRating, setSelectedRating] = useState(0)

  useEffect(() => {
    loadCatalogoData()
  }, [])

  useEffect(() => {
    // Si hay un parámetro de categoría en la URL, aplicar ese filtro
    if (categoriaParam && categories.length > 0) {
      const matchingCategory = categories.find((cat) => cat.name.toLowerCase() === categoriaParam.toLowerCase())

      if (matchingCategory) {
        setSelectedCategory(matchingCategory.name)
      }
    }
  }, [categoriaParam, categories])

  const loadCatalogoData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Cargando datos del catálogo...")
      const { productos, categorias } = await CatalogoService.getCatalogoData()

      console.log("📦 Productos recibidos:", productos)
      console.log("📂 Categorías recibidas:", categorias)

      // REMOVER FILTROS RESTRICTIVOS TEMPORALMENTE PARA DEBUG
      // const productosActivos = productos.filter(producto => producto.status === 'Activo')
      // setProducts(productosActivos)
      // setFilteredProducts(productosActivos)
      // setCategories(categorias.filter(categoria => categoria.status === 'Activo'))

      // USAR TODOS LOS DATOS SIN FILTRAR
      const productosMapeados = productos.map((p) => ({
        id: p.IdProducto,
        name: p.NombreProducto,
        price: Number(p.Precio),
        stock: Number(p.Stock),
        image: p.FotosProducto,
        // agrega otros campos si los necesitas
        ...p,
      }))
      setProductos(productosMapeados)
      setFilteredProducts(productosMapeados)
      setCategories(categorias)

      console.log("✅ Datos cargados correctamente")
    } catch (error) {
      console.error("❌ Error al cargar datos del catálogo:", error)
      setError(`Error al cargar los productos: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...productos]

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      result = result.filter((product) => product.category === selectedCategory)
    }

    // Filtrar por rango de precio
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    // Filtrar por valoración
    if (selectedRating > 0) {
      result = result.filter((product) => (product.rating || 4.5) >= selectedRating)
    }

    // Aplicar ordenamiento
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }, [selectedCategory, priceRange, sortBy, searchTerm, selectedRating, productos])

  // Calcular productos paginados
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    setPaginatedProducts(currentProducts)
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage))
  }, [filteredProducts, currentPage, productsPerPage])

  const handlePriceChange = (e) => {
    setPriceRange([0, Number.parseInt(e.target.value)])
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)

    // Actualizar URL con el parámetro de categoría
    if (category !== "todos") {
      setSearchParams({ categoria: category.toLowerCase() })
    } else {
      setSearchParams({})
    }
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (searchTerm.trim()) {
      try {
        setLoading(true)
        const resultados = await CatalogoService.searchProductos(searchTerm)
        const productosMapeados = resultados.map(CatalogoService.mapProductoToComponent)
        setProductos(productosMapeados)
      } catch (error) {
        console.error("Error en la búsqueda:", error)
        // Mantener filtros locales si falla la búsqueda en servidor
      } finally {
        setLoading(false)
      }
    } else {
      // Si no hay término de búsqueda, recargar todos los productos
      loadCatalogoData()
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll to top
    window.scrollTo(0, 0)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const clearFilters = () => {
    setSelectedCategory("todos")
    setPriceRange([0, 200000])
    setSortBy("featured")
    setSearchTerm("")
    setSelectedRating(0)
    setSearchParams({})
    loadCatalogoData() // Recargar datos originales
  }

  const handleAddToCart = (producto) => {
    // Aquí tu lógica para agregar al carrito
  }

  if (loading) {
    return (
      <div className="catalogo-page loading-container">
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando productos...</p>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalogo-page error-container">
        <Container className="py-5 mt-5 text-center">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
          <Button variant="success" onClick={loadCatalogoData}>
            Reintentar
          </Button>
          <div className="mt-3">
            <small className="text-muted">Verifica que el servidor esté ejecutándose en http://localhost:3000</small>
          </div>
        </Container>
      </div>
    )
  }

  // Generar elementos de paginación
  const paginationItems = []
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>,
    )
  }

  return (
    <div className="catalogo-page">
      <Container className="py-5 mt-5">
        <div className="catalog-header mb-4">
          <h1 className="page-title">Catálogo de Productos</h1>
          <p className="text-muted">Encuentra todo lo que tu mascota necesita</p>
          {/* Aquí eliminaste la alerta de debug */}
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="search-input"
              />
              <Button variant="success" type="submit" className="search-button">
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Botón para mostrar/ocultar filtros en móvil */}
        <div className="d-lg-none mb-4">
          <Button
            variant="outline-secondary"
            onClick={toggleFilters}
            className="w-100 d-flex justify-content-between align-items-center"
          >
            <span>Filtros y Ordenamiento</span>
            <i className={`bi bi-chevron-${showFilters ? "up" : "down"}`}></i>
          </Button>
        </div>

        <Row>
          {/* Filtros (columna izquierda) */}
          <Col lg={3} className={`mb-4 filters-column ${showFilters ? "show" : ""}`}>
            <div className="filters-container sticky-top" style={{ top: "90px" }}>
              <Card className="filters-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="filters-title mb-0">Filtros</h5>
                    <Button variant="link" className="p-0 text-decoration-none" onClick={clearFilters}>
                      Limpiar
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {/* Filtro por categoría */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Categorías ({categories.length})</h6>
                    <div className="category-filters">
                      <div
                        className={`category-filter-item ${selectedCategory === "todos" ? "active" : ""}`}
                        onClick={() => handleCategoryChange("todos")}
                      >
                        Todos los productos
                      </div>
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`category-filter-item ${selectedCategory === category.name ? "active" : ""}`}
                          onClick={() => handleCategoryChange(category.name)}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por precio */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Precio</h6>
                    <div className="price-range-container">
                      <div className="d-flex justify-content-between mb-2">
                        <span>$0</span>
                        <span>${priceRange[1].toLocaleString()}</span>
                      </div>
                      <Form.Range
                        min="0"
                        max="200000"
                        step="10000"
                        value={priceRange[1]}
                        onChange={handlePriceChange}
                        className="price-range"
                      />
                    </div>
                  </div>

                  {/* Filtro por valoración */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Valoración</h6>
                    <div className="rating-filters">
                      {[4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className={`rating-filter-item ${selectedRating === rating ? "active" : ""}`}
                          onClick={() => handleRatingChange(rating)}
                        >
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <i
                                key={i}
                                className={`bi ${i < rating ? "bi-star-fill" : "bi-star"} ${i < rating ? "text-warning" : ""}`}
                              ></i>
                            ))}
                          {rating === 4 && <span className="ms-2">y más</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ordenar por */}
                  <div>
                    <h6 className="filter-subtitle mb-3">Ordenar por</h6>
                    <Form.Select value={sortBy} onChange={handleSortChange} className="sort-select">
                      <option value="featured">Destacados</option>
                      <option value="name">Nombre A-Z</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="rating">Mejor Valorados</option>
                    </Form.Select>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Productos (columna derecha) */}
          <Col lg={9}>
            {filteredProducts.length === 0 ? (
              <div className="no-results-container">
                <div className="alert alert-info">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  No se encontraron productos que coincidan con los filtros seleccionados.
                </div>
                <Button variant="success" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
                <div className="mt-3">
                  <small className="text-muted">
                    Total productos cargados: {productos.length} | Categorías: {categories.length}
                  </small>
                </div>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4 results-header">
                  <p className="mb-0 results-count">{filteredProducts.length} productos encontrados</p>
                  <div className="d-none d-md-block">
                    <Form.Select value={sortBy} onChange={handleSortChange} className="sort-select-inline">
                      <option value="featured">Destacados</option>
                      <option value="name">Nombre A-Z</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="rating">Mejor Valorados</option>
                    </Form.Select>
                  </div>
                </div>

                <div className="products-grid-container">
                  <Row className="g-4">
                    {paginatedProducts.map((producto) => (
                      <Col md={6} lg={4} key={producto.id}>
                        <ProductCard product={producto} onAddToCart={handleAddToCart} />
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="pagination-container mt-5 d-flex justify-content-center">
                    <Pagination>
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {paginationItems}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CatalogoPage
