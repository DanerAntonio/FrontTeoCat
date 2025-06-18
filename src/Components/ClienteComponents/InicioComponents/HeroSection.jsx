"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button, Container } from "react-bootstrap"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectCreative } from "swiper/modules"
import { motion } from "framer-motion"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-creative"
import "./HeroSection.scss"

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false)

  // Actualizar estado cuando cambia el tamaño de la pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Comprobar al cargar
    checkMobile()

    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkMobile)

    // Limpiar
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Datos para el carrusel
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1920",
      title: "Todo para tus mascotas en un solo lugar",
      description: "Encuentra alimentos, juguetes, accesorios y más para tus compañeros peludos.",
      buttonText: "Ver Catálogo",
      buttonLink: "/catalogo",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1920",
      title: "Servicios profesionales para tu mascota",
      description: "Peluquería, baño, paseo y más servicios con personal especializado.",
      buttonText: "Conocer Servicios",
      buttonLink: "/servicios",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1920",
      title: "Teo/Cat, tu tienda de confianza",
      description: "Más de 5 años cuidando a las mascotas de Medellín con amor y dedicación.",
      buttonText: "Conocer Más",
      buttonLink: "/sobre-nosotros",
    },
  ]

  return (
    <div className="hero-section">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectCreative]}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        }}
        slidesPerView={1}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        navigation={!isMobile}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="hero-image" />
              <div className="hero-content">
                <Container>
                  <motion.div
                    className="hero-text-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    key={slide.id}
                  >
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-description">{slide.description}</p>
                    <div className="hero-button-container">
                      <Button as={Link} to={slide.buttonLink} variant="success" size="lg" className="hero-button mt-3">
                        {slide.buttonText} <i className="bi bi-arrow-right ms-1"></i>
                      </Button>
                    </div>
                  </motion.div>
                </Container>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div className="arrow-scroll">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default HeroSection

