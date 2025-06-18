"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Usuarios.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import UserForm from "../../../Components/AdminComponents/UsuariosComponents/UserForm"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay" // Nuevo componente
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog" // Nuevo componente
import usuariosService from "../../../Services/ConsumoAdmin/usuariosService"
import rolesService from "../../../Services/ConsumoAdmin/rolesService"

/**
 * Componente para la gestión de usuarios
 * Permite visualizar, crear, editar y cambiar el estado de usuarios en el sistema
 */
const Usuarios = () => {
  // Estado para los usuarios
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado para los roles disponibles
  const [roles, setRoles] = useState([])

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Usuario")
  const [currentUser, setCurrentUser] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    foto: "",
    rol: "",
    contrasena: "",
    confirmarContrasena: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    rol: "",
    contrasena: "",
    confirmarContrasena: "",
  })

  // Estado para los diálogos de confirmación
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [userToToggle, setUserToToggle] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)

  // Estado para el indicador de carga
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  // Añadir estos nuevos estados para manejar las notificaciones pendientes
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)

  // Función para mostrar toast después de que el loading se oculte
  const showPendingToast = () => {
    if (pendingToastRef.current && !toastShownRef.current) {
      const { type, message } = pendingToastRef.current

      // Marcar como mostrado
      toastShownRef.current = true

      // Limpiar todas las notificaciones existentes primero
      toast.dismiss()

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
            pendingToastRef.current = null
            // Esperar un momento antes de permitir nuevas notificaciones
            setTimeout(() => {
              toastShownRef.current = false
            }, 300)
          },
        })
      }, 300)
    }
  }

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar roles
        const rolesData = await rolesService.getAll()
        setRoles(
          rolesData.map((rol) => ({
            id: rol.IdRol,
            nombre: rol.NombreRol,
          })),
        )

        // Cargar usuarios
        const usuariosData = await usuariosService.getAll()
        console.log("Datos de usuarios recibidos:", usuariosData)

        // Procesar los datos de usuarios para asegurar que tengan la estructura correcta
        const processedUsuarios = usuariosData.map((usuario) => {
          // Asegurar que el documento esté presente y sea una cadena
          const documento =
            usuario.Documento !== undefined && usuario.Documento !== null ? String(usuario.Documento) : "No disponible"

          console.log(`Usuario ${usuario.IdUsuario}, Documento: ${documento}`)

          // Asegurar que el rol esté correctamente formateado
          const rolInfo = usuario.Rol || {}
          const rolId = rolInfo.IdRol || usuario.IdRol
          const rolNombre =
            rolInfo.NombreRol ||
            (rolId ? rolesData.find((r) => r.IdRol === rolId)?.NombreRol || `Rol ${rolId}` : "Sin rol")

          return {
            ...usuario,
            Documento: documento,
            Rol: {
              IdRol: rolId,
              NombreRol: rolNombre,
            },
          }
        })

        console.log("Usuarios procesados:", processedUsuarios)
        setUsuarios(processedUsuarios)
        setError(null)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "Error al cargar los datos",
        }
      } finally {
        setLoading(false)
        // Mostrar cualquier notificación pendiente después de que se complete la carga
        showPendingToast()
      }
    }

    // Limpiar todas las notificaciones al montar
    toast.dismiss()
    pendingToastRef.current = null
    toastShownRef.current = false

    fetchData()

    return () => {
      // Limpiar todas las notificaciones al desmontar
      toast.dismiss()
      pendingToastRef.current = null
      toastShownRef.current = false
    }
  }, [])

  // Modificar la definición de columnas para asegurar que el documento se muestre correctamente
  const columns = [
    {
      field: "Nombre",
      header: "Nombre",
      render: (row) => `${row.Nombre} ${row.Apellido || ""}`,
    },
    { field: "Correo", header: "Correo" },
    {
      field: "Documento",
      header: "Documento",
      render: (row) => {
        // Asegurar que el documento se muestre correctamente
        const doc = row.Documento !== undefined && row.Documento !== null ? String(row.Documento) : "No disponible"
        console.log(`Renderizando documento para ${row.Nombre}: ${doc}`)
        return doc
      },
    },
    {
      field: "Rol",
      header: "Rol",
      render: (row) => row.Rol?.NombreRol || "Sin rol",
    },
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
          onEdit={handleConfirmEdit}
          onToggleStatus={handleConfirmToggleStatus}
          onDelete={handleConfirmDelete}
          disableToggle={row.IdRol === 1} // No permitir desactivar al Super Admin
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un usuario
   * @param {Object} user - Objeto de usuario a visualizar
   */
  const handleView = async (user) => {
    try {
      setIsProcessing(true)
      setProcessingMessage("Cargando detalles del usuario...")

      setCurrentUser(user)
      setModalTitle("Ver Detalles del Usuario")

      // Cargar datos del usuario en el formulario
      setFormData({
        documento: user.Documento,
        correo: user.Correo,
        nombre: user.Nombre,
        apellido: user.Apellido || "",
        telefono: user.Telefono || "",
        direccion: user.Direccion || "",
        foto: user.FotoURL || "",
        rol: user.Rol?.IdRol || "",
        contrasena: "********", // Placeholder para contraseña
        confirmarContrasena: "********", // Placeholder para confirmar contraseña
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        rol: "",
        contrasena: "",
        confirmarContrasena: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar detalles del usuario:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles del usuario",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar la edición de un usuario
   * @param {Object} user - Objeto de usuario a editar
   */
  const handleConfirmEdit = (user) => {
    setUserToEdit(user)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Cargando datos del usuario...")

      const user = userToEdit
      setCurrentUser(user)
      setModalTitle("Editar Usuario")

      // Cargar datos del usuario en el formulario
      setFormData({
        documento: user.Documento,
        correo: user.Correo,
        nombre: user.Nombre,
        apellido: user.Apellido || "",
        telefono: user.Telefono || "",
        direccion: user.Direccion || "",
        foto: user.FotoURL || "",
        rol: user.Rol?.IdRol || "",
        contrasena: "", // Vacío para edición
        confirmarContrasena: "", // Vacío para edición
      })

      // Resetear errores
      setFormErrors({
        documento: "",
        correo: "",
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        rol: "",
        contrasena: "",
        confirmarContrasena: "",
      })

      setIsProcessing(false)
      setShowModal(true)
    } catch (err) {
      setIsProcessing(false)
      console.error("Error al cargar datos para editar usuario:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar el usuario",
      }
      showPendingToast()
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de un usuario
   * @param {Object} user - Objeto de usuario a cambiar estado
   */
  const handleConfirmToggleStatus = (user) => {
    setUserToToggle(user)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para confirmar la eliminación de un usuario
   * @param {Object} user - Objeto de usuario a eliminar
   */
  const handleConfirmDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de un usuario (Activo/Inactivo)
   */
  const handleToggleStatus = async () => {
    if (!userToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true)
      setProcessingMessage(`Cambiando estado del usuario...`)

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Cambiar el estado del usuario
      const nuevoEstado = !userToToggle.Estado
      await usuariosService.changeStatus(userToToggle.IdUsuario, nuevoEstado)

      // Actualizar la lista de usuarios
      const updatedUsers = usuarios.map((u) => {
        if (u.IdUsuario === userToToggle.IdUsuario) {
          return {
            ...u,
            Estado: nuevoEstado,
          }
        }
        return u
      })

      setUsuarios(updatedUsers)

      // Guardar el toast para después
      const newStatus = nuevoEstado ? "activo" : "inactivo"
      pendingToastRef.current = {
        type: "success",
        message: `El usuario "${userToToggle.Nombre}" ahora está ${newStatus}`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al cambiar estado del usuario:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado del usuario",
      }
    }

    // Cerrar el modal de confirmación
    setUserToToggle(null)
  }

  /**
   * Manejador para eliminar un usuario
   */
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setShowDeleteConfirm(false)
      setIsProcessing(true)
      setProcessingMessage("Eliminando usuario...")

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Eliminar el usuario
      await usuariosService.delete(userToDelete.IdUsuario)

      // Actualizar la lista de usuarios
      const updatedUsers = usuarios.filter((u) => u.IdUsuario !== userToDelete.IdUsuario)
      setUsuarios(updatedUsers)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "success",
        message: `El usuario "${userToDelete.Nombre}" ha sido eliminado correctamente`,
      }

      setIsProcessing(false)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error al eliminar el usuario:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al eliminar el usuario",
      }
    }

    // Cerrar el modal de confirmación
    setUserToDelete(null)
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setUserToToggle(null)
  }

  /**
   * Manejador para cancelar la eliminación
   */
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar usuario
   */
  const handleAddUser = () => {
    setCurrentUser(null)
    setModalTitle("Agregar Usuario")

    // Resetear el formulario
    setFormData({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: "",
      foto: "",
      rol: "",
      contrasena: "",
      confirmarContrasena: "",
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: "",
      rol: "",
      contrasena: "",
      confirmarContrasena: "",
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
 * Manejador para cambios en los inputs del formulario
 * @param {Event} e - Evento del input
 */
const handleInputChange = async (e) => {
  const { name, value, type, files } = e.target

  // Si es un input de tipo file, guardar el archivo
  if (type === "file") {
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      })
    }
  } else {
    // Para otros tipos de input, guardar el valor
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Limpiar el error específico cuando el usuario comienza a escribir
  setFormErrors({
    ...formErrors,
    [name]: "",
  })

  // Si es el campo de documento y tiene al menos 7 caracteres, verificar en tiempo real
  if (name === "documento" && value.trim().length >= 7) {
    // Usar un temporizador para evitar demasiadas llamadas mientras se escribe
    if (window.documentoTimeout) {
      clearTimeout(window.documentoTimeout);
    }
    
    window.documentoTimeout = setTimeout(async () => {
      try {
        // Verificar si el documento ya existe (excluyendo el usuario actual si estamos editando)
        const excludeUserId = currentUser ? currentUser.IdUsuario : null;
        const exists = await usuariosService.checkDocumentoExists(value.trim(), excludeUserId);
        
        if (exists) {
          setFormErrors({
            ...formErrors,
            documento: "Este documento ya está registrado en el sistema"
          });
          
          // Mostrar notificación
          toast.error("El documento ya está registrado en el sistema", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            pauseOnFocusLoss: false,
            draggable: true,
          });
        }
      } catch (error) {
        console.error("Error al verificar documento:", error);
      }
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
  }
}

  // Función para validar el documento cuando pierde el foco
const handleDocumentoBlur = async (e) => {
  const documento = e.target.value.trim();
  
  if (!documento) {
    setFormErrors({
      ...formErrors,
      documento: "El documento es obligatorio"
    });
    return;
  }
  
  if (!/^\d{7,12}$/.test(documento)) {
    setFormErrors({
      ...formErrors,
      documento: "El documento debe tener entre 7 y 12 dígitos"
    });
    return;
  }
  
  try {
    setIsProcessing(true);
    setProcessingMessage("Verificando documento...");
    
    // Verificar si el documento ya existe (excluyendo el usuario actual si estamos editando)
    const excludeUserId = currentUser ? currentUser.IdUsuario : null;
    const exists = await usuariosService.checkDocumentoExists(documento, excludeUserId);
    
    if (exists) {
      setFormErrors({
        ...formErrors,
        documento: "Este documento ya está registrado en el sistema"
      });
      
      // Mostrar notificación
      pendingToastRef.current = {
        type: "error",
        message: "El documento ya está registrado en el sistema"
      };
      showPendingToast();
    } else {
      setFormErrors({
        ...formErrors,
        documento: ""
      });
    }
  } catch (error) {
    console.error("Error al verificar documento:", error);
  } finally {
    setIsProcessing(false);
  }
};

  /**
 * Validar el formulario completo
 * @returns {boolean} - True si el formulario es válido, false en caso contrario
 */
const validateForm = () => {
  console.log("Validando formulario con datos:", formData);
  
  let isValid = true;
  const errors = {
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    rol: "",
    contrasena: "",
    confirmarContrasena: "",
  };

  // Validar documento (requerido y formato)
  if (!formData.documento.trim()) {
    errors.documento = "El documento es obligatorio";
    isValid = false;
    console.log("Error: Documento vacío");
  } else if (!/^\d{7,12}$/.test(formData.documento)) {
    errors.documento = "El documento debe tener entre 7 y 12 dígitos";
    isValid = false;
    console.log("Error: Formato de documento inválido");
  }

  // Validar correo (requerido y formato)
  if (!formData.correo.trim()) {
    errors.correo = "El correo es obligatorio";
    isValid = false;
    console.log("Error: Correo vacío");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      errors.correo = "Formato de correo inválido";
      isValid = false;
      console.log("Error: Formato de correo inválido");
    }
  }

  // Validar nombre (requerido)
  if (!formData.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio";
    isValid = false;
    console.log("Error: Nombre vacío");
  }

  // Validar apellido (requerido)
  if (!formData.apellido.trim()) {
    errors.apellido = "El apellido es obligatorio";
    isValid = false;
    console.log("Error: Apellido vacío");
  }

  // Validar teléfono (formato)
  if (formData.telefono.trim() && !/^\d{7,10}$/.test(formData.telefono)) {
    errors.telefono = "El teléfono debe tener entre 7 y 10 dígitos";
    isValid = false;
    console.log("Error: Formato de teléfono inválido");
  }

  // Validar dirección (requerido)
  if (!formData.direccion.trim()) {
    errors.direccion = "La dirección es obligatoria";
    isValid = false;
    console.log("Error: Dirección vacía");
  }

  // Validar rol (requerido)
  if (!formData.rol) {
    errors.rol = "Debe seleccionar un rol";
    isValid = false;
    console.log("Error: Rol no seleccionado");
  }

  // Validar contraseña SOLO si estamos en modo edición y se ha ingresado una contraseña
  if (currentUser && formData.contrasena && formData.contrasena !== "********") {
    // Usuario existente - contraseña opcional pero debe cumplir requisitos si se proporciona
    if (formData.contrasena.length < 6) {
      errors.contrasena = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
      console.log("Error: Contraseña demasiado corta");
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(formData.contrasena)) {
      errors.contrasena = "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial";
      isValid = false;
      console.log("Error: Formato de contraseña inválido");
    }

    // Confirmar contraseña si se está cambiando
    if (!formData.confirmarContrasena) {
      errors.confirmarContrasena = "Debe confirmar la contraseña";
      isValid = false;
      console.log("Error: Confirmación de contraseña vacía");
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      errors.confirmarContrasena = "Las contraseñas no coinciden";
      isValid = false;
      console.log("Error: Las contraseñas no coinciden");
    }
  }

  console.log("Resultado de validación:", isValid ? "Válido" : "Inválido");
  console.log("Errores encontrados:", errors);
  
  setFormErrors(errors);
  return isValid;
};

  /**
 * Manejador para guardar el usuario (crear nuevo o actualizar existente)
 * Valida los datos y envía la información
 */
const handleSaveUser = async () => {
  try {
    // Validar el formulario
    if (!validateForm()) {
      // Mostrar los errores específicos que están en formErrors
      console.log("Errores en el formulario:", formErrors);
      
      // Limpiar notificaciones existentes
      toast.dismiss();

      toast.error("Por favor, corrija los errores en el formulario", {
        position: "top-right",
        autoClose: 5000,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
      return;
    }

    setIsProcessing(true);
    setProcessingMessage(currentUser ? "Actualizando usuario..." : "Creando nuevo usuario...");

    // Preparar datos del usuario
    const userData = {
      Nombre: formData.nombre,
      Apellido: formData.apellido,
      Correo: formData.correo,
      Documento: formData.documento,
      Telefono: formData.telefono,
      Direccion: formData.direccion,
      Foto: formData.foto,
      IdRol: Number.parseInt(formData.rol, 10),
    };

    // Agregar contraseña SOLO si estamos editando un usuario existente y se ha cambiado la contraseña
if (currentUser && formData.contrasena && formData.contrasena !== "********") {
  userData.Password = formData.contrasena;
}

    console.log("Datos preparados para enviar:", userData);

    // Agregar contraseña si es un nuevo usuario o si se está cambiando
    if (currentUser && formData.contrasena && formData.contrasena !== "********") {
      userData.Password = formData.contrasena;
    }

    if (currentUser) {
      // Actualizar usuario existente
      console.log(`Actualizando usuario ID ${currentUser.IdUsuario}:`, userData);
      await usuariosService.update(currentUser.IdUsuario, userData);

      // Actualizar la lista de usuarios
      const updatedUsers = await usuariosService.getAll();
      setUsuarios(updatedUsers);

      // Cerrar el modal primero para evitar problemas con el estado
      setShowModal(false);
      
      // Mostrar notificación después de cerrar el modal
      setTimeout(() => {
        toast.success(`El usuario "${formData.nombre} ${formData.apellido}" ha sido actualizado correctamente`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
        });
      }, 300);
    } else {
      // Crear nuevo usuario
      console.log("Creando nuevo usuario:", userData);
      await usuariosService.create(userData);

      // Actualizar la lista de usuarios
      const updatedUsers = await usuariosService.getAll();
      setUsuarios(updatedUsers);

      // Cerrar el modal primero para evitar problemas con el estado
      setShowModal(false);
      
      // Mostrar notificación después de cerrar el modal
      setTimeout(() => {
        toast.success(`El usuario "${formData.nombre} ${formData.apellido}" ha sido creado correctamente`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
        });
      }, 300);
    }

    setIsProcessing(false);
  } catch (error) {
    setIsProcessing(false);
    console.error("Error al guardar usuario:", error);
    console.error("Mensaje de error:", error.message);
    console.error("Respuesta del servidor:", error.response?.data);

    // Mostrar notificación de error
    toast.error(`Error al guardar el usuario: ${error.response?.data?.message || error.message || "Error desconocido"}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: true,
    });
  }
};

  /**
 * Efecto para inicializar el modal de Bootstrap
 */
useEffect(() => {
  let modalInstance = null;
  const modalElement = document.getElementById("userModal");

  if (showModal) {
    import("bootstrap").then((bootstrap) => {
      if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      }
    });
  } else {
    // Si showModal es false y el modal está abierto, cerrarlo programáticamente
    if (modalElement && modalElement.classList.contains("show")) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  }

  // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
  const handleHidden = () => {
    setShowModal(false);
  };

  modalElement?.addEventListener("hidden.bs.modal", handleHidden);

  return () => {
    modalElement?.removeEventListener("hidden.bs.modal", handleHidden);
    // Asegurarse de que se elimine cualquier backdrop residual al desmontar
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
}, [showModal]);

  return (
    <div className="usuarios-container">
      <h2 className="mb-4">Gestión de Usuarios</h2>

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
          data={usuarios}
          onAdd={handleAddUser}
          addButtonLabel="Agregar Usuario"
          searchPlaceholder="Buscar usuarios..."
        />
      )}

      {/* Modal para Agregar/Editar/Ver Usuario */}
      <UserForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        roles={roles}
        currentUser={currentUser}
        onInputChange={handleInputChange}
        onSave={handleSaveUser}
        onClose={handleCloseModal}
        setFormErrors={setFormErrors} // Añadir esta prop
        onDocumentoBlur={handleDocumentoBlur} // Añadir esta prop
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar el usuario "${userToEdit?.Nombre} ${userToEdit?.Apellido || ""}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${userToToggle?.Estado ? "desactivar" : "activar"} el usuario "${userToToggle?.Nombre} ${userToToggle?.Apellido || ""}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar al usuario{" "}
            <strong>
              {userToDelete?.Nombre} {userToDelete?.Apellido || ""}
            </strong>
            ?
            <br />
            <span className="text-danger">Esta acción no se puede deshacer.</span>
          </>
        }
        type="danger"
        onConfirm={handleDeleteUser}
        onCancel={handleCancelDelete}
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

export default Usuarios
