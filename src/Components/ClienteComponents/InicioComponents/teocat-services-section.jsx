"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Container, Button, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import ServiceCard from "../ServiciosComponents/ServiceCard"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "../InicioComponents/teocat-services-section.scss"

const TeoCatServicesSection = ({ title, subtitle, items, linkTo, linkText, isVisible, sectionName }) => {
  const [isMobile, setIsMobile] = useState(false)
  const swiperRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Servicios de ejemplo en caso de que no se proporcionen
  const defaultServices = [
    {
      id: 1,
      name: "Peluquería Canina",
      description: "Corte y arreglo profesional para tu perro",
      price: 45000,
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=500",
    },
    {
      id: 2,
      name: "Baño y Spa",
      description: "Baño completo con productos premium",
      price: 35000,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=500",
    },
    {
      id: 3,
      name: "Paseo de Mascotas",
      description: "Paseos diarios con personal capacitado",
      price: 25000,
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500",
    },
  ]

  // Usar los servicios proporcionados o los de ejemplo si no hay ninguno
  const servicesToShow = items && items.length > 0 ? items : defaultServices

  return (
    <section className="teocat-services py-5 animate-section" data-section={sectionName}>
      <Container>
        <motion.div
          className="teocat-services__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">
            <div className="mb-3 mb-md-0">
              {/* EPM-inspired title styling */}
              <div className="teocat-services__title-container">
                <div className="teocat-services__accent-line"></div>
                <h2 className="teocat-services__title">{title}</h2>
              </div>
              <p className="teocat-services__subtitle">{subtitle}</p>
            </div>
            <div className="teocat-services__button-wrapper">
              <Button as={Link} to={linkTo} variant="outline-success" className="teocat-services__view-all">
                {linkText} <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* EPM-inspired services grid */}
        <div className="teocat-services__grid">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Row className="g-4">
              {servicesToShow.map((service, index) => (
                <Col md={4} key={service.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="teocat-services__card-wrapper h-100"
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>

        {/* EPM-inspired CTA button */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="teocat-services__cta-container">
            <Button as={Link} to="/agendar-cita" className="btn-lg teocat-services__schedule-btn">
              <i className="bi bi-calendar-check me-2"></i>
              Agendar una Cita
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

export default TeoCatServicesSection
