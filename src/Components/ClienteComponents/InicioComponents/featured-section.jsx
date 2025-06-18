"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Container, Button } from "react-bootstrap"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation, Autoplay, EffectCoverflow } from "swiper/modules"
import { motion } from "framer-motion"
import ProductCard from "../CatalogoComponents/ProductCard"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-coverflow"
import "./featured-section.scss"

const FeaturedSection = ({ title, subtitle, items, linkTo, linkText, isVisible, sectionName }) => {
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

  return (
    <section className="featured-section py-5 animate-section" data-section={sectionName}>
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

        {/* Carrusel para productos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            ref={swiperRef}
            modules={[Pagination, Navigation, Autoplay, EffectCoverflow]}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={items.length > 3}
            coverflowEffect={{
              rotate: 5,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            slidesPerView={1}
            breakpoints={{
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={!isMobile}
            className="featured-swiper"
          >
            {items.map((item, index) => (
              <SwiperSlide key={item.id}>
                <div className="item-card-wrapper h-100">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard product={item} />
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </Container>
    </section>
  )
}

export default FeaturedSection

