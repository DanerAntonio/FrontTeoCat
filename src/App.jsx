"use client"

import { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import RolRoutes from "./Routes/RolRoutes"

// Importar estilos
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "react-toastify/dist/ReactToastify.css"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"
import "./Styles/main.scss"
import "./App.css"

function App() {
  useEffect(() => {
    // Importar los scripts de Bootstrap para componentes interactivos
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, [])

  return (
    <>
      <RolRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App