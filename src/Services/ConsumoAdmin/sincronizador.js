/**
 * Servicio de sincronización forzada entre usuarios y clientes
 * Este servicio se encarga de mantener sincronizados los usuarios con rol de cliente
 * y sus correspondientes registros en la tabla de clientes.
 */

// Importar axios directamente para evitar problemas de rutas
import axios from "axios"

// Importar utilidades de sincronización visual
import { sincronizarVisualUsuarioCliente, sincronizarVisualClienteUsuario } from "../ConsumoAdmin/sincronizacion-visual.js"

// Importar utilidades de normalización
import {
  normalizarEstado as normalizarEstadoCliente,
  normalizarEstadoBooleano as normalizarEstadoUsuario,
} from "../ConsumoAdmin/normalizador.js"

// Crear una instancia de axios con la configuración básica
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error al obtener token:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Modificar la función sincronizarUsuarioACliente para mejorar la sincronización en la edición
export async function sincronizarUsuarioACliente(usuario, operacion) {
  console.log(`[SINCRONIZADOR] Iniciando sincronización USUARIO → CLIENTE. Operación: ${operacion}`, usuario)

  try {
    // Verificar si es un usuario con rol de cliente
    const esCliente =
      usuario.IdRol === 2 || usuario.IdRol === "2" || usuario.Rol?.IdRol === 2 || usuario.Rol?.IdRol === "2"

    // Obtener ID del usuario
    const idUsuario = usuario.IdUsuario || usuario.id
    if (!idUsuario) {
      console.error("[SINCRONIZADOR] Error: Usuario sin ID válido")
      return false
    }

    // Buscar cliente existente
    let clienteExistente = null

    // 1. Buscar por IdUsuario - Método más directo y confiable
    try {
      console.log(`[SINCRONIZADOR] Buscando cliente por IdUsuario: ${idUsuario}`)
      const todosClientes = await api.get("/customers/clientes")

      if (todosClientes.data && todosClientes.data.length > 0) {
        clienteExistente = todosClientes.data.find(
          (c) =>
            String(c.IdUsuario) === String(idUsuario) || (c.IdUsuario && String(c.IdUsuario) === String(idUsuario)),
        )

        if (clienteExistente) {
          console.log("[SINCRONIZADOR] Cliente encontrado por IdUsuario:", clienteExistente)
        }
      }
    } catch (error) {
      console.error("[SINCRONIZADOR] Error al buscar cliente por IdUsuario:", error)
    }

    // 2. Si no se encontró, buscar por correo
    if (!clienteExistente && usuario.Correo) {
      try {
        console.log(`[SINCRONIZADOR] Buscando cliente por correo: ${usuario.Correo}`)
        const clientesPorCorreo = await api.get(`/customers/clientes?term=${encodeURIComponent(usuario.Correo)}`)

        if (clientesPorCorreo.data && clientesPorCorreo.data.length > 0) {
          clienteExistente = clientesPorCorreo.data.find((c) => c.Correo === usuario.Correo)

          if (clienteExistente) {
            console.log("[SINCRONIZADOR] Cliente encontrado por correo:", clienteExistente)
          }
        }
      } catch (error) {
        console.error("[SINCRONIZADOR] Error al buscar cliente por correo:", error)
      }
    }

    // 3. Si no se encontró, buscar por documento
    if (!clienteExistente && usuario.Documento) {
      try {
        console.log(`[SINCRONIZADOR] Buscando cliente por documento: ${usuario.Documento}`)
        const clientesPorDocumento = await api.get(`/customers/clientes?term=${encodeURIComponent(usuario.Documento)}`)

        if (clientesPorDocumento.data && clientesPorDocumento.data.length > 0) {
          clienteExistente = clientesPorDocumento.data.find((c) => c.Documento === usuario.Documento)

          if (clienteExistente) {
            console.log("[SINCRONIZADOR] Cliente encontrado por documento:", clienteExistente)
          }
        }
      } catch (error) {
        console.error("[SINCRONIZADOR] Error al buscar cliente por documento:", error)
      }
    }

    // Si el usuario ya no es cliente pero tiene un cliente asociado, eliminar el cliente
    if (!esCliente && clienteExistente && operacion === "actualizar") {
      try {
        console.log(
          `[SINCRONIZADOR] Usuario ya no es cliente, eliminando cliente asociado ID: ${clienteExistente.IdCliente}`,
        )
        await api.delete(`/customers/clientes/${clienteExistente.IdCliente}`)
        console.log("[SINCRONIZADOR] Cliente eliminado correctamente")
        return true
      } catch (error) {
        console.error("[SINCRONIZADOR] Error al eliminar cliente asociado:", error)
        return false
      }
    }

    // Si no es cliente y no estamos actualizando, no continuar con la sincronización
    if (!esCliente && operacion !== "actualizar") {
      console.log("[SINCRONIZADOR] No es un usuario con rol de cliente, no se requiere sincronización")
      return false
    }

    // Si no es cliente en ningún caso, no continuar
    if (!esCliente) {
      return false
    }

    // Preparar datos del cliente
    const clienteData = {
      Documento: usuario.Documento || "",
      Nombre: usuario.Nombre || "",
      Apellido: usuario.Apellido || "",
      Correo: usuario.Correo || "",
      Telefono: usuario.Telefono || "",
      Direccion: usuario.Direccion || "",
      Estado: normalizarEstadoCliente(usuario.Estado),
      IdUsuario: idUsuario,
    }

    console.log("[SINCRONIZADOR] Datos preparados para el cliente:", clienteData)

    // Realizar operación según el caso
    let resultado = null

    switch (operacion) {
      case "crear":
        if (clienteExistente) {
          console.log(`[SINCRONIZADOR] Actualizando cliente existente ID: ${clienteExistente.IdCliente}`)
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteData)
        } else {
          console.log("[SINCRONIZADOR] Creando nuevo cliente")
          resultado = await api.post("/customers/clientes", clienteData)
        }
        break

      case "actualizar":
        if (clienteExistente) {
          console.log(`[SINCRONIZADOR] Actualizando cliente existente ID: ${clienteExistente.IdCliente}`)
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteData)

          // Verificar que la actualización fue exitosa
          if (resultado && resultado.data) {
            console.log("[SINCRONIZADOR] Cliente actualizado exitosamente:", resultado.data)
          } else {
            console.error("[SINCRONIZADOR] Error: No se recibió confirmación de la actualización del cliente")
          }
        } else {
          console.log("[SINCRONIZADOR] Cliente no encontrado, creando uno nuevo")
          resultado = await api.post("/customers/clientes", clienteData)

          // Verificar que la creación fue exitosa
          if (resultado && resultado.data) {
            console.log("[SINCRONIZADOR] Nuevo cliente creado exitosamente:", resultado.data)
          } else {
            console.error("[SINCRONIZADOR] Error: No se recibió confirmación de la creación del cliente")
          }
        }
        break

      case "eliminar":
        if (clienteExistente) {
          console.log(`[SINCRONIZADOR] Eliminando cliente ID: ${clienteExistente.IdCliente}`)
          resultado = await api.delete(`/customers/clientes/${clienteExistente.IdCliente}`)
        } else {
          console.log("[SINCRONIZADOR] No se encontró cliente para eliminar")
        }
        break

      case "cambiarEstado":
        if (clienteExistente) {
          console.log(`[SINCRONIZADOR] Actualizando estado del cliente ID: ${clienteExistente.IdCliente}`)
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, {
            ...clienteExistente,
            Estado: normalizarEstadoCliente(usuario.Estado),
          })
        } else {
          console.log("[SINCRONIZADOR] Cliente no encontrado, creando uno nuevo")
          resultado = await api.post("/customers/clientes", clienteData)
        }
        break

      default:
        console.log(`[SINCRONIZADOR] Operación no reconocida: ${operacion}`)
        return false
    }

    // Sincronizar visualmente
    sincronizarVisualUsuarioCliente(usuario, operacion)

    console.log("[SINCRONIZADOR] Sincronización USUARIO → CLIENTE completada con éxito", resultado?.data)
    return true
  } catch (error) {
    console.error("[SINCRONIZADOR] Error en sincronizarUsuarioACliente:", error)

    // Mostrar detalles del error para depuración
    if (error.response) {
      console.error("[SINCRONIZADOR] Respuesta del servidor:", error.response.status, error.response.data)
    } else if (error.request) {
      console.error("[SINCRONIZADOR] No se recibió respuesta:", error.request)
    } else {
      console.error("[SINCRONIZADOR] Error de configuración:", error.message)
    }

    return false
  }
}

