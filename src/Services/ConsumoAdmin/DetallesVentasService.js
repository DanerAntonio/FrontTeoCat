import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de detalles de ventas (productos) - CORREGIDO
 */
const DetallesVentasService = {
  /**
   * Obtiene los detalles de productos de una venta - CORREGIDO
   * @param {number} idVenta - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de productos
   */
  getByVenta: async (idVenta) => {
    try {
      console.log("DetallesVentasService: Solicitando detalles de productos para venta ID", idVenta)
      const ruta = `/sales/ventas/${idVenta}/detalles`
      const response = await axiosInstance.get(`${ruta}?_t=${Date.now()}`, {
        timeout: 10000,
      })

      if (Array.isArray(response.data)) {
        return response.data.map((detalle) => ({
          ...detalle,
          NombreProducto: detalle.NombreProducto || `Producto ID: ${detalle.IdProducto}`,
          PrecioUnitario: Number(detalle.PrecioUnitario) || 0,
        }))
      }
      return []
    } catch (error) {
      console.error("DetallesVentasService: Error al obtener detalles de productos para venta ID", idVenta, error)
      return []
    }
  },

  /**
   * Obtiene todos los detalles de ventas
   * @returns {Promise<Array>} Lista de todos los detalles
   */
  getAll: async () => {
    try {
      console.log("DetallesVentasService: Obteniendo todos los detalles de ventas")
      const response = await axiosInstance.get("/sales/detalles")
      console.log("DetallesVentasService: Todos los detalles obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasService: Error al obtener todos los detalles:", error)
      throw error
    }
  },

  /**
   * Obtiene un detalle de producto por su ID
   * @param {number} id - ID del detalle
   * @returns {Promise<Object>} Detalle de producto
   */
  getById: async (id) => {
    try {
      console.log(`DetallesVentasService: Obteniendo detalle con ID ${id}`)
      const response = await axiosInstance.get(`/sales/detalles-ventas/${id}?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasService: Detalle ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al obtener detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo detalle de producto
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>}
   */
  create: async (detalleData) => {
    try {
      console.log("DetallesVentasService: Creando nuevo detalle:", detalleData)
      const response = await axiosInstance.post("/sales/detalles-ventas", detalleData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log("DetallesVentasService: Detalle creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasService: Error al crear detalle de producto:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de producto existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Detalle actualizado
   */
  update: async (id, detalleData) => {
    try {
      console.log(`DetallesVentasService: Actualizando detalle ${id}:`, detalleData)
      const response = await axiosInstance.put(`/sales/detalles-ventas/${id}`, detalleData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasService: Detalle ${id} actualizado:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al actualizar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de producto
   * @param {number} id - ID del detalle a eliminar
   * @param {number} idVenta - ID de la venta a la que pertenece el detalle
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id, idVenta) => {
    try {
      console.log(`DetallesVentasService: Eliminando detalle ${id}`)
      const response = await axiosInstance.delete(`/sales/detalles-ventas/${id}?idVenta=${idVenta}`, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasService: Detalle ${id} eliminado:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al eliminar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene detalles por producto
   * @param {number} idProducto - ID del producto
   * @returns {Promise<Array>} Lista de detalles del producto
   */
  getByProducto: async (idProducto) => {
    try {
      console.log(`DetallesVentasService: Obteniendo detalles para producto ${idProducto}`)
      const response = await axiosInstance.get(`/sales/detalles/producto/${idProducto}`)
      console.log(`DetallesVentasService: Detalles del producto ${idProducto} obtenidos:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al obtener detalles del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Obtiene detalles por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de detalles en el rango
   */
  getByFecha: async (fechaInicio, fechaFin) => {
    try {
      console.log(`DetallesVentasService: Obteniendo detalles entre ${fechaInicio} y ${fechaFin}`)
      const response = await axiosInstance.get("/sales/detalles/fecha", {
        params: { fechaInicio, fechaFin },
      })
      console.log("DetallesVentasService: Detalles por fecha obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasService: Error al obtener detalles por fecha:", error)
      throw error
    }
  },

  /**
   * Busca detalles por criterios específicos
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Array>} Lista de detalles encontrados
   */
  buscar: async (criterios) => {
    try {
      console.log("DetallesVentasService: Buscando detalles con criterios:", criterios)
      const response = await axiosInstance.get("/sales/detalles/buscar", {
        params: criterios,
      })
      console.log("DetallesVentasService: Detalles encontrados:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasService: Error al buscar detalles:", error)
      throw error
    }
  },

  /**
   * Actualiza múltiples detalles de una venta
   * @param {number} idVenta - ID de la venta
   * @param {Array} detalles - Lista de detalles a actualizar
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  updateMultiple: async (idVenta, detalles) => {
    try {
      console.log(`DetallesVentasService: Actualizando múltiples detalles para venta ${idVenta}`)
      const response = await axiosInstance.put(`/sales/ventas/${idVenta}/detalles`, {
        detalles: detalles,
      })
      console.log(`DetallesVentasService: Detalles de venta ${idVenta} actualizados:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al actualizar múltiples detalles:`, error)
      throw error
    }
  },

  /**
   * Elimina todos los detalles de una venta
   * @param {number} idVenta - ID de la venta
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteByVenta: async (idVenta) => {
    try {
      console.log(`DetallesVentasService: Eliminando todos los detalles de venta ${idVenta}`)
      const response = await axiosInstance.delete(`/sales/ventas/${idVenta}/detalles`)
      console.log(`DetallesVentasService: Detalles de venta ${idVenta} eliminados:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasService: Error al eliminar detalles de venta ${idVenta}:`, error)
      throw error
    }
  },

  /**
   * Obtiene estadísticas de detalles de ventas
   * @param {Object} filtros - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de detalles
   */
  getEstadisticas: async (filtros = {}) => {
    try {
      console.log("DetallesVentasService: Obteniendo estadísticas de detalles:", filtros)
      const response = await axiosInstance.get("/sales/detalles/estadisticas", {
        params: filtros,
      })
      console.log("DetallesVentasService: Estadísticas de detalles obtenidas:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasService: Error al obtener estadísticas de detalles:", error)
      throw error
    }
  },
}

export default DetallesVentasService
