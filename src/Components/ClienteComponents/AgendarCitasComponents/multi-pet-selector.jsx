"use client"
import { Row, Col, Button } from "react-bootstrap"
import PetCard from "../AgendarCitasComponents/pet-card"

const MultiPetSelector = ({ pets, selectedPets, setSelectedPets }) => {
  // Manejar selección de mascota
  const handlePetSelection = (petId) => {
    if (selectedPets.includes(petId)) {
      // Si ya está seleccionada, quitarla
      setSelectedPets(selectedPets.filter((id) => id !== petId))
    } else {
      // Si no está seleccionada, agregarla
      setSelectedPets([...selectedPets, petId])
    }
  }

  // Seleccionar todas las mascotas
  const selectAllPets = () => {
    setSelectedPets(pets.map((pet) => pet.id))
  }

  // Deseleccionar todas las mascotas
  const deselectAllPets = () => {
    setSelectedPets([])
  }

  return (
    <div className="multi-pet-selector">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Selecciona las mascotas para el paseo:</h5>
        <div>
          <Button variant="link" className="p-0 me-3" onClick={selectAllPets}>
            Seleccionar todas
          </Button>
          <Button variant="link" className="p-0 text-danger" onClick={deselectAllPets}>
            Deseleccionar todas
          </Button>
        </div>
      </div>

      <Row className="g-3">
        {pets.map((pet) => (
          <Col md={6} key={pet.id}>
            <PetCard
              pet={pet}
              isSelected={selectedPets.includes(pet.id)}
              onClick={() => handlePetSelection(pet.id)}
              allowMultiSelect={true}
            />
          </Col>
        ))}
      </Row>

      {pets.length === 0 && (
        <div className="text-center py-3">
          <p className="text-muted">No tienes mascotas registradas. Por favor registra una mascota primero.</p>
        </div>
      )}

      {selectedPets.length > 0 && (
        <div className="mt-3 p-3 bg-light rounded">
          <p className="mb-1">
            <strong>Mascotas seleccionadas:</strong> {selectedPets.length}
          </p>
          <p className="mb-0 small text-muted">
            {selectedPets
              .map((id) => pets.find((pet) => pet.id === id)?.nombre)
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  )
}

const validarMascotaSeleccionada = (formData) => {
  const errores = {}
  if (!formData.mascotaId) {
    errores.mascotaId = "Debe seleccionar una mascota."
  }
  return errores
}

export default MultiPetSelector
