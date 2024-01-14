"use client"
import React, { useState } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"

const PaymentForm = () => {
  const [coin, setCoin] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")
  const [currencies, setCurrencies] = useState([{}])

  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append("expected_output_amount", price.toString())
    formData.append("merchant_urlok", "https://payments.com/ok")
    formData.append("merchant_urlko", "https://payments.com/ko")
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
        console.log(data.identifier)
        router.push(
          `/payment/resume?price=${encodeURIComponent(price)}&coin=${encodeURIComponent(coin)}&concept=
          ${encodeURIComponent(concept)}&id=${encodeURIComponent(data.identifier)}`
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
      const response = await fetch("https://payments.pre-bnvo.com/api/v1/currencies")

      if (response.ok) {
        const data = await response.json()
        setCurrencies(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="border-2 p-5 text-center">
      <h3 className="text-xl ">Crear pago</h3>
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
      <div className="text-start">
        <label htmlFor="">Seleccionar moneda</label>
      </div>
      <select className="select select-bordered w-full max-w-xs" onChange={(e) => setCoin(e.target.value)} defaultValue="">
        {/* <option disabled>Buscar</option> */}
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="litecoin">Litecoin</option>
        <option value="polygon">Polygon</option>
        <option value="ripple">Ripple</option>
        <option value="usdc">USD Coin</option>
      </select>
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
