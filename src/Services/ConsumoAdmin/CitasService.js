import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar las citas y servicios relacionados
 */
const CitasService = {
  // ==================== CITAS ====================
  /**
   * Obtiene todas las citas
   * @returns {Promise} Promesa con los datos de las citas
   */
  obtenerCitas: async () => {
    try {
      const response = await axiosInstance.get("/appointments/citas")
      console.log("Respuesta de obtenerCitas:", response.data)
      
      // Procesar las citas para asegurar que tengan el precio total calculado
      const citasConPrecio = await Promise.all(response.data.map(async (cita) => {
        // Si la cita ya tiene servicios con precios, calcular el total
        if (cita.servicios && cita.servicios.length > 0) {
          const precioTotal = cita.servicios.reduce((total, servicio) => 
            total + (parseFloat(servicio.Precio) || 0), 0);
          return { ...cita, PrecioTotal: precioTotal };
        }
        
        // Si no tiene servicios en la respuesta, intentar obtenerlos
        try {
          const serviciosResponse = await axiosInstance.get(`/appointments/citas/${cita.IdCita}/servicios`);
          if (serviciosResponse.data && serviciosResponse.data.length > 0) {
            const precioTotal = serviciosResponse.data.reduce((total, servicio) => 
              total + (parseFloat(servicio.Precio) || 0), 0);
            return { ...cita, PrecioTotal: precioTotal, servicios: serviciosResponse.data };
          }
        } catch (err) {
          console.error(`Error al obtener servicios para la cita ${cita.IdCita}:`, err);
        }
        
        // Si no se pudo calcular el precio, usar el que viene del backend o 0
        return { ...cita, PrecioTotal: cita.PrecioTotal || 0 };
      }));
      
      return citasConPrecio;
    } catch (error) {
      console.error("Error al obtener citas:", error)
      throw error
    }
  },

  /**
   * Crea una nueva cita
   * @param {Object} citaData - Datos de la cita a crear
   * @returns {Promise} Promesa con la respuesta de la creación
   */
  crearCita: async (citaData) => {
    try {
      // Formatear los datos según lo que espera el controlador
      // El controlador espera un objeto con propiedades "cita" y "servicios"
      
      // Formatear fecha y hora en el formato correcto: YYYY-MM-DD HH:MM:SS
      // Asegurarse de que la fecha esté en formato YYYY-MM-DD
      let fecha = citaData.Fecha || citaData.fecha;
      if (fecha.includes('T')) {
        fecha = fecha.split('T')[0];
      }
      
      // Asegurarse de que la hora esté en formato HH:MM
      let hora = citaData.hora;
      if (hora.length > 5) {
        hora = hora.substring(0, 5);
      }
      
      const fechaHora = `${fecha} ${hora}:00`; // Formato: YYYY-MM-DD HH:MM:SS
      
      // Calcular el precio total de los servicios
      const precioTotal = citaData.servicios ? citaData.servicios.reduce((total, servicio) => 
        total + (parseFloat(servicio.precio) || 0), 0) : 0;
      
      const datosFormateados = {
        cita: {
          IdCliente: citaData.IdCliente,
          IdMascota: citaData.IdMascota,
          Fecha: fechaHora,
          NotasAdicionales: citaData.NotasAdicionales || "",
          Estado: citaData.Estado || "Programada",
          PrecioTotal: precioTotal // Añadir el precio total calculado
        },
        servicios: citaData.servicios ? citaData.servicios.map(servicio => ({
          IdServicio: servicio.IdServicio || servicio.id,
          Precio: servicio.precio || servicio.Precio // Asegurarse de enviar el precio
        })) : []
      };
      
      console.log("Datos enviados al crear cita:", datosFormateados);
      const response = await axiosInstance.post("/appointments/citas", datosFormateados);
      
      // Asegurarse de que la respuesta tenga el precio total
      if (response.data && response.data.cita) {
        if (!response.data.cita.PrecioTotal && response.data.servicios && response.data.servicios.length > 0) {
          response.data.cita.PrecioTotal = response.data.servicios.reduce((total, servicio) => 
            total + (parseFloat(servicio.Precio) || 0), 0);
        }
      }
      
      console.log("Respuesta al crear cita:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear la cita:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  },

  /**
   * Actualiza una cita existente
   * @param {number} id - ID de la cita a actualizar
   * @param {Object} citaData - Nuevos datos de la cita
   * @returns {Promise} Promesa con la respuesta de la actualización
   */
  actualizarCita: async (id, citaData) => {
    try {
      // Formatear los datos según lo que espera el controlador
      // Formatear fecha y hora en el formato correcto: YYYY-MM-DD HH:MM:SS
      let fecha = citaData.Fecha || citaData.fecha;
      if (fecha.includes('T')) {
        fecha = fecha.split('T')[0];
      }
      
      // Asegurarse de que la hora esté en formato HH:MM
      let hora = citaData.hora;
      if (hora.length > 5) {
        hora = hora.substring(0, 5);
      }
      
      const fechaHora = `${fecha} ${hora}:00`; // Formato: YYYY-MM-DD HH:MM:SS
      
      // Calcular el precio total de los servicios
      const precioTotal = citaData.servicios ? citaData.servicios.reduce((total, servicio) => 
        total + (parseFloat(servicio.precio) || 0), 0) : 0;
      
      const datosFormateados = {
        cita: {
          IdCliente: citaData.IdCliente,
          IdMascota: citaData.IdMascota,
          Fecha: fechaHora,
          NotasAdicionales: citaData.NotasAdicionales || "",
          Estado: citaData.Estado || "Programada",
          PrecioTotal: precioTotal // Añadir el precio total calculado
        },
        servicios: citaData.servicios ? citaData.servicios.map(servicio => ({
          IdServicio: servicio.IdServicio || servicio.id,
          Precio: servicio.precio || servicio.Precio // Asegurarse de enviar el precio
        })) : []
      };
      
      console.log(`Actualizando cita ID ${id} con datos:`, datosFormateados);
      const response = await axiosInstance.put(`/appointments/citas/${id}`, datosFormateados);
      
      // Asegurarse de que la respuesta tenga el precio total
      if (response.data && response.data.cita) {
        if (!response.data.cita.PrecioTotal && response.data.servicios && response.data.servicios.length > 0) {
          response.data.cita.PrecioTotal = response.data.servicios.reduce((total, servicio) => 
            total + (parseFloat(servicio.Precio) || 0), 0);
        }
      }
      
      console.log("Respuesta al actualizar cita:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la cita ${id}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  },

  /**
   * Cambia el estado de una cita
   * @param {number} id - ID de la cita
   * @param {string} estado - Nuevo estado ('Programada', 'Completada', 'Cancelada')
   * @returns {Promise} Promesa con la respuesta del cambio de estado
   */
  cambiarEstadoCita: async (id, estado) => {
    try {
      console.log(`Cambiando estado de cita ID ${id} a ${estado}`);
      // Corregir la ruta para que coincida con la definida en appointment.routes.js
      const response = await axiosInstance.patch(`/appointments/citas/${id}/status`, { Estado: estado });
      console.log("Respuesta al cambiar estado:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar el estado de la cita ${id}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      throw error;
    }
  },

  // ==================== CITAS SERVICIO ====================
  /**
   * Agrega un servicio a una cita
   * @param {number} idCita - ID de la cita
   * @param {number} idServicio - ID del servicio a agregar
   * @returns {Promise} Promesa con la respuesta de la adición
   */
  agregarServicioACita: async (idCita, idServicio) => {
    try {
      console.log(`Agregando servicio ${idServicio} a cita ${idCita}`);
      const response = await axiosInstance.post(`/appointments/citas/${idCita}/servicios/${idServicio}`);
      console.log("Respuesta al agregar servicio a cita:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al agregar servicio a la cita ${idCita}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      throw error;
    }
  },

  // ==================== CLIENTES ====================
  /**
   * Obtiene todos los clientes
   * @returns {Promise} Promesa con los datos de los clientes
   */
  obtenerClientes: async () => {
    try {
      const response = await axiosInstance.get("/customers/clientes");
      console.log("Respuesta de obtenerClientes:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      throw error;
    }
  },

  // ==================== MASCOTAS ====================
  /**
   * Obtiene las mascotas de un cliente específico
   * @param {number} idCliente - ID del cliente
   * @returns {Promise} Promesa con los datos de las mascotas
   */
  obtenerMascotasPorCliente: async (idCliente) => {
    console.log(`Intentando obtener mascotas para cliente ID: ${idCliente}`);
    
    try {
      // Primer intento: ruta directa para mascotas por cliente
      console.log("Usando ruta /customers/clientes/:id/mascotas");
      const response = await axiosInstance.get(`/customers/clientes/${idCliente}/mascotas`);
      console.log("Mascotas obtenidas correctamente:", response.data);
      return response.data;
    } catch (error1) {
      console.log("Error en primer intento:", error1.message);

      try {
        // Segundo intento: ruta alternativa
        console.log("Intento alternativo: Usando ruta /customers/mascotas/cliente/");
        const response = await axiosInstance.get(`/customers/mascotas/cliente/${idCliente}`);
        console.log("Mascotas obtenidas correctamente (Intento alternativo):", response.data);
        return response.data;
      } catch (error2) {
        console.error(`Error al obtener mascotas del cliente ${idCliente}:`, error2);
        // Devolver array vacío en caso de error para evitar errores en la UI
        return [];
      }
    }
  },

  // ==================== SERVICIOS ====================
  /**
   * Obtiene todos los servicios disponibles
   * @returns {Promise} Promesa con los datos de los servicios
   */
  obtenerServicios: async () => {
    try {
      // Usar la ruta correcta como en serviciosService.js
      const response = await axiosInstance.get("/services/servicios");
      
      // Manejar diferentes estructuras de respuesta
      if (response.data && Array.isArray(response.data)) {
        console.log("Servicios obtenidos correctamente:", response.data);
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log("Servicios obtenidos correctamente (en data.data):", response.data.data);
        return response.data.data;
      } else {
        console.log("No se encontraron servicios, devolviendo array vacío");
        return [];
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  },
  
  /**
   * Obtiene los servicios asociados a una cita específica
   * @param {number} idCita - ID de la cita
   * @returns {Promise} Promesa con los datos de los servicios de la cita
   */
  obtenerServiciosPorCita: async (idCita) => {
    try {
      const response = await axiosInstance.get(`/appointments/citas/${idCita}/servicios`);
      console.log(`Servicios de la cita ${idCita}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicios de la cita ${idCita}:`, error);
      return [];
    }
  },
  
  /**
   * Calcula el precio total de una cita basado en sus servicios
   * @param {number} idCita - ID de la cita
   * @returns {Promise<number>} Promesa con el precio total calculado
   */
  calcularPrecioTotal: async (idCita) => {
    try {
      const servicios = await CitasService.obtenerServiciosPorCita(idCita);
      const precioTotal = servicios.reduce((total, servicio) => 
        total + (parseFloat(servicio.Precio) || 0), 0);
      console.log(`Precio total calculado para cita ${idCita}: $${precioTotal}`);
      return precioTotal;
    } catch (error) {
      console.error(`Error al calcular precio total de la cita ${idCita}:`, error);
      return 0;
    }
  }
};

export default CitasService;