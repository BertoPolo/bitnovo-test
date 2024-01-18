"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrderInfo } from "@/types"
import Image from "next/image"

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(31000) // set as 310 => 5,10min
  const [selectedMode, setSelectedMode] = useState("qr")
  const [isTagCopied, setIsTagCopied] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [isCoinCopied, setIsCoinCopied] = useState(false)

  useEffect(() => {
    if (timeLeft === 0) router.push(`/payment/failed`)

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timeLeft])

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setTimeout(() => setIsTagCopied(false), 2000)
    setTimeout(() => setIsAddressCopied(false), 2000)
    setTimeout(() => setIsCoinCopied(false), 2000)
  }
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div>
      <h3 className="mb-2">Realiza el pago</h3>
      <div className="mt-2 p-6 border flex flex-col justify-center items-center">
        {/* clock */}
        <div className="my-2 flex justify-center items-center">
          <small className="mr-1">
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
          </small>
          <small>{formatTimeLeft()}</small>
        </div>

        {/* qr / w3 selector */}
        <div className=" my-4">
          <button
            className={`btn btn-sm p-2 rounded-full ${selectedMode === "qr" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setSelectedMode("qr")}
          >
            Smart QR
          </button>

          <button
            className={`btn btn-sm p-2 rounded-full ${selectedMode === "web3" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setSelectedMode("web3")}
          >
            Web3
          </button>
        </div>

        {/* qr code */}
        <span className="drop-shadow-xl mt-3 mb-7">
          <QRCode value={orderInfo.address} />
        </span>

        {/* send */}
        <div className="flex mb-2">
          <p>Enviar</p>
          <b className="mx-2">{orderInfo.expected_input_amount}</b>
          <span className="mr-2">{orderInfo.coin}</span>
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
        <div className="flex mb-2">
          <span className="mr-2">{orderInfo.address}</span>
          <div className="relative ">
            <svg
              onClick={() => {
                handleCopyToClipboard(orderInfo.address)
                setIsAddressCopied(true)
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
            {isAddressCopied && (
              <div
                className={`absolute bottom-12 left-0 opacity-0 transform scale-95 transition-opacity duration-300 ease-in-out ${
                  isAddressCopied ? "opacity-100 scale-100" : ""
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
            <span className="mr-2">{orderInfo.tag_memo}</span>
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
    identifier: "",
    payment_uri: "",
    expected_input_amount: "",
    tag_memo: "",
    address: "",
    image: "",
  })
  useEffect(() => {
    const storedPaymentData = localStorage.getItem("paymentData")
    if (storedPaymentData) {
      const paymentData = JSON.parse(storedPaymentData)
      setOrderInfo({
        ...orderInfo,
        price: paymentData.price,
        coin: paymentData.coin,
        concept: paymentData.concept,
        identifier: paymentData.identifier,
        payment_uri: paymentData.payment_uri,
        expected_input_amount: paymentData.expected_input_amount,
        tag_memo: paymentData.tag_memo,
        address: paymentData.address,
        image: paymentData.image,
      })
    }
  }, [])

  // useEffect(() => {
  //   if (orderInfo.identifier) {
  //     const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.identifier}`)

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
  // }, [orderInfo.identifier, router])

  // const handlePaymentStatus = (status: string) => {
  //   switch (status) {
  //     case "CO":
  //       localStorage.removeItem("paymentData")
  //       router.push("/payment/success")
  //       break
  //     case "NR":
  //     case "PE":
  //     case "AC":
  //       localStorage.removeItem("paymentData")
  //       router.push(`/payment/failed`)
  //       break
  //     default:
  //       // router.push(`/payment/failed`) ??
  //       console.log(`Unhandled status: ${status}`)
  //   }
  // }

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
      <div className="flex gap-4  bg-white ">
        <div className="flex-1 ">
          <h3 className="mb-2">Resumen del pedido</h3>
          <div className="p-6 pr-9 bg-slate-100 rounded-md">
            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Importe:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <strong>{orderInfo.price} EUR</strong>
              </div>
            </div>
            <hr />

            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Moneda seleccionada:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 flex items-center justify-end">
                {orderInfo.image && <Image src={orderInfo.image} alt="coin" width={20} height={20} />}
                <span className="ml-2">{orderInfo.coin}</span>
              </div>
            </div>
            <hr />

            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Comercio:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <p>(i)Comercio de pruebas Samega</p>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Fecha:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <p>{getCurrentDateTime()}</p>
              </div>
            </div>
            <hr />

            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Concepto:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <p>{orderInfo.concept}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <PaymentQR orderInfo={orderInfo} />
        </div>
      </div>
    </div>
  )
}

export default Resume
