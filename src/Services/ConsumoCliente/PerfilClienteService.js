import axiosInstance from "../ConsumoAdmin/axios.js"

class PerfilClienteService {
  // ============================================
  // 🔹 1. INFORMACIÓN PERSONAL DEL USUARIO
  // ============================================

  // Obtener información personal del usuario autenticado
  async getMyProfile() {
    try {
      const response = await axiosInstance.get("/profile/me")
      return response.data
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      throw error
    }
  }

  // Actualizar información personal del usuario
async updateMyProfile(profileData, photoFile = null) {
  try {
    const formData = new FormData()

    // Agregar datos del perfil
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key])  // ← ESTA LÍNEA
      }
    })

      // Agregar foto si existe
      if (photoFile) {
        formData.append("foto", photoFile)
      }

      const response = await axiosInstance.put("/profile/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      throw error
    }
  }

  // Actualizar solo la foto del usuario
  async updateMyPhoto(photoFile) {
    try {
      const formData = new FormData()
      formData.append("foto", photoFile)

      const response = await axiosInstance.put("/profile/me/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al actualizar foto:", error)
      throw error
    }
  }

  // Cambiar contraseña del usuario
  async changePassword(passwordData) {
    try {
      // ✅ Mapear correctamente los nombres de campos
      const formattedData = {
        currentPassword: passwordData.oldPassword, // ✅ Mapear oldPassword -> currentPassword
        newPassword: passwordData.newPassword, // ✅ Este ya está correcto
      }

      const response = await axiosInstance.patch("/profile/me/password", formattedData)
      return response.data
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      throw error
    }
  }

  // ============================================
  // 🔹 2. MIS MASCOTAS
  // ============================================

  // Obtener todas las mascotas del cliente autenticado
  async getMyPets() {
    try {
      const response = await axiosInstance.get("/profile/me/pets")
      return response.data
    } catch (error) {
      console.error("Error al obtener mascotas:", error)
      throw error
    }
  }

  // Obtener una mascota específica del cliente
  async getMyPet(petId) {
    try {
      const response = await axiosInstance.get(`/profile/me/pets/${petId}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener mascota:", error)
      throw error
    }
  }

  // ✅ CORREGIDO: Crear una nueva mascota (SIN photoFile ya que usamos JSON)
  async createMyPet(petData) {
    try {
      // ✅ USAR JSON DIRECTO COMO EN ADMIN
      const mascotaFormateada = {
        Nombre: petData.nombre,
        IdEspecie: Number.parseInt(petData.idEspecie, 10),
        Raza: petData.raza,
        Tamaño: petData.tamaño || "Pequeño",
        FechaNacimiento: petData.fechaNacimiento,
        Estado: 1,
        Foto: petData.foto || null,
      }

      const response = await axiosInstance.post("/profile/me/pets", mascotaFormateada, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al crear mascota:", error)
      throw error
    }
  }

  // ✅ CORREGIDO: Actualizar una mascota (SIN photoFile ya que usamos JSON)
  async updateMyPet(petId, petData) {
    try {
      // ✅ USAR JSON DIRECTO COMO EN ADMIN
      const mascotaFormateada = {
        Nombre: petData.nombre,
        IdEspecie: Number.parseInt(petData.idEspecie, 10),
        Raza: petData.raza,
        Tamaño: petData.tamaño || "Pequeño",
        FechaNacimiento: petData.fechaNacimiento,
        Estado: 1,
        Foto: petData.foto || null,
      }

      const response = await axiosInstance.put(`/profile/me/pets/${petId}`, mascotaFormateada, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al actualizar mascota:", error)
      throw error
    }
  }

  // Obtener especies disponibles (para formularios)
  async getSpecies() {
    try {
      const response = await axiosInstance.get("/profile/me/especies")
      return response.data
    } catch (error) {
      console.error("Error al obtener especies:", error)
      throw error
    }
  }

  // ============================================
  // 🔹 3. MIS PEDIDOS/ÓRDENES
  // ============================================

  // Obtener todos los pedidos del cliente autenticado
  async getMyOrders() {
    try {
      const response = await axiosInstance.get("/profile/me/orders")
      return response.data
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      throw error
    }
  }

  // Obtener un pedido específico del cliente
  async getMyOrder(orderId) {
    try {
      const response = await axiosInstance.get(`/profile/me/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener pedido:", error)
      throw error
    }
  }

  // Cancelar un pedido del cliente (solo si está en estado "Efectiva")
  async cancelMyOrder(orderId) {
    try {
      const response = await axiosInstance.patch(`/profile/me/orders/${orderId}/cancel`)
      return response.data
    } catch (error) {
      console.error("Error al cancelar pedido:", error)
      throw error
    }
  }

  // ============================================
  // 🔹 4. MIS CITAS
  // ============================================

  // Obtener todas las citas del cliente autenticado
  async getMyAppointments() {
    try {
      const response = await axiosInstance.get("/profile/me/appointments")
      return response.data
    } catch (error) {
      console.error("Error al obtener citas:", error)
      throw error
    }
  }

  // Obtener una cita específica del cliente
  async getMyAppointment(appointmentId) {
    try {
      const response = await axiosInstance.get(`/profile/me/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener cita:", error)
      throw error
    }
  }

  // Cancelar una cita del cliente (solo si está "Programada")
  async cancelMyAppointment(appointmentId) {
    try {
      const response = await axiosInstance.patch(`/profile/me/appointments/${appointmentId}/cancel`)
      return response.data
    } catch (error) {
      console.error("Error al cancelar cita:", error)
      throw error
    }
  }

  // ============================================
  // 🔹 5. MIS RESEÑAS
  // ============================================

  // Obtener todas las reseñas de productos del cliente
  async getMyProductReviews() {
    try {
      const response = await axiosInstance.get("/profile/me/reviews/products")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas de productos:", error)
      throw error
    }
  }

  // Actualizar una reseña de producto del cliente
  async updateMyProductReview(reviewId, reviewData, photoFile = null) {
    try {
      const formData = new FormData()

      // Agregar datos de la reseña
      Object.keys(reviewData).forEach((key) => {
        if (reviewData[key] !== null && reviewData[key] !== undefined) {
          formData.append(key, reviewData[key])
        }
      })

      // Agregar foto si existe
      if (photoFile) {
        formData.append("foto", photoFile)
      }

      const response = await axiosInstance.put(`/profile/me/reviews/products/${reviewId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al actualizar reseña de producto:", error)
      throw error
    }
  }

  // Eliminar una reseña de producto del cliente
  async deleteMyProductReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`/profile/me/reviews/products/${reviewId}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar reseña de producto:", error)
      throw error
    }
  }

  // Obtener todas las reseñas de servicios del cliente
  async getMyServiceReviews() {
    try {
      const response = await axiosInstance.get("/profile/me/reviews/services")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas de servicios:", error)
      throw error
    }
  }

  // Actualizar una reseña de servicio del cliente
  async updateMyServiceReview(reviewId, reviewData) {
    try {
      const response = await axiosInstance.put(`/profile/me/reviews/services/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar reseña de servicio:", error)
      throw error
    }
  }

  // Eliminar una reseña de servicio del cliente
  async deleteMyServiceReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`/profile/me/reviews/services/${reviewId}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar reseña de servicio:", error)
      throw error
    }
  }

  // Obtener todas las reseñas generales del cliente
  async getMyGeneralReviews() {
    try {
      const response = await axiosInstance.get("/profile/me/reviews/general")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas generales:", error)
      throw error
    }
  }

  // Actualizar una reseña general del cliente
  async updateMyGeneralReview(reviewId, reviewData) {
    try {
      const response = await axiosInstance.put(`/profile/me/reviews/general/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar reseña general:", error)
      throw error
    }
  }

  // Eliminar una reseña general del cliente
  async deleteMyGeneralReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`/profile/me/reviews/general/${reviewId}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar reseña general:", error)
      throw error
    }
  }

  // ============================================
  // 🔹 6. MÉTODOS AUXILIARES
  // ============================================

  // Procesar múltiples teléfonos (separados por |)
  processPhoneNumbers(phoneString) {
    if (!phoneString) return []
    return phoneString.split("|").map((phone, index) => ({
      id: index + 1,
      numero: phone.trim(),
      principal: index === 0, // El primero es principal por defecto
    }))
  }

  // Convertir array de teléfonos a string para enviar a API
  formatPhonesForAPI(phonesArray) {
    return phonesArray.map((phone) => phone.numero).join("|")
  }

  // Procesar múltiples direcciones (separadas por |)
  processAddresses(addressString) {
    if (!addressString) return []
    return addressString.split("|").map((address, index) => ({
      id: index + 1,
      direccion: address.trim(),
      principal: index === 0, // La primera es principal por defecto
    }))
  }

  // Convertir array de direcciones a string para enviar a API
  formatAddressesForAPI(addressesArray) {
    return addressesArray.map((address) => address.direccion).join("|")
  }
}

// Exportar una instancia del servicio
const perfilClienteService = new PerfilClienteService()
export default perfilClienteService
