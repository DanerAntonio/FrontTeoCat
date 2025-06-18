import axios from "./axios"

const AUTH_URL = "/auth"

const authService = {
  // Iniciar sesión
  login: async (correo, password) => {
    try {
      const response = await axios.post(`${AUTH_URL}/login`, { correo, password })

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)

        // Determinar el rol basado en la respuesta de la API
        // Si el rol.id es 1, es superadmin, si es 2 es cliente, cualquier otro es admin
        const rolId = response.data.usuario.rol.id
        if (rolId === 1) {
          localStorage.setItem("userRole", "admin") // Super Admin se trata como admin
        } else if (rolId === 2) {
          localStorage.setItem("userRole", "cliente")
        } else {
          localStorage.setItem("userRole", "admin") // Otros roles se tratan como admin
        }

        localStorage.setItem("userData", JSON.stringify(response.data.usuario))

        // Guardar permisos del usuario
        if (response.data.usuario.permisos) {
          localStorage.setItem("userPermisos", JSON.stringify(response.data.usuario.permisos))
        }

        // Disparar evento para actualizar el estado en RolRoutes
        window.dispatchEvent(new Event("storage"))

        // Obtener el usuario autenticado
        const usuario = response.data.usuario

        // Llamar al backend para obtener el cliente asociado a ese usuario
        try {
          const clienteResp = await axios.get(`/clientes/usuario/${usuario.id}`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          })
          const clienteData = clienteResp.data

          // Guardar el usuario con IdCliente en localStorage
          const userWithCliente = {
            ...usuario,
            IdCliente: clienteData.IdCliente,
            Documento: clienteData.Documento,
            Nombre: clienteData.Nombre,
            Apellido: clienteData.Apellido,
            Correo: clienteData.Correo,
            Telefono: clienteData.Telefono,
            Direccion: clienteData.Direccion,
          }
          localStorage.setItem("user", JSON.stringify(userWithCliente))
        } catch (err) {
          // Si falla, igual guarda el usuario sin cliente
          localStorage.setItem("user", JSON.stringify(usuario))
        }
      }

      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error al iniciar sesión" }
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await axios.post(`${AUTH_URL}/logout`)
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // Siempre limpiar el localStorage y disparar evento de logout
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userData")
      localStorage.removeItem("userPermisos")

      // Disparar evento para actualizar el estado en RolRoutes
      window.dispatchEvent(new Event("logout"))
      window.dispatchEvent(new Event("storage"))
    }
  },

  // Registrar nuevo usuario
  register: async (userData) => {
    try {
      // Como el registro incluye una imagen, necesitamos usar FormData
      const formData = new FormData()

      // Mapear los campos del formulario a los campos esperados por la API
      formData.append("Documento", userData.document)
      formData.append("Nombre", userData.firstName)
      formData.append("Apellido", userData.lastName)
      formData.append("Correo", userData.email)
      formData.append("Password", userData.password)
      formData.append("Telefono", userData.phone)
      formData.append("Direccion", userData.address)

      const response = await axios.post(`${AUTH_URL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar usuario" }
    }
  },

  // Solicitar restablecimiento de contraseña
  requestPasswordReset: async (correo) => {
    try {
      const response = await axios.post(`${AUTH_URL}/request-reset`, { correo })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error al solicitar restablecimiento de contraseña" }
    }
  },

  // Reenviar correo de restablecimiento
  resendPasswordReset: async (correo) => {
    try {
      const response = await axios.post(`${AUTH_URL}/resend-reset`, { correo })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error al reenviar correo de restablecimiento" }
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${AUTH_URL}/reset-password`, {
        token,
        newPassword,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error al restablecer contraseña" }
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return localStorage.getItem("token") !== null
  },

  // Obtener el rol del usuario
  getUserRole: () => {
    return localStorage.getItem("userRole")
  },

  // Obtener datos del usuario
  getUserData: () => {
    const userData = localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : null
  },

  // Obtener permisos del usuario
  getUserPermisos: () => {
    const permisos = localStorage.getItem("userPermisos")
    return permisos ? JSON.parse(permisos) : []
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermiso: (nombrePermiso) => {
    const permisos = authService.getUserPermisos()
    return permisos.includes(nombrePermiso)
  },
}

export default authService
