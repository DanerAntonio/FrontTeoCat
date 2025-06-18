"use client"

import { Container, Row, Col, Card, Alert } from "react-bootstrap"
import "./politica-privacidad-page.scss"

const PoliticaPrivacidadPage = () => {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="privacidad-page">
      <div className="page-header">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <h1 className="page-title text-center">Política de Privacidad</h1>
              <div className="divider"></div>
              <p className="text-center lead">
                En Teo/Cat, valoramos y respetamos tu privacidad. Esta política explica cómo recopilamos, usamos,
                protegemos y compartimos tu información personal.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="privacy-card mb-4">
              <Card.Body>
                <div className="last-updated mb-4">
                  <i className="bi bi-calendar3 me-2"></i>
                  Fecha de entrada en vigor: {currentDate}
                </div>

                <Alert variant="info" className="mb-4">
                  <div className="d-flex">
                    <div className="me-3">
                      <i className="bi bi-info-circle-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="mb-0">
                        Al acceder a nuestros servicios, aceptas las prácticas descritas en esta política.
                      </p>
                    </div>
                  </div>
                </Alert>

                <section className="privacy-section">
                  <h2>1. Información que Recopilamos</h2>
                  <p>Para brindarte un servicio eficiente, podemos recopilar los siguientes datos:</p>

                  <h3>Información personal:</h3>
                  <ul>
                    <li>Nombre completo</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Dirección de envío y/o facturación</li>
                    <li>
                      Datos de pago (solo para procesamiento de transferencias, no almacenamos datos bancarios
                      completos)
                    </li>
                  </ul>

                  <h3>Información no personal:</h3>
                  <ul>
                    <li>Dirección IP</li>
                    <li>Tipo de dispositivo y navegador</li>
                    <li>Datos de navegación (páginas visitadas, tiempo en el sitio)</li>
                  </ul>
                </section>

                <section className="privacy-section">
                  <h2>2. ¿Cómo Usamos Tu Información?</h2>
                  <p>Utilizamos tus datos para:</p>
                  <ul className="check-list">
                    <li>Procesar y gestionar tus pedidos.</li>
                    <li>Verificar pagos y enviar confirmaciones.</li>
                    <li>Comunicarnos contigo sobre tu compra (envíos, actualizaciones, soporte).</li>
                    <li>Mejorar nuestros servicios y experiencia de usuario.</li>
                    <li>Enviar promociones o novedades (solo si aceptas marketing).</li>
                  </ul>
                </section>

                <section className="privacy-section">
                  <h2>3. Compartir Información con Terceros</h2>
                  <p>
                    Tus datos personales no serán vendidos ni compartidos con fines comerciales no autorizados. Solo los
                    proporcionaremos a terceros en los siguientes casos:
                  </p>
                  <ul>
                    <li>
                      <strong>Empresas de envío:</strong> Para entregar tu pedido.
                    </li>
                    <li>
                      <strong>Proveedores de pago:</strong> Para confirmar transferencias (sin almacenar datos
                      sensibles).
                    </li>
                    <li>
                      <strong>Obligaciones legales:</strong> Si la ley lo exige (ej. autoridades fiscales).
                    </li>
                  </ul>
                </section>

                <section className="privacy-section">
                  <h2>4. Seguridad de Tus Datos</h2>
                  <p>Implementamos medidas técnicas y administrativas para proteger tu información, como:</p>
                  <ul>
                    <li>Conexiones seguras (HTTPS).</li>
                    <li>Acceso restringido solo a personal autorizado.</li>
                    <li>Almacenamiento en servidores protegidos.</li>
                  </ul>
                  <p>
                    Sin embargo, ningún sistema es 100% invulnerable. Si ocurriera una filtración de datos, te
                    notificaremos conforme a la ley aplicable.
                  </p>
                </section>

                <section className="privacy-section">
                  <h2>5. Tus Derechos</h2>
                  <p>Puedes solicitar:</p>
                  <ul className="rights-list">
                    <li>Acceso o corrección de tus datos personales.</li>
                    <li>Eliminación de tu cuenta (salvo que debamos conservar información por razones legales).</li>
                    <li>Revocar consentimiento para marketing (en cualquier momento).</li>
                  </ul>
                  <p>Para ejercer estos derechos, escríbenos a: teoduque445@gmail.com</p>
                </section>

                <section className="privacy-section">
                  <h2>6. Cookies y Tecnologías Similares</h2>
                  <p>Usamos cookies para:</p>
                  <ul>
                    <li>Mejorar la navegación.</li>
                    <li>Recordar preferencias (ej. carrito de compras).</li>
                    <li>Analizar tráfico web (Google Analytics).</li>
                  </ul>
                  <p>Puedes desactivarlas en tu navegador, aunque esto podría afectar algunas funcionalidades.</p>
                </section>

                <section className="privacy-section">
                  <h2>7. Menores de Edad</h2>
                  <p>
                    Nuestros servicios no están dirigidos a menores de 18 años. Si descubrimos que hemos recopilado
                    datos de un menor sin consentimiento parental, los eliminaremos.
                  </p>
                </section>

                <section className="privacy-section">
                  <h2>8. Cambios en esta Política</h2>
                  <p>
                    Actualizaremos esta política ocasionalmente. Te notificaremos cambios significativos por correo o
                    mediante un aviso en nuestro sitio web.
                  </p>
                </section>

                <section className="privacy-section">
                  <h2>9. Contacto</h2>
                  <p>Si tienes dudas sobre privacidad o protección de datos, contáctanos en:</p>
                  <ul>
                    <li>
                      <strong>Email:</strong> teoduque445@gmail.com
                    </li>
                    <li>
                      <strong>Teléfono/WhatsApp:</strong> 310 620 4578
                    </li>
                    <li>
                      <strong>Dirección física:</strong> Calle 34B #66A-18, Medellín
                    </li>
                  </ul>
                </section>

                <div className="thank-you mt-4 text-center p-4">
                  <p className="mb-0">
                    <strong>Gracias por confiar en Teo/Cat. 🐶🐱</strong>
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

export default PoliticaPrivacidadPage

