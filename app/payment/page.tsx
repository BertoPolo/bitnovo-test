"use client"
import React, { useEffect, useState } from "react"
// import Link from "next/link"
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

  const [minAmount, setMinAmount] = useState(0)
  const [maxAmount, setMaxAmount] = useState(0)

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
    setMaxAmount(max)
    setMinAmount(min)
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
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="animate-spin w-16 h-16 border-t-4 border-primary-500 rounded-full"></div>
        </div>
      )}
      <div className="shadow-md p-5 text-center">
        <h3 className="text-xl mb-6">Crear pago</h3>

        {/* price */}
        <div className="mb-4 ">
          <label className="flex">Importe a pagar</label>
          <input
            type="number"
            id="amount"
            placeholder="56.06"
            className="input input-bordered w-full"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            min={0.1}
          />
        </div>
        {/* coin selector */}
        <div className={`mb-4 ${!isLoading && "relative"} text-start`}>
          <label htmlFor="currency">Seleccionar moneda</label>
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
        <div className="mb-4 ">
          <label className="flex" htmlFor="concept">
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
          <button className="btn btn-primary mt-4 w-full " disabled={price === 0 || !coin || !concept || isLoading} onClick={handleSubmit}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
