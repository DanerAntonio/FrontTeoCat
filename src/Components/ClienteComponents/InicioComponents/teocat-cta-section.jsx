"use client"

import { Link } from "react-router-dom"
import { Container, Row, Col, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import "../InicioComponents/teocat-cta-section.scss"

const TeoCatCTASection = ({ isVisible, sectionName }) => {
  return (
    <section className="teocat-cta animate-section" data-section={sectionName || "cta"}>
      <Container>
        <div className="teocat-cta__wrapper">
          <Row className="align-items-center">
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="teocat-cta__content"
              >
                {/* EPM-inspired decorative element */}
                <div className="teocat-cta__accent-line"></div>
                <h2 className="teocat-cta__title">¡Tu mascota merece lo mejor!</h2>
                <p className="teocat-cta__description">
                  Descubre nuestra amplia variedad de productos y servicios de calidad. ¡Visítanos o agenda una cita hoy
                  mismo!
                </p>
                <div className="teocat-cta__buttons">
                  <Button
                    as={Link}
                    to="/catalogo"
                    variant="light"
                    className="teocat-cta__button teocat-cta__button--light me-3"
                  >
                    <i className="bi bi-bag me-2"></i>
                    Ver Productos
                  </Button>
                  <Button
                    as={Link}
                    to="/agendar-cita"
                    variant="success"
                    className="teocat-cta__button teocat-cta__button--primary"
                  >
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
                className="teocat-cta__image-container"
              >
                {/* EPM-inspired image frame */}
                <div className="teocat-cta__image-frame">
                  <img
                    src="https://images.unsplash.com/photo-1546238232-20216dec9f72?q=80&w=600"
                    alt="Feliz mascota"
                    className="teocat-cta__image"
                  />
                </div>
                <div className="teocat-cta__image-badge">
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

export default TeoCatCTASection
