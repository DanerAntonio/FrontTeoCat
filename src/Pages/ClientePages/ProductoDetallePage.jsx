"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Button, Tabs, Tab, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import CatalogoService from "../../Services/ConsumoCliente/CatalogoService.js"
import carritoService from "../../Services/ConsumoCliente/CarritoService.js"
import ReseñasService from "../../Services/ConsumoCliente/ResenasService.js"  

import "../../Pages/ClientePages/ProductoDetallePage.scss"

const ProductoDetallePage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("descripcion")
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)

  // ✅ ESTADO PARA RESEÑAS (copiado de servicios)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [null, null, null, null],
  })
  const [imagesPreviews, setImagesPreviews] = useState([null, null, null, null])
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    // Resetear el estado cuando cambia el ID del producto
    setLoading(true)
    setError(null)
    setQuantity(1)
    setSelectedImage(0)

    fetchProductData(id)
  }, [id])

  // ✅ CARGAR RESEÑAS (adaptado para productos)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true)
        // Aquí irá la llamada real a la API cuando esté implementada
        // const response = await CatalogoService.obtenerReseñasProducto(id)
        // setReviews(response.data)

        // Por ahora, inicializar vacío
        setReviews([])
        setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast.error("Error al cargar las reseñas")
      } finally {
        setLoadingReviews(false)
      }
    }

    if (id) {
      fetchReviews()
    }
  }, [id])

  const fetchProductData = async (productId) => {
    try {
      setLoading(true)
      setError(null)

      // Obtener producto completo con variantes
      const productoCompleto = await CatalogoService.getProductoCompleto(productId)
      setProduct(productoCompleto)

      // Obtener productos relacionados de la misma categoría
      if (productoCompleto.categoryId) {
        try {
          const productosRelacionados = await CatalogoService.getProductosPorCategoria(productoCompleto.categoryId)
          const relacionadosMapeados = productosRelacionados
            .map(CatalogoService.mapProductoToComponent)
            .filter((p) => p.id !== Number.parseInt(productId))
            .slice(0, 3)

          setRelatedProducts(relacionadosMapeados)
        } catch (relatedError) {
          console.error("Error al cargar productos relacionados:", relatedError)
          setRelatedProducts([])
        }
      }
    } catch (error) {
      console.error("Error al cargar producto:", error)
      setError("Producto no encontrado o error al cargar los datos.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ FUNCIONES PARA RESEÑAS (copiadas de servicios)
  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating })
  }

  const handleStarHover = (rating) => {
    setHoveredStar(rating)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  const handleCommentChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value })
  }

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, seleccione un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.")
        return
      }

      // Actualizar el archivo en el estado
      const newImages = [...newReview.images]
      newImages[index] = file
      setNewReview({ ...newReview, images: newImages })

      // Crear vista previa
      const newPreviews = [...imagesPreviews]
      newPreviews[index] = URL.createObjectURL(file)
      setImagesPreviews(newPreviews)
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = [...newReview.images]
    const newPreviews = [...imagesPreviews]

    // Revocar la URL para liberar memoria
    if (imagesPreviews[index]) {
      URL.revokeObjectURL(imagesPreviews[index])
    }

    newImages[index] = null
    newPreviews[index] = null

    setNewReview({ ...newReview, images: newImages })
    setImagesPreviews(newPreviews)

    // Limpiar el input file
    const fileInput = document.getElementById(`review-image-${index}`)
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    // Validaciones
    if (newReview.rating === 0) {
      toast.error("Por favor, selecciona una calificación.")
      return
    }
    if (!newReview.comment.trim()) {
      toast.error("Por favor, escribe un comentario.")
      return
    }
    if (!newReview.images[0]) {
      toast.error("La primera imagen es obligatoria.")
      return
    }

    try {
      // Aquí va la llamada real al backend
      // Si tienes el id del cliente autenticado, pásalo aquí:
      console.log("IdCliente:", idCliente, "IdProducto:", id, "Calificacion:", newReview.rating, "Comentario:", newReview.comment);
      await ReseñasService.crearResenaProducto({
        IdProducto: Number(id),
        IdCliente: idCliente,
        Calificacion: newReview.rating,
        Comentario: newReview.comment,
        // Si tienes la URL de la imagen, agrégala aquí
      })

      toast.success("¡Gracias por tu reseña! Será revisada antes de publicarse.")

      // Limpiar formulario
      setNewReview({
        rating: 0,
        comment: "",
        images: [null, null, null, null],
      })
      setImagesPreviews([null, null, null, null])
      setHoveredStar(0)

      // Limpiar inputs de archivos
      for (let i = 0; i < 4; i++) {
        const fileInput = document.getElementById(`review-image-${i}`)
        if (fileInput) {
          fileInput.value = ""
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Hubo un error al enviar tu reseña. Por favor, inténtalo de nuevo.")
    }
  }

  const calculateAverageRating = () => {
    let totalRating = 0
    let totalReviews = 0
    for (let i = 1; i <= 5; i++) {
      totalRating += ratingCounts[i] * i
      totalReviews += ratingCounts[i]
    }
    return totalReviews === 0 ? 0 : totalRating / totalReviews
  }

  const averageRating = calculateAverageRating()

  // Limpiar URLs de vista previa al desmontar
  useEffect(() => {
    return () => {
      imagesPreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [imagesPreviews])

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || (product && newQuantity > product.stock)) return
    setQuantity(newQuantity)
  }

  const addToCart = async () => {
    if (!product) return

    const result = await carritoService.addItem(product, quantity)
    if (result.success) {
      toast.success(`${quantity} ${quantity > 1 ? "unidades" : "unidad"} añadidas al carrito`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      // Si necesitas actualizar el contador del carrito:
      document.dispatchEvent(new Event("cartUpdated"))
    } else {
      toast.error(result.message || "No se pudo agregar al carrito")
    }
  }

  const handleThumbnailClick = (index) => {
    setSelectedImage(index)
  }

  // Obtener el ID del cliente autenticado (si existe)
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const idCliente = user?.IdCliente || user?.id || user?.idCliente;

  if (loading) {
    return (
      <div className="producto-detalle-page loading-container">
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando detalles del producto...</p>
        </Container>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="producto-detalle-page error-container">
        <Container className="py-5 mt-5 text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
          </div>
          <h2>Producto no encontrado</h2>
          <p className="mb-4">
            {error || "Lo sentimos, el producto que estás buscando no existe o ha sido eliminado."}
          </p>
          <Link to="/catalogo" className="btn btn-success">
            Volver al Catálogo
          </Link>
        </Container>
      </div>
    )
  }

  return (
    <div className="producto-detalle-page">
      <Container className="py-5 mt-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/catalogo">Catálogo</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/catalogo?categoria=${product.category.toLowerCase()}`}>{product.category}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <Row className="mb-5">
          {/* Galería de imágenes */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <div className="product-gallery">
              <div className="main-image-container mb-3">
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="main-image img-fluid rounded"
                />
              </div>

              {product.images.length > 1 && (
                <div className="thumbnail-container">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - Vista ${index + 1}`}
                        className="thumbnail-image img-fluid rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Información del producto */}
          <Col lg={6}>
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>

              <div className="product-meta d-flex align-items-center mb-3">
                <div className="product-rating me-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < Math.floor(averageRating || product.rating || 4.5) ? "bi-star-fill" : i < (averageRating || product.rating || 4.5) ? "bi-star-half" : "bi-star"} text-warning`}
                    ></i>
                  ))}
                  <span className="ms-2">{averageRating > 0 ? averageRating.toFixed(1) : product.rating || 4.5}</span>
                </div>

                <div className="product-reviews-count">
                  <Link to="#reviews" onClick={() => setActiveTab("reviews")}>
                    {reviews.length} reseñas
                  </Link>
                </div>
              </div>

              <div className="product-price mb-4">
                <span className="current-price">${product.price.toLocaleString()}</span>
              </div>

              <div className="product-short-description mb-4">
                <p>
                  {product.description
                    ? product.description.substring(0, 150) + "..."
                    : "Producto de alta calidad para tu mascota."}
                </p>
              </div>

              <div className="product-stock mb-4">
                <span className={`stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                  <i className={`bi ${product.stock > 0 ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2`}></i>
                  {product.stock > 0 ? `${product.stock} unidades disponibles` : "Agotado"}
                </span>
              </div>

              {/* Mostrar variantes si existen */}
              {product.variants && product.variants.length > 0 && (
                <div className="product-variants mb-4">
                  <h6 className="mb-3">Variantes disponibles:</h6>
                  <div className="variants-list">
                    {product.variants.map((variant) => (
                      <Link
                        key={variant.id}
                        to={`/producto/${variant.id}`}
                        className="variant-item btn btn-outline-secondary me-2 mb-2"
                      >
                        {variant.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-actions mb-4">
                <div className="quantity-selector d-flex align-items-center mb-3">
                  <span className="me-3">Cantidad:</span>
                  <div className="input-group" style={{ width: "150px" }}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                    <Form.Control
                      type="text"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock}
                      className="text-center"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-grow-1"
                    onClick={addToCart}
                    disabled={product.stock <= 0}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Añadir al Carrito
                  </Button>
                </div>
              </div>

              <div className="product-category mb-4">
                <span className="text-muted me-2">Categoría:</span>
                <Link to={`/catalogo?categoria=${product.category.toLowerCase()}`}>{product.category}</Link>
              </div>

              <div className="product-share">
                <span className="text-muted me-2">Compartir:</span>
                <div className="social-icons d-inline-block">
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-envelope"></i>
                  </a>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tabs de información adicional */}
        <div className="product-tabs mb-5">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="descripcion" title="Descripción">
              <div className="tab-content-container">
                <h3 className="mb-4">Descripción del Producto</h3>
                <p>{product.description || "Producto de alta calidad para tu mascota."}</p>

                <h4 className="mt-4 mb-3">Características</h4>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>
                      <i className="bi bi-check-circle-fill me-2" style={{ color: "#7ab51d" }}></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Tab>

            <Tab eventKey="especificaciones" title="Especificaciones">
              <div className="tab-content-container">
                <h3 className="mb-4">Especificaciones Técnicas</h3>
                <table className="table specifications-table">
                  <tbody>
                    {Object.entries(product.specifications)
                      .filter(([key]) => !["Origen", "Stock", "Stock disponible"].includes(key))
                      .map(([key, value], index) => (
                        <tr key={index}>
                          <th>{key}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Tab>

            {/* ✅ TAB DE RESEÑAS COMPLETO (copiado y adaptado de servicios) */}
            <Tab eventKey="reviews" title={`Reseñas (${reviews.length})`}>
              <div className="tab-content-container" id="reviews">
                <h3 className="mb-4">Opiniones de Clientes</h3>

                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando reseñas...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {reviews.length > 0 ? (
                      <>
                        <div className="reviews-summary mb-4">
                          <div className="d-flex align-items-center">
                            <div className="overall-rating me-4">
                              <span className="rating-value">{averageRating.toFixed(1)}</span>
                              <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi ${i < Math.floor(averageRating) ? "bi-star-fill" : i < averageRating ? "bi-star-half" : "bi-star"} text-warning`}
                                  ></i>
                                ))}
                              </div>
                              <span className="total-reviews">{reviews.length} reseñas</span>
                            </div>

                            <div className="rating-bars flex-grow-1">
                              {[5, 4, 3, 2, 1].map((stars) => {
                                const count = ratingCounts[stars] || 0
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

                                return (
                                  <div key={stars} className="rating-bar-item d-flex align-items-center mb-1">
                                    <div className="stars-label me-2">
                                      {stars} <i className="bi bi-star-fill text-warning small"></i>
                                    </div>
                                    <div className="progress flex-grow-1 me-2" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${percentage}%` }}
                                        aria-valuenow={percentage}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                      ></div>
                                    </div>
                                    <div className="count-label small">{count}</div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="reviews-list">
                          {reviews.map((review, index) => (
                            <div key={index} className="review-item mb-4 pb-4 border-bottom">
                              <div className="d-flex justify-content-between mb-2">
                                <h5 className="review-author mb-0">{review.user || "Usuario Anónimo"}</h5>
                                <span className="review-date text-muted">{review.date || "Fecha no disponible"}</span>
                              </div>

                              <div className="review-rating mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi ${i < review.rating ? "bi-star-fill" : "bi-star"} text-warning`}
                                  ></i>
                                ))}
                              </div>

                              <p className="review-content mb-2">{review.comment}</p>

                              {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                  <div className="row g-2">
                                    {review.images.map((image, imgIndex) => (
                                      <div key={imgIndex} className="col-3">
                                        <img
                                          src={image || "/placeholder.svg"}
                                          alt={`Reseña imagen ${imgIndex + 1}`}
                                          className="img-fluid rounded"
                                          style={{ height: "80px", objectFit: "cover" }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-chat-dots fs-1 text-muted mb-3 d-block"></i>
                        <h5>Aún no hay reseñas</h5>
                        <p className="text-muted">Sé el primero en dejar una reseña de este producto</p>
                      </div>
                    )}

                    <div className="write-review mt-5">
                      <h4 className="mb-3">Escribe una Reseña</h4>
                      <p className="text-muted mb-3">
                        Comparte tu experiencia con este producto para ayudar a otros clientes.
                      </p>

                      <Form onSubmit={handleSubmitReview}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                Tu valoración <span className="text-danger">*</span>
                              </Form.Label>
                              <div className="rating-selector">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`bi bi-star${star <= (hoveredStar || newReview.rating) ? "-fill" : ""} rating-star me-1`}
                                    style={{
                                      color: star <= (hoveredStar || newReview.rating) ? "#ffc107" : "#dee2e6",
                                      cursor: "pointer",
                                      fontSize: "1.5rem",
                                    }}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={handleStarLeave}
                                  ></i>
                                ))}
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                Tu reseña <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={4}
                                value={newReview.comment}
                                onChange={handleCommentChange}
                                placeholder="Cuéntanos sobre tu experiencia con este producto..."
                                maxLength={500}
                              />
                              <Form.Text className="text-muted">{newReview.comment.length}/500 caracteres</Form.Text>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Fotos de tu experiencia</Form.Label>
                              <p className="small text-muted mb-2">
                                <span className="text-danger">*</span> La primera foto es obligatoria. Puedes subir
                                hasta 4 fotos (máximo 5MB cada una).
                              </p>

                              <div className="row g-2">
                                {[0, 1, 2, 3].map((index) => (
                                  <div key={index} className="col-6">
                                    <div className="image-upload-container">
                                      {imagesPreviews[index] ? (
                                        <div className="position-relative">
                                          <img
                                            src={imagesPreviews[index] || "/placeholder.svg"}
                                            alt={`Vista previa ${index + 1}`}
                                            className="img-fluid rounded"
                                            style={{ height: "100px", width: "100%", objectFit: "cover" }}
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                            onClick={() => handleRemoveImage(index)}
                                            style={{ padding: "2px 6px" }}
                                          >
                                            <i className="bi bi-x"></i>
                                          </button>
                                        </div>
                                      ) : (
                                        <label
                                          htmlFor={`review-image-${index}`}
                                          className="image-upload-label d-flex flex-column align-items-center justify-content-center"
                                          style={{
                                            height: "100px",
                                            border: "2px dashed #dee2e6",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            backgroundColor: "#f8f9fa",
                                          }}
                                        >
                                          <i className="bi bi-camera fs-4 text-muted"></i>
                                          <small className="text-muted">
                                            {index === 0 ? "Foto 1*" : `Foto ${index + 1}`}
                                          </small>
                                        </label>
                                      )}

                                      <input
                                        type="file"
                                        id={`review-image-${index}`}
                                        className="d-none"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, index)}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                          <Button variant="success" type="submit" size="lg">
                            <i className="bi bi-send me-2"></i>
                            Enviar Reseña
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3 className="section-title mb-4">Productos Relacionados</h3>

            <Row className="g-4">
              {relatedProducts.map((relatedProduct) => (
                <Col md={4} key={relatedProduct.id}>
                  <div className="related-product-card card h-100 border-0 shadow-sm">
                    <Link to={`/producto/${relatedProduct.id}`} className="text-decoration-none">
                      <div className="position-relative">
                        <img
                          src={relatedProduct.image || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          className="card-img-top related-product-image"
                        />
                      </div>

                      <div className="card-body">
                        <h5 className="card-title related-product-title">{relatedProduct.name}</h5>

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="related-product-price">
                            <span className="current-price">${relatedProduct.price.toLocaleString()}</span>
                          </div>

                          <div className="related-product-rating">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <span>{relatedProduct.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  )
}

export default ProductoDetallePage
