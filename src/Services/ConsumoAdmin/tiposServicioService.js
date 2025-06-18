import axios from "../ConsumoAdmin/axios.js"

// Servicio para gestionar los tipos de servicio
const tiposServicioService = {
  // Obtener todos los tipos de servicio
  obtenerTodos: async () => {
    try {
      const response = await axios.get("/services/tipos")
      console.log("Respuesta de obtenerTodos:", response.data) // Para depuración
      return response.data
    } catch (error) {
      console.error("Error al obtener tipos de servicio:", error)
      throw error
    }
  },

  // Crear un nuevo tipo de servicio
  crear: async (tipoServicio) => {
    try {
      // Asegurarse de que los nombres de las propiedades coincidan con lo que espera el backend
      const tipoServicioData = {
        Nombre: tipoServicio.Nombre,
        Descripcion: tipoServicio.Descripcion,
      }

      console.log("Datos enviados a la API:", tipoServicioData) // Para depuración
      const response = await axios.post("/services/tipos", tipoServicioData)
      console.log("Respuesta de crear:", response.data) // Para depuración
      return response.data
    } catch (error) {
      console.error("Error al crear tipo de servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },

  // Actualizar un tipo de servicio existente
  actualizar: async (id, tipoServicio) => {
    try {
      // Verificar que el ID es válido
      if (!id) {
        throw new Error("ID no válido para actualizar tipo de servicio")
      }

      // Asegurarse de que los nombres de las propiedades coincidan con lo que espera el backend
      const tipoServicioData = {
        Nombre: tipoServicio.Nombre,
        Descripcion: tipoServicio.Descripcion,
      }

      console.log(`Actualizando tipo de servicio con ID ${id}:`, tipoServicioData) // Para depuración
      const response = await axios.put(`/services/tipos/${id}`, tipoServicioData)
      console.log("Respuesta de actualizar:", response.data) // Para depuración
      return response.data
    } catch (error) {
      console.error("Error al actualizar tipo de servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },

  // Cambiar el estado de un tipo de servicio
  cambiarEstado: async (id, estado) => {
    try {
      // Verificar que el ID es válido
      if (!id) {
        throw new Error("ID no válido para cambiar estado de tipo de servicio")
      }

      console.log(`Cambiando estado del tipo de servicio con ID ${id} a ${estado}`) // Para depuración
      const response = await axios.patch(`/services/tipos/${id}/status`, { Estado: estado })
      console.log("Respuesta de cambiarEstado:", response.data) // Para depuración
      return response.data
    } catch (error) {
      console.error("Error al cambiar estado del tipo de servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },

  // Eliminar un tipo de servicio
  eliminar: async (id) => {
    try {
      // Verificar que el ID es válido
      if (!id) {
        throw new Error("ID no válido para eliminar tipo de servicio")
      }

      console.log(`Eliminando tipo de servicio con ID ${id}`) // Para depuración
      const response = await axios.delete(`/services/tipos/${id}`)
      console.log("Respuesta de eliminar:", response.data) // Para depuración
      return response.data
    } catch (error) {
      console.error("Error al eliminar tipo de servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },
}

export default tiposServicioService
