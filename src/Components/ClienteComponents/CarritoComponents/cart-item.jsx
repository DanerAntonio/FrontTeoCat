"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "react-bootstrap"
import carritoService from "../../../Services/ConsumoCliente/CarritoService"

const CartItem = ({ item, updateQuantity, removeItem }) => {
  const [imageError, setImageError] = useState(false)

  // ✅ FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN
  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true)
      e.target.src = "//vite.svg
?height=60&width=60&text=Producto"
    }
  }

  // ✅ FUNCIÓN PARA OBTENER URL DE IMAGEN SEGURA
  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageError) {
      return "//vite.svg
?height=60&width=60&text=Producto"
    }

    // Si es una URL de Cloudinary, verificar que esté bien formada
    if (imageUrl.includes("cloudinary.com")) {
      // Verificar que la URL tenga el formato correcto
      if (!imageUrl.includes("/image/upload/")) {
        return "//vite.svg
?height=60&width=60&text=Producto"
      }
    }

    return imageUrl
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="cart-item"
    >
      <td>
        <div className="d-flex align-items-center">
          <div className="cart-item-image me-3">
            <img
              src={getImageUrl(item.image) || "//vite.svg
"}
              alt={item.name || "Producto"}
              className="img-fluid rounded"
              onError={handleImageError}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                backgroundColor: "#f8f9fa",
              }}
            />
          </div>
          <div>
            <h6 className="cart-item-name mb-0">{item.name || "Producto sin nombre"}</h6>
            {item.category && <small className="text-muted">{item.category}</small>}
          </div>
        </div>
      </td>
      <td className="cart-item-price">${(item.price ?? 0).toLocaleString()}</td>
      <td>
        <div className="cart-quantity-controls">
          <Button
            variant="outline-secondary"
            size="sm"
            className="quantity-btn"
            aria-label="Disminuir cantidad"
            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
          >
            <i className="bi bi-dash"></i>
          </Button>
          <span className="quantity-display">{item.quantity || 1}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            className="quantity-btn"
            aria-label="Aumentar cantidad"
            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
          >
            <i className="bi bi-plus"></i>
          </Button>
        </div>
      </td>
      <td className="cart-item-subtotal">${((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</td>
      <td>
        <Button
          variant="link"
          className="cart-item-remove text-danger"
          aria-label="Eliminar producto"
          onClick={() => removeItem(item.id)}
        >
          <i className="bi bi-trash"></i>
        </Button>
      </td>
    </motion.tr>
  )
}

const Cart = () => {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const fetchCart = async () => {
      const items = await carritoService.getAll()
      setCartItems(items)
    }
    fetchCart()
  }, [])

  // Función para actualizar la cantidad de un producto
  const updateQuantity = async (id, newQuantity) => {
    await carritoService.updateQuantity(id, newQuantity)
    const items = await carritoService.getAll()
    setCartItems(items)
  }

  // Función para eliminar un producto del carrito
  const removeItem = async (id) => {
    await carritoService.removeItem(id)
    const items = await carritoService.getAll()
    setCartItems(items)
  }

  return (
    <div className="cart">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CartItem
export { Cart }
