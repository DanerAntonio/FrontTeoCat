import axios from "axios"

// Crear una instancia de axios con la URL base
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Limpiar localStorage y disparar evento de logout
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userData")
      localStorage.removeItem("userPermisos")
      window.dispatchEvent(new Event("logout"))
      window.dispatchEvent(new Event("storage"))
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