// Modificar la función sincronizarClienteAUsuario para mejorar la sincronización visual
export async function sincronizarClienteAUsuario(cliente, operacion) {
  console.log(`[SINCRONIZADOR] Iniciando sincronización CLIENTE → USUARIO. Operación: ${operacion}`, cliente)

  try {
    // Verificar que el cliente tenga un ID
    const idCliente = cliente.IdCliente || cliente.id
    if (!idCliente) {
      console.error("[SINCRONIZADOR] Error: Cliente sin ID válido")
      return false
    }

    // Buscar usuario existente
    let usuarioExistente = null

    // 1. Si el cliente tiene IdUsuario, buscar por ese ID
    if (cliente.IdUsuario) {
      try {
        console.log(`[SINCRONIZADOR] Buscando usuario por ID: ${cliente.IdUsuario}`)
        const response = await api.get(`/auth/usuarios/${cliente.IdUsuario}`)
        usuarioExistente = response.data
        console.log("[SINCRONIZADOR] Usuario encontrado por ID:", usuarioExistente)
      } catch (error) {
        console.error(`[SINCRONIZADOR] Error al buscar usuario por ID ${cliente.IdUsuario}:`, error)
      }
    }

    // 2. Si no se encontró, buscar por correo
    if (!usuarioExistente && cliente.Correo) {
      try {
        console.log(`[SINCRONIZADOR] Buscando usuario por correo: ${cliente.Correo}`)
        const response = await api.get(`/auth/usuarios/search?term=${encodeURIComponent(cliente.Correo)}`)

        if (response.data && response.data.length > 0) {
          usuarioExistente = response.data.find((u) => u.Correo === cliente.Correo)

          if (usuarioExistente) {
            console.log("[SINCRONIZADOR] Usuario encontrado por correo:", usuarioExistente)
          }
        }
      } catch (error) {
        console.error("[SINCRONIZADOR] Error al buscar usuario por correo:", error)
      }
    }

    // 3. Si no se encontró, buscar por documento
    if (!usuarioExistente && cliente.Documento) {
      try {
        console.log(`[SINCRONIZADOR] Buscando usuario por documento: ${cliente.Documento}`)
        const response = await api.get(`/auth/usuarios/search?term=${encodeURIComponent(cliente.Documento)}`)

        if (response.data && response.data.length > 0) {
          usuarioExistente = response.data.find((u) => u.Documento === cliente.Documento)

          if (usuarioExistente) {
            console.log("[SINCRONIZADOR] Usuario encontrado por documento:", usuarioExistente)
          }
        }
      } catch (error) {
        console.error("[SINCRONIZADOR] Error al buscar usuario por documento:", error)
      }
    }

    // Preparar datos del usuario
    const usuarioData = {
      Documento: cliente.Documento || "",
      Nombre: cliente.Nombre || "",
      Apellido: cliente.Apellido || "",
      Correo: cliente.Correo || "",
      Telefono: cliente.Telefono || "",
      Direccion: cliente.Direccion || "",
      Estado: normalizarEstadoUsuario(cliente.Estado),
      IdRol: 2, // Rol de cliente
    }

    // Si es una creación y no hay usuario existente, generar contraseña
    if ((operacion === "crear" || operacion === "actualizar") && !usuarioExistente) {
      usuarioData.Password = Math.random().toString(36).slice(-8) + "A1!"
      console.log("[SINCRONIZADOR] Contraseña temporal generada para nuevo usuario")
    }

    console.log("[SINCRONIZADOR] Datos preparados para el usuario:", usuarioData)

    // Realizar operación según el caso
    let nuevoIdUsuario = null
    let resultado = null

    switch (operacion) {
      case "crear":
        if (usuarioExistente) {
          console.log(`[SINCRONIZADOR] Actualizando usuario existente ID: ${usuarioExistente.IdUsuario}`)
          resultado = await api.put(`/auth/usuarios/${usuarioExistente.IdUsuario}`, usuarioData)
          nuevoIdUsuario = usuarioExistente.IdUsuario
        } else {
          console.log("[SINCRONIZADOR] Creando nuevo usuario")
          resultado = await api.post("/auth/usuarios", usuarioData)
          nuevoIdUsuario = resultado.data.IdUsuario || resultado.data.id
          console.log(`[SINCRONIZADOR] Nuevo usuario creado con ID: ${nuevoIdUsuario}`)
        }
        break

      case "actualizar":
        if (usuarioExistente) {
          console.log(`[SINCRONIZADOR] Actualizando usuario existente ID: ${usuarioExistente.IdUsuario}`)
          resultado = await api.put(`/auth/usuarios/${usuarioExistente.IdUsuario}`, usuarioData)
          nuevoIdUsuario = usuarioExistente.IdUsuario
        } else {
          console.log("[SINCRONIZADOR] Usuario no encontrado, creando uno nuevo")
          resultado = await api.post("/auth/usuarios", usuarioData)
          nuevoIdUsuario = resultado.data.IdUsuario || resultado.data.id
          console.log(`[SINCRONIZADOR] Nuevo usuario creado con ID: ${nuevoIdUsuario}`)
        }
        break

      case "eliminar":
        if (usuarioExistente) {
          console.log(`[SINCRONIZADOR] Eliminando usuario ID: ${usuarioExistente.IdUsuario}`)
          resultado = await api.delete(`/auth/usuarios/${usuarioExistente.IdUsuario}`)
        } else {
          console.log("[SINCRONIZADOR] No se encontró usuario para eliminar")
        }
        break

      case "cambiarEstado":
        if (usuarioExistente) {
          console.log(`[SINCRONIZADOR] Actualizando estado del usuario ID: ${usuarioExistente.IdUsuario}`)
          resultado = await api.patch(`/auth/usuarios/${usuarioExistente.IdUsuario}/status`, {
            Estado: normalizarEstadoUsuario(cliente.Estado),
          })
          nuevoIdUsuario = usuarioExistente.IdUsuario
        } else {
          console.log("[SINCRONIZADOR] Usuario no encontrado, creando uno nuevo")
          resultado = await api.post("/auth/usuarios", usuarioData)
          nuevoIdUsuario = resultado.data.IdUsuario || resultado.data.id
          console.log(`[SINCRONIZADOR] Nuevo usuario creado con ID: ${nuevoIdUsuario}`)
        }
        break

      default:
        console.log(`[SINCRONIZADOR] Operación no reconocida: ${operacion}`)
        return false
    }

    // Si se creó o actualizó un usuario y el cliente no tiene IdUsuario o es diferente, actualizar el cliente
    if (nuevoIdUsuario && (operacion === "crear" || operacion === "actualizar" || operacion === "cambiarEstado")) {
      if (!cliente.IdUsuario || String(cliente.IdUsuario) !== String(nuevoIdUsuario)) {
        console.log(`[SINCRONIZADOR] Actualizando cliente ID: ${idCliente} con nuevo IdUsuario: ${nuevoIdUsuario}`)
        await api.put(`/customers/clientes/${idCliente}`, {
          ...cliente,
          IdUsuario: nuevoIdUsuario,
        })
      }
    }

    // Sincronizar visualmente
    sincronizarVisualClienteUsuario(cliente, operacion)

    console.log("[SINCRONIZADOR] Sincronización CLIENTE → USUARIO completada con éxito", resultado?.data)
    return true
  } catch (error) {
    console.error("[SINCRONIZADOR] Error en sincronizarClienteAUsuario:", error)

    // Mostrar detalles del error para depuración
    if (error.response) {
      console.error("[SINCRONIZADOR] Respuesta del servidor:", error.response.status, error.response.data)
    } else if (error.request) {
      console.error("[SINCRONIZADOR] No se recibió respuesta:", error.request)
    } else {
      console.error("[SINCRONIZADOR] Error de configuración:", error.message)
    }

    return false
  }
}

