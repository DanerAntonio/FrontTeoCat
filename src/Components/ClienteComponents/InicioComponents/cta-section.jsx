"use client"

import { Link } from "react-router-dom"
import { Container, Row, Col, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import "./cta-section.scss"

const CTASection = ({ isVisible, sectionName }) => {
  return (
    <section className="cta-section animate-section" data-section={sectionName || "cta"}>
      <Container>
        <div className="cta-wrapper">
          <Row className="align-items-center">
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="cta-content"
              >
                <h2>¡Tu mascota merece lo mejor!</h2>
                <p>
                  Descubre nuestra amplia variedad de productos y servicios de calidad. ¡Visítanos o agenda una cita hoy
                  mismo!
                </p>
                <div className="cta-buttons">
                  <Button as={Link} to="/catalogo" variant="light" className="me-3">
                    <i className="bi bi-bag me-2"></i>
                    Ver Productos
                  </Button>
                  <Button as={Link} to="/agendar-cita" variant="success" className="cta-primary-btn">
                    <i className="bi bi-calendar-check me-2"></i>
                    Agendar Cita
                  </Button>
                </div>
              </motion.div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="cta-image-container"
              >
                <img
                  src="https://images.unsplash.com/photo-1546238232-20216dec9f72?q=80&w=600"
                  alt="Feliz mascota"
                  className="cta-image"
                />
                <div className="cta-image-badge">
                  <span>¡Calidad Garantizada!</span>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  )
}

export default CTASection

