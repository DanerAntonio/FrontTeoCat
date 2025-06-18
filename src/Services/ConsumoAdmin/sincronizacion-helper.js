/**
 * Archivo de ayuda para ejecutar la sincronización manual
 * Este archivo puede ser importado y utilizado para forzar la sincronización
 * entre usuarios y clientes cuando sea necesario.
 */

import { sincronizarUsuarioACliente, sincronizarClienteAUsuario, sincronizacionCompleta } from "../ConsumoAdmin/sincronizador"

/**
 * Ejecuta una sincronización manual de un usuario a cliente
 * @param {Object} usuario - Datos del usuario
 * @returns {Promise<boolean>} - Resultado de la sincronización
 */
export async function sincronizarManualUsuarioACliente(usuario) {
  console.log("[SINCRONIZACIÓN MANUAL] Iniciando sincronización manual de usuario a cliente", usuario)

  try {
    const resultado = await sincronizarUsuarioACliente(usuario, "actualizar")
    console.log("[SINCRONIZACIÓN MANUAL] Resultado:", resultado ? "Éxito" : "Fallido")
    return resultado
  } catch (error) {
    console.error("[SINCRONIZACIÓN MANUAL] Error:", error)
    return false
  }
}

/**
 * Ejecuta una sincronización manual de un cliente a usuario
 * @param {Object} cliente - Datos del cliente
 * @returns {Promise<boolean>} - Resultado de la sincronización
 */
export async function sincronizarManualClienteAUsuario(cliente) {
  console.log("[SINCRONIZACIÓN MANUAL] Iniciando sincronización manual de cliente a usuario", cliente)

  try {
    const resultado = await sincronizarClienteAUsuario(cliente, "actualizar")
    console.log("[SINCRONIZACIÓN MANUAL] Resultado:", resultado ? "Éxito" : "Fallido")
    return resultado
  } catch (error) {
    console.error("[SINCRONIZACIÓN MANUAL] Error:", error)
    return false
  }
}

/**
 * Ejecuta una sincronización manual completa
 * @returns {Promise<{usuariosAClientes: {exito: number, error: number}, clientesAUsuarios: {exito: number, error: number}}>}
 */
export async function ejecutarSincronizacionCompleta() {
  console.log("[SINCRONIZACIÓN MANUAL] Iniciando sincronización completa")

  try {
    const resultado = await sincronizacionCompleta()
    console.log("[SINCRONIZACIÓN MANUAL] Resultado:", resultado)
    return resultado
  } catch (error) {
    console.error("[SINCRONIZACIÓN MANUAL] Error en sincronización completa:", error)
    return {
      usuariosAClientes: { exito: 0, error: 0 },
      clientesAUsuarios: { exito: 0, error: 0 },
    }
  }
}

// Exportar todas las funciones
export default {
  sincronizarManualUsuarioACliente,
  sincronizarManualClienteAUsuario,
  ejecutarSincronizacionCompleta,
}
