import api from "../../Services/ConsumoAdmin/axios.js"
import { sincronizarUsuarioACliente } from "../ConsumoAdmin/sincronizador.js"

/**
 * ✅ SERVICIO DE USUARIOS COMPLETO Y VALIDADO
 * Compatible con el controlador actualizado y procedimientos almacenados
 * Maneja usuarios regulares y usuarios con rol cliente de forma robusta
 */
const usuariosService = {
  /**
   * ✅ FUNCIÓN VALIDADA: Obtiene todos los usuarios con manejo robusto de usuarios con rol cliente
   * @returns {Promise<Array>} Array de usuarios procesados y enriquecidos
   */
  getAll: async () => {
    try {
      console.log("🔍 UsuariosService: Obteniendo todos los usuarios...")
      const response = await api.get("/auth/usuarios")

      console.log("📥 Respuesta original de la API:", response.data)

      // ✅ VALIDACIÓN: Asegurar que response.data sea un array
      if (!Array.isArray(response.data)) {
        console.warn("⚠️ La respuesta no es un array, convirtiendo...")
        return []
      }

      // ✅ PROCESAMIENTO MEJORADO: Asegurar estructura correcta para cada usuario
      const processedUsers = response.data.map((user) => {
        const processedUser = {
          IdUsuario: user.IdUsuario,
          Nombre: user.Nombre || "",
          Apellido: user.Apellido || "",
          NombreCompleto: `${user.Nombre || ""} ${user.Apellido || ""}`.trim(),
          Correo: user.Correo || "",
          Telefono: user.Telefono || "",
          Direccion: user.Direccion || "",
          FechaCreacion: user.FechaCreacion,
          Estado: user.Estado,
          Foto: user.Foto || null,
          Documento: user.Documento || "",
          // ✅ CORRECCIÓN: Manejo robusto del rol
          Rol: {
            IdRol: user.Rol?.IdRol || user.IdRol || 0,
            NombreRol: user.Rol?.NombreRol || user.NombreRol || "Sin rol",
          },
          // ✅ NUEVO: Indicador si es usuario con rol cliente
          esUsuarioCliente: (user.Rol?.IdRol || user.IdRol) === 2,
          // ✅ NUEVO: Información adicional para usuarios con rol cliente
          clienteInfo: null,
        }

        console.log(`👤 Usuario procesado: ${processedUser.Nombre} ${processedUser.Apellido} - Rol: ${processedUser.Rol.NombreRol} - Es Cliente: ${processedUser.esUsuarioCliente}`)
        
        return processedUser
      })

      // ✅ NUEVO: Enriquecer usuarios con rol cliente con información de cliente
      const usuariosEnriquecidos = await usuariosService._enriquecerUsuariosClientes(processedUsers)

      console.log("✅ Usuarios procesados y enriquecidos:", usuariosEnriquecidos.length)
      return usuariosEnriquecidos
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Enriquece usuarios con rol cliente con información de la tabla clientes
   * @param {Array} usuarios - Array de usuarios a enriquecer
   * @returns {Promise<Array>} Array de usuarios enriquecidos
   */
  _enriquecerUsuariosClientes: async (usuarios) => {
    try {
      // Filtrar usuarios con rol cliente
      const usuariosClientes = usuarios.filter(user => user.esUsuarioCliente)
      
      if (usuariosClientes.length === 0) {
        console.log("ℹ️ No hay usuarios con rol cliente para enriquecer")
        return usuarios
      }

      console.log(`🔍 Enriqueciendo ${usuariosClientes.length} usuarios con rol cliente...`)

      // ✅ MEJORADO: Usar endpoint específico para clientes completos
      let clientesData = []
      try {
        // Intentar usar el endpoint mejorado primero
        const clientesResponse = await api.get("/customers/clientes-completo")
        clientesData = Array.isArray(clientesResponse.data) ? clientesResponse.data : []
        console.log("✅ Usando endpoint clientes-completo")
      } catch (clientesError) {
        console.warn("⚠️ Endpoint clientes-completo no disponible, usando endpoint básico")
        try {
          const clientesResponse = await api.get("/customers/clientes")
          clientesData = Array.isArray(clientesResponse.data) ? clientesResponse.data : []
        } catch (basicError) {
          console.error("❌ Error al obtener información de clientes:", basicError)
          clientesData = []
        }
      }

      // Enriquecer cada usuario con rol cliente
      const usuariosEnriquecidos = usuarios.map(usuario => {
        if (!usuario.esUsuarioCliente) {
          return usuario
        }

        // Buscar información del cliente correspondiente
        const clienteInfo = clientesData.find(cliente => 
          cliente.IdUsuario === usuario.IdUsuario
        )

        if (clienteInfo) {
          console.log(`✅ Cliente encontrado para usuario ${usuario.IdUsuario}: ${clienteInfo.IdCliente}`)
          return {
            ...usuario,
            clienteInfo: {
              IdCliente: clienteInfo.IdCliente,
              sincronizado: true,
              fechaSincronizacion: clienteInfo.FechaCreacion || new Date().toISOString(),
              datosCliente: clienteInfo,
              // ✅ NUEVO: Información adicional
              tipoCliente: clienteInfo.TipoCliente || 'Usuario Cliente',
              esConsumidorFinal: clienteInfo.EsConsumidorFinal || false
            }
          }
        } else {
          console.warn(`⚠️ Usuario ${usuario.IdUsuario} tiene rol cliente pero no está sincronizado en tabla clientes`)
          return {
            ...usuario,
            clienteInfo: {
              IdCliente: null,
              sincronizado: false,
              requiereSincronizacion: true,
              tipoCliente: 'No sincronizado',
              esConsumidorFinal: false
            }
          }
        }
      })

      return usuariosEnriquecidos
    } catch (error) {
      console.error("❌ Error al enriquecer usuarios clientes:", error)
      return usuarios // Devolver usuarios originales en caso de error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Obtiene un usuario por su ID con información de cliente si aplica
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario procesado con información completa
   */
  getById: async (id) => {
    try {
      console.log(`🔍 UsuariosService: Obteniendo usuario con ID ${id}`)
      const response = await api.get(`/auth/usuarios/${id}`)

      const user = response.data
      if (!user) {
        throw new Error(`Usuario con ID ${id} no encontrado`)
      }

      // ✅ PROCESAMIENTO MEJORADO: Asegurar estructura correcta
      const processedUser = {
        ...user,
        IdUsuario: user.IdUsuario,
        NombreCompleto: `${user.Nombre || ""} ${user.Apellido || ""}`.trim(),
        Documento: user.Documento || "",
        Rol: user.Rol || {
          IdRol: user.IdRol || 0,
          NombreRol: user.NombreRol || "Sin rol",
        },
        esUsuarioCliente: (user.Rol?.IdRol || user.IdRol) === 2,
        clienteInfo: null,
      }

      // ✅ NUEVO: Si es usuario con rol cliente, obtener información de cliente
      if (processedUser.esUsuarioCliente) {
        try {
          console.log(`🔍 Usuario ${id} tiene rol cliente, obteniendo información de cliente...`)
          const clienteInfo = await usuariosService._obtenerInfoCliente(id)
          processedUser.clienteInfo = clienteInfo
          console.log(`✅ Información de cliente obtenida:`, clienteInfo)
        } catch (clienteError) {
          console.warn(`⚠️ Error al obtener información de cliente para usuario ${id}:`, clienteError)
          processedUser.clienteInfo = {
            IdCliente: null,
            sincronizado: false,
            requiereSincronizacion: true,
            error: clienteError.message
          }
        }
      }

      console.log(`✅ Usuario ${id} procesado:`, processedUser.IdUsuario)
      return processedUser
    } catch (error) {
      console.error(`❌ Error al obtener usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Obtiene información de cliente para un usuario específico
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} Información del cliente
   */
  _obtenerInfoCliente: async (idUsuario) => {
    try {
      // ✅ MEJORADO: Usar el nuevo endpoint específico
      try {
        const clienteResponse = await api.get(`/customers/clientes/usuario/${idUsuario}`)
        if (clienteResponse.data) {
          return {
            IdCliente: clienteResponse.data.IdCliente,
            sincronizado: true,
            fechaSincronizacion: clienteResponse.data.FechaCreacion || new Date().toISOString(),
            datosCliente: clienteResponse.data,
            tipoCliente: clienteResponse.data.TipoCliente || 'Usuario Cliente',
            esConsumidorFinal: clienteResponse.data.EsConsumidorFinal || false
          }
        }
      } catch (directError) {
        console.warn("⚠️ No se pudo obtener cliente directamente, buscando en lista completa")
      }

      // Buscar en la lista completa de clientes
      const clientesResponse = await api.get("/customers/clientes")
      const clientes = Array.isArray(clientesResponse.data) ? clientesResponse.data : []
      
      const clienteEncontrado = clientes.find(cliente => cliente.IdUsuario === idUsuario)
      
      if (clienteEncontrado) {
        return {
          IdCliente: clienteEncontrado.IdCliente,
          sincronizado: true,
          fechaSincronizacion: clienteEncontrado.FechaCreacion || new Date().toISOString(),
          datosCliente: clienteEncontrado,
          tipoCliente: 'Usuario Cliente',
          esConsumidorFinal: false
        }
      }

      // Si no se encuentra, el usuario no está sincronizado
      return {
        IdCliente: null,
        sincronizado: false,
        requiereSincronizacion: true,
        tipoCliente: 'No sincronizado',
        esConsumidorFinal: false
      }
    } catch (error) {
      console.error(`❌ Error al obtener información de cliente para usuario ${idUsuario}:`, error)
      return {
        IdCliente: null,
        sincronizado: false,
        error: error.message,
        tipoCliente: 'Error',
        esConsumidorFinal: false
      }
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Crea un nuevo usuario con sincronización automática si es cliente
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado con información completa
   */
  create: async (userData) => {
    try {
      console.log("🚀 UsuariosService: Creando usuario con datos:", userData)

      // ✅ VALIDACIÓN MEJORADA: Asegurar formato correcto
      const formattedData = {
        Nombre: userData.Nombre?.trim() || "",
        Apellido: userData.Apellido?.trim() || "",
        Correo: userData.Correo?.trim() || "",
        Documento: userData.Documento?.trim() || "",
        Telefono: userData.Telefono?.trim() || "",
        Direccion: userData.Direccion?.trim() || "",
        Foto: userData.Foto || null,
        IdRol: parseInt(userData.IdRol) || 1,
        Estado: userData.Estado !== undefined ? userData.Estado : true,
      }

      // Manejar contraseña
      if (userData.Password) {
        formattedData.Password = userData.Password
      } else if (!userData.IdUsuario) {
        // Generar contraseña temporal más segura
        formattedData.Password = usuariosService._generarPasswordTemporal()
        console.log("🔑 Contraseña temporal generada")
      }

      console.log("📤 Datos formateados para crear usuario:", { ...formattedData, Password: "***" })
      const response = await api.post("/auth/usuarios", formattedData)
      console.log("✅ Usuario creado exitosamente:", response.data.IdUsuario)

      // ✅ SINCRONIZACIÓN MEJORADA: Si es usuario con rol cliente, sincronizar automáticamente
      if (formattedData.IdRol === 2) {
        console.log("🔄 Usuario tiene rol cliente, iniciando sincronización...")
        try {
          // ✅ USAR ENDPOINT ESPECÍFICO DE SINCRONIZACIÓN
          await api.post(`/customers/sincronizar-usuario/${response.data.IdUsuario}`)
          console.log("✅ Sincronización completada via endpoint")
          
          // Enriquecer respuesta con información de cliente
          const usuarioCompleto = await usuariosService.getById(response.data.IdUsuario)
          return usuarioCompleto
        } catch (syncError) {
          console.error("❌ Error en la sincronización al crear usuario:", syncError)
          
          // Fallback: usar sincronizador local
          try {
            const resultadoSincronizacion = await sincronizarUsuarioACliente(response.data, "crear")
            console.log("✅ Sincronización fallback completada:", resultadoSincronizacion)
            
            const usuarioCompleto = await usuariosService.getById(response.data.IdUsuario)
            return usuarioCompleto
          } catch (fallbackError) {
            console.error("❌ Error en sincronización fallback:", fallbackError)
            return response.data
          }
        }
      }

      return response.data
    } catch (error) {
      console.error("❌ Error al crear usuario:", error)
      console.error("📋 Mensaje de error:", error.message)
      console.error("🔍 Respuesta del servidor:", error.response?.data)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Actualiza un usuario existente con sincronización automática
   * @param {number} id - ID del usuario a actualizar
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} Usuario actualizado con información completa
   */
  update: async (id, userData) => {
    try {
      console.log(`🔄 UsuariosService: Actualizando usuario ${id} con datos:`, userData)

      // Obtener datos actuales del usuario para comparar
      const usuarioActual = await usuariosService.getById(id)
      const rolAnterior = usuarioActual.Rol?.IdRol
      const rolNuevo = parseInt(userData.IdRol)

      // ✅ VALIDACIÓN MEJORADA: Asegurar formato correcto
      const formattedData = {
        Nombre: userData.Nombre?.trim() || "",
        Apellido: userData.Apellido?.trim() || "",
        Correo: userData.Correo?.trim() || "",
        Documento: userData.Documento?.trim() || "",
        Telefono: userData.Telefono?.trim() || "",
        Direccion: userData.Direccion?.trim() || "",
        Foto: userData.Foto || usuarioActual.Foto,
        IdRol: rolNuevo,
        Estado: userData.Estado !== undefined ? userData.Estado : true,
      }

      if (userData.Password) {
        formattedData.Password = userData.Password
      }

      console.log("📤 Datos formateados para actualizar usuario:", { ...formattedData, Password: userData.Password ? "***" : "sin cambio" })
      const response = await api.put(`/auth/usuarios/${id}`, formattedData)
      console.log("✅ Usuario actualizado exitosamente:", response.data)

      // ✅ SINCRONIZACIÓN INTELIGENTE: Manejar cambios de rol
      try {
        // Caso 1: Usuario cambió A rol cliente
        if (rolAnterior !== 2 && rolNuevo === 2) {
          console.log("🔄 Usuario cambió a rol cliente, creando registro de cliente...")
          await api.post(`/customers/sincronizar-usuario/${id}`)
        }
        // Caso 2: Usuario cambió DE rol cliente a otro rol
        else if (rolAnterior === 2 && rolNuevo !== 2) {
          console.log("🔄 Usuario dejó de ser cliente, eliminando registro de cliente...")
          // El trigger del backend se encargará de esto
        }
        // Caso 3: Usuario sigue siendo cliente, actualizar información
        else if (rolAnterior === 2 && rolNuevo === 2) {
          console.log("🔄 Usuario sigue siendo cliente, actualizando información...")
          await api.post(`/customers/sincronizar-usuario/${id}`)
        }

        // Obtener usuario actualizado con información de cliente
        const usuarioFinal = await usuariosService.getById(id)
        console.log("✅ Sincronización completada, usuario final obtenido")
        return usuarioFinal
      } catch (syncError) {
        console.error("❌ Error en la sincronización al actualizar usuario:", syncError)
        return response.data
      }
    } catch (error) {
      console.error(`❌ Error al actualizar usuario con ID ${id}:`, error)
      console.error("📋 Mensaje de error:", error.message)
      console.error("🔍 Respuesta del servidor:", error.response?.data)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Elimina un usuario con limpieza de sincronización
   * @param {number} id - ID del usuario a eliminar
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  delete: async (id) => {
    try {
      console.log(`🗑️ UsuariosService: Eliminando usuario ${id}`)

      // Obtener información del usuario antes de eliminarlo
      const usuario = await usuariosService.getById(id)

      // ✅ LIMPIEZA MEJORADA: El backend se encarga de la limpieza automática
      // pero podemos hacer una limpieza preventiva
      if (usuario && usuario.esUsuarioCliente) {
        console.log("🔄 Usuario es cliente, el backend se encargará de la limpieza automática...")
      }

      const response = await api.delete(`/auth/usuarios/${id}`)
      console.log("✅ Usuario eliminado exitosamente")
      return response.data
    } catch (error) {
      console.error(`❌ Error al eliminar usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Cambia el estado de un usuario con sincronización
   * @param {number} id - ID del usuario
   * @param {boolean} estado - Nuevo estado (true para activo, false para inactivo)
   * @returns {Promise<Object>} Resultado del cambio de estado
   */
  changeStatus: async (id, estado) => {
    try {
      console.log(`🔄 UsuariosService: Cambiando estado del usuario ${id} a ${estado ? "Activo" : "Inactivo"}`)

      const estadoData = { Estado: estado }
      const response = await api.patch(`/auth/usuarios/${id}/status`, estadoData)

      // ✅ SINCRONIZACIÓN MEJORADA: El trigger del backend se encarga automáticamente
      console.log("✅ Estado del usuario actualizado exitosamente")
      return response.data
    } catch (error) {
      console.error(`❌ Error al cambiar estado del usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN VALIDADA: Obtiene usuarios por rol con información enriquecida
   * @param {number} idRol - ID del rol
   * @returns {Promise<Array>} Array de usuarios del rol especificado
   */
  getByRol: async (idRol) => {
    try {
      console.log(`🔍 UsuariosService: Obteniendo usuarios con rol ${idRol}`)
      const response = await api.get(`/auth/roles/${idRol}/usuarios`)

      // ✅ VALIDACIÓN: Asegurar que response.data sea un array
      if (!Array.isArray(response.data)) {
        console.warn("⚠️ La respuesta no es un array")
        return []
      }

      // ✅ PROCESAMIENTO MEJORADO: Asegurar estructura correcta
      const processedUsers = response.data.map((user) => ({
        IdUsuario: user.IdUsuario,
        Nombre: user.Nombre || "",
        Apellido: user.Apellido || "",
        NombreCompleto: `${user.Nombre || ""} ${user.Apellido || ""}`.trim(),
        Correo: user.Correo || "",
        Telefono: user.Telefono || "",
        Direccion: user.Direccion || "",
        FechaCreacion: user.FechaCreacion,
        Estado: user.Estado,
        Foto: user.Foto || null,
        Documento: user.Documento || "",
        Rol: {
          IdRol: user.Rol?.IdRol || user.IdRol || 0,
          NombreRol: user.Rol?.NombreRol || user.NombreRol || "Sin rol",
        },
        esUsuarioCliente: (user.Rol?.IdRol || user.IdRol) === 2,
        clienteInfo: null,
      }))

      // ✅ ENRIQUECIMIENTO: Si es rol cliente (2), enriquecer con información de cliente
      if (parseInt(idRol) === 2) {
        console.log("🔄 Enriqueciendo usuarios con rol cliente...")
        const usuariosEnriquecidos = await usuariosService._enriquecerUsuariosClientes(processedUsers)
        console.log("✅ Usuarios con rol cliente enriquecidos:", usuariosEnriquecidos.length)
        return usuariosEnriquecidos
      }

      console.log("✅ Usuarios por rol procesados:", processedUsers.length)
      return processedUsers
    } catch (error) {
      console.error(`❌ Error al obtener usuarios con rol ${idRol}:`, error)
      return []
    }
  },

  /**
   * ✅ FUNCIÓN NUEVA VALIDADA: Obtiene específicamente usuarios con rol cliente y sus mascotas
   * @returns {Promise<Array>} Array de usuarios cliente con información de mascotas
   */
  getUsuariosClientes: async () => {
    try {
      console.log("🔍 UsuariosService: Obteniendo usuarios con rol cliente...")
      
      // ✅ MEJORADO: Usar endpoint específico del backend si está disponible
      try {
        const response = await api.get("/customers/usuarios-clientes-mascotas")
        if (Array.isArray(response.data)) {
          console.log("✅ Usando endpoint específico usuarios-clientes-mascotas")
          return response.data.map(usuario => ({
            ...usuario,
            NombreCompleto: usuario.NombreCompleto || `${usuario.Nombre} ${usuario.Apellido}`,
            esUsuarioCliente: true,
            // Normalizar información de mascotas
            mascotas: usuario.mascotas || [],
            totalMascotas: usuario.totalMascotas || 0,
            tieneMascotas: usuario.tieneMascotas || false,
            puedeRecibirServicios: usuario.tieneMascotas || usuario.IdCliente === 3 || usuario.IdCliente === 1
          }))
        }
      } catch (endpointError) {
        console.warn("⚠️ Endpoint específico no disponible, usando método alternativo")
      }

      // Fallback: Obtener usuarios con rol cliente y enriquecer manualmente
      const usuariosClientes = await usuariosService.getByRol(2)
      
      // ✅ ENRIQUECIMIENTO ADICIONAL: Obtener mascotas para cada usuario cliente
      const usuariosConMascotas = await Promise.all(
        usuariosClientes.map(async (usuario) => {
          try {
            // Obtener mascotas del usuario/cliente
            let mascotas = []
            
            // Intentar obtener mascotas por IdCliente si está sincronizado
            if (usuario.clienteInfo && usuario.clienteInfo.IdCliente) {
              try {
                const mascotasResponse = await api.get(`/customers/mascotas/cliente/${usuario.clienteInfo.IdCliente}`)
                mascotas = Array.isArray(mascotasResponse.data) ? mascotasResponse.data : []
              } catch (mascotasError) {
                console.warn(`⚠️ Error al obtener mascotas por IdCliente para usuario ${usuario.IdUsuario}:`, mascotasError.message)
              }
            }
            
            // Si no se obtuvieron mascotas, intentar por IdUsuario
            if (mascotas.length === 0) {
              try {
                const mascotasResponse = await api.get(`/customers/mascotas/usuario/${usuario.IdUsuario}`)
                mascotas = Array.isArray(mascotasResponse.data) ? mascotasResponse.data : []
              } catch (mascotasError) {
                console.warn(`⚠️ Error al obtener mascotas por IdUsuario para usuario ${usuario.IdUsuario}:`, mascotasError.message)
              }
            }
            
            // Filtrar solo mascotas activas
            const mascotasActivas = mascotas.filter(mascota => 
              mascota.Estado === true || mascota.Estado === 1 || mascota.estado === true
            )
            
            return {
              ...usuario,
              mascotas: mascotasActivas,
              totalMascotas: mascotasActivas.length,
              tieneMascotas: mascotasActivas.length > 0,
              puedeRecibirServicios: mascotasActivas.length > 0 || 
                                   (usuario.clienteInfo && (usuario.clienteInfo.IdCliente === 3 || usuario.clienteInfo.IdCliente === 1))
            }
          } catch (error) {
            console.warn(`⚠️ Error al enriquecer usuario ${usuario.IdUsuario} con mascotas:`, error)
            return {
              ...usuario,
              mascotas: [],
              totalMascotas: 0,
              tieneMascotas: false,
              puedeRecibirServicios: false
            }
          }
        })
      )
      
      console.log("✅ Usuarios cliente con mascotas obtenidos:", usuariosConMascotas.length)
      return usuariosConMascotas
    } catch (error) {
      console.error("❌ Error al obtener usuarios clientes:", error)
      return []
    }
  },

  /**
   * ✅ FUNCIÓN NUEVA VALIDADA: Fuerza la sincronización de un usuario específico con la tabla clientes
   * @param {number} idUsuario - ID del usuario a sincronizar
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  forzarSincronizacionCliente: async (idUsuario) => {
    try {
      console.log(`🔄 UsuariosService: Forzando sincronización del usuario ${idUsuario}`)
      
      const usuario = await usuariosService.getById(idUsuario)
      
      if (!usuario.esUsuarioCliente) {
        throw new Error("El usuario no tiene rol de cliente")
      }
      
      // ✅ USAR ENDPOINT ESPECÍFICO
      const response = await api.post(`/customers/sincronizar-usuario/${idUsuario}`)
      console.log("✅ Sincronización forzada completada:", response.data)
      
      // Obtener usuario actualizado
      const usuarioActualizado = await usuariosService.getById(idUsuario)
      return usuarioActualizado
    } catch (error) {
      console.error(`❌ Error al forzar sincronización del usuario ${idUsuario}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN NUEVA: Valida mascotas para servicios
   * @param {number} idCliente - ID del cliente
   * @param {boolean} tieneServicios - Si la venta incluye servicios
   * @returns {Promise<Object>} Resultado de la validación
   */
  validarMascotasParaServicios: async (idCliente, tieneServicios = true) => {
    try {
      console.log(`🔍 UsuariosService: Validando mascotas para servicios - Cliente: ${idCliente}`)
      
      const response = await api.post("/customers/validar-mascotas-servicios", {
        idCliente,
        tieneServicios
      })
      
      console.log("✅ Validación completada:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Error al validar mascotas para servicios:", error)
      
      // Fallback: validación básica
      if (idCliente === 3 || idCliente === 1 || idCliente === 0) {
        return {
          esValido: true,
          mensaje: "Consumidor Final puede usar mascota genérica"
        }
      }
      
      return {
        esValido: false,
        mensaje: "Error al validar mascotas. Verifique que el cliente tenga mascotas registradas."
      }
    }
  },

  /**
   * ✅ FUNCIÓN NUEVA: Obtiene mascotas de un usuario específico
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>} Array de mascotas del usuario
   */
  getMascotasByUsuario: async (idUsuario) => {
    try {
      console.log(`🔍 UsuariosService: Obteniendo mascotas para usuario ${idUsuario}`)
      
      const response = await api.get(`/customers/mascotas/usuario/${idUsuario}`)
      
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} mascotas obtenidas para usuario ${idUsuario}`)
        return response.data
      }
      
      return []
    } catch (error) {
      console.error(`❌ Error al obtener mascotas para usuario ${idUsuario}:`, error)
      
      if (error.response && error.response.status === 404) {
        return []
      }
      
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN AUXILIAR: Genera contraseña temporal segura
   * @param {number} length - Longitud de la contraseña
   * @returns {string} Contraseña temporal
   */
  _generarPasswordTemporal: (length = 12) => {
    const minusculas = "abcdefghijklmnopqrstuvwxyz"
    const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numeros = "0123456789"
    const especiales = "!@#$%^&*"
    
    let password = ""
    
    // Asegurar al menos un carácter de cada tipo
    password += minusculas.charAt(Math.floor(Math.random() * minusculas.length))
    password += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length))
    password += numeros.charAt(Math.floor(Math.random() * numeros.length))
    password += especiales.charAt(Math.floor(Math.random() * especiales.length))
    
    // Completar con caracteres aleatorios
    const todos = minusculas + mayusculas + numeros + especiales
    for (let i = 4; i < length; i++) {
      password += todos.charAt(Math.floor(Math.random() * todos.length))
    }
    
    // Mezclar los caracteres
    return password.split("").sort(() => 0.5 - Math.random()).join("")
  },

  // ✅ FUNCIONES EXISTENTES VALIDADAS Y MANTENIDAS
  changePassword: async (id, passwordData) => {
    try {
      console.log(`🔑 UsuariosService: Cambiando contraseña del usuario ${id}`)
      const response = await api.patch(`/auth/usuarios/${id}/password`, passwordData)
      console.log("✅ Contraseña cambiada exitosamente")
      return response.data
    } catch (error) {
      console.error(`❌ Error al cambiar contraseña del usuario con ID ${id}:`, error)
      throw error
    }
  },

  checkDocumentoExists: async (documento, excludeUserId = null) => {
    try {
      console.log(`🔍 Verificando si el documento ${documento} existe (excluyendo usuario ID: ${excludeUserId})`)

      const allUsers = await usuariosService.getAll()
      const exists = allUsers.some(
        (user) => user.Documento === documento && (!excludeUserId || user.IdUsuario !== excludeUserId),
      )

      console.log(`✅ Resultado de verificación de documento ${documento}: ${exists ? "Existe" : "No existe"}`)
      return exists
    } catch (error) {
      console.error(`❌ Error al verificar documento ${documento}:`, error)
      return false
    }
  },

  checkCorreoExists: async (correo, excludeUserId = null) => {
    try {
      console.log(`🔍 Verificando si el correo ${correo} existe (excluyendo usuario ID: ${excludeUserId})`)

      const allUsers = await usuariosService.getAll()
      const exists = allUsers.some(
        (user) => user.Correo === correo && (!excludeUserId || user.IdUsuario !== excludeUserId),
      )

      console.log(`✅ Resultado de verificación de correo ${correo}: ${exists ? "Existe" : "No existe"}`)
      return exists
    } catch (error) {
      console.error(`❌ Error al verificar correo ${correo}:`, error)
      return false
    }
  },

  search: async (term) => {
    try {
      console.log(`🔍 UsuariosService: Buscando usuarios con término "${term}"`)
      const response = await api.get(`/auth/usuarios/search?term=${encodeURIComponent(term)}`)
      console.log(`✅ Búsqueda completada: ${response.data.length} resultados`)
      return response.data
    } catch (error) {
      console.error(`❌ Error al buscar usuarios con término "${term}":`, error)
      throw error
    }
  },

  sincronizarTodosUsuariosClientes: async () => {
    try {
      console.log("🔄 UsuariosService: Sincronizando todos los usuarios con clientes...")
      
      // Intentar usar el sincronizador importado
      try {
        const { sincronizarTodosUsuariosClientes } = await import("../ConsumoAdmin/sincronizador.js")
        const resultado = await sincronizarTodosUsuariosClientes()
        console.log("✅ Sincronización masiva completada:", resultado)
        return resultado
      } catch (importError) {
        console.warn("⚠️ No se pudo importar sincronizador, usando método alternativo")
        
        // Método alternativo: obtener usuarios con rol cliente y sincronizar uno por uno
        const usuariosClientes = await usuariosService.getByRol(2)
        let exito = 0
        let errores = 0
        
        for (const usuario of usuariosClientes) {
          try {
            await usuariosService.forzarSincronizacionCliente(usuario.IdUsuario)
            exito++
          } catch (syncError) {
            console.error(`❌ Error al sincronizar usuario ${usuario.IdUsuario}:`, syncError)
            errores++
          }
        }
        
        return { exito, errores, total: usuariosClientes.length }
      }
    } catch (error) {
      console.error("❌ Error al sincronizar todos los usuarios con clientes:", error)
      return { exito: 0, errores: 1, error: error.message }
    }
  },

  /**
   * ✅ FUNCIÓN NUEVA: Obtiene estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  getEstadisticas: async () => {
    try {
      console.log("📊 UsuariosService: Obteniendo estadísticas de usuarios...")
      
      const usuarios = await usuariosService.getAll()
      
      const estadisticas = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.Estado === true).length,
        inactivos: usuarios.filter(u => u.Estado === false).length,
        porRol: {},
        usuariosClientes: {
          total: usuarios.filter(u => u.esUsuarioCliente).length,
          sincronizados: usuarios.filter(u => u.esUsuarioCliente && u.clienteInfo?.sincronizado).length,
          noSincronizados: usuarios.filter(u => u.esUsuarioCliente && !u.clienteInfo?.sincronizado).length
        }
      }
      
      // Contar por roles
      usuarios.forEach(usuario => {
        const rolNombre = usuario.Rol.NombreRol
        estadisticas.porRol[rolNombre] = (estadisticas.porRol[rolNombre] || 0) + 1
      })
      
      console.log("✅ Estadísticas obtenidas:", estadisticas)
      return estadisticas
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error)
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        porRol: {},
        usuariosClientes: { total: 0, sincronizados: 0, noSincronizados: 0 }
      }
    }
  }
}

export default usuariosService