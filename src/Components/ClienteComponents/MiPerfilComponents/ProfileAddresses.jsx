"use client"

import { useState } from "react"
import { Card, Button, Form, Row, Col } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfileAddresses.scss"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService.js"

const ProfileAddresses = ({ user, updateUser }) => {
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false)

  // Estado para las direcciones (inicializar con array vacío si no existe)
  const [addresses, setAddresses] = useState(user.direcciones || [])

  // Estado para nueva dirección
  const [newAddress, setNewAddress] = useState("")

  // Estado de carga
  const [saving, setSaving] = useState(false)

  // Agregar nueva dirección
  const handleAddAddress = () => {
    if (newAddress.trim()) {
      const newAddressObj = {
        id: Date.now(), // ID temporal
        direccion: newAddress.trim(),
        principal: addresses.length === 0, // Primera dirección es principal
      }
      setAddresses([...addresses, newAddressObj])
      setNewAddress("")
    }
  }

  // Eliminar dirección
  const handleRemoveAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
  }

  // Marcar como principal
  const handleSetPrincipal = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        principal: addr.id === id,
      })),
    )
  }

  // ✅ GUARDAR DIRECCIONES EN LA BASE DE DATOS
  const handleSaveAddresses = async () => {
    setSaving(true)
    try {
      // Convertir array de direcciones a string separado por |
      const addressesString = perfilClienteService.formatAddressesForAPI(addresses)

      // Actualizar en el backend
      const updatedData = {
        direccion: addressesString,
      }

      await perfilClienteService.updateMyProfile(updatedData)

      // Recargar datos del perfil
      const profileData = await perfilClienteService.getMyProfile()
      const processedUser = {
        ...profileData,
        telefonos: perfilClienteService.processPhoneNumbers(profileData.Telefono || profileData.telefono),
        direcciones: perfilClienteService.processAddresses(profileData.Direccion || profileData.direccion),
      }

      updateUser(processedUser)
      setIsEditing(false)
      toast.success("Direcciones actualizadas correctamente")
    } catch (error) {
      console.error("Error al guardar direcciones:", error)
      toast.error("Error al guardar las direcciones")
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edición
  const handleCancel = () => {
    setAddresses(user.direcciones || [])
    setNewAddress("")
    setIsEditing(false)
  }

  return (
    <Card className="border-0 shadow mb-4">
      <Card.Header className="tc-profile-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Direcciones</h4>
          <Button
            variant={isEditing ? "outline-secondary" : "success"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleCancel()
              } else {
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? (
              <>
                <i className="bi bi-x-circle me-1"></i> Cancelar
              </>
            ) : (
              <>
                <i className="bi bi-pencil me-1"></i> Editar
              </>
            )}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {isEditing ? (
          <>
            {/* Lista de direcciones existentes */}
            {addresses.map((address) => (
              <div key={address.id} className="address-item mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="mb-1">{address.direccion}</p>
                    {address.principal && <span className="badge bg-success">Principal</span>}
                  </div>
                  <div className="d-flex gap-2">
                    {!address.principal && (
                      <Button variant="outline-primary" size="sm" onClick={() => handleSetPrincipal(address.id)}>
                        Marcar como principal
                      </Button>
                    )}
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveAddress(address.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Agregar nueva dirección */}
            <div className="add-address-form mb-3">
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Nueva dirección"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddAddress()
                      }
                    }}
                  />
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={handleAddAddress}
                    disabled={!newAddress.trim()}
                    className="w-100"
                  >
                    <i className="bi bi-plus-circle me-1"></i> Agregar
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Botón guardar */}
            <div className="text-end">
              <Button variant="success" onClick={handleSaveAddresses} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Guardar Direcciones
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="tc-addresses-info">
            {addresses && addresses.length > 0 ? (
              addresses.map((address) => (
                <div key={address.id} className="address-item mb-2">
                  <p className="mb-1">{address.direccion}</p>
                  {address.principal && <span className="badge bg-success">Principal</span>}
                </div>
              ))
            ) : (
              <p className="text-muted">No hay direcciones registradas</p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProfileAddresses
