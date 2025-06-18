/**
 * Utilidades para sincronización visual entre usuarios y clientes
 * Este archivo contiene funciones para asegurar que los cambios
 * se reflejen correctamente en la interfaz de usuario.
 */

import { normalizarEstado } from "../ConsumoAdmin/normalizador"

/**
 * Actualiza el estado visual de un cliente en localStorage
 * @param {number|string} idCliente - ID del cliente
 * @param {any} estado - Estado a guardar
 */
export function actualizarEstadoClienteLocal(idCliente, estado) {
  try {
    // Normalizar el estado a formato texto para la visualización
    const estadoTexto = normalizarEstado(estado, "texto")

    // Obtener estados guardados
    const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")

    // Actualizar el estado del cliente específico
    clientesEstados[idCliente] = estadoTexto

    // Guardar en localStorage
    localStorage.setItem("clientesEstados", JSON.stringify(clientesEstados))

    console.log(`[SINCRONIZACIÓN VISUAL] Estado del cliente ${idCliente} actualizado localmente a: ${estadoTexto}`)
  } catch (error) {
    console.error("[SINCRONIZACIÓN VISUAL] Error al actualizar estado local del cliente:", error)
  }
}

/**
 * Actualiza el estado visual de un usuario en localStorage
 * @param {number|string} idUsuario - ID del usuario
 * @param {any} estado - Estado a guardar
 */
export function actualizarEstadoUsuarioLocal(idUsuario, estado) {
  try {
    // Normalizar el estado a formato booleano para la visualización
    const estadoBooleano = normalizarEstado(estado, "boolean")

    // Obtener estados guardados
    const usuariosEstados = JSON.parse(localStorage.getItem("usuariosEstados") || "{}")

    // Actualizar el estado del usuario específico
    usuariosEstados[idUsuario] = estadoBooleano

    // Guardar en localStorage
    localStorage.setItem("usuariosEstados", JSON.stringify(usuariosEstados))

    console.log(`[SINCRONIZACIÓN VISUAL] Estado del usuario ${idUsuario} actualizado localmente a: ${estadoBooleano}`)
  } catch (error) {
    console.error("[SINCRONIZACIÓN VISUAL] Error al actualizar estado local del usuario:", error)
  }
}

/**
 * Sincroniza visualmente un usuario con su cliente correspondiente
 * @param {Object} usuario - Datos del usuario
 * @param {string} operacion - Operación realizada
 */
export function sincronizarVisualUsuarioCliente(usuario, operacion) {
  try {
    if (!usuario) return

    const idUsuario = usuario.IdUsuario || usuario.id
    if (!idUsuario) return

    console.log(
      `[SINCRONIZACIÓN VISUAL] Sincronizando visualmente Usuario → Cliente. ID: ${idUsuario}, Operación: ${operacion}`,
    )

    // Si es un cambio de estado, actualizar el estado del cliente en localStorage
    if (operacion === "cambiarEstado" || operacion === "actualizar" || operacion === "crear") {
      actualizarEstadoClienteLocal(idUsuario, usuario.Estado)

      // También actualizar otros datos relevantes en localStorage si es necesario
      const clientesData = JSON.parse(localStorage.getItem("clientesData") || "{}")

      // Actualizar o crear datos del cliente
      clientesData[idUsuario] = {
        Nombre: usuario.Nombre,
        Apellido: usuario.Apellido,
        Correo: usuario.Correo,
        Documento: usuario.Documento,
        Telefono: usuario.Telefono || "",
        Direccion: usuario.Direccion || "",
        Estado: normalizarEstado(usuario.Estado, "texto"),
        IdUsuario: idUsuario,
        ultimaActualizacion: new Date().toISOString(),
      }

      localStorage.setItem("clientesData", JSON.stringify(clientesData))
      console.log(`[SINCRONIZACIÓN VISUAL] Datos del cliente actualizados localmente para ID: ${idUsuario}`)
    }

    console.log(`[SINCRONIZACIÓN VISUAL] Usuario → Cliente completada. Operación: ${operacion}`)
  } catch (error) {
    console.error("[SINCRONIZACIÓN VISUAL] Error en sincronización visual Usuario → Cliente:", error)
  }
}

/**
 * Sincroniza visualmente un cliente con su usuario correspondiente
 * @param {Object} cliente - Datos del cliente
 * @param {string} operacion - Operación realizada
 */
export function sincronizarVisualClienteUsuario(cliente, operacion) {
  try {
    if (!cliente) return

    const idUsuario = cliente.IdUsuario
    if (!idUsuario) return

    console.log(
      `[SINCRONIZACIÓN VISUAL] Sincronizando visualmente Cliente → Usuario. ID Usuario: ${idUsuario}, Operación: ${operacion}`,
    )

    // Si es un cambio de estado, actualizar el estado del usuario en localStorage
    if (operacion === "cambiarEstado" || operacion === "actualizar" || operacion === "crear") {
      actualizarEstadoUsuarioLocal(idUsuario, cliente.Estado)

      // También actualizar otros datos relevantes en localStorage si es necesario
      const usuariosData = JSON.parse(localStorage.getItem("usuariosData") || "{}")

      // Actualizar o crear datos del usuario
      usuariosData[idUsuario] = {
        Nombre: cliente.Nombre,
        Apellido: cliente.Apellido,
        Correo: cliente.Correo,
        Documento: cliente.Documento,
        Telefono: cliente.Telefono || "",
        Direccion: cliente.Direccion || "",
        Estado: normalizarEstado(cliente.Estado, "boolean"),
        IdRol: 2, // Rol de cliente
        ultimaActualizacion: new Date().toISOString(),
      }

      localStorage.setItem("usuariosData", JSON.stringify(usuariosData))
      console.log(`[SINCRONIZACIÓN VISUAL] Datos del usuario actualizados localmente para ID: ${idUsuario}`)
    }

    console.log(`[SINCRONIZACIÓN VISUAL] Cliente → Usuario completada. Operación: ${operacion}`)
  } catch (error) {
    console.error("[SINCRONIZACIÓN VISUAL] Error en sincronización visual Cliente → Usuario:", error)
  }
}

/**
 * Limpia la caché de estados locales
 * Útil cuando se quiere forzar una recarga desde el servidor
 */
export function limpiarCacheEstados() {
  try {
    localStorage.removeItem("clientesEstados")
    localStorage.removeItem("usuariosEstados")
    console.log("[SINCRONIZACIÓN VISUAL] Caché de estados limpiada correctamente")
  } catch (error) {
    console.error("[SINCRONIZACIÓN VISUAL] Error al limpiar caché de estados:", error)
  }
}

export default {
  actualizarEstadoClienteLocal,
  actualizarEstadoUsuarioLocal,
  sincronizarVisualUsuarioCliente,
  sincronizarVisualClienteUsuario,
  limpiarCacheEstados,
}
