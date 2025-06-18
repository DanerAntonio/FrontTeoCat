"use client"

import { Container, Row, Col, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import "../InicioComponents/teocat-map-section.scss"

const TeoCatMapSection = ({ isVisible, sectionName }) => {
  return (
    <section className="teocat-map py-5 animate-section" data-section={sectionName || "map"}>
      <Container fluid className="px-0">
        <motion.div
          className="teocat-map__header text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* EPM-inspired title styling */}
          <div className="teocat-map__title-container">
            <div className="teocat-map__accent-line"></div>
            <h2 className="teocat-map__title">Encuéntranos</h2>
          </div>
          <p className="teocat-map__subtitle">Visítanos en nuestra tienda física</p>
        </motion.div>

        <div className="teocat-map__content-wrapper">
          <Row className="g-0">
            <Col lg={4} className="teocat-map__info-col">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="teocat-map__location-card h-100"
              >
                <div className="teocat-map__location-info">
                  <h3 className="teocat-map__location-title">Nuestra Ubicación</h3>
                  <p className="teocat-map__location-intro mb-4">
                    Visítanos en nuestra tienda física y descubre todos nuestros productos y servicios para tu mascota.
                  </p>

                  <div className="teocat-map__info-item">
                    <div className="teocat-map__info-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className="teocat-map__info-content">
                      <h5>Dirección</h5>
                      <p>Calle 34B #66A-18 / sector Unicentro, Medellín, Antioquia</p>
                    </div>
                  </div>

                  <div className="teocat-map__info-item">
                    <div className="teocat-map__info-icon">
                      <i className="bi bi-clock"></i>
                    </div>
                    <div className="teocat-map__info-content">
                      <h5>Horario</h5>
                      <p>Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                      <p>Domingos: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>

                  <div className="teocat-map__info-item">
                    <div className="teocat-map__info-icon">
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div className="teocat-map__info-content">
                      <h5>Contacto</h5>
                      <p>(604) 123-4567</p>
                      <p>+57 310 620 4578</p>
                    </div>
                  </div>

                  <Button
                    as="a"
                    href="https://goo.gl/maps/1JKzJZYqXZHvBQmS6"
                    target="_blank"
                    className="teocat-map__directions-btn mt-4"
                  >
                    <i className="bi bi-map me-2"></i>
                    Cómo Llegar
                  </Button>
                </div>
              </motion.div>
            </Col>

            <Col lg={8} className="p-0">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="teocat-map__container"
              >
                {/* EPM-inspired map frame */}
                <div className="teocat-map__frame">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2124445750146!2d-75.59143232426036!3d6.2329699271639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4429a5bfb9e0d7%3A0x4812b922f0ad8f19!2sCl.%2034b%20%2366a-18%2C%20Medell%C3%ADn%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1711585200000!5m2!1ses!2sco"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de Teo/Cat"
                  ></iframe>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  )
}

export default TeoCatMapSection
