"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import Web3 from "web3"
import { useRouter } from "next/navigation"
import { OrderInfo } from "@/types"
import Image from "next/image"

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState("qr")
  const [isTagCopied, setIsTagCopied] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [isCoinCopied, setIsCoinCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(350) //just in case getTimeLeft is not working properly,default as 350
  const [expireDate, setExpireDate] = useState(0)

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setTimeout(() => setIsTagCopied(false), 2000)
    setTimeout(() => setIsAddressCopied(false), 2000)
    setTimeout(() => setIsCoinCopied(false), 2000)
  }

  const connectMetamaskWalletAndSendPayment = async () => {
    console.log(orderInfo.expected_input_amount)
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()

        const amountInWei = web3.utils.toWei(String(orderInfo.expected_input_amount), "ether")
        console.log(amountInWei)

        const transactionParameters = {
          to: orderInfo.address,
          from: accounts[0],
          value: amountInWei,
        }

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        })
        console.log("Transaction sent. Hash:", txHash)
      } else {
        console.log("MetaMask no está disponible")
      }
    } catch (error) {
      console.error("Error al enviar la transacción:", error)
    }
  }

  const getExpireDate = async () => {
    try {
      if (orderInfo.identifier) {
        const response = await fetch(`https://payments.pre-bnvo.com/api/v1/orders/info/${orderInfo.identifier}`, {
          headers: {
            "X-Device-Id": process.env.NEXT_PUBLIC_IDENTIFIER || "",
          },
        })
        if (!response.ok) {
          throw new Error("La respuesta de la red no fue ok")
        }

        const data = await response.json()
        console.log(new Date(data[0].expired_time).getTime())

        const expireTime = new Date(data[0].expired_time).getTime()

        const now = new Date().getTime()
        const difference = Math.max(0, expireTime - now) / 1000

        setTimeLeft(Math.floor(difference))
      }
    } catch (error) {
      // setError(error.message)
    }
  }
  useEffect(() => {
    getExpireDate()
  }, [orderInfo])

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  useEffect(() => {
    if (timeLeft === 0) router.push(`/payment/failed`)

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timeLeft])

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-center md:text-start">Realiza el pago</h3>
      <div className="mt-2 p-6 shadow-md  flex flex-col justify-center items-center ">
        {/* clock */}
        <div className="my-2 flex justify-center items-center">
          <span className="mr-1">
            <svg width="20" height="19" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.5 22.75C7.26 22.75 3 18.49 3 13.25C3 8.01 7.26 3.75 12.5 3.75C17.74 3.75 22 8.01 22 13.25C22 18.49 17.74 22.75 12.5 22.75ZM12.5 5.25C8.09 5.25 4.5 8.84 4.5 13.25C4.5 17.66 8.09 21.25 12.5 21.25C16.91 21.25 20.5 17.66 20.5 13.25C20.5 8.84 16.91 5.25 12.5 5.25Z"
                fill="#002859"
              />
              <path
                d="M12.5 13.75C12.09 13.75 11.75 13.41 11.75 13V8C11.75 7.59 12.09 7.25 12.5 7.25C12.91 7.25 13.25 7.59 13.25 8V13C13.25 13.41 12.91 13.75 12.5 13.75Z"
                fill="#002859"
              />
              <path
                d="M15.5 2.75H9.5C9.09 2.75 8.75 2.41 8.75 2C8.75 1.59 9.09 1.25 9.5 1.25H15.5C15.91 1.25 16.25 1.59 16.25 2C16.25 2.41 15.91 2.75 15.5 2.75Z"
                fill="#002859"
              />
            </svg>
          </span>
          <span>{formatTimeLeft()}</span>
        </div>

        {/* qr / w3 selector */}
        <div className=" my-4">
          <button className={`btn btn-sm mr-1 p-2 rounded-full ${selectedMode === "qr" && "bgBlue"}`} onClick={() => setSelectedMode("qr")}>
            Smart QR
          </button>

          <button
            className={`btn btn-sm p-2 rounded-full ${selectedMode === "web3" && "bgBlue"}`}
            onClick={() => {
              setSelectedMode("web3")
              connectMetamaskWalletAndSendPayment()
            }}
            disabled={orderInfo.coin !== "ETH_TEST3"}
          >
            Web3
          </button>
        </div>

        {selectedMode === "qr" ? (
          //  qr code
          <span className="drop-shadow-xl mt-3 mb-4">
            <QRCode value={orderInfo.payment_uri} />
          </span>
        ) : (
          // web3 wallet
          <div className="h-28 border p-4 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="	" width="8em" height="2em" viewBox="0 0 512 96">
              <path
                fill="#161616"
                d="M444.19 25.125c3.088 0 5.978 1.013 8.519 2.922c2.655 1.987 4.101 5.104 4.414 8.845a.207.207 0 0 1-.127.252l-.108.02h-6.016c-.088 0-.176-.044-.215-.115l-.02-.08c-.704-5.415-7.304-6.896-11.288-4.246c-2.775 1.87-3.322 6.156-.664 8.337c1.04.858 2.238 1.542 3.454 2.203l3.217 1.75l2.825 1.449c1.411.725 2.808 1.475 4.137 2.352c4.57 3.039 6.092 7.637 5.27 12.74c-.934 5.222-5.544 10.248-14.45 10.248c-3.4 0-6.681-.935-9.688-3.195c-3.203-2.377-4.375-4.987-4.375-9.702c0-.087.066-.175.148-.213l.086-.02h6.522c.117 0 .235.116.235.233c0 .429.078 1.403.234 1.91c.9 2.805 3.476 4.597 6.799 4.792c3.046.195 6.092-1.48 7.264-3.897c1.29-2.649.352-6-2.616-7.83l-.381-.232l-1.409-.806l-1.7-.93l-8.206-4.326l-.498-.278l-.152-.091c-8.554-5.3-7.108-22.092 8.79-22.092m38.987.896c.088 0 .176.066.215.148l.02.086v17.533c0 .156.15.262.29.218l.1-.062l17.227-17.845a.26.26 0 0 1 .09-.066l.067-.012h8.32c.156 0 .262.15.219.29l-.063.1l-20.314 21.04a.232.232 0 0 0-.053.213l.053.098l22.578 23.26c.125.094.075.288-.03.381l-.087.049h-8.32l-.078-.025l-.078-.054l-19.53-20.104c-.094-.125-.288-.075-.362.05l-.03.106v19.793c0 .087-.065.175-.147.213l-.087.02h-6.525c-.087 0-.175-.065-.214-.147l-.02-.086V26.255c0-.088.066-.175.148-.214l.086-.02zm-331.8-.039c.078 0 .14.018.183.064l.052.092l5.351 17.611a.244.244 0 0 0 .398.112l.071-.112l5.352-17.61a.289.289 0 0 1 .13-.134l.104-.023h9.883c.088 0 .176.066.214.148l.02.086V71.18c0 .087-.066.175-.148.213l-.086.02h-6.524c-.087 0-.175-.065-.214-.147l-.02-.086V37.01c0-.228-.271-.32-.407-.186l-.062.108l-5.39 17.728l-.391 1.246a.29.29 0 0 1-.13.133l-.104.023h-5c-.079 0-.14-.017-.183-.063l-.052-.093l-.39-1.246l-5.39-17.728c-.066-.195-.348-.2-.44-.039l-.03.117v34.17c0 .087-.066.175-.148.213l-.086.02h-6.524c-.088 0-.176-.065-.214-.147l-.02-.086V26.216c0-.088.066-.175.148-.214l.086-.02zm189.416 0c.078 0 .139.018.182.064l.052.092l5.353 17.611a.244.244 0 0 0 .397.112l.072-.112l5.349-17.61a.289.289 0 0 1 .13-.134l.104-.023h9.923c.088 0 .176.066.214.148l.02.086V71.18c0 .087-.065.175-.148.213l-.086.02h-6.522c-.088 0-.176-.065-.214-.147l-.02-.086V37.01c0-.228-.272-.32-.408-.186l-.061.108l-5.392 17.728l-.39 1.246a.29.29 0 0 1-.131.133l-.104.023h-5c-.079 0-.14-.017-.183-.063l-.052-.093l-.391-1.246l-5.388-17.728c-.066-.195-.348-.2-.44-.039l-.03.117v34.17c0 .087-.065.175-.148.213l-.086.02h-6.525c-.088 0-.176-.065-.214-.147l-.02-.086V26.216c0-.088.065-.175.148-.214l.086-.02zm-72.501 0a.22.22 0 0 1 .22.148l.014.086v5.61c0 .088-.066.176-.148.214l-.086.02h-11.914v39.12c0 .087-.066.175-.149.213l-.086.02h-6.523c-.088 0-.176-.065-.214-.147l-.02-.086V32.06H237.47c-.088 0-.176-.066-.214-.148l-.02-.086v-5.61c0-.089.066-.176.148-.215l.086-.02zm32.148-.156c.079 0 .14.017.183.063l.052.093L312.94 71.1a.254.254 0 0 1-.126.285l-.108.027h-5.936a.299.299 0 0 1-.174-.08l-.06-.076l-3.555-13.13a.289.289 0 0 0-.13-.133l-.104-.023H289.62c-.079 0-.14.017-.183.063l-.052.093l-3.554 13.13a.289.289 0 0 1-.13.133l-.105.023h-5.937a.246.246 0 0 1-.237-.197l.002-.115l12.266-45.118a.289.289 0 0 1 .13-.133l.104-.023zm101.251 0c.078 0 .139.017.182.063l.053.093L414.19 71.1a.254.254 0 0 1-.127.285l-.108.027h-5.935a.246.246 0 0 1-.183-.08l-.052-.076l-3.554-13.13a.289.289 0 0 0-.13-.133l-.105-.023h-13.125c-.078 0-.139.017-.182.063l-.052.093l-3.554 13.13a.289.289 0 0 1-.13.133l-.105.023h-5.938a.246.246 0 0 1-.237-.197l.002-.115l12.265-45.118a.289.289 0 0 1 .13-.133l.105-.023zm-182.07.195c.087 0 .175.066.213.148l.02.086v5.61c0 .088-.065.176-.148.214l-.086.02h-19.766c-.088 0-.176.066-.214.148l-.02.086v11.923c0 .087.066.175.148.213l.086.02h17.383c.088 0 .176.066.215.148l.02.086v5.61c0 .088-.066.176-.149.214l-.086.02h-17.383c-.088 0-.176.066-.214.148l-.02.086V64.75c0 .104.035.173.093.22l.102.053h20.625c.088 0 .176.065.215.148l.02.085v5.923c0 .087-.066.175-.148.213l-.087.02h-27.578c-.088 0-.176-.065-.214-.148l-.02-.085V26.255c0-.088.066-.175.148-.214l.086-.02zm76.797 7.948a.244.244 0 0 0-.398-.112l-.071.112l-4.766 17.572c-.03.117.03.234.126.285l.108.027h9.532a.246.246 0 0 0 .236-.197l-.002-.115zm101.25 0a.244.244 0 0 0-.398-.112l-.071.112l-4.766 17.572c-.03.117.03.234.126.285l.108.027h9.532a.246.246 0 0 0 .237-.197l-.002-.115z"
              />
              <path fill="#E17726" d="M99.76 0L55.938 32.425l8.149-19.109z" />
              <path
                fill="#E27625"
                d="m2.47.038l35.577 13.28l7.738 19.36zm79.655 68.921l19.368.369l-6.769 22.995l-23.634-6.507zm-62.123 0l10.994 16.857l-23.595 6.508L.674 69.328z"
              />
              <path
                fill="#E27625"
                d="m44.733 27.747l.792 25.565l-23.686-1.078l6.737-10.164l.086-.098zm12.416-.286l16.316 14.512l.085.098l6.737 10.163l-23.68 1.078zm-25.46 41.572L44.622 79.11l-15.023 7.253zm38.751-.001l2.047 17.331l-14.981-7.254z"
              />
              <path fill="#D5BFB2" d="m57.837 78.16l15.202 7.361l-14.141 6.721l.147-4.442zm-13.551.003l-1.16 9.564l.095 4.51l-14.174-6.716z" />
              <path fill="#233447" d="m39.896 56.648l3.973 8.349l-13.525-3.962zm22.334.001l9.598 4.386l-13.569 3.961z" />
              <path
                fill="#CC6228"
                d="m32.723 68.948l-2.186 17.968l-11.718-17.575zm36.682 0l13.905.393l-11.762 17.576zm11.225-17.73L70.51 61.531l-7.801-3.565l-3.736 7.852l-2.448-13.503zm-59.137 0l24.109 1.097l-2.449 13.503l-3.736-7.851l-7.761 3.564z"
              />
              <path
                fill="#E27525"
                d="m20.811 49.102l11.448 11.617l.397 11.469zm60.517-.021L69.462 72.208l.446-11.489zm-36.286.728l.461 2.901l1.139 7.225l-.732 22.19l-3.461-17.826l-.001-.184zm12.037-.04l2.601 14.346l-.001.184L56.21 82.17l-.138-4.47l-.541-17.897z"
              />
              <path
                fill="#F5841F"
                d="m70.926 60.257l-.387 9.965l-12.078 9.41l-2.441-1.725l2.736-14.097zm-39.683.001l12.128 3.553l2.736 14.096l-2.441 1.725l-12.078-9.411z"
              />
              <path
                fill="#C0AC9D"
                d="m26.736 83.321l15.451 7.321l-.065-3.127l1.293-1.134h15.293l1.339 1.131l-.099 3.124l15.354-7.297l-7.471 6.174l-9.034 6.205H43.291l-9.028-6.231z"
              />
              <path fill="#161616" d="m56.73 77.186l2.185 1.543l1.28 10.214l-1.853-1.564H43.791l-1.818 1.596l1.239-10.245l2.185-1.544z" />
              <path
                fill="#763E1A"
                d="m96.867.898l5.26 15.78l-3.285 15.956l2.339 1.805l-3.165 2.415l2.379 1.837l-3.15 2.869l1.934 1.401l-5.133 5.994l-21.052-6.129l-.182-.098l-15.17-12.797zM5.26.898l39.226 29.033l-15.171 12.797l-.182.098l-21.052 6.129l-5.132-5.994l1.932-1.4l-3.149-2.87l2.375-1.835l-3.213-2.422l2.428-1.806L0 16.679z"
              />
              <path
                fill="#F5841F"
                d="M71.964 41.485L94.27 47.98l7.247 22.334H82.399l-13.174.166l9.58-18.673zm-41.801 0L23.32 51.807l9.582 18.673l-13.167-.166H.65L7.857 47.98zM65.18 13.209L58.94 30.06l-1.324 22.763l-.506 7.135l-.04 18.227H45.057l-.039-18.193l-.508-7.175l-1.325-22.757l-6.238-16.851z"
              />
            </svg>
          </div>
        )}

        {/* send */}
        <div className="flex mt-3 my-2">
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
              className="mr-2 align-baseline"
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
  const router = useRouter()

  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    fiat_amount: "",
    coin: "",
    concept: "",
    identifier: "",
    payment_uri: "",
    expected_input_amount: "",
    tag_memo: "",
    address: "",
    image: "",
  })

  //get payment information
  useEffect(() => {
    const storedPaymentData = localStorage.getItem("paymentData")
    if (storedPaymentData) {
      const paymentData = JSON.parse(storedPaymentData)
      setOrderInfo({
        ...orderInfo,
        fiat_amount: paymentData.price,
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

  // websocket
  useEffect(() => {
    if (orderInfo.identifier) {
      const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${orderInfo.identifier}`)

      socket.onopen = () => {
        console.log("WebSocket connection established")
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("Received data:", data)
        handlePaymentStatus(data.status)
        localStorage.removeItem("paymentData")
        localStorage.setItem(
          "status",
          JSON.stringify({
            status: data.status,
          })
        )
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        router.push(`/payment/failed`)
        localStorage.removeItem("paymentData")
        localStorage.setItem(
          "status",
          JSON.stringify({
            status: error,
          })
        )
      }

      socket.onclose = (event) => {
        console.log("WebSocket connection closed", event.code)
        if (event.code !== 1000) {
          router.push(`/payment/failed`)
          localStorage.removeItem("paymentData")
        }
      }

      return () => {
        socket.close()
      }
    }
  }, [orderInfo.identifier, router])

  const handlePaymentStatus = (status: string) => {
    switch (status) {
      case "CO":
        router.push("/payment/success")
        break
      case "NR":
      case "AC":
      case "IA":
      case "RF":
      case "CA":
      case "OC":
      case "FA":
      case "EX":
        console.log(`Status: ${status}`)
        router.push(`/payment/failed`)
        break
      default:
        console.log(`Unhandled status: ${status}`)
    }
    localStorage.removeItem("paymentData")
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
    <div className="md:flex justify-center items-center min-h-screen md:flex-row">
      <div className="md:flex gap-4 bg-white ">
        {/* Left or Up side part */}
        <div className="flex-1 my-3 md:mt-0">
          <h3 className="mb-2 text-center md:text-start">Resumen del pedido</h3>
          <div className="p-6 pr-9 bg-slate-100 rounded-md">
            {/* importe */}
            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Importe:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <strong>{orderInfo.fiat_amount} EUR</strong>
              </div>
            </div>
            <hr />

            {/* moneda */}
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

            {/* comercio */}
            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Comercio:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 flex items-center justify-end">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 20 20">
                    <g fill="green" fillRule="evenodd" clipRule="evenodd">
                      <path
                        d="M3.278 9.121c.537-.536.95-1.562.935-2.32a2.65 2.65 0 0 1 .778-1.932a2.651 2.651 0 0 1 2.014-.775c.714.036 1.616-.31 2.12-.816a2.658 2.658 0 0 1 3.76 0c.505.505 1.406.852 2.12.816a2.651 2.651 0 0 1 2.015.775a2.65 2.65 0 0 1 .777 1.933c-.015.757.4 1.784.935 2.32a2.663 2.663 0 0 1-.006 3.765c-.528.528-.914 1.438-.928 2.184a2.65 2.65 0 0 1-.778 1.826a2.648 2.648 0 0 1-1.748.775c-.791.04-1.827.5-2.387 1.06a2.658 2.658 0 0 1-3.76 0c-.56-.56-1.595-1.02-2.386-1.06a2.648 2.648 0 0 1-1.748-.775a2.649 2.649 0 0 1-.778-1.824c-.015-.748-.406-1.664-.935-2.193a2.658 2.658 0 0 1 0-3.759"
                        opacity=".2"
                      />
                      <path d="M4.198 4.077a1.65 1.65 0 0 0-.485 1.205c.01.55-.13 1.132-.333 1.636c-.203.505-.506 1.022-.894 1.411a1.658 1.658 0 0 0 0 2.345c.71.711 1.206 1.873 1.227 2.879a1.654 1.654 0 0 0 1.575 1.621c.55.027 1.129.194 1.637.42c.507.225 1.019.542 1.408.931a1.658 1.658 0 0 0 2.345 0c.389-.389.9-.706 1.408-.932c.508-.225 1.087-.392 1.637-.419a1.653 1.653 0 0 0 1.575-1.623c.02-1.002.509-2.159 1.22-2.87a1.663 1.663 0 0 0 .007-2.352c-.388-.388-.69-.905-.894-1.41c-.204-.504-.344-1.087-.333-1.637a1.65 1.65 0 0 0-.486-1.205a1.651 1.651 0 0 0-1.256-.484c-.996.05-2.173-.402-2.878-1.107a1.658 1.658 0 0 0-2.345 0c-.705.705-1.882 1.157-2.878 1.107a1.651 1.651 0 0 0-1.257.484M2.713 5.3c.015.758-.398 1.785-.935 2.321a2.658 2.658 0 0 0 0 3.759c.53.529.92 1.445.935 2.192c.014.662.273 1.32.778 1.825a2.648 2.648 0 0 0 1.748.775c.791.04 1.827.499 2.387 1.06a2.658 2.658 0 0 0 3.759 0c.56-.561 1.596-1.02 2.387-1.06a2.648 2.648 0 0 0 1.748-.775a2.65 2.65 0 0 0 .777-1.826c.015-.747.4-1.656.929-2.184a2.663 2.663 0 0 0 .006-3.766c-.536-.536-.95-1.562-.934-2.32a2.65 2.65 0 0 0-.778-1.933a2.651 2.651 0 0 0-2.015-.775c-.714.036-1.615-.31-2.12-.816a2.658 2.658 0 0 0-3.76 0c-.504.506-1.406.852-2.12.816a2.651 2.651 0 0 0-2.014.775A2.65 2.65 0 0 0 2.713 5.3" />
                      <path d="M12.298 6.564a.5.5 0 0 1 .194.68l-2.777 5a.5.5 0 1 1-.874-.486l2.777-5a.5.5 0 0 1 .68-.194" />
                      <path d="M6.11 9.466a.5.5 0 0 1 .702-.078L9.59 11.61a.5.5 0 0 1-.625.781L6.188 10.17a.5.5 0 0 1-.078-.703" />
                    </g>
                  </svg>
                </span>
                <p className="ml-2 text-end whitespace-nowrap ">Comercio de pruebas Samega</p>
                {/* md:whitespace-normal */}
              </div>
            </div>

            {/* fecha */}
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

            {/* concepto */}
            <div className="flex justify-between">
              <div className="w-1/2 my-2">
                <p>
                  <strong>Concepto:</strong>
                </p>
              </div>

              <div className="w-1/2 my-2 text-end">
                <p className="break-words">{orderInfo.concept}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right or below side part */}
        <div>
          <PaymentQR orderInfo={orderInfo} />
        </div>
      </div>
    </div>
  )
}

export default Resume
