"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { io } from "socket.io-client"

const PaymentQR = ({ orderInfo }: any) => (
  <div>
    <h2>Detalles del Pago</h2>
    <QRCode value={JSON.stringify(orderInfo)} />
  </div>
)

const Resume = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  // const identifier = process.env.NEXT_PUBLIC_IDENTIFIER
  const [orderInfo, setOrderInfo] = useState({ price: "", coin: "", concept: "", id: "" })

  useEffect(() => {
    const price = searchParams.get("price") || ""
    const coin = searchParams.get("coin") || ""
    const concept = searchParams.get("concept") || ""
    const id = searchParams.get("id") || ""
    setOrderInfo({ price, coin, concept, id })
  }, [searchParams])

  // useEffect(() => {
  //   const ADDRESS = "wss://payments.pre-bnvo.com/ws/0a0c454e-4b63-4da5-913e-7c251179a16c" // <-- address of the BACKEND PROCESS
  //   const socket = io("wss://payments.pre-bnvo.com/ws/0a0c454e-4b63-4da5-913e-7c251179a16c", { transports: ["websocket"] })
  //   if (orderInfo.id !== undefined) {
  //     // const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

  //     console.log("WebSocket trying to connect")
  //     socket.on("connection", () => {
  //       console.log("WebSocket connection established")
  //     })
  //   }
  // }, [orderInfo.id])

  useEffect(() => {
    if (orderInfo.id !== undefined) {
      // const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)
      const socket = new WebSocket("wss://payments.pre-bnvo.com/ws/044e4992-756b-4bf7-bd03-fa32f7b3d584")

      console.log("WebSocket trying to connect")
      socket.onopen = () => {
        console.log("WebSocket connection established")
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("Received data:", data)

        if (data.status === "CO" || data.status === "AC") {
          router.push("/payment-success")
        } else if (data.status === "EX" || data.status === "OC") {
          router.push("/payment-failed")
        } else console.log("data status:", data.status)
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      socket.onclose = () => {
        console.log("WebSocket connection closed")
      }

      return () => {
        socket.close()
      }
    }
  }, [orderInfo.id])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white shadow-lg rounded-lg">
        <div className="flex-1">
          <p>
            <strong>Importe:</strong> {orderInfo.price}
          </p>
          <p>
            <strong>Moneda:</strong> {orderInfo.coin}
          </p>
          <p>
            <strong>Concepto:</strong> {orderInfo.concept}
          </p>
        </div>
        <div className="flex-1">
          <PaymentQR orderInfo={orderInfo} />
        </div>
      </div>
    </div>
  )
}

export default Resume
