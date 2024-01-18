"use client"
import React, { useEffect, useState } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"
import { Currency } from "@/types"
import Image from "next/image"

const PaymentForm = () => {
  const router = useRouter()

  const [coin, setCoin] = useState("")
  // const [paymentUri, setPaymentUri] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState(coin || "")
  const [showDropdown, setShowDropdown] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async () => {
    if (isValidCoin()) {
      const formData = new FormData()
      formData.append("expected_output_amount", price.toString())
      formData.append("merchant_urlok", "https://payments.com/success")
      formData.append("merchant_urlko", "https://payments.com/failed/")
      formData.append("input_currency", coin)
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
          //           console.log("return data from POST ", data)
          //           router.push(
          //             `/payment/resume?price=${encodeURIComponent(price)}&coin=${encodeURIComponent(coin)}&concept=
          //           ${encodeURIComponent(concept)}&id=${encodeURIComponent(data.identifier)}&paymentUri=${encodeURIComponent(
          //               data.payment_uri
          //             )}&expected_input_amount
          // =${encodeURIComponent(data.expected_input_amount)}&tag_memo=${encodeURIComponent(data.tag_memo)}
          // `)
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
            })
          )

          router.push("/payment/resume")
        } else {
          setErrorMessage("Please enter a valid amount and currency code to continue")
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
        console.log(data)
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
    const selectedCurrency = currencies.find((currency) => currency.name === coin)
    return !!selectedCurrency
  }

  const handleCurrencySelect = (name: string) => {
    setCoin(name)
    setSearch(name)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearch(value)
    if (value !== coin) {
      setCoin("")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="border-2 p-5">
        <h3 className="text-xl mb-6">Crear pago</h3>
        <div className="mb-4">
          <label htmlFor="amount">Importe a pagar</label>
          <input
            type="number"
            id="amount"
            placeholder="56.06"
            className="input input-bordered w-full max-w-xs"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="currency">Seleccionar moneda</label>
          <input
            id="currency"
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
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleCurrencySelect(currency.name)}
                >
                  {currency.image && <Image src={currency.image} width={20} height={20} alt={currency.name} className=" h-auto max-w-full mr-2" />}
                  <div>
                    <p>{currency.name}</p>
                    <small className="text-slate-400">{currency.symbol}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="concept">Concepto</label>
          <br />
          <input
            type="text"
            id="concept"
            placeholder="Añade descripcion del pago"
            className="input input-bordered w-full max-w-xs"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-wide mt-4" disabled={price === 0 || !coin || !concept} onClick={handleSubmit}>
          Continuar
        </button>
      </div>
    </div>
  )
}

export default PaymentForm
