"use client"

import { useState, useEffect } from "react"
import HeroSection from "../../Components/ClienteComponents/InicioComponents/teo-cat-hero-section"
import CategorySection from "../../Components/ClienteComponents/InicioComponents/teocat-category-section"
import BenefitsSection from "../../Components/ClienteComponents/InicioComponents/teocat-benefits-section"
import FeaturedSection from "../../Components/ClienteComponents/InicioComponents/teocat-featured-section"
import ServicesSection from "../../Components/ClienteComponents/InicioComponents/teocat-services-section"
import MapSection from "../../Components/ClienteComponents/InicioComponents/teocat-map-section"
import TestimonialsSection from "../../Components/ClienteComponents/InicioComponents/teocat-testimonials-section"
import CTASection from "../../Components/ClienteComponents/InicioComponents/teocat-cta-section"
import "../../Pages/ClientePages/home-page.scss"

const HomePage = () => {
  // Estado para productos destacados (simulados)
  const [featuredProducts, setFeaturedProducts] = useState([])
  // Estado para servicios populares (simulados)
  const [popularServices, setPopularServices] = useState([])
  // Estado para testimonios
  const [testimonials, setTestimonials] = useState([])
  // Estado para controlar animaciones
  const [isVisible, setIsVisible] = useState({
    categories: false,
    benefits: false,
    products: false,
    services: false,
    testimonials: false,
    cta: false,
    map: false,
  })

  useEffect(() => {
    // Simulación de carga de datos desde API
    // En producción, aquí harías fetch a tu API

    // Productos destacados simulados
    const mockProducts = [
      {
        id: 1,
        name: "Alimento Premium para Perros",
        category: "Alimentos",
        price: 75000,
        originalPrice: 85000,
        discount: 12,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=500",
      },
      {
        id: 2,
        name: "Juguete Interactivo para Gatos",
        category: "Juguetes",
        price: 35000,
        originalPrice: 35000,
        discount: 0,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=500",
      },
      {
        id: 3,
        name: "Cama Ortopédica para Mascotas",
        category: "Accesorios",
        price: 120000,
        originalPrice: 150000,
        discount: 20,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1567612529009-afe25813a308?q=80&w=500",
      },
      {
        id: 4,
        name: "Collar Ajustable con GPS",
        category: "Accesorios",
        price: 89000,
        originalPrice: 89000,
        discount: 0,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=500",
      },
      {
        id: 5,
        name: "Snacks Naturales para Perros",
        category: "Alimentos",
        price: 28000,
        originalPrice: 32000,
        discount: 12.5,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=500",
      },
      {
        id: 6,
        name: "Juguete Dispensador de Premios",
        category: "Juguetes",
        price: 42000,
        originalPrice: 42000,
        discount: 0,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1597843786411-a7fa8ad44a9a?q=80&w=500",
      },
    ]

    // Servicios populares simulados
    const mockServices = [
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
      {
        id: 4,
        name: "Adiestramiento Básico",
        description: "Enseñanza de comandos básicos a tu mascota",
        price: 60000,
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=500",
      },
    ]

    // Testimonios simulados
    const mockTestimonials = [
      {
        id: 1,
        name: "María García",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        role: "Cliente frecuente",
        text: "Excelente atención y productos de calidad. Mi perrito siempre sale feliz después de su baño y peluquería. ¡Totalmente recomendado!",
        rating: 5,
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        role: "Cliente desde 2021",
        text: "Los alimentos que venden son de excelente calidad y mi mascota ha mejorado notablemente su pelaje. El personal es muy amable y conocedor.",
        rating: 5,
      },
      {
        id: 3,
        name: "Laura Martínez",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        role: "Cliente desde 2022",
        text: "Los servicios de adiestramiento fueron claves para mi cachorro. Ahora es mucho más obediente y sociable con otras mascotas.",
        rating: 4,
      },
      {
        id: 4,
        name: "Juan Pérez",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        role: "Cliente frecuente",
        text: "Siempre encuentro todo lo que necesito para mis gatos. Los productos son de alta calidad y los precios son competitivos.",
        rating: 5,
      },
    ]

    setFeaturedProducts(mockProducts)
    setPopularServices(mockServices)
    setTestimonials(mockTestimonials)

    // Configurar observadores de intersección para animaciones
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.dataset.section]: true,
          }))
        }
      })
    }, observerOptions)

    // Observar secciones
    const sections = document.querySelectorAll(".animate-section")
    sections.forEach((section) => {
      sectionObserver.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        sectionObserver.unobserve(section)
      })
    }
  }, [])

  // Datos para categorías
  const categories = [
    {
      id: 1,
      name: "Alimentos",
      description: "Nutrición premium para tu mascota",
      icon: "bi-basket",
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=500",
      color: "#7ab51d",
    },
    {
      id: 2,
      name: "Juguetes",
      description: "Diversión y entretenimiento",
      icon: "bi-controller",
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=500",
      color: "#e67e22",
    },
    {
      id: 3,
      name: "Accesorios",
      description: "Comodidad y estilo para tu mascota",
      icon: "bi-tag",
      image: "https://images.unsplash.com/photo-1567612529009-afe25813a308?q=80&w=500",
      color: "#3498db",
    },
    {
      id: 4,
      name: "Higiene",
      description: "Cuidado y limpieza",
      icon: "bi-droplet",
      image: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?q=80&w=500",
      color: "#9b59b6",
    },
  ]

  // Datos para beneficios
  const benefits = [
    {
      icon: "bi-truck",
      title: "Envío Rápido",
      description: "Entrega en 24-48 horas en Medellín y área metropolitana",
    },
    {
      icon: "bi-shield-check",
      title: "Productos de Calidad",
      description: "Seleccionamos cuidadosamente cada producto para tu mascota",
    },
    {
      icon: "bi-heart",
      title: "Atención Personalizada",
      description: "Asesoramiento profesional para el cuidado de tu mascota",
    },
    {
      icon: "bi-arrow-return-left",
      title: "Devoluciones Sencillas",
      description: "30 días para cambios y devoluciones sin complicaciones",
    },
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Sección de Categorías */}
      <CategorySection categories={categories} isVisible={isVisible.categories} />

      {/* Sección de beneficios */}
      <BenefitsSection benefits={benefits} isVisible={isVisible.benefits} />

      {/* Sección de Productos Destacados */}
      <FeaturedSection
        title="Productos Destacados"
        subtitle="Seleccionados especialmente para tu mascota"
        items={featuredProducts}
        linkTo="/catalogo"
        linkText="Ver Todos"
        isVisible={isVisible.products}
        sectionName="products"
      />

      {/* Sección de Servicios */}
      <ServicesSection
        title="Servicios Profesionales"
        subtitle="Cuidamos de tu mascota con amor y dedicación"
        items={popularServices}
        linkTo="/servicios"
        linkText="Ver Todos"
        isVisible={isVisible.services}
        sectionName="services"
      />

      {/* Sección de Testimonios */}
      <TestimonialsSection testimonials={testimonials} isVisible={isVisible.testimonials} sectionName="testimonials" />

      {/* Sección CTA (Call to Action) */}
      <CTASection isVisible={isVisible.cta} sectionName="cta" />

      {/* Sección de Mapa de Google */}
      <MapSection isVisible={isVisible.map} sectionName="map" />
    </div>
  )
}

export default HomePage
