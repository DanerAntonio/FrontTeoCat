import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de categorías de productos
 */
const CategoriasService = {
  /**
   * Obtiene todas las categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/products/categorias")
      return response.data
    } catch (error) {
      console.error("Error al obtener categorías:", error)
      throw error
    }
  },

  /**
   * Obtiene una categoría por su ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>} Datos de la categoría
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/products/categorias/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener categoría con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría a crear
   * @returns {Promise<Object>} Datos de la categoría creada
   */
  create: async (categoriaData) => {
    try {
      const response = await axiosInstance.post("/products/categorias", categoriaData)
      return response.data
    } catch (error) {
      console.error("Error al crear categoría:", error)
      throw error
    }
  },

  /**
   * Actualiza una categoría existente
   * @param {number} id - ID de la categoría a actualizar
   * @param {Object} categoriaData - Nuevos datos de la categoría
   * @returns {Promise<Object>} Datos de la categoría actualizada
   */
  update: async (id, categoriaData) => {
    try {
      const response = await axiosInstance.put(`/products/categorias/${id}`, categoriaData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar categoría con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de una categoría
   * @param {number} id - ID de la categoría
   * @param {boolean} estado - Nuevo estado (true: activo, false: inactivo)
   * @returns {Promise<Object>} Resultado de la operación
   */
  changeStatus: async (id, estado) => {
    try {
      const response = await axiosInstance.patch(`/products/categorias/${id}/status`, { Estado: estado })
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado de categoría con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina una categoría
   * @param {number} id - ID de la categoría a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/products/categorias/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar categoría con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los productos asociados a una categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise<Array>} Lista de productos
   */
  getProducts: async (id) => {
    try {
      const response = await axiosInstance.get(`/products/categorias/${id}/products`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener productos de categoría con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Busca categorías por término
   * @param {string} term - Término de búsqueda
   * @returns {Promise<Array>} Lista de categorías que coinciden con la búsqueda
   */
  search: async (term) => {
    try {
      const response = await axiosInstance.get(`/products/categorias/search?term=${encodeURIComponent(term)}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar categorías con término "${term}":`, error)
      throw error
    }
  },
}

export default CategoriasService
