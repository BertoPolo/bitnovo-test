"use client"
import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter } from "next/router"

// Componente que muestra el QR, pasar a otro componente a parte?
const PaymentQR = () => {
  const router = useRouter()
  const { price, coin, concept } = router.query

  return (
    <div>
      <h2>Detalles del Pago</h2>
      <QRCode value={JSON.stringify("orderInfo")} />
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
