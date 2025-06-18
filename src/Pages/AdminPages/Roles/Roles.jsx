// Roles.jsx (actualizado con las tres mejoras)
"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle } from 'lucide-react'
import "../../../Styles/AdminStyles/Roles.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import RoleForm from "../../../Components/AdminComponents/RolesComponents/RoleForm"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay" // Nuevo componente
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog" // Nuevo componente
import rolesService from "../../../Services/ConsumoAdmin/rolesService"
import permisosService from "../../../Services/ConsumoAdmin/permisosService"
import rolPermisoService from "../../../Services/ConsumoAdmin/rolPermisoService"

/**
 * Componente para la gestión de roles y permisos
 * Permite crear, ver, editar, activar/desactivar y eliminar roles
 * Incluye una matriz de permisos para diferentes módulos del sistema
 */
const Roles = () => {
  // Estado para los roles
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Rol")
  const [currentRole, setCurrentRole] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    permisos: [],
    esAdmin: false,
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [roleToEdit, setRoleToEdit] = useState(null)
  const [roleToToggle, setRoleToToggle] = useState(null)
  
  // Estado para el indicador de carga
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Añadir estos nuevos estados para manejar las notificaciones pendientes
  const pendingToastRef = useRef(null);
  const toastShownRef = useRef(false);

  // Función para mostrar toast después de que el loading se oculte
  const showPendingToast = () => {
    if (pendingToastRef.current && !toastShownRef.current) {
      const { type, message } = pendingToastRef.current;
      
      // Marcar como mostrado
      toastShownRef.current = true;
      
      // Limpiar todas las notificaciones existentes primero
      toast.dismiss();
      
      // Mostrar la notificación después de un pequeño retraso
      setTimeout(() => {
        toast[type](message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          onClose: () => {
            // Resetear cuando se cierra la notificación
            pendingToastRef.current = null;
            // Esperar un momento antes de permitir nuevas notificaciones
            setTimeout(() => {
              toastShownRef.current = false;
            }, 300);
          }
        });
      }, 300);
    }
  };

  // Cargar roles y permisos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar roles
        const rolesData = await rolesService.getAll()

        // Ordenar roles para que el Super Administrador (ID 1) aparezca primero
        const sortedRoles = rolesData.sort((a, b) => {
          if (a.IdRol === 1) return -1
          if (b.IdRol === 1) return 1
          return a.NombreRol.localeCompare(b.NombreRol)
        })

        setRoles(sortedRoles)

        // Cargar permisos
        const permisosData = await permisosService.getAll()
        setPermisos(permisosData)

        setError(null)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")
        toast.error("Error al cargar los datos", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Definición de columnas para la tabla
  const columns = [
    { field: "NombreRol", header: "Nombre del Rol" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado ? "bg-success" : "bg-danger"}`}>{row.Estado ? "Activo" : "Inactivo"}</span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          disableDelete={row.IdRol === 1 || row.IdRol === 2} // Deshabilitar eliminar para Super Admin y Cliente
          disableToggle={row.IdRol === 1 || row.IdRol === 2} // Deshabilitar cambio de estado para Super Admin y Cliente
          disableEdit={row.IdRol === 1} // Deshabilitar edición para Super Admin
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un rol
   */
  const handleView = async (role) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles del rol...")
      
      setCurrentRole(role)
      setModalTitle("Ver Detalles del Rol")

      // Obtener permisos del rol
      const permisosDelRol = await rolesService.getPermisos(role.IdRol)

      // Extraer los IDs de los permisos
      const permisosIds = permisosDelRol.map((p) => p.IdPermiso)

      // Cargar datos del rol en el formulario
      setFormData({
        nombre: role.NombreRol,
        permisos: permisosIds,
        esAdmin: role.IdRol === 1,
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles del rol:", err)
      toast.error("Error al cargar los detalles del rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Manejador para editar un rol (modificado para mostrar confirmación)
   */
  const handleEdit = async (role) => {
    // No permitir editar el Super Administrador
    if (role.IdRol === 1) {
      toast.error("No se puede editar el rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // Mostrar diálogo de confirmación
    setRoleToEdit(role)
    setShowEditConfirm(true)
  }
  
  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos del rol...")
      
      const role = roleToEdit
      setCurrentRole(role)
      setModalTitle("Editar Rol")

      // Obtener permisos del rol
      const permisosDelRol = await rolesService.getPermisos(role.IdRol)

      // Extraer los IDs de los permisos
      const permisosIds = permisosDelRol.map((p) => p.IdPermiso)

      // Cargar datos del rol en el formulario
      setFormData({
        nombre: role.NombreRol,
        permisos: permisosIds,
        esAdmin: false,
        esCliente: role.IdRol === 2
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar rol:", err)
      toast.error("Error al cargar los datos para editar el rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación
   */
  const handleDelete = (role) => {
    if (role.IdRol === 1) {
      toast.error("No se puede eliminar el rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // No permitir eliminar el rol de Cliente (ID 2)
    if (role.IdRol === 2) {
      toast.error("No se puede eliminar el rol de Cliente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    setRoleToDelete(role)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        setShowDeleteConfirm(false);
        setIsProcessing(true);
        setProcessingMessage("Eliminando rol...");
        
        // Limpiar cualquier notificación pendiente anterior
        pendingToastRef.current = null;
        toastShownRef.current = false;
        
        await rolesService.delete(roleToDelete.IdRol);

        // Actualizar la lista de roles
        setRoles(roles.filter((r) => r.IdRol !== roleToDelete.IdRol));
        
        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El rol "${roleToDelete.NombreRol}" ha sido eliminado correctamente`
        };
        
        setIsProcessing(false);
      } catch (err) {
        setIsProcessing(false);
        console.error("Error al eliminar rol:", err);
        
        // En caso de error, también guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "Error al eliminar el rol"
        };
      }
    }
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setRoleToDelete(null)
  }

  /**
   * Manejador para cambiar el estado de un rol (modificado para mostrar confirmación)
   */
  const handleToggleStatus = async (role) => {
    if (role.IdRol === 1) {
      toast.error("No se puede cambiar el estado del rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // No permitir cambiar el estado del rol de Cliente (ID 2)
    if (role.IdRol === 2) {
      toast.error("No se puede cambiar el estado del rol de Cliente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // Mostrar diálogo de confirmación
    setRoleToToggle(role)
    setShowStatusConfirm(true)
  }
  
  /**
 * Función para confirmar el cambio de estado
 */
const confirmToggleStatus = async () => {
  try {
    setShowStatusConfirm(false);
    setIsProcessing(true);
    setProcessingMessage(`Cambiando estado del rol...`);
    
    // Limpiar cualquier notificación pendiente anterior
    pendingToastRef.current = null;
    toastShownRef.current = false;
    
    const role = roleToToggle;
    // Cambiar el estado del rol
    const nuevoEstado = !role.Estado;

    // Usar el nuevo método changeStatus en lugar de update
    await rolesService.changeStatus(role.IdRol, nuevoEstado);

    // Actualizar la lista de roles
    const updatedRoles = roles.map((r) => {
      if (r.IdRol === role.IdRol) {
        return { ...r, Estado: nuevoEstado };
      }
      return r;
    });

    setRoles(updatedRoles);
    
    // Guardar el toast para después
    pendingToastRef.current = {
      type: "success",
      message: `El rol "${role.NombreRol}" ahora está ${nuevoEstado ? "activo" : "inactivo"}`
    };
    
    setIsProcessing(false);
  } catch (err) {
    setIsProcessing(false);
    console.error("Error al cambiar estado del rol:", err);
    
    // En caso de error, también guardar el toast para después
    pendingToastRef.current = {
      type: "error",
      message: "Error al cambiar el estado del rol"
    };
  }
};

  /**
   * Manejador para abrir el modal de agregar rol
   */
  const handleAddRole = () => {
    setCurrentRole(null)
    setModalTitle("Agregar Rol")

    // Resetear el formulario
    setFormData({
      nombre: "",
      permisos: [],
      esAdmin: false,
    })

    setShowModal(true)
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Manejador para guardar el rol
   */
  const handleSaveRole = async () => {
    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      toast.error("Por favor, ingrese un nombre para el rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: true,
      });
      return;
    }

    try {
      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null;
      toastShownRef.current = false;
      
      setIsProcessing(true);
      setProcessingMessage(currentRole ? "Actualizando rol..." : "Creando nuevo rol...");
      
      if (currentRole) {
        // Añadir esta verificación para el rol Cliente
        if (currentRole.IdRol === 2 && formData.nombre !== currentRole.NombreRol) {
          setIsProcessing(false);
          toast.error("No se puede cambiar el nombre del rol de Cliente", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            pauseOnFocusLoss: false,
            draggable: true,
          });
          return;
        }

        // Actualizar rol existente
        await rolesService.update(currentRole.IdRol, {
          NombreRol: formData.nombre,
          Estado: currentRole.Estado,
        });

        // Asignar permisos al rol
        await rolPermisoService.assignMultiplePermisos(currentRole.IdRol, formData.permisos);

        // Actualizar la lista de roles
        const updatedRoles = roles.map((r) => {
          if (r.IdRol === currentRole.IdRol) {
            return {
              ...r,
              NombreRol: formData.nombre,
            };
          }
          return r;
        });

        setRoles(updatedRoles);
        
        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El rol "${formData.nombre}" ha sido actualizado correctamente`
        };
      } else {
        // Crear nuevo rol
        const nuevoRol = await rolesService.create({
          NombreRol: formData.nombre,
          Estado: true,
        });

        // Asignar permisos al rol
        if (formData.permisos.length > 0) {
          await rolPermisoService.assignMultiplePermisos(nuevoRol.id, formData.permisos);
        }

        // Recargar la lista de roles
        const rolesActualizados = await rolesService.getAll();

        // Ordenar roles para que el Super Administrador (ID 1) aparezca primero
        const sortedRoles = rolesActualizados.sort((a, b) => {
          if (a.IdRol === 1) return -1;
          if (b.IdRol === 1) return 1;
          return a.NombreRol.localeCompare(b.NombreRol);
        });

        setRoles(sortedRoles);
        
        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `El rol "${formData.nombre}" ha sido creado correctamente`
        };
      }

      // Cerrar el modal
      handleCloseModal();
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      console.error("Error al guardar rol:", err);
      
      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al guardar el rol"
      };
    }
  };

  // Modificar el efecto para limpiar las notificaciones al montar/desmontar
  useEffect(() => {
    // Limpiar todas las notificaciones al montar
    toast.dismiss();
    pendingToastRef.current = null;
    toastShownRef.current = false;
    
    return () => {
      // Limpiar todas las notificaciones al desmontar
      toast.dismiss();
      pendingToastRef.current = null;
      toastShownRef.current = false;
    };
  }, []);

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("roleModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

    const handleHidden = () => {
      setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      // Asegurarse de que se elimine cualquier backdrop residual al desmontar
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) {
        backdrop.remove()
      }
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [showModal])

  return (
    <div className="roles-container">
      <h2 className="mb-4">Gestión de Roles</h2>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={roles}
          onAdd={handleAddRole}
          addButtonLabel="Agregar Rol"
          searchPlaceholder="Buscar roles..."
        />
      )}

      {/* Modal para Agregar/Editar/Ver Rol */}
      <div className="modal fade" id="roleModal" tabIndex="-1" aria-labelledby="roleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="roleModalLabel">
                {modalTitle}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              <RoleForm
                formData={formData}
                setFormData={setFormData}
                modalTitle={modalTitle}
                handleCloseModal={handleCloseModal}
                handleSaveRole={handleSaveRole}
                permisos={permisos}
                disableNombre={currentRole?.IdRol === 2} // Deshabilitar el campo de nombre si es Cliente
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar el rol "${roleToEdit?.NombreRol}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />
      
      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${roleToToggle?.Estado ? "desactivar" : "activar"} el rol "${roleToToggle?.NombreRol}"?`}
        type="warning"
        onConfirm={confirmToggleStatus}
        onCancel={() => setShowStatusConfirm(false)}
      />
      
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={`¿Está seguro de eliminar el rol "${roleToDelete?.NombreRol}"?`}
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Overlay de carga con el nuevo callback */}
      <LoadingOverlay 
        isLoading={isProcessing} 
        message={processingMessage} 
        variant="primary"
        onHide={showPendingToast} // Añadir este callback
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable
        theme="light"
        limit={1}
      />
    </div>
  )
}

export default Roles