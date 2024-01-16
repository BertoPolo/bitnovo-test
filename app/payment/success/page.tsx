"use client"
import React from "react"
import Link from "next/link"

const PaymentOk = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-1/2 max-w-lg text-center">
        <div className="mb-4 flex items-center justify-center">
          {/* change div for span */}
          <svg
            className="w-10 h-10 tick"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            version="1.2"
            baseProfile="tiny"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.972 6.251c-.967-.538-2.185-.188-2.720.777l-3.713 6.682-2.125-2.125c-.781-.781-2.047-.781-2.828 0-.781.781-.781 2.047 0 2.828l4 4c.378.379.888.587 1.414.587l.277-.020c.621-.087 1.166-.460 1.471-1.009l5-9c.537-.966.189-2.183-.776-2.720z"></path>
          </svg>
        </div>

        <h3>¡Pago Completado!</h3>
        <p className="mb-6 mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aspernatur, voluptatum aliquam pariatur ad tempora tempore nobis volupta
        </p>

        <Link href={"/payment"}>
          <button className="btn btn-primary w-full">Crear nuevo pago</button>
        </Link>
      </div>
    </div>
  )
}

export default PaymentOk
