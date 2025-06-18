"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"

// Componentes
import ProfileSidebar from "../../Components/ClienteComponents/MiPerfilComponents/ProfileSidebar"
import ProfileInfo from "../../Components/ClienteComponents/MiPerfilComponents/ProfileInfo"
import ProfileAddresses from "../../Components/ClienteComponents/MiPerfilComponents/ProfileAddresses"
import ProfilePhones from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePhones"
import ProfilePets from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePets"
import ProfileOrders from "../../Components/ClienteComponents/MiPerfilComponents/ProfileOrders"
import ProfileAppointments from "../../Components/ClienteComponents/MiPerfilComponents/ProfileAppointments"
import ProfilePassword from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePassword"
import ProfileReviews from "../../Components/ClienteComponents/MiPerfilComponents/ProfileReviews"

// Estilos
import "./perfil-page.scss"

import perfilClienteService from "../../Services/ConsumoCliente/PerfilClienteService"

const PerfilPage = () => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")

  // Estado para la información del usuario
  const [user, setUser] = useState({})

  // Estado para las mascotas del usuario
  const [pets, setPets] = useState([])

  // Estado para los pedidos del usuario
  const [orders, setOrders] = useState([])

  // Estado para las citas del usuario
  const [appointments, setAppointments] = useState([])

  // Estado para las reseñas del usuario
  const [reviews, setReviews] = useState([])

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("profile")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar datos del perfil
      const profileData = await perfilClienteService.getMyProfile()

      // Procesar teléfonos y direcciones
      const processedUser = {
        ...profileData,
        telefonos: perfilClienteService.processPhoneNumbers(profileData.Telefono || profileData.telefono),
        direcciones: perfilClienteService.processAddresses(profileData.Direccion || profileData.direccion),
      }

      setUser(processedUser)

      // Cargar mascotas
      const petsData = await perfilClienteService.getMyPets()
      setPets(petsData)

      // Cargar pedidos
      const ordersData = await perfilClienteService.getMyOrders()
      setOrders(ordersData)

      // Cargar citas
      const appointmentsData = await perfilClienteService.getMyAppointments()
      setAppointments(appointmentsData)

      // Cargar reseñas (combinar todas)
      const [productReviews, serviceReviews, generalReviews] = await Promise.all([
        perfilClienteService.getMyProductReviews(),
        perfilClienteService.getMyServiceReviews(),
        perfilClienteService.getMyGeneralReviews(),
      ])

      const allReviews = [
        ...productReviews.map((review) => ({ ...review, type: "product" })),
        ...serviceReviews.map((review) => ({ ...review, type: "service" })),
        ...generalReviews.map((review) => ({ ...review, type: "general" })),
      ]

      setReviews(allReviews)
    } catch (err) {
      console.error("Error al cargar datos del perfil:", err)
      setError("Error al cargar los datos del perfil")
    } finally {
      setLoading(false)
    }
  }

  // Establecer la pestaña activa basada en el parámetro de URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Actualizar usuario
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  // Actualizar mascotas
  const updatePets = (updatedPets) => {
    setPets(updatedPets)
  }

  // Actualizar reseñas
  const updateReviews = (updatedReviews) => {
    setReviews(updatedReviews)
  }

  if (loading) {
    return (
      <div className="perfil-page">
        <Container className="py-5 mt-5">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando perfil...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="perfil-page">
        <Container className="py-5 mt-5">
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle fs-1 mb-3"></i>
            <h4>Error al cargar el perfil</h4>
            <p>{error}</p>
            <button className="btn btn-success" onClick={loadProfileData}>
              Reintentar
            </button>
          </div>
        </Container>
      </div>
    )
  }

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileInfo user={user} updateUser={updateUser} />
            <ProfileAddresses user={user} updateUser={updateUser} />
            <ProfilePhones user={user} updateUser={updateUser} />
          </motion.div>
        )
      case "pets":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfilePets pets={pets} updatePets={updatePets} />
          </motion.div>
        )
      case "orders":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileOrders orders={orders} />
          </motion.div>
        )
      case "appointments":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileAppointments appointments={appointments} />
          </motion.div>
        )
      case "reviews":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileReviews reviews={reviews} updateReviews={updateReviews} />
          </motion.div>
        )
      case "password":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfilePassword />
          </motion.div>
        )
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileInfo user={user} updateUser={updateUser} />
            <ProfileAddresses user={user} updateUser={updateUser} />
            <ProfilePhones user={user} updateUser={updateUser} />
          </motion.div>
        )
    }
  }

  return (
    <div className="perfil-page">
      <Container className="py-5 mt-5">
        <Row>
          {/* Sidebar de navegación */}
          <Col lg={3} className="mb-4">
            <ProfileSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} updateUser={updateUser} />
          </Col>

          {/* Contenido principal */}
          <Col lg={9}>{renderContent()}</Col>
        </Row>
      </Container>
    </div>
  )
}

export default PerfilPage
