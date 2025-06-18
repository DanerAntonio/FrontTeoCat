"use client"

// carrito-page.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Container, Row, Col, Card, Button, Table, Form, Badge, Collapse, Modal, Alert } from "react-bootstrap"
import { motion, AnimatePresence } from "framer-motion"
import CartItem from "../../Components/ClienteComponents/CarritoComponents/cart-item"
import CheckoutForm from "../../Components/ClienteComponents/CarritoComponents/checkout-form"
import "../../Pages/ClientePages/carrito-page.scss"
import { QRCodeSVG } from "qrcode.react"
import CarritoService from "../../Services/ConsumoCliente/CarritoService"

const CarritoPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountCode, setDiscountCode] = useState("")
  const [discountMessage, setDiscountMessage] = useState("")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [iva, setIva] = useState(0)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [orderError, setOrderError] = useState(null)

  // Cargar items del carrito
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true)
        const items = await CarritoService.getAll()
        setCartItems(items)

        // Cargar descuento aplicado previamente
        const appliedDiscount = CarritoService.getAppliedDiscount()
        if (appliedDiscount) {
          setDiscount(appliedDiscount.amount)
          setDiscountCode(appliedDiscount.code)
          setDiscountMessage(appliedDiscount.message)
        }
      } catch (err) {
        console.error("Error al cargar el carrito:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCartItems()

    // Escuchar cambios en el carrito
    const handleCartUpdate = (e) => setCartItems(e.detail)
    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  // Calcular totales cuando cambian los items o el descuento
  useEffect(() => {
    // Calcular subtotal
    const calculatedSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Calcular IVA (19% sobre el subtotal)
    const calculatedIva = Math.round(calculatedSubtotal * 0.19)

    // Establecer costo de envío (gratis si el subtotal es mayor a 100000)
    const shippingCost = calculatedSubtotal > 100000 ? 0 : 12000

    // Actualizar estados
    setSubtotal(calculatedSubtotal)
    setIva(calculatedIva)
    setShipping(shippingCost)
    setTotal(calculatedSubtotal + calculatedIva + shippingCost - discount)
  }, [cartItems, discount])

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return

    try {
      // Actualizar la UI inmediatamente para mejor experiencia
      const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      setCartItems(updatedCart)

      // Luego actualizar en localStorage
      await CarritoService.updateQuantity(id, newQuantity)
    } catch (err) {
      console.error("Error al actualizar cantidad:", err)
      // Recargar el carrito en caso de error
      const items = await CarritoService.getAll()
      setCartItems(items)
    }
  }

  const removeItem = async (id) => {
    try {
      // Actualizar la UI inmediatamente
      const updatedCart = cartItems.filter((item) => item.id !== id)
      setCartItems(updatedCart)

      // Luego eliminar de localStorage
      await CarritoService.removeItem(id)
    } catch (err) {
      console.error("Error al eliminar producto:", err)
      // Recargar el carrito en caso de error
      const items = await CarritoService.getAll()
      setCartItems(items)
    }
  }

  const clearCart = async () => {
    try {
      // Actualizar la UI inmediatamente
      setCartItems([])

      // Luego vaciar localStorage
      await CarritoService.clearCart()

      // Limpiar también el descuento
      setDiscount(0)
      setDiscountCode("")
      setDiscountMessage("")
    } catch (err) {
      console.error("Error al vaciar carrito:", err)
    }
  }

  const handleApplyDiscount = async (e) => {
    e.preventDefault()

    if (!discountCode.trim()) return

    try {
      setApplyingDiscount(true)
      const result = await CarritoService.applyDiscount(discountCode)

      if (result.success) {
        setDiscount(result.discount)
        setDiscountMessage(result.message)
      } else {
        setDiscountMessage(result.message)
      }
    } catch (err) {
      console.error("Error al aplicar descuento:", err)
      setDiscountMessage("Error al aplicar el código de descuento")
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handlePlaceOrder = async (clientData) => {
    try {
      setProcessingOrder(true)
      setOrderError(null)

      // Preparar datos para el checkout
      const checkoutData = {
        clientData,
        items: cartItems,
        subtotal,
        iva,
        shipping,
        discount,
        total,
        comprobantePago: clientData.comprobantePago, // <-- AGREGA ESTA LÍNEA
      }

      // Realizar el checkout
      const result = await CarritoService.checkout(checkoutData)

      if (!result.success) {
        setOrderError(
          result.message || "Hubo un problema al procesar tu pedido. Se guardó localmente para intentar más tarde.",
        )
        setProcessingOrder(false)
        return
      }

      // Guardar datos del pedido para mostrarlos
      setOrderData(result.data)

      // Mostrar confirmación y limpiar carrito
      setOrderPlaced(true)
      localStorage.setItem("teocat_order_placed", "true")
      setCartItems([])
      setProcessingOrder(false)

      // Cerrar el modal de checkout
      setShowCheckoutModal(false)

      // Simular redirección después de unos segundos
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 500)
    } catch (err) {
      console.error("Error al procesar el pedido:", err)
      setOrderError("Hubo un problema al procesar tu pedido. Por favor, intenta nuevamente.")
      setProcessingOrder(false)
    }
  }

  // Función para mostrar información de pago
  const handleShowPaymentInfo = () => {
    setShowPaymentInfo(true)
  }

  useEffect(() => {
    if (localStorage.getItem("teocat_order_placed") === "true") {
      setOrderPlaced(true)
      localStorage.removeItem("teocat_order_placed")
    }
  }, [])

  if (loading) {
    return (
      <Container className="py-5 mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando tu carrito...</p>
      </Container>
    )
  }

  if (orderPlaced) {
    return (
      <Container className="py-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center order-success"
        >
          <div className="success-icon mb-4">
            <i className="bi bi-check-circle"></i>
          </div>
          <h2 className="mb-3">¡Pedido realizado con éxito!</h2>
          <p className="mb-4">Gracias por tu compra. Hemos recibido tu pedido y estamos procesándolo.</p>

          {orderData && (
            <Card className="mb-4 text-start">
              <Card.Header>
                <h5 className="mb-0">Resumen del Pedido #{orderData.id}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Fecha:</strong> {new Date(orderData.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Cliente:</strong> {orderData.clientData.nombre} {orderData.clientData.apellido}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {orderData.clientData.direccion}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Subtotal:</strong> ${orderData.subtotal.toLocaleString()}
                    </p>
                    <p>
                      <strong>IVA:</strong> ${orderData.iva.toLocaleString()}
                    </p>
                    <p>
                      <strong>Envío:</strong> ${orderData.shipping.toLocaleString()}
                    </p>
                    {orderData.discount > 0 && (
                      <p>
                        <strong>Descuento:</strong> -${orderData.discount.toLocaleString()}
                      </p>
                    )}
                    <p>
                      <strong>Total:</strong> ${orderData.total.toLocaleString()}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-primary btn-teocat">
              Volver al inicio
            </Link>
            <Link to="/perfil?tab=orders" className="btn btn-outline-primary btn-teocat-outline">
              Ver mis pedidos
            </Link>
          </div>
        </motion.div>
      </Container>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center empty-cart"
        >
          <div className="empty-cart-icon mb-4">
            <i className="bi bi-cart-x"></i>
          </div>
          <h2 className="mb-3">Tu carrito está vacío</h2>
          <p className="mb-4">Parece que aún no has añadido productos a tu carrito.</p>
          <Link to="/catalogo" className="btn btn-primary btn-teocat btn-lg">
            Explorar productos
          </Link>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container className="py-5 mt-5 carrito-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-cart3 me-2 cart-icon"></i>
          <h2 className="page-title mb-0">Carrito de Compras</h2>
        </div>

        <Row className="g-4">
          {/* Productos en el carrito */}
          <Col lg={8}>
            <Card className="cart-items-card border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="table-responsive">
                  <Table className="cart-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {cartItems.map((item) => (
                          <CartItem key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <Button variant="outline-danger" onClick={clearCart} className="btn-clear-cart">
                    <i className="bi bi-trash me-2"></i> Vaciar Carrito
                  </Button>
                  <Link to="/catalogo" className="btn btn-outline-primary btn-continue-shopping">
                    <i className="bi bi-arrow-left me-2"></i> Seguir Comprando
                  </Link>
                </div>
              </Card.Footer>
            </Card>

            {/* Formulario de checkout */}
            <AnimatePresence>
              {showCheckout && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="checkout-form-card border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-0">
                      <h4 className="mb-0">Información de Envío</h4>
                    </Card.Header>
                    <Card.Body>
                      <CheckoutForm
                        onPlaceOrder={handlePlaceOrder}
                        subtotal={subtotal}
                        iva={iva}
                        shipping={shipping}
                        discount={discount}
                        total={total}
                      />
                    </Card.Body>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>

          {/* Resumen de la orden */}
          <Col lg={4}>
            <Card className="order-summary-card border-0 shadow-sm mb-4 sticky-top" style={{ top: "90px" }}>
              <Card.Body>
                <h5 className="card-title mb-4">
                  <i className="bi bi-receipt me-2"></i>
                  Resumen de la Orden
                </h5>

                <div className="summary-item d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>

                <div className="summary-item d-flex justify-content-between mb-2">
                  <span>IVA</span>
                  <span>${iva.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-item d-flex justify-content-between mb-2 text-success">
                    <span>Descuento</span>
                    <span>-${discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="summary-item d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge bg="success" className="shipping-badge">
                        Gratis
                      </Badge>
                    ) : (
                      `$${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                <hr />

                <div className="summary-total d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total</span>
                  <span className="total-price">${total.toLocaleString()}</span>
                </div>

                <Button variant="primary" className="btn-teocat w-100" onClick={handleShowPaymentInfo}>
                  Realizar Pedido
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Modal de información de pago */}
      <Modal show={showPaymentInfo} onHide={() => setShowPaymentInfo(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Información de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="payment-info-alert">
            <Row>
              <Col md={7}>
                <div className="d-flex align-items-center mb-3">
                  <div className="payment-info-icon me-3">
                    <i className="bi bi-bank"></i>
                  </div>
                  <h5 className="mb-0">Método de Pago: Transferencia Bancaria</h5>
                </div>
                <p>
                  Para completar tu compra, debes realizar una transferencia bancaria a la cuenta de Teo/Cat. Una vez
                  realizada la transferencia, el administrador verificará el comprobante de pago antes de procesar tu
                  pedido.
                </p>
                <div className="bank-details p-3 mb-3 border rounded bg-light">
                  <h6 className="mb-3">Datos Bancarios:</h6>
                  <p className="mb-1">
                    <strong>Banco:</strong> Banco de Ejemplo
                  </p>
                  <p className="mb-1">
                    <strong>Titular:</strong> Teo/Cat
                  </p>
                  <p className="mb-1">
                    <strong>Tipo de Cuenta:</strong> Ahorros
                  </p>
                  <p className="mb-1">
                    <strong>Número de Cuenta:</strong> 123-456789-0
                  </p>
                  <p className="mb-0">
                    <strong>Valor a Transferir:</strong> ${total.toLocaleString()}
                  </p>
                </div>
                <p className="mb-2">
                  <strong>Importante:</strong> El comprobante de pago será verificado automáticamente por el
                  administrador. Solo en caso de que el administrador no pueda verificar el comprobante, deberás
                  enviarlo por WhatsApp.
                </p>
              </Col>
              <Col md={5} className="d-flex flex-column align-items-center justify-content-center">
                <div className="qr-code-container mb-3 p-3 border rounded bg-white">
                  {/* Código QR real generado con la librería */}
                  <QRCodeSVG
                    value={`Banco: Banco de Ejemplo\nTitular: Teo/Cat\nCuenta: 123-456789-0\nValor: $${total.toLocaleString()}`}
                    size={200}
                    bgColor={"#FFFFFF"}
                    fgColor={"#5a3921"}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-center mb-0">
                  <small>Escanea este código QR para realizar el pago</small>
                </p>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="primary"
                className="btn-teocat"
                onClick={() => {
                  setShowPaymentInfo(false)
                  setShowCheckoutModal(true)
                }}
              >
                Continuar con el pedido
              </Button>
            </div>
          </Alert>
        </Modal.Body>
      </Modal>

      {/* Modal de checkout */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Información de Envío</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderError && (
            <Alert variant="danger" className="mb-4">
              <div className="d-flex">
                <div className="me-3">
                  <i className="bi bi-exclamation-circle-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1">Error en el Pedido</h6>
                  <p className="mb-0">{orderError}</p>
                </div>
              </div>
            </Alert>
          )}

          <Alert variant="warning" className="mb-4">
            <div className="d-flex">
              <div className="me-3">
                <i className="bi bi-exclamation-triangle-fill fs-4"></i>
              </div>
              <div>
                <h6 className="mb-1">Recordatorio de Pago</h6>
                <p className="mb-0">
                  Tu pedido será procesado una vez que el administrador verifique tu comprobante de pago. Si el
                  administrador no puede verificar el comprobante, deberás enviarlo por WhatsApp.
                </p>
              </div>
            </div>
          </Alert>

          <CheckoutForm
            onPlaceOrder={handlePlaceOrder}
            subtotal={subtotal}
            iva={iva}
            shipping={shipping}
            discount={discount}
            total={total}
          />

          <div className="terms-section mt-3">
            <Form.Check
              type="checkbox"
              id="terms-checkbox"
              label={
                <span>
                  Acepto los{" "}
                  <Button variant="link" className="terms-link p-0" onClick={() => setShowTerms(!showTerms)}>
                    términos y condiciones
                  </Button>
                </span>
              }
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mb-3"
              disabled={processingOrder}
            />

            <Collapse in={showTerms}>
              <div className="terms-content mb-3">
                <Card className="terms-card">
                  <Card.Body>
                    <h6>Términos y Condiciones</h6>
                    <p className="small mb-2">Al realizar una compra en Teo/Cat, aceptas los siguientes términos:</p>
                    <ul className="small terms-list">
                      <li>Los tiempos de entrega son de 1-3 días hábiles en Medellín y área metropolitana.</li>
                      <li>El pago se procesa de forma segura a través de nuestras pasarelas de pago.</li>
                      <li>Las devoluciones deben solicitarse dentro de los 30 días posteriores a la compra.</li>
                      <li>
                        Los productos para mascotas no pueden ser devueltos una vez abiertos por razones de higiene.
                      </li>
                      <li>Tus datos personales serán tratados de acuerdo a nuestra política de privacidad.</li>
                    </ul>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckoutModal(false)} disabled={processingOrder}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="btn-teocat"
            disabled={!termsAccepted || processingOrder}
            form="checkout-form"
            type="submit"
          >
            {processingOrder ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : (
              "Realizar Pedido"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CarritoPage
