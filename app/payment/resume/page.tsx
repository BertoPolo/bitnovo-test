"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { io } from "socket.io-client"

const PaymentQR = ({ orderInfo }: any) => (
  <div>
    <h2>Detalles del Pago</h2>
    <QRCode value={orderInfo.paymentUri} />
  </div>
)

const Resume = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderInfo, setOrderInfo] = useState({ price: "", coin: "", concept: "", id: "", paymentUri: "" })

  useEffect(() => {
    const price = searchParams.get("price") || ""
    const coin = searchParams.get("coin") || ""
    const concept = searchParams.get("concept") || ""
    const id = searchParams.get("id") || ""
    const paymentUri = searchParams.get("paymentUri") || ""
    setOrderInfo({ price, coin, concept, id, paymentUri })
  }, [searchParams])

  useEffect(() => {
    if (orderInfo.id) {
      const socket = io(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

      socket.on("connect", () => {
        console.log("Socket.IO connection established")
      })

      socket.on("payment_status", (data) => {
        console.log("Received data:", data)
        handlePaymentStatus(data.status)
      })

      socket.on("disconnect", () => {
        console.log("Socket.IO connection closed")
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [orderInfo.id, router])

  const handlePaymentStatus = (status: string) => {
    if (status === "CO") router.push("/payment-success")
    else router.push(`/payment-failed?status=${status}`)
  }

  // useEffect(() => {
  //   if (orderInfo.id !== undefined) {
  //     const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

  //     console.log("WebSocket trying to connect")
  //     socket.onopen = () => {
  //       console.log("WebSocket connection established")
  //     }

  //     socket.onmessage = (event) => {
  //       const data = JSON.parse(event.data)
  //       console.log("Received data:", data)

  //       if (data.status === "CO" || data.status === "AC") {
  //         router.push("/payment-success")
  //       } else if (data.status === "EX" || data.status === "OC") {
  //         router.push("/payment-failed")
  //       } else console.log("data status:", data.status)
  //     }

  //     socket.onerror = (error) => {
  //       console.error("WebSocket error:", error)
  //     }

  //     socket.onclose = () => {
  //       console.log("WebSocket connection closed")
  //     }

  //     return () => {
  //       socket.close()
  //     }
  //   }
  // }, [orderInfo.id])

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
