"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrderInfo } from "@/types"

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(31000) // set as 310 => 5,10min
  const [selectedMode, setSelectedMode] = useState("qr")
  const [isTagCopied, setIsTagCopied] = useState(false)
  const [isUriCopied, setIsUriCopied] = useState(false)
  const [isCoinCopied, setIsCoinCopied] = useState(false)
  // console.log(orderInfo)

  useEffect(() => {
    if (timeLeft === 0) router.push(`/payment/failed/timeout`)

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timeLeft])

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setTimeout(() => setIsTagCopied(false), 2000)
    setTimeout(() => setIsUriCopied(false), 2000)
    setTimeout(() => setIsCoinCopied(false), 2000)
  }
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-6">
      <h3>Realiza el pago</h3>
      <div className="flex items-center">
        <span>
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
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

      <button className={`btn px-2 py-1 rounded-full ${selectedMode === "qr" ? "btn-primary" : "btn-ghost"}`} onClick={() => setSelectedMode("qr")}>
        Smart QR
      </button>

      <button
        className={`btn px-2 py-1 rounded-full ${selectedMode === "web3" ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setSelectedMode("web3")}
      >
        Web3
      </button>
      <QRCode value={orderInfo.paymentUri} />
      <br />

      {/* send */}
      <div className="flex">
        <p>Enviar</p>
        <b className="ml-2">{orderInfo.expected_input_amount}</b>
        <span>{orderInfo.coin}</span>
        <div className="relative">
          <svg
            onClick={() => {
              handleCopyToClipboard(orderInfo.expected_input_amount)
              setIsCoinCopied(true)
            }}
            className="cursor-pointer"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
          </svg>
          {/* "copied" tootip */}
          {isCoinCopied && (
            <div
              className={`absolute bottom-6 left-0 opacity-0 transform scale-95 transition-opacity duration-300 ease-in-out ${
                isCoinCopied ? "opacity-100 scale-100" : ""
              }`}
            >
              <div className="bg-black text-white rounded-md p-2 text-xs">Copiado</div>
            </div>
          )}
        </div>
      </div>

      {/* address */}
      <div className="flex">
        <span>{orderInfo.paymentUri}</span>
        <div className="relative">
          <svg
            onClick={() => {
              handleCopyToClipboard(orderInfo.paymentUri)
              setIsUriCopied(true)
            }}
            className="cursor-pointer"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
          </svg>
          {/* "copied" tootip */}
          {isUriCopied && (
            <div
              className={`absolute bottom-6 left-0 opacity-0 transform scale-95 transition-opacity duration-300 ease-in-out ${
                isUriCopied ? "opacity-100 scale-100" : ""
              }`}
            >
              <div className="bg-black text-white rounded-md p-2 text-xs">Copiado</div>
            </div>
          )}
        </div>
      </div>

      {/*  memo tag*/}
      {orderInfo.tag_memo && (
        <div className="flex">
          <svg
            stroke="black"
            fill="yellow"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
            <path d="M12 9h.01"></path>
            <path d="M11 12h1v4h1"></path>
          </svg>
          <span> Etiqueta de destino:</span>
          <span>{orderInfo.tag_memo}</span>
          <div className="relative">
            <svg
              onClick={() => {
                handleCopyToClipboard(orderInfo.tag_memo)
                setIsTagCopied(true)
              }}
              className="cursor-pointer"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
            </svg>
            {/* "copied" tootip */}
            {isTagCopied && (
              <div
                className={`absolute bottom-6 left-0 opacity-0 transform scale-95 transition-opacity duration-300 ease-in-out ${
                  isTagCopied ? "opacity-100 scale-100" : ""
                }`}
              >
                <div className="bg-black text-white rounded-md p-2 text-xs">Copiado</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const Resume = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    price: "",
    coin: "",
    concept: "",
    id: "",
    paymentUri: "",
    expected_input_amount: "",
    tag_memo: "",
  })

  useEffect(() => {
    const price = searchParams.get("price") || ""
    const coin = searchParams.get("coin") || ""
    const concept = searchParams.get("concept") || ""
    const id = searchParams.get("id") || ""
    const paymentUri = searchParams.get("paymentUri") || ""
    const expected_input_amount = searchParams.get("expected_input_amount") || ""
    const tag_memo = searchParams.get("tag_memo") || ""
    setOrderInfo({ price, coin, concept, id, paymentUri, expected_input_amount, tag_memo })
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
    <div className="flex justify-center items-center min-h-screen ">
      <div className="flex flex-col md:flex-row gap-4  bg-white ">
        <div className="flex-1 ">
          <h3>Resumen del pedido</h3>

          <div className="p-6 bg-slate-100 rounded-md">
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
        </div>
        <div className="flex-1">
          <PaymentQR orderInfo={orderInfo} />
        </div>
      </div>
    </div>
  )
}

export default Resume
