import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useSearchParams } from "react-router";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

//https://cluster.restakepos.com/payment
const PaymentStripe =  () => {
  const [clientSecret, setClientSecret] = useState("");
  const [searchParams] = useSearchParams();

  const netAmount = searchParams.get("netAmount") || "0.00";

  useEffect(() => {
    axios
      .post("http://localhost:5000/create-payment-intent", {
        amount: Number(netAmount).toFixed(2) * 100, // Convert to cents
      }) // amount in cents
      .then((res) => setClientSecret(res?.data?.clientSecret));
  }, []);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
};

export default PaymentStripe;
