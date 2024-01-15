"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"

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
      const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

      socket.onopen = () => {
        console.log("WebSocket connection established")
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("Received data:", data)
        handlePaymentStatus(data.status)
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        router.push(`/payment/failed`)

        router.push("/payment-failed")
      }

      socket.onclose = (event) => {
        console.log("WebSocket connection closed", event.code)
        if (event.code !== 1000) {
          router.push(`/payment/failed`)
        }
      }

      return () => {
        socket.close()
      }
    }
  }, [orderInfo.id, router])

  const handlePaymentStatus = (status: string) => {
    switch (status) {
      case "CO":
        router.push("/payment/success")
        break
      case "NR":
      case "PE":
      case "AC":
        router.push(`/payment/failed-${status}`)
        break
      default:
        console.log(`Unhandled status: ${status}`)
    }
  }

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
