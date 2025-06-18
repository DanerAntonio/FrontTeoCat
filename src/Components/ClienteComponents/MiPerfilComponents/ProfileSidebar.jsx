"use client"

import { useRef } from "react"
import { Link } from "react-router-dom"
import { Card, Nav } from "react-bootstrap"
import { toast } from "react-toastify"
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from "../../../Services/uploadImageToCloudinary.js"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfileSidebar.scss"

const ProfileSidebar = ({ user, activeTab, setActiveTab, updateUser }) => {
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef(null)

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    const firstName = user.nombre || user.Nombre || ""
    const lastName = user.apellido || user.Apellido || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Obtener URL de la foto de perfil
  const getProfileImageUrl = () => {
    const imageUrl = user.fotoURL || user.Foto || user.profileImage
    return imageUrl ? optimizeCloudinaryUrl(imageUrl) : null
  }

  // Manejar clic en la imagen de perfil - abrir explorador de archivos directamente
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Manejar selección de archivo y subida automática
  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB")
      return
    }

    // Mostrar toast de inicio de subida
    const uploadToast = toast.loading("Subiendo imagen...")

    try {
      // Subir imagen a Cloudinary
      const imageUrl = await uploadImageToCloudinary(file, "perfiles")

      if (!imageUrl) {
        throw new Error("Error al subir la imagen a Cloudinary")
      }

      // ✅ ENVIAR DATOS CORRECTAMENTE - usar los nombres de campo que espera el backend
      const updatedData = {
        Foto: imageUrl, // ✅ Usar 'Foto' en lugar de 'foto'
      }

      console.log("📤 Enviando datos de foto:", updatedData)

      await perfilClienteService.updateMyProfile(updatedData)

      // Recargar datos del perfil
      const profileData = await perfilClienteService.getMyProfile()
      const processedUser = {
        ...profileData,
        telefonos: perfilClienteService.processPhoneNumbers(profileData.Telefono || profileData.telefono),
        direcciones: perfilClienteService.processAddresses(profileData.Direccion || profileData.direccion),
      }

      // Actualizar el usuario en el componente padre
      updateUser(processedUser)

      // Actualizar toast a éxito
      toast.update(uploadToast, {
        render: "Foto de perfil actualizada correctamente",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error al subir foto:", error)

      // Actualizar toast a error
      toast.update(uploadToast, {
        render: "Error al actualizar la foto de perfil",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }

    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ""
  }

  return (
    <>
      <Card className="tc-profile-sidebar border-0 shadow">
        <Card.Body className="p-0">
          <div className="tc-profile-header">
            <div className="tc-profile-image-container" onClick={handleImageClick}>
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl() || "//vite.svg
"}
                  alt={`${user.nombre} ${user.apellido}`}
                  className="tc-profile-image"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
              ) : (
                <div className="tc-profile-image-placeholder">{getUserInitials()}</div>
              )}
              <div className="tc-profile-image-overlay">
                <i className="bi bi-camera"></i>
                <small>Cambiar foto</small>
              </div>
            </div>
            <h4 className="tc-profile-name">
              {user.nombre || user.Nombre} {user.apellido || user.Apellido}
            </h4>
            <p className="tc-profile-email">{user.correo || user.Correo}</p>
          </div>

          <Nav className="tc-profile-nav flex-column">
            <Nav.Link
              as="button"
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <i className="bi bi-person tc-nav-icon"></i>
              Mi Perfil
            </Nav.Link>
            <Nav.Link as="button" className={activeTab === "pets" ? "active" : ""} onClick={() => setActiveTab("pets")}>
              <i className="bi bi-heart tc-nav-icon"></i>
              Mis Mascotas
            </Nav.Link>
            <Nav.Link
              as="button"
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <i className="bi bi-box-seam tc-nav-icon"></i>
              Mis Pedidos
            </Nav.Link>
            <Nav.Link
              as="button"
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              <i className="bi bi-calendar-check tc-nav-icon"></i>
              Mis Citas
            </Nav.Link>
            <Nav.Link
              as="button"
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              <i className="bi bi-star tc-nav-icon"></i>
              Mis Reseñas
            </Nav.Link>
            <Nav.Link
              as="button"
              className={activeTab === "password" ? "active" : ""}
              onClick={() => setActiveTab("password")}
            >
              <i className="bi bi-shield-lock tc-nav-icon"></i>
              Cambiar Contraseña
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="text-danger" onClick={() => localStorage.removeItem("token")}>
              <i className="bi bi-box-arrow-right tc-nav-icon"></i>
              Cerrar Sesión
            </Nav.Link>
          </Nav>
        </Card.Body>
      </Card>

      {/* Input de archivo oculto */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: "none" }} />
    </>
  )
}

export default ProfileSidebar
