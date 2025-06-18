import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar las notificaciones
 */
export const notificacionesService = {
  /**
   * Obtiene todas las notificaciones
   * @returns {Promise<Array>} Lista de notificaciones
   */
  getNotificaciones: async () => {
    try {
      const response = await axiosInstance.get("/notifications/notificaciones")
      return response.data
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      throw error
    }
  },

  /**
   * Crea una nueva notificación
   * @param {Object} notificacionData - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  createNotificacion: async (notificacionData) => {
    try {
      const response = await axiosInstance.post("/notifications/notificaciones", notificacionData)
      return response.data
    } catch (error) {
      console.error("Error al crear notificación:", error)
      throw error
    }
  },

  /**
   * Actualiza una notificación existente
   * @param {number|string} id - ID de la notificación
   * @param {Object} notificacionData - Datos actualizados
   * @returns {Promise<Object>} Notificación actualizada
   */
  updateNotificacion: async (id, notificacionData) => {
    try {
      const response = await axiosInstance.put(`/notifications/notificaciones/${id}`, notificacionData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar notificación:", error)
      throw error
    }
  },

  /**
   * Marca una notificación como leída
   * @param {number|string} id - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAsRead: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/notificaciones/${id}/read`)
      return response.data
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
      throw error
    }
  },

  /**
   * Marca una notificación como resuelta
   * @param {number|string} id - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAsResolved: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/notificaciones/${id}/resolve`)
      return response.data
    } catch (error) {
      console.error("Error al marcar notificación como resuelta:", error)
      throw error
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.post("/notifications/notificaciones/mark-all-read")
      return response.data
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      throw error
    }
  },

  /**
   * Elimina notificaciones antiguas
   * @param {number} days - Días de antigüedad para eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteOldNotifications: async (days = 30) => {
    try {
      const response = await axiosInstance.post("/notifications/notificaciones/delete-old", { days })
      return response.data
    } catch (error) {
      console.error("Error al eliminar notificaciones antiguas:", error)
      throw error
    }
  },

  /**
   * Cambia el estado de una notificación (y de la venta asociada si aplica)
   * @param {number|string} id - ID de la notificación
   * @param {Object} data - { nuevoEstado: "Aprobada" | "Rechazada", motivo?: string }
   * @returns {Promise<Object>}
   */
  changeEstadoNotificacion: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/notifications/notificaciones/${id}/estado`, data)
      return response.data
    } catch (error) {
      console.error("Error al cambiar estado de notificación:", error)
      throw error
    }
  },
}

export default notificacionesService
