import axiosInstance from "../ConsumoAdmin/axios.js"

const CatalogoService = {
  // ============================================
  // 🔹 SERVICIOS PARA CATEGORÍAS
  // ============================================

  // Obtener todas las categorías
  getAllCategorias: async () => {
    try {
      console.log("🔄 Obteniendo categorías...")
      const response = await axiosInstance.get("/productos/categorias")
      console.log("✅ Categorías obtenidas:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error)
      console.error("Response:", error.response?.data)
      console.error("Status:", error.response?.status)
      throw error
    }
  },

  // Buscar categorías
  searchCategorias: async (term) => {
    try {
      const response = await axiosInstance.get(`/productos/categorias/search?term=${encodeURIComponent(term)}`)
      return response.data
    } catch (error) {
      console.error("Error al buscar categorías:", error)
      throw error
    }
  },

  // Obtener categoría por ID
  getCategoriaById: async (id) => {
    try {
      const response = await axiosInstance.get(`/productos/categorias/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener categoría:", error)
      throw error
    }
  },

  // Obtener productos de una categoría
  getProductosByCategoria: async (categoriaId) => {
    try {
      const response = await axiosInstance.get(`/productos/categorias/${categoriaId}/productos`)
      return response.data
    } catch (error) {
      console.error("Error al obtener productos de la categoría:", error)
      throw error
    }
  },

  // ============================================
  // 🔹 SERVICIOS PARA PRODUCTOS
  // ============================================

  // Obtener todos los productos
  getAllProductos: async () => {
    try {
      console.log("🔄 Obteniendo productos...")
      const response = await axiosInstance.get("/productos/productos")
      console.log("✅ Productos obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Error al obtener productos:", error)
      console.error("Response:", error.response?.data)
      console.error("Status:", error.response?.status)
      throw error
    }
  },

  // Buscar productos
  searchProductos: async (term) => {
    try {
      const response = await axiosInstance.get(`/productos/productos/search?term=${encodeURIComponent(term)}`)
      return response.data
    } catch (error) {
      console.error("Error al buscar productos:", error)
      throw error
    }
  },

  // Obtener producto por ID
  getProductoById: async (id) => {
    try {
      const response = await axiosInstance.get(`/productos/productos/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener producto:", error)
      throw error
    }
  },

  // Obtener productos por categoría (ruta alternativa)
  getProductosPorCategoria: async (categoriaId) => {
    try {
      const response = await axiosInstance.get(`/productos/productos/categoria/${categoriaId}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error)
      throw error
    }
  },

  // Obtener producto por código de barras
  getProductoByBarcode: async (codigo) => {
    try {
      const response = await axiosInstance.get(`/productos/productos/codigo/${codigo}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener producto por código:", error)
      throw error
    }
  },

  // Obtener variantes de un producto
  getVariantesProducto: async (productoId) => {
    try {
      const response = await axiosInstance.get(`/productos/productos/${productoId}/variantes`)
      return response.data
    } catch (error) {
      console.error("Error al obtener variantes del producto:", error)
      throw error
    }
  },

  // ============================================
  // 🔹 UTILIDADES DE MAPEO
  // ============================================

  // Mapear producto de API a formato del componente
  mapProductoToComponent: (producto) => {
    console.log("🔄 Mapeando producto:", producto)
    return {
      id: producto.IdProducto,
      name: producto.NombreProducto,
      category: producto.NombreCategoria || "Sin categoría",
      price: Number.parseFloat(producto.Precio) || 0,
      rating: 4.5, // Valor por defecto ya que no viene en la API
      stock: producto.Stock || 0,
      image: producto.FotosProducto || "//vite.svg
",
      description: producto.Descripcion || "",
      barcode: producto.CodigoBarras,
      reference: producto.Referencia,
      unit: producto.UnidadMedida,
      origin: producto.Origen,
      status: producto.Estado,
      categoryId: producto.IdCategoriaDeProducto,
      isVariant: producto.EsVariante,
      baseProductId: producto.ProductoBaseId,
    }
  },

  // Mapear categoría de API a formato del componente
  mapCategoriaToComponent: (categoria) => {
    console.log("🔄 Mapeando categoría:", categoria)
    return {
      id: categoria.IdCategoriaDeProducto,
      name: categoria.NombreCategoria,
      description: categoria.Descripcion || "",
      status: categoria.Estado,
    }
  },

  // ============================================
  // 🔹 MÉTODOS COMBINADOS PARA COMPONENTES
  // ============================================

  // Obtener datos completos para el catálogo
  getCatalogoData: async () => {
    try {
      console.log("🔄 Obteniendo datos completos del catálogo...")

      const [productos, categorias] = await Promise.all([
        CatalogoService.getAllProductos(),
        CatalogoService.getAllCategorias(),
      ])

      console.log("📦 Productos raw:", productos)
      console.log("📂 Categorías raw:", categorias)

      const productosMapeados = productos.map(CatalogoService.mapProductoToComponent)
      const categoriasMapeadas = categorias.map(CatalogoService.mapCategoriaToComponent)

      console.log("✅ Productos mapeados:", productosMapeados)
      console.log("✅ Categorías mapeadas:", categoriasMapeadas)

      return {
        productos: productosMapeados,
        categorias: categoriasMapeadas,
      }
    } catch (error) {
      console.error("❌ Error al obtener datos del catálogo:", error)
      throw error
    }
  },

  // Obtener producto completo con variantes para página de detalle
  getProductoCompleto: async (id) => {
    try {
      const [producto, variantes] = await Promise.all([
        CatalogoService.getProductoById(id),
        CatalogoService.getVariantesProducto(id).catch(() => []), // Si no tiene variantes, devolver array vacío
      ])

      const productoMapeado = CatalogoService.mapProductoToComponent(producto)
      const variantesMapeadas = variantes.map(CatalogoService.mapProductoToComponent)

      return {
        ...productoMapeado,
        variants: variantesMapeadas,
        // Datos adicionales para la página de detalle
        features: ["Producto de alta calidad", "Garantía incluida", "Envío disponible"],
        specifications: {
          "Código de barras": producto.CodigoBarras || "N/A",
          Referencia: producto.Referencia || "N/A",
          "Unidad de medida": producto.UnidadMedida || "N/A",
          // ❌ CAMPOS REMOVIDOS: Origen, Stock, Stock disponible
        },
        images: producto.FotosProducto ? [producto.FotosProducto] : ["//vite.svg
"],
        reviews: [], // Por ahora vacío, se puede implementar después
      }
    } catch (error) {
      console.error("Error al obtener producto completo:", error)
      throw error
    }
  },
}

export default CatalogoService
