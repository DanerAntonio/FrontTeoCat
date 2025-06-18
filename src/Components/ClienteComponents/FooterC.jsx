"use client"

import { Link } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import "./FooterC.scss"

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="g-4">
          <Col lg={3} md={6}>
            <div className="text-center text-md-start mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo2.jpg-KEo5YRO1SwydScSYxiiPG92bVBqOnm.jpeg"
                alt="Teo/Cat Logo"
                height="80"
                className="mb-3 footer-logo"
              />
              <p className="mb-0">Tu tienda de confianza para todo lo que tu mascota necesita en Medellín, Colombia.</p>
            </div>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Enlaces Rápidos</h5>
            <ul className="footer-links">
              <li className="footer-link-item">
                <Link to="/">Inicio</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/catalogo">Catálogo</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/servicios">Servicios</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/sobre-nosotros">Sobre Nosotros</Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Contacto</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-geo-alt me-2"></i> Calle 34B #66A-18, Medellín
              </li>
              <li>
                <a href="tel:+573106204578" className="footer-contact-link">
                  <i className="bi bi-telephone me-2"></i> 310 620 4578
                </a>
              </li>
              <li>
                <a href="mailto:teoduque445@gmail.com" className="footer-contact-link">
                  <i className="bi bi-envelope me-2"></i> teoduque445@gmail.com
                </a>
              </li>
              <li>
                <i className="bi bi-clock me-2"></i> Lun-Sáb: 9AM - 7PM
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Síguenos</h5>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61557715831713"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a
                href="https://www.instagram.com/teocat8/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://www.tiktok.com/@teocat_oficial?lang=es"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon tiktok"
              >
                <i className="bi bi-tiktok"></i>
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=573106204578&text=%22Hola%2C+soy+%5BTu+Nombre%5D+y+estoy+interesado+en+encontrar+el+regalo+perfecto+para+mi+peludo+amigo.+%C2%BFPodr%C3%ADan+asesorarme+sobre+las+opciones+de+productos+que+tienen+disponibles+para+mi+mascota%3F+%C2%A1Gracias%21%22&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon whatsapp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider my-4" />

        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">&copy; {new Date().getFullYear()} Teo/Cat. Todos los derechos reservados.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex flex-column flex-md-row justify-content-md-end align-items-center">
              <ul className="footer-bottom-links mb-2 mb-md-0">
                <li>
                  <Link to="/terminos">Términos y Condiciones</Link>
                </li>
                <li>
                  <Link to="/privacidad">Política de Privacidad</Link>
                </li>
              </ul>
              <div className="signature ms-md-4">
                <span className="signature-text">Equipo de trabajo TeoSoft</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer

