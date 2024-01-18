import { Route } from "react-router-dom"
import PaymentForm from "../payment/page"
import Resume from "../payment/resume/page"

const App = () => {
  const isPaying = localStorage.getItem("paymentData")

  return (
    <div>
      <Route path="/resume">{isPaying ? <PaymentForm /> : <Resume />}</Route>
    </div>
  )
}
