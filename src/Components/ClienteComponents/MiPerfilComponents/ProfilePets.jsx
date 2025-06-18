"use client"

import { useState, useRef, useEffect } from "react"
import { Card, Button, Row, Col, Alert, Badge, Modal, Form, Spinner } from "react-bootstrap"
import { toast } from "react-toastify"
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from "../../../Services/uploadImageToCloudinary.js"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService.js"
import "../MiPerfilComponents/ProfilePets.scss"

const ProfilePets = ({ pets, updatePets }) => {
  const fileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  // Estados de carga
  const [loading, setLoading] = useState(false)
  const [addingPet, setAddingPet] = useState(false)
  const [editingPetLoading, setEditingPetLoading] = useState(false)

  // Estado para las especies disponibles
  const [especies, setEspecies] = useState([])
  const [loadingEspecies, setLoadingEspecies] = useState(false)

  // Estado para el modal de nueva mascota
  const [showPetModal, setShowPetModal] = useState(false)

  // ✅ CORREGIDO: Estado inicial con validaciones mejoradas
  const [newPetForm, setNewPetForm] = useState({
    nombre: "",
    idEspecie: "",
    raza: "",
    tamaño: "Pequeño", // Valor por defecto válido
    fechaNacimiento: "",
    foto: null, // Para archivo
    fotoUrl: "", // Para URL de Cloudinary
    fotoPreview: "",
  })

  // Estado para el modal de editar mascota
  const [showEditPetModal, setShowEditPetModal] = useState(false)
  const [editingPet, setEditingPet] = useState(null)

  // Estado para mostrar detalles de mascota
  const [showPetDetails, setShowPetDetails] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)

  // ✅ CONSTANTES DE VALIDACIÓN (igual que el backend)
  const TAMAÑOS_VALIDOS = ["Pequeño", "Mediano", "Grande"]

  // Cargar especies al montar el componente
  useEffect(() => {
    loadEspecies()
  }, [])

  const loadEspecies = async () => {
    try {
      setLoadingEspecies(true)
      const especiesData = await perfilClienteService.getSpecies()
      setEspecies(especiesData)
    } catch (error) {
      console.error("Error al cargar especies:", error)
      toast.error("Error al cargar las especies")
    } finally {
      setLoadingEspecies(false)
    }
  }

  const loadPets = async () => {
    try {
      setLoading(true)
      const petsData = await perfilClienteService.getMyPets()
      updatePets(petsData)
    } catch (error) {
      console.error("Error al cargar mascotas:", error)
      toast.error("Error al cargar las mascotas")
    } finally {
      setLoading(false)
    }
  }

  // ✅ CORREGIDO: Manejar cambios en el formulario
  const handleNewPetChange = (e) => {
    const { name, value } = e.target

    setNewPetForm({
      ...newPetForm,
      [name]: value,
    })
  }

  // ✅ CORREGIDO: Manejar cambio de archivo para nueva mascota (igual que ProfileSidebar)
  const handlePetPhotoChange = async (e) => {
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

    // Mostrar toast de carga
    const uploadToast = toast.loading("Subiendo imagen...")

    try {
      // ✅ SUBIR A CLOUDINARY DIRECTAMENTE (igual que ProfileSidebar)
      const imageUrl = await uploadImageToCloudinary(file, "mascotas")

      if (!imageUrl) {
        throw new Error("Error al subir la imagen a Cloudinary")
      }

      // ✅ GUARDAR LA URL, NO EL ARCHIVO
      setNewPetForm({
        ...newPetForm,
        foto: null, // No archivo
        fotoUrl: imageUrl, // URL de Cloudinary
        fotoPreview: imageUrl, // Preview con la URL
      })

      // Actualizar toast a éxito
      toast.update(uploadToast, {
        render: "Imagen subida correctamente",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast.update(uploadToast, {
        render: "Error al subir la imagen",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  // ✅ CORREGIDO: Manejar cambio de archivo para editar mascota
  const handleEditPetPhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB")
      return
    }

    const uploadToast = toast.loading("Subiendo imagen...")

    try {
      // ✅ SUBIR A CLOUDINARY DIRECTAMENTE
      const imageUrl = await uploadImageToCloudinary(file, "mascotas")

      if (!imageUrl) {
        throw new Error("Error al subir la imagen a Cloudinary")
      }

      // ✅ GUARDAR LA URL, NO EL ARCHIVO
      setEditingPet({
        ...editingPet,
        foto: null, // No archivo
        fotoUrl: imageUrl, // URL de Cloudinary
        fotoPreview: imageUrl, // Preview con la URL
      })

      toast.update(uploadToast, {
        render: "Imagen subida correctamente",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast.update(uploadToast, {
        render: "Error al subir la imagen",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const handleEditPetChange = (e) => {
    const { name, value } = e.target
    setEditingPet({
      ...editingPet,
      [name]: value,
    })
  }

  // ✅ CORREGIDO: Agregar nueva mascota
  const handleAddPet = async (e) => {
    e.preventDefault()
    setAddingPet(true)

    try {
      // ✅ VALIDACIONES MEJORADAS (igual que el backend)
      if (!newPetForm.nombre?.trim()) {
        toast.error("El nombre es requerido")
        return
      }

      if (!newPetForm.idEspecie) {
        toast.error("La especie es requerida")
        return
      }

      if (!newPetForm.raza?.trim()) {
        toast.error("La raza es requerida")
        return
      }

      if (!newPetForm.tamaño?.trim()) {
        toast.error("El tamaño es requerido")
        return
      }

      if (!TAMAÑOS_VALIDOS.includes(newPetForm.tamaño)) {
        toast.error(`Tamaño inválido. Debe ser: ${TAMAÑOS_VALIDOS.join(", ")}`)
        return
      }

      if (!newPetForm.fechaNacimiento) {
        toast.error("La fecha de nacimiento es requerida")
        return
      }

      // ✅ VALIDAR FECHA (igual que el backend)
      const fechaNacimiento = new Date(newPetForm.fechaNacimiento)
      const hoy = new Date()

      if (fechaNacimiento > hoy) {
        toast.error("La fecha de nacimiento no puede ser futura")
        return
      }

      const treintaAñosAtras = new Date()
      treintaAñosAtras.setFullYear(hoy.getFullYear() - 30)
      if (fechaNacimiento < treintaAñosAtras) {
        toast.error("La fecha de nacimiento no puede ser anterior a hace 30 años")
        return
      }

      // ✅ PREPARAR DATOS EN FORMATO CORRECTO
      const petData = {
        nombre: newPetForm.nombre.trim(),
        idEspecie: Number.parseInt(newPetForm.idEspecie, 10),
        raza: newPetForm.raza.trim(),
        tamaño: newPetForm.tamaño, // ✅ ASEGURAR QUE SIEMPRE TENGA VALOR
        fechaNacimiento: newPetForm.fechaNacimiento,
        foto: newPetForm.fotoUrl || null,
      }

      // ✅ VALIDACIÓN ADICIONAL ANTES DE ENVIAR
      if (!petData.tamaño || !TAMAÑOS_VALIDOS.includes(petData.tamaño)) {
        petData.tamaño = "Pequeño" // ✅ Forzar valor por defecto
      }

      console.log("📤 Enviando datos de mascota:", petData)
      console.log("🔍 Tamaño específico:", petData.tamaño)
      console.log("🔍 Estado específico:", petData.estado)

      // ✅ ENVIAR SIN ARCHIVO (ya está la URL en petData.foto)
      await perfilClienteService.createMyPet(petData, null) // null porque no hay archivo

      // Recargar mascotas
      await loadPets()

      // ✅ RESET FORM COMPLETO
      setShowPetModal(false)
      setNewPetForm({
        nombre: "",
        idEspecie: "",
        raza: "",
        tamaño: "Pequeño",
        fechaNacimiento: "",
        foto: null,
        fotoUrl: "",
        fotoPreview: "",
      })

      // Limpiar input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Mascota agregada correctamente")
    } catch (error) {
      console.error("❌ Error al crear mascota:", error)

      // ✅ MANEJO DE ERRORES MEJORADO
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Error al crear la mascota")
      }
    } finally {
      setAddingPet(false)
    }
  }

  // ✅ CORREGIDO: Abrir modal para editar mascota
  const handleEditPetClick = (pet) => {
    const petToEdit = {
      ...pet,
      nombre: pet.Nombre || pet.nombre,
      idEspecie: pet.IdEspecie || pet.idEspecie || "",
      raza: pet.Raza || pet.raza,
      tamaño: pet.Tamaño || pet.tamaño || "Pequeño",
      // ✅ FORMATEAR FECHA CORRECTAMENTE PARA INPUT DATE
      fechaNacimiento:
        pet.FechaNacimiento || pet.fechaNacimiento
          ? new Date(pet.FechaNacimiento || pet.fechaNacimiento).toISOString().split("T")[0]
          : "",
      foto: null,
      fotoUrl: pet.Foto || pet.image || "",
      fotoPreview: pet.Foto || pet.image || "",
    }
    setEditingPet(petToEdit)
    setShowEditPetModal(true)
  }

  const handleViewPetDetails = (pet) => {
    setSelectedPet({ ...pet })
    setShowPetDetails(true)
  }

  // ✅ CORREGIDO: Guardar cambios de mascota
  const handleSavePet = async (e) => {
    e.preventDefault()
    setEditingPetLoading(true)

    try {
      // ✅ VALIDACIONES (igual que crear)
      if (!editingPet.nombre?.trim()) {
        toast.error("El nombre es requerido")
        return
      }

      if (!editingPet.idEspecie) {
        toast.error("La especie es requerida")
        return
      }

      if (!editingPet.raza?.trim()) {
        toast.error("La raza es requerida")
        return
      }

      if (!editingPet.tamaño) {
        toast.error("El tamaño es requerido")
        return
      }

      if (!TAMAÑOS_VALIDOS.includes(editingPet.tamaño)) {
        toast.error(`Tamaño inválido. Debe ser: ${TAMAÑOS_VALIDOS.join(", ")}`)
        return
      }

      if (!editingPet.fechaNacimiento) {
        toast.error("La fecha de nacimiento es requerida")
        return
      }

      // ✅ PREPARAR DATOS EN FORMATO CORRECTO
      const petData = {
        nombre: editingPet.nombre.trim(),
        idEspecie: Number.parseInt(editingPet.idEspecie, 10),
        raza: editingPet.raza.trim(),
        tamaño: editingPet.tamaño, // ✅ ASEGURAR QUE SIEMPRE TENGA VALOR
        fechaNacimiento: editingPet.fechaNacimiento,
        foto: editingPet.fotoUrl || editingPet.fotoPreview || null,
      }

      // ✅ VALIDACIÓN ADICIONAL ANTES DE ENVIAR
      if (!petData.tamaño || !TAMAÑOS_VALIDOS.includes(petData.tamaño)) {
        petData.tamaño = "Pequeño" // ✅ Forzar valor por defecto
      }

      console.log("📤 Actualizando mascota:", petData)
      console.log("🔍 Tamaño específico:", petData.tamaño)
      console.log("🔍 Estado específico:", petData.estado)

      // ✅ ENVIAR SIN ARCHIVO
      await perfilClienteService.updateMyPet(
        editingPet.IdMascota || editingPet.id,
        petData,
        null, // null porque no hay archivo
      )

      // Recargar mascotas
      await loadPets()

      // Cerrar modal
      setShowEditPetModal(false)
      setEditingPet(null)

      toast.success("Mascota actualizada correctamente")
    } catch (error) {
      console.error("❌ Error al actualizar mascota:", error)

      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Error al actualizar la mascota")
      }
    } finally {
      setEditingPetLoading(false)
    }
  }

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (years === 0) {
      return `${months} meses`
    } else if (months === 0) {
      return `${years} años`
    } else {
      return `${years} años y ${months} meses`
    }
  }

  const getEspecieNameById = (idEspecie) => {
    const especie = especies.find((e) => e.IdEspecie === idEspecie)
    return especie ? especie.NombreEspecie : "Desconocida"
  }

  return (
    <>
      <Card className="border-0 shadow">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mis Mascotas</h4>
            <Button variant="success" size="sm" onClick={() => setShowPetModal(true)} disabled={loading}>
              <i className="bi bi-plus-circle me-1"></i> Añadir Mascota
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando mascotas...</p>
            </div>
          ) : pets.length === 0 ? (
            <Alert variant="info">
              <div className="text-center py-4">
                <i className="bi bi-emoji-smile fs-1 mb-3"></i>
                <h5>No tienes mascotas registradas</h5>
                <p className="mb-3">Registra a tus compañeros peludos para gestionar mejor sus citas y servicios.</p>
                <Button variant="success" onClick={() => setShowPetModal(true)}>
                  <i className="bi bi-plus-circle me-1"></i> Añadir Mascota
                </Button>
              </div>
            </Alert>
          ) : (
            <Row className="g-4">
              {pets.map((pet) => (
                <Col md={6} key={pet.IdMascota || pet.id}>
                  <Card className="tc-pet-card h-100">
                    <Row className="g-0">
                      <Col xs={4}>
                        <div className="tc-pet-image-container">
                          <img
                            src={
                              optimizeCloudinaryUrl(pet.Foto || pet.image) || "/placeholder.svg?height=150&width=150"
                            }
                            alt={pet.Nombre || pet.nombre}
                            className="tc-pet-image"
                          />
                        </div>
                      </Col>
                      <Col xs={8}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <Card.Title className="tc-pet-name">{pet.Nombre || pet.nombre}</Card.Title>
                            <Badge
                              bg={
                                (pet.NombreEspecie || getEspecieNameById(pet.IdEspecie)) === "Perro"
                                  ? "success"
                                  : "info"
                              }
                              className="tc-pet-badge"
                            >
                              {pet.NombreEspecie || getEspecieNameById(pet.IdEspecie)}
                            </Badge>
                          </div>
                          <Card.Text as="div" className="tc-pet-details">
                            <p className="mb-1">
                              <strong>Raza:</strong> {pet.Raza || pet.raza}
                            </p>
                            <p className="mb-1">
                              <strong>Tamaño:</strong> {pet.Tamaño || pet.tamaño}
                            </p>
                            <p className="mb-3">
                              <strong>Nacimiento:</strong>{" "}
                              {new Date(pet.FechaNacimiento || pet.fechaNacimiento).toLocaleDateString()}
                            </p>
                            <div className="tc-pet-actions">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewPetDetails(pet)}
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button variant="outline-success" size="sm" onClick={() => handleEditPetClick(pet)}>
                                <i className="bi bi-pencil"></i>
                              </Button>
                            </div>
                          </Card.Text>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* ✅ MODAL CORREGIDO PARA AGREGAR MASCOTA */}
      <Modal show={showPetModal} onHide={() => setShowPetModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-gradient-success text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-heart-fill me-2"></i>
            Agregar Nueva Mascota
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddPet}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="petNombre">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-tag me-2 text-success"></i>
                    Nombre de la mascota *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Max, Luna, Firulais..."
                    name="nombre"
                    value={newPetForm.nombre}
                    onChange={handleNewPetChange}
                    className="form-control-lg"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="petEspecie">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-award me-2 text-info"></i>
                    Especie *
                  </Form.Label>
                  <Form.Select
                    name="idEspecie"
                    value={newPetForm.idEspecie}
                    onChange={handleNewPetChange}
                    className="form-control-lg"
                    required
                  >
                    <option value="">🐾 Seleccionar especie...</option>
                    {loadingEspecies ? (
                      <option disabled>⏳ Cargando especies...</option>
                    ) : (
                      especies.map((especie) => (
                        <option key={especie.IdEspecie} value={especie.IdEspecie}>
                          {especie.NombreEspecie === "Perro"
                            ? "🐕"
                            : especie.NombreEspecie === "Gato"
                              ? "🐱"
                              : especie.NombreEspecie === "Ave"
                                ? "🐦"
                                : "🐾"}{" "}
                          {especie.NombreEspecie}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group controlId="petRaza">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-gem me-2 text-warning"></i>
                    Raza *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Labrador, Siamés..."
                    name="raza"
                    value={newPetForm.raza}
                    onChange={handleNewPetChange}
                    className="form-control-lg"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="petTamaño">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-rulers me-2 text-primary"></i>
                    Tamaño *
                  </Form.Label>
                  <Form.Select
                    name="tamaño"
                    value={newPetForm.tamaño}
                    onChange={handleNewPetChange}
                    className="form-control-lg"
                    required
                  >
                    {TAMAÑOS_VALIDOS.map((tamaño) => (
                      <option key={tamaño} value={tamaño}>
                        {tamaño === "Pequeño" && "🐭"}
                        {tamaño === "Mediano" && "🐕"}
                        {tamaño === "Grande" && "🐕‍🦺"} {tamaño}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="petFechaNacimiento">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-calendar-heart me-2 text-danger"></i>
                    Fecha de nacimiento *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaNacimiento"
                    value={newPetForm.fechaNacimiento}
                    onChange={handleNewPetChange}
                    className="form-control-lg"
                    max={new Date().toISOString().split("T")[0]} // ✅ NO PERMITIR FECHAS FUTURAS
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Group controlId="petFoto">
                  <Form.Label className="fw-bold text-dark">
                    <i className="bi bi-camera me-2 text-success"></i>
                    Foto de la mascota
                  </Form.Label>
                  <div className="photo-upload-section p-3 border rounded bg-light">
                    <Row className="align-items-center">
                      <Col md={4}>
                        <div className="text-center">
                          <Button
                            variant="outline-success"
                            size="lg"
                            onClick={() => fileInputRef.current.click()}
                            className="w-100"
                          >
                            <i className="bi bi-cloud-upload me-2"></i>
                            Subir imagen
                          </Button>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePetPhotoChange}
                            style={{ display: "none" }}
                          />
                          <small className="text-muted d-block mt-2">
                            {newPetForm.fotoUrl ? ( // ✅ Cambiar de .foto a .fotoUrl
                              <span className="text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Imagen subida
                              </span>
                            ) : (
                              "Ningún archivo seleccionado"
                            )}
                          </small>
                        </div>
                      </Col>
                      <Col md={8}>
                        {newPetForm.fotoPreview ? (
                          <div className="text-center">
                            <img
                              src={newPetForm.fotoPreview || "/placeholder.svg"}
                              alt="Vista previa"
                              className="img-thumbnail shadow"
                              style={{ maxHeight: "120px", maxWidth: "120px", objectFit: "cover" }}
                            />
                            <p className="small text-muted mt-2 mb-0">Vista previa de la imagen</p>
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <i className="bi bi-image" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                            <p className="mb-0">La imagen aparecerá aquí</p>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Sube una foto de tu mascota (opcional). Formatos: JPG, PNG. Máximo 5MB.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => setShowPetModal(false)}
                    disabled={addingPet}
                    className="px-4"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </Button>
                  <Button variant="success" size="lg" type="submit" disabled={addingPet} className="px-4">
                    {addingPet ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-heart-fill me-2"></i>
                        Guardar Mascota
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ✅ MODAL CORREGIDO PARA EDITAR MASCOTA */}
      <Modal show={showEditPetModal} onHide={() => setShowEditPetModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-gradient-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-pencil-square me-2"></i>
            Editar Mascota
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editingPet && (
            <Form onSubmit={handleSavePet}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group controlId="editPetNombre">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-tag me-2 text-success"></i>
                      Nombre de la mascota *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nombre"
                      name="nombre"
                      value={editingPet.nombre}
                      onChange={handleEditPetChange}
                      className="form-control-lg"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editPetEspecie">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-award me-2 text-info"></i>
                      Especie *
                    </Form.Label>
                    <Form.Select
                      name="idEspecie"
                      value={editingPet.idEspecie}
                      onChange={handleEditPetChange}
                      className="form-control-lg"
                      required
                    >
                      <option value="">🐾 Seleccionar especie...</option>
                      {especies.map((especie) => (
                        <option key={especie.IdEspecie} value={especie.IdEspecie}>
                          {especie.NombreEspecie === "Perro"
                            ? "🐕"
                            : especie.NombreEspecie === "Gato"
                              ? "🐱"
                              : especie.NombreEspecie === "Ave"
                                ? "🐦"
                                : "🐾"}{" "}
                          {especie.NombreEspecie}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group controlId="editPetRaza">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-gem me-2 text-warning"></i>
                      Raza *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Raza"
                      name="raza"
                      value={editingPet.raza}
                      onChange={handleEditPetChange}
                      className="form-control-lg"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="editPetTamaño">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-rulers me-2 text-primary"></i>
                      Tamaño *
                    </Form.Label>
                    <Form.Select
                      name="tamaño"
                      value={editingPet.tamaño}
                      onChange={handleEditPetChange}
                      className="form-control-lg"
                      required
                    >
                      {TAMAÑOS_VALIDOS.map((tamaño) => (
                        <option key={tamaño} value={tamaño}>
                          {tamaño === "Pequeño" && "🐭"}
                          {tamaño === "Mediano" && "🐕"}
                          {tamaño === "Grande" && "🐕‍🦺"} {tamaño}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="editPetFechaNacimiento">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-calendar-heart me-2 text-danger"></i>
                      Fecha de nacimiento *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaNacimiento"
                      value={editingPet.fechaNacimiento}
                      onChange={handleEditPetChange}
                      className="form-control-lg"
                      max={new Date().toISOString().split("T")[0]} // ✅ NO PERMITIR FECHAS FUTURAS
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group controlId="editPetFoto">
                    <Form.Label className="fw-bold text-dark">
                      <i className="bi bi-camera me-2 text-success"></i>
                      Foto de la mascota
                    </Form.Label>
                    <div className="photo-upload-section p-3 border rounded bg-light">
                      <Row className="align-items-center">
                        <Col md={4}>
                          <div className="text-center">
                            <Button
                              variant="outline-primary"
                              size="lg"
                              onClick={() => editFileInputRef.current.click()}
                              className="w-100"
                            >
                              <i className="bi bi-arrow-repeat me-2"></i>
                              Cambiar imagen
                            </Button>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              ref={editFileInputRef}
                              onChange={handleEditPetPhotoChange}
                              style={{ display: "none" }}
                            />
                            <small className="text-muted d-block mt-2">
                              {editingPet.fotoUrl && editingPet.fotoUrl !== editingPet.fotoPreview ? (
                                <span className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Nueva imagen seleccionada
                                </span>
                              ) : (
                                "Mantener imagen actual"
                              )}
                            </small>
                          </div>
                        </Col>
                        <Col md={8}>
                          {editingPet.fotoPreview && (
                            <div className="text-center">
                              <img
                                src={editingPet.fotoPreview || "/placeholder.svg"}
                                alt="Vista previa"
                                className="img-thumbnail shadow"
                                style={{ maxHeight: "120px", maxWidth: "120px", objectFit: "cover" }}
                              />
                              <p className="small text-muted mt-2 mb-0">
                                {editingPet.fotoUrl && editingPet.fotoUrl !== (editingPet.Foto || editingPet.image)
                                  ? "Nueva imagen"
                                  : "Imagen actual"}
                              </p>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => setShowEditPetModal(false)}
                      disabled={editingPetLoading}
                      className="px-4"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar
                    </Button>
                    <Button variant="primary" size="lg" type="submit" disabled={editingPetLoading} className="px-4">
                      {editingPetLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal para ver detalles de mascota */}
      <Modal show={showPetDetails} onHide={() => setShowPetDetails(false)} centered className="tc-pet-details-modal">
        <Modal.Header closeButton>
          <Modal.Title>Carnet de Mascota</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedPet && (
            <div className="tc-pet-carnet">
              <div className="tc-pet-carnet-photo-container">
                <img
                  src={
                    optimizeCloudinaryUrl(selectedPet.Foto || selectedPet.image) ||
                    "/placeholder.svg?height=200&width=200"
                  }
                  alt={selectedPet.Nombre || selectedPet.nombre}
                  className="tc-pet-carnet-photo"
                />
              </div>

              <h2 className="tc-pet-carnet-title">{selectedPet.Nombre || selectedPet.nombre}</h2>

              <div className="tc-pet-carnet-info">
                <Row>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-award"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Especie</h6>
                        <p>{selectedPet.NombreEspecie || getEspecieNameById(selectedPet.IdEspecie)}</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-gem"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Raza</h6>
                        <p>{selectedPet.Raza || selectedPet.raza}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-rulers"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Tamaño</h6>
                        <p>{selectedPet.Tamaño || selectedPet.tamaño}</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-calendar-heart"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Fecha de Nacimiento</h6>
                        <p>
                          {new Date(selectedPet.FechaNacimiento || selectedPet.fechaNacimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-hourglass-split"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Edad</h6>
                        <p>{calculateAge(selectedPet.FechaNacimiento || selectedPet.fechaNacimiento)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="tc-pet-carnet-footer">
                <Button
                  variant="success"
                  className="tc-pet-carnet-btn-edit"
                  onClick={() => {
                    setShowPetDetails(false)
                    handleEditPetClick(selectedPet)
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Editar
                </Button>
              </div>

              <div className="tc-pet-carnet-copyright">
                <p>© {new Date().getFullYear()} Teo/Cat. Todos los derechos reservados.</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ProfilePets
