"use client"

import { useState } from "react"
import { Card, Row, Col, Badge, Button, Modal, Form, ButtonGroup } from "react-bootstrap"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfileReviews.scss"

const ProfileReviews = ({ reviews, updateReviews }) => {
  // Estado para el modo de visualización (grid o list)
  const [viewMode, setViewMode] = useState("grid")

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  })

  // Manejar edición de reseña
  const handleEditClick = (review) => {
    setEditingReview(review)
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    })
    setShowEditModal(true)
  }

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditForm({
      ...editForm,
      [name]: name === "rating" ? Number.parseInt(value) : value,
    })
  }

  // Guardar cambios en la reseña
  const handleSaveReview = async (e) => {
    e.preventDefault()
    if (!editForm.comment.trim()) {
      toast.error("Por favor escribe un comentario")
      return
    }
    try {
      if (editingReview.type === "product") {
        await perfilClienteService.actualizarReseñaProducto(editingReview.id, {
          rating: editForm.rating,
          comment: editForm.comment,
        })
      } else if (editingReview.type === "service") {
        await perfilClienteService.actualizarReseñaServicio(editingReview.id, {
          rating: editForm.rating,
          comment: editForm.comment,
        })
      } else if (editingReview.type === "general") {
        await perfilClienteService.actualizarReseñaGeneral(editingReview.id, {
          rating: editForm.rating,
          comment: editForm.comment,
        })
      }
      // Actualiza el estado local
      const updatedReviews = reviews.map((review) =>
        review.id === editingReview.id
          ? { ...review, rating: editForm.rating, comment: editForm.comment, date: new Date().toISOString().split("T")[0] }
          : review
      )
      updateReviews(updatedReviews)
      setShowEditModal(false)
      toast.success("Reseña actualizada correctamente")
    } catch (error) {
      toast.error("Error al actualizar la reseña")
    }
  }

  // Eliminar reseña
  const handleDeleteReview = async (reviewId, type) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta reseña?")) {
      try {
        if (type === "product") {
          await perfilClienteService.eliminarReseñaProducto(reviewId)
        } else if (type === "service") {
          await perfilClienteService.eliminarReseñaServicio(reviewId)
        } else if (type === "general") {
          await perfilClienteService.eliminarReseñaGeneral(reviewId)
        }
        const updatedReviews = reviews.filter((review) => review.id !== reviewId)
        updateReviews(updatedReviews)
        toast.success("Reseña eliminada correctamente")
      } catch (error) {
        toast.error("Error al eliminar la reseña")
      }
    }
  }

  // Renderizar estrellas de calificación
  const renderStars = (rating) => {
    return (
      <div className="tc-review-rating">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`bi ${i < rating ? "bi-star-fill" : "bi-star"} text-warning`}></i>
        ))}
      </div>
    )
  }

  // Filtrar solo reseñas aprobadas
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const reseñasAprobadas = safeReviews.filter((r) => r.Aprobado === true)

  // Renderizar reseñas en modo cuadrícula
  const renderGridView = () => {
    return (
      <Row className="g-3">
        {reseñasAprobadas.map((review) => (
          <Col md={6} key={review.id}>
            <Card className="tc-review-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Badge bg={review.type === "product" ? "success" : "info"} className="tc-review-type-badge mb-1">
                      {review.type === "product" ? "Producto" : "Servicio"}
                    </Badge>
                    <h5 className="tc-review-item-name">{review.itemName}</h5>
                  </div>
                  <div className="tc-review-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEditClick(review)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteReview(review.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>

                {renderStars(review.rating)}

                <div className="tc-review-content my-2">{review.comment}</div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="tc-review-date text-muted">{review.date}</span>
                </div>

                <div className="tc-review-image-container mt-2">
                  <img src={review.image || "/placeholder.svg"} alt={review.itemName} className="tc-review-image" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  // Renderizar reseñas en modo lista
  const renderListView = () => {
    return (
      <div className="tc-reviews-list">
        {reseñasAprobadas.map((review) => (
          <Card className="tc-review-list-item mb-3" key={review.id}>
            <Card.Body className="p-3">
              <Row className="align-items-center g-3">
                <Col xs={3} md={2}>
                  <div className="tc-review-list-image-container">
                    <img
                      src={review.image || "/placeholder.svg"}
                      alt={review.itemName}
                      className="tc-review-list-image"
                    />
                    <Badge bg={review.type === "product" ? "success" : "info"} className="tc-review-list-badge">
                      {review.type === "product" ? "Producto" : "Servicio"}
                    </Badge>
                  </div>
                </Col>
                <Col xs={9} md={10}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="tc-review-item-name mb-1">{review.itemName}</h5>
                    <div className="tc-review-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEditClick(review)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteReview(review.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                  <div className="tc-review-content my-1">{review.comment}</div>
                  <div className="tc-review-date text-muted">{review.date}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card className="border-0 shadow">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mis Reseñas</h4>
            {reviews.length > 0 && (
              <ButtonGroup size="sm">
                <Button
                  variant={viewMode === "grid" ? "success" : "outline-success"}
                  onClick={() => setViewMode("grid")}
                >
                  <i className="bi bi-grid-3x3-gap-fill me-1"></i> Cuadrícula
                </Button>
                <Button
                  variant={viewMode === "list" ? "success" : "outline-success"}
                  onClick={() => setViewMode("list")}
                >
                  <i className="bi bi-list-ul me-1"></i> Lista
                </Button>
              </ButtonGroup>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-3">
          {reseñasAprobadas.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-chat-left-quote fs-1"></i>
              <p className="mt-2">No tienes reseñas aprobadas aún.</p>
            </div>
          ) : viewMode === "grid" ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </Card.Body>
      </Card>

      {/* Modal para editar reseña */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Reseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingReview && (
            <Form onSubmit={handleSaveReview}>
              <div className="mb-3">
                <h5>{editingReview.itemName}</h5>
                <Badge bg={editingReview.type === "product" ? "success" : "info"} className="tc-review-type-badge">
                  {editingReview.type === "product" ? "Producto" : "Servicio"}
                </Badge>
              </div>

              <Form.Group className="mb-3" controlId="editRating">
                <Form.Label>Tu valoración *</Form.Label>
                <div className="d-flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="me-2">
                      <Form.Check
                        type="radio"
                        id={`star-${star}`}
                        name="rating"
                        value={star}
                        checked={editForm.rating === star}
                        onChange={handleFormChange}
                        label={
                          <i
                            className={`bi ${star <= editForm.rating ? "bi-star-fill" : "bi-star"} text-warning fs-4`}
                          ></i>
                        }
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="editComment">
                <Form.Label>Tu reseña *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="comment"
                  value={editForm.comment}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button variant="success" type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ProfileReviews
