"use client"

import { Container, Card, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import "./benefits-section.scss"

const BenefitsSection = ({ benefits, isVisible }) => {
  return (
    <section className="benefits-section py-5 animate-section" data-section="benefits">
      <Container>
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">¿Por qué elegir Teo/Cat?</h2>
          <p className="section-subtitle">Nos diferenciamos por nuestro compromiso con tu mascota</p>
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
                <Card className="benefit-card h-100 border-0 shadow-sm text-center">
                  <Card.Body className="d-flex flex-column">
                    <div className="benefit-icon">
                      <i className={`bi ${benefit.icon}`}></i>
                    </div>
                    <h3 className="benefit-title">{benefit.title}</h3>
                    <p className="benefit-description mb-0">{benefit.description}</p>

                    <div className="benefit-hover-icon">
                      <i className={`bi ${benefit.icon}`}></i>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default BenefitsSection

