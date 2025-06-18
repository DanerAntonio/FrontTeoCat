/**
 * Utilidades para depurar la sincronización entre usuarios y clientes
 * Este archivo contiene funciones para verificar y corregir problemas de sincronización
 */

import axios from "axios"
import { sincronizarUsuarioACliente, sincronizarClienteAUsuario } from "../ConsumoAdmin/sincronizador.js"
import { limpiarCacheEstados } from "../ConsumoAdmin/sincronizacion-visual.js"

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

/**
 * Verifica la sincronización entre un usuario y su cliente
 * @param {number|string} idUsuario - ID del usuario a verificar
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export async function verificarSincronizacionUsuario(idUsuario) {
  console.log(`[DEBUG] Verificando sincronización para usuario ID: ${idUsuario}`)

  try {
    // Obtener el usuario
    const responseUsuario = await api.get(`/auth/usuarios/${idUsuario}`)
    const usuario = responseUsuario.data

    if (!usuario) {
      return {
        exito: false,
        mensaje: `No se encontró el usuario con ID: ${idUsuario}`,
        usuario: null,
        cliente: null,
        sincronizado: false,
      }
    }

    console.log(`[DEBUG] Usuario encontrado:`, usuario)

    // Verificar si es un usuario con rol de cliente
    const esCliente =
      usuario.IdRol === 2 || usuario.IdRol === "2" || usuario.Rol?.IdRol === 2 || usuario.Rol?.IdRol === "2"

    if (!esCliente) {
      return {
        exito: true,
        mensaje: `El usuario con ID: ${idUsuario} no tiene rol de cliente, no requiere sincronización`,
        usuario,
        cliente: null,
        sincronizado: true,
      }
    }

    // Buscar el cliente asociado
    let clienteEncontrado = null

    // Buscar por IdUsuario
    try {
      const todosClientes = await api.get("/customers/clientes")

      if (todosClientes.data && todosClientes.data.length > 0) {
        clienteEncontrado = todosClientes.data.find((c) => String(c.IdUsuario) === String(idUsuario))
      }
    } catch (error) {
      console.error(`[DEBUG] Error al buscar cliente por IdUsuario:`, error)
    }

    // Si no se encontró, buscar por correo y documento
    if (!clienteEncontrado && (usuario.Correo || usuario.Documento)) {
      try {
        const termino = usuario.Correo || usuario.Documento
        const clientesPorTermino = await api.get(`/customers/clientes?term=${encodeURIComponent(termino)}`)

        if (clientesPorTermino.data && clientesPorTermino.data.length > 0) {
          clienteEncontrado = clientesPorTermino.data.find(
            (c) => c.Correo === usuario.Correo || c.Documento === usuario.Documento,
          )
        }
      } catch (error) {
        console.error(`[DEBUG] Error al buscar cliente por término:`, error)
      }
    }

    // Verificar si están sincronizados
    if (clienteEncontrado) {
      console.log(`[DEBUG] Cliente encontrado:`, clienteEncontrado)

      const datosCoinciden =
        clienteEncontrado.Nombre === usuario.Nombre &&
        clienteEncontrado.Apellido === usuario.Apellido &&
        clienteEncontrado.Correo === usuario.Correo &&
        clienteEncontrado.Documento === usuario.Documento

      const estadoCoincide =
        (clienteEncontrado.Estado === 1 && usuario.Estado === true) ||
        (clienteEncontrado.Estado === 0 && usuario.Estado === false) ||
        (clienteEncontrado.Estado === "Activo" && usuario.Estado === true) ||
        (clienteEncontrado.Estado === "Inactivo" && usuario.Estado === false)

      const sincronizado = datosCoinciden && estadoCoincide

      return {
        exito: true,
        mensaje: sincronizado
          ? `Usuario y cliente están correctamente sincronizados`
          : `Usuario y cliente NO están sincronizados`,
        usuario,
        cliente: clienteEncontrado,
        sincronizado,
        diferencias: sincronizado
          ? null
          : {
              datosCoinciden,
              estadoCoincide,
            },
      }
    } else {
      return {
        exito: false,
        mensaje: `No se encontró un cliente asociado al usuario con ID: ${idUsuario}`,
        usuario,
        cliente: null,
        sincronizado: false,
      }
    }
  } catch (error) {
    console.error(`[DEBUG] Error al verificar sincronización para usuario ID: ${idUsuario}`, error)
    return {
      exito: false,
      mensaje: `Error al verificar sincronización: ${error.message}`,
      error: error.toString(),
      usuario: null,
      cliente: null,
      sincronizado: false,
    }
  }
}

/**
 * Verifica la sincronización entre un cliente y su usuario
 * @param {number|string} idCliente - ID del cliente a verificar
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export async function verificarSincronizacionCliente(idCliente) {
  console.log(`[DEBUG] Verificando sincronización para cliente ID: ${idCliente}`)

  try {
    // Obtener el cliente
    const responseCliente = await api.get(`/customers/clientes/${idCliente}`)
    const cliente = responseCliente.data

    if (!cliente) {
      return {
        exito: false,
        mensaje: `No se encontró el cliente con ID: ${idCliente}`,
        cliente: null,
        usuario: null,
        sincronizado: false,
      }
    }

    console.log(`[DEBUG] Cliente encontrado:`, cliente)

    // Verificar si tiene IdUsuario
    if (!cliente.IdUsuario) {
      return {
        exito: false,
        mensaje: `El cliente con ID: ${idCliente} no tiene IdUsuario asociado`,
        cliente,
        usuario: null,
        sincronizado: false,
      }
    }

    // Buscar el usuario asociado
    let usuarioEncontrado = null

    try {
      const responseUsuario = await api.get(`/auth/usuarios/${cliente.IdUsuario}`)
      usuarioEncontrado = responseUsuario.data
    } catch (error) {
      console.error(`[DEBUG] Error al buscar usuario por ID:`, error)
    }

    // Si no se encontró, buscar por correo y documento
    if (!usuarioEncontrado && (cliente.Correo || cliente.Documento)) {
      try {
        const termino = cliente.Correo || cliente.Documento
        const usuariosPorTermino = await api.get(`/auth/usuarios/search?term=${encodeURIComponent(termino)}`)

        if (usuariosPorTermino.data && usuariosPorTermino.data.length > 0) {
          usuarioEncontrado = usuariosPorTermino.data.find(
            (u) => u.Correo === cliente.Correo || u.Documento === cliente.Documento,
          )
        }
      } catch (error) {
        console.error(`[DEBUG] Error al buscar usuario por término:`, error)
      }
    }

    // Verificar si están sincronizados
    if (usuarioEncontrado) {
      console.log(`[DEBUG] Usuario encontrado:`, usuarioEncontrado)

      const datosCoinciden =
        usuarioEncontrado.Nombre === cliente.Nombre &&
        usuarioEncontrado.Apellido === cliente.Apellido &&
        usuarioEncontrado.Correo === cliente.Correo &&
        usuarioEncontrado.Documento === cliente.Documento

      const estadoCoincide =
        (cliente.Estado === 1 && usuarioEncontrado.Estado === true) ||
        (cliente.Estado === 0 && usuarioEncontrado.Estado === false) ||
        (cliente.Estado === "Activo" && usuarioEncontrado.Estado === true) ||
        (cliente.Estado === "Inactivo" && usuarioEncontrado.Estado === false)

      const rolCorrecto =
        usuarioEncontrado.IdRol === 2 ||
        usuarioEncontrado.IdRol === "2" ||
        usuarioEncontrado.Rol?.IdRol === 2 ||
        usuarioEncontrado.Rol?.IdRol === "2"

      const sincronizado = datosCoinciden && estadoCoincide && rolCorrecto

      return {
        exito: true,
        mensaje: sincronizado
          ? `Cliente y usuario están correctamente sincronizados`
          : `Cliente y usuario NO están sincronizados`,
        cliente,
        usuario: usuarioEncontrado,
        sincronizado,
        diferencias: sincronizado
          ? null
          : {
              datosCoinciden,
              estadoCoincide,
              rolCorrecto,
            },
      }
    } else {
      return {
        exito: false,
        mensaje: `No se encontró un usuario asociado al cliente con ID: ${idCliente}`,
        cliente,
        usuario: null,
        sincronizado: false,
      }
    }
  } catch (error) {
    console.error(`[DEBUG] Error al verificar sincronización para cliente ID: ${idCliente}`, error)
    return {
      exito: false,
      mensaje: `Error al verificar sincronización: ${error.message}`,
      error: error.toString(),
      cliente: null,
      usuario: null,
      sincronizado: false,
    }
  }
}

/**
 * Fuerza la sincronización de un usuario específico
 * @param {number|string} idUsuario - ID del usuario a sincronizar
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
export async function forzarSincronizacionUsuario(idUsuario) {
  console.log(`[DEBUG] Forzando sincronización para usuario ID: ${idUsuario}`)

  try {
    // Obtener el usuario
    const responseUsuario = await api.get(`/auth/usuarios/${idUsuario}`)
    const usuario = responseUsuario.data

    if (!usuario) {
      return {
        exito: false,
        mensaje: `No se encontró el usuario con ID: ${idUsuario}`,
      }
    }

    // Limpiar caché de estados
    limpiarCacheEstados()

    // Forzar sincronización
    const resultado = await sincronizarUsuarioACliente(usuario, "actualizar")

    return {
      exito: resultado,
      mensaje: resultado
        ? `Sincronización forzada completada exitosamente para usuario ID: ${idUsuario}`
        : `Error al forzar sincronización para usuario ID: ${idUsuario}`,
      usuario,
    }
  } catch (error) {
    console.error(`[DEBUG] Error al forzar sincronización para usuario ID: ${idUsuario}`, error)
    return {
      exito: false,
      mensaje: `Error al forzar sincronización: ${error.message}`,
      error: error.toString(),
    }
  }
}

/**
 * Fuerza la sincronización de un cliente específico
 * @param {number|string} idCliente - ID del cliente a sincronizar
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
export async function forzarSincronizacionCliente(idCliente) {
  console.log(`[DEBUG] Forzando sincronización para cliente ID: ${idCliente}`)

  try {
    // Obtener el cliente
    const responseCliente = await api.get(`/customers/clientes/${idCliente}`)
    const cliente = responseCliente.data

    if (!cliente) {
      return {
        exito: false,
        mensaje: `No se encontró el cliente con ID: ${idCliente}`,
      }
    }

    // Limpiar caché de estados
    limpiarCacheEstados()

    // Forzar sincronización
    const resultado = await sincronizarClienteAUsuario(cliente, "actualizar")

    return {
      exito: resultado,
      mensaje: resultado
        ? `Sincronización forzada completada exitosamente para cliente ID: ${idCliente}`
        : `Error al forzar sincronización para cliente ID: ${idCliente}`,
      cliente,
    }
  } catch (error) {
    console.error(`[DEBUG] Error al forzar sincronización para cliente ID: ${idCliente}`, error)
    return {
      exito: false,
      mensaje: `Error al forzar sincronización: ${error.message}`,
      error: error.toString(),
    }
  }
}

/**
 * Verifica y corrige problemas de sincronización para todos los usuarios con rol de cliente
 * @returns {Promise<Object>} - Resultado de la verificación y corrección
 */
