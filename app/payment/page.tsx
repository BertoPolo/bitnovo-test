"use client"
import React, { useEffect, useState } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"

const PaymentForm = () => {
  const [coin, setCoin] = useState("")
  const [paymentUri, setPaymentUri] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const [error, setError] = useState("")
  const router = useRouter()

  type Currency = {
    symbol: string
  }

  const handleSubmit = async () => {
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
  // useEffect(() => {
  //   getCurriencies()
  // }, [])

  const currencyOptions = currencies.map((currency) => ({
    value: currency.symbol,
    label: currency.symbol,
  }))

  const filteredCurrencies = currencies.filter((currency) => currency.symbol.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="border-2 p-5 text-center">
      <h3 className="text-xl mb-6 ">Crear pago</h3>
      <div className="text-start">
        <label htmlFor="">Importe a pagar</label>
      </div>
      <input
        type="number"
        placeholder="56.06"
        className="input input-bordered w-full max-w-xs"
        value={price}
        onChange={(e) => setPrice(parseFloat(e.target.value))}
      />
      <br /> {/* take it out! */}
      {/* <div className="text-start">
        <label htmlFor="currency-search">Seleccionar moneda </label>
        <input
          id="currency-search"
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
        />
      </div>
      <select className="select select-bordered w-full max-w-xs" value={coin} onChange={(e) => setCoin(e.target.value)}>
        {filteredCurrencies.map((currency, index) => (
          <option key={index} value={currency.symbol}>
            {currency.symbol}
          </option>
        ))}
      </select> */}
      <div className="text-start">
        <label htmlFor="currency-search">Seleccionar moneda</label>
        <input
          id="currency-search"
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Buscar..."
        />
        {showDropdown && (
          <div className="absolute bg-white border mt-1 rounded">
            {filteredCurrencies.map((currency, index) => (
              <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => setCoin(currency.symbol)}>
                {currency.symbol}
              </div>
            ))}
          </div>
        )}
      </div>
      <br />
      <div className="text-start">
        <label htmlFor="">Concepto</label>
      </div>
      <input
        type="text"
        placeholder="Añade descripcion del pago"
        className="input input-bordered w-full max-w-xs"
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
      />
      <br />
      <button className="btn btn-primary btn-wide" disabled={price === 0 || !coin || !concept} onClick={handleSubmit}>
        Continuar
      </button>
    </div>
  )
}

export default PaymentForm
