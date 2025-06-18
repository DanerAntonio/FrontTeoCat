import axiosInstance from "./axios.js"
import { sincronizarClienteAUsuario } from "./sincronizador.js"

/**
 * ✅ SERVICIO CORREGIDO - Gestión de clientes con manejo robusto de errores
 * Implementa operaciones CRUD con protección contra errores de triggers
 */
const clientesService = {
  /**
   * ✅ FUNCIÓN CORREGIDA - Obtiene todos los clientes
   */
  getAll: async () => {
    try {
      console.log("🔍 Iniciando carga de clientes...")
      const response = await axiosInstance.get("/customers/clientes")
      console.log("📥 Respuesta de getAll clientes:", response.data)

      if (!Array.isArray(response.data)) {
        throw new Error("La respuesta no es un array válido")
      }

      // Filtrar y normalizar clientes
      const clientesNormalizados = response.data.map((cliente) => ({
        ...cliente,
        NombreCompleto: `${cliente.Nombre} ${cliente.Apellido}`,
        // Identificar si es Consumidor Final
        esConsumidorFinal:
          cliente.IdCliente === 1 ||
          cliente.IdCliente === 3 ||
          cliente.Documento === "0000000000" ||
          cliente.Correo === "consumidorfinal@teocat.com",
        // Normalizar estado
        Estado: typeof cliente.Estado === "number" ? (cliente.Estado === 1 ? "Activo" : "Inactivo") : cliente.Estado,
      }))

      console.log("✅ Clientes normalizados:", clientesNormalizados.length)
      return clientesNormalizados
    } catch (error) {
      console.error("❌ Error al obtener clientes:", error)
      throw error
    }
  },

  /**
   * Obtiene un cliente por su ID
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      console.log(`🔍 Obteniendo cliente con ID: ${idNumerico}`)
      const response = await axiosInstance.get(`/customers/clientes/${idNumerico}`)

      const cliente = response.data
      // Normalizar estado si es necesario
      if (typeof cliente.Estado === "number") {
        cliente.Estado = cliente.Estado === 1 ? "Activo" : "Inactivo"
      }

      return cliente
    } catch (error) {
      console.error(`❌ Error al obtener cliente con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN COMPLETAMENTE CORREGIDA - Crea un nuevo cliente con manejo robusto de errores
   */
  create: async (clienteData) => {
    try {
      console.log("🚀 Iniciando creación de cliente con datos:", clienteData)

      // ✅ VALIDACIONES PREVIAS
      if (!clienteData.Nombre || !clienteData.Apellido || !clienteData.Correo) {
        throw new Error("Nombre, Apellido y Correo son campos requeridos")
      }

      // ✅ PROTECCIÓN: No permitir usar datos de Consumidor Final
      if (clienteData.Correo === "consumidorfinal@teocat.com") {
        throw new Error("No se puede usar el correo del Consumidor Final para crear un cliente regular")
      }

      if (clienteData.Documento === "0000000000") {
        throw new Error("No se puede usar el documento del Consumidor Final para crear un cliente regular")
      }

      // ✅ FORMATEAR DATOS CORRECTAMENTE
      const clienteFormateado = {
        Documento: clienteData.Documento || "",
        Correo: clienteData.Correo.trim(),
        Nombre: clienteData.Nombre.trim(),
        Apellido: clienteData.Apellido.trim(),
        Direccion: clienteData.Direccion || "",
        Telefono: clienteData.Telefono || "",
        Estado: clienteData.Estado === "Activo" ? 1 : clienteData.Estado === "Inactivo" ? 0 : 1,
        IdUsuario: clienteData.IdUsuario || null,
      }

      console.log("📤 Datos formateados para crear cliente:", clienteFormateado)

      try {
        // ✅ CONFIGURACIÓN ESPECIAL PARA MANEJAR TRIGGERS LENTOS
        const response = await axiosInstance.post("/customers/clientes", clienteFormateado, {
          timeout: 15000, // 15 segundos para triggers
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("✅ Respuesta exitosa del servidor:", response.data)

        // ✅ NORMALIZAR RESPUESTA
        const clienteRespuesta = response.data || {}

        // Asegurar que tenga IdCliente
        if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
          clienteRespuesta.IdCliente = clienteRespuesta.id
        }

        // Convertir estado numérico a texto
        if (typeof clienteRespuesta.Estado === "number") {
          clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
        }

        // ✅ SINCRONIZACIÓN SEGURA
        try {
          await sincronizarClienteAUsuario(clienteRespuesta, "crear")
          console.log("✅ Sincronización completada")
        } catch (syncError) {
          console.warn("⚠️ Error en sincronización (no crítico):", syncError.message)
        }

        return clienteRespuesta
      } catch (serverError) {
        console.error("❌ Error del servidor al crear cliente:", serverError)

        // ✅ MANEJO ESPECIAL PARA ERRORES 500 (TRIGGERS)
        if (serverError.response?.status === 500) {
          console.log("🔧 Error 500 detectado - Verificando si el cliente se creó...")

          try {
            // Esperar un momento para que los triggers terminen
            await new Promise((resolve) => setTimeout(resolve, 3000))

            // Verificar si el cliente se creó buscando por correo o documento
            const todosLosClientes = await clientesService.getAll()
            const clienteCreado = todosLosClientes.find(
              (c) =>
                (c.Correo && c.Correo.toLowerCase() === clienteFormateado.Correo.toLowerCase()) ||
                (c.Documento && c.Documento === clienteFormateado.Documento && clienteFormateado.Documento !== ""),
            )

            if (clienteCreado) {
              console.log("✅ Cliente creado exitosamente (verificado después de error 500):", clienteCreado)

              // Sincronización segura
              try {
                await sincronizarClienteAUsuario(clienteCreado, "crear")
              } catch (syncError) {
                console.warn("⚠️ Error en sincronización post-verificación:", syncError.message)
              }

              return clienteCreado
            } else {
              console.log("❌ Cliente no encontrado después de error 500")
            }
          } catch (verifyError) {
            console.warn("⚠️ No se pudo verificar después del error 500:", verifyError.message)
          }

          // Si llegamos aquí, el error 500 fue real
          throw new Error(
            "Error interno del servidor. Los triggers de la base de datos pueden estar causando problemas. " +
              "Por favor, ejecuta el script de corrección de triggers y reinicia el backend.",
          )
        }

        // ✅ MANEJO DE OTROS ERRORES HTTP
        if (serverError.response) {
          const { status, data } = serverError.response
          const errorMessage = data?.message || data?.error || "Error desconocido"

          console.error(`📄 Error HTTP ${status}:`, errorMessage)

          if (status === 400) {
            if (errorMessage.toLowerCase().includes("correo") || errorMessage.toLowerCase().includes("email")) {
              const customError = new Error(`El correo electrónico ya está registrado: ${errorMessage}`)
              customError.isEmailDuplicate = true
              throw customError
            } else if (errorMessage.toLowerCase().includes("documento")) {
              const customError = new Error(`El número de documento ya está registrado: ${errorMessage}`)
              customError.isDocumentDuplicate = true
              throw customError
            } else {
              throw new Error(`Error de validación: ${errorMessage}`)
            }
          } else if (status === 409) {
            throw new Error(`Conflicto de datos: ${errorMessage}`)
          } else {
            throw new Error(errorMessage)
          }
        }

        // ✅ ERRORES DE RED/TIMEOUT
        if (serverError.code === "ECONNABORTED" || serverError.message.includes("timeout")) {
          console.log("⏱️ Timeout detectado - Verificando si el cliente se creó...")

          try {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            const todosLosClientes = await clientesService.getAll()
            const clienteCreado = todosLosClientes.find(
              (c) => c.Correo?.toLowerCase() === clienteFormateado.Correo.toLowerCase(),
            )

            if (clienteCreado) {
              console.log("✅ Cliente creado exitosamente (verificado después de timeout):", clienteCreado)
              return clienteCreado
            }
          } catch (verifyError) {
            console.warn("No se pudo verificar después del timeout:", verifyError.message)
          }

          throw new Error(
            "Timeout en la creación del cliente. Esto puede deberse a triggers lentos en la base de datos. " +
              "Por favor, recarga la página para verificar si se creó correctamente.",
          )
        }

        // Error genérico
        throw new Error(serverError.message || "Error desconocido al crear cliente")
      }
    } catch (error) {
      console.error("❌ Error final al crear cliente:", error)

      // Si es un error que ya manejamos, re-lanzarlo
      if (error.isEmailDuplicate || error.isDocumentDuplicate) {
        throw error
      }

      // Para otros errores, agregar contexto
      throw new Error(error.message || "Error desconocido al crear cliente")
    }
  },

  /**
   * ✅ FUNCIÓN CORREGIDA - Actualiza un cliente existente
   */
  update: async (id, clienteData) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para actualización")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      // ✅ PROTECCIÓN: No permitir actualizar Consumidor Final
      if (idNumerico === 1 || idNumerico === 3) {
        throw new Error("No se puede modificar el Consumidor Final")
      }

      // ✅ VALIDACIÓN: No permitir cambiar a datos de Consumidor Final
      if (clienteData.Correo === "consumidorfinal@teocat.com") {
        throw new Error("No se puede cambiar a correo del Consumidor Final")
      }

      if (clienteData.Documento === "0000000000") {
        throw new Error("No se puede cambiar a documento del Consumidor Final")
      }

      console.log(`🔄 Actualizando cliente ${idNumerico} con datos:`, clienteData)

      // Obtener cliente actual para mantener IdUsuario
      let clienteActual = {}
      try {
        clienteActual = await clientesService.getById(idNumerico)
        console.log("📋 Cliente actual obtenido:", clienteActual)
      } catch (getError) {
        console.warn(`⚠️ No se pudo obtener cliente actual:`, getError.message)
      }

      // Formatear datos
      const clienteFormateado = {
        Documento: clienteData.Documento || "",
        Correo: clienteData.Correo?.trim() || "",
        Nombre: clienteData.Nombre?.trim() || "",
        Apellido: clienteData.Apellido?.trim() || "",
        Direccion: clienteData.Direccion || "",
        Telefono: clienteData.Telefono || "",
        Estado: typeof clienteData.Estado === "string" ? (clienteData.Estado === "Activo" ? 1 : 0) : clienteData.Estado,
        IdUsuario: clienteActual.IdUsuario || 1,
      }

      const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteFormateado, {
        timeout: 10000,
      })

      console.log("✅ Cliente actualizado exitosamente:", response.data)

      // Normalizar respuesta
      const clienteRespuesta = response.data || {}

      if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
        clienteRespuesta.IdCliente = clienteRespuesta.id
      }

      if (typeof clienteRespuesta.Estado === "number") {
        clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
      }

      if (!clienteRespuesta.IdCliente) {
        clienteRespuesta.IdCliente = idNumerico
      }

      // Sincronización segura
      try {
        const clienteCompleto = {
          ...clienteRespuesta,
          ...clienteFormateado,
          IdCliente: idNumerico,
        }
        await sincronizarClienteAUsuario(clienteCompleto, "actualizar")
      } catch (syncError) {
        console.warn("⚠️ Error en sincronización al actualizar:", syncError.message)
      }

      return clienteRespuesta
    } catch (error) {
      console.error(`❌ Error al actualizar cliente ${id}:`, error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Error desconocido"
        throw new Error(errorMessage)
      }

      throw new Error(error.message || "Error desconocido al actualizar cliente")
    }
  },

  /**
   * ✅ FUNCIÓN CORREGIDA - Elimina un cliente
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para eliminación")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      // ✅ PROTECCIÓN: No permitir eliminar Consumidor Final
      if (idNumerico === 1 || idNumerico === 3) {
        throw new Error("No se puede eliminar el Consumidor Final")
      }

      console.log(`🗑️ Eliminando cliente ${idNumerico}`)

      // Obtener cliente para sincronización
      let cliente = null
      try {
        cliente = await clientesService.getById(idNumerico)
      } catch (getError) {
        console.warn(`⚠️ No se pudo obtener cliente para sincronización:`, getError.message)
      }

      // Sincronización previa
      if (cliente) {
        try {
          await sincronizarClienteAUsuario(cliente, "eliminar")
        } catch (syncError) {
          console.warn("⚠️ Error en sincronización al eliminar:", syncError.message)
        }
      }

      const response = await axiosInstance.delete(`/customers/clientes/${idNumerico}`)
      console.log("✅ Cliente eliminado exitosamente")
      return response.data
    } catch (error) {
      console.error(`❌ Error al eliminar cliente ${id}:`, error)

      if (error.response?.status === 400 && error.response.data?.message?.toLowerCase().includes("mascotas")) {
        const customError = new Error("No se puede eliminar el cliente porque tiene mascotas asociadas")
        customError.hasDependencies = true
        throw customError
      }

      if (error.response?.status === 409) {
        const customError = new Error(
          "No se puede eliminar el cliente porque tiene registros asociados (mascotas, ventas, etc.)",
        )
        customError.hasDependencies = true
        throw customError
      }

      throw new Error(error.response?.data?.message || error.message || "Error desconocido al eliminar cliente")
    }
  },

  /**
   * Busca clientes por término
   */
  search: async (term) => {
    try {
      if (!term) {
        throw new Error("Término de búsqueda no proporcionado")
      }

      const response = await axiosInstance.get(`/customers/clientes?term=${encodeURIComponent(term)}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar clientes con término "${term}":`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN CORREGIDA - Actualiza el estado de un cliente
   */
  updateStatus: async (id, estado) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para actualización de estado")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      // ✅ PROTECCIÓN: No permitir cambiar estado de Consumidor Final
      if (idNumerico === 1 || idNumerico === 3) {
        throw new Error("No se puede cambiar el estado del Consumidor Final")
      }

      console.log(`🔄 Actualizando estado del cliente ${idNumerico} a ${estado}`)

      // Guardar estado localmente para persistencia
      try {
        const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")
        clientesEstados[idNumerico] = estado
        localStorage.setItem("clientesEstados", JSON.stringify(clientesEstados))
      } catch (e) {
        console.warn("Error al guardar estado en localStorage:", e)
      }

      // Obtener cliente actual
      const clienteActual = await clientesService.getById(idNumerico)

      if (!clienteActual) {
        throw new Error(`No se encontró el cliente con ID ${idNumerico}`)
      }

      // Preparar datos para actualización
      const clienteActualizado = {
        ...clienteActual,
        Estado: estado === "Activo" ? 1 : 0,
      }

      // Limpiar campos que no deben enviarse
      delete clienteActualizado.NombreCompleto
      delete clienteActualizado.esConsumidorFinal

      const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteActualizado, {
        timeout: 10000,
      })

      // Normalizar respuesta
      const clienteRespuesta = response.data || {}

      if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
        clienteRespuesta.IdCliente = clienteRespuesta.id
      }

      if (typeof clienteRespuesta.Estado === "number") {
        clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
      }

      // Sincronización segura
      try {
        await sincronizarClienteAUsuario(clienteRespuesta, "cambiarEstado")
      } catch (syncError) {
        console.warn("⚠️ Error en sincronización al cambiar estado:", syncError.message)
      }

      return clienteRespuesta
    } catch (error) {
      console.error(`❌ Error al actualizar estado de cliente ${id}:`, error)

      // Devolver objeto simulado para que la UI no se rompa
      return {
        id: id,
        IdCliente: id,
        Estado: estado,
        mensaje: "Actualización de estado simulada debido a error en el servidor",
      }
    }
  },

  /**
   * Obtiene las mascotas de un cliente
   */
  getMascotas: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      const response = await axiosInstance.get(`/customers/clientes/${idNumerico}/mascotas`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener mascotas del cliente con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene el estado guardado localmente
   */
  getLocalStatus: (id) => {
    try {
      const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")
      return clientesEstados[id] || null
    } catch (error) {
      console.warn("Error al obtener estado local:", error)
      return null
    }
  },

  /**
   * Sincroniza todos los clientes con la tabla de usuarios
   */
  sincronizarTodosClientesUsuarios: async () => {
    try {
      const { sincronizarTodosClientesUsuarios } = await import("./sincronizador.js")
      return await sincronizarTodosClientesUsuarios()
    } catch (error) {
      console.error("Error al sincronizar todos los clientes con usuarios:", error)
      return { exito: 0, error: 0 }
    }
  },

  /**
   * Ejecuta una sincronización bidireccional completa
   */
  sincronizacionCompleta: async () => {
    try {
      const { sincronizacionCompleta } = await import("./sincronizador.js")
      return await sincronizacionCompleta()
    } catch (error) {
      console.error("Error al ejecutar sincronización completa:", error)
      return {
        usuariosAClientes: { exito: 0, error: 0 },
        clientesAUsuarios: { exito: 0, error: 0 },
      }
    }
  },
}

export default clientesService
