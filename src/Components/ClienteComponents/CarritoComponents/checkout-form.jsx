"use client"

import { useState, useEffect } from "react"
import { Form, Row, Col, InputGroup, Collapse, Alert, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import CarritoService from "../../../Services/ConsumoCliente/CarritoService"
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary.js"

const CheckoutForm = ({ onPlaceOrder, subtotal, iva, shipping, discount, total }) => {
  // Estado para el formulario de cliente
  const [clientForm, setClientForm] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    ciudad: "Medellín",
    password: "",
    confirmPassword: "",
    notas: "",
    comprobantePago: null,
  })

  // Estado para verificar si el cliente está registrado
  const [isRegistered, setIsRegistered] = useState(false)
  const [showFullForm, setShowFullForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [clientFound, setClientFound] = useState(false)
  const [editingField, setEditingField] = useState({
    telefono: false,
    direccion: false,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [comprobantePrevista, setComprobantePrevista] = useState(null)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [orderError, setOrderError] = useState("")

  const [comprobanteUrl, setComprobanteUrl] = useState("")
  const [comprobanteFile, setComprobanteFile] = useState(null)

  // Verificar si el usuario está logueado
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      loadLoggedInUserData()
    } else {
      setIsLoggedIn(false)
      // Si no está logueado, mostrar formulario completo
      setShowFullForm(true)
    }
  }, [])

  // ✅ CARGAR DATOS DEL USUARIO LOGUEADO CON VALIDACIÓN MEJORADA
  const loadLoggedInUserData = async () => {
    try {
      let userData = JSON.parse(localStorage.getItem("user") || "{}")

      // Si no hay datos completos, intentar obtenerlos del servidor
      if (!userData.Telefono || !userData.Direccion) {
        const idUsuario = userData.IdUsuario || userData.idUsuario || userData.id

        if (idUsuario) {
          console.log("🔍 Obteniendo datos completos del cliente desde el servidor...")

          const token = localStorage.getItem("token")
          const response = await fetch(`http://localhost:3000/api/customers/usuario/${idUsuario}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const clienteData = await response.json()

            // Actualizar userData con los datos completos
            userData = {
              ...userData,
              IdCliente: clienteData.IdCliente,
              Nombre: clienteData.Nombre,
              Apellido: clienteData.Apellido,
              Documento: clienteData.Documento,
              Correo: clienteData.Correo,
              Telefono: clienteData.Telefono,
              Direccion: clienteData.Direccion,
            }

            // Guardar en localStorage
            localStorage.setItem("user", JSON.stringify(userData))
            console.log("✅ Datos del cliente actualizados desde el servidor")
          }
        }
      }

      setIsRegistered(true)
      setClientForm({
        documento: userData.Documento || userData.documento || "",
        correo: userData.Correo || userData.correo || userData.email || "",
        nombre: userData.Nombre || userData.nombre || "",
        apellido: userData.Apellido || userData.apellido || "",
        direccion: userData.Direccion || userData.direccion || "",
        telefono: userData.Telefono || userData.telefono || "",
        ciudad: "Medellín",
        password: "",
        confirmPassword: "",
        notas: "",
        comprobantePago: null,
      })
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
    }
  }

  // Manejar cambio en el documento para buscar cliente
  const handleDocumentoChange = (e) => {
    const value = e.target.value
    setClientForm({
      ...clientForm,
      documento: value,
    })

    // Limpiar errores de validación
    if (validationErrors.documento) {
      setValidationErrors({
        ...validationErrors,
        documento: "",
      })
    }

    // Si el documento tiene al menos 8 caracteres, buscar cliente
    if (value.length >= 8) {
      checkClientExists(value)
    } else {
      setIsRegistered(false)
      setShowFullForm(true)
      setClientFound(false)
    }
  }

  // Manejar cambios en el formulario de cliente
  const handleClientFormChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === "file") {
      if (files && files[0]) {
        setClientForm({
          ...clientForm,
          [name]: files[0],
        })

        const fileReader = new FileReader()
        fileReader.onload = (e) => {
          setComprobantePrevista(e.target.result)
        }
        fileReader.readAsDataURL(files[0])
      }
    } else {
      setClientForm({
        ...clientForm,
        [name]: value,
      })

      // Limpiar errores de validación para el campo actual
      if (validationErrors[name]) {
        setValidationErrors({
          ...validationErrors,
          [name]: "",
        })
      }
    }

    // Validar contraseñas
    if (name === "password" || name === "confirmPassword") {
      validatePasswords(name, value)
    }
  }

  // Validar contraseñas
  const validatePasswords = (field, value) => {
    if (field === "password") {
      const isValid = value.length >= 6
      setValidationErrors({
        ...validationErrors,
        password: !isValid ? "La contraseña debe tener al menos 6 caracteres" : "",
        confirmPassword:
          clientForm.confirmPassword !== value && clientForm.confirmPassword !== ""
            ? "Las contraseñas no coinciden"
            : "",
      })
    } else if (field === "confirmPassword") {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: value !== clientForm.password ? "Las contraseñas no coinciden" : "",
      })
    }
  }

  // Validar el formulario
  const validateForm = () => {
    const errors = {}

    // Documento: requerido si no está logueado, 7-12 dígitos
    if (!isLoggedIn && !clientForm.documento.trim()) {
      errors.documento = "El documento es requerido"
    } else if (!isLoggedIn && !/^\d{7,12}$/.test(clientForm.documento.trim())) {
      errors.documento = "El documento debe tener entre 7 y 12 dígitos numéricos"
    }

    // Correo: requerido, formato válido
    if (!clientForm.correo.trim()) {
      errors.correo = "El correo es requerido"
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(clientForm.correo.trim())) {
      errors.correo = "El correo no tiene un formato válido"
    }

    // Nombre: requerido, mínimo 2 caracteres
    if (!clientForm.nombre.trim()) {
      errors.nombre = "El nombre es requerido"
    } else if (clientForm.nombre.trim().length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    // Apellido: requerido, mínimo 2 caracteres
    if (!clientForm.apellido.trim()) {
      errors.apellido = "El apellido es requerido"
    } else if (clientForm.apellido.trim().length < 2) {
      errors.apellido = "El apellido debe tener al menos 2 caracteres"
    }

    // Dirección: requerido, mínimo 5 caracteres
    if (!clientForm.direccion.trim()) {
      errors.direccion = "La dirección es requerida"
    } else if (clientForm.direccion.trim().length < 5) {
      errors.direccion = "La dirección debe tener al menos 5 caracteres"
    }

    // Teléfono: requerido, 10 dígitos
    if (!clientForm.telefono.trim()) {
      errors.telefono = "El teléfono es requerido"
    } else if (!/^\d{10}$/.test(clientForm.telefono.replace(/\s/g, ""))) {
      errors.telefono = "El teléfono debe tener 10 dígitos"
    }

    // Comprobante de pago: requerido
    if (!clientForm.comprobantePago) {
      errors.comprobantePago = "El comprobante de pago es requerido"
    }

    // Contraseña (solo para usuarios no registrados)
    if (!isRegistered && !isLoggedIn) {
      if (!clientForm.password.trim()) {
        errors.password = "La contraseña es requerida"
      } else if (clientForm.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }
      if (!clientForm.confirmPassword.trim()) {
        errors.confirmPassword = "Debe confirmar la contraseña"
      } else if (clientForm.password !== clientForm.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulario antes de procesar
    if (!validateForm()) {
      setOrderError("Por favor, complete todos los campos requeridos correctamente.")
      return
    }

    setProcessingOrder(true)
    setOrderError("")

    try {
      // Obtener datos del carrito
      const cartItems = await CarritoService.getAll()
      const discountData = CarritoService.getAppliedDiscount()

      // Validar que hay items en el carrito
      if (!cartItems || cartItems.length === 0) {
        setOrderError("No hay productos en el carrito.")
        setProcessingOrder(false)
        return
      }

      // Calcular totales
      const subtotalCalculado = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
      const ivaCalculado = subtotalCalculado * 0.19
      const shippingCalculado = 5000
      const discountCalculado = discountData ? discountData.amount : 0
      const totalCalculado = subtotalCalculado + ivaCalculado + shippingCalculado - discountCalculado

      // Obtener datos del usuario logueado o usar datos del formulario
      let clientData
      if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        clientData = {
          idCliente: userData.IdCliente || userData.idCliente,
          nombre: userData.Nombre || userData.nombre,
          apellido: userData.Apellido || userData.apellido,
          documento: userData.Documento || userData.documento,
          email: userData.Correo || userData.correo || userData.email,
          telefono: clientForm.telefono || userData.Telefono || userData.telefono,
          direccion: clientForm.direccion || userData.Direccion || userData.direccion,
          notas: clientForm.notas,
        }
      } else {
        clientData = {
          nombre: clientForm.nombre,
          apellido: clientForm.apellido,
          documento: clientForm.documento,
          email: clientForm.correo,
          telefono: clientForm.telefono,
          direccion: clientForm.direccion,
          notas: clientForm.notas,
        }
      }

      // Datos del pedido
      const checkoutData = {
        items: cartItems,
        subtotal: subtotalCalculado,
        iva: ivaCalculado,
        shipping: shippingCalculado,
        discount: discountCalculado,
        total: totalCalculado,
        clientData,
        comprobantePago: clientForm.comprobantePago, // <-- Debe ser la URL de Cloudinary
      }

      console.log("CheckoutData antes de enviar:", checkoutData);

      if (!checkoutData.comprobantePago) {
        throw new Error("Comprobante de pago es requerido");
      }

      // Realizar checkout
      const result = await CarritoService.checkout(checkoutData)
      console.log("Respuesta del checkout:", result)

      if (!result || !result.success) {
        setOrderError(
          (result && result.message) ||
            "Hubo un problema al procesar tu pedido. Se guardó localmente para intentar más tarde.",
        )
        setProcessingOrder(false)
        return
      }

      // Llamar a la función onPlaceOrder del componente padre
      if (onPlaceOrder) {
        onPlaceOrder(clientData)
      }

      setProcessingOrder(false)
    } catch (error) {
      console.error("Error en checkout:", error)
      setOrderError("Error de conexión. Por favor, intenta nuevamente.")
      setProcessingOrder(false)
    }
  }

  // Alternar edición de campo
  const toggleFieldEdit = (field) => {
    setEditingField({
      ...editingField,
      [field]: !editingField[field],
    })
  }

  // Guardar cambio de campo
  const saveFieldEdit = (field) => {
    toggleFieldEdit(field)
  }

  // Verificar si el cliente existe
  const checkClientExists = (documento) => {
    // Aquí deberías hacer una consulta real a tu API para buscar el cliente.
    // Por ahora, solo muestra el formulario completo si no está logueado.
    setIsRegistered(false)
    setShowFullForm(true)
  }

  const handleComprobanteChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith("image/")) return
    try {
      const url = await uploadImageToCloudinary(file, "notificaciones") // Usa el folder "notificaciones"
      setComprobanteUrl(url)
      setComprobanteFile(file)
      setClientForm({
        ...clientForm,
        comprobantePago: url, // <-- Aquí debe quedar la URL de Cloudinary
      })
    } catch (err) {
      // Manejo de error
    }
  }

  useEffect(() => {
    // Si el usuario está logueado y el teléfono no es válido, forzar edición
    if (
      isLoggedIn &&
      clientForm.telefono &&
      !/^\d{10}$/.test(clientForm.telefono.replace(/\s/g, ""))
    ) {
      setEditingField((prev) => ({ ...prev, telefono: true }))
    }
  }, [isLoggedIn, clientForm.telefono])

  return (
    <Form id="checkout-form" onSubmit={handleSubmit} noValidate>
      {/* Campo de documento - solo visible si el usuario no está logueado */}
      {!isLoggedIn && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="documento">
              <Form.Label>Documento *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-card-text"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Número de documento"
                  name="documento"
                  value={clientForm.documento}
                  onChange={handleDocumentoChange}
                  isInvalid={!!validationErrors.documento}
                  required={!isLoggedIn}
                />
                <Form.Control.Feedback type="invalid">{validationErrors.documento}</Form.Control.Feedback>
              </InputGroup>
              <Form.Text className="text-muted">
                Si ya estás registrado, tus datos se cargarán automáticamente.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      )}

      {clientFound && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle me-2"></i>
            Cliente encontrado. Datos cargados automáticamente.
          </Alert>
        </motion.div>
      )}

      {/* Información del cliente si está registrado */}
      {isRegistered && (
        <div className="client-info-summary mb-4 p-3 border rounded bg-light">
          <h6 className="mb-3">Información del cliente:</h6>
          <Row>
            <Col md={6}>
              <p className="mb-1">
                <strong>Nombre:</strong> {clientForm.nombre} {clientForm.apellido}
              </p>
              <p className="mb-1">
                <strong>Documento:</strong> {clientForm.documento}
              </p>
              <p className="mb-1">
                <strong>Correo:</strong> {clientForm.correo}
              </p>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>Teléfono:</strong> {!editingField.telefono && clientForm.telefono}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="edit-field-btn p-0"
                  onClick={() => toggleFieldEdit("telefono")}
                >
                  {editingField.telefono ? "Cancelar" : <i className="bi bi-pencil"></i>}
                </Button>
              </div>
              {editingField.telefono && (
                <div className="mb-2">
                  <InputGroup size="sm">
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={clientForm.telefono}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.telefono}
                    />
                    <Button variant="success" onClick={() => saveFieldEdit("telefono")}>
                      <i className="bi bi-check"></i>
                    </Button>
                  </InputGroup>
                  {validationErrors.telefono && (
                    <div className="invalid-feedback d-block">{validationErrors.telefono}</div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>Dirección:</strong> {!editingField.direccion && clientForm.direccion}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="edit-field-btn p-0"
                  onClick={() => toggleFieldEdit("direccion")}
                >
                  {editingField.direccion ? "Cancelar" : <i className="bi bi-pencil"></i>}
                </Button>
              </div>
              {editingField.direccion && (
                <div className="mb-2">
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={clientForm.direccion}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.direccion}
                    />
                    <Button variant="success" onClick={() => saveFieldEdit("direccion")}>
                      <i className="bi bi-check"></i>
                    </Button>
                  </InputGroup>
                  {validationErrors.direccion && (
                    <div className="invalid-feedback d-block">{validationErrors.direccion}</div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </div>
      )}

      {/* Formulario completo si el cliente no está registrado */}
      <Collapse in={showFullForm && !isRegistered}>
        <div>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="correo">
                <Form.Label>Correo electrónico *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-envelope"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
                    name="correo"
                    value={clientForm.correo}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.correo}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.correo}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="telefono">
                <Form.Label>Teléfono *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-telephone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    placeholder="Teléfono (10 dígitos)"
                    name="telefono"
                    value={clientForm.telefono}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.telefono}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.telefono}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="nombre">
                <Form.Label>Nombre *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-person"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    name="nombre"
                    value={clientForm.nombre}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.nombre}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.nombre}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="apellido">
                <Form.Label>Apellido *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-person"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Apellido"
                    name="apellido"
                    value={clientForm.apellido}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.apellido}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.apellido}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="direccion">
                <Form.Label>Dirección de envío *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-geo-alt"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Dirección completa"
                    name="direccion"
                    value={clientForm.direccion}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.direccion}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.direccion}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {!isLoggedIn && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Contraseña *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      name="password"
                      value={clientForm.password}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.password}
                      required={!isRegistered && !isLoggedIn}
                    />
                    <Form.Control.Feedback type="invalid">{validationErrors.password}</Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="confirmPassword">
                  <Form.Label>Confirmar Contraseña *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-lock-fill"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Confirmar contraseña"
                      name="confirmPassword"
                      value={clientForm.confirmPassword}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.confirmPassword}
                      required={!isRegistered && !isLoggedIn}
                    />
                    <Form.Control.Feedback type="invalid">{validationErrors.confirmPassword}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          )}
        </div>
      </Collapse>

      {/* Campo para subir comprobante de pago */}
      <Form.Group controlId="comprobantePago" className="mb-3">
        <Form.Label>Comprobante de pago *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-receipt"></i>
          </InputGroup.Text>
          <Form.Control
            type="file"
            name="comprobantePago"
            onChange={handleComprobanteChange}
            accept="image/*"
            isInvalid={!!validationErrors.comprobantePago}
            required
          />
          <Form.Control.Feedback type="invalid">{validationErrors.comprobantePago}</Form.Control.Feedback>
        </InputGroup>
        <Form.Text className="text-muted">Sube una imagen del comprobante de pago (transferencia bancaria).</Form.Text>

        {/* Vista previa del comprobante */}
        {comprobanteUrl && (
          <div className="mt-2 comprobante-preview">
            <p className="mb-1">
              <small>Vista previa:</small>
            </p>
            <div className="border rounded p-2 text-center">
              <img
                src={comprobanteUrl || "/placeholder.svg"}
                alt="Vista previa del comprobante"
                className="img-fluid"
                style={{ maxHeight: "200px" }}
              />
            </div>
          </div>
        )}
      </Form.Group>

      <Form.Group controlId="notas" className="mb-3">
        <Form.Label>Notas adicionales</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Instrucciones especiales para la entrega, referencias, etc."
          name="notas"
          value={clientForm.notas}
          onChange={handleClientFormChange}
        />
      </Form.Group>

      {/* Mostrar errores del pedido */}
      {orderError && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {orderError}
        </Alert>
      )}

      <Button type="submit" variant="primary" className="w-100" disabled={processingOrder}>
        {processingOrder ? (
          <span>
            <i className="bi bi-arrow-clockwise spinner-border" role="status" aria-hidden="true"></i>{" "}
            Procesando...
          </span>
        ) : (
          "Realizar pedido"
        )}
      </Button>
    </Form>
  )
}

export default CheckoutForm
