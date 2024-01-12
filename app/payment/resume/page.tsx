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
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = process.env.NEXT_PUBLIC_IDENTIFIER
  const [orderInfo, setOrderInfo] = useState({ price: "", coin: "", concept: "" })

  useEffect(() => {
    const price = searchParams.get("price") || ""
    const coin = searchParams.get("coin") || ""
    const concept = searchParams.get("concept") || ""
    setOrderInfo({ price, coin, concept })
  }, [searchParams])

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
