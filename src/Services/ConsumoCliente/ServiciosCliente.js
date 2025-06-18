"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import axiosInstance from "../ConsumoAdmin/axios"

/**
 * Servicio integrado para el catálogo público de servicios
 * Maneja todas las operaciones relacionadas con servicios del cliente
 */
const ServiciosClienteAPI = {
  // ============================================
  // 🔹 TIPOS DE SERVICIO (PÚBLICO)
  // ============================================

  /**
   * Obtener todos los tipos de servicio
   */
  obtenerTipos: async () => {
    try {
      const response = await axiosInstance.get("/servicios/tipos")
      return response.data
    } catch (error) {
      console.error("Error al obtener tipos de servicio:", error)
      throw error
    }
  },

  /**
   * Obtener un tipo de servicio por ID
   */
  obtenerTipoPorId: async (id) => {
    try {
      const response = await axiosInstance.get(`/servicios/tipos/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener tipo de servicio ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener servicios de un tipo específico
   */
  obtenerServiciosPorTipo: async (tipoId) => {
    try {
      const response = await axiosInstance.get(`/servicios/tipos/${tipoId}/servicios`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener servicios del tipo ${tipoId}:`, error)
      throw error
    }
  },

  // ============================================
  // 🔹 SERVICIOS (PÚBLICO)
  // ============================================

  /**
   * Obtener todos los servicios
   */
  obtenerTodos: async () => {
    try {
      const response = await axiosInstance.get("/servicios/servicios")
      return response.data
    } catch (error) {
      console.error("Error al obtener servicios:", error)
      throw error
    }
  },

  /**
   * Obtener un servicio por ID
   */
  obtenerPorId: async (id) => {
    try {
      const response = await axiosInstance.get(`/servicios/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener servicio ${id}:`, error)
      throw error
    }
  },

  /**
   * Buscar servicios
   */
  buscarServicios: async (termino, pagina = 1, limite = 10) => {
    try {
      const params = new URLSearchParams({
        term: termino,
        page: pagina.toString(),
        limit: limite.toString(),
      })

      const response = await axiosInstance.get(`/servicios/servicios/search?${params}`)
      return response.data
    } catch (error) {
      console.error("Error al buscar servicios:", error)
      throw error
    }
  },

  // ============================================
  // 🔹 MÉTODOS DE UTILIDAD
  // ============================================

  /**
   * Obtener servicios activos únicamente
   */
  obtenerServiciosActivos: async () => {
    try {
      const servicios = await ServiciosClienteAPI.obtenerTodos()
      return servicios.filter((servicio) => servicio.Estado === true || servicio.Estado === 1)
    } catch (error) {
      console.error("Error al obtener servicios activos:", error)
      throw error
    }
  },

  /**
   * Obtener tipos de servicio activos únicamente
   */
  obtenerTiposActivos: async () => {
    try {
      const tipos = await ServiciosClienteAPI.obtenerTipos()
      return tipos.filter((tipo) => tipo.Estado === true || tipo.Estado === 1)
    } catch (error) {
      console.error("Error al obtener tipos de servicio activos:", error)
      throw error
    }
  },

  /**
   * Obtener servicios por rango de precio
   */
  obtenerServiciosPorPrecio: async (precioMin, precioMax) => {
    try {
      const servicios = await ServiciosClienteAPI.obtenerServiciosActivos()
      return servicios.filter((servicio) => {
        const precio = Number.parseFloat(servicio.Precio)
        return precio >= precioMin && precio <= precioMax
      })
    } catch (error) {
      console.error("Error al obtener servicios por precio:", error)
      throw error
    }
  },

  /**
   * Obtener servicios por duración
   */
  obtenerServiciosPorDuracion: async (duracionMin, duracionMax) => {
    try {
      const servicios = await ServiciosClienteAPI.obtenerServiciosActivos()
      return servicios.filter((servicio) => {
        const duracion = Number.parseInt(servicio.Duracion)
        return duracion >= duracionMin && duracion <= duracionMax
      })
    } catch (error) {
      console.error("Error al obtener servicios por duración:", error)
      throw error
    }
  },

  /**
   * Obtener servicios más populares
   */
  obtenerServiciosPopulares: async (limite = 6) => {
    try {
      const servicios = await ServiciosClienteAPI.obtenerServiciosActivos()
      return servicios.slice(0, limite)
    } catch (error) {
      console.error("Error al obtener servicios populares:", error)
      throw error
    }
  },

  /**
   * Obtener servicios recomendados por tipo
   */
  obtenerServiciosRecomendados: async (tipoId, limite = 4) => {
    try {
      const servicios = await ServiciosClienteAPI.obtenerServiciosPorTipo(tipoId)
      const serviciosActivos = servicios.filter((servicio) => servicio.Estado === true || servicio.Estado === 1)
      return serviciosActivos.slice(0, limite)
    } catch (error) {
      console.error("Error al obtener servicios recomendados:", error)
      throw error
    }
  },
}

/**
 * Hook personalizado para manejar el estado y lógica de servicios del cliente
 */
