"use client"

import { Card } from "react-bootstrap"

const PetCard = ({ pet, isSelected, onClick, allowMultiSelect = false }) => {
  return (
    <Card className={`pet-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <Card.Body className="d-flex align-items-center p-3">
        <div className="pet-avatar me-3">
          {pet.imagen ? (
            <img src={pet.imagen || "/placeholder.svg"} alt={pet.nombre} className="pet-image" />
          ) : (
            <i className="bi bi-paw-fill fs-3"></i>
          )}
        </div>
        <div className="flex-grow-1">
          <h6 className="mb-1">{pet.nombre}</h6>
          <p className="mb-0 small text-muted">
            {pet.especie} • {pet.raza} • {pet.tamaño}
          </p>
        </div>
        <div className="pet-selected-check">
          {isSelected && <i className={`bi ${allowMultiSelect ? "bi-check-square-fill" : "bi-check-circle-fill"}`}></i>}
        </div>
      </Card.Body>
    </Card>
  )
}

export default PetCard
