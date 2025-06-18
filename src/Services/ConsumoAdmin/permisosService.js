import api from "../../Services/ConsumoAdmin/axios"

const permisosService = {
  /**
   * Obtiene todos los permisos
   * @returns {Promise} Promesa con la respuesta
   */
  getAll: async () => {
    try {
      const response = await api.get("/auth/permisos")
      return response.data
    } catch (error) {
      console.error("Error al obtener permisos:", error)
      throw error
    }
  },

  /**
   * Obtiene un permiso por su ID
   * @param {number} id - ID del permiso
   * @returns {Promise} Promesa con la respuesta
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/auth/permisos/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener permiso con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo permiso
   * @param {Object} permisoData - Datos del permiso a crear
   * @returns {Promise} Promesa con la respuesta
   */
  create: async (permisoData) => {
    try {
      const response = await api.post("/auth/permisos", permisoData)
      return response.data
    } catch (error) {
      console.error("Error al crear permiso:", error)
      throw error
    }
  },

  /**
   * Actualiza un permiso existente
   * @param {number} id - ID del permiso a actualizar
   * @param {Object} permisoData - Datos actualizados del permiso
   * @returns {Promise} Promesa con la respuesta
   */
  update: async (id, permisoData) => {
    try {
      const response = await api.put(`/auth/permisos/${id}`, permisoData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar permiso con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un permiso
   * @param {number} id - ID del permiso a eliminar
   * @returns {Promise} Promesa con la respuesta
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/auth/permisos/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar permiso con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Busca permisos por nombre
   * @param {string} nombre - Nombre a buscar
   * @returns {Promise} Promesa con la respuesta
   */
  searchByName: async (nombre) => {
    try {
      const response = await api.get(`/auth/permisos/search?nombre=${nombre}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar permisos con nombre ${nombre}:`, error)
      throw error
    }
  },
}

export default permisosService
