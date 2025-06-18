"use client"

const ProductosTable = ({ productosAgregados, handleRemoveProduct, formatNumber }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Código de Barras</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>IVA</th>
            <th>IVA Unitario</th>
            <th>Subtotal</th>
            <th>Total</th>
            <th>Precio Venta Sugerido</th>
            <th>Actualizar Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosAgregados.map((producto, index) => (
            <tr key={index}>
              <td>{producto.codigoBarras || "Sin código"}</td>
              <td>{producto.nombre}</td>
              <td>{producto.Cantidad}</td>
              <td>${formatNumber(producto.PrecioUnitario)}</td>
              <td>{producto.iva !== undefined && producto.iva !== null ? `${producto.iva}%` : "0%"}</td>
              <td>${formatNumber(producto.IvaUnitario || 0)}</td>
              <td>${formatNumber(producto.Subtotal)}</td>
              <td>${formatNumber(producto.SubtotalConIva || producto.Subtotal)}</td>
              <td>
                <span className="badge bg-light text-dark border">
                  ${formatNumber(producto.PrecioVentaSugerido || 0)}
                </span>
              </td>
              <td>
                {producto.actualizarPrecioVenta ? (
                  <span className="badge bg-light text-dark border">Sí</span>
                ) : (
                  <span className="badge bg-light text-dark border">No</span>
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveProduct(index)}
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductosTable
