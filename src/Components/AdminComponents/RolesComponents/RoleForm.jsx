"use client"

import { useState } from "react"
import { Save, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"

/**
 * Componente de formulario para la gestión de roles
 */
const RoleForm = ({ formData, setFormData, modalTitle, handleCloseModal, handleSaveRole, permisos, disableNombre }) => {
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    configuracion: true, // Expandido por defecto para mejor UX
    usuarios: false,
    productos: false,
    proveedores: false,
    compras: false,
    mascotas: false,
    citas: false,
    servicios: false,
    ventas: false,
    resenas: false,
    devolucion: false,
    notificaciones: false,
  })

  // Estado para errores
  const [formErrors, setFormErrors] = useState({})

  /**
   * Manejador para cambios en el input de nombre
   */
  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      nombre: e.target.value,
    })
  }

  /**
   * Manejador para cambios en los checkboxes de permisos
   */
  const handlePermissionChange = (permisoId) => {
    // Crear una copia del array de permisos seleccionados
    const updatedPermisos = [...formData.permisos]

    // Verificar si el permiso ya está seleccionado
    const index = updatedPermisos.indexOf(permisoId)

    if (index === -1) {
      // Si no está seleccionado, agregarlo
      updatedPermisos.push(permisoId)
    } else {
      // Si ya está seleccionado, quitarlo
      updatedPermisos.splice(index, 1)
    }

    setFormData({
      ...formData,
      permisos: updatedPermisos,
    })
  }

  /**
   * Función para alternar la expansión de una sección
   */
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  /**
   * Función para renderizar un checkbox de permiso
   */
  const renderCheckbox = (permisoId) => {
    // Verificar si el permiso está seleccionado
    const isChecked = formData.permisos.includes(permisoId)

    return (
      <div className="form-check d-flex justify-content-center">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isChecked || false}
          onChange={() => handlePermissionChange(permisoId)}
          disabled={modalTitle === "Ver Detalles del Rol"}
          id={`permiso-${permisoId}`}
        />
      </div>
    )
  }

  // Función para agrupar permisos por categoría y tipo
  const getPermisosAgrupados = () => {
    const permisosAgrupados = {
      configuracion: {
        roles: [],
        permisos: [],
      },
      usuarios: {
        usuarios: [],
        acceso: [],
        clientes: [],
      },
      productos: {
        categorias: [],
        productos: [],
      },
      proveedores: {
        proveedores: [],
        catalogoProveedores: [], // Nueva categoría para catálogo de proveedores
      },
      compras: {
        compras: [],
      },
      mascotas: {
        mascotas: [],
        especies: [], // Nueva categoría para especies
      },
      citas: {
        citas: [],
      },
      servicios: {
        servicios: [],
        tiposServicio: [],
      },
      ventas: {
        ventas: [],
        pagos: [],
      },
      resenas: {
        resenas: [],
        tiposResenas: [],
      },
      devolucion: {
        devoluciones: [],
      },
      notificaciones: {
        stock: [],
        vencimiento: [],
        resenas: [],
        comprobantes: [],
        citas: [],
      },
    }

    // Agrupar permisos según su nombre
    permisos.forEach((permiso) => {
      const nombre = permiso.NombrePermiso

      // Configuración
      if (nombre.includes("Roles")) {
        permisosAgrupados.configuracion.roles.push(permiso)
      } else if (nombre.includes("Permisos")) {
        permisosAgrupados.configuracion.permisos.push(permiso)
      }

      // Usuarios
      else if (nombre.includes("Usuarios")) {
        permisosAgrupados.usuarios.usuarios.push(permiso)
      } else if (nombre.includes("Acceso")) {
        permisosAgrupados.usuarios.acceso.push(permiso)
      } else if (nombre.includes("Clientes")) {
        permisosAgrupados.usuarios.clientes.push(permiso)
      }

      // Productos
      else if (nombre.includes("Categorias")) {
        permisosAgrupados.productos.categorias.push(permiso)
      } else if (nombre.includes("Productos")) {
        permisosAgrupados.productos.productos.push(permiso)
      }

      // Proveedores
      else if (nombre.includes("Catálogo Proveedores")) {
        permisosAgrupados.proveedores.catalogoProveedores.push(permiso)
      } else if (nombre.includes("Proveedores")) {
        permisosAgrupados.proveedores.proveedores.push(permiso)
      }

      // Compras
      else if (nombre.includes("Compras")) {
        permisosAgrupados.compras.compras.push(permiso)
      }

      // Mascotas
      else if (nombre.includes("Especies")) {
        permisosAgrupados.mascotas.especies.push(permiso)
      } else if (nombre.includes("Mascotas")) {
        permisosAgrupados.mascotas.mascotas.push(permiso)
      }

      // Citas
      else if (nombre.includes("Citas") && !nombre.includes("Notificaciones")) {
        permisosAgrupados.citas.citas.push(permiso)
      }

      // Servicios
      else if (nombre.includes("Servicios")) {
        permisosAgrupados.servicios.servicios.push(permiso)
      } else if (nombre.includes("Tipos de Servicio")) {
        permisosAgrupados.servicios.tiposServicio.push(permiso)
      }

      // Ventas
      else if (nombre.includes("Ventas")) {
        permisosAgrupados.ventas.ventas.push(permiso)
      } else if (nombre.includes("Pagos")) {
        permisosAgrupados.ventas.pagos.push(permiso)
      }

      // Reseñas
      else if (nombre.includes("Reseñas") && !nombre.includes("Notificaciones") && !nombre.includes("Tipos")) {
        permisosAgrupados.resenas.resenas.push(permiso)
      } else if (nombre.includes("Tipos de Reseñas")) {
        permisosAgrupados.resenas.tiposResenas.push(permiso)
      }

      // Devoluciones
      else if (nombre.includes("Devoluciones")) {
        permisosAgrupados.devolucion.devoluciones.push(permiso)
      }

      // Notificaciones
      else if (nombre.includes("Notificaciones Stock")) {
        permisosAgrupados.notificaciones.stock.push(permiso)
      } else if (nombre.includes("Notificaciones Vencimiento")) {
        permisosAgrupados.notificaciones.vencimiento.push(permiso)
      } else if (nombre.includes("Notificaciones Reseñas")) {
        permisosAgrupados.notificaciones.resenas.push(permiso)
      } else if (nombre.includes("Notificaciones Comprobantes")) {
        permisosAgrupados.notificaciones.comprobantes.push(permiso)
      } else if (nombre.includes("Notificaciones Citas")) {
        permisosAgrupados.notificaciones.citas.push(permiso)
      }
    })

    return permisosAgrupados
  }

  // Obtener permisos agrupados
  const permisosAgrupados = getPermisosAgrupados()

  // Función para renderizar una fila de permisos
  const renderPermissionRow = (title, permisosList) => {
    if (!permisosList || permisosList.length === 0) return null

    // Ordenar permisos por tipo (Crear, Modificar, etc.)
    const sortedPermisos = [...permisosList].sort((a, b) => {
      const order = ["Crear", "Modificar", "Cambiar Estado", "Visualizar", "Eliminar"]
      const aIndex = order.findIndex((type) => a.NombrePermiso.includes(type))
      const bIndex = order.findIndex((type) => b.NombrePermiso.includes(type))
      return aIndex - bIndex
    })

    // Encontrar los permisos específicos
    const crearPermiso = sortedPermisos.find((p) => p.NombrePermiso.includes("Crear"))
    const modificarPermiso = sortedPermisos.find((p) => p.NombrePermiso.includes("Modificar"))
    const cambiarEstadoPermiso = sortedPermisos.find((p) => p.NombrePermiso.includes("Cambiar Estado"))
    const visualizarPermiso = sortedPermisos.find((p) => p.NombrePermiso.includes("Visualizar"))
    const eliminarPermiso = sortedPermisos.find((p) => p.NombrePermiso.includes("Eliminar"))

    return (
      <tr>
        <td className="ps-4">{title}</td>
        <td className="text-center">{crearPermiso && renderCheckbox(crearPermiso.IdPermiso)}</td>
        <td className="text-center">{modificarPermiso && renderCheckbox(modificarPermiso.IdPermiso)}</td>
        <td className="text-center">{cambiarEstadoPermiso && renderCheckbox(cambiarEstadoPermiso.IdPermiso)}</td>
        <td className="text-center">{visualizarPermiso && renderCheckbox(visualizarPermiso.IdPermiso)}</td>
        <td className="text-center">{eliminarPermiso && renderCheckbox(eliminarPermiso.IdPermiso)}</td>
      </tr>
    )
  }

  // Función de validación
  const validarFormularioRol = (formData) => {
    const errores = {}
    // Nombre: requerido, mínimo 3, máximo 50, sin espacios al inicio/fin
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      errores.nombre = "El nombre es obligatorio y debe tener al menos 3 caracteres."
    } else if (formData.nombre.trim().length > 50) {
      errores.nombre = "El nombre no puede superar los 50 caracteres."
    }
    // Permisos: al menos uno seleccionado
    if (!formData.permisos || formData.permisos.length === 0) {
      errores.permisos = "Debe seleccionar al menos un permiso para el rol."
    }
    return errores
  }

  // Nuevo handleSaveRole con validación
  const handleSaveRoleConValidacion = (e) => {
    e.preventDefault()
    const errores = validarFormularioRol(formData)
    setFormErrors(errores)
    if (Object.keys(errores).length > 0) return
    handleSaveRole()
  }

  return (
    <form>
      {/* Campo de nombre con etiqueta flotante */}
      <div className="form-floating mb-4">
        <input
          type="text"
          className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
          id="roleName"
          placeholder="Nombre del rol"
          value={formData.nombre}
          onChange={handleNameChange}
          disabled={modalTitle === "Ver Detalles del Rol" || formData.esAdmin || disableNombre}
          maxLength={50}
        />
        <label htmlFor="roleName">Nombre del Rol</label>
        {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered permissions-table">
          <thead className="table-light">
            <tr>
              <th>Módulo</th>
              <th>Crear</th>
              <th>Modificar</th>
              <th>Cambiar Estado</th>
              <th>Visualizar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {/* CONFIGURACIÓN */}
            <tr className="module-header" onClick={() => toggleSection("configuracion")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.configuracion ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                CONFIGURACIÓN
              </td>
            </tr>
            {expandedSections.configuracion && (
              <>
                {renderPermissionRow("Gestión de Roles", permisosAgrupados.configuracion.roles)}
                {renderPermissionRow("Gestión de Permisos", permisosAgrupados.configuracion.permisos)}
              </>
            )}

            {/* USUARIOS */}
            <tr className="module-header" onClick={() => toggleSection("usuarios")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.usuarios ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                USUARIOS
              </td>
            </tr>
            {expandedSections.usuarios && (
              <>
                {renderPermissionRow("Gestión de Usuarios", permisosAgrupados.usuarios.usuarios)}
                {renderPermissionRow("Gestión de Acceso", permisosAgrupados.usuarios.acceso)}
                {renderPermissionRow("Gestión de Clientes", permisosAgrupados.usuarios.clientes)}
              </>
            )}

            {/* PRODUCTOS */}
            <tr className="module-header" onClick={() => toggleSection("productos")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.productos ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                PRODUCTOS
              </td>
            </tr>
            {expandedSections.productos && (
              <>
                {renderPermissionRow("Gestión Categorías", permisosAgrupados.productos.categorias)}
                {renderPermissionRow("Gestión de Productos", permisosAgrupados.productos.productos)}
              </>
            )}

            {/* PROVEEDORES */}
            <tr className="module-header" onClick={() => toggleSection("proveedores")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.proveedores ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                PROVEEDORES
              </td>
            </tr>
            {expandedSections.proveedores && (
              <>
                {renderPermissionRow("Gestión de Proveedores", permisosAgrupados.proveedores.proveedores)}
                {renderPermissionRow("Catálogo de Proveedores", permisosAgrupados.proveedores.catalogoProveedores)}
              </>
            )}

            {/* COMPRAS */}
            <tr className="module-header" onClick={() => toggleSection("compras")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.compras ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                COMPRAS
              </td>
            </tr>
            {expandedSections.compras && (
              <>{renderPermissionRow("Gestión de Compras", permisosAgrupados.compras.compras)}</>
            )}

            {/* MASCOTAS */}
            <tr className="module-header" onClick={() => toggleSection("mascotas")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.mascotas ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                MASCOTAS
              </td>
            </tr>
            {expandedSections.mascotas && (
              <>
                {renderPermissionRow("Gestión de Mascotas", permisosAgrupados.mascotas.mascotas)}
                {renderPermissionRow("Gestión de Especies", permisosAgrupados.mascotas.especies)}
              </>
            )}

            {/* CITAS */}
            <tr className="module-header" onClick={() => toggleSection("citas")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.citas ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                CITAS
              </td>
            </tr>
            {expandedSections.citas && (
              <>{renderPermissionRow("Gestión Agenda de Citas", permisosAgrupados.citas.citas)}</>
            )}

            {/* SERVICIOS */}
            <tr className="module-header" onClick={() => toggleSection("servicios")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.servicios ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                SERVICIOS
              </td>
            </tr>
            {expandedSections.servicios && (
              <>
                {renderPermissionRow("Gestión de Servicios", permisosAgrupados.servicios.servicios)}
                {renderPermissionRow("Gestión de Tipos de Servicio", permisosAgrupados.servicios.tiposServicio)}
              </>
            )}

            {/* VENTAS */}
            <tr className="module-header" onClick={() => toggleSection("ventas")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.ventas ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                VENTAS
              </td>
            </tr>
            {expandedSections.ventas && (
              <>
                {renderPermissionRow("Gestión de Ventas", permisosAgrupados.ventas.ventas)}
                {renderPermissionRow("Gestión de Pagos", permisosAgrupados.ventas.pagos)}
              </>
            )}

            {/* RESEÑAS */}
            <tr className="module-header" onClick={() => toggleSection("resenas")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.resenas ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                RESEÑAS
              </td>
            </tr>
            {expandedSections.resenas && (
              <>
                {renderPermissionRow("Gestión de Reseñas", permisosAgrupados.resenas.resenas)}
                {renderPermissionRow("Tipo de Reseñas", permisosAgrupados.resenas.tiposResenas)}
              </>
            )}

            {/* DEVOLUCIÓN */}
            <tr className="module-header" onClick={() => toggleSection("devolucion")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.devolucion ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                DEVOLUCIÓN
              </td>
            </tr>
            {expandedSections.devolucion && (
              <>{renderPermissionRow("Gestión Devoluciones", permisosAgrupados.devolucion.devoluciones)}</>
            )}

            {/* NOTIFICACIONES */}
            <tr className="module-header" onClick={() => toggleSection("notificaciones")} style={{ cursor: "pointer" }}>
              <td colSpan="6" className="d-flex align-items-center">
                {expandedSections.notificaciones ? (
                  <ChevronDown size={16} className="me-2" />
                ) : (
                  <ChevronRight size={16} className="me-2" />
                )}
                NOTIFICACIONES
              </td>
            </tr>
            {expandedSections.notificaciones && (
              <>
                {renderPermissionRow("Stock", permisosAgrupados.notificaciones.stock)}
                {renderPermissionRow("Vencimiento", permisosAgrupados.notificaciones.vencimiento)}
                {renderPermissionRow("Reseñas", permisosAgrupados.notificaciones.resenas)}
                {renderPermissionRow("Comprobantes", permisosAgrupados.notificaciones.comprobantes)}
                {renderPermissionRow("Citas", permisosAgrupados.notificaciones.citas)}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Error de permisos */}
      {formErrors.permisos && (
        <div className="alert alert-danger py-2 mb-2">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {formErrors.permisos}
        </div>
      )}

      {/* Nota de advertencia */}
      <div className="alert alert-warning mt-4">
        <div className="d-flex align-items-center">
          <AlertTriangle size={20} className="me-2" />
          <strong>Nota:</strong> El rol de Super Administrador no puede ser eliminado, desactivado ni modificado. Solo
          el Super Administrador puede crear, modificar o eliminar roles.
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseModal}>
          Cancelar
        </button>

        {modalTitle !== "Ver Detalles del Rol" && !formData.esAdmin && (
          <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleSaveRoleConValidacion}>
            <Save size={18} className="me-1" />
            Guardar Rol
          </button>
        )}
      </div>
    </form>
  )
}

export default RoleForm