export async function verificarYCorregirTodosUsuarios() {
  console.log(`[DEBUG] Verificando y corrigiendo sincronización para todos los usuarios con rol de cliente`)

  try {
    // Obtener todos los usuarios con rol de cliente
    const response = await api.get("/auth/roles/2/usuarios")
    const usuariosCliente = response.data || []

    console.log(`[DEBUG] Se encontraron ${usuariosCliente.length} usuarios con rol de cliente`)

    // Estadísticas
    const resultado = {
      total: usuariosCliente.length,
      verificados: 0,
      sincronizados: 0,
      noSincronizados: 0,
      corregidos: 0,
      errores: 0,
      detalles: [],
    }

    // Verificar y corregir cada usuario
    for (const usuario of usuariosCliente) {
      try {
        resultado.verificados++

        // Verificar sincronización
        const verificacion = await verificarSincronizacionUsuario(usuario.IdUsuario)

        if (verificacion.sincronizado) {
          resultado.sincronizados++
          resultado.detalles.push({
            idUsuario: usuario.IdUsuario,
            nombre: `${usuario.Nombre} ${usuario.Apellido}`,
            sincronizado: true,
            corregido: false,
          })
        } else {
          resultado.noSincronizados++

          // Intentar corregir
          const correccion = await forzarSincronizacionUsuario(usuario.IdUsuario)

          if (correccion.exito) {
            resultado.corregidos++
            resultado.detalles.push({
              idUsuario: usuario.IdUsuario,
              nombre: `${usuario.Nombre} ${usuario.Apellido}`,
              sincronizado: false,
              corregido: true,
            })
          } else {
            resultado.errores++
            resultado.detalles.push({
              idUsuario: usuario.IdUsuario,
              nombre: `${usuario.Nombre} ${usuario.Apellido}`,
              sincronizado: false,
              corregido: false,
              error: correccion.mensaje,
            })
          }
        }
      } catch (error) {
        console.error(`[DEBUG] Error al procesar usuario ID ${usuario.IdUsuario}:`, error)
        resultado.errores++
        resultado.detalles.push({
          idUsuario: usuario.IdUsuario,
          nombre: `${usuario.Nombre} ${usuario.Apellido}`,
          sincronizado: false,
          corregido: false,
          error: error.toString(),
        })
      }
    }

    console.log(`[DEBUG] Verificación y corrección completada:`, resultado)
    return resultado
  } catch (error) {
    console.error(`[DEBUG] Error al verificar y corregir todos los usuarios:`, error)
    return {
      exito: false,
      mensaje: `Error al verificar y corregir: ${error.message}`,
      error: error.toString(),
    }
  }
}

export default {
  verificarSincronizacionUsuario,
  verificarSincronizacionCliente,
  forzarSincronizacionUsuario,
  forzarSincronizacionCliente,
  verificarYCorregirTodosUsuarios,
}
