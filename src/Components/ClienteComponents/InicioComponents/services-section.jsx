"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Container, Button, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import ServiceCard from "../ServiciosComponents/ServiceCard"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "./services-section.scss"

const ServicesSection = ({ title, subtitle, items, linkTo, linkText, isVisible, sectionName }) => {
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
    <section className="services-section py-5 animate-section" data-section={sectionName}>
      <Container>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">
            <div className="mb-3 mb-md-0">
              <h2 className="section-title">{title}</h2>
              <p className="section-subtitle">{subtitle}</p>
            </div>
            <div className="view-all-button-wrapper">
              <Button as={Link} to={linkTo} variant="outline-success" className="view-all-btn">
                {linkText} <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Carrusel para servicios */}
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
                  className="h-100"
                >
                  <ServiceCard service={service} />
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button as={Link} to="/agendar-cita" className="btn-lg schedule-btn">
            <i className="bi bi-calendar-check me-2"></i>
            Agendar una Cita
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}

export default ServicesSection

