/**
 * Utilidades para normalizar datos entre usuarios y clientes
 * Este archivo contiene funciones para asegurar que los datos
 * tengan el formato correcto en ambos sistemas.
 */

/**
 * Normaliza el nombre de un usuario o cliente
 * @param {string} nombre - Nombre a normalizar
 * @returns {string} - Nombre normalizado
 */
export function normalizarNombre(nombre) {
  if (!nombre) return ""

  // Convertir a string si no lo es
  nombre = String(nombre)

  // Eliminar espacios extras y capitalizar primera letra de cada palabra
  return nombre
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Normaliza el estado entre sistemas (numérico/texto)
 * @param {any} estado - Estado en cualquier formato
 * @param {string} formato - Formato deseado ('numero', 'texto', 'boolean')
 * @returns {any} - Estado normalizado en el formato solicitado
 */
export function normalizarEstado(estado, formato = "numero") {
  // Determinar el valor booleano del estado
  let esActivo = false

  if (typeof estado === "boolean") {
    esActivo = estado
  } else if (typeof estado === "number") {
    esActivo = estado === 1
  } else if (typeof estado === "string") {
    esActivo = estado === "1" || estado === "true" || estado === "Activo" || estado === "activo" || estado === "ACTIVO"
  }

  // Devolver en el formato solicitado
  switch (formato.toLowerCase()) {
    case "numero":
      return esActivo ? 1 : 0
    case "texto":
      return esActivo ? "Activo" : "Inactivo"
    case "boolean":
      return esActivo
    default:
      return esActivo ? 1 : 0
  }
}

/**
 * Normaliza un documento de identidad
 * @param {string} documento - Documento a normalizar
 * @returns {string} - Documento normalizado
 */
export function normalizarDocumento(documento) {
  if (!documento) return ""

  // Convertir a string si no lo es
  documento = String(documento)

  // Eliminar espacios y caracteres no numéricos
  return documento.replace(/[^0-9]/g, "")
}

/**
 * Normaliza un correo electrónico
 * @param {string} correo - Correo a normalizar
 * @returns {string} - Correo normalizado
 */
export function normalizarCorreo(correo) {
  if (!correo) return ""

  // Convertir a string si no lo es
  correo = String(correo)

  // Convertir a minúsculas y eliminar espacios
  return correo.toLowerCase().trim()
}

/**
 * Normaliza un objeto usuario para sincronización
 * @param {Object} usuario - Objeto usuario a normalizar
 * @returns {Object} - Usuario normalizado
 */
export function normalizarUsuario(usuario) {
  if (!usuario) return null

  return {
    IdUsuario: usuario.IdUsuario || usuario.id,
    Nombre: normalizarNombre(usuario.Nombre),
    Apellido: normalizarNombre(usuario.Apellido),
    Correo: normalizarCorreo(usuario.Correo),
    Documento: normalizarDocumento(usuario.Documento),
    Telefono: usuario.Telefono || "",
    Direccion: usuario.Direccion || "",
    Estado: normalizarEstado(usuario.Estado, "boolean"),
    IdRol: usuario.IdRol || usuario.Rol?.IdRol || 2,
  }
}

/**
 * Normaliza un objeto cliente para sincronización
 * @param {Object} cliente - Objeto cliente a normalizar
 * @returns {Object} - Cliente normalizado
 */
export function normalizarCliente(cliente) {
  if (!cliente) return null

  return {
    IdCliente: cliente.IdCliente || cliente.id,
    Nombre: normalizarNombre(cliente.Nombre),
    Apellido: normalizarNombre(cliente.Apellido),
    Correo: normalizarCorreo(cliente.Correo),
    Documento: normalizarDocumento(cliente.Documento),
    Telefono: cliente.Telefono || "",
    Direccion: cliente.Direccion || "",
    Estado: normalizarEstado(cliente.Estado, "numero"),
    IdUsuario: cliente.IdUsuario || null,
  }
}

/**
 * Normaliza el estado para la API de usuarios (convierte a boolean)
 * @param {any} estado - Estado en cualquier formato
 * @returns {boolean} - Estado normalizado (true o false)
 */
export function normalizarEstadoBooleano(estado) {
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

export default {
  normalizarNombre,
  normalizarEstado,
  normalizarDocumento,
  normalizarCorreo,
  normalizarUsuario,
  normalizarCliente,
  normalizarEstadoBooleano,
}
