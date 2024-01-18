"use client"
import React from "react"
import Link from "next/link"

const PaymentKo = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-1/2 max-w-lg text-center">
        <div className="mb-4 flex items-center justify-center">
          <span className="w-10 h-10 cross flex items-center justify-center">
            <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
        </div>

        <h3>¡Pago Fallido!</h3>
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

export default PaymentKo