export const useServiciosCliente = () => {
  const [servicios, setServicios] = useState([])
  const [tiposServicio, setTiposServicio] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar todos los servicios
  const cargarServicios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.obtenerServiciosActivos()
      setServicios(data)
    } catch (error) {
      console.error("Error al cargar servicios:", error)
      setError("No se pudieron cargar los servicios")
      toast.error("Error al cargar los servicios")
    } finally {
      setLoading(false)
    }
  }

  // Cargar tipos de servicio
  const cargarTiposServicio = async () => {
    try {
      const data = await ServiciosClienteAPI.obtenerTiposActivos()
      setTiposServicio(data)
    } catch (error) {
      console.error("Error al cargar tipos de servicio:", error)
      toast.error("Error al cargar tipos de servicio")
    }
  }

  // Buscar servicios
  const buscarServicios = async (termino, pagina = 1, limite = 10) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.buscarServicios(termino, pagina, limite)
      setServicios(data)
    } catch (error) {
      console.error("Error al buscar servicios:", error)
      setError("Error en la búsqueda")
      toast.error("Error al buscar servicios")
    } finally {
      setLoading(false)
    }
  }

  // Obtener servicios por tipo
  const obtenerServiciosPorTipo = async (tipoId) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.obtenerServiciosPorTipo(tipoId)
      const serviciosActivos = data.filter((servicio) => servicio.Estado === true || servicio.Estado === 1)
      setServicios(serviciosActivos)
    } catch (error) {
      console.error("Error al cargar servicios por tipo:", error)
      setError("Error al cargar servicios del tipo seleccionado")
      toast.error("Error al cargar servicios por tipo")
    } finally {
      setLoading(false)
    }
  }

  // Obtener servicios populares
  const obtenerServiciosPopulares = async (limite = 6) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.obtenerServiciosPopulares(limite)
      setServicios(data)
    } catch (error) {
      console.error("Error al cargar servicios populares:", error)
      setError("Error al cargar servicios populares")
      toast.error("Error al cargar servicios populares")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por precio
  const filtrarPorPrecio = async (precioMin, precioMax) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.obtenerServiciosPorPrecio(precioMin, precioMax)
      setServicios(data)
    } catch (error) {
      console.error("Error al filtrar por precio:", error)
      setError("Error al filtrar servicios por precio")
      toast.error("Error al filtrar por precio")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por duración
  const filtrarPorDuracion = async (duracionMin, duracionMax) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServiciosClienteAPI.obtenerServiciosPorDuracion(duracionMin, duracionMax)
      setServicios(data)
    } catch (error) {
      console.error("Error al filtrar por duración:", error)
      setError("Error al filtrar servicios por duración")
      toast.error("Error al filtrar por duración")
    } finally {
      setLoading(false)
    }
  }

  return {
    servicios,
    tiposServicio,
    loading,
    error,
    cargarServicios,
    cargarTiposServicio,
    buscarServicios,
    obtenerServiciosPorTipo,
    obtenerServiciosPopulares,
    filtrarPorPrecio,
    filtrarPorDuracion,
  }
}

/**
 * Hook para manejar un servicio individual
 */
export const useServicioDetalle = (servicioId) => {
  const [servicio, setServicio] = useState(null)
  const [serviciosRelacionados, setServiciosRelacionados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarServicio = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar servicio principal
      const servicioData = await ServiciosClienteAPI.obtenerPorId(servicioId)

      if (!servicioData) {
        setError("Servicio no encontrado")
        return
      }

      setServicio(servicioData)

      // Cargar servicios relacionados del mismo tipo
      if (servicioData.IdTipoServicio) {
        const relacionados = await ServiciosClienteAPI.obtenerServiciosRecomendados(servicioData.IdTipoServicio, 4)
        // Filtrar el servicio actual de los relacionados
        const filtrados = relacionados.filter((s) => s.IdServicio !== servicioData.IdServicio)
        setServiciosRelacionados(filtrados)
      }
    } catch (error) {
      console.error("Error al cargar servicio:", error)
      setError("Error al cargar el servicio")
      toast.error("Error al cargar el servicio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (servicioId) {
      cargarServicio()
    }
  }, [servicioId])

  return {
    servicio,
    serviciosRelacionados,
    loading,
    error,
    recargarServicio: cargarServicio,
  }
}

/**
 * Utilidades para formatear datos de servicios
 */
export const formatearServicio = (servicio) => {
  if (!servicio) return null

  // Procesar imágenes
  const imagenes = servicio.Foto
    ? servicio.Foto.split("|")
        .map((url) => url.trim())
        .filter((url) => url)
    : ["/placeholder.svg"]

  // Procesar beneficios
  const beneficios = servicio.Beneficios ? servicio.Beneficios.split(", ").filter((b) => b.trim()) : []

  // Procesar qué incluye
  const queIncluye = {}
  if (servicio.Que_incluye) {
    servicio.Que_incluye.split(", ").forEach((item) => {
      const [nombre, valor] = item.split(": ")
      if (nombre && valor) {
        queIncluye[nombre.trim()] = valor.trim()
      }
    })
  }

  return {
    id: servicio.IdServicio,
    name: servicio.Nombre,
    description: servicio.Descripcion || "Sin descripción disponible",
    price: Number.parseFloat(servicio.Precio) || 0,
    duration: `${servicio.Duracion} minutos`,
    category: servicio.NombreTipoServicio || "Servicio",
    availability: servicio.Estado === true || servicio.Estado === 1,
    rating: 4.5, // Valor por defecto hasta implementar sistema de reseñas
    images: imagenes,
    benefits: beneficios,
    includes: queIncluye,
    image: imagenes[0], // Imagen principal para las cards
    // Datos originales para referencia
    original: servicio,
  }
}

/**
 * Utilidades para formatear precios
 */
export const formatearPrecio = (precio) => {
  return Number.parseFloat(precio).toLocaleString("es-CO")
}

/**
 * Utilidades para formatear duración
 */
export const formatearDuracion = (minutos) => {
  const mins = Number.parseInt(minutos)
  if (mins < 60) {
    return `${mins} min`
  } else {
    const horas = Math.floor(mins / 60)
    const minutosRestantes = mins % 60
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}min` : `${horas}h`
  }
}

// Exportar la API para uso directo si es necesario
export { ServiciosClienteAPI }
