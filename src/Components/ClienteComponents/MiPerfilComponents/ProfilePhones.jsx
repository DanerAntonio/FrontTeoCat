"use client"

import { useState } from "react"
import { Card, Button, Form, Row, Col } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfilePhones.scss"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService.js"

const ProfilePhones = ({ user, updateUser }) => {
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false)

  // Estado para los teléfonos (inicializar con array vacío si no existe)
  const [phones, setPhones] = useState(user.telefonos || [])

  // Estado para nuevo teléfono
  const [newPhone, setNewPhone] = useState("")

  // Estado de carga
  const [saving, setSaving] = useState(false)

  // Agregar nuevo teléfono
  const handleAddPhone = () => {
    if (newPhone.trim()) {
      const newPhoneObj = {
        id: Date.now(), // ID temporal
        numero: newPhone.trim(),
        principal: phones.length === 0, // Primer teléfono es principal
      }
      setPhones([...phones, newPhoneObj])
      setNewPhone("")
    }
  }

  // Eliminar teléfono
  const handleRemovePhone = (id) => {
    setPhones(phones.filter((phone) => phone.id !== id))
  }

  // Marcar como principal
  const handleSetPrincipal = (id) => {
    setPhones(
      phones.map((phone) => ({
        ...phone,
        principal: phone.id === id,
      })),
    )
  }

  // ✅ GUARDAR TELÉFONOS EN LA BASE DE DATOS
  const handleSavePhones = async () => {
    setSaving(true)
    try {
      // Convertir array de teléfonos a string separado por |
      const phonesString = perfilClienteService.formatPhonesForAPI(phones)

      // Actualizar en el backend
      const updatedData = {
        telefono: phonesString,
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
      toast.success("Teléfonos actualizados correctamente")
    } catch (error) {
      console.error("Error al guardar teléfonos:", error)
      toast.error("Error al guardar los teléfonos")
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edición
  const handleCancel = () => {
    setPhones(user.telefonos || [])
    setNewPhone("")
    setIsEditing(false)
  }

  return (
    <Card className="border-0 shadow mb-4">
      <Card.Header className="tc-profile-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Teléfonos</h4>
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
            {/* Lista de teléfonos existentes */}
            {phones.map((phone) => (
              <div key={phone.id} className="phone-item mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="mb-1">{phone.numero}</p>
                    {phone.principal && <span className="badge bg-success">Principal</span>}
                  </div>
                  <div className="d-flex gap-2">
                    {!phone.principal && (
                      <Button variant="outline-primary" size="sm" onClick={() => handleSetPrincipal(phone.id)}>
                        Marcar como principal
                      </Button>
                    )}
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemovePhone(phone.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Agregar nuevo teléfono */}
            <div className="add-phone-form mb-3">
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="tel"
                    placeholder="Nuevo teléfono"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddPhone()
                      }
                    }}
                  />
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={handleAddPhone}
                    disabled={!newPhone.trim()}
                    className="w-100"
                  >
                    <i className="bi bi-plus-circle me-1"></i> Agregar
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Botón guardar */}
            <div className="text-end">
              <Button variant="success" onClick={handleSavePhones} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Guardar Teléfonos
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="tc-phones-info">
            {phones && phones.length > 0 ? (
              phones.map((phone) => (
                <div key={phone.id} className="phone-item mb-2">
                  <p className="mb-1">{phone.numero}</p>
                  {phone.principal && <span className="badge bg-success">Principal</span>}
                </div>
              ))
            ) : (
              <p className="text-muted">No hay teléfonos registrados</p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProfilePhones
