// CarritoService.js - CORREGIDO para manejar datos del cliente
class CarritoService {
  constructor() {
    this.storageKey = "teocat_carrito"
    this.discountKey = "teocat_descuento"
  }

  // ✅ MÉTODO MEJORADO para obtener datos del usuario
  getUserData() {
    try {
      // Intentar obtener de "user" primero
      let userData = JSON.parse(localStorage.getItem("user") || "{}")

      // Si no tiene IdCliente, intentar con "userData"
      if (!userData.IdCliente && !userData.idCliente) {
        const fallbackUserData = JSON.parse(localStorage.getItem("userData") || "{}")
        if (fallbackUserData.IdCliente || fallbackUserData.idCliente) {
          userData = fallbackUserData
        }
      }

      return userData
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      return {}
    }
  }

  // ✅ MÉTODO MEJORADO para validar cliente
  validateClientData() {
    const userData = this.getUserData()

    const idCliente = userData.IdCliente || userData.idCliente
    const idUsuario = userData.IdUsuario || userData.idUsuario || userData.id

    console.log("Validando datos del cliente:", {
      userData,
      idCliente,
      idUsuario,
      hasClientError: userData.hasClientError,
    })

    if (!idCliente) {
      if (userData.hasClientError) {
        throw new Error(
          `Error de sincronización: ${userData.clientError || "Tu cuenta no está vinculada a un cliente"}. Por favor, contacta soporte.`,
        )
      } else {
        throw new Error("Tu cuenta no está vinculada a un cliente. Por favor, cierra sesión y vuelve a iniciar sesión.")
      }
    }

    if (!idUsuario) {
      throw new Error("Error de autenticación. Por favor, inicia sesión nuevamente.")
    }

    return { idCliente, idUsuario, userData }
  }

  // Resto de métodos sin cambios hasta checkout...

  // ✅ MÉTODO CHECKOUT CORREGIDO
  async checkout(checkoutData) {
    try {
      // Validar datos de entrada
      if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        throw new Error("No hay productos en el carrito")
      }

      if (!checkoutData.clientData) {
        throw new Error("Datos del cliente requeridos")
      }

      if (!checkoutData.clientData.nombre || !checkoutData.clientData.apellido) {
        throw new Error("Nombre y apellido del cliente son requeridos")
      }

      if (!checkoutData.clientData.email || !/\S+@\S+\.\S+/.test(checkoutData.clientData.email)) {
        throw new Error("Email válido es requerido")
      }

      if (!checkoutData.clientData.telefono) {
        throw new Error("Teléfono es requerido")
      }

      if (!checkoutData.clientData.direccion) {
        throw new Error("Dirección es requerida")
      }

      if (!checkoutData.comprobantePago) {
        throw new Error("Comprobante de pago es requerido")
      }

      // ✅ OBTENER DATOS DEL USUARIO CON VALIDACIÓN MEJORADA
      let userData = JSON.parse(localStorage.getItem("user") || "{}")

      // Si no hay datos en "user", intentar con "userData"
      if (!userData.IdCliente && !userData.idCliente) {
        const fallbackUserData = JSON.parse(localStorage.getItem("userData") || "{}")
        if (fallbackUserData.IdCliente || fallbackUserData.idCliente) {
          userData = fallbackUserData
        }
      }

      console.log("Datos del usuario para checkout:", userData)

      // ✅ VALIDACIÓN MEJORADA DE CLIENTE
      let idCliente = userData.IdCliente || userData.idCliente
      const idUsuario = userData.IdUsuario || userData.idUsuario || userData.id

      // Si no tenemos IdCliente, intentar obtenerlo del servidor
      if (!idCliente && idUsuario) {
        console.log("🔍 Intentando obtener IdCliente del servidor para usuario:", idUsuario)

        try {
          const token = localStorage.getItem("token")
          const response = await fetch(`http://localhost:3000/api/customers/usuario/${idUsuario}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const clienteData = await response.json()
            idCliente = clienteData.IdCliente

            // Actualizar localStorage con los datos completos del cliente
            const updatedUserData = {
              ...userData,
              IdCliente: clienteData.IdCliente,
              Nombre: clienteData.Nombre,
              Apellido: clienteData.Apellido,
              Documento: clienteData.Documento,
              Correo: clienteData.Correo,
              Telefono: clienteData.Telefono,
              Direccion: clienteData.Direccion,
            }

            localStorage.setItem("user", JSON.stringify(updatedUserData))
            console.log("✅ Datos del cliente actualizados desde el servidor")
          } else {
            console.error("❌ Error al obtener cliente del servidor:", response.status)
          }
        } catch (fetchError) {
          console.error("❌ Error de conexión al obtener cliente:", fetchError)
        }
      }

      if (!idCliente) {
        console.error("❌ No se encontró IdCliente después de todas las validaciones:", {
          userData,
          idUsuario,
          localStorage_user: localStorage.getItem("user"),
          localStorage_userData: localStorage.getItem("userData"),
        })
        throw new Error("Tu cuenta no está vinculada a un cliente. Por favor, cierra sesión y vuelve a iniciar sesión.")
      }

      if (!idUsuario) {
        console.error("❌ No se encontró IdUsuario en userData:", userData)
        throw new Error("Error de autenticación. Por favor, inicia sesión nuevamente.")
      }

      console.log("✅ Validación de cliente exitosa:", { idCliente, idUsuario })

      // Preparar datos para enviar a la API
      const ventaData = {
        venta: {
          IdCliente: idCliente,
          IdUsuario: idUsuario,
          TipoVenta: "Producto",
          Estado: "Pendiente", // <-- SIEMPRE PENDIENTE para transferencia
          FechaVenta: new Date().toISOString(),
          Subtotal: checkoutData.subtotal || 0,
          TotalIva: checkoutData.iva || 0,
          TotalMonto: checkoutData.total || 0,
          Descuento: checkoutData.discount || 0,
          CostoEnvio: checkoutData.shipping || 0,
          NotasAdicionales: checkoutData.clientData.notas || "",
          MetodoPago: "Transferencia",
          origen: "carrito", // <--- AGREGADO AQUÍ
        },
        detallesProductos: checkoutData.items.map((item) => ({
          IdProducto: item.id,
          Cantidad: item.quantity || 1,
          PrecioUnitario: item.price || 0,
          Subtotal: (item.price || 0) * (item.quantity || 1),
        })),
        detallesServicios: [],
        comprobantePago: checkoutData.comprobantePago, // ✅ Usa comprobantePago
      }

      console.log("✅ Datos de venta a enviar:", ventaData)

      // Crear FormData para enviar archivo
      const formData = new FormData()
      formData.append("ventaData", JSON.stringify(ventaData))
      if (checkoutData.comprobantePago) {
        formData.append("comprobanteUrl", checkoutData.comprobantePago) // <--- CAMBIA AQUÍ
      }

      // Obtener token de autenticación
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
      }

      // Enviar a la API
      const response = await fetch("http://localhost:3000/api/carrito/crear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // No pongas Content-Type aquí, fetch lo gestiona automáticamente para FormData
        },
        body: formData,
      })

      console.log("JSON enviado:", {
        ...ventaData,
        comprobanteUrl: checkoutData.comprobantePago,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Limpiar carrito después de compra exitosa
        await this.clearCart()

        return {
          success: true,
          data: {
            id: result.ventaId || Date.now(),
            date: new Date().toISOString(),
            clientData: checkoutData.clientData,
            subtotal: checkoutData.subtotal,
            iva: checkoutData.iva,
            shipping: checkoutData.shipping,
            discount: checkoutData.discount,
            total: checkoutData.total,
          },
        }
      } else {
        this.saveFailedOrder(checkoutData)
        throw new Error(result.message || "Error al procesar el pedido")
      }
    } catch (error) {
      console.error("❌ Error en checkout:", error)
      this.saveFailedOrder(checkoutData)

      return {
        success: false,
        message: error.message || "Error de conexión. El pedido se guardó localmente para reintento.",
      }
    }
  }

  // Resto de métodos sin cambios...
  async getAll() {
    try {
      const items = JSON.parse(localStorage.getItem(this.storageKey) || "[]")
      return items.filter((item) => item && item.id && item.name && typeof item.price === "number")
    } catch (error) {
      console.error("Error al obtener items del carrito:", error)
      return []
    }
  }

  async addItem(producto, cantidad = 1) {
    try {
      const cart = await this.getAll()

      if (!producto || (!producto.IdProducto && !producto.id)) {
        throw new Error("Producto inválido: falta ID")
      }

      const id = producto.IdProducto ?? producto.id
      const name = producto.NombreProducto ?? producto.name ?? "Producto sin nombre"
      const price = Number(producto.PrecioVenta ?? producto.price ?? 0)
      const image = producto.Foto ?? producto.image ?? "/placeholder.svg?height=60&width=60&text=Producto"
      const category = producto.CategoriaNombre ?? producto.category ?? ""
      const stock = Number(producto.Stock ?? producto.stock ?? 0)

      if (isNaN(price) || price < 0) {
        throw new Error("Precio del producto inválido")
      }

      const existingItemIndex = cart.findIndex((item) => item.id === id)

      if (existingItemIndex > -1) {
        // Suma la cantidad seleccionada, pero no excedas el stock
        const nuevaCantidad = cart[existingItemIndex].quantity + cantidad
        if (nuevaCantidad > stock && stock > 0) {
          throw new Error(`Stock insuficiente. Disponible: ${stock}`)
        }
        cart[existingItemIndex].quantity = nuevaCantidad
      } else {
        if (cantidad > stock && stock > 0) {
          throw new Error(`Stock insuficiente. Disponible: ${stock}`)
        }
        const newItem = {
          id,
          name,
          price,
          image,
          category,
          quantity: cantidad,
          stock,
          addedAt: new Date().toISOString(),
        }
        cart.push(newItem)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }))

      return { success: true, message: "Producto agregado al carrito" }
    } catch (error) {
      console.error("Error al agregar al carrito:", error)
      return { success: false, message: error.message || "Error al agregar producto al carrito" }
    }
  }

  async updateQuantity(id, newQuantity) {
    try {
      if (newQuantity < 1) {
        return await this.removeItem(id)
      }

      const cart = await this.getAll()
      const itemIndex = cart.findIndex((item) => item.id === id)

      if (itemIndex > -1) {
        const item = cart[itemIndex]

        if (item.stock > 0 && newQuantity > item.stock) {
          throw new Error(`Stock insuficiente. Disponible: ${item.stock}`)
        }

        cart[itemIndex].quantity = newQuantity
        localStorage.setItem(this.storageKey, JSON.stringify(cart))

        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }))

        return { success: true }
      }

      return { success: false, message: "Producto no encontrado en el carrito" }
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      return { success: false, message: error.message || "Error al actualizar cantidad" }
    }
  }

  async removeItem(id) {
    try {
      let items = JSON.parse(localStorage.getItem(this.storageKey) || "[]")
      items = items.filter((item) => item.id !== id)

      if (items.length === 0) {
        localStorage.removeItem(this.storageKey)
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(items))
      }

      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: items }))

      return { success: true }
    } catch (error) {
      console.error("Error al eliminar item:", error)
      return { success: false, message: "Error al eliminar producto del carrito" }
    }
  }

  async clearCart() {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.discountKey)

      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: [] }))

      return { success: true }
    } catch (error) {
      console.error("Error al vaciar carrito:", error)
      return { success: false, message: "Error al vaciar carrito" }
    }
  }

  async getTotalItems() {
    try {
      const cart = await this.getAll()
      return cart.reduce((total, item) => total + (item.quantity || 0), 0)
    } catch (error) {
      console.error("Error al obtener total de items:", error)
      return 0
    }
  }

  async applyDiscount(code) {
    try {
      const discountCodes = {
        TEOCAT10: { discount: 10000, message: "Descuento de $10.000 aplicado" },
        PRIMERAVEZ: { discount: 15000, message: "Descuento de primera compra aplicado" },
        MASCOTA20: { discount: 20000, message: "Descuento especial mascotas aplicado" },
      }

      const discountInfo = discountCodes[code.toUpperCase()]

      if (discountInfo) {
        const discountData = {
          code: code.toUpperCase(),
          amount: discountInfo.discount,
          message: discountInfo.message,
        }

        localStorage.setItem(this.discountKey, JSON.stringify(discountData))
        return { success: true, ...discountInfo }
      } else {
        return { success: false, message: "Código de descuento inválido" }
      }
    } catch (error) {
      console.error("Error al aplicar descuento:", error)
      return { success: false, message: "Error al aplicar descuento" }
    }
  }

  getAppliedDiscount() {
    try {
      const discountData = localStorage.getItem(this.discountKey)
      return discountData ? JSON.parse(discountData) : null
    } catch (error) {
      console.error("Error al obtener descuento:", error)
      return null
    }
  }

  saveFailedOrder(orderData) {
    try {
      const failedOrders = JSON.parse(localStorage.getItem("teocat_failed_orders") || "[]")
      failedOrders.push({
        ...orderData,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      })
      localStorage.setItem("teocat_failed_orders", JSON.stringify(failedOrders))
    } catch (error) {
      console.error("Error al guardar pedido fallido:", error)
    }
  }

  getFailedOrders() {
    try {
      return JSON.parse(localStorage.getItem("teocat_failed_orders") || "[]")
    } catch (error) {
      console.error("Error al obtener pedidos fallidos:", error)
      return []
    }
  }

  async retryFailedOrder(orderId) {
    try {
      const failedOrders = this.getFailedOrders()
      const orderIndex = failedOrders.findIndex((order) => order.id === orderId)

      if (orderIndex === -1) {
        return { success: false, message: "Pedido no encontrado" }
      }

      const orderData = failedOrders[orderIndex]
      const result = await this.checkout(orderData)

      if (result.success) {
        failedOrders.splice(orderIndex, 1)
        localStorage.setItem("teocat_failed_orders", JSON.stringify(failedOrders))
      }

      return result
    } catch (error) {
      console.error("Error al reintentar pedido:", error)
      return { success: false, message: "Error al reintentar pedido" }
    }
  }
}

export default new CarritoService()
