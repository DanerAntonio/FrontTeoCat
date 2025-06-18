"use client"

import { Link } from "react-router-dom"
import { Card, Badge, Button, Modal, Spinner } from "react-bootstrap"
import "../MiPerfilComponents/ProfileOrders.scss"
import { useState } from "react"
import VentasService from "../../../Services/ConsumoAdmin/VentasService"
import perfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"

const ProfileOrders = ({ orders }) => {
  const [showCancelModal, setShowCancelModal] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Función para formatear números
  const formatNumber = (number) =>
    typeof number === "number"
      ? number.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0,00"

  // Función para cargar detalles completos de la venta
  const handleExpandOrder = async (orderId) => {
    if (orderDetails[orderId]) {
      setExpandedOrder(orderId)
      return
    }
    setLoadingDetails(true)
    try {
      const venta = await VentasService.getById(orderId)
      // Traer detalles de productos y servicios
      const detallesProductos = await VentasService.getDetallesProductos(orderId)
      const detallesServicios = await VentasService.getDetallesServicios(orderId)
      // Guardar todo junto
      setOrderDetails((prev) => ({
        ...prev,
        [orderId]: {
          ...venta,
          detallesProductos: Array.isArray(detallesProductos) ? detallesProductos : [],
          detallesServicios: Array.isArray(detallesServicios) ? detallesServicios : [],
        },
      }))
      setExpandedOrder(orderId)
    } catch (e) {
      alert("No se pudieron cargar los detalles del pedido.")
    }
    setLoadingDetails(false)
  }

  // Función para imprimir factura (igual que en ventas)
  const printInvoiceStyle = (venta) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const formatNumber = (number) =>
      typeof number === "number"
        ? number.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : Number(number || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Datos del cliente
    let clienteNombre = "Consumidor Final"
    let clienteDocumento = "0000000000"
    let clienteDireccion = "N/A"
    let clienteTelefono = "N/A"

    if (venta.cliente) {
      clienteNombre =
        `${venta.cliente.nombre || venta.cliente.Nombre || ""} ${venta.cliente.apellido || venta.cliente.Apellido || ""}`.trim()
      clienteDocumento = venta.cliente.documento || venta.cliente.Documento || "0000000000"
      clienteDireccion = venta.cliente.direccion || venta.cliente.Direccion || "N/A"
      clienteTelefono = venta.cliente.telefono || venta.cliente.Telefono || "N/A"
    } else if (venta.Cliente) {
      clienteNombre = venta.Cliente
    } else if (venta.IdCliente === 0 || venta.idCliente === 0) {
      clienteNombre = "Consumidor Final"
    }

    // Fecha
    const fechaVenta = new Date(venta.fechaVenta || venta.FechaVenta).toLocaleDateString("es-CO")

    // Servicios
    const servicios = venta.servicios || venta.detallesServicios || []

    printWindow.document.write(`
 <!DOCTYPE html>
 <html>
 <head>
   <title>Factura de Venta #${venta.IdVenta || venta.id}</title>
   <style>
     body {
       font-family: Arial, sans-serif;
       font-size: 12px;
       margin: 0;
       padding: 20px;
       color: #333;
     }
     .invoice {
       max-width: 800px;
       margin: 0 auto;
       padding: 20px;
       border: 1px solid #ddd;
       box-shadow: 0 0 10px rgba(0,0,0,0.1);
     }
     .header {
       display: flex;
       justify-content: space-between;
       margin-bottom: 20px;
       border-bottom: 2px solid #333;
       padding-bottom: 10px;
     }
     .company-info {
       flex: 1;
     }
     .company-name {
       font-size: 24px;
       font-weight: bold;
       margin-bottom: 5px;
       color: #000;
     }
     .invoice-info {
       text-align: right;
     }
     .invoice-title {
       font-size: 24px;
       font-weight: bold;
       margin-bottom: 10px;
       color: #000;
     }
     .client-info {
       margin-bottom: 20px;
       padding: 15px;
       background-color: #f9f9f9;
       border-radius: 5px;
       border-left: 4px solid #4a90e2;
     }
     .client-info h3 {
       margin-top: 0;
       border-bottom: 1px solid #ddd;
       padding-bottom: 5px;
       color: #4a90e2;
     }
     .client-details {
       display: grid;
       grid-template-columns: repeat(2, 1fr);
       gap: 10px;
     }
     .client-details p {
       margin: 5px 0;
     }
     table {
       width: 100%;
       border-collapse: collapse;
       margin-bottom: 20px;
     }
     th, td {
       border: 1px solid #ddd;
       padding: 10px;
       text-align: left;
     }
     th {
       background-color: #f2f2f2;
       font-weight: bold;
     }
     .product-table th {
       position: sticky;
       top: 0;
       background-color: #f2f2f2;
     }
     .totals {
       margin-left: auto;
       width: 300px;
     }
     .totals table {
       width: 100%;
     }
     .totals table td {
       border: none;
       padding: 5px;
     }
     .totals table td:last-child {
       text-align: right;
       font-weight: bold;
     }
     .total-row {
       font-weight: bold;
     }
     .grand-total {
       font-size: 16px;
       border-top: 2px solid #333;
       padding-top: 5px;
     }
     .footer {
       margin-top: 30px;
       text-align: center;
       font-size: 11px;
       color: #666;
       border-top: 1px solid #ddd;
       padding-top: 10px;
     }
     .legal-text {
       font-style: italic;
       font-size: 10px;
       color: #777;
       margin-top: 5px;
     }
     .thanks {
       text-align: center;
       margin: 20px 0;
       font-weight: bold;
       font-size: 14px;
       color: #4a90e2;
     }
     .notes {
       margin-top: 20px;
       padding: 10px;
       background-color: #f9f9f9;
       border-radius: 5px;
       border-left: 4px solid #f0ad4e;
     }
     .notes h3 {
       margin-top: 0;
       color: #f0ad4e;
       border-bottom: 1px solid #ddd;
       padding-bottom: 5px;
     }
     @media print {
       body {
         padding: 0;
       }
       .invoice {
         border: none;
         box-shadow: none;
       }
     }
   </style>
</head>
<body>
   <div class="invoice">
     <div class="header">
       <div class="company-info">
         <div class="company-name">TEO/CAT</div>
         <p>Calle 34 B # 66 A 18</p>
         <p>Barrio Conquistadores</p>
         <p>Tel: 310 620 4578</p>
         <p>Email: teoduque445@gmail.com</p>
       </div>
       <div class="invoice-info">
         <div class="invoice-title">FACTURA DE VENTA</div>
         <p><strong>No.:</strong> ${venta.IdVenta || venta.id}</p>
         <p><strong>Fecha:</strong> ${fechaVenta}</p>
         <p><strong>Estado:</strong> ${venta.Estado || venta.estado || "Efectiva"}</p>
       </div>
     </div>
     
     <div class="client-info">
       <h3>Información del Cliente</h3>
       <div class="client-details">
         <p><strong>Cliente:</strong> ${clienteNombre}</p>
         <p><strong>Documento:</strong> ${clienteDocumento}</p>
         <p><strong>Dirección:</strong> ${clienteDireccion}</p>
         <p><strong>Teléfono:</strong> ${clienteTelefono}</p>
       </div>
     </div>
     
     <h3>Detalle de Productos</h3>
     <table class="product-table">
       <thead>
         <tr>
           <th>Código</th>
           <th>Descripción</th>
           <th>Cantidad</th>
           <th>Precio Unitario</th>
           <th>IVA</th>
           <th>Subtotal</th>
         </tr>
       </thead>
       <tbody>
         ${(venta.detallesProductos || venta.productos || [])
           .map(
             (detalle) => `
           <tr>
             <td>${detalle.CodigoBarras || detalle.codigoBarras || "N/A"}</td>
             <td>${detalle.NombreProducto || detalle.nombreProducto || "Producto"}</td>
             <td>${detalle.Cantidad || detalle.cantidad || 1}</td>
             <td>$${formatNumber(detalle.PrecioUnitario || detalle.precioUnitario)}</td>
             <td>$${formatNumber((detalle.IvaUnitario || 0) * (detalle.Cantidad || detalle.cantidad || 1))}</td>
             <td>$${formatNumber(detalle.Subtotal || (detalle.Cantidad || detalle.cantidad || 1) * (detalle.PrecioUnitario || detalle.precioUnitario))}</td>
           </tr>
         `,
           )
           .join("")}
       </tbody>
     </table>
     ${
       servicios && servicios.length > 0
         ? `
<h3>Detalle de Servicios</h3>
<table class="product-table">
  <thead>
    <tr>
      <th>Servicio</th>
      <th>Mascota</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>IVA</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    ${servicios
      .map(
        (servicio) => `
      <tr>
        <td>${servicio.NombreServicio || servicio.nombreServicio || `Servicio #${servicio.IdServicio || servicio.idServicio}`}</td>
        <td>${
          servicio.NombreMascotaTemporal ||
          servicio.nombreMascotaTemporal ||
          (servicio.mascota ? servicio.mascota.Nombre || servicio.mascota.nombre : "N/A")
        }${
          servicio.TipoMascotaTemporal ||
          servicio.tipoMascotaTemporal ||
          (servicio.mascota ? ` (${servicio.mascota.Tipo || servicio.mascota.tipo})` : "")
        }</td>
        <td>${servicio.Cantidad || servicio.cantidad || 1}</td>
        <td>$${formatNumber(servicio.PrecioUnitario || servicio.precioUnitario)}</td>
        <td>$${formatNumber((servicio.IvaUnitario || 0) * (servicio.Cantidad || servicio.cantidad || 1))}</td>
        <td>$${formatNumber(
          servicio.Subtotal ||
            (servicio.Cantidad || servicio.cantidad || 1) * (servicio.PrecioUnitario || servicio.precioUnitario),
        )}</td>
      </tr>
    `,
      )
      .join("")}
  </tbody>
</table>
`
         : ""
     }
     
     <div class="totals">
       <table>
         <tr>
           <td><strong>Subtotal:</strong></td>
           <td>$${formatNumber(venta.Subtotal || venta.subtotal)}</td>
         </tr>
         <tr>
           <td><strong>IVA:</strong></td>
           <td>$${formatNumber(venta.TotalIva || venta.totalIVA || 0)}</td>
         </tr>
         <tr class="total-row grand-total">
           <td><strong>TOTAL:</strong></td>
           <td>$${formatNumber(venta.TotalMonto || venta.total)}</td>
         </tr>
         ${
           venta.ReferenciaPago || venta.referenciaPago
             ? `<tr><td><strong>Referencia de Pago:</strong></td><td>${venta.ReferenciaPago || venta.referenciaPago}</td></tr>`
             : ""
         }
       </table>
     </div>
     
     ${
       (venta.NotasAdicionales && venta.NotasAdicionales !== "Venta presencial") ||
       (venta.ComprobantePago && venta.ComprobantePago !== "Pago en efectivo")
         ? `
     <div class="notes">
       <h3>Información Adicional</h3>
       ${venta.NotasAdicionales && venta.NotasAdicionales !== "Venta presencial" ? `<p><strong>Notas:</strong> ${venta.NotasAdicionales}</p>` : ""}
       ${venta.ComprobantePago && venta.ComprobantePago !== "Pago en efectivo" ? `<p><strong>Comprobante de Pago:</strong> ${venta.ComprobantePago}</p>` : ""}
     </div>
     `
         : ""
     }
     
     <div class="thanks">¡GRACIAS POR SU COMPRA!</div>
     
     <div class="footer">
       <p>Esta factura es un documento legal y sirve como comprobante de compra.</p>
       <p class="legal-text">Conserve este documento para cualquier reclamación o garantía.</p>
       <p>Instagram: @Teocat8 | WhatsApp: 310 620 4578</p>
     </div>
   </div>
   
   <script>
     window.onload = function() {
       setTimeout(function() {
         window.print();
       }, 500);
     };
   </script>
 </body>
 </html>
`)

    printWindow.document.close()
  }

  // Mapeo de pedidos
  const mappedOrders = Array.isArray(orders)
    ? orders.map((order) => ({
        id: order.IdVenta,
        date: order.FechaVenta ? new Date(order.FechaVenta).toLocaleDateString() : "",
        total: Number(order.TotalMonto || order.total || 0),
        status: order.Estado || "Pendiente",
      }))
    : []

  if (mappedOrders.length === 0) {
    return <div>No hay pedidos para mostrar.</div>
  }

  return (
    <Card className="border-0 shadow">
      <Card.Header className="tc-profile-card-header">
        <h4 className="mb-0">Mis Pedidos</h4>
      </Card.Header>
      <Card.Body>
        <div className="accordion" id="accordionOrders">
          {mappedOrders.map((order, index) => (
            <div className="accordion-item tc-order-item" key={order.id}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${expandedOrder === order.id ? "" : "collapsed"}`}
                  type="button"
                  onClick={() => handleExpandOrder(order.id)}
                  aria-expanded={expandedOrder === order.id}
                  aria-controls={`collapse${index}`}
                >
                  <div className="d-flex justify-content-between align-items-center w-100 me-3">
                    <span className="tc-order-id">
                      <strong>Pedido:</strong> {order.id}
                    </span>
                    <span className="tc-order-date d-none d-md-block">
                      <strong>Fecha:</strong> {order.date}
                    </span>
                    <span className="tc-order-total d-none d-md-block">
                      <strong>Total:</strong>{" "}
                      {typeof order.total === "number"
                        ? `$${formatNumber(order.total)}`
                        : "No disponible"}
                    </span>
                    <span>
                      <Badge
                        bg={order.status === "Entregado" ? "success" : "warning"}
                        text={order.status === "Entregado" ? "white" : "dark"}
                        className="tc-order-status"
                      >
                        {order.status}
                      </Badge>
                    </span>
                  </div>
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse${
                  expandedOrder === order.id ? " show" : ""
                }`}
                data-bs-parent="#accordionOrders"
              >
                <div className="accordion-body">
                  {loadingDetails && expandedOrder === order.id ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                      <div>Cargando detalles...</div>
                    </div>
                  ) : orderDetails[order.id] ? (
                    <>
                      <div className="table-responsive">
                        <table className="table tc-order-items-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(orderDetails[order.id].detallesProductos || []).length > 0 ? (
                              orderDetails[order.id].detallesProductos.map((item, idx) => {
                                // Convertir a número seguro
                                const precio = Number(item.PrecioUnitario || item.precioUnitario || 0)
                                const cantidad = Number(item.Cantidad || item.cantidad || 0)
                                const subtotal = Number(item.Subtotal || precio * cantidad)
                                return (
                                  <tr key={item.IdProducto || idx}>
                                    <td>{item.NombreProducto}</td>
                                    <td>{cantidad}</td>
                                    <td>${formatNumber(precio)}</td>
                                    <td>${formatNumber(subtotal)}</td>
                                  </tr>
                                )
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center text-danger">
                                  No hay productos en este pedido.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" className="text-end fw-bold">
                                Total:
                              </td>
                              <td className="fw-bold">
                                {typeof Number(orderDetails[order.id].TotalMonto) === "number" && !isNaN(Number(orderDetails[order.id].TotalMonto))
                                  ? `$${formatNumber(Number(orderDetails[order.id].TotalMonto))}`
                                  : typeof Number(orderDetails[order.id].total) === "number" && !isNaN(Number(orderDetails[order.id].total))
                                    ? `$${formatNumber(Number(orderDetails[order.id].total))}`
                                    : "No disponible"}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="d-flex justify-content-end mt-3">
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            const message = `Hola, soy cliente de TeoCat y necesito ayuda con mi pedido #${order.id}.`
                            window.open(
                              `https://api.whatsapp.com/send/?phone=573106204578&text=${encodeURIComponent(message)}`,
                              "_blank"
                            )
                          }}
                        >
                          <i className="bi bi-whatsapp me-1"></i> WhatsApp
                        </Button>
                        <Button
                          variant="brown"
                          size="sm"
                          className="me-2"
                          onClick={() => printInvoiceStyle(orderDetails[order.id])}
                        >
                          <i className="bi bi-file-earmark-text me-1"></i> Ver Factura
                        </Button>
                        {order.status === "Pendiente" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setShowCancelModal(order)}
                            disabled={cancelLoading}
                          >
                            <i className="bi bi-x-circle me-1"></i> Cancelar Pedido
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      Selecciona el pedido para ver los detalles.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
      <Modal show={!!showCancelModal} onHide={() => setShowCancelModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Para devoluciones, por favor comunícate al WhatsApp{" "}
            <a
              href="https://api.whatsapp.com/send/?phone=573106204578"
              target="_blank"
              rel="noopener noreferrer"
            >
              +57 310 6204578
            </a>
            .
          </p>
          <p>
            ¿Estás seguro que deseas cancelar este pedido? Esta acción solo es posible si el pedido está pendiente.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(null)}>
            Cerrar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              setCancelLoading(true)
              try {
                await perfilClienteService.cancelMyOrder(showCancelModal.id)
                window.location.reload()
              } catch (e) {
                alert("No se pudo cancelar el pedido. Intenta de nuevo.")
              }
              setCancelLoading(false)
              setShowCancelModal(null)
            }}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Cancelando..." : "Cancelar Pedido"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  )
}

export default ProfileOrders
