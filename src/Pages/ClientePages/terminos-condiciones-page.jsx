"use client"

import { Container, Row, Col, Card } from "react-bootstrap"
import "./terminos-condiciones-page.scss"

const TerminosCondicionesPage = () => {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="terminos-page">
      <div className="page-header">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <h1 className="page-title text-center">Términos y Condiciones</h1>
              <div className="divider"></div>
              <p className="text-center lead">
                Bienvenido/a a Teo/Cat, tu tienda en línea de productos para mascotas. Al utilizar nuestro sitio web y
                realizar compras a través de él, aceptas los siguientes Términos y Condiciones.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="terms-card mb-4">
              <Card.Body>
                <div className="last-updated mb-4">
                  <i className="bi bi-calendar3 me-2"></i>
                  Fecha de entrada en vigor: {currentDate}
                </div>

                <section className="terms-section">
                  <h2>1. Alcance de los Servicios</h2>
                  <p>
                    Teo/Cat es una tienda en línea que ofrece productos para mascotas, incluyendo alimentos, accesorios
                    y otros artículos relacionados. A través de nuestra plataforma, los usuarios pueden realizar
                    pedidos, los cuales serán procesados una vez confirmado el pago.
                  </p>
                </section>

                <section className="terms-section">
                  <h2>2. Registro y Cuenta de Usuario</h2>
                  <ul>
                    <li>
                      Para realizar compras, podrás registrarte en nuestra plataforma o hacer el pedido como invitado.
                    </li>
                    <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</li>
                    <li>Teo/Cat no se hace responsable por el uso indebido de tu cuenta por terceros.</li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>3. Proceso de Compra</h2>
                  <ol>
                    <li>
                      <strong>Selección de productos:</strong> El cliente elige los productos y los añade al carrito.
                    </li>
                    <li>
                      <strong>Confirmación del pedido:</strong> Se revisan los datos (productos, cantidades, dirección
                      de envío).
                    </li>
                    <li>
                      <strong>Método de pago:</strong>
                      <ul>
                        <li>
                          El pago se realiza únicamente por transferencia bancaria a la cuenta proporcionada por
                          Teo/Cat.
                        </li>
                        <li>
                          El cliente debe enviar el comprobante de pago a través de la plataforma o por los medios de
                          contacto oficiales (correo electrónico, WhatsApp, etc.).
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Verificación del pago:</strong>
                      <ul>
                        <li>
                          Una vez recibido y confirmado el comprobante, el pedido cambiará de estado y se procederá al
                          envío.
                        </li>
                        <li>Si el pago no es verificado en un plazo razonable, el pedido podrá ser cancelado.</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <section className="terms-section">
                  <h2>4. Precios y Facturación</h2>
                  <ul>
                    <li>
                      Los precios mostrados en la plataforma están en pesos colombianos (COP) e incluyen impuestos
                      aplicables, salvo que se indique lo contrario.
                    </li>
                    <li>
                      Teo/Cat se reserva el derecho de modificar precios en cualquier momento, excepto para pedidos ya
                      confirmados.
                    </li>
                    <li>Se emitirá una factura electrónica una vez completado el pago.</li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>5. Envíos y Entregas</h2>
                  <ul>
                    <li>Los plazos de entrega varían según la ubicación y disponibilidad de los productos.</li>
                    <li>El cliente debe proporcionar una dirección de envío correcta y completa.</li>
                    <li>
                      Teo/Cat no se responsabiliza por retrasos causados por la empresa de transporte o por datos
                      incorrectos proporcionados por el cliente.
                    </li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>6. Devoluciones y Reembolsos</h2>
                  <ul>
                    <li>
                      <strong>Productos defectuosos o errores en el pedido:</strong>
                      <ul>
                        <li>
                          Se aceptan devoluciones dentro de los 2 días posteriores a la recepción, siempre que el
                          producto esté en su estado original.
                        </li>
                        <li>El cliente debe contactarnos para gestionar el cambio o reembolso.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Cambios de opinión:</strong> No se aceptan devoluciones por este motivo, salvo excepciones
                      evaluadas por Teo/Cat.
                    </li>
                    <li>
                      <strong>Reembolsos:</strong> En caso de aprobarse, se realizarán en un plazo de 5 días hábiles,
                      descontando posibles gastos de envío.
                    </li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>7. Disponibilidad de Productos</h2>
                  <ul>
                    <li>La disponibilidad de los productos está sujeta a stock.</li>
                    <li>
                      Si un producto no está disponible, Teo/Cat se comunicará con el cliente para ofrecer una
                      alternativa o cancelar ese ítem del pedido.
                    </li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>8. Privacidad y Protección de Datos</h2>
                  <ul>
                    <li>
                      Los datos personales proporcionados serán tratados conforme a nuestra Política de Privacidad,
                      disponible en el sitio web.
                    </li>
                    <li>
                      Teo/Cat no compartirá información personal con terceros sin consentimiento, excepto cuando sea
                      necesario para el procesamiento del pedido (ej. empresas de envío).
                    </li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>9. Modificaciones de los Términos y Condiciones</h2>
                  <p>
                    Teo/Cat podrá actualizar estos términos en cualquier momento. Los cambios entrarán en vigor una vez
                    publicados en la plataforma.
                  </p>
                </section>

                <section className="terms-section">
                  <h2>10. Responsabilidad</h2>
                  <ul>
                    <li>
                      Teo/Cat no se hace responsable por daños o perjuicios derivados del uso incorrecto de los
                      productos adquiridos.
                    </li>
                    <li>
                      No garantizamos la disponibilidad ininterrumpida del sitio web, aunque haremos esfuerzos
                      razonables para mantenerlo operativo.
                    </li>
                  </ul>
                </section>

                <section className="terms-section">
                  <h2>11. Ley Aplicable y Jurisdicción</h2>
                  <p>
                    Estos términos se rigen por las leyes de Colombia. Cualquier disputa se resolverá en los tribunales
                    competentes de Medellín.
                  </p>
                </section>

                <section className="terms-section">
                  <h2>12. Contacto</h2>
                  <p>Para cualquier consulta, reclamo o soporte, puedes contactarnos a:</p>
                  <ul>
                    <li>Correo electrónico: teoduque445@gmail.com</li>
                    <li>Teléfono/WhatsApp: 310 620 4578</li>
                    <li>Dirección física: Calle 34B #66A-18, Medellín</li>
                  </ul>
                </section>

                <div className="acceptance-note mt-4 p-4">
                  <p className="mb-2">
                    Al realizar un pedido en Teo/Cat, aceptas estos Términos y Condiciones en su totalidad.
                  </p>
                  <p className="mb-0">
                    <strong>¡Gracias por confiar en nosotros para el cuidado de tus mascotas! 🐾</strong>
                  </p>
                </div>

                <div className="last-updated mt-4 text-center">
                  <small>Última actualización: {currentDate}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default TerminosCondicionesPage

