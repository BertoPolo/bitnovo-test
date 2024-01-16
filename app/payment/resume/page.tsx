"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrderInfo } from "@/types"

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(31000) // set as 310 => 5,10min
  useEffect(() => {
    if (timeLeft === 0) router.push(`/payment/failed/timeout`)

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timeLeft])

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div>
      <h2>Realiza el pago</h2>
      <div>
        <span>
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 24 24"
            height="1.2em"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Clock_2">
              <g>
                <path d="M12,21.933A9.933,9.933,0,1,1,21.933,12,9.944,9.944,0,0,1,12,21.933ZM12,3.067A8.933,8.933,0,1,0,20.933,12,8.943,8.943,0,0,0,12,3.067Z"></path>
                <path d="M18,12.5H12a.429.429,0,0,1-.34-.14c-.01,0-.01-.01-.02-.02A.429.429,0,0,1,11.5,12V6a.5.5,0,0,1,1,0v5.5H18A.5.5,0,0,1,18,12.5Z"></path>
              </g>
            </g>
          </svg>
        </span>
        <span>{formatTimeLeft()}</span>
      </div>
      <br />
      <button className="btn btn-primary">Smart QR</button>
      <button className="btn btn-primary" disabled>
        Web3
      </button>
      <QRCode value={orderInfo.paymentUri} />
      <br />
      <p>
        Enviar <b>{}</b>
        {/* orderInfo.expected_input_amount ??*/}
      </p>
    </div>
  )
}

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

  // useEffect(() => {
  //   if (orderInfo.id) {
  //     const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.id}`)

  //     socket.onopen = () => {
  //       console.log("WebSocket connection established")
  //     }

  //     socket.onmessage = (event) => {
  //       const data = JSON.parse(event.data)
  //       console.log("Received data:", data)
  //       handlePaymentStatus(data.status)
  //     }

  //     socket.onerror = (error) => {
  //       console.error("WebSocket error:", error)
  //       router.push(`/payment/failed`)

  //       router.push("/payment-failed")
  //     }

  //     socket.onclose = (event) => {
  //       console.log("WebSocket connection closed", event.code)
  //       if (event.code !== 1000) {
  //         router.push(`/payment/failed`)
  //       }
  //     }

  //     return () => {
  //       socket.close()
  //     }
  //   }
  // }, [orderInfo.id, router])

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

  function getCurrentDateTime() {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}`
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
            <strong>Fecha:</strong> {getCurrentDateTime()}
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
