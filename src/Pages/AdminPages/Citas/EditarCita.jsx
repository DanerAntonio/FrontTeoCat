"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import NuevaCita from "./NuevaCita"

const EditarCita = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const citaId = queryParams.get("id")

  useEffect(() => {
    if (!citaId) {
      navigate("/servicios/AgendarCitas")
    }
  }, [citaId, navigate])

  return <NuevaCita />
}

export default EditarCita
