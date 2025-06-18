import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de proveedores
 */
const ProveedoresService = {
  /**
   * Obtiene todos los proveedores
   * @returns {Promise<Array>} Lista de proveedores
   */
  getAll: async () => {
    try {
      console.log("Intentando obtener proveedores: /purchases/proveedores")
      const response = await axiosInstance.get("/purchases/proveedores")
      console.log("Respuesta de proveedores:", response.data)

      // Verificar si la respuesta tiene la estructura nueva (con data)
      let proveedores = []
      if (response.data && response.data.data) {
        proveedores = response.data.data
      } else {
        proveedores = response.data
      }

      // Normalizar los datos para asegurar que tengan un formato consistente
      const proveedoresNormalizados = proveedores.map((proveedor) => {
        // Asegurar que todas las propiedades existan con nombres consistentes
        return {
          id: proveedor.IdProveedor || proveedor.id,
          IdProveedor: proveedor.IdProveedor || proveedor.id,
          NombreEmpresa: proveedor.NombreEmpresa || proveedor.nombreEmpresa || "Sin nombre",
          nombreEmpresa: proveedor.NombreEmpresa || proveedor.nombreEmpresa || "Sin nombre",
          PersonaDeContacto: proveedor.PersonaDeContacto || proveedor.personaDeContacto || "",
          personaDeContacto: proveedor.PersonaDeContacto || proveedor.personaDeContacto || "",
          Documento: proveedor.Documento || proveedor.documento || "",
          documento: proveedor.Documento || proveedor.documento || "",
          Telefono: proveedor.Telefono || proveedor.telefono || "",
          telefono: proveedor.Telefono || proveedor.telefono || "",
          Correo: proveedor.Correo || proveedor.correo || "",
          correo: proveedor.Correo || proveedor.correo || "",
          Direccion: proveedor.Direccion || proveedor.direccion || "",
          direccion: proveedor.Direccion || proveedor.direccion || "",
          Estado:
            proveedor.Estado === 1 || proveedor.Estado === true || proveedor.Estado === "Activo"
              ? "Activo"
              : "Inactivo",
          estado:
            proveedor.Estado === 1 || proveedor.Estado === true || proveedor.Estado === "Activo"
              ? "Activo"
              : "Inactivo",
        }
      })

      console.log("Proveedores normalizados:", proveedoresNormalizados)
      return proveedoresNormalizados
    } catch (error) {
      console.error("Error al obtener proveedores:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },

  /**
   * Obtiene un proveedor por su ID
   * @param {number} id - ID del proveedor
   * @returns {Promise<Object>} Datos del proveedor
   */
  getById: async (id) => {
    try {
      console.log(`Intentando obtener proveedor con ID ${id}`)
      const response = await axiosInstance.get(`/purchases/proveedores/${id}`)
      console.log(`Proveedor ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener proveedor con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo proveedor
   * @param {Object} proveedorData - Datos del proveedor a crear
   * @returns {Promise<Object>} Datos del proveedor creado
   */
  create: async (proveedorData) => {
    try {
      // Asegurar que el estado sea "Activo" por defecto
      const proveedorDataConEstado = {
        ...proveedorData,
        Estado: proveedorData.Estado || "Activo",
      }

      console.log("Intentando crear proveedor con datos:", JSON.stringify(proveedorDataConEstado, null, 2))
      const response = await axiosInstance.post("/purchases/proveedores", proveedorDataConEstado)
      console.log("Proveedor creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al crear proveedor:", error)
      throw error
    }
  },

  /**
   * Actualiza un proveedor existente
   * @param {number} id - ID del proveedor a actualizar
   * @param {Object} proveedorData - Nuevos datos del proveedor
   * @returns {Promise<Object>} Datos del proveedor actualizado
   */
  update: async (id, proveedorData) => {
    try {
      console.log(`Intentando actualizar proveedor con ID ${id}:`, JSON.stringify(proveedorData, null, 2))
      const response = await axiosInstance.put(`/purchases/proveedores/${id}`, proveedorData)
      console.log(`Proveedor ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar proveedor con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un proveedor
   * @param {number} id - ID del proveedor
   * @param {string} estado - Nuevo estado (Activo/Inactivo)
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateStatus: async (id, estado) => {
    try {
      console.log(`Intentando cambiar estado de proveedor con ID ${id} a ${estado}`)
      const response = await axiosInstance.patch(`/purchases/proveedores/${id}/status`, { Estado: estado })
      console.log(`Estado de proveedor ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado de proveedor con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un proveedor
   * @param {number} id - ID del proveedor a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/purchases/proveedores/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar proveedor con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Busca proveedores por término
   * @param {string} term - Término de búsqueda
   * @returns {Promise<Array>} Lista de proveedores que coinciden con la búsqueda
   */
  search: async (term) => {
    try {
      console.log(`Intentando buscar proveedores con término "${term}"`)
      const response = await axiosInstance.get(`/purchases/proveedores/search?term=${encodeURIComponent(term)}`)
      console.log(`Proveedores encontrados con término "${term}":`, response.data)

      // Verificar si la respuesta tiene la estructura nueva
      if (response.data && response.data.data) {
        return response.data.data
      }

      return response.data
    } catch (error) {
      console.error(`Error al buscar proveedores con término "${term}":`, error)
      throw error
    }
  },

  /**
   * Obtiene las compras de un proveedor
   * @param {number} id - ID del proveedor
   * @returns {Promise<Array>} Lista de compras del proveedor
   */
  getCompras: async (id) => {
    try {
      console.log(`Intentando obtener compras del proveedor ${id}`)
      const response = await axiosInstance.get(`/purchases/proveedores/${id}/compras`)
      console.log(`Compras del proveedor ${id} obtenidas:`, response.data)

      // Verificar si la respuesta tiene la estructura nueva
      if (response.data && response.data.data) {
        return response.data.data
      }

      return response.data
    } catch (error) {
      console.error(`Error al obtener compras del proveedor ${id}:`, error)
      throw error
    }
  },
}

export default ProveedoresService
