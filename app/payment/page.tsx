"use client"
import React, { useState } from "react"

const Page = () => {
  const [coin, setCoin] = useState("")
  const [price, setPrice] = useState(0)
  const [concept, setConcept] = useState("")

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
      <select className="select select-bordered w-full max-w-xs">
        <option disabled selected>
          Buscar
        </option>
        <option onSelect={() => setCoin("bitcoin")}>Bitcoin</option>
        <option onSelect={() => setCoin("ethereum")}>Ethereum</option>
        <option onSelect={() => setCoin("litecoin")}>Litecoin</option>
        <option onSelect={() => setCoin("polygon")}>Polygon</option>
        <option onSelect={() => setCoin("ripple")}>Ripple</option>
        <option onSelect={() => setCoin("usdc")}>USD Coin</option>
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
      <button className="btn btn-primary btn-wide" disabled={price === 0 && !coin && !concept}>
        Continuar
      </button>
    </div>
  )
}

export default Page
