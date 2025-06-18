"use client"

import { useRef, useState, useEffect } from "react"
import { Container } from "react-bootstrap"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules"
import { motion } from "framer-motion"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"
import "./testimonials-section.scss"

const TestimonialsSection = ({ testimonials, isVisible, sectionName }) => {
  const [isMobile, setIsMobile] = useState(false)
  const swiperRef = useRef(null)

  // Verificar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Renderizar las estrellas según la calificación
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(<i key={i} className={`bi ${i <= rating ? "bi-star-fill" : "bi-star"}`}></i>)
    }
    return stars
  }

  return (
    <section className="testimonials-section py-5 animate-section" data-section={sectionName || "testimonials"}>
      <div className="testimonials-overlay"></div>
      <Container className="position-relative">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-center">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle">Conoce las experiencias de quienes confían en nosotros</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 150,
              modifier: 2,
              slideShadows: false,
            }}
            slidesPerView={isMobile ? 1 : "auto"}
            spaceBetween={30}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={testimonials.length > 3}
            className="testimonials-swiper"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id} className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="testimonial-quote">
                      <i className="bi bi-quote"></i>
                    </div>
                    <p className="testimonial-text">{testimonial.text}</p>
                    <div className="testimonial-rating">{renderStars(testimonial.rating)}</div>
                  </div>
                  <div className="testimonial-user">
                    <div className="user-avatar">
                      <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    </div>
                    <div className="user-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </Container>
    </section>
  )
}

export default TestimonialsSection

