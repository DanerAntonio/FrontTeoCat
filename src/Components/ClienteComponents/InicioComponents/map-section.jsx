"use client"

import { Container, Row, Col, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import "./map-section.scss"

const MapSection = ({ isVisible, sectionName }) => {
  return (
    <section className="map-section py-5 animate-section" data-section={sectionName || "map"}>
      <Container fluid className="px-0">
        <motion.div
          className="section-header text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Encuéntranos</h2>
          <p className="section-subtitle">Visítanos en nuestra tienda física</p>
        </motion.div>

        <div className="map-content-wrapper">
          <Row className="g-0">
            <Col lg={4} className="map-info-col">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="location-card h-100"
              >
                <div className="location-info">
                  <h3>Nuestra Ubicación</h3>
                  <p className="mb-4">
                    Visítanos en nuestra tienda física y descubre todos nuestros productos y servicios para tu mascota.
                  </p>

                  <div className="info-item">
                    <div className="info-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className="info-content">
                      <h5>Dirección</h5>
                      <p>Calle 34B #66A-18 / sector Unicentro, Medellín, Antioquia</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <i className="bi bi-clock"></i>
                    </div>
                    <div className="info-content">
                      <h5>Horario</h5>
                      <p>Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                      <p>Domingos: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div className="info-content">
                      <h5>Contacto</h5>
                      <p>(604) 123-4567</p>
                      <p>+57 310 620 4578</p>
                    </div>
                  </div>

                  <Button
                    as="a"
                    href="https://goo.gl/maps/1JKzJZYqXZHvBQmS6"
                    target="_blank"
                    className="directions-btn mt-4"
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
                className="map-container"
              >
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
              </motion.div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  )
}

export default MapSection

