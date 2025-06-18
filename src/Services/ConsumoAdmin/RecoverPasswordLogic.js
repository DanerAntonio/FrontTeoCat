"use client"

import { useState } from "react"
import authService from "../../Services/ConsumoAdmin/authService"

export const useRecoverPasswordLogic = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email) {
      setError("Por favor ingresa tu correo electrónico")
      setLoading(false)
      return
    }

    try {
      await authService.requestPasswordReset(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResending(true)

    try {
      await authService.resendPasswordReset(email)

      // Mostrar mensaje de éxito temporal
      const successElement = document.getElementById("resend-success")
      if (successElement) {
        successElement.classList.remove("d-none")
        setTimeout(() => {
          successElement.classList.add("d-none")
        }, 3000)
      }
    } catch (err) {
      setError(err.message || "Error al reenviar correo. Intente nuevamente.")
    } finally {
      setResending(false)
    }
  }

  return {
    email,
    setEmail,
    submitted,
    error,
    setError,
    loading,
    resending,
    handleSubmit,
    handleResend,
  }
}