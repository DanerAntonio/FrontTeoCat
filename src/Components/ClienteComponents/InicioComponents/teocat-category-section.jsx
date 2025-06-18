"use client"

import { Link } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import "../InicioComponents/teocat-category-section.scss"

const TeoCatCategorySection = ({ categories, isVisible }) => {
  return (
    <section className="teocat-categories py-5 animate-section" data-section="categories">
      <Container>
        <motion.div
          className="teocat-categories__header text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="teocat-categories__title-container">
            <div className="teocat-categories__accent-line"></div>
            <h2 className="teocat-categories__title mb-2">Explora Nuestras Categorías</h2>
          </div>
          <p className="teocat-categories__subtitle mb-5">Encuentra todo lo que tu mascota necesita en un solo lugar</p>
        </motion.div>

        <div className="teocat-categories__grid">
          <Row className="g-4">
            {categories.map((category, index) => (
              <Col md={6} lg={3} key={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link to={`/catalogo?categoria=${category.name.toLowerCase()}`} className="text-decoration-none">
                    <div className="teocat-categories__card h-100">
                      <div className="teocat-categories__card-inner">
                        <div className="teocat-categories__icon-container">
                          <div className="teocat-categories__icon-wrapper" style={{ backgroundColor: category.color }}>
                            <i className={`bi ${category.icon}`}></i>
                          </div>
                        </div>
                        <div className="teocat-categories__content text-center">
                          <h3 className="teocat-categories__card-title">{category.name}</h3>
                          <p className="teocat-categories__card-description">{category.description}</p>
                          <div className="teocat-categories__link">
                            Explorar <i className="bi bi-arrow-right teocat-categories__arrow"></i>
                          </div>
                        </div>

                        {/* EPM-inspired hover overlay */}
                        <div className="teocat-categories__overlay"></div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </section>
  )
}

export default TeoCatCategorySection
