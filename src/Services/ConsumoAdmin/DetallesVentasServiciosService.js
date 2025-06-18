import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de detalles de servicios en ventas
 */
const DetallesVentasServiciosService = {
  /**
   * Obtiene los detalles de servicios de una venta - CORREGIDO
   * @param {number} idVenta - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de servicios
   */
  getByVenta: async (idVenta) => {
    try {
      console.log("DetallesVentasServiciosService: Solicitando detalles de servicios para venta ID", idVenta)

      // CORRECCIÓN: Usar las rutas correctas que funcionan según los logs
      const rutasAPI = [
        `/sales/ventas/${idVenta}/detalles-servicios`,
        `/sales/detalles-ventas-servicios?idVenta=${idVenta}`,
        `/sales/detalles-ventas-servicios/venta/${idVenta}`,
        `/sales/ventas/${idVenta}/servicios`,
      ]

      let ultimoError = null

      for (const ruta of rutasAPI) {
        try {
          console.log("DetallesVentasServiciosService: Intentando ruta:", ruta)

          // Añadir timestamp para evitar caché
          const response = await axiosInstance.get(`${ruta}?_t=${Date.now()}`, {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              "Content-Type": "application/json",
            },
            timeout: 10000,
          })

          console.log("DetallesVentasServiciosService: Respuesta de", ruta, ":", response)

          // Verificar la estructura de la respuesta
          if (Array.isArray(response.data)) {
            console.log("DetallesVentasServiciosService: Detalles obtenidos como array:", response.data.length)

            // Guardar en localStorage como respaldo
            localStorage.setItem(`detalles_servicios_venta_${idVenta}`, JSON.stringify(response.data))

            return response.data
          } else if (response.data && Array.isArray(response.data.data)) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos dentro de objeto data:",
              response.data.data.length,
            )

            // Guardar en localStorage como respaldo
            localStorage.setItem(`detalles_servicios_venta_${idVenta}`, JSON.stringify(response.data.data))

            return response.data.data
          } else if (
            response.data &&
            response.data.detallesServicios &&
            Array.isArray(response.data.detallesServicios)
          ) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos como detallesServicios:",
              response.data.detallesServicios.length,
            )

            // Guardar en localStorage como respaldo
            localStorage.setItem(`detalles_servicios_venta_${idVenta}`, JSON.stringify(response.data.detallesServicios))

            return response.data.detallesServicios
          } else if (response.data && response.data.servicios && Array.isArray(response.data.servicios)) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos como servicios:",
              response.data.servicios.length,
            )

            // Guardar en localStorage como respaldo
            localStorage.setItem(`detalles_servicios_venta_${idVenta}`, JSON.stringify(response.data.servicios))

            return response.data.servicios
          }

          // Si no se encontró un formato conocido pero hay datos, intentar extraer un array
          if (response.data && typeof response.data === "object") {
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                console.log(
                  `DetallesVentasServiciosService: Detalles encontrados en propiedad ${key}:`,
                  response.data[key].length,
                )

                // Guardar en localStorage como respaldo
                localStorage.setItem(`detalles_servicios_venta_${idVenta}`, JSON.stringify(response.data[key]))

                return response.data[key]
              }
            }
          }

          console.warn(
            "DetallesVentasServiciosService: Ruta",
            ruta,
            "no devolvió detalles en formato conocido:",
            response.data,
          )
        } catch (rutaError) {
          console.error("DetallesVentasServiciosService: Error al intentar ruta", ruta, ":", rutaError.message)
          ultimoError = rutaError
        }
      }

      // Si llegamos aquí, ninguna ruta funcionó
      console.error("DetallesVentasServiciosService: Todas las rutas fallaron para obtener detalles de servicios")

      // Intentar recuperar datos del localStorage como último recurso
      try {
        const detallesLocal = localStorage.getItem(`detalles_servicios_venta_${idVenta}`)
        if (detallesLocal) {
          const detallesData = JSON.parse(detallesLocal)
          console.log("DetallesVentasServiciosService: Usando datos locales como último recurso")
          return detallesData
        }
      } catch (localError) {
        console.error("DetallesVentasServiciosService: Error al obtener datos locales:", localError)
      }

      // Intentar recuperar desde ventas guardadas
      try {
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
        const venta = ventasGuardadas.find((v) => v.id == idVenta || v.IdVenta == idVenta)

        if (venta && venta.detallesServicios) {
          console.log("DetallesVentasServiciosService: Usando datos locales de ventas como último recurso")
          return venta.detallesServicios
        } else if (venta && venta.servicios) {
          console.log("DetallesVentasServiciosService: Usando servicios locales como último recurso")
          return venta.servicios
        }
      } catch (localError) {
        console.warn("DetallesVentasServiciosService: Error al obtener datos locales de ventas:", localError)
      }

      // Si no hay datos locales, devolver array vacío para evitar errores en la UI
      console.log("DetallesVentasServiciosService: Devolviendo array vacío debido a errores")
      return []
    } catch (error) {
      console.error(
        `DetallesVentasServiciosService: Error al obtener detalles de servicios para venta ID ${idVenta}:`,
        error,
      )

      // Intentar obtener desde localStorage como respaldo final
      try {
        const detallesLocal = localStorage.getItem(`detalles_servicios_venta_${idVenta}`)
        if (detallesLocal) {
          const detallesData = JSON.parse(detallesLocal)
          console.log("DetallesVentasServiciosService: Usando datos locales como último recurso en catch")
          return detallesData
        }
      } catch (localError) {
        console.error("DetallesVentasServiciosService: Error al obtener datos locales en catch:", localError)
      }

      // Devolver array vacío para evitar errores en la UI
      return []
    }
  },

  /**
   * Obtiene todos los detalles de servicios
   * @returns {Promise<Array>} Lista de todos los detalles de servicios
   */
  getAll: async () => {
    try {
      console.log("DetallesVentasServiciosService: Obteniendo todos los detalles de servicios")
      const response = await axiosInstance.get("/sales/detalles-ventas-servicios", {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log("DetallesVentasServiciosService: Todos los detalles obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasServiciosService: Error al obtener todos los detalles:", error)
      throw error
    }
  },

  /**
   * Obtiene un detalle de servicio por su ID
   * @param {number} id - ID del detalle
   * @returns {Promise<Object>} Detalle de servicio
   */
  getById: async (id) => {
    try {
      console.log(`DetallesVentasServiciosService: Obteniendo detalle con ID ${id}`)
      const response = await axiosInstance.get(`/sales/detalles-ventas-servicios/${id}?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasServiciosService: Detalle ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasServiciosService: Error al obtener detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo detalle de servicio
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>} Detalle creado
   */
  create: async (detalleData) => {
    try {
      console.log("DetallesVentasServiciosService: Creando nuevo detalle:", detalleData)

      // Asegurarse de que el detalle de servicio tenga un IdMascota válido
      if (!detalleData.IdMascota && detalleData.IdMascota !== 0) {
        console.log(
          "DetallesVentasServiciosService: Asignando mascota genérica (ID 1) a detalle sin IdMascota:",
          detalleData,
        )
        detalleData.IdMascota = 1
      }

      const response = await axiosInstance.post("/sales/detalles-ventas-servicios", detalleData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log("DetallesVentasServiciosService: Detalle creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("DetallesVentasServiciosService: Error al crear detalle de servicio:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de servicio existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Detalle actualizado
   */
  update: async (id, detalleData) => {
    try {
      console.log(`DetallesVentasServiciosService: Actualizando detalle ${id}:`, detalleData)

      // Asegurarse de que el detalle de servicio tenga un IdMascota válido
      if (!detalleData.IdMascota && detalleData.IdMascota !== 0) {
        console.log(
          "DetallesVentasServiciosService: Asignando mascota genérica (ID 1) a detalle sin IdMascota en actualización:",
          detalleData,
        )
        detalleData.IdMascota = 1
      }

      const response = await axiosInstance.put(`/sales/detalles-ventas-servicios/${id}`, detalleData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasServiciosService: Detalle ${id} actualizado:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasServiciosService: Error al actualizar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de servicio
   * @param {number} id - ID del detalle a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id) => {
    try {
      console.log(`DetallesVentasServiciosService: Eliminando detalle ${id}`)
      const response = await axiosInstance.delete(`/sales/detalles-ventas-servicios/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      })
      console.log(`DetallesVentasServiciosService: Detalle ${id} eliminado:`, response.data)
      return response.data
    } catch (error) {
      console.error(`DetallesVentasServiciosService: Error al eliminar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },
}

export default DetallesVentasServiciosService