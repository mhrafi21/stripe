import { useEffect, useState } from "react";

import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("netAmount") || "0.00"; // Default to 0.00 if not provided
  const orderId = searchParams.get("orderId") || "no-order-id";
  const userId = searchParams.get("userId") || "no-user-id";
  const token = searchParams.get("token") || "no-token";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `http://localhost:3000/success?orderId=${orderId}&userId=${userId}&token=${token}`,
      },
    });

    if (error) {
      setMessage(error.message || "Payment failed");
      return setLoading(false);
    } else {
      // Payment succeeded, you can handle the success here
      setMessage("Payment successful!");

      navigate("/success");

      // if (orderId) {
      //   try {
      //     await axios.post(
      //       "https://cluster.restakepos.com/payment/confirm-payment",
      //       {
      //         orderId,
      //       }
      //     );
      //   } catch (error) {
      //     console.error("Error confirming payment:", error);
      //   }
      // }
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div
              className="flex items-center gap-2 mb-4 cursor-pointer font-semibold"
              onClick={() => navigate(-1)}
            >
              <svg
                enable-background="new 0 0 24 24"
                height="18px"
                version="1.1"
                viewBox="0 0 32 32"
                width="18px"
                xml:space="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <path
                  clip-rule="evenodd"
                  d="M31.106,15H3.278l8.325-8.293  c0.391-0.391,0.391-1.024,0-1.414c-0.391-0.391-1.024-0.391-1.414,0l-9.9,9.899c-0.385,0.385-0.385,1.029,0,1.414l9.9,9.9  c0.391,0.391,1.024,0.391,1.414,0c0.391-0.391,0.391-1.024,0-1.414L3.278,17h27.828c0.552,0,1-0.448,1-1  C32.106,15.448,31.658,15,31.106,15z"
                  fill="#121313"
                  fill-rule="evenodd"
                  id="Arrow_Back"
                />
                <g />
                <g />
                <g />
                <g />
                <g />
                <g />
              </svg>
              Back
            </div>
            <h2 className="text-gray-600">Total Amount</h2>
            <p className="text-gray-800 text-3xl font-bold mb-4">
              US${Number(amount).toFixed(2)}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <PaymentElement />
              <button
                disabled={loading || !stripe}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                type="submit"
              >
                {loading ? " Processing…" : " Pay now"}
              </button>
              {message && <p className="mt-2 text-red-500">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
//https://cluster.restakepos.com/payment
const PaymentStripe = () => {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    axios
      .post("http://localhost:5000/create-payment-intent", {
        amount: 2000,
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
