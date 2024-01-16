"use client"
import React, { useEffect, useState } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"
import { Currency } from "@/types"

const PaymentForm = () => {
  const router = useRouter()

  const [coin, setCoin] = useState("")
  const [paymentUri, setPaymentUri] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState(coin || "")
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (isValidCoin()) {
      const formData = new FormData()
      formData.append("expected_output_amount", price.toString())
      formData.append("merchant_urlok", "https://payments.com/ok")
      formData.append("merchant_urlko", "https://payments.com/ko")
      formData.append("input_currency", "ETH_TEST3") //coin
      // if (coin === "XRP" || coin === "XLM" || coin === "ALGO") {
      //   // check coins exact name
      //   formData.append("", "")
      // }
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
          console.log(data)
          router.push(
            `/payment/resume?price=${encodeURIComponent(price)}&coin=${encodeURIComponent(coin)}&concept=
          ${encodeURIComponent(concept)}&id=${encodeURIComponent(data.identifier)}&paymentUri=${encodeURIComponent(data.payment_uri)}`
          )
        } else {
          setError("Please enter a valid amount and currency code to continue")
        }
      } catch (error) {
        console.error("Error al enviar el pedido:", error)
        setError("An error occurred while processing your payment")
      }
    } else {
      setError("Choose one of the available coins")
      console.log(error)
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
        console.log(data)
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    getCurriencies()
  }, [])

  const filteredCurrencies = currencies.filter((currency) => currency.symbol.toLowerCase().includes(search.toLowerCase()))

  const isValidCoin = () => {
    const selectedCurrency = currencies.find((currency) => currency.symbol === coin)
    return !!selectedCurrency
  }

  const handleCurrencySelect = (symbol: string) => {
    setCoin(symbol)
    setSearch(symbol)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearch(value)
    if (value !== coin) {
      setCoin("")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="border-2 p-5">
        <h3 className="text-xl mb-6 ">Crear pago</h3>
        <div>
          <p>Importe a pagar</p>
        </div>
        <input
          type="number"
          placeholder="56.06"
          className="input input-bordered w-full max-w-xs"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
        {/* take it out! */}
        <div>
          <p>Seleccionar moneda</p>

          <input
            id="currency-search"
            type="text"
            className="input input-bordered w-full max-w-xs"
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Buscar"
          />
          {showDropdown && (
            <div className="absolute bg-white border mt-1 rounded">
              {filteredCurrencies.map((currency, index) => (
                <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleCurrencySelect(currency.symbol)}>
                  {currency.symbol}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p>Concepto</p>
        </div>
        <input
          type="text"
          placeholder="Añade descripcion del pago"
          className="input input-bordered w-full max-w-xs"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />

        <button className="btn btn-primary btn-wide" disabled={price === 0 || !coin || !concept} onClick={handleSubmit}>
          Continuar
        </button>
      </div>
    </div>
  )
}

export default PaymentForm
