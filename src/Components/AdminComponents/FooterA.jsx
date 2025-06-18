"use client"

import { motion } from "framer-motion"
import "../../Components/AdminComponents/FooterA.scss"

const Footer = () => {
  return (
    <footer className="footerA">
      <div className="footer-content">
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="brand-text">
            Teo<span className="text-success">/Cat</span>
          </span>
          <p className="footer-tagline">Productos y servicios para mascotas</p>
        </motion.div>
        <motion.div
          className="footer-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="copyright">© {new Date().getFullYear()} Teo/Cat. Todos los derechos reservados.</p>
          <p className="location">Medellín, Colombia</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

