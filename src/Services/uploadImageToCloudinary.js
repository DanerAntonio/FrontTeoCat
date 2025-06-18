/**
 * Función para optimizar URLs de Cloudinary
 * @param {string} url - URL de Cloudinary a optimizar
 * @returns {string} - URL optimizada
 */
export const optimizeCloudinaryUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url

  try {
    // Extraer las partes importantes de la URL
    const urlParts = url.split("/")
    const uploadIndex = urlParts.indexOf("upload")

    if (uploadIndex === -1) return url

    // Obtener el nombre del archivo y la versión
    const fileNameWithParams = urlParts.slice(uploadIndex + 1).join("/")
    const cloudName = urlParts[urlParts.indexOf("res.cloudinary.com") + 1]

    // Crear una URL más corta con transformaciones para reducir tamaño
    // c_limit,w_500 limita el ancho a 500px, f_auto optimiza el formato
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_500,f_auto/${fileNameWithParams}`
  } catch (error) {
    console.error("Error al optimizar URL de Cloudinary:", error)
    return url
  }
}

/**
 * Servicio para subir imágenes a Cloudinary directamente desde el frontend
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta en Cloudinary donde se guardará la imagen
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadImageToCloudinary = async (file, folder = "generales") => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "TeoFotos") // Tu upload preset
  formData.append("folder", folder) // Carpeta de destino en Cloudinary

  // No añadir transformaciones aquí para evitar errores con tu configuración actual
  // formData.append("transformation", "c_limit,w_800,q_auto:good")

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dkrgtoask/image/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Error al subir imagen: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return data.secure_url
  } catch (err) {
    console.error("Error al subir la imagen:", err)
    return null
  }
}
