"use client"
import React, { useState } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"

const PaymentForm = () => {
  const [coin, setCoin] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")

  const router = useRouter()

  const handleSubmit = () => {
    router.push(`/payment/resume?price=${encodeURIComponent(price)}&coin=${encodeURIComponent(coin)}&concept=${encodeURIComponent(concept)}`)
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
