import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"

// Componente que muestra el QR
const PaymentQR = ({ orderInfo }: any) => {
  // remove any type!!
  return (
    <div>
      <h2>Detalles del Pago</h2>
      <QRCode value={JSON.stringify(orderInfo)} />
    </div>
  )
}

const Resume = () => {
  const identifier = process.env.REACT_APP_IDENTIFIER
  useEffect(() => {
    console.log(identifier)
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${identifier}`)

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status === "EX" || data.status === "OC") {
        // redirect to KO
      } else if (data.status === "CO" || data.status === "AC") {
        // redirect to OK
      }
    }

    return () => socket.close()
  }, [identifier])

  return (
    <div>
      <div>Resume</div>
    </div>
  )
}

export default Resume
