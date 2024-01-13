"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"

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

  useEffect(() => {
    if (orderInfo.id) {
      const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

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
        }
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
    } else {
      console.error("Identifier is undefined.")
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