/**
 * Normaliza el estado para la API de clientes (convierte a 0/1)
 * @param {any} estado - Estado en cualquier formato
 * @returns {number} - Estado normalizado (0 o 1)
 */
function normalizarEstadoClienteFunc(estado) {
  if (typeof estado === "boolean") {
    return estado ? 1 : 0
  }

  if (typeof estado === "number") {
    return estado === 1 ? 1 : 0
  }

  if (typeof estado === "string") {
    return estado === "1" || estado === "true" || estado === "Activo" ? 1 : 0
  }

  return 1 // Por defecto activo
}

/**
 * Normaliza el estado para la API de usuarios (convierte a boolean)
 * @param {any} estado - Estado en cualquier formato
 * @returns {boolean} - Estado normalizado (true o false)
 */
function normalizarEstadoUsuarioFunc(estado) {
  if (typeof estado === "boolean") {
    return estado
  }

  if (typeof estado === "number") {
    return estado === 1
  }

  if (typeof estado === "string") {
    return estado === "1" || estado === "true" || estado === "Activo"
  }

  return true // Por defecto activo
}

/**
 * Sincroniza forzadamente todos los usuarios con rol de cliente con la tabla de clientes
 * @returns {Promise<{exito: number, error: number}>} - Resultado de la sincronización
 */
