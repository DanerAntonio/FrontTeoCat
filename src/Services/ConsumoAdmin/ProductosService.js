import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de productos CON MANEJO CORRECTO DE PRECIOS
 */
const ProductosService = {
  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  getAll: async () => {
    try {
      console.log("Obteniendo todos los productos")
      const response = await axiosInstance.get(`/products/productos`)

      console.log("Productos obtenidos:", response.data)

      // Asegurar que los precios estén formateados correctamente
      if (Array.isArray(response.data)) {
        return response.data.map((producto) => ({
          ...producto,
          // ✅ CORRECCIÓN: Usar PrecioVenta como precio principal si existe
          Precio: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
          PrecioVenta: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
          PrecioCompra: Number(producto.PrecioCompra) || 0,
          Stock: Number(producto.Stock) || 0,
          PorcentajeIVA: Number(producto.PorcentajeIVA) || 0,
          MargenGanancia: Number(producto.MargenGanancia) || 0,
        }))
      }

      return response.data
    } catch (error) {
      console.error("Error al obtener productos:", error)
      throw error
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getById: async (id) => {
    try {
      console.log(`Obteniendo producto con ID ${id}`)
      const response = await axiosInstance.get(`/products/productos/${id}`)
      console.log(`Producto ${id} obtenido:`, response.data)

      // ✅ CORRECCIÓN: Asegurar que los datos de precios estén correctamente formateados
      const producto = response.data
      return {
        ...producto,
        // Usar PrecioVenta como precio principal si existe, sino usar Precio
        Precio: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
        PrecioVenta: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
        PrecioCompra: Number(producto.PrecioCompra) || 0,
        Stock: Number(producto.Stock) || 0,
        PorcentajeIVA: Number(producto.PorcentajeIVA) || 0,
        MargenGanancia: Number(producto.MargenGanancia) || 0,
        ValorUnidad: Number(producto.ValorUnidad) || 1,
      }
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN CORREGIDA: Crea un nuevo producto con precios correctos
   * @param {Object} productoData - Datos del producto a crear
   * @returns {Promise<Object>}
   */
  create: async (productoData) => {
    try {
      console.log("Creando nuevo producto:", productoData)

      // ✅ CORRECCIÓN: Asegurar que el precio principal sea el precio de venta
      const dataToSend = {
        ...productoData,
        // El precio principal debe ser el precio de venta calculado
        Precio: Number(productoData.PrecioVenta) || Number(productoData.Precio) || 0,
        PrecioVenta: Number(productoData.PrecioVenta) || Number(productoData.Precio) || 0,
        PrecioCompra: Number(productoData.PrecioCompra) || 0,
        Stock: Number(productoData.Stock) || 0,
        PorcentajeIVA: Number(productoData.PorcentajeIVA) || 0,
        MargenGanancia: Number(productoData.MargenGanancia) || 0,
        ValorUnidad: Number(productoData.ValorUnidad) || 1,
      }

      console.log("Datos a enviar al servidor:", dataToSend)

      const response = await axiosInstance.post("/products/productos", dataToSend)
      console.log("Producto creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al crear producto:", error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN CORREGIDA: Actualiza un producto existente con precios correctos
   * @param {number} id - ID del producto a actualizar
   * @param {Object} productoData - Datos actualizados del producto
   * @returns {Promise<Object>} Producto actualizado
   */
  update: async (id, productoData) => {
    try {
      console.log(`Actualizando producto con ID ${id}:`, productoData)

      // ✅ CORRECCIÓN: Asegurar que el precio principal sea el precio de venta
      const dataToSend = {
        ...productoData,
        // El precio principal debe ser el precio de venta calculado
        Precio: Number(productoData.PrecioVenta) || Number(productoData.Precio) || 0,
        PrecioVenta: Number(productoData.PrecioVenta) || Number(productoData.Precio) || 0,
        PrecioCompra: Number(productoData.PrecioCompra) || 0,
        Stock: Number(productoData.Stock) || 0,
        PorcentajeIVA: Number(productoData.PorcentajeIVA) || 0,
        MargenGanancia: Number(productoData.MargenGanancia) || 0,
        ValorUnidad: Number(productoData.ValorUnidad) || 1,
      }

      console.log("Datos a enviar al servidor:", dataToSend)

      const response = await axiosInstance.put(`/products/productos/${id}`, dataToSend)
      console.log(`Producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ NUEVO MÉTODO: Calcular precio de venta basado en precio de compra y margen
   * @param {number} precioCompra - Precio de compra del producto
   * @param {number} margenGanancia - Porcentaje de margen de ganancia
   * @returns {number} Precio de venta calculado
   */
  calcularPrecioVenta: (precioCompra, margenGanancia) => {
    const precio = Number.parseFloat(precioCompra) || 0
    const margen = Number.parseFloat(margenGanancia) || 0

    if (precio <= 0) return 0

    // Calcular precio de venta: precio de compra + (precio de compra * margen / 100)
    const precioVenta = precio + (precio * margen) / 100

    return Math.round(precioVenta) // Redondear a entero para precios en pesos
  },

  /**
   * ✅ NUEVO MÉTODO: Validar datos de precios antes de guardar
   * @param {Object} productoData - Datos del producto
   * @returns {Object} Datos validados y corregidos
   */
  validarDatosPrecios: (productoData) => {
    const precioCompra = Number.parseFloat(productoData.PrecioCompra) || 0
    const margenGanancia = Number.parseFloat(productoData.MargenGanancia) || 0
    let precioVenta = Number.parseFloat(productoData.PrecioVenta) || 0

    // Si hay precio de compra y margen, calcular precio de venta automáticamente
    if (precioCompra > 0 && margenGanancia > 0) {
      precioVenta = ProductosService.calcularPrecioVenta(precioCompra, margenGanancia)
    }

    // Si no hay precio de venta válido, usar precio de compra como mínimo
    if (precioVenta <= 0 && precioCompra > 0) {
      precioVenta = precioCompra
    }

    return {
      ...productoData,
      PrecioCompra: precioCompra,
      MargenGanancia: margenGanancia,
      PrecioVenta: precioVenta,
      Precio: precioVenta, // El precio principal es el precio de venta
    }
  },

  // ... resto de métodos existentes sin cambios ...

  /**
   * Obtener stock actual de un producto
   * @param {number} idProducto - ID del producto
   * @returns {Promise<Object>} Información del stock del producto
   */
  getStock: async (idProducto) => {
    try {
      console.log(`🔍 Obteniendo stock del producto ID: ${idProducto}`)

      // Intentar endpoint específico de stock
      try {
        const response = await axiosInstance.get(`/products/productos/${idProducto}/stock`)
        console.log(`✅ Stock obtenido desde endpoint específico:`, response.data)
        return response.data
      } catch (error) {
        // Si no existe endpoint específico, usar getById
        console.log("Endpoint específico de stock no disponible, usando getById")
        const producto = await ProductosService.getById(idProducto)

        return {
          IdProducto: producto.IdProducto || producto.id,
          NombreProducto: producto.NombreProducto || producto.nombre,
          Stock: Number(producto.Stock) || 0,
          Estado: producto.Estado || producto.estado,
          Origen: producto.Origen || producto.origen,
          // ✅ Incluir precio de venta correcto
          PrecioVenta: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
        }
      }
    } catch (error) {
      console.error(`❌ Error obteniendo stock del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Validar stock para múltiples productos
   * @param {Array} productos - Array de productos con {IdProducto, Cantidad}
   * @returns {Promise<Object>} Resultado de la validación
   */
  validarStock: async (productos) => {
    try {
      console.log("🔍 Validando stock para múltiples productos:", productos)

      // Intentar endpoint específico de validación
      try {
        const response = await axiosInstance.post("/products/validar-stock", { productos })
        console.log("✅ Validación desde endpoint específico:", response.data)
        return response.data
      } catch (error) {
        // Si no existe endpoint específico, validar manualmente
        console.log("Endpoint específico de validación no disponible, validando manualmente")

        const errores = []
        const productosValidados = []

        for (const item of productos) {
          try {
            const producto = await ProductosService.getById(item.IdProducto)

            if (!producto || !producto.Estado) {
              errores.push(`Producto con ID ${item.IdProducto} no disponible`)
              continue
            }

            const stockDisponible = Number(producto.Stock) || 0
            const cantidadSolicitada = Number(item.Cantidad) || 1

            if (stockDisponible < cantidadSolicitada) {
              errores.push(
                `${producto.NombreProducto}: Stock insuficiente. ` +
                  `Disponible: ${stockDisponible}, Solicitado: ${cantidadSolicitada}`,
              )
              continue
            }

            productosValidados.push({
              ...item,
              producto: producto,
              stockDisponible: stockDisponible,
              precioVenta: Number(producto.PrecioVenta) || Number(producto.Precio) || 0,
            })
          } catch (productError) {
            console.error(`Error validando producto ${item.IdProducto}:`, productError)
            errores.push(`Error al verificar producto ID ${item.IdProducto}`)
          }
        }

        return {
          valido: errores.length === 0,
          errores,
          productos: productosValidados,
        }
      }
    } catch (error) {
      console.error("❌ Error validando stock:", error)
      throw error
    }
  },

  // ... resto de métodos sin cambios ...
  getActivosParaCompras: async () => {
    try {
      console.log("Obteniendo productos activos para compras")
      // Usar solo la ruta que existe
      const response = await axiosInstance.get("/products/productos")
      // Filtrar productos activos según el campo Estado o estado
      const productosActivos = response.data.filter(
        (producto) =>
          producto.Estado === true ||
          producto.Estado === 1 ||
          producto.Estado === "Activo" ||
          producto.estado === true ||
          producto.estado === 1 ||
          producto.estado === "Activo",
      )
      console.log("Productos activos filtrados:", productosActivos)
      return productosActivos
    } catch (error) {
      console.error("Error al obtener productos activos para compras:", error)
      return []
    }
  },

  getByBarcode: async (codigo) => {
    try {
      console.log(`Obteniendo producto con código de barras ${codigo}`)
      const response = await axiosInstance.get(`/products/productos/codigo/${codigo}`)
      console.log(`Producto con código ${codigo} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener producto con código ${codigo}:`, error)
      throw error
    }
  },

  getByCategoria: async (idCategoria) => {
    try {
      console.log(`Obteniendo productos de la categoría ${idCategoria}`)
      const response = await axiosInstance.get(`/products/productos/categoria/${idCategoria}`)
      console.log(`Productos de la categoría ${idCategoria} obtenidos:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${idCategoria}:`, error)
      throw error
    }
  },

  changeStatus: async (id, estado) => {
    try {
      console.log(`Cambiando estado del producto ${id} a: ${estado}`)
      const response = await axiosInstance.patch(`/products/productos/${id}/status`, {
        Estado: estado,
      })
      console.log(`Estado del producto ${id} cambiado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del producto ${id}:`, error)
      throw error
    }
  },

  updateStock: async (id, cantidad) => {
    try {
      console.log(`Actualizando stock del producto ${id} en ${cantidad} unidades`)
      const response = await axiosInstance.patch(`/products/productos/${id}/stock`, {
        cantidad: Number(cantidad),
      })
      console.log(`Stock del producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar stock del producto ${id}:`, error)
      throw error
    }
  },

  delete: async (id) => {
    try {
      console.log(`Eliminando producto con ID ${id}`)
      const response = await axiosInstance.delete(`/products/productos/${id}`)
      console.log(`Producto ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error)
      throw error
    }
  },

  // Métodos de variantes sin cambios...
  getVariantes: async (idProducto) => {
    try {
      console.log(`Obteniendo variantes del producto ${idProducto}`)
      const response = await axiosInstance.get(`/products/productos/${idProducto}/variantes`)
      console.log(`Variantes del producto ${idProducto} obtenidas:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener variantes del producto ${idProducto}:`, error)
      throw error
    }
  },

  createVariante: async (idProducto, varianteData) => {
    try {
      console.log(`Creando variante para el producto ${idProducto}:`, varianteData)

      const dataToSend = {
        ...varianteData,
        Precio: Number(varianteData.PrecioVenta) || Number(varianteData.Precio) || 0,
        PrecioVenta: Number(varianteData.PrecioVenta) || Number(varianteData.Precio) || 0,
        PrecioCompra: Number(varianteData.PrecioCompra) || 0,
        Stock: Number(varianteData.Stock) || 0,
        PorcentajeIVA: Number(varianteData.PorcentajeIVA) || 0,
        MargenGanancia: Number(varianteData.MargenGanancia) || 0,
      }

      const response = await axiosInstance.post(`/products/productos/${idProducto}/variantes`, dataToSend)
      console.log(`Variante creada exitosamente para el producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al crear variante para el producto ${idProducto}:`, error)
      throw error
    }
  },

  updateVariante: async (idProducto, idVariante, varianteData) => {
    try {
      console.log(`Actualizando variante ${idVariante} del producto ${idProducto}:`, varianteData)

      const dataToSend = {
        ...varianteData,
        Precio: Number(varianteData.PrecioVenta) || Number(varianteData.Precio) || 0,
        PrecioVenta: Number(varianteData.PrecioVenta) || Number(varianteData.Precio) || 0,
        PrecioCompra: Number(varianteData.PrecioCompra) || 0,
        Stock: Number(varianteData.Stock) || 0,
        PorcentajeIVA: Number(varianteData.PorcentajeIVA) || 0,
        MargenGanancia: Number(varianteData.MargenGanancia) || 0,
      }

      const response = await axiosInstance.put(`/products/productos/${idProducto}/variantes/${idVariante}`, dataToSend)
      console.log(`Variante ${idVariante} actualizada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  },

  deleteVariante: async (idProducto, idVariante) => {
    try {
      console.log(`Eliminando variante ${idVariante} del producto ${idProducto}`)
      const response = await axiosInstance.delete(`/products/productos/${idProducto}/variantes/${idVariante}`)
      console.log(`Variante ${idVariante} eliminada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  },
}

export default ProductosService
