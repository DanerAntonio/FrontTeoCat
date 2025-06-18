"use client"

import { Link } from "react-router-dom"
import { Container, Card, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"
import "./category-section.scss"

const CategorySection = ({ categories, isVisible }) => {
  return (
    <section className="categories-section py-5 animate-section" data-section="categories">
      <Container>
        <motion.div
          className="section-header text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title mb-2">Explora Nuestras Categorías</h2>
          <p className="section-subtitle mb-5">Encuentra todo lo que tu mascota necesita en un solo lugar</p>
        </motion.div>

        <div className="categories-grid">
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
                    <Card className="category-card h-100 border-0 shadow-hover">
                      <div className="category-icon-container">
                        <div className="category-icon-wrapper" style={{ backgroundColor: category.color }}>
                          <i className={`bi ${category.icon}`}></i>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="category-title">{category.name}</Card.Title>
                        <Card.Text className="category-description">{category.description}</Card.Text>
                        <div className="category-link">
                          Explorar <i className="bi bi-arrow-right category-arrow"></i>
                        </div>
                      </Card.Body>
                    </Card>
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

export default CategorySection

