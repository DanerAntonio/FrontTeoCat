"use client"

import { useState } from "react"
import { Card, Form, Button } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfilePassword.scss"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService.js"

const ProfilePassword = () => {
  // Estado para el formulario de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Estado para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  // Add loading state:
  const [loading, setLoading] = useState(false)

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    })
  }

  // Alternar visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    })
  }

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validar que las contraseñas coincidan
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (passwordForm.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      await perfilClienteService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      // Resetear el formulario
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Contraseña actualizada correctamente")
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error al cambiar la contraseña. Verifica tu contraseña actual.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow">
      <Card.Header className="tc-profile-card-header">
        <h4 className="mb-0">Cambiar Contraseña</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleChangePassword}>
          <Form.Group className="mb-3" controlId="oldPassword">
            <Form.Label>Contraseña Antigua</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-shield-lock"></i>
              </span>
              <Form.Control
                type={showPasswords.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
              />
              <Button variant="outline-secondary" onClick={() => togglePasswordVisibility("oldPassword")}>
                <i className={`bi ${showPasswords.oldPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>Nueva Contraseña</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-shield-lock"></i>
              </span>
              <Form.Control
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <Button variant="outline-secondary" onClick={() => togglePasswordVisibility("newPassword")}>
                <i className={`bi ${showPasswords.newPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </Button>
            </div>
            <Form.Text className="text-muted">La contraseña debe tener al menos 8 caracteres</Form.Text>
          </Form.Group>

          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label>Repetir Contraseña</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-shield-lock"></i>
              </span>
              <Form.Control
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              <Button variant="outline-secondary" onClick={() => togglePasswordVisibility("confirmPassword")}>
                <i className={`bi ${showPasswords.confirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </Button>
            </div>
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                "Actualizar Contraseña"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default ProfilePassword
