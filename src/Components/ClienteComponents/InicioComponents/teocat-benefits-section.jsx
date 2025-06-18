"use client"

import { Container, Card, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import "../InicioComponents/teocat-benefits-section.scss"

const TeoCatBenefitsSection = ({ benefits, isVisible }) => {
  return (
    <section className="teocat-benefits py-5 animate-section" data-section="benefits">
      <Container>
        <motion.div
          className="teocat-benefits__header text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="teocat-benefits__title-container">
            <div className="teocat-benefits__accent-line"></div>
            <h2 className="teocat-benefits__title">¿Por qué elegir Teo/Cat?</h2>
          </div>
          <p className="teocat-benefits__subtitle">Nos diferenciamos por nuestro compromiso con tu mascota</p>
        </motion.div>

        <Row className="g-4">
          {benefits.map((benefit, index) => (
            <Col md={6} lg={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="teocat-benefits__card h-100 border-0 shadow-sm text-center">
                  <div className="teocat-benefits__card-inner">
                    <Card.Body className="d-flex flex-column">
                      <div className="teocat-benefits__icon-container">
                        <div className="teocat-benefits__icon">
                          <i className={`bi ${benefit.icon}`}></i>
                        </div>
                      </div>
                      <h3 className="teocat-benefits__card-title">{benefit.title}</h3>
                      <p className="teocat-benefits__card-description mb-0">{benefit.description}</p>

                      <div className="teocat-benefits__hover-icon">
                        <i className={`bi ${benefit.icon}`}></i>
                      </div>
                    </Card.Body>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default TeoCatBenefitsSection
