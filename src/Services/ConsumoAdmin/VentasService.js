import * as bootstrap from "bootstrap"
import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de ventas CON VALIDACIÓN DE STOCK
 */
const VentasService = {
  /**
   * Obtiene todas las ventas
   * @param {number} page - Número de página
   * @param {number} limit - Límite de ventas por página
   * @param {boolean} forceRefresh - Si es true, fuerza una recarga sin usar caché
   * @returns {Promise<Array>} Lista de ventas
   */
  getAll: async (page = 1, limit = 10, forceRefresh = false) => {
    try {
      console.log(
        `VentasService: Solicitando todas las ventas, página ${page}, límite ${limit}, forzar recarga: ${forceRefresh}`,
      )

      // ✅ RUTA CORREGIDA: /sales/ventas
      const url = `/sales/ventas?page=${page}&limit=${limit}${forceRefresh ? "&_t=" + Date.now() : ""}`
      console.log("URL de solicitud:", url)

      const response = await axiosInstance.get(url, {
        headers: forceRefresh
          ? {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            }
          : {},
      })
      console.log("VentasService: Respuesta completa:", response)
      console.log("VentasService: Datos de respuesta:", response.data)

      // Verificar la estructura de la respuesta y devolver los datos adecuadamente
      if (response.data && Array.isArray(response.data.data)) {
        console.log("Formato de respuesta: objeto con array en data")
        // Ordenar por ID de forma descendente
        const sortedData = [...response.data.data].sort((a, b) => {
          const idA = a.id || a.IdVenta || 0
          const idB = b.id || b.IdVenta || 0
          return idB - idA
        })
        console.log("Ventas ordenadas por ID descendente")
        return sortedData
      } else if (Array.isArray(response.data)) {
        console.log("Formato de respuesta: array directo")
        // Ordenar por ID de forma descendente para mostrar las más recientes primero
        const sortedData = [...response.data].sort((a, b) => {
          // Intentar ordenar por ID (mayor a menor)
          const idA = a.id || a.IdVenta || 0
          const idB = b.id || b.IdVenta || 0
          return idB - idA
        })
        console.log("Ventas ordenadas por ID descendente")
        return sortedData
      } else if (response.data && typeof response.data === "object") {
        // Buscar cualquier propiedad que contenga un array
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Formato de respuesta: objeto con array en ${key}`)
            return response.data[key]
          }
        }

        // Si llegamos aquí, no encontramos un array en la respuesta
        console.warn("No se encontró un array en la respuesta:", response.data)

        // Si es un objeto único, convertirlo en array
        if (Object.keys(response.data).length > 0) {
          console.log("Convirtiendo objeto único a array")
          return [response.data]
        }
      }

      // Si no es ninguno de los formatos esperados, devolver array vacío
      console.warn("Formato de respuesta inesperado:", response.data)
      return []
    } catch (error) {
      console.error("Error al obtener ventas:", error)

      // Mostrar detalles específicos del error para depuración
      if (error.response) {
        console.error("Error de respuesta:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        console.error("Error de solicitud (no se recibió respuesta):", error.request)
      } else {
        console.error("Error al configurar la solicitud:", error.message)
      }

      // Intentar recuperar ventas del localStorage como fallback
      try {
        const ventasLocales = JSON.parse(localStorage.getItem("ventas_lista") || "[]")
        console.log("Usando ventas almacenadas localmente:", ventasLocales)
        return ventasLocales
      } catch (localError) {
        console.error("Error al recuperar ventas locales:", localError)
      }

      // Si todo falla, devolver array vacío
      return []
    }
  },

  // ✅ NUEVO: Obtener clientes para ventas (usuarios con rol cliente sincronizados)
  /**
   * Obtiene todos los clientes disponibles para ventas (usuarios con rol Cliente sincronizados)
   * @returns {Promise<Array>} Lista de clientes para ventas
   */
  getClientesParaVentas: async () => {
    try {
      console.log("🔍 VentasService: Obteniendo clientes para ventas...")

      const response = await axiosInstance.get("/sales/clientes-para-ventas")

      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Clientes para ventas obtenidos:", response.data.length)
        return response.data
      }

      console.warn("Formato inesperado en respuesta de clientes para ventas:", response.data)
      return []
    } catch (error) {
      console.error("❌ Error al obtener clientes para ventas:", error)

      // Fallback: intentar obtener desde el endpoint de clientes regular
      try {
        console.log("Intentando fallback con endpoint de clientes regular...")
        const clientesResponse = await axiosInstance.get("/customers/clientes")

        if (Array.isArray(clientesResponse.data)) {
          // Filtrar solo clientes activos y formatear para ventas
          const clientesFormateados = clientesResponse.data
            .filter((cliente) => cliente.Estado === true || cliente.estado === true)
            .map((cliente) => ({
              IdCliente: cliente.IdCliente || cliente.id,
              IdUsuario: cliente.IdUsuario || cliente.idUsuario,
              Documento: cliente.Documento || cliente.documento,
              NombreCompleto:
                `${cliente.Nombre || cliente.nombre} ${cliente.Apellido || cliente.apellido || ""}`.trim(),
              Nombre: cliente.Nombre || cliente.nombre,
              Apellido: cliente.Apellido || cliente.apellido,
              Correo: cliente.Correo || cliente.correo,
              Telefono: cliente.Telefono || cliente.telefono,
              TipoCliente: cliente.Documento === "0000000000" ? "Consumidor Final" : "Cliente Registrado",
              TextoSelect:
                cliente.Documento === "0000000000"
                  ? `${cliente.Nombre || cliente.nombre} ${cliente.Apellido || cliente.apellido || ""}`.trim()
                  : `${cliente.Nombre || cliente.nombre} ${cliente.Apellido || cliente.apellido || ""} - ${cliente.Documento || cliente.documento}`.trim(),
              esConsumidorFinal: cliente.Documento === "0000000000" ? 1 : 0,
            }))

          console.log("✅ Clientes obtenidos desde fallback:", clientesFormateados.length)
          return clientesFormateados
        }
      } catch (fallbackError) {
        console.error("Error en fallback de clientes:", fallbackError)
      }

      return []
    }
  },

  // ✅ NUEVO: Obtener mascotas de un cliente específico
  /**
   * Obtiene las mascotas de un cliente específico
   * @param {number} idCliente - ID del cliente
   * @returns {Promise<Array>} Lista de mascotas del cliente
   */
  getMascotasCliente: async (idCliente) => {
    try {
      console.log(`🐾 VentasService: Obteniendo mascotas para cliente ID: ${idCliente}`)

      const response = await axiosInstance.get(`/sales/clientes/${idCliente}/mascotas`)

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Mascotas encontradas: ${response.data.length}`)
        return response.data
      }

      console.warn("Formato inesperado en respuesta de mascotas:", response.data)
      return []
    } catch (error) {
      console.error("❌ Error al obtener mascotas del cliente:", error)

      // Fallback: intentar obtener desde el endpoint de mascotas regular
      try {
        console.log("Intentando fallback con endpoint de mascotas regular...")
        const mascotasResponse = await axiosInstance.get("/customers/mascotas")

        if (Array.isArray(mascotasResponse.data)) {
          // Filtrar mascotas del cliente específico
          const mascotasCliente = mascotasResponse.data
            .filter(
              (mascota) =>
                (mascota.IdCliente === idCliente || mascota.idCliente === idCliente) &&
                (mascota.Estado === true || mascota.estado === true),
            )
            .map((mascota) => ({
              IdMascota: mascota.IdMascota || mascota.id,
              IdCliente: mascota.IdCliente || mascota.idCliente,
              NombreMascota: mascota.Nombre || mascota.nombre,
              Raza: mascota.Raza || mascota.raza,
              Tamaño: mascota.Tamaño || mascota.tamaño,
              NombreEspecie: mascota.NombreEspecie || mascota.especie,
              TextoCompletoMascota: `${mascota.Nombre || mascota.nombre} (${mascota.NombreEspecie || mascota.especie} - ${mascota.Raza || mascota.raza})`,
              Estado: mascota.Estado || mascota.estado,
              esMascotaGenerica: false,
            }))

          console.log(`✅ Mascotas obtenidas desde fallback: ${mascotasCliente.length}`)
          return mascotasCliente
        }
      } catch (fallbackError) {
        console.error("Error en fallback de mascotas:", fallbackError)
      }

      return []
    }
  },

  /**
   * Obtiene una venta por su ID
   * @param {number} id - ID de la venta
   * @returns {Promise<Object>} Datos de la venta
   */
  getById: async (id) => {
    console.log(`VentasService: Solicitando venta con ID ${id}`)

    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/:id
      const response = await axiosInstance.get(`/sales/ventas/${id}`)
      console.log(`VentasService: Respuesta recibida para venta ID ${id}:`, response.data)

      if (response.data) {
        return response.data
      }
    } catch (error) {
      console.error(`Error al obtener venta con ID ${id}`)

      // Verificar si es un error 500 específico relacionado con DocumentoCliente
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data?.message || error.response.data || ""
        if (
          typeof errorMessage === "string" &&
          (errorMessage.includes("DocumentoCliente") || errorMessage.includes("Cannot read properties of undefined"))
        ) {
          console.warn("Error específico de DocumentoCliente detectado, intentando obtener datos básicos de la venta")

          // Intentar crear un objeto de venta con Consumidor Final
          try {
            // Intentar obtener datos básicos de la venta sin relaciones
            const basicResponse = await axiosInstance.get(`/sales/ventas/${id}/basic`)
            if (basicResponse.data) {
              console.log("Datos básicos de venta obtenidos:", basicResponse.data)

              // Agregar información de Consumidor Final manualmente
              return {
                ...basicResponse.data,
                cliente: {
                  nombre: "Consumidor",
                  apellido: "Final",
                  Nombre: "Consumidor",
                  Apellido: "Final",
                  documento: "0000000000",
                  Documento: "0000000000",
                },
                _warning: "Datos parciales debido a error en relaciones",
              }
            }
          } catch (basicError) {
            console.warn("No se pudieron obtener datos básicos:", basicError)

            // Si falla, intentar crear un objeto mínimo para Consumidor Final
            if (error.response.data && typeof error.response.data === "object") {
              // Si tenemos algunos datos de la venta, usarlos
              return {
                ...error.response.data,
                cliente: {
                  nombre: "Consumidor",
                  apellido: "Final",
                  Nombre: "Consumidor",
                  Apellido: "Final",
                  documento: "0000000000",
                  Documento: "0000000000",
                },
                _warning: "Datos parciales con cliente simulado",
              }
            }
          }
        }
      }

      // Si hay un error, intentar obtener la venta de otra manera
      try {
        // Buscar en el estado local
        const ventasLocales = JSON.parse(localStorage.getItem("ventas") || "[]")
        const ventaLocal = ventasLocales.find((v) => v.id == id || v.IdVenta == id)

        if (ventaLocal) {
          console.log("Usando datos de venta almacenados localmente:", ventaLocal)
          return ventaLocal
        }

        // Si no hay datos locales, intentar obtener la venta de la lista completa
        const todasLasVentas = await VentasService.getAll()
        const venta = todasLasVentas.find((v) => v.id == id || v.IdVenta == id)

        if (venta) {
          console.log("Venta encontrada en la lista completa:", venta)
          return venta
        }
      } catch (secondError) {
        console.error("Error al intentar obtener venta de fuentes alternativas:", secondError)
      }
    }

    // Si todo falla, crear un objeto mínimo con los datos disponibles
    return {
      id: id,
      IdVenta: id,
      estado: "Efectiva",
      Estado: "Efectiva",
      _error: "Datos simulados debido a error del servidor",
      productos: [
        {
          IdProducto: 1,
          NombreProducto: "Producto de venta",
          Cantidad: 1,
          PrecioUnitario: 0,
          IvaUnitario: 0,
          Subtotal: 0,
        },
      ],
    }
  },

  /**
   * Obtiene los detalles de productos de una venta
   * @param {number} id - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de productos
   */
  getDetallesProductos: async (id) => {
    console.log(`VentasService: Solicitando detalles de productos para venta ID ${id}`)

    // Intentar obtener la venta completa primero, que debería incluir los detalles
    try {
      const ventaCompleta = await VentasService.getById(id)

      // Si la venta tiene detalles de productos, usarlos directamente
      if (
        ventaCompleta &&
        ventaCompleta.detallesProductos &&
        Array.isArray(ventaCompleta.detallesProductos) &&
        ventaCompleta.detallesProductos.length > 0
      ) {
        console.log("Usando detalles de productos incluidos en la venta:", ventaCompleta.detallesProductos)
        return ventaCompleta.detallesProductos
      }

      if (
        ventaCompleta &&
        ventaCompleta.productos &&
        Array.isArray(ventaCompleta.productos) &&
        ventaCompleta.productos.length > 0
      ) {
        console.log("Usando productos incluidos en la venta:", ventaCompleta.productos)
        return ventaCompleta.productos
      }
    } catch (initialError) {
      console.warn("No se pudo obtener la venta completa con detalles:", initialError.message)
    }

    // ✅ RUTAS CORREGIDAS: Intentar diferentes rutas para obtener los detalles de productos
    const possiblePaths = [
      `/sales/ventas/${id}/detalles`,
      `/sales/detalles-ventas?idVenta=${id}`,
      `/sales/detalles-ventas/venta/${id}`,
    ]

    let lastError = null

    // Probar cada ruta posible
    for (const path of possiblePaths) {
      try {
        console.log(`Intentando obtener detalles de productos desde: ${path}`)
        const response = await axiosInstance.get(path, { timeout: 5000 }) // Añadir timeout para evitar esperas largas

        // Verificar si la respuesta contiene datos
        if (response.data) {
          console.log(`Éxito al obtener detalles de productos desde: ${path}`, response.data)

          // Asegurar que siempre devolvemos un array
          if (Array.isArray(response.data)) {
            return response.data
          } else if (response.data.detalles && Array.isArray(response.data.detalles)) {
            return response.data.detalles
          } else if (response.data.productos && Array.isArray(response.data.productos)) {
            return response.data.productos
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data
          } else if (response.data.detallesProductos && Array.isArray(response.data.detallesProductos)) {
            return response.data.detallesProductos
          } else {
            console.warn(`Formato inesperado en respuesta de detalles:`, response.data)
            // Intentar convertir a array si es un objeto
            if (typeof response.data === "object" && !Array.isArray(response.data)) {
              return [response.data]
            }
          }
        }
      } catch (error) {
        console.warn(`Error al intentar ruta ${path}:`, error.message)
        lastError = error
        // Continuar con la siguiente ruta
      }
    }

    // Si llegamos aquí, todas las rutas fallaron
    console.error(`Todos los intentos fallaron para obtener detalles de productos de venta con ID ${id}`)

    // Intentar obtener detalles de productos desde la venta completa
    try {
      const ventaCompleta = await VentasService.getById(id)
      if (ventaCompleta && (ventaCompleta.productos || ventaCompleta.detallesProductos)) {
        console.log(
          "Usando detalles de productos de la venta completa:",
          ventaCompleta.productos || ventaCompleta.detallesProductos,
        )
        return ventaCompleta.productos || ventaCompleta.detallesProductos || []
      }
    } catch (error) {
      console.error("Error al intentar obtener detalles desde la venta completa:", error)
    }

    // Intentar crear detalles simulados basados en la información de la venta
    try {
      // Buscar la venta en localStorage
      const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
      const venta = ventasGuardadas.find((v) => v.id == id || v.IdVenta == id)

      if (venta && venta.detallesProductos && Array.isArray(venta.detallesProductos)) {
        console.log("Usando detalles de productos almacenados localmente:", venta.detallesProductos)
        return venta.detallesProductos
      }

      // Si no hay detalles en localStorage, intentar obtener la venta para crear datos simulados
      const ventaInfo = await VentasService.getById(id)
      if (ventaInfo) {
        // Crear un producto simulado con la mejor información disponible
        return [
          {
            IdProducto: 1,
            NombreProducto: "Producto de venta",
            Cantidad: 1,
            PrecioUnitario: ventaInfo.Subtotal || ventaInfo.subtotal || 0,
            IvaUnitario: ventaInfo.TotalIva || ventaInfo.totalIVA || 0,
            Subtotal: ventaInfo.Subtotal || ventaInfo.subtotal || 0,
          },
        ]
      }
    } catch (localError) {
      console.warn("Error al obtener datos locales:", localError)
    }

    // Si todo falla, devolver un array vacío
    return []
  },

  /**
   * Obtiene los detalles de servicios de una venta
   * @param {number} id - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de servicios
   */
  getDetallesServicios: async (id) => {
    console.log(`VentasService: Solicitando detalles de servicios para venta ID ${id}`)

    // Intentar obtener la venta completa primero, que debería incluir los detalles
    try {
      const ventaCompleta = await VentasService.getById(id)

      // Si la venta tiene detalles de servicios, usarlos directamente
      if (
        ventaCompleta &&
        ventaCompleta.detallesServicios &&
        Array.isArray(ventaCompleta.detallesServicios) &&
        ventaCompleta.detallesServicios.length > 0
      ) {
        console.log("Usando detalles de servicios incluidos en la venta:", ventaCompleta.detallesServicios)
        return ventaCompleta.detallesServicios
      }
    } catch (initialError) {
      console.warn("No se pudo obtener la venta completa con detalles de servicios:", initialError.message)
    }

    // ✅ RUTAS CORREGIDAS: Intentar diferentes rutas para obtener los detalles de servicios
    const possiblePaths = [
      `/sales/ventas/${id}/detalles-servicios`,
      `/sales/detalles-ventas-servicios?idVenta=${id}`,
      `/sales/detalles-ventas-servicios/venta/${id}`,
    ]

    // Probar cada ruta posible
    for (const path of possiblePaths) {
      try {
        console.log(`Intentando obtener detalles de servicios desde: ${path}`)
        const response = await axiosInstance.get(path, { timeout: 5000 })

        // Verificar si la respuesta contiene datos
        if (response.data) {
          console.log(`Éxito al obtener detalles de servicios desde: ${path}`, response.data)

          // Asegurar que siempre devolvemos un array
          if (Array.isArray(response.data)) {
            return response.data
          } else if (response.data.detalles && Array.isArray(response.data.detalles)) {
            return response.data.detalles
          } else if (response.data.servicios && Array.isArray(response.data.servicios)) {
            return response.data.servicios
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data
          } else if (response.data.detallesServicios && Array.isArray(response.data.detallesServicios)) {
            return response.data.detallesServicios
          } else {
            console.warn(`Formato inesperado en respuesta de detalles de servicios:`, response.data)
            // Intentar convertir a array si es un objeto
            if (typeof response.data === "object" && !Array.isArray(response.data)) {
              return [response.data]
            }
          }
        }
      } catch (error) {
        console.warn(`Error al intentar ruta ${path} para servicios:`, error.message)
        // Continuar con la siguiente ruta
      }
    }

    // Si llegamos aquí, todas las rutas fallaron
    console.log(`Todos los intentos fallaron para obtener detalles de servicios de venta con ID ${id}`)

    // Intentar obtener detalles desde localStorage
    try {
      const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
      const venta = ventasGuardadas.find((v) => v.id == id || v.IdVenta == id)

      if (venta && venta.detallesServicios && Array.isArray(venta.detallesServicios)) {
        console.log("Usando detalles de servicios almacenados localmente:", venta.detallesServicios)
        return venta.detallesServicios
      }
    } catch (localError) {
      console.warn("Error al obtener datos de servicios locales:", localError)
    }

    // Si todo falla, devolver un array vacío
    return []
  },

  /**
   * Obtiene el ID de la mascota genérica para Consumidor Final
   * @returns {Promise<number>} ID de la mascota genérica
   */
  getMascotaGenericaId: async () => {
    try {
      // Primero intentar recuperar de caché local
      const cachedId = localStorage.getItem("mascota_generica_id")
      if (cachedId) {
        return Number.parseInt(cachedId, 10)
      }

      // ✅ RUTA CORREGIDA: /sales/mascota-generica
      try {
        const response = await axiosInstance.get(`/sales/mascota-generica`)
        if (response.data && response.data.IdMascota) {
          // Guardar en caché local
          localStorage.setItem("mascota_generica_id", response.data.IdMascota.toString())
          return response.data.IdMascota
        }
      } catch (error) {
        console.warn("No se pudo obtener la mascota genérica del endpoint específico:", error)
      }

      // Si no existe un endpoint específico, buscar en todas las mascotas
      try {
        // ✅ RUTA CORREGIDA: /customers/mascotas
        const mascotas = await axiosInstance.get(`/customers/mascotas`)
        if (Array.isArray(mascotas.data)) {
          // Buscar una mascota con nombre "Mascota Genérica" o similar
          const mascotaGenerica = mascotas.data.find(
            (m) =>
              m.Nombre === "Mascota Genérica" ||
              m.nombre === "Mascota Genérica" ||
              m.Nombre === "Mascota Temporal" ||
              m.nombre === "Mascota Temporal",
          )

          if (mascotaGenerica) {
            const id = mascotaGenerica.IdMascota || mascotaGenerica.id
            localStorage.setItem("mascota_generica_id", id.toString())
            return id
          }
        }
      } catch (error) {
        console.warn("Error al buscar mascota genérica en todas las mascotas:", error)
      }

      // Si no se encuentra, devolver un ID predeterminado (1)
      // Este ID debe corresponder a una mascota real en la base de datos
      return 1
    } catch (error) {
      console.error("Error al obtener ID de la mascota genérica:", error)
      // En caso de error, devolver 1 como valor predeterminado
      return 1
    }
  },

  /**
   * ✅ FUNCIÓN PRINCIPAL ACTUALIZADA: Crea una nueva venta CON VALIDACIÓN DE STOCK
   * @param {Object} ventaData - Datos de la venta a crear
   * @returns {Promise<Object>}
   */
  create: async (ventaData) => {
    try {
      console.log("VentasService: Iniciando creación de venta con validación de stock")
      console.log("Datos recibidos:", JSON.stringify(ventaData, null, 2))

      // ✅ NUEVA VALIDACIÓN: Verificar stock antes de procesar la venta
      if (ventaData.detallesProductos && ventaData.detallesProductos.length > 0) {
        console.log("🔍 Validando stock para productos...")

        for (const producto of ventaData.detallesProductos) {
          try {
            // Obtener stock actual del producto
            const stockResponse = await axiosInstance.get(`/products/productos/${producto.IdProducto}`)
            const productoInfo = stockResponse.data

            if (!productoInfo || !productoInfo.Estado) {
              throw new Error(`Producto ${producto.IdProducto} no disponible`)
            }

            const stockDisponible = productoInfo.Stock || 0
            const cantidadSolicitada = producto.Cantidad || 1

            if (stockDisponible < cantidadSolicitada) {
              // Mostrar alerta de stock insuficiente
              const error = `Stock insuficiente para "${productoInfo.NombreProducto}". Disponible: ${stockDisponible}, Solicitado: ${cantidadSolicitada}`

              // Crear modal de alerta
              VentasService.mostrarAlertaStockInsuficiente([error])

              throw new Error(error)
            }

            console.log(
              `✅ Stock validado para ${productoInfo.NombreProducto}: ${stockDisponible} >= ${cantidadSolicitada}`,
            )
          } catch (error) {
            console.error(`Error validando producto ${producto.IdProducto}:`, error)
            throw error
          }
        }

        console.log("✅ Validación de stock exitosa")
      }

      // Intentar obtener el usuario logueado del localStorage
      let usuarioLogueado = null
      try {
        const userData = localStorage.getItem("userData")
        if (userData) {
          usuarioLogueado = JSON.parse(userData)
          console.log("Usuario logueado encontrado:", usuarioLogueado)
        }
      } catch (userError) {
        console.warn("Error al obtener usuario logueado:", userError)
      }

      // SOLUCIÓN MEJORADA: Verificar si hay servicios y si es cliente Consumidor Final
      if (ventaData.detallesServicios && ventaData.detallesServicios.length > 0) {
        // Verificar si es un cliente Consumidor Final
        const esConsumidorFinal =
          ventaData.venta?.IdCliente === 3 ||
          ventaData.venta?.IdCliente === 0 ||
          ventaData.IdCliente === 3 ||
          ventaData.IdCliente === 0

        // Si es Consumidor Final, asignar ID de mascota genérica (ID 1) a todos los servicios
        if (esConsumidorFinal) {
          console.log("Cliente es Consumidor Final, asignando mascota genérica (ID 1) a todos los servicios")
          ventaData.detallesServicios = ventaData.detallesServicios.map((servicio) => ({
            ...servicio,
            IdMascota: 1, // Usar ID 1 para mascota genérica
          }))
        } else {
          // Para clientes regulares, verificar que cada servicio tenga un IdMascota
          ventaData.detallesServicios = ventaData.detallesServicios.map((servicio) => {
            if (!servicio.IdMascota && servicio.IdMascota !== 0) {
              console.warn("Servicio sin IdMascota para cliente regular, asignando mascota genérica (ID 1):", servicio)
              return {
                ...servicio,
                IdMascota: 1, // Usar ID 1 como fallback para evitar errores
              }
            }
            return servicio
          })
        }
      }

      // SOLUCIÓN MEJORADA: Si los servicios vienen en productosAgregados, procesarlos adecuadamente
      if (ventaData.productosAgregados && ventaData.productosAgregados.length > 0) {
        const servicios = ventaData.productosAgregados.filter((item) => item.tipo === "servicio")

        if (servicios.length > 0) {
          // Verificar si es un cliente Consumidor Final
          const esConsumidorFinal =
            ventaData.venta?.IdCliente === 3 ||
            ventaData.venta?.IdCliente === 0 ||
            ventaData.IdCliente === 3 ||
            ventaData.IdCliente === 0

          if (esConsumidorFinal) {
            console.log("Cliente es Consumidor Final, asignando mascota genérica (ID 1) a todos los servicios")
            // La lógica para asignar IdMascota: 1 se implementará más adelante en el código
          }
        }
      }

      // CORRECCIÓN 1: Asegurarse que los campos estén correctamente formateados
      const datosNormalizados = {
        venta: {
          // Datos de la venta
          IdCliente: ventaData.IdCliente || ventaData.venta?.IdCliente || 3,
          // Usar el ID del usuario logueado si está disponible
          IdUsuario: usuarioLogueado
            ? usuarioLogueado.IdUsuario || usuarioLogueado.id
            : ventaData.IdUsuario || ventaData.venta?.IdUsuario || 1,
          // Antes (solo fecha, sin hora)
          // FechaVenta: ventaData.FechaVenta || ventaData.venta?.FechaVenta || new Date().toISOString().split("T")[0],
          // Después (fecha y hora en UTC)
          FechaVenta: ventaData.FechaVenta || ventaData.venta?.FechaVenta || new Date().toISOString(),
          Estado: ventaData.Estado || ventaData.venta?.Estado || "Efectiva",
          Tipo: ventaData.Tipo || ventaData.venta?.Tipo || "Venta",
          Subtotal: Number.parseFloat(ventaData.Subtotal || ventaData.venta?.Subtotal || 0),
          TotalIva: Number.parseFloat(ventaData.TotalIva || ventaData.venta?.TotalIva || 0),
          TotalMonto: Number.parseFloat(ventaData.Total || ventaData.TotalMonto || ventaData.venta?.TotalMonto || 0),
          MetodoPago: ventaData.MetodoPago || ventaData.venta?.MetodoPago || "efectivo",
          MontoRecibido: Number.parseFloat(ventaData.MontoRecibido || ventaData.venta?.MontoRecibido || 0),
          Cambio: Number.parseFloat(ventaData.Cambio || ventaData.venta?.Cambio || 0),
          // Permitir valores NULL para estos campos
          NotasAdicionales: ventaData.NotasAdicionales || ventaData.venta?.NotasAdicionales || null,
          ComprobantePago: ventaData.ComprobantePago || ventaData.venta?.ComprobantePago || null,
        },
        // CORRECCIÓN 2: Inicializar correctamente arrays vacíos
        detallesProductos: [],
        detallesServicios: [],
      }

      // CORRECCIÓN 3: Procesar adecuadamente los detalles de productos
      if (ventaData.DetallesProductos && ventaData.DetallesProductos.length > 0) {
        datosNormalizados.detallesProductos = ventaData.DetallesProductos.map((producto) => ({
          IdProducto: Number.parseInt(producto.IdProducto, 10),
          Cantidad: Number.parseInt(producto.Cantidad, 10) || 1,
          PrecioUnitario: Number.parseFloat(producto.PrecioUnitario) || 0,
        }))
      } else if (ventaData.detallesProductos && ventaData.detallesProductos.length > 0) {
        datosNormalizados.detallesProductos = ventaData.detallesProductos.map((producto) => ({
          IdProducto: Number.parseInt(producto.IdProducto, 10),
          Cantidad: Number.parseInt(producto.Cantidad, 10) || 1,
          PrecioUnitario: Number.parseFloat(producto.PrecioUnitario) || 0,
        }))
      } else if (ventaData.productosAgregados && ventaData.productosAgregados.length > 0) {
        // CORRECCIÓN 4: Si los productos vienen en productosAgregados, procesarlos adecuadamente
        const productos = ventaData.productosAgregados.filter((item) => item.tipo === "producto")

        if (productos.length > 0) {
          datosNormalizados.detallesProductos = productos.map((producto) => ({
            IdProducto: Number.parseInt(producto.id, 10),
            Cantidad: Number.parseInt(producto.cantidad, 10) || 1,
            PrecioUnitario: Number.parseFloat(producto.precioUnitario) || 0,
          }))
        }
      }

      // Verificar si es una venta para Consumidor Final
      const esConsumidorFinal =
        datosNormalizados.venta.IdCliente === 0 ||
        datosNormalizados.venta.IdCliente === 3 ||
        ventaData.IdCliente === 0 ||
        ventaData.IdCliente === 3 ||
        (ventaData.venta && (ventaData.venta.IdCliente === 0 || ventaData.venta.IdCliente === 3))

      // CORRECCIÓN 5: Procesar adecuadamente los detalles de servicios
      if (ventaData.DetallesServicios && ventaData.DetallesServicios.length > 0) {
        datosNormalizados.detallesServicios = ventaData.DetallesServicios.map((servicio) => {
          // SOLUCIÓN MEJORADA: Siempre asignar IdMascota: 1 para todos los servicios si es Consumidor Final
          if (esConsumidorFinal) {
            return {
              IdServicio: Number.parseInt(servicio.IdServicio, 10),
              IdMascota: 1, // Usar ID 1 para mascota genérica
              Cantidad: Number.parseInt(servicio.Cantidad, 10) || 1,
              PrecioUnitario: Number.parseFloat(servicio.PrecioUnitario) || 0,
              // Mantener información temporal si existe
              NombreMascotaTemporal: servicio.NombreMascotaTemporal || "Mascota Genérica",
              TipoMascotaTemporal: servicio.TipoMascotaTemporal || "Genérica",
            }
          }

          // Para clientes regulares, usar el ID de mascota proporcionado o 1 como fallback
          return {
            IdServicio: Number.parseInt(servicio.IdServicio, 10),
            IdMascota: Number.parseInt(servicio.IdMascota, 10) || 1, // Usar 1 como fallback
            Cantidad: Number.parseInt(servicio.Cantidad, 10) || 1,
            PrecioUnitario: Number.parseFloat(servicio.PrecioUnitario) || 0,
          }
        })
      } else if (ventaData.detallesServicios && ventaData.detallesServicios.length > 0) {
        datosNormalizados.detallesServicios = ventaData.detallesServicios.map((servicio) => {
          // SOLUCIÓN MEJORADA: Siempre asignar IdMascota: 1 para todos los servicios si es Consumidor Final
          if (esConsumidorFinal) {
            return {
              IdServicio: Number.parseInt(servicio.IdServicio, 10),
              IdMascota: 1, // Usar ID 1 para mascota genérica
              Cantidad: Number.parseInt(servicio.Cantidad, 10) || 1,
              PrecioUnitario: Number.parseFloat(servicio.PrecioUnitario) || 0,
              // Mantener información temporal si existe
              NombreMascotaTemporal: servicio.NombreMascotaTemporal || "Mascota Genérica",
              TipoMascotaTemporal: servicio.TipoMascotaTemporal || "Genérica",
            }
          }

          // Para clientes regulares, usar el ID de mascota proporcionado o 1 como fallback
          return {
            IdServicio: Number.parseInt(servicio.IdServicio, 10),
            IdMascota: Number.parseInt(servicio.IdMascota, 10) || 1, // Usar 1 como fallback
            Cantidad: Number.parseInt(servicio.Cantidad, 10) || 1,
            PrecioUnitario: Number.parseFloat(servicio.PrecioUnitario) || 0,
          }
        })
      } else if (ventaData.productosAgregados && ventaData.productosAgregados.length > 0) {
        // CORRECCIÓN 7: Si los servicios vienen en productosAgregados, procesarlos adecuadamente
        const servicios = ventaData.productosAgregados.filter((item) => item.tipo === "servicio")

        if (servicios.length > 0) {
          datosNormalizados.detallesServicios = servicios.map((servicio) => {
            // Manejar el ID del servicio
            const idServicio = Number.parseInt(servicio.id, 10)

            // SOLUCIÓN MEJORADA: Siempre asignar IdMascota: 1 para todos los servicios si es Consumidor Final
            if (esConsumidorFinal) {
              // Obtener información de la mascota temporal si existe
              let nombreMascotaTemporal = "Mascota Genérica"
              let tipoMascotaTemporal = "Genérica"

              if (servicio.mascota) {
                nombreMascotaTemporal =
                  servicio.mascota.nombre ||
                  servicio.mascota.Nombre ||
                  servicio.mascota._nombreMascota ||
                  "Mascota Genérica"
                tipoMascotaTemporal =
                  servicio.mascota.tipo || servicio.mascota.Tipo || servicio.mascota._tipoMascota || "Genérica"
              }

              return {
                IdServicio: idServicio,
                IdMascota: 1, // Usar ID 1 para mascota genérica
                NombreMascotaTemporal: nombreMascotaTemporal,
                TipoMascotaTemporal: tipoMascotaTemporal,
                Cantidad: Number.parseInt(servicio.cantidad, 10) || 1,
                PrecioUnitario: Number.parseFloat(servicio.precioUnitario) || 0,
              }
            }

            // Para clientes regulares, usar el ID de mascota de la mascota seleccionada o 1 como fallback
            const mascotaId = servicio.mascota ? servicio.mascota.id || servicio.mascota.IdMascota : null

            return {
              IdServicio: idServicio,
              IdMascota: Number.parseInt(mascotaId, 10) || 1, // Usar 1 como fallback
              Cantidad: Number.parseInt(servicio.cantidad, 10) || 1,
              PrecioUnitario: Number.parseFloat(servicio.precioUnitario) || 0,
            }
          })
        }
      }

      // Si es Consumidor Final y no se han proporcionado valores específicos, usar valores predeterminados
      if (esConsumidorFinal) {
        if (!ventaData.venta?.NotasAdicionales) {
          datosNormalizados.venta.NotasAdicionales = "Venta presencial"
        }

        if (!ventaData.venta?.ComprobantePago && datosNormalizados.venta.MetodoPago === "efectivo") {
          datosNormalizados.venta.ComprobantePago = "Pago en efectivo"
        }
      }

      // SOLUCIÓN FINAL: Verificar que todos los servicios tengan un IdMascota válido
      if (datosNormalizados.detallesServicios && datosNormalizados.detallesServicios.length > 0) {
        datosNormalizados.detallesServicios = datosNormalizados.detallesServicios.map((servicio) => {
          // Si no hay IdMascota o es null, asignar 1 (mascota genérica)
          if (!servicio.IdMascota && servicio.IdMascota !== 0) {
            console.log("Servicio sin IdMascota detectado, asignando mascota genérica (ID 1):", servicio)
            return {
              ...servicio,
              IdMascota: 1,
            }
          }
          return servicio
        })
      }

      console.log("VentasService: Datos normalizados a enviar:", JSON.stringify(datosNormalizados, null, 2))

      // Guardar una copia local antes de enviar al servidor (por si falla)
      const ventaLocalPrevia = {
        ...datosNormalizados,
        id: Date.now(),
        IdVenta: Date.now(),
        _timestamp: new Date().toISOString(),
        _pendiente: true,
      }

      try {
        const ventasLocales = JSON.parse(localStorage.getItem("ventas_pendientes") || "[]")
        ventasLocales.push(ventaLocalPrevia)
        localStorage.setItem("ventas_pendientes", JSON.stringify(ventasLocales))
      } catch (localError) {
        console.warn("Error al guardar venta pendiente en localStorage:", localError)
      }

      // ✅ RUTA CORREGIDA: /sales/ventas
      const response = await axiosInstance.post("/sales/ventas", datosNormalizados, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("VentasService: Venta creada exitosamente:", response.data)

      // Verificar si la respuesta fue exitosa pero no se recibieron datos
      let resultData = response.data

      if (!resultData && response.status >= 200 && response.status < 300) {
        console.log("Venta creada exitosamente pero sin datos retornados")

        // Crear un objeto de respuesta simulado para actualizar el frontend
        resultData = {
          id: Date.now(), // ID temporal
          IdVenta: Date.now(),
          ...datosNormalizados.venta,
          detallesProductos: datosNormalizados.detallesProductos,
          detallesServicios: datosNormalizados.detallesServicios,
          _createdLocally: true,
        }
      }

      // Guardar en localStorage para tener una copia local
      try {
        // Guardar la venta completa
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
        ventasGuardadas.push(resultData)
        localStorage.setItem("ventas", JSON.stringify(ventasGuardadas))

        // También actualizar la lista de ventas
        const ventasLista = JSON.parse(localStorage.getItem("ventas_lista") || "[]")
        if (resultData.venta) {
          ventasLista.unshift(resultData.venta)
        } else {
          ventasLista.unshift(resultData)
        }
        localStorage.setItem("ventas_lista", JSON.stringify(ventasLista))

        // Eliminar de ventas pendientes si existía
        const ventasPendientes = JSON.parse(localStorage.getItem("ventas_pendientes") || "[]")
        const ventasPendientesActualizadas = ventasPendientes.filter(
          (v) => v._timestamp !== ventaLocalPrevia._timestamp,
        )
        localStorage.setItem("ventas_pendientes", JSON.stringify(ventasPendientesActualizadas))
      } catch (storageError) {
        console.warn("Error al guardar venta en localStorage:", storageError)
      }

      return resultData
    } catch (error) {
      console.error("Error al crear venta:", error)

      // Si es un error de stock, no mostrar toast adicional (ya se mostró la alerta)
      if (error.message && error.message.includes("Stock insuficiente")) {
        throw error
      }

      // Intentar identificar el problema específico
      if (error.response) {
        console.error("Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })

        // Si es un error 400, puede ser un problema de validación
        if (error.response.status === 400) {
          console.error("Error de validación. Revisar estructura de datos.")

          // Verificar si el error es específicamente sobre el ID de mascota
          const errorData = error.response.data
          if (typeof errorData === "string" && errorData.includes("mascota no proporcionado")) {
            throw new Error(
              "Error: ID de mascota no proporcionado. Para servicios a Consumidor Final, asegúrese de proporcionar los datos de la mascota temporal.",
            )
          }
        }

        // Si es un error 500, puede ser un problema en el servidor
        if (error.response.status === 500) {
          console.error("Error interno del servidor. Revisar logs del backend.")

          // Intentar guardar los datos localmente para no perderlos
          try {
            const ventaFallida = {
              ...ventaData,
              _error: "Error al guardar en servidor",
              _timestamp: new Date().toISOString(),
            }
            const ventasFallidas = JSON.parse(localStorage.getItem("ventas_fallidas") || "[]")
            ventasFallidas.push(ventaFallida)
            localStorage.setItem("ventas_fallidas", JSON.stringify(ventasFallidas))
            console.log("Datos de venta guardados localmente para recuperación posterior")
          } catch (localError) {
            console.warn("No se pudieron guardar los datos localmente:", localError)
          }
        }
      }

      throw error
    }
  },

  /**
   * ✅ FUNCIÓN AUXILIAR: Mostrar alerta de stock insuficiente
   * @param {Array} errores - Array de mensajes de error
   */
  mostrarAlertaStockInsuficiente: (errores) => {
    if (errores.length === 0) return

    const modalHtml = `
      <div class="modal fade" id="stockAlertModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-danger shadow-lg">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>
                🚫 Stock Insuficiente
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-danger border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-box-open me-2"></i>
                  No se puede procesar la venta por falta de stock:
                </h6>
                <div class="error-list">
                  ${errores
                    .map(
                      (error) => `
                    <div class="mb-2 p-3 bg-light rounded border-left-danger">
                      <pre class="mb-0 text-dark" style="white-space: pre-wrap; font-family: inherit;">${error}</pre>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Por favor, ajuste las cantidades o verifique el inventario antes de continuar.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("stockAlertModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal usando Bootstrap
    const modal = new bootstrap.Modal(document.getElementById("stockAlertModal"))
    modal.show()

    // Limpiar modal después de cerrarlo
    document.getElementById("stockAlertModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  },

  /**
   * Actualiza una venta existente
   * @param {number} id - ID de la venta a actualizar
   * @param {Object} ventaData - Nuevos datos de la venta
   * @returns {Promise<Object>} Datos de la venta actualizada
   */
  update: async (id, ventaData) => {
    try {
      // Verificar si es una venta para Consumidor Final
      const esConsumidorFinal =
        ventaData.IdCliente === 0 || ventaData.idCliente === 0 || ventaData.IdCliente === 3 || ventaData.idCliente === 3

      // Si es Consumidor Final y no se han proporcionado valores específicos, usar valores predeterminados
      if (esConsumidorFinal) {
        if (!ventaData.NotasAdicionales) {
          ventaData.NotasAdicionales = "Venta presencial"
        }

        if (
          !ventaData.ComprobantePago &&
          (ventaData.MetodoPago === "efectivo" || ventaData.metodoPago === "efectivo")
        ) {
          ventaData.ComprobantePago = "Pago en efectivo"
        }
      }

      // ✅ RUTA CORREGIDA: /sales/ventas/:id
      const response = await axiosInstance.put(`/sales/ventas/${id}`, ventaData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar venta con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Actualiza el estado de una venta
   * @param {number} id - ID de la venta
   * @param {string} estado - Nuevo estado (Efectiva, Cancelada, Devuelta, Pendiente)
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateStatus: async (id, nuevoEstado) => {
    return await axiosInstance.patch(`/sales/ventas/${id}/status`, { Estado: nuevoEstado });
  },

  /**
   * Elimina una venta
   * @param {number} id - ID de la venta a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/:id
      const response = await axiosInstance.delete(`/sales/ventas/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar venta con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene ventas por cliente
   * @param {number} idCliente - ID del cliente
   * @returns {Promise<Array>} Lista de ventas del cliente
   */
  getByCliente: async (idCliente) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/cliente/:id
      const response = await axiosInstance.get(`/sales/ventas/cliente/${idCliente}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener ventas del cliente con ID ${idCliente}:`, error)
      throw error
    }
  },

  /**
   * Obtiene ventas por usuario (vendedor)
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>} Lista de ventas del usuario
   */
  getByUsuario: async (idUsuario) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/usuario/:id
      const response = await axiosInstance.get(`/sales/ventas/usuario/${idUsuario}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener ventas del usuario con ID ${idUsuario}:`, error)
      throw error
    }
  },

  /**
   * Obtiene ventas por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (formato YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (formato YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de ventas en el rango de fechas
   */
  getByFecha: async (fechaInicio, fechaFin) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/fecha
      const response = await axiosInstance.get(`/sales/ventas/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener ventas entre ${fechaInicio} y ${fechaFin}:`, error)
      throw error
    }
  },

  /**
   * Obtiene ventas por estado
   * @param {string} estado - Estado de la venta (Efectiva, Cancelada, Devuelta, Pendiente)
   * @returns {Promise<Array} Lista de ventas con el estado especificado
   */
  getByEstado: async (estado) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/estado/:estado
      const response = await axiosInstance.get(`/sales/ventas/estado/${estado}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener ventas con estado ${estado}:`, error)
      throw error
    }
  },

  /**
   * Obtiene ventas por tipo
   * @param {string} tipo - Tipo de venta (Venta, Devolucion, etc.)
   * @returns {Promise<Array>} Lista de ventas del tipo especificado
   */
  getByTipo: async (tipo) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/ventas/tipo/:tipo
      const response = await axiosInstance.get(`/sales/ventas/tipo/${tipo}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener ventas de tipo ${tipo}:`, error)
      throw error
    }
  },

  /**
   * Obtiene el ID del cliente "Consumidor Final"
   * @returns {Promise<number|null>} ID del cliente "Consumidor Final" o null si no existe
   */
  getConsumidorFinalId: async () => {
    try {
      // Primero intentar recuperar de caché local
      const cachedId = localStorage.getItem("consumidor_final_id")
      if (cachedId) {
        return Number.parseInt(cachedId, 10)
      }

      // ✅ RUTA CORREGIDA: /sales/consumidor-final
      try {
        const response = await axiosInstance.get(`/sales/consumidor-final`)
        if (response.data && response.data.consumidorFinal && response.data.consumidorFinal.IdCliente) {
          // Guardar en caché local
          localStorage.setItem("consumidor_final_id", response.data.consumidorFinal.IdCliente.toString())
          return response.data.consumidorFinal.IdCliente
        }
      } catch (error) {
        console.warn("No se pudo obtener el consumidor final del endpoint específico:", error)
      }

      // Si no hay respuesta específica, usar el nuevo endpoint de clientes para ventas
      try {
        const clientes = await VentasService.getClientesParaVentas()
        const consumidorFinal = clientes.find((c) => c.esConsumidorFinal === 1 || c.TipoCliente === "Consumidor Final")

        if (consumidorFinal) {
          const id = consumidorFinal.IdCliente
          localStorage.setItem("consumidor_final_id", id.toString())
          return id
        }
      } catch (error) {
        console.warn("Error al buscar consumidor final en clientes para ventas:", error)
      }

      // Si no se encuentra, devolver 3 como valor predeterminado (según lo indicado)
      return 3
    } catch (error) {
      console.error("Error al obtener ID del cliente Consumidor Final:", error)
      // En caso de error, devolver 3 como valor predeterminado
      return 3
    }
  },

  /**
   * Crea un nuevo detalle de producto para una venta
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>} Datos del detalle creado
   */
  createDetalleProducto: async (detalleData) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/detalles-ventas
      const response = await axiosInstance.post("/sales/detalles-ventas", detalleData)
      return response.data
    } catch (error) {
      console.error("Error al crear detalle de producto:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de producto existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Datos del detalle actualizado
   */
  updateDetalleProducto: async (id, detalleData) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/detalles-ventas/:id
      const response = await axiosInstance.put(`/sales/detalles-ventas/${id}`, detalleData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de producto
   * @param {number} id - ID del detalle a eliminar
   * @param {number} idVenta - ID de la venta a la que pertenece el detalle
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteDetalleProducto: async (id, idVenta) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/detalles-ventas/:id
      const response = await axiosInstance.delete(`/sales/detalles-ventas/${id}?idVenta=${idVenta}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo detalle de servicio para una venta
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>} Datos del detalle creado
   */
  createDetalleServicio: async (detalleData) => {
    try {
      // Asegurarse de que el detalle de servicio tenga un IdMascota válido
      if (!detalleData.IdMascota && detalleData.IdMascota !== 0) {
        console.log("Detalle de servicio sin IdMascota, asignando mascota genérica (ID 1):", detalleData)
        detalleData.IdMascota = 1
      }

      // ✅ RUTA CORREGIDA: /sales/detalles-ventas-servicios
      const response = await axiosInstance.post("/sales/detalles-ventas-servicios", detalleData)
      return response.data
    } catch (error) {
      console.error("Error al crear detalle de servicio:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de servicio existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Datos del detalle actualizado
   */
  updateDetalleServicio: async (id, detalleData) => {
    try {
      // Asegurarse de que el detalle de servicio tenga un IdMascota válido
      if (!detalleData.IdMascota && detalleData.IdMascota !== 0) {
        console.log(
          "Detalle de servicio sin IdMascota en actualización, asignando mascota genérica (ID 1):",
          detalleData,
        )
        detalleData.IdMascota = 1
      }

      // ✅ RUTA CORREGIDA: /sales/detalles-ventas-servicios/:id
      const response = await axiosInstance.put(`/sales/detalles-ventas-servicios/${id}`, detalleData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de servicio
   * @param {number} id - ID del detalle a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteDetalleServicio: async (id) => {
    try {
      // ✅ RUTA CORREGIDA: /sales/detalles-ventas-servicios/:id
      const response = await axiosInstance.delete(`/sales/detalles-ventas-servicios/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * ✅ FUNCIÓN ACTUALIZADA: Registra una devolución de venta CON VALIDACIÓN
   * @param {Object} devolucionData - Datos de la devolución
   * @returns {Promise<Object>} Resultado de la operación
   */
  registrarDevolucion: async (devolucionData) => {
    try {
      console.log("🔄 Iniciando registro de devolución con validación")

      // ✅ NUEVA VALIDACIÓN: Verificar productos antes de procesar la devolución
      if (devolucionData.detallesProductos && devolucionData.detallesProductos.length > 0) {
        console.log("🔍 Validando productos para devolución...")

        for (const producto of devolucionData.detallesProductos) {
          try {
            // Obtener información del producto
            const productoResponse = await axiosInstance.get(`/products/productos/${producto.IdProducto}`)
            const productoInfo = productoResponse.data

            if (!productoInfo || !productoInfo.Estado) {
              const error = `Producto ${producto.IdProducto} no disponible para devolución`
              VentasService.mostrarAlertaErrorDevolucion([error])
              throw new Error(error)
            }

            console.log(`✅ Producto validado para devolución: ${productoInfo.NombreProducto}`)
          } catch (error) {
            console.error(`Error validando producto para devolución ${producto.IdProducto}:`, error)
            throw error
          }
        }

        console.log("✅ Validación de devolución exitosa")
      }

      // Intentar obtener el usuario logueado del localStorage
      let usuarioLogueado = null
      try {
        const userData = localStorage.getItem("userData")
        if (userData) {
          usuarioLogueado = JSON.parse(userData)
          console.log("Usuario logueado encontrado para devolución:", usuarioLogueado)
        }
      } catch (userError) {
        console.warn("Error al obtener usuario logueado para devolución:", userError)
      }

      // Asegurarse de que todos los valores numéricos sean realmente números
      // y que la estructura sea exactamente igual a la que funciona en Postman
      const datosFormateados = {
        venta: {
          IdCliente: Number(devolucionData.venta.IdCliente),
          // Usar el ID del usuario logueado si está disponible
          IdUsuario: usuarioLogueado
            ? Number(usuarioLogueado.IdUsuario || usuarioLogueado.id)
            : Number(devolucionData.venta.IdUsuario),
          FechaVenta: devolucionData.venta.FechaVenta,
          Subtotal: Number(devolucionData.venta.Subtotal),
          TotalIva: Number(devolucionData.venta.TotalIva || 0),
          TotalMonto: Number(devolucionData.venta.TotalMonto),
          NotasAdicionales: devolucionData.venta.NotasAdicionales,
          // Usar el estado seleccionado por el usuario
          Estado: "Efectiva",
          Tipo: "Devolucion",
          IdVentaOriginal: Number(devolucionData.venta.IdVentaOriginal),
          // Asegurar que siempre se envíe el método de pago
          MetodoPago: devolucionData.venta.MetodoPago || "efectivo",
        },
        detallesProductos: devolucionData.detallesProductos.map((p) => ({
          IdProducto: Number(p.IdProducto),
          Cantidad: Number(p.Cantidad),
          PrecioUnitario: Number(p.PrecioUnitario),
          IvaUnitario: Number(p.IvaUnitario || 0),
        })),
      }

      console.log("Enviando datos de devolución:", JSON.stringify(datosFormateados, null, 2))

      // ✅ RUTA CORREGIDA: /sales/devoluciones
      const response = await axiosInstance.post("/sales/devoluciones", datosFormateados, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Respuesta del servidor:", response.data)

      // ✅ MOSTRAR ALERTA DE ÉXITO
      setTimeout(() => {
        VentasService.mostrarAlertaExitoDevolucion({
          IdVentaOriginal: devolucionData.venta?.IdVentaOriginal,
          TotalMonto: devolucionData.venta?.TotalMonto,
          cliente: "Cliente",
        })
      }, 500)

      return response.data
    } catch (error) {
      console.error("Error al registrar devolución:", error)

      // Si es un error de validación, no mostrar toast adicional (ya se mostró la alerta)
      if (error.message && error.message.includes("no disponible para devolución")) {
        throw error
      }

      // Mostrar más detalles del error
      if (error.response) {
        console.error("Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      }

      throw error
    }
  },

  /**
   * ✅ FUNCIÓN AUXILIAR: Mostrar alerta de error en devolución
   * @param {Array} errores - Array de mensajes de error
   */
  mostrarAlertaErrorDevolucion: (errores) => {
    if (errores.length === 0) return

    const modalHtml = `
      <div class="modal fade" id="errorDevolucionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-warning shadow-lg">
            <div class="modal-header bg-warning text-dark">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-circle me-2"></i>
                ⚠️ No se puede procesar la devolución
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-undo-alt me-2"></i>
                  Problemas detectados en la devolución:
                </h6>
                <div class="error-list">
                  ${errores
                    .map(
                      (error) => `
                    <div class="mb-2 p-3 bg-light rounded border-left-warning">
                      <pre class="mb-0 text-dark" style="white-space: pre-wrap; font-family: inherit;">${error}</pre>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Por favor, verifique los productos y el estado del inventario.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-warning btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("errorDevolucionModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("errorDevolucionModal"))
    modal.show()

    // Limpiar modal después de cerrarlo
    document.getElementById("errorDevolucionModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  },

  /**
   * ✅ FUNCIÓN AUXILIAR: Mostrar alerta de éxito en devolución
   * @param {Object} datos - Datos de la devolución procesada
   */
  mostrarAlertaExitoDevolucion: (datos = {}) => {
    const ventaId = datos.IdVentaOriginal || datos.ventaId || "N/A"
    const nuevaFactura = datos.IdVentaNueva || datos.idDevolucion || datos.IdVentaDevolucion || "N/A"
    const montoTotal = datos.TotalMonto || datos.total || 0
    const cliente = datos.cliente || "Cliente"
    const productosDevueltos = datos.productosDevueltos || []
    const productosCambio = datos.productosCambio || []

    const productosDevueltosHtml = productosDevueltos.length
      ? `<li><strong>Productos devueltos:</strong> ${productosDevueltos.map(p => `${p.Cantidad}x ${p.NombreProducto || p.IdProducto}`).join(", ")}</li>`
      : ""
    const productosCambioHtml = productosCambio.length
      ? `<li><strong>Productos en cambio:</strong> ${productosCambio.map(p => `${p.Cantidad}x ${p.NombreProducto || p.IdProducto}`).join(", ")}</li>`
      : ""

    const modalHtml = `
      <div class="modal fade" id="exitoDevolucionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-success shadow-lg">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">
                <i class="fas fa-check-circle me-2"></i>
                ✅ ¡Devolución Procesada Exitosamente!
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-success border-0 mb-3">
                <h6 class="alert-heading mb-3">
                  <i class="fas fa-thumbs-up me-2"></i>
                  La devolución ha sido registrada correctamente en el sistema
                </h6>
                <ul class="list-unstyled mt-2 mb-0">
                  <li><strong>Venta original:</strong> #${ventaId}</li>
                  <li><strong>Nueva factura devolución:</strong> #${nuevaFactura}</li>
                  <li><strong>Cliente:</strong> ${cliente}</li>
                  <li><strong>Monto devuelto:</strong> $${montoTotal.toLocaleString("es-CO")}</li>
                  ${productosDevueltosHtml}
                  ${productosCambioHtml}
                  <li><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</li>
                </ul>
              </div>
              <div class="bg-light p-3 rounded">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  El inventario ha sido actualizado automáticamente y la devolución queda registrada en el historial.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success btn-lg" data-bs-dismiss="modal">
                <i class="fas fa-arrow-right me-1"></i>
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remover modal anterior si existe
    const existingModal = document.getElementById("exitoDevolucionModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modalElement = document.getElementById("exitoDevolucionModal")
    const modal = new bootstrap.Modal(modalElement)
    modal.show()

    // Limpiar modal después de cerrarlo
    modalElement.addEventListener("hidden.bs.modal", function () {
      this.remove()
    })

    console.log("✅ Alerta de éxito de devolución mostrada")
  },

  /**
   * Busca un producto por su código de barras
   * @param {string} codigoBarras - Código de barras a buscar
   * @returns {Promise<Object|null>} Producto encontrado o null si no existe
   */
  buscarProductoPorCodigoBarras: async (codigoBarras) => {
    try {
      console.log(`Buscando producto con código de barras: ${codigoBarras}`)

      // Intentar obtener el producto directamente desde el endpoint específico
      try {
        // ✅ RUTA CORREGIDA: /products/productos/codigo/:codigo
        const response = await axiosInstance.get(`/products/productos/codigo/${codigoBarras}`)
        if (response.data) {
          console.log("Producto encontrado por código de barras:", response.data)
          return response.data
        }
      } catch (directError) {
        console.warn("No se encontró el producto directamente, intentando búsqueda alternativa:", directError.message)
      }

      // Si no hay un endpoint específico, buscar en todos los productos
      // ✅ RUTA CORREGIDA: /products/productos
      const todosLosProductos = await axiosInstance.get("/products/productos")

      if (Array.isArray(todosLosProductos.data)) {
        // Buscar el producto que coincida con el código de barras
        const productoEncontrado = todosLosProductos.data.find(
          (producto) =>
            (producto.codigoBarras && producto.codigoBarras === codigoBarras) ||
            (producto.CodigoBarras && producto.CodigoBarras === codigoBarras),
        )

        if (productoEncontrado) {
          console.log("Producto encontrado en la lista completa:", productoEncontrado)
          return productoEncontrado
        }
      }

      console.log("No se encontró ningún producto con el código de barras:", codigoBarras)
      return null
    } catch (error) {
      console.error("Error al buscar producto por código de barras:", error)
      return null
    }
  },
}

export default VentasService
