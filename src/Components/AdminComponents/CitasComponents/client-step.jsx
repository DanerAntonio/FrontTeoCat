"use client"

import { useState } from "react"
import { User, ArrowLeft, CheckCircle, UserPlus } from "lucide-react"
import { Form, InputGroup, Button, Alert, Card } from "react-bootstrap"

export const ClientStep = ({
  clientes,
  selectedCliente,
  onClienteChange,
  formErrors,
  onNext,
  onPrev,
  onNewCliente,
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar clientes según el término de búsqueda
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm)),
  )

  const validarCliente = (formData) => {
    const errores = {}
    if (!formData.clienteId) {
      errores.clienteId = "Debe seleccionar un cliente."
    }
    return errores
  }

  return (
    <div className="step-container">
      <div className="step-number">
        <span>3</span>
      </div>
      <h3 className="step-title">Información del Cliente</h3>

      <div className="cliente-container">
        <Form.Group className="mb-3">
          <Form.Label>Buscar cliente</Form.Label>
          <InputGroup size="sm">
            <Form.Control
              type="text"
              placeholder="Nombre o teléfono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
            <Button variant="outline-primary" className="d-flex align-items-center" onClick={onNewCliente} size="sm">
              <UserPlus size={14} className="me-1" />
              Nuevo Cliente
            </Button>
          </InputGroup>
          <Form.Text className="text-muted small">Busca un cliente existente o crea uno nuevo</Form.Text>
        </Form.Group>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Selecciona un cliente:</h5>
        </div>

        <div className="clientes-list">
          {filteredClientes.length > 0 ? (
            filteredClientes.map((cliente) => {
              const isSelected = selectedCliente && selectedCliente.id === cliente.id

              return (
                <Card
                  key={cliente.id}
                  className={`cliente-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onClienteChange(cliente)}
                >
                  <div className="cliente-avatar">
                    {cliente.foto ? (
                      <img src={cliente.foto || "//vite.svg
?height=100&width=100"} alt={cliente.nombre} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="cliente-info">
                    <h5>{cliente.nombre}</h5>
                    <p className="cliente-telefono">{cliente.telefono}</p>
                    <p className="cliente-mascotas">
                      {cliente.mascotas && cliente.mascotas.length > 0
                        ? cliente.mascotas.map((m) => m.nombre).join(", ")
                        : "Ninguna"}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="cliente-selected">
                      <CheckCircle size={18} className="text-success" />
                    </div>
                  )}
                </Card>
              )
            })
          ) : (
            <Alert variant="info" className="py-2">
              <p className="small mb-0">
                No se encontraron clientes. Intenta con otro término de búsqueda o crea un nuevo cliente.
              </p>
            </Alert>
          )}
        </div>
      </div>

      {formErrors.cliente && <div className="text-danger mt-2 small">{formErrors.cliente}</div>}

      <div className="step-actions mt-4">
        <Button variant="outline-secondary" size="sm" onClick={onPrev}>
          <ArrowLeft size={14} className="me-1" />
          Atrás
        </Button>
        <Button variant="primary" size="sm" onClick={onNext} disabled={!selectedCliente}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
