"use client"

import { ArrowLeft, PawPrint, CheckCircle } from "lucide-react"
import { Button, Form, Alert, Card } from "react-bootstrap"

export const PetStep = ({
  cliente,
  selectedMascota,
  selectedMascotas,
  onMascotaChange,
  onMascotasChange,
  requiresMultipleMascotas,
  formErrors,
  onNotasChange,
  notas,
  onSave,
  onPrev,
  onNewMascota,
}) => {
  // Manejador para seleccionar una mascota
  const handleSelectMascota = (mascota) => {
    if (requiresMultipleMascotas) {
      // Verificar si la mascota ya está seleccionada
      const isSelected = selectedMascotas.some((m) => m.id === mascota.id)

      let nuevasMascotas
      if (isSelected) {
        // Si ya está seleccionada, quitarla
        nuevasMascotas = selectedMascotas.filter((m) => m.id !== mascota.id)
      } else {
        // Si no está seleccionada, agregarla
        nuevasMascotas = [...selectedMascotas, mascota]
      }

      onMascotasChange(nuevasMascotas)
    } else {
      // Para servicios que solo permiten una mascota
      onMascotaChange(mascota)
    }
  }

  const validarMascota = (formData) => {
    const errores = {}
    if (!formData.mascotaId) {
      errores.mascotaId = "Debe seleccionar una mascota."
    }
    return errores
  }

  return (
    <div className="step-container">
      <div className="step-number">
        <span>4</span>
      </div>
      <h3 className="step-title">Información de la Mascota</h3>

      <div className="mascota-container">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Selecciona una mascota registrada:</h5>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center"
            onClick={() => onNewMascota(cliente)}
            size="sm"
          >
            <PawPrint size={14} className="me-1" />
            Nueva Mascota
          </Button>
        </div>

        {cliente && cliente.mascotas && cliente.mascotas.length > 0 ? (
          <div className="mascotas-grid">
            {cliente.mascotas.map((mascota) => {
              const isSelected = requiresMultipleMascotas
                ? selectedMascotas.some((m) => m.id === mascota.id)
                : selectedMascota && selectedMascota.id === mascota.id

              return (
                <Card
                  key={mascota.id}
                  className={`mascota-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectMascota(mascota)}
                >
                  <div className="mascota-image">
                    {mascota.foto ? (
                      <img src={mascota.foto || "/placeholder.svg"} alt={mascota.nombre} />
                    ) : (
                      <div className="mascota-placeholder">
                        <PawPrint size={24} />
                      </div>
                    )}
                  </div>
                  <div className="mascota-info">
                    <h5>{mascota.nombre}</h5>
                    <p className="mascota-details">
                      {mascota.especie} • {mascota.raza} • {mascota.edad} años
                    </p>
                  </div>
                  {isSelected && (
                    <div className="mascota-selected">
                      <CheckCircle size={18} className="text-success" />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        ) : (
          <Alert variant="info" className="py-2">
            <p className="small mb-0">
              Este cliente no tiene mascotas registradas. Por favor, registre una nueva mascota.
            </p>
          </Alert>
        )}

        {requiresMultipleMascotas && (
          <Alert variant="info" className="mt-3 py-2">
            <p className="small mb-0">
              Este servicio permite seleccionar múltiples mascotas. Selecciona todas las mascotas que participarán.
            </p>
          </Alert>
        )}

        <Form.Group className="mt-4">
          <Form.Label>Notas adicionales</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Información adicional sobre la cita..."
            value={notas || ""}
            onChange={(e) => onNotasChange(e.target.value)}
            size="sm"
          />
        </Form.Group>
      </div>

      {formErrors.mascota && <div className="text-danger mt-2 small">{formErrors.mascota}</div>}
      {formErrors.mascotas && <div className="text-danger mt-2 small">{formErrors.mascotas}</div>}

      <div className="step-actions mt-4">
        <Button variant="outline-secondary" size="sm" onClick={onPrev}>
          <ArrowLeft size={14} className="me-1" />
          Atrás
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={requiresMultipleMascotas ? selectedMascotas.length === 0 : !selectedMascota}
        >
          Confirmar Cita
        </Button>
      </div>
    </div>
  )
}
