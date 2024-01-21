"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Currency } from "@/types"
import Image from "next/image"

const PaymentForm = () => {
  const router = useRouter()

  const [coin, setCoin] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState(coin || "")
  const [showDropdown, setShowDropdown] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [coinImage, setCoinImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // const [minAmount, setMinAmount] = useState(0)
  // const [maxAmount, setMaxAmount] = useState(0)

  const handleSubmit = async () => {
    if (isValidCoin()) {
      const formData = new FormData()
      formData.append("expected_output_amount", price.toString())
      formData.append("merchant_urlok", "https://payments.com/success")
      formData.append("merchant_urlko", "https://payments.com/failed")
      formData.append("input_currency", coin)

      setIsLoading(true)
      try {
        const response = await fetch("https://payments.pre-bnvo.com/api/v1/orders/", {
          method: "POST",
          headers: {
            "X-Device-Id": process.env.NEXT_PUBLIC_IDENTIFIER || "",
          },
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          localStorage.setItem(
            "paymentData",
            JSON.stringify({
              price: price,
              coin: coin,
              concept: concept,
              identifier: data.identifier,
              payment_uri: data.payment_uri,
              expected_input_amount: data.expected_input_amount,
              tag_memo: data.tag_memo,
              address: data.address,
              image: coinImage,
            })
          )

          router.push("/payment/resume")
        } else {
          setErrorMessage("Please enter a valid amount and currency code to continue")
          setIsLoading(false)

          console.log(errorMessage)
        }
      } catch (error) {
        console.error("Error al enviar el pedido:", error)
        setErrorMessage("An error occurred while processing your payment")
      }
    } else {
      setErrorMessage("Choose one of the available coins")
      console.log(errorMessage)
    }
  }

  const getCurriencies = async () => {
    try {
      const response = await fetch("https://payments.pre-bnvo.com/api/v1/currencies", {
        headers: {
          "X-Device-Id": process.env.NEXT_PUBLIC_IDENTIFIER || "",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrencies(data)
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    getCurriencies()
  }, [])

  const filteredCurrencies = currencies.filter((currency) => currency.name.toLowerCase().includes(search.toLowerCase()))

  const isValidCoin = () => {
    return currencies.some((currency) => currency.symbol === coin)
  }

  const handleCurrencySelect = (name: string, symbol: string, image: string, min: number, max: number) => {
    setSearch(name)
    setCoin(symbol)
    setCoinImage(image)
    // setMaxAmount(max)
    // setMinAmount(min)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearch(value)
    if (value !== coin) {
      setCoin("")
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen ">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-80">
          <div className="animate-spin w-16 h-16 border-t-4 border-primary-500 rounded-full"></div>
        </div>
      )}
      <div className="shadow-md p-5 text-center">
        <h3 className="text-xl mb-6">Crear pago</h3>

        {/* price */}
        <div className="mb-4 ">
          <label className="flex" htmlFor="fiatAmount">
            Importe a pagar
          </label>
          <input
            type="number"
            name="fiatAmount"
            placeholder="56.06"
            className="input mt-1 input-bordered w-full"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            min={0.1}
          />
        </div>

        {/* coin selector */}
        <div className={`mb-4 ${!isLoading && "relative"} text-start`}>
          <label htmlFor="currency " className="mb-1">
            Seleccionar moneda
          </label>
          {/* <span className="">
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.99984 1.22917C3.54067 1.22917 0.729004 4.04083 0.729004 7.5C0.729004 10.9592 3.54067 13.7708 6.99984 13.7708C10.459 13.7708 13.2707 10.9592 13.2707 7.5C13.2707 4.04083 10.459 1.22917 6.99984 1.22917ZM6.99984 12.8958C4.02484 12.8958 1.604 10.475 1.604 7.5C1.604 4.525 4.02484 2.10417 6.99984 2.10417C9.97484 2.10417 12.3957 4.525 12.3957 7.5C12.3957 10.475 9.97484 12.8958 6.99984 12.8958Z"
                fill="#647184"
              />
              <path
                d="M7 6.47917C6.76083 6.47917 6.5625 6.6775 6.5625 6.91667V9.83333C6.5625 10.0725 6.76083 10.2708 7 10.2708C7.23917 10.2708 7.4375 10.0725 7.4375 9.83333V6.91667C7.4375 6.6775 7.23917 6.47917 7 6.47917Z"
                fill="#647184"
              />
              <path
                d="M6.99984 4.58333C6.924 4.58333 6.84817 4.60083 6.77817 4.63C6.70817 4.65917 6.644 4.7 6.58567 4.7525C6.53317 4.81084 6.49234 4.86917 6.46317 4.945C6.434 5.015 6.4165 5.09084 6.4165 5.16667C6.4165 5.2425 6.434 5.31834 6.46317 5.38834C6.49234 5.45834 6.53317 5.5225 6.58567 5.58084C6.644 5.63334 6.70817 5.67417 6.77817 5.70334C6.91817 5.76167 7.0815 5.76167 7.2215 5.70334C7.2915 5.67417 7.35567 5.63334 7.414 5.58084C7.4665 5.5225 7.50734 5.45834 7.5365 5.38834C7.56567 5.31834 7.58317 5.2425 7.58317 5.16667C7.58317 5.09084 7.56567 5.015 7.5365 4.945C7.50734 4.86917 7.4665 4.81084 7.414 4.7525C7.35567 4.7 7.2915 4.65917 7.2215 4.63C7.1515 4.60083 7.07567 4.58333 6.99984 4.58333Z"
                fill="#647184"
              />
            </svg>
          </span> */}
          <input
            id="currency"
            type="text"
            className="input input-bordered w-full"
            value={search}
            autoComplete="off"
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Buscar"
          />
          {showDropdown && (
            <div className="absolute bg-white border-0 rounded w-full">
              {filteredCurrencies.map((currency, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleCurrencySelect(currency.name, currency.symbol, currency.image, currency.min_amount, currency.max_amount)}
                >
                  <div className="flex">
                    {currency.image && (
                      <div className="flex items-center">
                        <Image src={currency.image} width={28} height={28} alt={currency.name} className="h-auto mr-2" />
                      </div>
                    )}
                    <div>
                      <p>{currency.name}</p>
                      <small className="text-slate-400 flex">{currency.symbol}</small>
                    </div>
                  </div>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15">
                      <path
                        fill="rgb(146, 189, 82)"
                        fillRule="evenodd"
                        d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* concept */}
        <div className="mb-4">
          <label className="flex mb-1" htmlFor="concept">
            Concepto
          </label>
          <input
            type="text"
            id="concept"
            placeholder="Añade descripcion del pago"
            className="input input-bordered w-full"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
        </div>

        <div>
          <button className="btn bgBlue mt-4 w-full " disabled={price === 0 || !coin || !concept || isLoading} onClick={handleSubmit}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
