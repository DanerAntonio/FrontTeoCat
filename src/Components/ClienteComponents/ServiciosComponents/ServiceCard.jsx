"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { formatearServicio, formatearPrecio } from "../../../Services/ConsumoCliente/ServiciosCliente"
import "./ServiceCard.scss"

const ServiceCard = ({ service: rawService }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Formatear el servicio usando la utilidad
  const service = formatearServicio(rawService)

  if (!service) {
    return null
  }

  return (
    <div
      className="service-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="service-card h-100 border-0 shadow-sm">
        <div className="card-img-container">
          <Card.Img
            variant="top"
            src={service.image || "//vite.svg
"}
            alt={service.name}
            className={`service-image ${isHovered ? "zoomed" : ""}`}
            onError={(e) => {
              e.target.src = "//vite.svg
"
            }}
          />
          <div className="service-overlay">
            <h3 className="service-name">{service.name}</h3>
          </div>
          {!service.availability && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-secondary">No Disponible</span>
            </div>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Text className="service-description flex-grow-1">
            {service.description.length > 100 ? `${service.description.substring(0, 100)}...` : service.description}
          </Card.Text>

          <div className="service-meta mb-2">
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {service.duration}
            </small>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="service-price">Desde ${formatearPrecio(service.price)}</span>

            <div className="service-button-container">
              <Button as={Link} to={`/servicio/${service.id}`} variant="brown" disabled={!service.availability}>
                Ver Detalles
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ServiceCard
