"use client"

import { Card, Button } from "react-bootstrap"

const ServiceCard = ({ service, addService, isSelected, viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <Card className={`service-card mb-2 ${isSelected ? "selected" : ""}`}>
        <div className="d-flex">
          <div className="service-card-img-container" style={{ width: "120px" }}>
            <img src={service.image || "/placeholder.svg"} alt={service.name} className="service-card-img" />
            {isSelected && (
              <div className="service-selected-badge">
                <i className="bi bi-check"></i>
              </div>
            )}
          </div>
          <Card.Body className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start">
              <Card.Title className="service-card-title">{service.name}</Card.Title>
              <div className="d-flex flex-column align-items-end">
                <span className="service-card-price">${service.price.toLocaleString()}</span>
                <span className="service-card-duration">{service.duration} min</span>
              </div>
            </div>
            <Card.Text className="service-card-description flex-grow-1">{service.description}</Card.Text>
            <div className="mt-auto">
              <Button
                variant={isSelected ? "success" : "outline-success"}
                className="service-card-btn"
                onClick={() => addService(service)}
                disabled={isSelected}
              >
                {isSelected ? (
                  <>
                    <i className="bi bi-check-circle me-1"></i> Seleccionado
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"></i> Agregar
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`service-card h-100 ${isSelected ? "selected" : ""}`}>
      <div className="service-card-img-container">
        <Card.Img variant="top" src={service.image} alt={service.name} className="service-card-img" />
        {isSelected && (
          <div className="service-selected-badge">
            <i className="bi bi-check"></i>
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <Card.Title className="service-card-title">{service.name}</Card.Title>
          <div className="d-flex flex-column align-items-end">
            <span className="service-card-price">${service.price.toLocaleString()}</span>
            <span className="service-card-duration">{service.duration} min</span>
          </div>
        </div>
        <Card.Text className="service-card-description flex-grow-1">{service.description}</Card.Text>
        <div className="mt-auto">
          <Button
            variant={isSelected ? "success" : "outline-success"}
            className="service-card-btn w-100"
            onClick={() => addService(service)}
            disabled={isSelected}
          >
            {isSelected ? (
              <>
                <i className="bi bi-check-circle me-1"></i> Seleccionado
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-1"></i> Agregar
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ServiceCard
