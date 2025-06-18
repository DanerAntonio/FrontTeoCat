import api from "../../Services/ConsumoAdmin/axios"

const rolesService = {
  /**
   * Obtiene todos los roles
   * @returns {Promise} Promesa con la respuesta
   */
  getAll: async () => {
    try {
      const response = await api.get("/auth/roles")
      return response.data
    } catch (error) {
      console.error("Error al obtener roles:", error)
      throw error
    }
  },

  /**
   * Obtiene un rol por su ID
   * @param {number} id - ID del rol
   * @returns {Promise} Promesa con la respuesta
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/auth/roles/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener rol con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo rol
   * @param {Object} rolData - Datos del rol a crear
   * @returns {Promise} Promesa con la respuesta
   */
  create: async (rolData) => {
    try {
      const response = await api.post("/auth/roles", rolData)
      return response.data
    } catch (error) {
      console.error("Error al crear rol:", error)
      throw error
    }
  },

  /**
   * Actualiza un rol existente
   * @param {number} id - ID del rol a actualizar
   * @param {Object} rolData - Datos actualizados del rol
   * @returns {Promise} Promesa con la respuesta
   */
  update: async (id, rolData) => {
    try {
      const response = await api.put(`/auth/roles/${id}`, rolData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar rol con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un rol
   * @param {number} id - ID del rol a eliminar
   * @returns {Promise} Promesa con la respuesta
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/auth/roles/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar rol con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los permisos asignados a un rol
   * @param {number} id - ID del rol
   * @returns {Promise} Promesa con la respuesta
   */
  getPermisos: async (id) => {
    try {
      const response = await api.get(`/auth/roles/${id}/permisos`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener permisos del rol con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Busca roles por nombre
   * @param {string} nombre - Nombre a buscar
   * @returns {Promise} Promesa con la respuesta
   */
  searchByName: async (nombre) => {
    try {
      const response = await api.get(`/auth/roles/search?nombre=${nombre}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar roles con nombre ${nombre}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un rol
   * @param {number} id - ID del rol
   * @param {boolean} estado - Nuevo estado del rol (true: activo, false: inactivo)
   * @returns {Promise} Promesa con la respuesta
   */
  changeStatus: async (id, estado) => {
    try {
      const response = await api.patch(`/auth/roles/${id}/status`, { Estado: estado })
      return response.data
    } catch (error) {
      console.error(`Error al cambiar el estado del rol con ID ${id}:`, error)
      throw error
    }
  },
}

export default rolesService
