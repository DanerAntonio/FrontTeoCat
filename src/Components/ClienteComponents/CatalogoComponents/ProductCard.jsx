"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { toast } from "react-toastify"
import "./ProductCard.scss"
import carritoService from "../../../Services/ConsumoCliente/CarritoService.js"

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!product) {
    return null
  }

  // Si tu backend devuelve Stock como string, conviértelo a número
  const stock = Number(product.stock)

  const addToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Usa el servicio para agregar el producto
    await carritoService.addItem(product)

    // Disparar evento para actualizar contador del carrito (opcional, ya lo hace el servicio)
    // window.dispatchEvent(new CustomEvent("cartUpdated"))

    // Mostrar notificación
    toast.success("Producto añadido al carrito", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  return (
    <div
      className="product-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="product-card h-100 border-0 shadow-sm">
        <Link to={`/producto/${product.id}`} className="text-decoration-none">
          <div className="card-img-container">
            <Card.Img
              variant="top"
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className={`product-image ${isHovered ? "zoomed" : ""}`}
            />

            <div className={`quick-actions ${isHovered ? "visible" : ""}`}>
              <button className="quick-action-btn" onClick={addToCart}>
                <i className="bi bi-cart-plus"></i>
              </button>
              <button className="quick-action-btn">
                <i className="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="text-muted mb-0 small">{product.category}</p>
              <div className="d-flex align-items-center">
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>{product.rating || 4.5}</span>
              </div>
            </div>

            <Card.Title className="product-title">{product.name}</Card.Title>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="product-price">
                <span className="current-price">${product.price ? product.price.toLocaleString() : "0"}</span>
              </div>

              <Button variant="brown" className="d-md-none" onClick={addToCart}>
                <i className="bi bi-cart-plus"></i>
              </Button>
            </div>
          </Card.Body>
        </Link>
        <Button
          onClick={addToCart}
          disabled={stock <= 0}
          variant={stock <= 0 ? "secondary" : "success"}
          className="w-100"
        >
          {stock <= 0 ? "Sin stock" : "Agregar al carrito"}
        </Button>
        {stock <= 0 && (
          <div className="text-danger mt-2" style={{ fontWeight: "bold" }}>
            Producto agotado
          </div>
        )}
      </Card>
    </div>
  )
}

// Puedes colocar esto en ProductCard.jsx o en el componente padre
const validarAgregarAlCarrito = (cantidad, stockDisponible) => {
  const errores = {}

  // Cantidad: requerida, mayor a 0, menor o igual al stock disponible
  if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
    errores.cantidad = "Ingrese una cantidad válida (mayor a 0)."
  } else if (Number(cantidad) > stockDisponible) {
    errores.cantidad = `Solo hay ${stockDisponible} unidades disponibles.`
  }

  return errores
}

export default ProductCard