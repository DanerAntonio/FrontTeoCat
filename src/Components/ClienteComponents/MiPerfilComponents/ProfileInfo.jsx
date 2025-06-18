"use client"

import { useState } from "react"
import { Card, Button, Form, Row, Col } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfileInfo.scss"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"

const ProfileInfo = ({ user, updateUser }) => {
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({ ...user })

  // Add loading state:
  const [saving, setSaving] = useState(false)

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Guardar cambios del perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updatedUser = await perfilClienteService.updateMyProfile(formData)

      // ✅ RECARGAR LOS DATOS DEL PERFIL COMPLETO
      const profileData = await perfilClienteService.getMyProfile()

      // ✅ PROCESAR TELÉFONOS Y DIRECCIONES CORRECTAMENTE
      const processedUser = {
        ...profileData,
        telefonos: perfilClienteService.processPhoneNumbers(profileData.Telefono || profileData.telefono),
        direcciones: perfilClienteService.processAddresses(profileData.Direccion || profileData.direccion),
      }

      updateUser(processedUser)
      setIsEditing(false)
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const validarProfileInfo = (formData) => {
    const errores = {}
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errores.nombre = "El nombre es obligatorio y debe tener al menos 2 caracteres."
    }
    if (!formData.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email)) {
      errores.email = "Ingrese un correo electrónico válido."
    }
    // ...otros campos según tu formulario
    return errores
  }

  return (
    <Card className="border-0 shadow mb-4">
      <Card.Header className="tc-profile-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Información Personal</h4>
          <Button
            variant={isEditing ? "outline-secondary" : "success"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                setFormData({ ...user })
              }
              setIsEditing(!isEditing)
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
          <Form onSubmit={handleSaveProfile}>
            <Row className="mb-3">
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="documento">
                  <Form.Label>Documento</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-card-text"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={formData.documento}
                      disabled
                      className="bg-light"
                    />
                  </div>
                  <Form.Text className="text-muted">El documento no se puede modificar</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="correo">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="apellido">
                  <Form.Label>Apellido</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </Form>
        ) : (
          <div className="tc-profile-info">
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Documento</h6>
                  <p className="tc-info-value">{user.documento}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Correo Electrónico</h6>
                  <p className="tc-info-value">{user.correo}</p>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Nombre</h6>
                  <p className="tc-info-value">{user.nombre}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Apellido</h6>
                  <p className="tc-info-value">{user.apellido}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProfileInfo
