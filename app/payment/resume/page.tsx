"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import Web3 from "web3"
import { useRouter } from "next/navigation"
import { OrderInfo } from "@/types"
import Image from "next/image"
import { getGasPrice } from "web3-eth"
// import { Window as KeplrWindow } from "@keplr-wallet/types"

declare global {
  interface Window {
    xfi: any
  }
}

const PaymentQR = ({ orderInfo }: { orderInfo: OrderInfo }) => {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState("qr")
  const [isTagCopied, setIsTagCopied] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [isCoinCopied, setIsCoinCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(350) //just in case getTimeLeft is not working properly, default as 350

  // const [isXDEFIInstalled, setIsXDEFIInstalled] = useState(false)

  // useEffect(() => {
  //   setIsXDEFIInstalled(typeof window.xfi !== "undefined")
  // }, [])

  // const connectMultiWallet = async () => {
  //   try {
  //     if (window.xfi) {
  //       let transactionParameters
  //       let txHash
  //       let userAccount

  //       switch (orderInfo.coin) {
  //         case "ETH_TEST3":
  //           if (window.ethereum) {
  //             const accountsEth = await window.xfi.ethereum.request({ method: "eth_requestAccounts" })
  //             userAccount = accountsEth[0]

  //             const web3 = new Web3(window.ethereum)
  //             const amountInWei = web3.utils.toWei(String(orderInfo.expected_input_amount), "ether") // better dont mix ??

  //             transactionParameters = {
  //               to: orderInfo.address,
  //               from: userAccount,
  //               value: amountInWei,
  //             }
  //             txHash = await window.xfi.ethereum.request({
  //               method: "eth_sendTransaction",
  //               params: [transactionParameters],
  //             })
  //           }
  //           break

  //         case "BTC_TEST":
  //           userAccount = await window.xfi.bitcoin.request({ method: "btc_requestAccounts" })[0]
  //           //  userAccount = await window.xfi.bitcoin.request({ method: "btc_requestAccounts" })
  //           transactionParameters = {
  //             feeRate: orderInfo.rate,
  //             from: userAccount,
  //             recipient: orderInfo.address,
  //             amount: Number(orderInfo.expected_input_amount) * 100000000,
  //             memo: orderInfo.concept,
  //           }

  //           txHash = await window.xfi.bitcoin.request({
  //             method: "btc_sendTransaction",
  //             params: [transactionParameters],
  //           })
  //           break

  //         case "BCH_TEST":
  //           // userAccount = await window.xfi.bitcoinCash.request({ method: "request_accounts" })[0]
  //           userAccount = await window.xfi.bitcoincash.request({ method: "request_accounts" })

  //           transactionParameters = {
  //             feeRate: orderInfo.rate,
  //             from: userAccount,
  //             recipient: orderInfo.address,
  //             amount: Number(orderInfo.expected_input_amount) * 100000000,
  //             memo: orderInfo.concept,
  //           }

  //           txHash = await window.xfi.bitcoinCash.request({
  //             method: "bch_sendTransaction",
  //             params: [transactionParameters],
  //           })
  //           break

  //         case "XRP_TEST":
  //           break

  //         case "USDC_TEST3":
  //           break
  //       }

  //       if (txHash) {
  //         console.log("Transaction sent. Hash:", txHash)
  //       }
  //     } else {
  //       console.log("XDEFI Wallet not found. Please install the extension.")
  //     }
  //   } catch (error) {
  //     console.error(`Error connecting to XDEFI Wallet for ${orderInfo.coin}:`, error)
  //   }
  // }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setTimeout(() => setIsTagCopied(false), 2000)
    setTimeout(() => setIsAddressCopied(false), 2000)
    setTimeout(() => setIsCoinCopied(false), 2000)
  }

  const connectMetamaskWalletAndSendPayment = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()

        const amountInWei = web3.utils.toWei(String(orderInfo.expected_input_amount), "ether")
        // console.log(amountInWei)

        // const gasPrice = await web3.eth.getGasPrice()
        // console.log(gasPrice)

        // const gasEstimate = await web3.eth.estimateGas({
        //   to: orderInfo.address,
        //   from: accounts[0],
        //   value: amountInWei,
        // })
        // console.log(gasEstimate)

        web3.eth
          .sendTransaction({
            from: accounts[0],
            to: orderInfo.address,
            value: amountInWei,
            // gas: gasEstimate,
            gasPrice: "2000000",
          })
          .then(function (receipt) {
            console.log("Transaction sent. Hash:", receipt)
          })
        // console.log("Transaction sent. Hash:", txHash)
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

        const expireTime = new Date(data[0].expired_time).getTime()

        const now = new Date().getTime()
        const difference = Math.max(0, expireTime - now) / 1000

        setTimeLeft(Math.floor(difference))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    getExpireDate()
  }, [orderInfo])

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
      <div className="mt-2 p-6 shadow-md rounded-lg flex flex-col justify-center items-center ">
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
          <button
            className={`btn btn-sm mr-1 p-2 rounded-full border-none ${selectedMode === "qr" && "bgBlue"}`}
            onClick={() => setSelectedMode("qr")}
          >
            Smart QR
          </button>

          <button
            className={`btn btn-sm p-2 rounded-full border-none ${selectedMode === "web3" && "bgBlue"}`}
            onClick={() => {
              setSelectedMode("web3")
              connectMetamaskWalletAndSendPayment()
            }}
            // disabled={orderInfo.coin !== "ETH_TEST3"}
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
          <div className="h-28 border p-4 flex justify-center items-center rounded-lg">
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
    rate: 0,
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
        router.push(`/payment/failed?error=${status}`)
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
                  <strong className="md:mr-12">Comercio:</strong>
                  {/* fix that margin */}
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
      <span className=" md:absolute mx-auto bottom-5">
        <svg width="399" height="26" viewBox="0 0 399 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 15.1142V9.25753H2.61146C3.2848 9.25753 3.80346 9.40706 4.16742 9.70613C4.53139 9.99965 4.71337 10.4095 4.71337 10.9356C4.71337 11.4507 4.53139 11.8605 4.16742 12.1651C3.80346 12.4642 3.2848 12.6137 2.61146 12.6137H0.755232V15.1142H0ZM0.755232 12.0405H2.53867C3.00576 12.0405 3.3576 11.9436 3.59418 11.7497C3.83682 11.5559 3.95814 11.2845 3.95814 10.9356C3.95814 10.5812 3.83682 10.307 3.59418 10.1132C3.3576 9.91935 3.00576 9.82243 2.53867 9.82243H0.755232V12.0405Z"
            fill="#C0CCDA"
          />
          <path
            d="M7.51507 15.189C7.07831 15.189 6.69614 15.1031 6.36857 14.9315C6.04707 14.7542 5.79836 14.505 5.62244 14.1838C5.44652 13.857 5.35856 13.4721 5.35856 13.0291C5.35856 12.5805 5.44652 12.1956 5.62244 11.8744C5.79836 11.5531 6.04707 11.3067 6.36857 11.135C6.69614 10.9578 7.07831 10.8692 7.51507 10.8692C7.9579 10.8692 8.34006 10.9578 8.66156 11.135C8.98914 11.3067 9.24088 11.5531 9.4168 11.8744C9.59878 12.1956 9.68977 12.5805 9.68977 13.0291C9.68977 13.4721 9.59878 13.857 9.4168 14.1838C9.24088 14.505 8.98914 14.7542 8.66156 14.9315C8.34006 15.1031 7.9579 15.189 7.51507 15.189ZM7.51507 14.6407C7.95183 14.6407 8.2976 14.505 8.55237 14.2336C8.80715 13.9567 8.93454 13.5552 8.93454 13.0291C8.93454 12.4974 8.80412 12.0959 8.54328 11.8245C8.2885 11.5476 7.94576 11.4091 7.51507 11.4091C7.08437 11.4091 6.74164 11.5476 6.48686 11.8245C6.23208 12.0959 6.1047 12.4974 6.1047 13.0291C6.1047 13.5552 6.23208 13.9567 6.48686 14.2336C6.74164 14.505 7.08437 14.6407 7.51507 14.6407Z"
            fill="#C0CCDA"
          />
          <path
            d="M11.996 15.1142L10.3035 10.9439H11.0861L12.4964 14.6158H12.2599L13.7157 10.9439H14.3527L15.7812 14.6158H15.5538L16.9732 10.9439H17.7194L16.0178 15.1142H15.3081L13.834 11.3842H14.198L12.7148 15.1142H11.996Z"
            fill="#C0CCDA"
          />
          <path
            d="M20.6521 15.189C19.9363 15.189 19.3721 15.0007 18.9596 14.6241C18.5471 14.242 18.3409 13.713 18.3409 13.0374C18.3409 12.5999 18.4319 12.2205 18.6139 11.8993C18.7958 11.5725 19.0506 11.3205 19.3782 11.1433C19.7058 10.9605 20.0819 10.8692 20.5065 10.8692C20.9251 10.8692 21.2769 10.9495 21.562 11.1101C21.8471 11.2707 22.0655 11.5005 22.2171 11.7996C22.3688 12.0931 22.4446 12.442 22.4446 12.8463V13.0955H18.905V12.6719H21.9624L21.8077 12.7799C21.8077 12.3368 21.6985 11.9907 21.4801 11.7414C21.2617 11.4922 20.9372 11.3676 20.5065 11.3676C20.0515 11.3676 19.6967 11.5144 19.4419 11.8079C19.1871 12.0959 19.0597 12.4863 19.0597 12.9792V13.054C19.0597 13.5746 19.1992 13.9706 19.4783 14.242C19.7634 14.5078 20.1607 14.6407 20.6703 14.6407C20.9433 14.6407 21.198 14.6047 21.4346 14.5327C21.6773 14.4552 21.9078 14.3306 22.1261 14.1589L22.3809 14.6324C22.1807 14.8096 21.926 14.9481 21.6166 15.0478C21.3133 15.1419 20.9918 15.189 20.6521 15.189Z"
            fill="#C0CCDA"
          />
          <path
            d="M23.5542 15.1142V11.9491C23.5542 11.783 23.5482 11.6141 23.536 11.4424C23.53 11.2707 23.5178 11.1045 23.4996 10.9439H24.2094L24.3004 11.9574L24.173 11.9657C24.2336 11.7165 24.3398 11.5116 24.4914 11.351C24.6431 11.1904 24.822 11.0713 25.0283 10.9938C25.2345 10.9107 25.4499 10.8692 25.6743 10.8692C25.7653 10.8692 25.8442 10.8719 25.9109 10.8775C25.9837 10.883 26.0504 10.8969 26.1111 10.919L26.102 11.5171C26.011 11.4894 25.9261 11.4728 25.8472 11.4673C25.7744 11.4562 25.6895 11.4507 25.5924 11.4507C25.3255 11.4507 25.092 11.5088 24.8918 11.6251C24.6977 11.7414 24.5491 11.891 24.4459 12.0737C24.3489 12.2565 24.3004 12.4503 24.3004 12.6552V15.1142H23.5542Z"
            fill="#C0CCDA"
          />
          <path
            d="M28.8538 15.189C28.138 15.189 27.5738 15.0007 27.1613 14.6241C26.7488 14.242 26.5426 13.713 26.5426 13.0374C26.5426 12.5999 26.6336 12.2205 26.8156 11.8993C26.9975 11.5725 27.2523 11.3205 27.5799 11.1433C27.9075 10.9605 28.2836 10.8692 28.7082 10.8692C29.1268 10.8692 29.4786 10.9495 29.7637 11.1101C30.0488 11.2707 30.2672 11.5005 30.4188 11.7996C30.5705 12.0931 30.6463 12.442 30.6463 12.8463V13.0955H27.1067V12.6719H30.1641L30.0094 12.7799C30.0094 12.3368 29.9002 11.9907 29.6818 11.7414C29.4634 11.4922 29.1389 11.3676 28.7082 11.3676C28.2532 11.3676 27.8984 11.5144 27.6436 11.8079C27.3888 12.0959 27.2614 12.4863 27.2614 12.9792V13.054C27.2614 13.5746 27.4009 13.9706 27.68 14.242C27.9651 14.5078 28.3624 14.6407 28.872 14.6407C29.145 14.6407 29.3997 14.6047 29.6363 14.5327C29.879 14.4552 30.1095 14.3306 30.3278 14.1589L30.5826 14.6324C30.3824 14.8096 30.1277 14.9481 29.8183 15.0478C29.515 15.1419 29.1935 15.189 28.8538 15.189Z"
            fill="#C0CCDA"
          />
          <path
            d="M33.503 15.189C33.1026 15.189 32.7508 15.1031 32.4475 14.9315C32.1441 14.7542 31.9076 14.505 31.7377 14.1838C31.5739 13.8626 31.492 13.4777 31.492 13.0291C31.492 12.5749 31.5739 12.1873 31.7377 11.866C31.9076 11.5448 32.1441 11.2984 32.4475 11.1267C32.7508 10.955 33.1026 10.8692 33.503 10.8692C33.9155 10.8692 34.2703 10.9633 34.5676 11.1516C34.8709 11.3399 35.0741 11.5947 35.1772 11.9159H35.068V9H35.805V15.1142H35.0771V14.1173H35.1772C35.0802 14.4496 34.88 14.7127 34.5767 14.9065C34.2734 15.0948 33.9155 15.189 33.503 15.189ZM33.6576 14.6407C34.0883 14.6407 34.4341 14.505 34.695 14.2336C34.9558 13.9567 35.0862 13.5552 35.0862 13.0291C35.0862 12.4974 34.9558 12.0959 34.695 11.8245C34.4341 11.5476 34.0883 11.4091 33.6576 11.4091C33.227 11.4091 32.8812 11.5476 32.6203 11.8245C32.3656 12.0959 32.2382 12.4974 32.2382 13.0291C32.2382 13.5552 32.3656 13.9567 32.6203 14.2336C32.8812 14.505 33.227 14.6407 33.6576 14.6407Z"
            fill="#C0CCDA"
          />
          <path
            d="M41.8956 15.189C41.4831 15.189 41.1282 15.0948 40.831 14.9065C40.5338 14.7127 40.3336 14.4496 40.2305 14.1173H40.3305V15.1142H39.6026V9H40.3396V11.9159H40.2305C40.3336 11.5947 40.5338 11.3399 40.831 11.1516C41.1282 10.9633 41.4831 10.8692 41.8956 10.8692C42.3081 10.8692 42.663 10.9578 42.9602 11.135C43.2635 11.3067 43.4971 11.5531 43.6608 11.8744C43.8307 12.1956 43.9156 12.5805 43.9156 13.0291C43.9156 13.4777 43.8307 13.8626 43.6608 14.1838C43.491 14.505 43.2544 14.7542 42.9511 14.9315C42.6539 15.1031 42.302 15.189 41.8956 15.189ZM41.7409 14.6407C42.1716 14.6407 42.5174 14.505 42.7782 14.2336C43.0391 13.9623 43.1695 13.5607 43.1695 13.0291C43.1695 12.4974 43.0391 12.0959 42.7782 11.8245C42.5174 11.5476 42.1716 11.4091 41.7409 11.4091C41.3102 11.4091 40.9645 11.5476 40.7036 11.8245C40.4488 12.0959 40.3214 12.4974 40.3214 13.0291C40.3214 13.5552 40.4488 13.9567 40.7036 14.2336C40.9645 14.505 41.3102 14.6407 41.7409 14.6407Z"
            fill="#C0CCDA"
          />
          <path
            d="M44.8144 17L44.6415 16.4434C44.9266 16.3825 45.1632 16.3105 45.3512 16.2274C45.5453 16.1499 45.7061 16.0447 45.8335 15.9117C45.9609 15.7788 46.0701 15.6127 46.1611 15.4133L46.3976 14.9232L46.3794 15.2056L44.3867 10.9439H45.1874L46.8344 14.6075H46.5978L48.2266 10.9439H49L46.889 15.4631C46.7677 15.729 46.6342 15.9505 46.4886 16.1277C46.343 16.3105 46.1853 16.4573 46.0155 16.568C45.8517 16.6843 45.6697 16.7757 45.4695 16.8422C45.2693 16.9086 45.051 16.9612 44.8144 17Z"
            fill="#C0CCDA"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M82 13C82 20.1797 76.1797 26 69 26C61.8203 26 56 20.1797 56 13C56 5.8203 61.8203 0 69 0C76.1797 0 82 5.8203 82 13ZM69.3236 21.5263C69.4323 20.9312 69.5374 20.3562 69.6324 19.7813C70.0565 19.7586 70.4626 19.7503 70.8584 19.7423C71.4 19.7312 71.9222 19.7205 72.4443 19.6741C73.9507 19.4328 74.9048 18.3607 75.2061 16.6988C75.4822 15.1174 75.1056 14.2596 73.6997 13.2679C73.6871 13.2545 73.6808 13.2344 73.6714 13.2042C73.662 13.1741 73.6495 13.1339 73.6243 13.0802C74.9048 12.5174 75.3065 11.3916 75.2563 10.0246C75.181 8.65757 74.3022 7.93386 73.2478 7.42458C73.015 7.31585 72.7653 7.20712 72.5037 7.09317C72.3138 7.01049 72.1177 6.92506 71.9171 6.83489C71.9917 6.41384 72.0618 5.99278 72.1312 5.57583C72.2253 5.01069 72.3181 4.45309 72.4192 3.91324C72.1431 3.85963 71.892 3.80603 71.6409 3.75242C71.3899 3.69881 71.1388 3.6452 70.8626 3.59159C70.7748 4.07406 70.6932 4.54984 70.6116 5.02561C70.53 5.50139 70.4484 5.97716 70.3605 6.45963C70.1776 6.42517 70.0085 6.39071 69.8394 6.35625C69.614 6.3103 69.3885 6.26435 69.1303 6.2184C69.2023 5.81183 69.2701 5.40976 69.3372 5.0122C69.4337 4.43999 69.5287 3.8771 69.6324 3.32355C69.0047 3.18953 68.4775 3.08231 67.9 2.9751C67.8415 3.30563 67.7829 3.63319 67.7243 3.96074C67.6072 4.61601 67.49 5.27127 67.3728 5.95036C67.0262 5.87987 66.6877 5.80937 66.3537 5.73983C65.6719 5.59783 65.009 5.45981 64.3349 5.33386C64.2094 5.97716 64.109 6.51324 64.0085 7.12974C64.2183 7.16174 64.4192 7.20328 64.6111 7.24298C64.7407 7.26979 64.8662 7.29575 64.9877 7.31736C65.6656 7.42458 65.9166 7.85345 65.7911 8.55035C65.5902 9.72974 65.3831 10.9091 65.176 12.0885C64.9689 13.2679 64.7617 14.4473 64.5609 15.6266C64.4856 16.1895 64.2094 16.3236 63.7324 16.2431C62.6277 16.0823 62.6277 16.0823 62.2511 17.1813L62.251 17.1814C62.1757 17.4494 62.1004 17.7174 62 18.0926C62.5398 18.1998 63.0608 18.3071 63.5818 18.4143C64.1027 18.5215 64.6237 18.6287 65.1634 18.7359C65.0445 19.3547 64.9432 19.9454 64.8439 20.5245C64.7754 20.9237 64.7079 21.3174 64.6362 21.7112C64.9375 21.7782 65.2199 21.8318 65.5024 21.8854C65.7848 21.939 66.0673 21.9926 66.3685 22.0596C66.4253 21.7393 66.4821 21.4246 66.538 21.1146C66.6552 20.4647 66.7687 19.8354 66.8707 19.2184C67.1289 19.2644 67.3544 19.3103 67.5798 19.3563C67.7489 19.3907 67.918 19.4252 68.1009 19.4596C68.0388 19.81 67.9799 20.1503 67.9218 20.4853C67.8156 21.0986 67.7124 21.6941 67.5988 22.3009C67.811 22.3421 68.0085 22.3793 68.2011 22.4157C68.5096 22.4739 68.8057 22.5297 69.1303 22.5957C69.1951 22.2296 69.26 21.8745 69.3236 21.5263ZM67.6374 15.0282C67.7417 14.4439 67.846 13.8596 67.9503 13.2411C68.253 13.3357 68.5535 13.4233 68.8512 13.5101C69.5659 13.7185 70.2644 13.9222 70.9379 14.206C71.7916 14.5813 72.118 15.305 71.9673 16.0823C71.8167 16.806 71.3145 17.3153 70.3856 17.3421C69.6818 17.3604 68.9898 17.2911 68.2774 17.2196C67.9478 17.1866 67.6139 17.1531 67.2724 17.1277C67.3941 16.3916 67.5157 15.7099 67.6374 15.0282ZM69.1393 11.7903C68.8431 11.7617 68.5395 11.7323 68.2264 11.7132C68.4524 10.4535 68.6281 9.40809 68.829 8.2019C69.1109 8.29311 69.3929 8.37501 69.6718 8.45605C70.2126 8.61316 70.7423 8.76702 71.2392 8.97922C71.9673 9.30087 72.2686 9.97097 72.1431 10.6947C72.0175 11.3916 71.5154 11.8473 70.6869 11.8741C70.1859 11.8913 69.6745 11.8419 69.1393 11.7903Z"
            fill="#C0CCDA"
          />
          <path
            d="M83.6841 5.60264C83.6841 4.18202 84.7386 3.10986 86.3705 3.10986C88.0024 3.10986 89.0569 4.12842 89.0569 5.52223C89.0569 6.99646 88.0024 8.09543 86.3705 8.09543C84.7637 8.09543 83.6841 7.02326 83.6841 5.60264ZM84.1862 9.56966H88.5799V22.9717H84.1862V9.56966Z"
            fill="#C0CCDA"
          />
          <path
            d="M99.5012 22.4354C98.748 22.9447 97.5931 23.2127 96.4382 23.2127C93.2246 23.2127 91.3416 21.524 91.3416 18.0931V13.59H89.5088V10.0787H91.3416V6.59415H95.7352V10.0787H98.5974V13.59H95.7352V18.0395C95.7352 19.0313 96.2625 19.5673 97.0659 19.5673C97.5429 19.5673 98.0451 19.4065 98.3965 19.1385L99.5012 22.4354Z"
            fill="#C0CCDA"
          />
          <path
            d="M113.963 15.3055V22.9715H109.569V16.0828C109.569 14.1529 108.791 13.3488 107.51 13.3488C106.104 13.3488 105 14.287 105 16.5117V22.9983H100.606V9.59625H104.799V11.0437C105.803 9.94471 107.209 9.35501 108.791 9.35501C111.703 9.35501 113.963 11.1509 113.963 15.3055Z"
            fill="#C0CCDA"
          />
          <path
            d="M115.544 16.2437C115.544 12.2231 118.532 9.35501 122.624 9.35501C126.767 9.35501 129.705 12.2231 129.705 16.2437C129.705 20.2911 126.767 23.1859 122.624 23.1859C118.507 23.1859 115.544 20.3179 115.544 16.2437ZM125.261 16.2437C125.261 14.2066 124.131 13.0808 122.624 13.0808C121.143 13.0808 119.988 14.2066 119.988 16.2437C119.988 18.3076 121.143 19.4602 122.624 19.4602C124.131 19.4602 125.261 18.3076 125.261 16.2437Z"
            fill="#C0CCDA"
          />
          <path d="M144.015 9.56934L138.843 22.9714H134.299L129.127 9.56934H133.646L136.659 17.7446L139.822 9.56934H144.015Z" fill="#C0CCDA" />
          <path
            d="M143.438 16.2437C143.438 12.2231 146.426 9.35501 150.518 9.35501C154.661 9.35501 157.598 12.2231 157.598 16.2437C157.598 20.2911 154.661 23.1859 150.518 23.1859C146.426 23.1859 143.438 20.3179 143.438 16.2437ZM153.154 16.2437C153.154 14.2066 152.024 13.0808 150.518 13.0808C149.037 13.0808 147.882 14.2066 147.882 16.2437C147.882 18.3076 149.037 19.4602 150.518 19.4602C152.024 19.4602 153.154 18.3076 153.154 16.2437Z"
            fill="#C0CCDA"
          />
          <path
            d="M161.339 23.1053C162.808 23.1053 164 21.8333 164 20.2641C164 18.6949 162.808 17.4229 161.339 17.4229C159.869 17.4229 158.677 18.6949 158.677 20.2641C158.677 21.8333 159.869 23.1053 161.339 23.1053Z"
            fill="#C0CCDA"
          />
          <line x1="180.5" y1="2.18557e-08" x2="180.5" y2="26" stroke="#C0CCDA" />
          <path
            d="M201.357 18.12C200.741 18.12 200.169 18.012 199.641 17.796C199.113 17.572 198.649 17.264 198.249 16.872C197.857 16.472 197.549 16.008 197.325 15.48C197.109 14.952 197.001 14.38 197.001 13.764C197.001 13.148 197.109 12.576 197.325 12.048C197.549 11.52 197.857 11.06 198.249 10.668C198.649 10.276 199.113 9.972 199.641 9.756C200.169 9.532 200.741 9.42 201.357 9.42C201.973 9.42 202.545 9.532 203.073 9.756C203.601 9.972 204.061 10.276 204.453 10.668C204.845 11.06 205.149 11.52 205.365 12.048C205.589 12.576 205.701 13.148 205.701 13.764C205.701 14.38 205.589 14.952 205.365 15.48C205.149 16.008 204.845 16.472 204.453 16.872C204.061 17.264 203.601 17.572 203.073 17.796C202.545 18.012 201.973 18.12 201.357 18.12ZM201.573 16.356C200.773 16.356 200.137 16.12 199.665 15.648C199.201 15.176 198.969 14.544 198.969 13.752C198.969 12.952 199.201 12.324 199.665 11.868C200.137 11.412 200.773 11.184 201.573 11.184C201.893 11.184 202.209 11.236 202.521 11.34C202.841 11.436 203.101 11.576 203.301 11.76L202.929 12.66C202.753 12.5 202.553 12.38 202.329 12.3C202.113 12.22 201.893 12.18 201.669 12.18C201.229 12.18 200.881 12.32 200.625 12.6C200.369 12.872 200.241 13.256 200.241 13.752C200.241 14.248 200.369 14.64 200.625 14.928C200.881 15.208 201.229 15.348 201.669 15.348C201.893 15.348 202.113 15.308 202.329 15.228C202.553 15.148 202.753 15.028 202.929 14.868L203.301 15.768C203.101 15.944 202.841 16.088 202.521 16.2C202.201 16.304 201.885 16.356 201.573 16.356ZM201.357 17.484C201.885 17.484 202.373 17.392 202.821 17.208C203.269 17.016 203.657 16.752 203.985 16.416C204.313 16.08 204.569 15.688 204.753 15.24C204.937 14.784 205.029 14.292 205.029 13.764C205.029 13.236 204.937 12.748 204.753 12.3C204.569 11.844 204.313 11.452 203.985 11.124C203.657 10.788 203.269 10.528 202.821 10.344C202.373 10.152 201.885 10.056 201.357 10.056C200.829 10.056 200.341 10.152 199.893 10.344C199.445 10.528 199.053 10.788 198.717 11.124C198.389 11.452 198.133 11.844 197.949 12.3C197.765 12.748 197.673 13.236 197.673 13.764C197.673 14.292 197.765 14.784 197.949 15.24C198.133 15.688 198.389 16.08 198.717 16.416C199.053 16.752 199.445 17.016 199.893 17.208C200.341 17.392 200.829 17.484 201.357 17.484ZM210.475 18V16.86L213.283 13.932C213.635 13.564 213.895 13.224 214.063 12.912C214.231 12.6 214.315 12.28 214.315 11.952C214.315 11.544 214.187 11.236 213.931 11.028C213.675 10.82 213.303 10.716 212.815 10.716C212.423 10.716 212.047 10.788 211.687 10.932C211.327 11.068 210.975 11.284 210.631 11.58L210.127 10.428C210.471 10.124 210.895 9.88 211.399 9.696C211.911 9.512 212.447 9.42 213.007 9.42C213.919 9.42 214.619 9.624 215.107 10.032C215.595 10.44 215.839 11.024 215.839 11.784C215.839 12.312 215.715 12.816 215.467 13.296C215.219 13.768 214.835 14.264 214.315 14.784L211.975 17.124V16.716H216.175V18H210.475ZM220.334 18.12C219.342 18.12 218.578 17.744 218.042 16.992C217.506 16.232 217.238 15.152 217.238 13.752C217.238 12.336 217.506 11.26 218.042 10.524C218.578 9.788 219.342 9.42 220.334 9.42C221.334 9.42 222.098 9.788 222.626 10.524C223.162 11.26 223.43 12.332 223.43 13.74C223.43 15.148 223.162 16.232 222.626 16.992C222.098 17.744 221.334 18.12 220.334 18.12ZM220.334 16.848C220.878 16.848 221.282 16.6 221.546 16.104C221.81 15.6 221.942 14.812 221.942 13.74C221.942 12.668 221.81 11.892 221.546 11.412C221.282 10.924 220.878 10.68 220.334 10.68C219.798 10.68 219.394 10.924 219.122 11.412C218.858 11.892 218.726 12.668 218.726 13.74C218.726 14.812 218.858 15.6 219.122 16.104C219.394 16.6 219.798 16.848 220.334 16.848ZM224.866 18V16.86L227.674 13.932C228.026 13.564 228.286 13.224 228.454 12.912C228.622 12.6 228.706 12.28 228.706 11.952C228.706 11.544 228.578 11.236 228.322 11.028C228.066 10.82 227.694 10.716 227.206 10.716C226.814 10.716 226.438 10.788 226.078 10.932C225.718 11.068 225.366 11.284 225.022 11.58L224.518 10.428C224.862 10.124 225.286 9.88 225.79 9.696C226.302 9.512 226.838 9.42 227.398 9.42C228.31 9.42 229.01 9.624 229.498 10.032C229.986 10.44 230.23 11.024 230.23 11.784C230.23 12.312 230.106 12.816 229.858 13.296C229.61 13.768 229.226 14.264 228.706 14.784L226.366 17.124V16.716H230.566V18H224.866ZM232.061 18V16.86L234.869 13.932C235.221 13.564 235.481 13.224 235.649 12.912C235.817 12.6 235.901 12.28 235.901 11.952C235.901 11.544 235.773 11.236 235.517 11.028C235.261 10.82 234.889 10.716 234.401 10.716C234.009 10.716 233.633 10.788 233.273 10.932C232.913 11.068 232.561 11.284 232.217 11.58L231.713 10.428C232.057 10.124 232.481 9.88 232.985 9.696C233.497 9.512 234.033 9.42 234.593 9.42C235.505 9.42 236.205 9.624 236.693 10.032C237.181 10.44 237.425 11.024 237.425 11.784C237.425 12.312 237.301 12.816 237.053 13.296C236.805 13.768 236.421 14.264 235.901 14.784L233.561 17.124V16.716H237.761V18H232.061ZM242.549 18V9.54H246.257C247.177 9.54 247.885 9.736 248.381 10.128C248.877 10.512 249.125 11.048 249.125 11.736C249.125 12.248 248.973 12.68 248.669 13.032C248.365 13.384 247.945 13.62 247.409 13.74V13.56C248.025 13.648 248.501 13.872 248.837 14.232C249.181 14.584 249.353 15.052 249.353 15.636C249.353 16.388 249.093 16.972 248.573 17.388C248.053 17.796 247.329 18 246.401 18H242.549ZM244.037 16.824H246.221C246.741 16.824 247.145 16.728 247.433 16.536C247.721 16.336 247.865 16.012 247.865 15.564C247.865 15.108 247.721 14.784 247.433 14.592C247.145 14.392 246.741 14.292 246.221 14.292H244.037V16.824ZM244.037 13.128H245.993C246.545 13.128 246.953 13.028 247.217 12.828C247.489 12.62 247.625 12.316 247.625 11.916C247.625 11.516 247.489 11.216 247.217 11.016C246.953 10.808 246.545 10.704 245.993 10.704H244.037V13.128ZM250.714 18V11.94H252.214V18H250.714ZM250.63 10.8V9.336H252.298V10.8H250.63ZM256.435 18.12C255.715 18.12 255.171 17.932 254.803 17.556C254.435 17.18 254.251 16.616 254.251 15.864V13.068H253.087V11.94H254.251V10.392L255.751 10.008V11.94H257.371V13.068H255.751V15.768C255.751 16.184 255.831 16.476 255.991 16.644C256.151 16.812 256.371 16.896 256.651 16.896C256.803 16.896 256.931 16.884 257.035 16.86C257.147 16.836 257.255 16.804 257.359 16.764V17.952C257.223 18.008 257.071 18.048 256.903 18.072C256.743 18.104 256.587 18.12 256.435 18.12ZM258.39 18V13.452C258.39 13.204 258.382 12.952 258.366 12.696C258.35 12.44 258.326 12.188 258.294 11.94H259.746L259.866 13.14H259.722C259.914 12.716 260.198 12.392 260.574 12.168C260.95 11.936 261.386 11.82 261.882 11.82C262.594 11.82 263.13 12.02 263.49 12.42C263.85 12.82 264.03 13.444 264.03 14.292V18H262.53V14.364C262.53 13.876 262.434 13.528 262.242 13.32C262.058 13.104 261.778 12.996 261.402 12.996C260.938 12.996 260.57 13.14 260.298 13.428C260.026 13.716 259.89 14.1 259.89 14.58V18H258.39ZM268.357 18.12C267.733 18.12 267.193 17.992 266.737 17.736C266.281 17.48 265.925 17.116 265.669 16.644C265.421 16.172 265.297 15.612 265.297 14.964C265.297 14.316 265.421 13.76 265.669 13.296C265.925 12.824 266.281 12.46 266.737 12.204C267.193 11.948 267.733 11.82 268.357 11.82C268.981 11.82 269.521 11.948 269.977 12.204C270.441 12.46 270.797 12.824 271.045 13.296C271.301 13.76 271.429 14.316 271.429 14.964C271.429 15.612 271.301 16.172 271.045 16.644C270.797 17.116 270.441 17.48 269.977 17.736C269.521 17.992 268.981 18.12 268.357 18.12ZM268.357 16.968C268.829 16.968 269.205 16.804 269.485 16.476C269.765 16.14 269.905 15.636 269.905 14.964C269.905 14.292 269.765 13.792 269.485 13.464C269.205 13.136 268.829 12.972 268.357 12.972C267.885 12.972 267.509 13.136 267.229 13.464C266.949 13.792 266.809 14.292 266.809 14.964C266.809 15.636 266.949 16.14 267.229 16.476C267.509 16.804 267.885 16.968 268.357 16.968ZM274.381 18L271.765 11.94H273.361L275.257 16.68H274.885L276.829 11.94H278.329L275.701 18H274.381ZM281.751 18.12C281.127 18.12 280.587 17.992 280.131 17.736C279.675 17.48 279.319 17.116 279.063 16.644C278.815 16.172 278.691 15.612 278.691 14.964C278.691 14.316 278.815 13.76 279.063 13.296C279.319 12.824 279.675 12.46 280.131 12.204C280.587 11.948 281.127 11.82 281.751 11.82C282.375 11.82 282.915 11.948 283.371 12.204C283.835 12.46 284.191 12.824 284.439 13.296C284.695 13.76 284.823 14.316 284.823 14.964C284.823 15.612 284.695 16.172 284.439 16.644C284.191 17.116 283.835 17.48 283.371 17.736C282.915 17.992 282.375 18.12 281.751 18.12ZM281.751 16.968C282.223 16.968 282.599 16.804 282.879 16.476C283.159 16.14 283.299 15.636 283.299 14.964C283.299 14.292 283.159 13.792 282.879 13.464C282.599 13.136 282.223 12.972 281.751 12.972C281.279 12.972 280.903 13.136 280.623 13.464C280.343 13.792 280.203 14.292 280.203 14.964C280.203 15.636 280.343 16.14 280.623 16.476C280.903 16.804 281.279 16.968 281.751 16.968ZM285.726 18V16.332H287.406V18H285.726ZM291.348 18L295.176 9.54H296.472L300.348 18H298.776L297.744 15.624L298.368 16.044H293.292L293.94 15.624L292.908 18H291.348ZM295.812 11.196L294.12 15.204L293.808 14.832H297.84L297.588 15.204L295.86 11.196H295.812ZM301.164 18V9.168H302.664V18H301.164ZM304.293 18V9.168H305.793V18H304.293ZM310.702 18V13.488C310.702 13.232 310.694 12.972 310.678 12.708C310.67 12.444 310.65 12.188 310.618 11.94H312.07L312.238 13.596H311.998C312.078 13.196 312.21 12.864 312.394 12.6C312.586 12.336 312.818 12.14 313.09 12.012C313.362 11.884 313.658 11.82 313.978 11.82C314.122 11.82 314.238 11.828 314.326 11.844C314.414 11.852 314.502 11.872 314.59 11.904L314.578 13.224C314.426 13.16 314.294 13.12 314.182 13.104C314.078 13.088 313.946 13.08 313.786 13.08C313.442 13.08 313.15 13.152 312.91 13.296C312.678 13.44 312.502 13.64 312.382 13.896C312.27 14.152 312.214 14.444 312.214 14.772V18H310.702ZM315.425 18V11.94H316.925V18H315.425ZM315.341 10.8V9.336H317.009V10.8H315.341ZM321.362 20.688C320.802 20.688 320.294 20.628 319.838 20.508C319.39 20.388 318.99 20.204 318.638 19.956L318.962 18.876C319.194 19.028 319.434 19.152 319.682 19.248C319.93 19.344 320.186 19.416 320.45 19.464C320.714 19.512 320.982 19.536 321.254 19.536C321.814 19.536 322.23 19.396 322.502 19.116C322.782 18.844 322.922 18.452 322.922 17.94V16.488H323.042C322.914 16.904 322.654 17.236 322.262 17.484C321.878 17.732 321.434 17.856 320.93 17.856C320.386 17.856 319.91 17.736 319.502 17.496C319.102 17.248 318.79 16.896 318.566 16.44C318.342 15.984 318.23 15.448 318.23 14.832C318.23 14.216 318.342 13.684 318.566 13.236C318.79 12.78 319.102 12.432 319.502 12.192C319.91 11.944 320.386 11.82 320.93 11.82C321.442 11.82 321.886 11.944 322.262 12.192C322.646 12.432 322.902 12.76 323.03 13.176L322.922 13.104L323.042 11.94H324.494C324.462 12.188 324.438 12.44 324.422 12.696C324.406 12.952 324.398 13.204 324.398 13.452V17.76C324.398 18.712 324.138 19.436 323.618 19.932C323.106 20.436 322.354 20.688 321.362 20.688ZM321.338 16.704C321.818 16.704 322.198 16.544 322.478 16.224C322.766 15.896 322.91 15.432 322.91 14.832C322.91 14.232 322.766 13.772 322.478 13.452C322.198 13.132 321.818 12.972 321.338 12.972C320.85 12.972 320.462 13.132 320.174 13.452C319.886 13.772 319.742 14.232 319.742 14.832C319.742 15.432 319.886 15.896 320.174 16.224C320.462 16.544 320.85 16.704 321.338 16.704ZM326.019 18V9.168H327.519V13.152H327.351C327.535 12.72 327.819 12.392 328.203 12.168C328.587 11.936 329.027 11.82 329.523 11.82C330.243 11.82 330.779 12.024 331.131 12.432C331.483 12.832 331.659 13.444 331.659 14.268V18H330.159V14.34C330.159 13.868 330.067 13.528 329.883 13.32C329.707 13.104 329.423 12.996 329.031 12.996C328.575 12.996 328.207 13.14 327.927 13.428C327.655 13.708 327.519 14.084 327.519 14.556V18H326.019ZM335.842 18.12C335.122 18.12 334.578 17.932 334.21 17.556C333.842 17.18 333.658 16.616 333.658 15.864V13.068H332.494V11.94H333.658V10.392L335.158 10.008V11.94H336.778V13.068H335.158V15.768C335.158 16.184 335.238 16.476 335.398 16.644C335.558 16.812 335.778 16.896 336.058 16.896C336.21 16.896 336.338 16.884 336.442 16.86C336.554 16.836 336.662 16.804 336.766 16.764V17.952C336.63 18.008 336.478 18.048 336.31 18.072C336.15 18.104 335.994 18.12 335.842 18.12ZM339.956 18.12C339.436 18.12 338.956 18.06 338.516 17.94C338.084 17.812 337.72 17.636 337.424 17.412L337.844 16.404C338.148 16.612 338.484 16.772 338.852 16.884C339.22 16.996 339.592 17.052 339.968 17.052C340.368 17.052 340.664 16.984 340.856 16.848C341.056 16.712 341.156 16.528 341.156 16.296C341.156 16.112 341.092 15.968 340.964 15.864C340.844 15.752 340.648 15.668 340.376 15.612L339.176 15.384C338.664 15.272 338.272 15.08 338 14.808C337.736 14.536 337.604 14.18 337.604 13.74C337.604 13.364 337.704 13.032 337.904 12.744C338.112 12.456 338.404 12.232 338.78 12.072C339.164 11.904 339.612 11.82 340.124 11.82C340.572 11.82 340.992 11.88 341.384 12C341.784 12.12 342.12 12.3 342.392 12.54L341.96 13.512C341.712 13.312 341.428 13.156 341.108 13.044C340.788 12.932 340.476 12.876 340.172 12.876C339.756 12.876 339.452 12.952 339.26 13.104C339.068 13.248 338.972 13.436 338.972 13.668C338.972 13.844 339.028 13.992 339.14 14.112C339.26 14.224 339.444 14.308 339.692 14.364L340.892 14.592C341.428 14.696 341.832 14.88 342.104 15.144C342.384 15.4 342.524 15.752 342.524 16.2C342.524 16.6 342.416 16.944 342.2 17.232C341.984 17.52 341.684 17.74 341.3 17.892C340.916 18.044 340.468 18.12 339.956 18.12ZM347.089 18V13.488C347.089 13.232 347.081 12.972 347.065 12.708C347.057 12.444 347.037 12.188 347.005 11.94H348.457L348.625 13.596H348.385C348.465 13.196 348.597 12.864 348.781 12.6C348.973 12.336 349.205 12.14 349.477 12.012C349.749 11.884 350.045 11.82 350.365 11.82C350.509 11.82 350.625 11.828 350.713 11.844C350.801 11.852 350.889 11.872 350.977 11.904L350.965 13.224C350.813 13.16 350.681 13.12 350.569 13.104C350.465 13.088 350.333 13.08 350.173 13.08C349.829 13.08 349.537 13.152 349.297 13.296C349.065 13.44 348.889 13.64 348.769 13.896C348.657 14.152 348.601 14.444 348.601 14.772V18H347.089ZM354.646 18.12C353.63 18.12 352.834 17.84 352.258 17.28C351.682 16.72 351.394 15.952 351.394 14.976C351.394 14.344 351.518 13.792 351.766 13.32C352.014 12.848 352.358 12.48 352.798 12.216C353.246 11.952 353.766 11.82 354.358 11.82C354.942 11.82 355.43 11.944 355.822 12.192C356.214 12.44 356.51 12.788 356.71 13.236C356.918 13.684 357.022 14.208 357.022 14.808V15.204H352.606V14.412H355.954L355.75 14.58C355.75 14.02 355.63 13.592 355.39 13.296C355.158 13 354.818 12.852 354.37 12.852C353.874 12.852 353.49 13.028 353.218 13.38C352.954 13.732 352.822 14.224 352.822 14.856V15.012C352.822 15.668 352.982 16.16 353.302 16.488C353.63 16.808 354.09 16.968 354.682 16.968C355.026 16.968 355.346 16.924 355.642 16.836C355.946 16.74 356.234 16.588 356.506 16.38L356.95 17.388C356.662 17.62 356.318 17.8 355.918 17.928C355.518 18.056 355.094 18.12 354.646 18.12ZM360.453 18.12C359.933 18.12 359.453 18.06 359.013 17.94C358.581 17.812 358.217 17.636 357.921 17.412L358.341 16.404C358.645 16.612 358.981 16.772 359.349 16.884C359.717 16.996 360.089 17.052 360.465 17.052C360.865 17.052 361.161 16.984 361.353 16.848C361.553 16.712 361.653 16.528 361.653 16.296C361.653 16.112 361.589 15.968 361.461 15.864C361.341 15.752 361.145 15.668 360.873 15.612L359.673 15.384C359.161 15.272 358.769 15.08 358.497 14.808C358.233 14.536 358.101 14.18 358.101 13.74C358.101 13.364 358.201 13.032 358.401 12.744C358.609 12.456 358.901 12.232 359.277 12.072C359.661 11.904 360.109 11.82 360.621 11.82C361.069 11.82 361.489 11.88 361.881 12C362.281 12.12 362.617 12.3 362.889 12.54L362.457 13.512C362.209 13.312 361.925 13.156 361.605 13.044C361.285 12.932 360.973 12.876 360.669 12.876C360.253 12.876 359.949 12.952 359.757 13.104C359.565 13.248 359.469 13.436 359.469 13.668C359.469 13.844 359.525 13.992 359.637 14.112C359.757 14.224 359.941 14.308 360.189 14.364L361.389 14.592C361.925 14.696 362.329 14.88 362.601 15.144C362.881 15.4 363.021 15.752 363.021 16.2C363.021 16.6 362.913 16.944 362.697 17.232C362.481 17.52 362.181 17.74 361.797 17.892C361.413 18.044 360.965 18.12 360.453 18.12ZM367.232 18.12C366.216 18.12 365.42 17.84 364.844 17.28C364.268 16.72 363.98 15.952 363.98 14.976C363.98 14.344 364.104 13.792 364.352 13.32C364.6 12.848 364.944 12.48 365.384 12.216C365.832 11.952 366.352 11.82 366.944 11.82C367.528 11.82 368.016 11.944 368.408 12.192C368.8 12.44 369.096 12.788 369.296 13.236C369.504 13.684 369.608 14.208 369.608 14.808V15.204H365.192V14.412H368.54L368.336 14.58C368.336 14.02 368.216 13.592 367.976 13.296C367.744 13 367.404 12.852 366.956 12.852C366.46 12.852 366.076 13.028 365.804 13.38C365.54 13.732 365.408 14.224 365.408 14.856V15.012C365.408 15.668 365.568 16.16 365.888 16.488C366.216 16.808 366.676 16.968 367.268 16.968C367.612 16.968 367.932 16.924 368.228 16.836C368.532 16.74 368.82 16.588 369.092 16.38L369.536 17.388C369.248 17.62 368.904 17.8 368.504 17.928C368.104 18.056 367.68 18.12 367.232 18.12ZM370.867 18V13.488C370.867 13.232 370.859 12.972 370.843 12.708C370.835 12.444 370.815 12.188 370.783 11.94H372.235L372.403 13.596H372.163C372.243 13.196 372.375 12.864 372.559 12.6C372.751 12.336 372.983 12.14 373.255 12.012C373.527 11.884 373.823 11.82 374.143 11.82C374.287 11.82 374.403 11.828 374.491 11.844C374.579 11.852 374.667 11.872 374.755 11.904L374.743 13.224C374.591 13.16 374.459 13.12 374.347 13.104C374.243 13.088 374.111 13.08 373.951 13.08C373.607 13.08 373.315 13.152 373.075 13.296C372.843 13.44 372.667 13.64 372.547 13.896C372.435 14.152 372.379 14.444 372.379 14.772V18H370.867ZM377.729 18L375.113 11.94H376.709L378.605 16.68H378.233L380.177 11.94H381.677L379.049 18H377.729ZM385.291 18.12C384.275 18.12 383.479 17.84 382.903 17.28C382.327 16.72 382.039 15.952 382.039 14.976C382.039 14.344 382.163 13.792 382.411 13.32C382.659 12.848 383.003 12.48 383.443 12.216C383.891 11.952 384.411 11.82 385.003 11.82C385.587 11.82 386.075 11.944 386.467 12.192C386.859 12.44 387.155 12.788 387.355 13.236C387.563 13.684 387.667 14.208 387.667 14.808V15.204H383.251V14.412H386.599L386.395 14.58C386.395 14.02 386.275 13.592 386.035 13.296C385.803 13 385.463 12.852 385.015 12.852C384.519 12.852 384.135 13.028 383.863 13.38C383.599 13.732 383.467 14.224 383.467 14.856V15.012C383.467 15.668 383.627 16.16 383.947 16.488C384.275 16.808 384.735 16.968 385.327 16.968C385.671 16.968 385.991 16.924 386.287 16.836C386.591 16.74 386.879 16.588 387.151 16.38L387.595 17.388C387.307 17.62 386.963 17.8 386.563 17.928C386.163 18.056 385.739 18.12 385.291 18.12ZM391.289 18.12C390.761 18.12 390.293 17.996 389.885 17.748C389.485 17.492 389.173 17.128 388.949 16.656C388.725 16.184 388.613 15.62 388.613 14.964C388.613 14.308 388.725 13.748 388.949 13.284C389.173 12.812 389.485 12.452 389.885 12.204C390.293 11.948 390.761 11.82 391.289 11.82C391.793 11.82 392.237 11.944 392.621 12.192C393.013 12.432 393.273 12.76 393.401 13.176H393.245V9.168H394.745V18H393.269V16.716H393.413C393.285 17.148 393.025 17.492 392.633 17.748C392.249 17.996 391.801 18.12 391.289 18.12ZM391.709 16.968C392.181 16.968 392.561 16.804 392.849 16.476C393.137 16.14 393.281 15.636 393.281 14.964C393.281 14.292 393.137 13.792 392.849 13.464C392.561 13.136 392.181 12.972 391.709 12.972C391.237 12.972 390.853 13.136 390.557 13.464C390.269 13.792 390.125 14.292 390.125 14.964C390.125 15.636 390.269 16.14 390.557 16.476C390.853 16.804 391.237 16.968 391.709 16.968ZM396.211 18V16.332H397.891V18H396.211Z"
            fill="#C0CCDA"
          />
        </svg>
      </span>
    </div>
  )
}

export default Resume
