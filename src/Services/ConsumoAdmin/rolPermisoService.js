import api from "../../Services/ConsumoAdmin/axios.js"

const rolPermisoService = {
  /**
   * Obtiene todas las relaciones rol-permiso
   * @returns {Promise} Promesa con la respuesta
   */
  getAll: async () => {
    try {
      const response = await api.get("/auth/rol-permiso")
      return response.data
    } catch (error) {
      console.error("Error al obtener relaciones rol-permiso:", error)
      throw error
    }
  },

  /**
   * Asigna un permiso a un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @returns {Promise} Promesa con la respuesta
   */
  assignPermiso: async (idRol, idPermiso) => {
    try {
      const response = await api.post(`/auth/roles/${idRol}/permisos/${idPermiso}`)
      return response.data
    } catch (error) {
      console.error(`Error al asignar permiso ${idPermiso} al rol ${idRol}:`, error)
      throw error
    }
  },

  /**
   * Asigna múltiples permisos a un rol
   * @param {number} idRol - ID del rol
   * @param {Array} permisos - Array con IDs de permisos
   * @returns {Promise} Promesa con la respuesta
   */
  assignMultiplePermisos: async (idRol, permisos) => {
    try {
      const response = await api.post(`/auth/roles/${idRol}/permisos`, { permisos })
      return response.data
    } catch (error) {
      console.error(`Error al asignar múltiples permisos al rol ${idRol}:`, error)
      throw error
    }
  },

  /**
   * Elimina un permiso de un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @returns {Promise} Promesa con la respuesta
   */
  removePermiso: async (idRol, idPermiso) => {
    try {
      const response = await api.delete(`/auth/roles/${idRol}/permisos/${idPermiso}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar permiso ${idPermiso} del rol ${idRol}:`, error)
      throw error
    }
  },
}

export default rolPermisoService
