"use client"

import { useState } from "react"
import { Row, Col, Button, ButtonGroup } from "react-bootstrap"
import ServiceCard from "./service-card"

const ServicesSelector = ({ availableServices, selectedServices, addService }) => {
  const [viewMode, setViewMode] = useState("grid")

  return (
    <div className="services-selector">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Servicios disponibles:</h5>
        <ButtonGroup size="sm">
          <Button variant={viewMode === "grid" ? "success" : "outline-success"} onClick={() => setViewMode("grid")}>
            <i className="bi bi-grid-3x3-gap-fill me-1"></i> Cuadrícula
          </Button>
          <Button variant={viewMode === "list" ? "success" : "outline-success"} onClick={() => setViewMode("list")}>
            <i className="bi bi-list-ul me-1"></i> Lista
          </Button>
        </ButtonGroup>
      </div>

      {/* Contenedor con scroll interno */}
      <div className="services-container" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem" }}>
        {viewMode === "grid" ? (
          <Row className="g-3">
            {availableServices.map((service) => (
              <Col md={6} key={service.id}>
                <ServiceCard
                  service={service}
                  addService={addService}
                  isSelected={selectedServices.some((s) => s.id === service.id)}
                  viewMode="grid"
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="services-list">
            {availableServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                addService={addService}
                isSelected={selectedServices.some((s) => s.id === service.id)}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const validarServicioSeleccionado = (formData) => {
  const errores = {}
  if (!formData.servicioId) {
    errores.servicioId = "Debe seleccionar un servicio."
  }
  return errores
}

export default ServicesSelector
