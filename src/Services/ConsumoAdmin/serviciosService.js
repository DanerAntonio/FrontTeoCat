import axios from "../../Services/ConsumoAdmin/axios.js"

// Servicio para gestionar los servicios
const serviciosService = {
  // Obtener todos los servicios
  obtenerTodos: async () => {
    try {
      // Llamar a la API sin parámetros de paginación para evitar el error
      const response = await axios.get("/services/servicios")

      // Manejar diferentes estructuras de respuesta
      if (response.data && Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        return []
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error)
      throw error
    }
  },

  // Obtener tipos de servicio (para el select del formulario)
  obtenerTipos: async () => {
    try {
      const response = await axios.get("/services/tipos")
      return response.data
    } catch (error) {
      console.error("Error al obtener tipos de servicio:", error)
      throw error
    }
  },

  // Crear un nuevo servicio
  crear: async (servicio) => {
    try {
      // Asegurarse de que los datos estén en el formato correcto
      const servicioData = {
        IdTipoServicio: servicio.IdTipoServicio,
        Nombre: servicio.Nombre,
        Foto: servicio.Foto,
        Descripcion: servicio.Descripcion,
        Beneficios: servicio.Beneficios,
        Que_incluye: servicio.Que_incluye,
        Precio: servicio.Precio,
        PrecioGrande: servicio.PrecioGrande || servicio.Precio, // Si no hay precio grande, usar el precio normal
        Duracion: servicio.Duracion,
        Estado: servicio.Estado !== undefined ? servicio.Estado : true, // Asegurar que el servicio se cree como activo por defecto
      }

      const response = await axios.post("/services/servicios", servicioData)
      return response.data
    } catch (error) {
      console.error("Error al crear servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },

  // Obtener un servicio por ID
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`/services/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error)
      throw error
    }
  },

  // Actualizar un servicio existente
  actualizar: async (id, servicio) => {
    try {
      // Asegurarse de que los datos estén en el formato correcto
      const servicioData = {
        IdTipoServicio: servicio.IdTipoServicio,
        Nombre: servicio.Nombre,
        Foto: servicio.Foto,
        Descripcion: servicio.Descripcion,
        Beneficios: servicio.Beneficios,
        Que_incluye: servicio.Que_incluye,
        Precio: servicio.Precio,
        PrecioGrande: servicio.PrecioGrande,
        Duracion: servicio.Duracion,
      }

      const response = await axios.put(`/services/servicios/${id}`, servicioData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar servicio:", error)
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
      }
      throw error
    }
  },

  // Cambiar el estado de un servicio
  cambiarEstado: async (id, estado) => {
    try {
      const response = await axios.patch(`/services/servicios/${id}/status`, { Estado: estado })
      return response.data
    } catch (error) {
      console.error("Error al cambiar estado del servicio:", error)
      throw error
    }
  },

  // Eliminar un servicio
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`/services/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar servicio:", error)
      throw error
    }
  },

  // Buscar servicios
  buscar: async (termino, pagina = 1, limite = 10) => {
    try {
      const response = await axios.get(`/services/servicios/search`, {
        params: {
          term: termino,
          page: pagina,
          limit: limite,
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al buscar servicios:", error)
      throw error
    }
  },
}

export default serviciosService
