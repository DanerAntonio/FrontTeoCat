import axiosInstance from "../ConsumoAdmin/axios.js";
const API_URL = "/api/resenas/public/productos";

const ResenasService = {
  async crearResenaProducto(data) {
    return axiosInstance.post(API_URL, data);
  },
  async obtenerResenasProducto(idProducto) {
    return axiosInstance.get(`${API_URL}?idProducto=${idProducto}`);
  }
};

export default ResenasService;