"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { FiUser, FiSave, FiX } from "react-icons/fi"
import ProfileImageSection from "../../../Components/AdminComponents/PerfilDeUsuarioComponents/ProfileImageSection"
import PersonalInfoSection from "../../../Components/AdminComponents/PerfilDeUsuarioComponents/PersonalInfoSection"
import PasswordSection from "../../../Components/AdminComponents/PerfilDeUsuarioComponents/PasswordSection"
import userProfileService from "../../..//Services/ConsumoAdmin/UserProfileService.js"

/**
 * Componente principal de perfil de usuario
 * Permite visualizar y editar la información del perfil
 */
const UserProfile = () => {
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)

  // Estado inicial del usuario
  const [userData, setUserData] = useState({
    Nombre: "",
    Apellido: "",
    Telefono: "",
    Direccion: "",
    Documento: "",
    Correo: "",
    ContraseñaOld: "",
    ContraseñaNew: "",
    ContraseñaConfirm: "",
    Foto: null,
  })

  // Estado para controlar qué campos están en modo edición
  const [editMode, setEditMode] = useState({
    Nombre: false,
    Apellido: false,
    Telefono: false,
    Direccion: false,
    Contraseña: false,
    Foto: false,
  })

  // Estado para mensajes de validación
  const [validation, setValidation] = useState({
    ContraseñaOld: "",
    ContraseñaNew: "",
    ContraseñaConfirm: "",
  })

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    fetchUserData()
  }, [])

  // Efecto para sincronizar la foto de perfil con el avatar en la barra de navegación
  useEffect(() => {
    // Función para sincronizar la foto de perfil con el avatar
    const syncProfilePhoto = () => {
      try {
        const photoUrl = localStorage.getItem("userProfilePhoto")
        if (photoUrl) {
          // Buscar todos los posibles elementos de avatar en la página
          const avatarElements = document.querySelectorAll(
            ".dropdown-toggle img, .avatar img, header img, .navbar img, .user-avatar img",
          )

          if (avatarElements.length > 0) {
            console.log(`Sincronizando ${avatarElements.length} elementos de avatar al iniciar`)
            avatarElements.forEach((img) => {
              img.src = photoUrl
              img.onerror = () => {
                console.error("Error al cargar la imagen en el avatar")
              }
            })
          }
        }
      } catch (error) {
        console.error("Error al sincronizar foto de perfil:", error)
      }
    }

    // Ejecutar la sincronización al montar el componente
    syncProfilePhoto()

    // Configurar listeners para eventos de cambio de foto
    const handleProfilePhotoChange = () => {
      syncProfilePhoto()
    }

    // Escuchar eventos de cambio de foto
    window.addEventListener("profilePhotoChange", handleProfilePhotoChange)
    document.addEventListener("userAvatarUpdate", handleProfilePhotoChange)

    // Limpiar event listeners al desmontar
    return () => {
      window.removeEventListener("profilePhotoChange", handleProfilePhotoChange)
      document.removeEventListener("userAvatarUpdate", handleProfilePhotoChange)
    }
  }, [])

  /**
   * Obtiene los datos del usuario desde la API
   */
  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Obtener el ID del usuario del localStorage
      const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
      const userId = storedUserData.id

      if (!userId) {
        toast.error("No se pudo identificar al usuario")
        setLoading(false)
        return
      }

      setUserId(userId)

      // Obtener datos del perfil
      const profileData = await userProfileService.getUserById(userId)

      // Obtener el documento directamente del localStorage si está disponible
      const storedDocumento =
        storedUserData.documento || storedUserData.Documento || profileData.Documento || "1234567890"

      // Estrategia en cascada para obtener la foto de perfil
      let profilePhoto = null

      // 1. Intentar obtener del servidor (prioridad máxima)
      if (profileData && profileData.Foto) {
        profilePhoto = profileData.Foto
        // Guardar en localStorage y userData para persistencia
        localStorage.setItem("userProfilePhoto", profilePhoto)
        storedUserData.Foto = profilePhoto
        localStorage.setItem("userData", JSON.stringify(storedUserData))
      }
      // 2. Si no hay en el servidor, intentar obtener del localStorage
      else {
        const storedPhoto = localStorage.getItem("userProfilePhoto")
        if (storedPhoto) {
          profilePhoto = storedPhoto

          // Sincronizar con el servidor si tenemos una foto local pero no en el servidor
          if (storedPhoto.startsWith("http") && !profileData.Foto) {
            try {
              await userProfileService.updateProfile(userId, { Foto: storedPhoto })
              console.log("Foto de perfil sincronizada con el servidor")
            } catch (syncError) {
              console.error("Error al sincronizar foto con el servidor:", syncError)
            }
          }
        }
      }

      // Actualizar el estado con los datos obtenidos
      setUserData({
        Nombre: profileData.Nombre || "",
        Apellido: profileData.Apellido || "",
        Telefono: profileData.Telefono || "",
        Direccion: profileData.Direccion || "",
        Documento: storedDocumento, // Usar el documento del localStorage
        Correo: profileData.Correo || "",
        ContraseñaOld: "",
        ContraseñaNew: "",
        ContraseñaConfirm: "",
        Foto: profilePhoto,
      })

      // Sincronizar la foto con el avatar en la barra de navegación
      if (profilePhoto) {
        userProfileService.emitProfilePhotoChange(profilePhoto)
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      toast.error("Error al cargar datos del perfil")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Maneja cambios en los inputs
   * @param {Event} e - Evento del input
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validación de contraseñas
    if (name === "ContraseñaNew" || name === "ContraseñaConfirm") {
      validatePasswords(name, value)
    }
  }

  /**
   * Validación de contraseñas
   * @param {string} field - Campo a validar
   * @param {string} value - Valor del campo
   */
  const validatePasswords = (field, value) => {
    const newValidation = { ...validation }

    if (field === "ContraseñaNew") {
      if (value.length > 0 && value.length < 6) {
        newValidation.ContraseñaNew = "La contraseña debe tener al menos 6 caracteres"
      } else {
        newValidation.ContraseñaNew = ""
      }

      if (userData.ContraseñaConfirm && value !== userData.ContraseñaConfirm) {
        newValidation.ContraseñaConfirm = "Las contraseñas no coinciden"
      } else if (userData.ContraseñaConfirm) {
        newValidation.ContraseñaConfirm = ""
      }
    }

    if (field === "ContraseñaConfirm") {
      if (value !== userData.ContraseñaNew) {
        newValidation.ContraseñaConfirm = "Las contraseñas no coinciden"
      } else {
        newValidation.ContraseñaConfirm = ""
      }
    }

    setValidation(newValidation)
  }

  /**
   * Activa el modo edición para un campo específico
   * @param {string} field - Campo a editar
   */
  const toggleEditMode = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))

    // Si estamos cancelando la edición de contraseña, limpiamos los campos
    if (field === "Contraseña" && editMode.Contraseña) {
      setUserData((prev) => ({
        ...prev,
        ContraseñaOld: "",
        ContraseñaNew: "",
        ContraseñaConfirm: "",
      }))
      setValidation({
        ContraseñaOld: "",
        ContraseñaNew: "",
        ContraseñaConfirm: "",
      })
    }
  }

  /**
   * Maneja la selección de imagen de perfil
   */
  const handleImageClick = () => {
    if (editMode.Foto) {
      fileInputRef.current.click()
    }
  }

  /**
   * Maneja el cambio de imagen de perfil - USANDO EL SERVICIO CENTRALIZADO
   * @param {Event} e - Evento del input file
   */
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // Mostrar mensaje de carga
      const toastId = toast.loading("Subiendo imagen...", { autoClose: false })

      // Indicar que la imagen está cargando
      setImageUploading(true)

      try {
        // Subir la imagen usando el servicio centralizado
        const result = await userProfileService.updateProfileImage(userId, file)

        // Actualizar toast
        toast.update(toastId, {
          render: "Imagen de perfil actualizada correctamente",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })

        // Actualizar la imagen en el estado
        setUserData((prev) => ({
          ...prev,
          Foto: result.foto,
        }))

        console.log("Foto de perfil actualizada:", result.foto)
      } catch (uploadError) {
        console.error("Error al subir imagen:", uploadError)

        // Mensaje más detallado para el usuario
        let errorMessage = "Error al subir imagen"
        if (uploadError.response) {
          errorMessage += `: ${uploadError.response.status} - ${uploadError.response.data?.message || "Error del servidor"}`
        } else if (uploadError.message) {
          errorMessage += `: ${uploadError.message}`
        }

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        })
      } finally {
        setImageUploading(false)
      }
    } catch (error) {
      console.error("Error al procesar imagen:", error)
      toast.error(error.message || "Error al actualizar la imagen de perfil")
      setImageUploading(false)
    }
  }

  /**
   * Guarda los cambios del perfil
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Verificar si hay campos en modo edición
      const hasChanges = Object.values(editMode).some((mode) => mode)

      if (!hasChanges) {
        toast.info("No hay cambios para guardar")
        setSaving(false)
        return
      }

      // Preparar datos para actualizar
      const updateData = {}

      if (editMode.Nombre) updateData.Nombre = userData.Nombre
      if (editMode.Apellido) updateData.Apellido = userData.Apellido
      if (editMode.Telefono) updateData.Telefono = userData.Telefono
      if (editMode.Direccion) updateData.Direccion = userData.Direccion

      // Si tenemos una foto en el estado y está en modo edición, incluirla
      if (editMode.Foto && userData.Foto) {
        updateData.Foto = userData.Foto
      }

      // Actualizar datos de perfil si hay cambios en campos básicos
      if (Object.keys(updateData).length > 0) {
        try {
          const updatedProfile = await userProfileService.updateProfile(userId, updateData)

          // Actualizar también en localStorage
          const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
          Object.keys(updateData).forEach((key) => {
            storedUserData[key] = updateData[key]
          })
          localStorage.setItem("userData", JSON.stringify(storedUserData))

          // Si se actualizó la foto, sincronizar con el avatar
          if (updateData.Foto) {
            userProfileService.emitProfilePhotoChange(updateData.Foto)
          }

          toast.success("Perfil actualizado correctamente")
        } catch (updateError) {
          console.error("Error al actualizar perfil en el servidor:", updateError)

          // Actualizar localStorage de todos modos para mantener los cambios localmente
          const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
          Object.keys(updateData).forEach((key) => {
            storedUserData[key] = updateData[key]
          })
          localStorage.setItem("userData", JSON.stringify(storedUserData))

          // Si se actualizó la foto, sincronizar con el avatar aunque haya error en el servidor
          if (updateData.Foto) {
            userProfileService.emitProfilePhotoChange(updateData.Foto)
          }

          toast.warning("Los cambios se guardaron localmente pero no se pudieron actualizar en el servidor")
        }
      }

      // Cambiar contraseña si está en modo edición
      if (editMode.Contraseña) {
        // Validar que las contraseñas coincidan
        if (userData.ContraseñaNew !== userData.ContraseñaConfirm) {
          toast.error("Las contraseñas no coinciden")
          setSaving(false)
          return
        }

        // Validar que la contraseña tenga al menos 6 caracteres
        if (userData.ContraseñaNew.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres")
          setSaving(false)
          return
        }

        try {
          // Cambiar contraseña
          await userProfileService.changePassword(userId, {
            passwordOld: userData.ContraseñaOld,
            passwordNew: userData.ContraseñaNew,
          })

          toast.success("Contraseña actualizada correctamente")
        } catch (passwordError) {
          console.error("Error al cambiar contraseña:", passwordError)

          let errorMessage = "Error al cambiar contraseña"
          if (passwordError.response && passwordError.response.data) {
            errorMessage += `: ${passwordError.response.data.message || "Error del servidor"}`
          }

          toast.error(errorMessage)
          setSaving(false)
          return
        }
      }

      // Desactivamos todos los modos de edición
      setEditMode({
        Nombre: false,
        Apellido: false,
        Telefono: false,
        Direccion: false,
        Contraseña: false,
        Foto: false,
      })

      // Limpiamos los campos de contraseña
      setUserData((prev) => ({
        ...prev,
        ContraseñaOld: "",
        ContraseñaNew: "",
        ContraseñaConfirm: "",
      }))

      // Recargar datos del usuario
      fetchUserData()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)

      // Mostrar mensaje de error específico si está disponible
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Error al actualizar el perfil")
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Cancela todos los cambios
   */
  const handleCancel = () => {
    // Recargar los datos originales
    fetchUserData()

    // Desactivamos todos los modos de edición
    setEditMode({
      Nombre: false,
      Apellido: false,
      Telefono: false,
      Direccion: false,
      Contraseña: false,
      Foto: false,
    })

    setValidation({
      ContraseñaOld: "",
      ContraseñaNew: "",
      ContraseñaConfirm: "",
    })

    toast.info("Cambios cancelados")
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary me-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="fs-5">Cargando perfil...</span>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h4 className="card-title mb-0">
            <FiUser className="me-2" />
            Mi Perfil
          </h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              {/* Sección de imagen de perfil */}
              <ProfileImageSection
                userData={userData}
                editMode={editMode}
                fileInputRef={fileInputRef}
                handleImageClick={handleImageClick}
                handleImageChange={handleImageChange}
                toggleEditMode={toggleEditMode}
                isUploading={imageUploading}
              />

              {/* Sección de información personal */}
              <PersonalInfoSection
                userData={userData}
                editMode={editMode}
                handleChange={handleChange}
                toggleEditMode={toggleEditMode}
              />
            </div>

            {/* Sección de Contraseña */}
            <PasswordSection
              userData={userData}
              editMode={editMode}
              validation={validation}
              handleChange={handleChange}
              toggleEditMode={toggleEditMode}
            />

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={saving || imageUploading}
              >
                <FiX className="me-1" /> Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || imageUploading}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiSave className="me-1" /> Actualizar Perfil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