export async function sincronizarTodosUsuariosClientes() {
  console.log("[SINCRONIZADOR] Iniciando sincronización forzada de TODOS los usuarios con rol de cliente")

  try {
    // Obtener todos los usuarios con rol de cliente
    const response = await api.get("/auth/roles/2/usuarios")
    const usuariosCliente = response.data || []

    console.log(`[SINCRONIZADOR] Se encontraron ${usuariosCliente.length} usuarios con rol de cliente`)

    // Estadísticas
    const resultado = {
      exito: 0,
      error: 0,
    }

    // Sincronizar cada usuario
    for (const usuario of usuariosCliente) {
      try {
        const exito = await sincronizarUsuarioACliente(usuario, "actualizar")
        if (exito) {
          resultado.exito++
        } else {
          resultado.error++
        }
      } catch (error) {
        console.error(`[SINCRONIZADOR] Error al sincronizar usuario ID ${usuario.IdUsuario}:`, error)
        resultado.error++
      }
    }

    console.log(
      `[SINCRONIZADOR] Sincronización forzada completada. Éxitos: ${resultado.exito}, Errores: ${resultado.error}`,
    )
    return resultado
  } catch (error) {
    console.error("[SINCRONIZADOR] Error al obtener usuarios con rol de cliente:", error)
    return { exito: 0, error: 0 }
  }
}

