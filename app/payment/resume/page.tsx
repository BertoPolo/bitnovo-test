"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrderInfo } from "@/types"

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => (
  <div>
    <h2>Realiza el pago</h2>
    <p>
      <span>icon</span> timer
    </p>
    <br />
    <button className="btn">Smart QR</button>
    <button className="btn disabled">Web3</button>
    <QRCode value={orderInfo.paymentUri} />
    <br />
    <p>
      Enviar <b>{}</b>
      {/* orderInfo.expected_input_amount ??*/}
    </p>
  </div>
)

const Resume = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({ price: "", coin: "", concept: "", id: "", paymentUri: "" })

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
          <h2>Resumen del pedido</h2>
          <p>
            <strong>Importe:</strong> {orderInfo.price} EUR
          </p>
          <hr />
          <p>
            <strong>Moneda seleccionada:</strong> {orderInfo.coin}
          </p>
          <hr />
          <p>
            <strong>Comercio:</strong> Comercio de pruebas Samega
          </p>
          <p>
            <strong>Fecha:</strong> {Date.now()}
          </p>
          <hr />
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
