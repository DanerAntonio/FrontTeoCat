import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar las reseñas
 */
export const reviewsService = {
  /**
   * Obtiene reseñas de productos
   * @returns {Promise<Array>} Lista de reseñas de productos
   */
  getProductReviews: async () => {
    try {
      const response = await axiosInstance.get("/reviews/productos")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas de productos:", error)
      throw error
    }
  },

  /**
   * Obtiene reseñas de servicios
   * @returns {Promise<Array>} Lista de reseñas de servicios
   */
  getServiceReviews: async () => {
    try {
      const response = await axiosInstance.get("/reviews/servicios")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas de servicios:", error)
      throw error
    }
  },

  /**
   * Obtiene reseñas generales
   * @returns {Promise<Array>} Lista de reseñas generales
   */
  getGeneralReviews: async () => {
    try {
      const response = await axiosInstance.get("/reviews/generales")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas generales:", error)
      throw error
    }
  },

  /**
   * Elimina una reseña de producto
   * @param {number|string} id - ID de la reseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteProductReview: async (id) => {
    try {
      const response = await axiosInstance.delete(`/reviews/productos/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar reseña de producto:", error)
      throw error
    }
  },
}

export default reviewsService