/**
 * Sincroniza forzadamente todos los clientes con la tabla de usuarios
 * @returns {Promise<{exito: number, error: number}>} - Resultado de la sincronización
 */
export async function sincronizarTodosClientesUsuarios() {
  console.log("[SINCRONIZADOR] Iniciando sincronización forzada de TODOS los clientes")

  try {
    // Obtener todos los clientes
    const response = await api.get("/customers/clientes")
    const clientes = response.data || []

    console.log(`[SINCRONIZADOR] Se encontraron ${clientes.length} clientes`)

    // Estadísticas
    const resultado = {
      exito: 0,
      error: 0,
    }

    // Sincronizar cada cliente
    for (const cliente of clientes) {
      try {
        const exito = await sincronizarClienteAUsuario(cliente, "actualizar")
        if (exito) {
          resultado.exito++
        } else {
          resultado.error++
        }
      } catch (error) {
        console.error(`[SINCRONIZADOR] Error al sincronizar cliente ID ${cliente.IdCliente}:`, error)
        resultado.error++
      }
    }

    console.log(
      `[SINCRONIZADOR] Sincronización forzada completada. Éxitos: ${resultado.exito}, Errores: ${resultado.error}`,
    )
    return resultado
  } catch (error) {
    console.error("[SINCRONIZADOR] Error al obtener clientes:", error)
    return { exito: 0, error: 0 }
  }
}

/**
 * Ejecuta una sincronización bidireccional completa entre usuarios y clientes
 * @returns {Promise<{usuariosAClientes: {exito: number, error: number}, clientesAUsuarios: {exito: number, error: number}}>}
 */
export async function sincronizacionCompleta() {
  console.log("[SINCRONIZADOR] Iniciando sincronización bidireccional completa")

  // Primero sincronizar usuarios a clientes
  const resultadoUsuarios = await sincronizarTodosUsuariosClientes()

  // Luego sincronizar clientes a usuarios
  const resultadoClientes = await sincronizarTodosClientesUsuarios()

  // Devolver resultados combinados
  return {
    usuariosAClientes: resultadoUsuarios,
    clientesAUsuarios: resultadoClientes,
  }
}

// Exportar todas las funciones
export default {
  sincronizarUsuarioACliente,
  sincronizarClienteAUsuario,
  sincronizarTodosUsuariosClientes,
  sincronizarTodosClientesUsuarios,
  sincronizacionCompleta,
}
