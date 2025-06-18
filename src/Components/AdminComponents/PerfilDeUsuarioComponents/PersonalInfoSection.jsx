"use client"

import { FiUser, FiPhone, FiMapPin, FiFileText, FiLock, FiCheck, FiEdit2, FiMail } from "react-icons/fi"

/**
 * Componente para la sección de información personal
 */
const PersonalInfoSection = ({ userData, editMode, handleChange, toggleEditMode }) => {
  // Verificar si userData.Documento existe y tiene un valor
  console.log("Valor de Documento en PersonalInfoSection:", userData.Documento)

  return (
    <div className="col-md-9">
      <div className="row g-3">
        {/* Documento (No editable) - Ahora es el primer campo */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Documento</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiFileText />
              </span>
              <input
                type="text"
                className="form-control bg-light"
                name="Documento"
                value={userData.Documento || ""}
                disabled
                maxLength={20}
              />
              <button type="button" className="btn btn-outline-secondary" disabled title="No editable">
                <FiLock />
              </button>
            </div>
            <small className="text-muted">El documento no es editable (máximo 20 caracteres)</small>
          </div>
        </div>

        {/* Nombre */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Nombre</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiUser />
              </span>
              <input
                type="text"
                className="form-control"
                name="Nombre"
                value={userData.Nombre || ""}
                onChange={handleChange}
                disabled={!editMode.Nombre}
                maxLength={100}
              />
              <button
                type="button"
                className={`btn ${editMode.Nombre ? "btn-success" : "btn-outline-primary"}`}
                onClick={() => toggleEditMode("Nombre")}
                title={editMode.Nombre ? "Guardar" : "Editar"}
              >
                {editMode.Nombre ? <FiCheck /> : <FiEdit2 />}
              </button>
            </div>
            <small className="text-muted">Máximo 100 caracteres.</small>
          </div>
        </div>

        {/* Apellido */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Apellido</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiUser />
              </span>
              <input
                type="text"
                className="form-control"
                name="Apellido"
                value={userData.Apellido || ""}
                onChange={handleChange}
                disabled={!editMode.Apellido}
                maxLength={100}
              />
              <button
                type="button"
                className={`btn ${editMode.Apellido ? "btn-success" : "btn-outline-primary"}`}
                onClick={() => toggleEditMode("Apellido")}
                title={editMode.Apellido ? "Guardar" : "Editar"}
              >
                {editMode.Apellido ? <FiCheck /> : <FiEdit2 />}
              </button>
            </div>
            <small className="text-muted">Máximo 100 caracteres.</small>
          </div>
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Teléfono</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiPhone />
              </span>
              <input
                type="tel"
                className="form-control"
                name="Telefono"
                value={userData.Telefono || ""}
                onChange={handleChange}
                disabled={!editMode.Telefono}
                maxLength={20}
              />
              <button
                type="button"
                className={`btn ${editMode.Telefono ? "btn-success" : "btn-outline-primary"}`}
                onClick={() => toggleEditMode("Telefono")}
                title={editMode.Telefono ? "Guardar" : "Editar"}
              >
                {editMode.Telefono ? <FiCheck /> : <FiEdit2 />}
              </button>
            </div>
            <small className="text-muted">Máximo 20 caracteres.</small>
          </div>
        </div>

        {/* Correo */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiMail />
              </span>
              <input
                type="email"
                className="form-control bg-light"
                name="Correo"
                value={userData.Correo || ""}
                disabled
                maxLength={100}
              />
              <button type="button" className="btn btn-outline-secondary" disabled title="No editable">
                <FiLock />
              </button>
            </div>
            <small className="text-muted">El correo no es editable (máximo 100 caracteres)</small>
          </div>
        </div>

        {/* Dirección */}
        <div className="col-md-6">
          <div className="profile-field">
            <label className="form-label">Dirección</label>
            <div className="input-group">
              <span className="input-group-text">
                <FiMapPin />
              </span>
              <input
                type="text"
                className="form-control"
                name="Direccion"
                value={userData.Direccion || ""}
                onChange={handleChange}
                disabled={!editMode.Direccion}
              />
              <button
                type="button"
                className={`btn ${editMode.Direccion ? "btn-success" : "btn-outline-primary"}`}
                onClick={() => toggleEditMode("Direccion")}
                title={editMode.Direccion ? "Guardar" : "Editar"}
              >
                {editMode.Direccion ? <FiCheck /> : <FiEdit2 />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoSection
