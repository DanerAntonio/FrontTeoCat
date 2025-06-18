"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import NotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/NotificationCard"
import NotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/NotificationRow"
import ReviewNotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/ReviewNotificationCard"
import ReviewNotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/ReviewNotificationRow"
import PaymentReceiptCard from "../../../Components/AdminComponents/NotificacionesComponents/PaymentReceiptCard"
import PaymentReceiptRow from "../../../Components/AdminComponents/NotificacionesComponents/PaymentReceiptRow"
import CitasNotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/CitasNotificationCard"
import CitasNotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/CitasNotificationRow"
import notificacionesService from "../../../Services/ConsumoAdmin/NotificacionesService.js"
import reviewsService from "../../../Services/ConsumoAdmin/ReviewsService.js"
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary.js"
import ReseñasAdminService from "../../../Services/ConsumoCliente/ResenasService.js";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("cards") // "cards" o "list"
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const [imagenUrl, setImagenUrl] = useState("")
  const [imagenLoading, setImagenLoading] = useState(false)

  useEffect(() => {
    fetchNotificaciones()
  }, [])

  useEffect(() => {
    filtrarNotificaciones()
  }, [notificaciones, tipoFiltro, estadoFiltro])

  const fetchNotificaciones = async () => {
    setLoading(true)
    try {
      const data = await notificacionesService.getNotificaciones()
      // Mapeo para comprobante
      const notificacionesConComprobante = data.map((n) => ({
        ...n,
        comprobante:
          n.TipoNotificacion === "Comprobante" && n.Imagen
            ? { url: n.Imagen, tipo: n.Imagen.endsWith(".pdf") ? "pdf" : "img" }
            : undefined,
        numeroPedido: n.IdReferencia,
      }))
      setNotificaciones(notificacionesConComprobante)
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron cargar las notificaciones</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    } finally {
      setLoading(false)
    }
  }

  const filtrarNotificaciones = () => {
    let filtered = [...notificaciones]

    if (tipoFiltro !== "todos") {
      filtered = filtered.filter((n) => n.TipoNotificacion === tipoFiltro)
    }

    if (estadoFiltro !== "todos") {
      filtered = filtered.filter((n) => n.Estado === estadoFiltro)
    }

    setFilteredNotificaciones(filtered)
  }

  const cambiarEstadoNotificacion = async (id, nuevoEstado, notasAdicionales = "") => {
    try {
      // Validar estados permitidos
      const estadosValidos = ["Pendiente", "Vista", "Resuelta", "Aprobada", "Rechazada"];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado no válido: ${nuevoEstado}`);
      }

      const notificacion = notificaciones.find((n) => n.IdNotificacion === id);
      if (!notificacion) {
        throw new Error(`Notificación no encontrada: ${id}`);
      }

      // Validar reglas especiales
      if ((nuevoEstado === "Rechazada" || nuevoEstado === "Aprobada") && notificacion.TipoNotificacion !== "Comprobante") {
        throw new Error(`El estado ${nuevoEstado} solo es válido para notificaciones tipo Comprobante`);
      }

      if (nuevoEstado === "Rechazada" && !notasAdicionales.trim()) {
        throw new Error("Debes especificar un motivo para rechazar el comprobante.");
      }

      // ✅ Llamada correcta al backend
      if (nuevoEstado === "Vista") {
        await notificacionesService.markAsRead(id);
      } else if (nuevoEstado === "Resuelta") {
        await notificacionesService.markAsResolved(id);
      } else {
        await notificacionesService.changeEstadoNotificacion(id, {
          nuevoEstado,
          ...(notasAdicionales ? { motivo: notasAdicionales } : {}),
        });
      }

      // 🔁 Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.IdNotificacion === id) {
          return {
            ...notif,
            Estado: nuevoEstado,
            ...(notasAdicionales ? { notasAdicionales } : {}),
            ...(nuevoEstado === "Vista" ? { FechaVista: new Date() } : {}),
            ...(nuevoEstado === "Resuelta" ? { FechaResuelta: new Date() } : {}),
          };
        }
        return notif;
      });

      setNotificaciones(updatedNotificaciones);

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>
            Notificación {id} actualizada a <strong>{nuevoEstado}</strong>
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error(
        <div>
          <strong>Error</strong>
          <p>{error.message || "No se pudo actualizar el estado de la notificación"}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      await notificacionesService.markAllAsRead()

      // Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.Estado === "Pendiente") {
          return {
            ...notif,
            Estado: "Vista",
            FechaVista: new Date(),
          }
        }
        return notif
      })

      setNotificaciones(updatedNotificaciones)

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Todas las notificaciones han sido marcadas como leídas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron marcar todas las notificaciones como leídas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const eliminarNotificacionesAntiguas = async (dias = 30) => {
    try {
      await notificacionesService.deleteOldNotifications(dias)

      // Recargar las notificaciones después de eliminar
      fetchNotificaciones()

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Se han eliminado las notificaciones con más de {dias} días de antigüedad</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al eliminar notificaciones antiguas:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron eliminar las notificaciones antiguas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const crearNotificacion = async (notificacionData) => {
    try {
      const nuevaNotificacion = await notificacionesService.createNotificacion(notificacionData)

      // Actualizar el estado local añadiendo la nueva notificación
      setNotificaciones([nuevaNotificacion, ...notificaciones])

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Se ha creado una nueva notificación</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )

      return nuevaNotificacion
    } catch (error) {
      console.error("Error al crear notificación:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo crear la notificación</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
      throw error
    }
  }

  const eliminarResenaProducto = async (id) => {
    try {
      await reviewsService.deleteProductReview(id)

      // Actualizar el estado local
      // Buscar la notificación relacionada con esta reseña
      const notificacionesActualizadas = notificaciones.filter((notif) => {
        if (notif.TipoNotificacion === "ReseñaProducto" && notif.IdReferencia === id) {
          return false // Eliminar esta notificación
        }
        return true
      })

      setNotificaciones(notificacionesActualizadas)

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>La reseña ha sido eliminada</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo eliminar la reseña</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const handleAprobar = async (notificacionId) => {
     await notificacionesService.changeEstadoNotificacion(notificacionId, { nuevoEstado: "Aprobada" })
  }

  const handleRechazar = async (notificacionId, motivo) => {
    await notificacionesService.changeEstadoNotificacion(notificacionId, { nuevoEstado: "Rechazada", motivo })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, seleccione un archivo de imagen válido")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.")
      return
    }

    setImagenLoading(true)
    try {
      const url = await uploadImageToCloudinary(file, "notificaciones")
      setImagenUrl(url)
      toast.success("Imagen subida correctamente")
    } catch (error) {
      toast.error("No se pudo subir la imagen. Intenta nuevamente.")
    } finally {
      setImagenLoading(false)
    }
  }

  const aprobarResena = async (notificacion) => {
    try {
      if (notificacion.TipoNotificacion === "ReseñaProducto") {
        await ReseñasAdminService.aprobarResenaProducto(notificacion.IdReferencia, true);
      } else if (notificacion.TipoNotificacion === "ReseñaServicio") {
        await ReseñasAdminService.aprobarResenaServicio(notificacion.IdReferencia, true);
      } else if (notificacion.TipoNotificacion === "ReseñaGeneral") {
        await ReseñasAdminService.aprobarResenaGeneral(notificacion.IdReferencia, true);
      }
      fetchNotificaciones(); // refresca la lista
      alert("Reseña aprobada");
    } catch (error) {
      alert("Error al aprobar reseña");
    }
  };

  const rechazarResena = async (notificacion) => {
    try {
      if (notificacion.TipoNotificacion === "ReseñaProducto") {
        await ReseñasAdminService.aprobarResenaProducto(notificacion.IdReferencia, false);
      } else if (notificacion.TipoNotificacion === "ReseñaServicio") {
        await ReseñasAdminService.aprobarResenaServicio(notificacion.IdReferencia, false);
      } else if (notificacion.TipoNotificacion === "ReseñaGeneral") {
        await ReseñasAdminService.aprobarResenaGeneral(notificacion.IdReferencia, false);
      }
      fetchNotificaciones();
      alert("Reseña rechazada");
    } catch (error) {
      alert("Error al rechazar reseña");
    }
  };

  const renderNotificationComponent = (notificacion) => {
    switch (notificacion.TipoNotificacion) {
      case "StockBajo":
        return (
          <NotificationCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "Vencimiento":
        return (
          <NotificationCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return (
          <ReviewNotificationCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
            onDeleteReview={
              notificacion.TipoNotificacion === "ReseñaProducto"
                ? () => eliminarResenaProducto(notificacion.IdReferencia)
                : undefined
            }
          />
        )
      case "Comprobante":
        return (
          <PaymentReceiptCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "Cita":
        return (
          <CitasNotificationCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      default:
        return (
          <NotificationCard
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
    }
  }

  const renderNotificationRowComponent = (notificacion) => {
    switch (notificacion.TipoNotificacion) {
      case "StockBajo":
        return (
          <NotificationRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "Vencimiento":
        return (
          <NotificationRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return (
          <ReviewNotificationRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
            onDeleteReview={
              notificacion.TipoNotificacion === "ReseñaProducto"
                ? () => eliminarResenaProducto(notificacion.IdReferencia)
                : undefined
            }
          />
        )
      case "Comprobante":
        return (
          <PaymentReceiptRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      case "Cita":
        return (
          <CitasNotificationRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
      default:
        return (
          <NotificationRow
            key={notificacion.IdNotificacion}
            notificacion={notificacion}
            onChangeStatus={cambiarEstadoNotificacion}
          />
        )
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3 mb-3">Notificaciones</h1>
        </div>
        <div className="col-md-6 d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
          <select className="form-select" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="StockBajo">Stock Bajo</option>
            <option value="Vencimiento">Vencimiento</option>
            <option value="Comprobante">Comprobante</option>
            <option value="ReseñaProducto">Reseña Producto</option>
            <option value="ReseñaServicio">Reseña Servicio</option>
            <option value="ReseñaGeneral">Reseña General</option>
            <option value="Cita">Cita</option>
          </select>
          <select className="form-select" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vista">Vista</option>
            <option value="Resuelta">Resuelta</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={fetchNotificaciones} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge bg-secondary">Total: {filteredNotificaciones.length}</span>
        {tipoFiltro !== "todos" && <span className="badge bg-info">Tipo: {tipoFiltro}</span>}
        {estadoFiltro !== "todos" && <span className="badge bg-info">Estado: {estadoFiltro}</span>}

        <div className="ms-auto">
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-sm btn-outline-primary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Acciones
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <button className="dropdown-item" onClick={marcarTodasComoLeidas}>
                  <i className="bi bi-check-all me-2"></i>
                  Marcar todas como leídas
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => eliminarNotificacionesAntiguas(30)}>
                  <i className="bi bi-trash me-2"></i>
                  Eliminar notificaciones antiguas (30 días)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")}>
            Vista de Tarjetas
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
            Vista de Lista
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="fs-5">Cargando notificaciones...</span>
        </div>
      ) : filteredNotificaciones.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No hay notificaciones que coincidan con los filtros seleccionados.
        </div>
      ) : viewMode === "cards" ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredNotificaciones.map((notificacion) => (
            <div className="col" key={`card-${notificacion.IdNotificacion}`}>
              {renderNotificationComponent(notificacion)}
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredNotificaciones.map((notificacion) => (
            <div key={`row-${notificacion.IdNotificacion}`}>{renderNotificationRowComponent(notificacion)}</div>
          ))}
        </div>
      )}

     
    </div>
)}


export default Notificaciones
